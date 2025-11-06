"""
Cloud Function entry point for processing uploaded medical PDFs.

Triggered by: Google Cloud Storage (finalize event) on the uploads bucket.
Workflow:
    1. Download the uploaded PDF from GCS.
    2. Submit the document to Document AI (layout + form processors).
    3. Perform semantic chunking of the extracted text and key-value pairs.
    4. Filter out short chunks (< 50 chars) for better quality.
    5. Add resulting documents to the Vertex AI Vector Search index in batches.

Environment variables expected:
    PROJECT_ID               -> GCP Project ID
    VERTEX_AI_REGION         -> Region (e.g., us-central1)
    DOCAI_LOCATION           -> DocAI location (e.g., us)
    LAYOUT_PROCESSOR_ID      -> DocAI layout processor ID
    FORM_PROCESSOR_ID        -> DocAI form processor ID
    VERTEX_INDEX_ENDPOINT    -> Full resource name of the index endpoint
    DEPLOYED_INDEX_ID        -> Deployed index ID on the endpoint
    VERTEX_INDEX_ID          -> Vector index ID
    ARTIFACT_BUCKET          -> GCS bucket for artifacts
"""
from typing import Any, Dict
import tempfile
import uuid

from google.cloud import storage, firestore

from modules import Config, DocumentAIProcessor, DocumentChunker, VectorIndexUploader
from modules.vector_index import Document


def process_document(event: Dict[str, Any], context: Any) -> None:
    """
    Main entry point for Cloud Function.

    Args:
        event: GCS event data (bucket, name)
        context: Cloud Function context
    """
    config = Config.from_env()

    bucket_name = event["bucket"]
    object_name = event["name"]
    print(f"Processing gs://{bucket_name}/{object_name}")

    # Extract user_id and document_id from path
    path_parts = object_name.split("/")
    if len(path_parts) >= 2:
        user_id = path_parts[0]
        filename_part = path_parts[1]
        document_id = (
            filename_part.split("_")[0] if "_" in filename_part else str(uuid.uuid4())
        )
    else:
        user_id = "unknown"
        document_id = str(uuid.uuid4())

    print(f"Extracted user_id: {user_id}, document_id: {document_id}")

    # 1. Download PDF
    pdf_bytes = _download_blob(bucket_name, object_name)

    # 2. Process with Document AI
    docai_processor = DocumentAIProcessor(
        project_id=config.project_id, location=config.docai_location
    )
    layout_json, form_json = docai_processor.process_document(
        pdf_bytes=pdf_bytes,
        layout_processor_id=config.layout_processor_id,
        form_processor_id=config.form_processor_id,
    )

    # 3. Build chunks
    chunker = DocumentChunker()
    chunks = chunker.build_chunks(layout_json, form_json)
    print(f"Generated {len(chunks)} chunks from DocAI output")

    # 4. Filter out short chunks
    filtered_chunks = chunker.filter_substantive_chunks(chunks)
    print(
        f"Prepared {len(filtered_chunks)} documents for vector store "
        f"(filtered from {len(chunks)} total chunks, "
        f"min length: {chunker.MIN_CHUNK_LENGTH} chars)"
    )

    # Convert to Document objects
    docs = [
        Document(page_content=chunk["text"], metadata=chunk["metadata"])
        for chunk in filtered_chunks
    ]

    # 5. Upload to vector index
    uploader = VectorIndexUploader(
        project_id=config.project_id,
        region=config.vertex_region,
        index_id=config.index_id,
    )
    uploader.upsert_documents(
        documents=docs,
        user_id=user_id,
        document_id=document_id,
        gcs_path=f"gs://{bucket_name}/{object_name}",
    )

    print("Ingestion completed successfully")

    # 6. Update document status in Firestore
    try:
        db = firestore.Client(project=config.project_id)
        doc_ref = db.collection("documents").document(document_id)
        doc_ref.update(
            {
                "processing_status": "completed",
                "page_count": len(docs),
                "updated_at": firestore.SERVER_TIMESTAMP,
            }
        )
        print(f"✓ Updated document {document_id} status to 'completed'")
    except Exception as e:
        print(f"Warning: Could not update document status: {e}")


def _download_blob(bucket_name: str, object_name: str) -> bytes:
    """Download blob from GCS."""
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(object_name)
    with tempfile.NamedTemporaryFile() as temp_file:
        blob.download_to_file(temp_file)
        temp_file.flush()
        temp_file.seek(0)
        return temp_file.read()
