"""Configuration for ingestion function."""
import os
from dataclasses import dataclass


def _require_env(name: str) -> str:
    """Get required environment variable or raise error."""
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


@dataclass
class Config:
    """Ingestion function configuration."""

    project_id: str
    vertex_region: str
    docai_location: str
    layout_processor_id: str
    form_processor_id: str
    index_id: str
    endpoint_id: str
    deployed_index_id: str
    artifact_bucket: str

    @classmethod
    def from_env(cls) -> "Config":
        """Load configuration from environment variables."""
        # Extract IDs from resource names if full resource names are provided
        index_endpoint = _require_env("VERTEX_INDEX_ENDPOINT")
        endpoint_id = (
            index_endpoint.split("/")[-1] if "/" in index_endpoint else index_endpoint
        )

        # INDEX_ID should be provided as env var
        index_id = os.getenv("VERTEX_INDEX_ID", "")
        if not index_id:
            # Try to extract from INDEX_RESOURCE_NAME if provided
            index_resource = os.getenv("VERTEX_INDEX_RESOURCE_NAME", "")
            if index_resource:
                index_id = index_resource.split("/")[-1]

        return cls(
            project_id=_require_env("PROJECT_ID"),
            vertex_region=_require_env("VERTEX_AI_REGION"),
            docai_location=os.getenv("DOCAI_LOCATION", "us"),
            layout_processor_id=_require_env("LAYOUT_PROCESSOR_ID"),
            form_processor_id=_require_env("FORM_PROCESSOR_ID"),
            index_id=index_id,
            endpoint_id=endpoint_id,
            deployed_index_id=_require_env("DEPLOYED_INDEX_ID"),
            artifact_bucket=_require_env("ARTIFACT_BUCKET"),
        )
