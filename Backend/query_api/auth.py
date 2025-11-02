from typing import Optional, Dict, Any
import requests
from fastapi import Header, HTTPException
from google.cloud import firestore
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
import os

# Initialize Firebase Admin SDK
try:
    firebase_admin.get_app()
except ValueError:
    # Initialize with application default credentials (works in GCP)
    firebase_admin.initialize_app()

EXPECTED_CLIENT_ID = "459213216590-1k4kgj6sq94042hm8r1au90lang8otl7.apps.googleusercontent.com"


async def verify_identity_platform_token(authorization: Optional[str] = Header(None)) -> dict:
    """
    Verify authentication token - supports both Google OAuth and Firebase Auth.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authentication token")

    token = authorization.split("Bearer ", 1)[1].strip()

    if not token:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    # Try Firebase Auth first (works for email/password and OAuth)
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return {
            "sub": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "email_verified": decoded_token.get("email_verified", False),
            "name": decoded_token.get("name"),
            "picture": decoded_token.get("picture"),
            "auth_provider": decoded_token.get("firebase", {}).get("sign_in_provider", "unknown"),
        }
    except Exception as firebase_error:
        # Fallback to Google OAuth tokeninfo (for backward compatibility)
        try:
            response = requests.get(
                "https://www.googleapis.com/oauth2/v3/tokeninfo",
                params={"access_token": token},
                timeout=5,
            )

            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid or expired token")

            token_info = response.json()

            if token_info.get("aud") != EXPECTED_CLIENT_ID:
                raise HTTPException(status_code=401, detail="Token not issued for this application")

            return {
                "sub": token_info.get("sub"),
                "email": token_info.get("email"),
                "email_verified": str(token_info.get("email_verified", "false")).lower() == "true",
                "name": token_info.get("name"),
                "picture": token_info.get("picture"),
                "auth_provider": "google.com",
            }
        except requests.RequestException as exc:
            raise HTTPException(status_code=401, detail=f"Token verification failed: {exc}") from exc
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=401, detail="Invalid token format") from exc
