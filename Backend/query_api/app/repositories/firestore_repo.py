"""Firestore data access operations."""
from typing import Any, Dict, List, Optional
from datetime import datetime
from google.cloud import firestore
from google.cloud.firestore_v1 import Increment
from google.cloud.firestore_v1.base_query import FieldFilter


class FirestoreRepository:
    """Repository for all Firestore CRUD operations."""

    def __init__(self, project_id: str):
        """Initialize Firestore client."""
        self.db = firestore.Client(project=project_id)

    # ==================== Chat Operations ====================

    def get_chat(self, chat_id: str) -> Optional[Dict[str, Any]]:
        """Get chat by ID."""
        doc = self.db.collection("chats").document(chat_id).get()
        return doc.to_dict() if doc.exists else None

    def create_chat(self, user_id: str, title: str = "New Chat") -> Dict[str, Any]:
        """Create a new chat session."""
        chat_id = self.db.collection("chats").document().id
        chat = {
            "chat_id": chat_id,
            "user_id": user_id,
            "title": title,
            "message_count": 0,
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP,
        }
        self.db.collection("chats").document(chat_id).set(chat)
        return {**chat, "created_at": datetime.now(), "updated_at": datetime.now()}

    def update_chat_timestamp(self, chat_id: str) -> None:
        """Update chat's last updated timestamp."""
        self.db.collection("chats").document(chat_id).update({
            "updated_at": firestore.SERVER_TIMESTAMP
        })

    def increment_message_count(self, chat_id: str, count: int = 1) -> None:
        """Increment message count for a chat."""
        self.db.collection("chats").document(chat_id).update({
            "message_count": Increment(count)
        })

    def get_user_chats(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all chats for a user."""
        docs = (
            self.db.collection("chats")
            .where(filter=FieldFilter("user_id", "==", user_id))
            .order_by("updated_at", direction=firestore.Query.DESCENDING)
            .limit(limit)
            .stream()
        )
        return [doc.to_dict() for doc in docs]

    def delete_chat(self, chat_id: str) -> None:
        """Delete a chat."""
        self.db.collection("chats").document(chat_id).delete()

    # ==================== Message Operations ====================

    def create_message(self, message: Dict[str, Any]) -> None:
        """Create a new message."""
        self.db.collection("messages").document(message["message_id"]).set(message)

    def get_chat_messages(
        self, chat_id: str, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get messages for a chat, ordered by timestamp."""
        docs = (
            self.db.collection("messages")
            .where(filter=FieldFilter("chat_id", "==", chat_id))
            .order_by("timestamp")
            .limit(limit)
            .stream()
        )
        return [doc.to_dict() for doc in docs]

    # ==================== Chunk Operations ====================

    def get_chunk(self, chunk_id: str) -> Optional[Dict[str, Any]]:
        """Get chunk by ID."""
        doc = self.db.collection("chunks").document(chunk_id).get()
        return doc.to_dict() if doc.exists else None

    def get_chunks_by_ids(self, chunk_ids: List[str], user_id: str) -> List[Dict[str, Any]]:
        """Get multiple chunks by IDs, filtered by user_id."""
        chunks = []
        for chunk_id in chunk_ids:
            doc = self.db.collection("chunks").document(chunk_id).get()
            if doc.exists:
                data = doc.to_dict()
                if data.get("user_id") == user_id:
                    chunks.append(data)
        return chunks

    # ==================== Document Operations ====================

    def get_user_documents(
        self, user_id: str, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get all documents for a user."""
        docs = (
            self.db.collection("documents")
            .where(filter=FieldFilter("user_id", "==", user_id))
            .order_by("uploaded_at", direction=firestore.Query.DESCENDING)
            .limit(limit)
            .stream()
        )
        return [doc.to_dict() for doc in docs]

    def get_processing_documents(self, user_id: str) -> List[Dict[str, Any]]:
        """Get documents that are still being processed."""
        docs = (
            self.db.collection("documents")
            .where(filter=FieldFilter("user_id", "==", user_id))
            .where(
                filter=FieldFilter(
                    "processing_status", "in", ["pending", "processing", "in_progress"]
                )
            )
            .limit(1)
            .get()
        )
        return [doc.to_dict() for doc in docs]

    def delete_document(self, document_id: str) -> None:
        """Delete a document."""
        self.db.collection("documents").document(document_id).delete()

    # ==================== User Profile Operations ====================

    def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile."""
        doc = self.db.collection("users").document(user_id).get()
        return doc.to_dict() if doc.exists else None

    def create_or_update_user_profile(
        self, user_id: str, data: Dict[str, Any]
    ) -> None:
        """Create or update user profile."""
        self.db.collection("users").document(user_id).set(data, merge=True)
