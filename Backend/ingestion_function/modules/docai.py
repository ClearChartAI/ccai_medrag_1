"""Document AI processing logic."""
from typing import Dict, Any, List
import re
from google.cloud import documentai
from google.protobuf.json_format import MessageToDict


class DocumentAIProcessor:
    """Handles Document AI processing operations."""

    def __init__(self, project_id: str, location: str):
        """Initialize Document AI client."""
        self.project_id = project_id
        self.location = location
        client_options = {"api_endpoint": f"{location}-documentai.googleapis.com"}
        self.client = documentai.DocumentProcessorServiceClient(
            client_options=client_options
        )

    def process_document(
        self, pdf_bytes: bytes, layout_processor_id: str, form_processor_id: str
    ) -> tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Process PDF with both layout and form processors.

        Args:
            pdf_bytes: PDF file bytes
            layout_processor_id: Layout processor ID
            form_processor_id: Form processor ID

        Returns:
            Tuple of (layout_json, form_json)
        """
        layout_json = self._process_with_processor(
            pdf_bytes, layout_processor_id, "layout"
        )
        form_json = self._process_with_processor(
            pdf_bytes, form_processor_id, "form"
        )
        return layout_json, form_json

    def _process_with_processor(
        self, pdf_bytes: bytes, processor_id: str, name: str
    ) -> Dict[str, Any]:
        """Process document with a specific processor."""
        processor_name = self.client.processor_path(
            self.project_id, self.location, processor_id
        )
        request = documentai.ProcessRequest(
            name=processor_name,
            raw_document=documentai.RawDocument(
                content=pdf_bytes, mime_type="application/pdf"
            ),
        )
        result = self.client.process_document(request=request)
        document_dict = MessageToDict(result.document._pb)
        print(f"DocAI {name} processor complete")
        return document_dict

    @staticmethod
    def extract_layout_text(layout_json: Dict[str, Any]) -> str:
        """
        Extract text from Document AI Layout Parser JSON.

        Args:
            layout_json: Layout parser output

        Returns:
            Extracted text
        """
        # Check if there's a top-level text field (fallback)
        if "text" in layout_json and layout_json["text"]:
            print("Found top-level text field")
            return layout_json["text"]

        # Extract from documentLayout blocks (primary method for layout parser)
        if "documentLayout" not in layout_json:
            print("WARNING: No documentLayout found in layout JSON")
            return ""

        blocks = layout_json.get("documentLayout", {}).get("blocks", [])
        collected_texts = []

        def extract_from_blocks(block_list: List[Dict[str, Any]]) -> None:
            """Recursively extract text from nested blocks."""
            for block in block_list:
                # Extract text from textBlock
                if "textBlock" in block:
                    text_block = block["textBlock"]
                    if "text" in text_block and text_block["text"]:
                        collected_texts.append(text_block["text"])

                    # Recursively process nested blocks
                    if "blocks" in text_block:
                        extract_from_blocks(text_block["blocks"])

                # Handle tableBlock if present
                elif "tableBlock" in block:
                    table = block["tableBlock"]
                    # Extract from header rows
                    for row in table.get("headerRows", []):
                        for cell in row.get("cells", []):
                            if "blocks" in cell:
                                extract_from_blocks(cell["blocks"])
                    # Extract from body rows
                    for row in table.get("bodyRows", []):
                        for cell in row.get("cells", []):
                            if "blocks" in cell:
                                extract_from_blocks(cell["blocks"])

        print(f"Extracting from {len(blocks)} top-level blocks")
        extract_from_blocks(blocks)

        full_text = "\n".join(collected_texts)
        print(f"Extracted {len(full_text)} characters from layout parser")

        return full_text

    @staticmethod
    def extract_form_kv_pairs(form_json: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract key-value pairs from form processor output.

        Args:
            form_json: Form processor output

        Returns:
            List of key-value pair dicts
        """
        full_text = form_json.get("text", "")
        kv_items = []

        for page in form_json.get("pages", []):
            page_number = page.get("pageNumber", 0)
            for form_field in page.get("formFields", []):
                key_anchor = form_field.get("fieldName", {}).get("textAnchor")
                value_anchor = form_field.get("fieldValue", {}).get("textAnchor")
                key = DocumentAIProcessor._read_anchor_text(key_anchor, full_text)
                value = DocumentAIProcessor._read_anchor_text(value_anchor, full_text)
                if key and value:
                    kv_items.append({"text": f"{key}: {value}", "page": page_number})

        return kv_items

    @staticmethod
    def _read_anchor_text(anchor: Dict[str, Any], full_text: str) -> str:
        """Read text from text anchor."""
        if not anchor:
            return ""
        out = []
        for segment in anchor.get("textSegments", []):
            start = int(segment.get("startIndex", 0))
            end = int(segment.get("endIndex", 0))
            out.append(full_text[start:end])
        return re.sub(r"\s+", " ", "".join(out)).strip()
