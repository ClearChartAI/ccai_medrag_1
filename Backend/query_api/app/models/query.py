"""Query-related Pydantic models."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    """Request model for medical query endpoint."""

    question: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User's medical question (max 2000 chars ≈ 500 tokens)"
    )
    chat_id: Optional[str] = Field(default=None, description="Chat session ID for history")
    top_k: int = Field(default=10, ge=1, le=20, description="Number of chunks to retrieve")


class Source(BaseModel):
    """Source information for a retrieved chunk."""

    id: str = Field(..., description="Chunk ID")
    distance: float = Field(..., description="Vector similarity distance")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Chunk metadata")
    document_id: Optional[str] = Field(None, description="Source document ID")


class QueryResponse(BaseModel):
    """Response model for medical query endpoint."""

    answer: str = Field(..., description="Generated answer from Gemini")
    sources: List[Source] = Field(default_factory=list, description="Retrieved sources")
    chat_id: str = Field(..., description="Chat session ID")
