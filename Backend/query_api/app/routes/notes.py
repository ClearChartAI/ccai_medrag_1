"""Notes endpoints for user notes and pinned messages."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.models.auth import TokenData
from app.utils.auth import get_current_user
from app.repositories.firestore_repo import FirestoreRepository
from app.config import Config
from google.cloud import firestore

router = APIRouter(prefix="/notes", tags=["notes"])


class CreateNoteRequest(BaseModel):
    """Request model for creating a note."""
    content: str
    tags: Optional[List[str]] = []
    pinned_message_id: Optional[str] = None
    chat_id: Optional[str] = None
    chat_name: Optional[str] = None


class UpdateNoteRequest(BaseModel):
    """Request model for updating a note."""
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    order: Optional[int] = None


class NoteResponse(BaseModel):
    """Response model for a note."""
    note_id: str
    user_id: str
    content: str
    tags: List[str]
    order: int
    created_at: str
    updated_at: str
    pinned_message_id: Optional[str] = None
    chat_id: Optional[str] = None
    chat_name: Optional[str] = None


def get_firestore_repo(config: Config = Depends(lambda: Config.from_env())):
    """Dependency to get FirestoreRepository instance."""
    return FirestoreRepository(project_id=config.project_id)


@router.post("", response_model=NoteResponse)
async def create_note(
    note_request: CreateNoteRequest,
    current_user: TokenData = Depends(get_current_user),
    firestore_repo: FirestoreRepository = Depends(get_firestore_repo),
):
    """
    Create a new note.

    Can be a manual note or a pinned message from chat.
    """
    note_id = str(uuid.uuid4())
    now_iso = datetime.now().isoformat()

    # Get the next order number (last note + 1)
    existing_notes = firestore_repo.db.collection("notes").where(
        filter=firestore.FieldFilter("user_id", "==", current_user.uid)
    ).order_by("order", direction=firestore.Query.DESCENDING).limit(1).stream()

    next_order = 1
    for note in existing_notes:
        next_order = note.to_dict().get("order", 0) + 1
        break

    note_data = {
        "note_id": note_id,
        "user_id": current_user.uid,
        "content": note_request.content,
        "tags": note_request.tags or [],
        "order": next_order,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    # Add pinned message info if provided
    if note_request.pinned_message_id:
        note_data["pinned_message_id"] = note_request.pinned_message_id
    if note_request.chat_id:
        note_data["chat_id"] = note_request.chat_id
    if note_request.chat_name:
        note_data["chat_name"] = note_request.chat_name

    firestore_repo.db.collection("notes").document(note_id).set(note_data)

    return NoteResponse(**note_data)


@router.get("", response_model=List[NoteResponse])
async def get_notes(
    search: Optional[str] = None,
    tags: Optional[str] = None,
    current_user: TokenData = Depends(get_current_user),
    firestore_repo: FirestoreRepository = Depends(get_firestore_repo),
):
    """
    Get all notes for the current user.

    Supports filtering by search query and tags.
    """
    query = firestore_repo.db.collection("notes").where(
        filter=firestore.FieldFilter("user_id", "==", current_user.uid)
    ).order_by("order")

    notes = []
    for doc in query.stream():
        note_data = doc.to_dict()

        # Apply search filter
        if search and search.lower() not in note_data.get("content", "").lower():
            continue

        # Apply tag filter
        if tags:
            tag_list = [t.strip() for t in tags.split(",")]
            note_tags = note_data.get("tags", [])
            if not any(tag in note_tags for tag in tag_list):
                continue

        notes.append(NoteResponse(**note_data))

    return notes


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    current_user: TokenData = Depends(get_current_user),
    firestore_repo: FirestoreRepository = Depends(get_firestore_repo),
):
    """Get a specific note by ID."""
    doc = firestore_repo.db.collection("notes").document(note_id).get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Note not found")

    note_data = doc.to_dict()

    # Verify ownership
    if note_data.get("user_id") != current_user.uid:
        raise HTTPException(status_code=403, detail="Access denied")

    return NoteResponse(**note_data)


@router.patch("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    update_request: UpdateNoteRequest,
    current_user: TokenData = Depends(get_current_user),
    firestore_repo: FirestoreRepository = Depends(get_firestore_repo),
):
    """Update a note's content, tags, or order."""
    doc_ref = firestore_repo.db.collection("notes").document(note_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Note not found")

    note_data = doc.to_dict()

    # Verify ownership
    if note_data.get("user_id") != current_user.uid:
        raise HTTPException(status_code=403, detail="Access denied")

    # Build update data
    update_data = {"updated_at": datetime.now().isoformat()}

    if update_request.content is not None:
        update_data["content"] = update_request.content
    if update_request.tags is not None:
        update_data["tags"] = update_request.tags
    if update_request.order is not None:
        update_data["order"] = update_request.order

    doc_ref.update(update_data)

    # Get updated note
    updated_doc = doc_ref.get()
    return NoteResponse(**updated_doc.to_dict())


@router.delete("/{note_id}")
async def delete_note(
    note_id: str,
    current_user: TokenData = Depends(get_current_user),
    firestore_repo: FirestoreRepository = Depends(get_firestore_repo),
):
    """Delete a note."""
    doc_ref = firestore_repo.db.collection("notes").document(note_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Note not found")

    note_data = doc.to_dict()

    # Verify ownership
    if note_data.get("user_id") != current_user.uid:
        raise HTTPException(status_code=403, detail="Access denied")

    doc_ref.delete()

    return {"message": "Note deleted successfully"}


@router.post("/{note_id}/reorder")
async def reorder_note(
    note_id: str,
    new_order: int,
    current_user: TokenData = Depends(get_current_user),
    firestore_repo: FirestoreRepository = Depends(get_firestore_repo),
):
    """
    Reorder a note to a new position.

    Adjusts other notes' order values as needed.
    """
    doc_ref = firestore_repo.db.collection("notes").document(note_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Note not found")

    note_data = doc.to_dict()

    # Verify ownership
    if note_data.get("user_id") != current_user.uid:
        raise HTTPException(status_code=403, detail="Access denied")

    old_order = note_data.get("order", 0)

    if old_order == new_order:
        return {"message": "No change needed"}

    # Get all user notes
    all_notes = firestore_repo.db.collection("notes").where(
        filter=firestore.FieldFilter("user_id", "==", current_user.uid)
    ).order_by("order").stream()

    batch = firestore_repo.db.batch()

    # Adjust orders
    for other_note in all_notes:
        other_id = other_note.id
        other_order = other_note.to_dict().get("order", 0)

        if other_id == note_id:
            # Update the moved note
            batch.update(doc_ref, {"order": new_order, "updated_at": datetime.now().isoformat()})
        else:
            # Shift other notes
            if old_order < new_order:
                # Moving down: shift notes up
                if old_order < other_order <= new_order:
                    batch.update(
                        firestore_repo.db.collection("notes").document(other_id),
                        {"order": other_order - 1}
                    )
            else:
                # Moving up: shift notes down
                if new_order <= other_order < old_order:
                    batch.update(
                        firestore_repo.db.collection("notes").document(other_id),
                        {"order": other_order + 1}
                    )

    batch.commit()

    return {"message": "Note reordered successfully"}
