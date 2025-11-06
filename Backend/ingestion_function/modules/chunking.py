"""Document chunking logic."""
from typing import Dict, Any, List
import nltk
import tiktoken

# Download NLTK data
nltk.download("punkt", quiet=True)
nltk.download("punkt_tab", quiet=True)

# Initialize tokenizer
try:
    ENCODING = tiktoken.get_encoding("cl100k_base")
except Exception:
    ENCODING = tiktoken.encoding_for_model("gpt-4")


class DocumentChunker:
    """Handles document chunking operations."""

    MIN_CHUNK_LENGTH = 50  # Characters
    MAX_TOKENS = 512  # Tokens per chunk

    @staticmethod
    def count_tokens(text: str) -> int:
        """Count tokens in text."""
        return len(ENCODING.encode(text))

    @staticmethod
    def split_into_sentences(text: str) -> List[str]:
        """Split text into sentences."""
        sentences = nltk.sent_tokenize(text)
        refined = []
        for sentence in sentences:
            refined.extend(
                segment.strip() for segment in sentence.split("\n") if segment.strip()
            )
        return [s for s in refined if s]

    @classmethod
    def chunk_text(cls, text: str) -> List[Dict[str, Any]]:
        """
        Chunk text using rule-based approach.

        Args:
            text: Input text

        Returns:
            List of chunk dicts with text and metadata
        """
        sentences = cls.split_into_sentences(text)

        # Simple rule-based chunking: group sentences by token count
        simple_chunks = []
        current_chunk = []
        current_tokens = 0

        for sentence in sentences:
            sentence_tokens = cls.count_tokens(sentence)
            if current_tokens + sentence_tokens > cls.MAX_TOKENS and current_chunk:
                simple_chunks.append(" ".join(current_chunk))
                current_chunk = [sentence]
                current_tokens = sentence_tokens
            else:
                current_chunk.append(sentence)
                current_tokens += sentence_tokens

        if current_chunk:
            simple_chunks.append(" ".join(current_chunk))

        # Create chunk dicts
        doc_chunks = []
        for idx, chunk_text in enumerate(simple_chunks, start=1):
            doc_chunks.append(
                {
                    "text": chunk_text,
                    "metadata": {"chunk_type": "rule_based", "chunk_index": idx},
                }
            )

        return doc_chunks

    @classmethod
    def build_chunks(
        cls, layout_json: Dict[str, Any], form_json: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Build chunks from Document AI outputs.

        Args:
            layout_json: Layout parser output
            form_json: Form parser output

        Returns:
            List of chunk dicts
        """
        from modules.docai import DocumentAIProcessor

        # Extract layout text and chunk it
        layout_text = DocumentAIProcessor.extract_layout_text(layout_json)
        doc_chunks = cls.chunk_text(layout_text)

        # Add form key-value pairs as separate chunks
        kv_items = DocumentAIProcessor.extract_form_kv_pairs(form_json)
        if kv_items:
            for idx, kv_item in enumerate(kv_items, start=1):
                doc_chunks.append(
                    {
                        "text": kv_item["text"],
                        "metadata": {"chunk_type": "kv_pair", "chunk_index": idx},
                    }
                )

        return doc_chunks

    @classmethod
    def filter_substantive_chunks(
        cls, chunks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Filter out very short chunks that lack substantive content.

        Args:
            chunks: List of chunk dicts

        Returns:
            Filtered list of chunks
        """
        return [
            chunk
            for chunk in chunks
            if chunk["text"].strip()
            and len(chunk["text"].strip()) >= cls.MIN_CHUNK_LENGTH
        ]
