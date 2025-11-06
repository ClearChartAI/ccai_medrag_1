"""Configuration management for the application."""
import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class Config:
    """Application configuration loaded from environment variables."""

    project_id: str
    vertex_region: str
    index_endpoint: str
    deployed_index_id: str
    index_id: str

    # Optional configurations
    cors_origins: list[str]
    rate_limit: str

    @classmethod
    def from_env(cls) -> "Config":
        """Load configuration from environment variables."""
        return cls(
            project_id=cls._require_env("PROJECT_ID"),
            vertex_region=cls._require_env("VERTEX_AI_REGION"),
            index_endpoint=cls._require_env("VERTEX_INDEX_ENDPOINT"),
            deployed_index_id=cls._require_env("DEPLOYED_INDEX_ID"),
            index_id=cls._require_env("VERTEX_INDEX_ID"),
            cors_origins=[
                "https://clearchartai.io",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            ],
            rate_limit="100/minute",
        )

    @staticmethod
    def _require_env(name: str) -> str:
        """Get required environment variable or raise error."""
        value = os.getenv(name)
        if not value:
            raise RuntimeError(f"Missing required environment variable: {name}")
        return value

    @staticmethod
    def get_optional_env(name: str, default: Optional[str] = None) -> Optional[str]:
        """Get optional environment variable with default value."""
        return os.getenv(name, default)
