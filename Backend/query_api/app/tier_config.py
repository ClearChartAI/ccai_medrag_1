"""Tenant tier configuration for multi-index support."""
from dataclasses import dataclass
from typing import Dict


@dataclass
class IndexConfig:
    """Configuration for a specific vector index."""

    endpoint: str
    deployed_index_id: str
    index_id: str


# Tier definitions
TIER_STANDARD = "standard"
TIER_PREMIUM = "premium"
TIER_ENTERPRISE = "enterprise"


class TierManager:
    """Manages tenant tiers and their index assignments."""

    def __init__(self, default_config: IndexConfig):
        """Initialize with default (standard tier) configuration."""
        self.default_config = default_config
        self.tier_configs: Dict[str, IndexConfig] = {}
        self.tenant_tiers: Dict[str, str] = {}

    def register_tier(self, tier_name: str, config: IndexConfig) -> None:
        """Register a new tier with its index configuration."""
        self.tier_configs[tier_name] = config

    def assign_tenant_tier(self, user_id: str, tier: str) -> None:
        """Assign a tenant to a specific tier."""
        self.tenant_tiers[user_id] = tier

    def get_index_config(self, user_id: str) -> IndexConfig:
        """
        Get the appropriate index configuration for a user.

        Args:
            user_id: User/tenant ID

        Returns:
            IndexConfig for the user's tier
        """
        tier = self.tenant_tiers.get(user_id, TIER_STANDARD)
        return self.tier_configs.get(tier, self.default_config)


# Example usage (when you need it):
"""
# In config.py or environment setup:
from app.tier_config import TierManager, IndexConfig, TIER_ENTERPRISE

# Standard tier (current shared index)
standard_config = IndexConfig(
    endpoint=os.getenv("VERTEX_INDEX_ENDPOINT"),
    deployed_index_id=os.getenv("DEPLOYED_INDEX_ID"),
    index_id=os.getenv("VERTEX_INDEX_ID")
)

# Initialize tier manager
tier_manager = TierManager(default_config=standard_config)

# When you sign an enterprise customer:
enterprise_config = IndexConfig(
    endpoint="projects/123/locations/us-central1/indexEndpoints/456",
    deployed_index_id="enterprise_index_v1",
    index_id="enterprise_index_id"
)
tier_manager.register_tier(TIER_ENTERPRISE, enterprise_config)
tier_manager.assign_tenant_tier("big_whale_customer_id", TIER_ENTERPRISE)

# In query service:
config = tier_manager.get_index_config(user_id)
vector_repo = VectorRepository(
    index_endpoint=config.endpoint,
    deployed_index_id=config.deployed_index_id
)
"""
