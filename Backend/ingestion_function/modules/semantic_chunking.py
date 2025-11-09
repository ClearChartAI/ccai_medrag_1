"""
Semantic chunking that preserves Document AI's structural understanding.

This module extracts chunks based on document structure (paragraphs, tables, forms)
rather than arbitrary token boundaries.
"""
from typing import Dict, Any, List, Optional
import re


class SemanticChunker:
    """Handles semantic, structure-aware document chunking."""

    MIN_CHUNK_LENGTH = 50  # Characters
    MAX_CHUNK_LENGTH = 2000  # Characters (soft limit)

    @staticmethod
    def extract_text_from_text_anchor(
        text_anchor: Dict[str, Any], full_text: str
    ) -> str:
        """Extract text from a text anchor reference."""
        if not text_anchor:
            return ""

        segments = []
        for segment in text_anchor.get("textSegments", []):
            start = int(segment.get("startIndex", 0))
            end = int(segment.get("endIndex", 0))
            if start < len(full_text) and end <= len(full_text):
                segments.append(full_text[start:end])

        return " ".join(segments).strip()

    @classmethod
    def extract_semantic_chunks(
        cls, layout_json: Dict[str, Any], form_json: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Extract chunks based on Document AI's semantic structure.

        Args:
            layout_json: Layout parser output
            form_json: Form parser output

        Returns:
            List of semantic chunk dicts with text, type, metadata
        """
        chunks = []
        full_text = layout_json.get("text", "")

        # 1. Extract chunks from document layout blocks
        doc_layout = layout_json.get("documentLayout", {})
        if doc_layout and "blocks" in doc_layout:
            chunks.extend(
                cls._extract_from_layout_blocks(
                    doc_layout["blocks"], full_text, layout_json
                )
            )

        # 2. Extract chunks from pages (paragraphs, tables)
        pages = layout_json.get("pages", [])
        for page_idx, page in enumerate(pages):
            page_number = page.get("pageNumber", page_idx + 1)

            # Extract paragraphs
            chunks.extend(
                cls._extract_paragraphs(page, full_text, page_number)
            )

            # Extract tables
            chunks.extend(
                cls._extract_tables(page, full_text, page_number)
            )

        # 3. Extract form fields (key-value pairs)
        chunks.extend(cls._extract_form_fields(form_json))

        # 4. Filter out very short chunks
        substantial_chunks = [
            chunk
            for chunk in chunks
            if chunk.get("text", "").strip()
            and len(chunk["text"].strip()) >= cls.MIN_CHUNK_LENGTH
        ]

        # 5. Deduplicate chunks (same text might appear in multiple structures)
        unique_chunks = cls._deduplicate_chunks(substantial_chunks)

        return unique_chunks

    @classmethod
    def _extract_from_layout_blocks(
        cls, blocks: List[Dict[str, Any]], full_text: str, layout_json: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Extract chunks from documentLayout blocks (recursive)."""
        chunks = []

        for block in blocks:
            # Text block (paragraph, heading, etc.)
            if "textBlock" in block:
                text_block = block["textBlock"]
                text = text_block.get("text", "")

                if text.strip():
                    chunk_type = text_block.get("type", "paragraph")
                    chunks.append(
                        {
                            "text": text.strip(),
                            "type": "text_block",
                            "semantic_label": chunk_type,
                            "confidence": block.get("confidence", 1.0),
                        }
                    )

                # Recursively process nested blocks
                if "blocks" in text_block:
                    chunks.extend(
                        cls._extract_from_layout_blocks(
                            text_block["blocks"], full_text, layout_json
                        )
                    )

            # Table block
            elif "tableBlock" in block:
                table_block = block["tableBlock"]
                table_text = cls._convert_table_to_text(table_block, full_text)

                if table_text.strip():
                    chunks.append(
                        {
                            "text": table_text.strip(),
                            "type": "table",
                            "semantic_label": "table",
                            "confidence": block.get("confidence", 1.0),
                        }
                    )

        return chunks

    @classmethod
    def _extract_paragraphs(
        cls, page: Dict[str, Any], full_text: str, page_number: int
    ) -> List[Dict[str, Any]]:
        """Extract paragraph chunks from page."""
        chunks = []

        for para in page.get("paragraphs", []):
            layout = para.get("layout", {})
            text_anchor = layout.get("textAnchor", {})

            text = cls.extract_text_from_text_anchor(text_anchor, full_text)

            if text.strip():
                chunks.append(
                    {
                        "text": text.strip(),
                        "type": "paragraph",
                        "semantic_label": "paragraph",
                        "page": page_number,
                        "confidence": layout.get("confidence", 1.0),
                    }
                )

        return chunks

    @classmethod
    def _extract_tables(
        cls, page: Dict[str, Any], full_text: str, page_number: int
    ) -> List[Dict[str, Any]]:
        """Extract table chunks from page."""
        chunks = []

        for table in page.get("tables", []):
            table_text = cls._convert_table_to_markdown(table, full_text)

            if table_text.strip():
                chunks.append(
                    {
                        "text": table_text.strip(),
                        "type": "table",
                        "semantic_label": "table",
                        "page": page_number,
                    }
                )

        return chunks

    @classmethod
    def _convert_table_to_markdown(
        cls, table: Dict[str, Any], full_text: str
    ) -> str:
        """Convert Document AI table structure to markdown format."""
        lines = []

        # Process header rows
        header_rows = table.get("headerRows", [])
        for row in header_rows:
            cells = []
            for cell in row.get("cells", []):
                layout = cell.get("layout", {})
                text_anchor = layout.get("textAnchor", {})
                cell_text = cls.extract_text_from_text_anchor(text_anchor, full_text)
                cells.append(cell_text.strip() or " ")

            if cells:
                lines.append("| " + " | ".join(cells) + " |")
                lines.append("| " + " | ".join(["---"] * len(cells)) + " |")

        # Process body rows
        body_rows = table.get("bodyRows", [])
        for row in body_rows:
            cells = []
            for cell in row.get("cells", []):
                layout = cell.get("layout", {})
                text_anchor = layout.get("textAnchor", {})
                cell_text = cls.extract_text_from_text_anchor(text_anchor, full_text)
                cells.append(cell_text.strip() or " ")

            if cells:
                lines.append("| " + " | ".join(cells) + " |")

        return "\n".join(lines)

    @classmethod
    def _convert_table_to_text(
        cls, table_block: Dict[str, Any], full_text: str
    ) -> str:
        """Convert table block to readable text format."""
        lines = []

        # Process header rows
        for row in table_block.get("headerRows", []):
            row_text = cls._extract_table_row_text(row, full_text)
            if row_text:
                lines.append(f"Header: {row_text}")

        # Process body rows
        for row in table_block.get("bodyRows", []):
            row_text = cls._extract_table_row_text(row, full_text)
            if row_text:
                lines.append(row_text)

        return "\n".join(lines)

    @classmethod
    def _extract_table_row_text(
        cls, row: Dict[str, Any], full_text: str
    ) -> str:
        """Extract text from a table row."""
        cells = []
        for cell in row.get("cells", []):
            # Check if cell has blocks (nested structure)
            if "blocks" in cell:
                cell_text = cls._extract_text_from_blocks(cell["blocks"], full_text)
            else:
                # Extract from layout
                layout = cell.get("layout", {})
                text_anchor = layout.get("textAnchor", {})
                cell_text = cls.extract_text_from_text_anchor(text_anchor, full_text)

            if cell_text.strip():
                cells.append(cell_text.strip())

        return " | ".join(cells) if cells else ""

    @classmethod
    def _extract_text_from_blocks(
        cls, blocks: List[Dict[str, Any]], full_text: str
    ) -> str:
        """Extract text from nested blocks."""
        texts = []
        for block in blocks:
            if "textBlock" in block:
                text = block["textBlock"].get("text", "")
                if text.strip():
                    texts.append(text.strip())
        return " ".join(texts)

    @classmethod
    def _extract_form_fields(cls, form_json: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract form fields as key-value pair chunks."""
        chunks = []
        full_text = form_json.get("text", "")

        for page in form_json.get("pages", []):
            page_number = page.get("pageNumber", 0)

            for field in page.get("formFields", []):
                field_name = field.get("fieldName", {})
                field_value = field.get("fieldValue", {})

                # Extract key and value text
                key_anchor = field_name.get("textAnchor", {})
                value_anchor = field_value.get("textAnchor", {})

                key = cls.extract_text_from_text_anchor(key_anchor, full_text)
                value = cls.extract_text_from_text_anchor(value_anchor, full_text)

                if key or value:
                    # Create readable key-value format
                    if key and value:
                        text = f"{key}: {value}"
                    elif key:
                        text = key
                    else:
                        text = value

                    chunks.append(
                        {
                            "text": text.strip(),
                            "type": "form_field",
                            "semantic_label": "key_value_pair",
                            "page": page_number,
                            "confidence": field_name.get("confidence", 1.0),
                        }
                    )

        return chunks

    @classmethod
    def _deduplicate_chunks(
        cls, chunks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Remove duplicate chunks based on text content."""
        seen_texts = set()
        unique_chunks = []

        for chunk in chunks:
            # Normalize text for comparison
            text = chunk["text"].strip()
            text_normalized = re.sub(r"\s+", " ", text).lower()

            if text_normalized not in seen_texts:
                seen_texts.add(text_normalized)
                unique_chunks.append(chunk)

        return unique_chunks

    @classmethod
    def split_large_chunks(
        cls, chunks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Split chunks that exceed MAX_CHUNK_LENGTH while preserving context.

        This is a fallback for extremely long paragraphs.
        """
        result = []

        for chunk in chunks:
            text = chunk["text"]

            if len(text) <= cls.MAX_CHUNK_LENGTH:
                result.append(chunk)
            else:
                # Split by sentences, trying to keep chunks under max length
                sentences = re.split(r"(?<=[.!?])\s+", text)
                current_chunk = []
                current_length = 0

                for sentence in sentences:
                    sentence_length = len(sentence)

                    if current_length + sentence_length > cls.MAX_CHUNK_LENGTH and current_chunk:
                        # Save current chunk
                        result.append(
                            {
                                **chunk,
                                "text": " ".join(current_chunk),
                                "is_split": True,
                            }
                        )
                        current_chunk = [sentence]
                        current_length = sentence_length
                    else:
                        current_chunk.append(sentence)
                        current_length += sentence_length

                # Add remaining chunk
                if current_chunk:
                    result.append(
                        {
                            **chunk,
                            "text": " ".join(current_chunk),
                            "is_split": True,
                        }
                    )

        return result
