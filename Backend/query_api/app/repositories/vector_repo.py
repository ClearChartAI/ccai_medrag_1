"""Vertex AI Vector Search operations."""
from typing import List, Tuple
from google.cloud import aiplatform
from google.cloud.aiplatform.matching_engine.matching_engine_index_endpoint import (
    MatchingEngineIndexEndpoint,
)


class VectorRepository:
    """Repository for Vertex AI Vector Search operations."""

    def __init__(self, index_endpoint: str, deployed_index_id: str, index_id: str = None):
        """Initialize Vector Search client."""
        self.endpoint = MatchingEngineIndexEndpoint(index_endpoint_name=index_endpoint)
        self.deployed_index_id = deployed_index_id
        self.index_id = index_id

    def find_neighbors(
        self, query_embedding: List[float], num_neighbors: int = 100
    ) -> List[Tuple[str, float]]:
        """
        Find nearest neighbors for a query embedding.

        Args:
            query_embedding: Query vector embedding
            num_neighbors: Number of neighbors to retrieve (default 100 for multi-tenant filtering)

        Returns:
            List of (chunk_id, distance) tuples
        """
        matches = self.endpoint.find_neighbors(
            deployed_index_id=self.deployed_index_id,
            queries=[query_embedding],
            num_neighbors=num_neighbors,
        )

        if not matches or not matches[0]:
            return []

        # Extract (id, distance) tuples from neighbors
        neighbors = [(neighbor.id, float(neighbor.distance)) for neighbor in matches[0]]
        return neighbors

    def remove_vectors(self, datapoint_ids: List[str]) -> None:
        """
        Remove vectors from the Vertex AI Vector Search index.

        Args:
            datapoint_ids: List of chunk IDs to remove from the index

        Note:
            This uses the streaming update method to immediately remove vectors.
            For batch indices, this may require a different approach.
        """
        if not datapoint_ids:
            return

        if not self.index_id:
            raise ValueError("index_id is required for remove_vectors operation")

        # Get the Index resource
        index = aiplatform.MatchingEngineIndex(index_name=self.index_id)

        # Remove datapoints using the streaming API
        index.remove_datapoints(datapoint_ids=datapoint_ids)
