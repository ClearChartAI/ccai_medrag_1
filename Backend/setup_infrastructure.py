"""One-time script to provision core GCP resources for the MedRAG backend.

Steps performed:
1. Creates (or verifies) the required GCS buckets for uploads and artifacts.
2. Creates a Vertex AI Vector Search index and deploys it to an index endpoint.
3. Waits for the endpoint deployment to complete instead of sleeping blindly.
4. Produces a config JSON file with the resource identifiers needed by the
   ingestion Cloud Function and the query API service.

Usage:
    python setup_infrastructure.py \
        --project-id YOUR_PROJECT \
        --region us-central1 \
        --docai-location us \
        --upload-bucket gs://my-clearchartai-uploads \
        --artifact-bucket gs://my-clearchartai-artifacts \
        --config-output config/config.json

Prerequisites:
    * You must be authenticated with gcloud ("gcloud auth application-default login").
    * The Vertex AI, Document AI, and Cloud Storage APIs must be enabled.
    * This script assumes the Vertex AI Matching Engine quota is available.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import sys
import time
import uuid
from typing import Optional

from google.api_core.exceptions import AlreadyExists
from google.cloud import storage
from google.cloud import aiplatform
from google.cloud.aiplatform import MatchingEngineIndex, MatchingEngineIndexEndpoint, initializer

DEFAULT_INDEX_DISPLAY_NAME = "medical-rag-index"
DEFAULT_ENDPOINT_DISPLAY_NAME = "medical-rag-endpoint"
TEXT_EMBEDDING_DIMENSIONS = 768


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Provision core backend resources.")
    parser.add_argument("--project-id", required=True, help="GCP project ID")
    parser.add_argument("--region", required=True, help="Vertex AI region (e.g. us-central1)")
    parser.add_argument(
        "--docai-location",
        default="us",
        help="Document AI processor location (multi-region like 'us' or 'eu')",
    )
    parser.add_argument(
        "--upload-bucket",
        required=True,
        help="Name of the GCS bucket used for raw PDF uploads (without gs://)",
    )
    parser.add_argument(
        "--artifact-bucket",
        required=True,
        help="Name of the GCS bucket used for vector store artifacts",
    )
    parser.add_argument(
        "--config-output",
        default="config/config.json",
        help="Path to write the resulting config file",
    )
    parser.add_argument(
        "--index-display-name",
        default=DEFAULT_INDEX_DISPLAY_NAME,
        help="Display name for the Vertex AI index",
    )
    parser.add_argument(
        "--endpoint-display-name",
        default=DEFAULT_ENDPOINT_DISPLAY_NAME,
        help="Display name for the Vertex AI index endpoint",
    )
    return parser.parse_args()


def ensure_bucket(storage_client: storage.Client, project_id: str, bucket_name: str) -> None:
    try:
        bucket = storage_client.lookup_bucket(bucket_name)
        if bucket is None:
            print(f"Creating bucket: {bucket_name}")
            storage_client.create_bucket(bucket_name, project=project_id, location="US")
        else:
            print(f"Bucket already exists: {bucket_name}")
    except Exception as exc:  # pylint: disable=broad-except
        raise RuntimeError(f"Failed to ensure bucket {bucket_name}: {exc}") from exc


def create_index(display_name: str, project_id: str, region: str) -> MatchingEngineIndex:
    print(f"Creating Vertex AI Matching Engine index '{display_name}' (if it does not exist)...")
    
    # Check if index already exists
    existing_indexes = MatchingEngineIndex.list(
        filter=f'display_name="{display_name}"',
        project=project_id,
        location=region
    )
    for idx in existing_indexes:
        print(f"Index already exists: {idx.resource_name}")
        return idx
    
    # Create new index using the aiplatform client
    index = aiplatform.MatchingEngineIndex.create_tree_ah_index(
        display_name=display_name,
        dimensions=TEXT_EMBEDDING_DIMENSIONS,
        approximate_neighbors_count=150,
        distance_measure_type="DOT_PRODUCT_DISTANCE",
        leaf_node_embedding_count=500,
        leaf_nodes_to_search_percent=7,
    )
    print(f"Index created: {index.resource_name}")
    return index


def create_and_deploy_endpoint(
    index: MatchingEngineIndex,
    display_name: str,
    project_id: str,
    region: str,
) -> tuple[MatchingEngineIndexEndpoint, str]:
    print(f"Creating Vertex AI index endpoint '{display_name}' (if it does not exist)...")
    try:
        endpoint = MatchingEngineIndexEndpoint.create(
            display_name=display_name,
            public_endpoint_enabled=True,  # Enable public endpoint for MVP
        )
        print(f"Index endpoint created: {endpoint.resource_name}")
    except AlreadyExists as exc:
        print("Index endpoint already exists. Reusing existing resource.")
        existing_endpoints = list(
            MatchingEngineIndexEndpoint.list(filter=f"display_name={display_name}")
        )
        if not existing_endpoints:
            raise RuntimeError("Endpoint exists but could not be retrieved.") from exc
        endpoint = existing_endpoints[0]

    deployed_indexes = endpoint.deployed_indexes
    if deployed_indexes:
        deployed_index_id = deployed_indexes[0].deployed_index_id
        print(
            "Index already deployed with deployed_index_id="
            f"{deployed_index_id}. Skipping deployment."
        )
        return endpoint, deployed_index_id

    print("Deploying index to endpoint (this can take several minutes)...")
    # deployed_index_id must start with letter and contain only letters, numbers, underscores
    # Add unique suffix to avoid conflicts with previous deployments
    unique_suffix = uuid.uuid4().hex[:8]
    deployed_index_id = display_name.replace("-", "_") + f"_deployment_{unique_suffix}"
    print(f"Starting deployment with ID: {deployed_index_id}")
    
    operation = endpoint.deploy_index(index=index, deployed_index_id=deployed_index_id)
    print("Waiting for deployment operation to complete...")
    operation.result()  # Wait for the operation to finish
    print(f"Deployment operation completed. deployed_index_id={deployed_index_id}")

    wait_for_endpoint(endpoint.resource_name, deployed_index_id, project_id, region)
    return endpoint, deployed_index_id


def wait_for_endpoint(endpoint_name: str, deployed_index_id: str, project_id: str, region: str) -> None:
    print("Waiting for index endpoint deployment to finish...")
    start_time = time.time()
    while True:
        endpoint = MatchingEngineIndexEndpoint(index_endpoint_name=endpoint_name)
        matching = [
            entry
            for entry in endpoint.deployed_indexes
            if entry.deployed_index_id == deployed_index_id
        ]
        if matching and matching[0].deployment_state == "DEPLOYED":
            elapsed = int(time.time() - start_time)
            print(f"Endpoint deployed after {elapsed} seconds.")
            return
        if time.time() - start_time > 3600:
            raise TimeoutError("Timed out waiting for index endpoint deployment.")
        print("  still deploying... checking again in 60 seconds")
        time.sleep(60)


def write_config(
    output_path: pathlib.Path,
    project_id: str,
    region: str,
    docai_location: str,
    upload_bucket: str,
    artifact_bucket: str,
    index: MatchingEngineIndex,
    endpoint: MatchingEngineIndexEndpoint,
    deployed_index_id: str,
) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    config = {
        "project_id": project_id,
        "vertex_ai_region": region,
        "docai_location": docai_location,
        "upload_bucket": upload_bucket,
        "artifact_bucket": artifact_bucket,
        "index_resource_name": index.resource_name,
        "index_id": index.name.split("/")[-1],
        "endpoint_resource_name": endpoint.resource_name,
        "endpoint_id": endpoint.name.split("/")[-1],
        "deployed_index_id": deployed_index_id,
    }
    output_path.write_text(json.dumps(config, indent=2))
    print(f"Configuration written to {output_path}")


def main() -> None:
    args = parse_args()

    initializer.global_config.init(project=args.project_id, location=args.region)

    storage_client = storage.Client(project=args.project_id)
    ensure_bucket(storage_client, args.project_id, args.upload_bucket)
    ensure_bucket(storage_client, args.project_id, args.artifact_bucket)

    index = create_index(args.index_display_name, args.project_id, args.region)
    endpoint, deployed_index_id = create_and_deploy_endpoint(
        index=index,
        display_name=args.endpoint_display_name,
        project_id=args.project_id,
        region=args.region,
    )

    write_config(
        output_path=pathlib.Path(args.config_output),
        project_id=args.project_id,
        region=args.region,
        docai_location=args.docai_location,
        upload_bucket=args.upload_bucket,
        artifact_bucket=args.artifact_bucket,
        index=index,
        endpoint=endpoint,
        deployed_index_id=deployed_index_id,
    )


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # pylint: disable=broad-except
        print(f"ERROR: {exc}")
        sys.exit(1)
