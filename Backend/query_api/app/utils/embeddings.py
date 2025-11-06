"""Embedding generation utilities."""
from typing import List
from vertexai.language_models import TextEmbeddingModel


# Global embedding model (initialized once)
_embedding_model: TextEmbeddingModel = None


def _get_embedding_model() -> TextEmbeddingModel:
    """Get or initialize the embedding model (singleton pattern)."""
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-004")
    return _embedding_model


def get_embedding(text: str) -> List[float]:
    """
    Generate embedding for a single text.

    Args:
        text: Input text

    Returns:
        Embedding vector as list of floats
    """
    model = _get_embedding_model()
    response = model.get_embeddings([text])
    return response[0].values


def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for multiple texts.

    Args:
        texts: List of input texts

    Returns:
        List of embedding vectors
    """
    model = _get_embedding_model()
    response = model.get_embeddings(texts)
    return [emb.values for emb in response]
