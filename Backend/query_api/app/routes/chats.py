"""Chat endpoints for chat history and management."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from google.cloud import firestore

from app.models.auth import TokenData
from app.utils.auth import get_current_user
from app.repositories.firestore_repo import FirestoreRepository
from app.config import Config

router = APIRouter(prefix="/chats", tags=["chats"])


class ChatResponse(BaseModel):
    """Response model for a chat."""
    chat_id: str
    user_id: str
    title: str
    created_at: str
    updated_at: str
    message_count: int


class MessageResponse(BaseModel):
    """Response model for a message."""
    message_id: str
    chat_id: str
    user_id: str
    role: str
    content: str
    timestamp: str
    sources: List[dict] = []


def get_firestore_repo(config: Config = Depends(lambda: Config.from_env())):
    """Dependency to get FirestoreRepository instance."""
    return FirestoreRepository(project_id=config.project_id)


@router.get("", response_model=List[ChatResponse])
async def get_chats(
    current_user: TokenData = Depends(get_current_user),
    firestore_repo: FirestoreRepository = Depends(get_firestore_repo),
):
    """
    Get all chats for the current user.

    Returns chats ordered by most recent first.
    """
    query = firestore_repo.db.collection("chats").where(
        filter=firestore.FieldFilter("user_id", "==", current_user.uid)
    ).order_by("updated_at", direction=firestore.Query.DESCENDING)

    chats = []
    for doc in query.stream():
        chat_data = doc.to_dict()
        # Convert Firestore datetime objects to ISO strings
        if chat_data.get("created_at"):
            chat_data["created_at"] = chat_data["created_at"].isoformat()
        if chat_data.get("updated_at"):
            chat_data["updated_at"] = chat_data["updated_at"].isoformat()
        chats.append(ChatResponse(**chat_data))

    return chats


@router.get("/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: str,
    current_user: TokenData = Depends(get_current_user),
    firestore_repo: FirestoreRepository = Depends(get_firestore_repo),
):
    """Get a specific chat by ID."""
    chat = firestore_repo.get_chat(chat_id)

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Verify ownership
    if chat.get("user_id") != current_user.uid:
        raise HTTPException(status_code=403, detail="Access denied")

    # Convert Firestore datetime objects to ISO strings
    if chat.get("created_at"):
        chat["created_at"] = chat["created_at"].isoformat()
    if chat.get("updated_at"):
        chat["updated_at"] = chat["updated_at"].isoformat()

    return ChatResponse(**chat)


@router.get("/{chat_id}/messages", response_model=List[MessageResponse])
async def get_chat_messages(
    chat_id: str,
    current_user: TokenData = Depends(get_current_user),
    firestore_repo: FirestoreRepository = Depends(get_firestore_repo),
):
    """
    Get all messages for a specific chat.

    Returns messages ordered by timestamp (oldest first).
    """
    # Verify chat ownership
    chat = firestore_repo.get_chat(chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if chat.get("user_id") != current_user.uid:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get messages
    messages = firestore_repo.get_chat_messages(chat_id, limit=1000)

    # Convert Firestore datetime objects to ISO strings (only if not already a string)
    for msg in messages:
        if msg.get("timestamp") and not isinstance(msg["timestamp"], str):
            msg["timestamp"] = msg["timestamp"].isoformat()

    return [MessageResponse(**msg) for msg in messages]


@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: str,
    current_user: TokenData = Depends(get_current_user),
    firestore_repo: FirestoreRepository = Depends(get_firestore_repo),
):
    """
    Delete a chat and all its messages.

    This is a permanent action.
    """
    # Verify chat ownership
    chat = firestore_repo.get_chat(chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if chat.get("user_id") != current_user.uid:
        raise HTTPException(status_code=403, detail="Access denied")

    # Delete all messages
    messages_query = firestore_repo.db.collection("messages").where(
        filter=firestore.FieldFilter("chat_id", "==", chat_id)
    )

    batch = firestore_repo.db.batch()
    for msg_doc in messages_query.stream():
        batch.delete(msg_doc.reference)

    # Delete chat
    batch.delete(firestore_repo.db.collection("chats").document(chat_id))

    batch.commit()

    return {"message": "Chat deleted successfully"}
