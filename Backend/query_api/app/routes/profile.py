"""User profile endpoints."""
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime

from google.cloud import firestore
from firebase_admin import auth as firebase_auth

from app.models.auth import TokenData, ProfileUpdateRequest
from app.utils.auth import get_current_user
from app.utils.user_profile import ensure_user_profile
from app.repositories.firestore_repo import FirestoreRepository
from app.config import Config

router = APIRouter(prefix="/profile", tags=["profile"])


def get_firestore_client(config: Config = Depends(lambda: Config.from_env())):
    """Dependency to get Firestore client."""
    return firestore.Client(project=config.project_id)


def get_firestore_repo(config: Config = Depends(lambda: Config.from_env())):
    """Dependency to get Firestore repository."""
    return FirestoreRepository(project_id=config.project_id)


@router.get("")
async def get_user_profile(
    current_user: TokenData = Depends(get_current_user),
    firestore_repo: FirestoreRepository = Depends(get_firestore_repo),
):
    """Get current user's profile."""
    user_data = await ensure_user_profile(current_user, firestore_repo)
    return {"profile": user_data}


@router.patch("")
async def update_user_profile(
    request: ProfileUpdateRequest,
    current_user: TokenData = Depends(get_current_user),
    db: firestore.Client = Depends(get_firestore_client),
):
    """Update user profile - supports display_name updates."""
    user_id = current_user.uid

    updates: Dict[str, Any] = {}
    if request.display_name:
        updates["display_name"] = request.display_name

    # Update Firebase Auth
    try:
        firebase_auth.update_user(user_id, display_name=request.display_name)
        print(f"✓ Updated Firebase Auth display name for {user_id}")
    except Exception as e:
        print(f"Warning: Could not update Firebase Auth: {e}")

    # Update Firestore
    if updates:
        updates["updated_at"] = datetime.now().isoformat()
        db.collection("users").document(user_id).update(updates)
        print(f"✓ Updated Firestore profile for {user_id}: {updates}")
        return {
            "message": "Profile updated successfully",
            "updated_fields": list(updates.keys()),
        }

    return {"message": "No updates provided"}
