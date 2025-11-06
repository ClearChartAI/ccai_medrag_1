"""Document management business logic."""
from typing import List, Dict, Any
from google.cloud import storage

from app.repositories.firestore_repo import FirestoreRepository


class DocumentService:
    """Service for document operations."""

    def __init__(self, firestore_repo: FirestoreRepository, project_id: str):
        """Initialize document service."""
        self.firestore_repo = firestore_repo
        self.storage_client = storage.Client(project=project_id)

    def get_user_documents(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all documents for a user."""
        return self.firestore_repo.get_user_documents(user_id)

    def delete_document(
        self, document_id: str, user_id: str, gcs_bucket: str
    ) -> None:
        """
        Delete a document and its associated data.

        Args:
            document_id: Document ID to delete
            user_id: User ID (for verification)
            gcs_bucket: GCS bucket name

        Raises:
            ValueError: If document doesn't belong to user
        """
        # Get document to verify ownership
        docs = self.firestore_repo.get_user_documents(user_id)
        doc = next((d for d in docs if d.get("document_id") == document_id), None)

        if not doc:
            raise ValueError("Document not found or access denied")

        # Delete from Firestore
        self.firestore_repo.delete_document(document_id)

        # Delete PDF from Cloud Storage
        gcs_path = doc.get("gcs_path", "")
        if gcs_path.startswith("gs://"):
            # Extract bucket and object name from gs:// path
            path_parts = gcs_path.replace("gs://", "").split("/", 1)
            if len(path_parts) == 2:
                bucket_name, object_name = path_parts
                try:
                    bucket = self.storage_client.bucket(bucket_name)
                    blob = bucket.blob(object_name)
                    blob.delete()
                except Exception as e:
                    print(f"Warning: Could not delete GCS file: {e}")

        # Note: Chunks will be handled separately if needed
        print(f"✓ Deleted document {document_id}")
