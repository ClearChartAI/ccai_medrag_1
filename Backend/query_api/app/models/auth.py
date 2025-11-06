"""Authentication-related Pydantic models."""
from typing import Optional
from pydantic import BaseModel, Field


class TokenData(BaseModel):
    """Data extracted from Firebase ID token."""

    uid: str = Field(..., description="Firebase user ID")
    email: Optional[str] = Field(None, description="User email")
    name: Optional[str] = Field(None, description="User display name")


class User(BaseModel):
    """User information."""

    uid: str = Field(..., description="User ID")
    email: Optional[str] = Field(None, description="User email")
    name: Optional[str] = Field(None, description="User display name")
    email_verified: bool = Field(False, description="Email verification status")


class ProfileUpdateRequest(BaseModel):
    """Request model for updating user profile."""

    display_name: Optional[str] = None
