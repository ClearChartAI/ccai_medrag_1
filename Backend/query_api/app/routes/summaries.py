"""
Document summaries routes for Results feature (Phase 3.2).
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from google.cloud import firestore

from app.models.auth import TokenData
from app.utils.auth import get_current_user
from app.config import Config

router = APIRouter(prefix="/documents", tags=["summaries"])


def get_firestore_client(config: Config = Depends(lambda: Config.from_env())):
    """Dependency to get Firestore client."""
    return firestore.Client(project=config.project_id)


@router.get("/summaries")
async def get_document_summaries(
    current_user: TokenData = Depends(get_current_user),
    db: firestore.Client = Depends(get_firestore_client),
):
    """
    Get all documents with their AI-generated summaries for Results page.

    Returns:
        List of documents with summaries
    """
    from google.cloud.firestore_v1.base_query import FieldFilter

    docs_ref = (
        db.collection("documents")
        .where(filter=FieldFilter("user_id", "==", current_user.uid))
        .order_by("created_at", direction=firestore.Query.DESCENDING)
    )

    documents = []
    for doc in docs_ref.stream():
        doc_data = doc.to_dict()

        documents.append(
            {
                "id": doc.id,
                "filename": doc_data.get("filename"),
                "upload_date": doc_data.get("created_at"),
                "summary": doc_data.get("summary"),
                "processing_status": doc_data.get("processing_status"),
                "chunk_count": doc_data.get("chunk_count", 0),
            }
        )

    return {"documents": documents}


@router.get("/{document_id}/summary")
async def get_document_summary(
    document_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: firestore.Client = Depends(get_firestore_client),
):
    """
    Get summary for a specific document.

    Args:
        document_id: Document ID

    Returns:
        Document summary details
    """
    doc_ref = db.collection("documents").document(document_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")

    doc_data = doc.to_dict()

    # Verify ownership
    if doc_data.get("user_id") != current_user.uid:
        raise HTTPException(status_code=403, detail="Access denied")

    return {
        "id": doc.id,
        "filename": doc_data.get("filename"),
        "summary": doc_data.get("summary"),
        "summary_generated_at": doc_data.get("summary_generated_at"),
        "chunk_count": doc_data.get("chunk_count", 0),
        "processing_status": doc_data.get("processing_status"),
    }
