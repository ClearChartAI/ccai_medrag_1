"""API route handlers."""
from .query import router as query_router
from .documents import router as documents_router
from .health import router as health_router
from .profile import router as profile_router
from .summaries import router as summaries_router
from .notes import router as notes_router
from .chats import router as chats_router

__all__ = ["query_router", "documents_router", "health_router", "profile_router", "summaries_router", "notes_router", "chats_router"]
