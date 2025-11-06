"""User profile management utilities."""
from typing import Dict, Any
from datetime import datetime
from fastapi import Depends

from app.models.auth import TokenData
from app.repositories.firestore_repo import FirestoreRepository
from app.config import Config


def get_firestore_repo(config: Config = Depends(lambda: Config.from_env())):
    """Dependency to get Firestore repository."""
    return FirestoreRepository(project_id=config.project_id)


async def ensure_user_profile(
    current_user: TokenData,
    firestore_repo: FirestoreRepository,
) -> Dict[str, Any]:
    """
    Ensure user profile exists in Firestore.
    Creates profile if it doesn't exist, updates last_active if it does.

    Args:
        current_user: Authenticated user data
        firestore_repo: Firestore repository instance

    Returns:
        User profile data
    """
    user_id = current_user.uid
    email = current_user.email or "unknown@example.com"
    name = current_user.name or email.split("@")[0]

    # Check if profile exists
    user_profile = firestore_repo.get_user_profile(user_id)

    if not user_profile:
        # Create new profile - THIS SHOULD ONLY HAPPEN FOR NEW USERS
        now = datetime.now()
        from datetime import timedelta

        profile_data = {
            "user_id": user_id,
            "email": email,
            "display_name": name,
            "photo_url": "",
            "auth_provider": "firebase",
            "email_verified": True,
            "created_at": now.isoformat(),
            "last_active": now.isoformat(),
            "last_login": now.isoformat(),
            "login_count": 1,
            "document_count": 0,
            "query_count": 0,
            "chat_count": 0,
            "is_active": True,
            "subscription_tier": "free",
            "retention_policy_expires_at": (now + timedelta(days=365)).isoformat(),
        }
        firestore_repo.create_or_update_user_profile(user_id, profile_data)
        return profile_data
    else:
        # EXISTING USER - Update last_active and login tracking
        now = datetime.now()
        firestore_repo.create_or_update_user_profile(
            user_id, {
                "last_active": now.isoformat(),
                "last_login": now.isoformat(),
            }
        )
        return user_profile
