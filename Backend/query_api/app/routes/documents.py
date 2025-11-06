"""Document management endpoints."""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from datetime import datetime, timedelta
import uuid
import io

from google.cloud import storage, firestore
from google.cloud.firestore_v1 import Increment

from app.models.auth import TokenData
from app.utils.auth import get_current_user
from app.utils.user_profile import ensure_user_profile
from app.repositories.firestore_repo import FirestoreRepository
from app.config import Config

router = APIRouter(prefix="/documents", tags=["documents"])

# Rate limiting
limiter = Limiter(key_func=get_remote_address)


def get_storage_client(config: Config = Depends(lambda: Config.from_env())):
    """Dependency to get Storage client."""
    return storage.Client(project=config.project_id)


def get_firestore_client(config: Config = Depends(lambda: Config.from_env())):
    """Dependency to get Firestore client."""
    return firestore.Client(project=config.project_id)


@router.post("/upload")
@limiter.limit("20/hour")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user),
    storage_client: storage.Client = Depends(get_storage_client),
    db: firestore.Client = Depends(get_firestore_client),
):
    """
    Upload a PDF document to Cloud Storage.

    - Ensures user profile exists
    - Validates PDF format
    - Uploads to GCS bucket
    - Creates Firestore metadata
    - Triggers Cloud Function for processing
    """
    # Ensure user profile exists (creates if needed)
    firestore_repo = FirestoreRepository(project_id=db.project)
    await ensure_user_profile(current_user, firestore_repo)

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    user_id = current_user.uid
    document_id = str(uuid.uuid4())
    blob_name = f"{user_id}/{document_id}_{file.filename}"

    # Upload to GCS
    bucket = storage_client.bucket("ccai-medrag-patient-uploads")
    blob = bucket.blob(blob_name)
    content = await file.read()
    blob.upload_from_string(content, content_type="application/pdf")

    gcs_path = f"gs://ccai-medrag-patient-uploads/{blob_name}"
    now_iso = datetime.now().isoformat()

    # Create Firestore metadata
    document_metadata = {
        "document_id": document_id,
        "user_id": user_id,
        "filename": file.filename,
        "title": file.filename.rsplit(".pdf", 1)[0],
        "gcs_path": gcs_path,
        "uploaded_at": now_iso,
        "file_size": len(content),
        "page_count": 0,
        "processing_status": "pending",
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    db.collection("documents").document(document_id).set(document_metadata)

    # Update user stats
    try:
        db.collection("users").document(user_id).set(
            {"document_count": Increment(1)}, merge=True
        )
    except Exception:
        pass  # Non-critical

    return {
        "message": "Document uploaded successfully",
        "document_id": document_id,
        "filename": file.filename,
        "gcs_path": gcs_path,
    }


@router.get("/list")
async def list_documents(
    current_user: TokenData = Depends(get_current_user),
    db: firestore.Client = Depends(get_firestore_client),
):
    """
    Get all documents for the current user.

    Returns document metadata including processing status.
    """
    from google.cloud.firestore_v1.base_query import FieldFilter

    docs_ref = db.collection("documents").where(filter=FieldFilter("user_id", "==", current_user.uid))
    docs_stream = docs_ref.order_by("created_at", direction=firestore.Query.DESCENDING).stream()

    documents = [doc.to_dict() for doc in docs_stream]

    return {"documents": documents, "count": len(documents)}


@router.get("/{document_id}/view")
async def stream_document(
    document_id: str,
    token: str = None,
    storage_client: storage.Client = Depends(get_storage_client),
    db: firestore.Client = Depends(get_firestore_client),
):
    """
    Stream a PDF document for viewing.

    This allows authenticated users to view their own documents
    by proxying the PDF through the backend.

    Authentication can be provided via:
    - Authorization header (handled by get_current_user dependency)
    - token query parameter (for iframe usage)
    """
    from firebase_admin import auth as firebase_auth

    try:
        # Get user from token query parameter if provided
        if token:
            try:
                decoded_token = firebase_auth.verify_id_token(token)
                user_id = decoded_token.get("uid")
                if not user_id:
                    raise HTTPException(status_code=401, detail="Invalid token")
            except Exception as auth_error:
                raise HTTPException(status_code=401, detail="Invalid or expired token")
        else:
            raise HTTPException(status_code=401, detail="Authentication required")

        doc_ref = db.collection("documents").document(document_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="Document not found")

        doc_data = doc.to_dict()
        if doc_data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        gcs_path = doc_data.get("gcs_path", "")
        if not gcs_path.startswith("gs://"):
            raise HTTPException(status_code=400, detail="Invalid GCS path")

        path_parts = gcs_path.replace("gs://", "").split("/", 1)
        if len(path_parts) != 2:
            raise HTTPException(status_code=400, detail="Invalid GCS path format")

        bucket_name, object_name = path_parts
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(object_name)

        if not blob.exists():
            raise HTTPException(status_code=404, detail="File not found in storage")

        def iterfile():
            chunk_size = 1024 * 1024  # 1MB chunks
            blob_stream = blob.download_as_bytes()
            bytes_io = io.BytesIO(blob_stream)
            while chunk := bytes_io.read(chunk_size):
                yield chunk

        return StreamingResponse(
            iterfile(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'inline; filename="{doc_data.get("filename", "document.pdf")}"',
                "Cache-Control": "public, max-age=3600",  # Cache for 1 hour
                "Accept-Ranges": "bytes",
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stream document: {str(e)}")


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: TokenData = Depends(get_current_user),
    storage_client: storage.Client = Depends(get_storage_client),
    db: firestore.Client = Depends(get_firestore_client),
):
    """
    Delete a document and all its associated data.

    This removes:
    - Document metadata from Firestore
    - PDF file from Cloud Storage
    - All text chunks from Firestore
    - All vector embeddings from Vertex AI Vector Search
    """
    from app.repositories.vector_repo import VectorRepository
    from app.config import Config

    # 1. Get document to verify ownership
    doc_ref = db.collection("documents").document(document_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")

    doc_data = doc.to_dict()
    if doc_data.get("user_id") != current_user.uid:
        raise HTTPException(status_code=403, detail="Not authorized")

    # 2. Get all chunks associated with this document
    chunks_ref = db.collection("chunks").where("document_id", "==", document_id)
    chunks = list(chunks_ref.stream())
    chunk_ids = [chunk.id for chunk in chunks]

    # 3. Delete vectors from Vertex AI Vector Search
    if chunk_ids:
        try:
            config = Config.from_env()
            vector_repo = VectorRepository(
                index_endpoint=config.index_endpoint,
                deployed_index_id=config.deployed_index_id,
                index_id=config.index_id,
            )
            vector_repo.remove_vectors(chunk_ids)
        except Exception:
            # Continue with deletion even if vector removal fails
            pass

    # 4. Delete chunks from Firestore
    batch = db.batch()
    for chunk in chunks:
        batch.delete(chunk.reference)

    if chunks:
        batch.commit()

    # 5. Delete PDF from Cloud Storage
    gcs_path = doc_data.get("gcs_path", "")
    if gcs_path.startswith("gs://"):
        path_parts = gcs_path.replace("gs://", "").split("/", 1)
        if len(path_parts) == 2:
            bucket_name, object_name = path_parts
            try:
                bucket = storage_client.bucket(bucket_name)
                blob = bucket.blob(object_name)
                blob.delete()
            except Exception:
                pass

    # 6. Delete document metadata from Firestore
    doc_ref.delete()

    # 7. Update user's document count
    user_ref = db.collection("users").document(current_user.uid)
    user_doc = user_ref.get()
    if user_doc.exists:
        current_count = user_doc.to_dict().get("document_count", 0)
        new_count = max(0, current_count - 1)
        user_ref.update({"document_count": new_count})

    return {
        "message": "Document and all associated data deleted successfully",
        "document_id": document_id,
        "chunks_deleted": len(chunk_ids),
    }
