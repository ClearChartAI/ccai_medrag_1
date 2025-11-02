"""Cloud Function entry point for processing uploaded medical PDFs.

Triggered by: Google Cloud Storage (finalize event) on the uploads bucket.
Workflow:
    1. Download the uploaded PDF from GCS.
    2. Submit the document to Document AI (layout + form processors).
    3. Perform semantic chunking of the extracted text and key-value pairs.
    4. Optionally enrich chunks (commented out for MVP cost control).
    5. Add resulting documents to the Vertex AI Vector Search index in batches.

Environment variables expected:
    PROJECT_ID               -> GCP Project ID
    VERTEX_AI_REGION         -> Region (e.g., us-central1)
    DOCAI_LOCATION           -> DocAI location (e.g., us)
    LAYOUT_PROCESSOR_ID      -> DocAI layout processor ID
    FORM_PROCESSOR_ID        -> DocAI form processor ID
    VERTEX_INDEX_ENDPOINT    -> Full resource name of the index endpoint
    DEPLOYED_INDEX_ID        -> Deployed index ID on the endpoint

Dependencies (requirements.txt):
    google-cloud-storage
    google-cloud-documentai
    google-cloud-aiplatform
    langchain-google-vertexai
    sentence-transformers
    nltk
    tiktoken
"""
from __future__ import annotations

import json
import os
import re
import tempfile
import time
import uuid
from dataclasses import dataclass
from typing import Any, Dict, List, Sequence

import nltk
import tiktoken
from google.cloud import documentai, storage
from google.cloud import firestore
from google.cloud.aiplatform.matching_engine import MatchingEngineIndexEndpoint
from google.protobuf.json_format import MessageToDict

nltk.download("punkt", quiet=True)
nltk.download("punkt_tab", quiet=True)

@dataclass
class Config:
    project_id: str
    vertex_region: str
    docai_location: str
    layout_processor_id: str
    form_processor_id: str
    index_id: str
    endpoint_id: str
    deployed_index_id: str
    artifact_bucket: str

    @classmethod
    def from_env(cls) -> "Config":
        # Extract IDs from resource names if full resource names are provided
        index_endpoint = _require_env("VERTEX_INDEX_ENDPOINT")
        endpoint_id = index_endpoint.split("/")[-1] if "/" in index_endpoint else index_endpoint
        
        # INDEX_ID should be provided as env var
        index_id = os.getenv("VERTEX_INDEX_ID", "")
        if not index_id:
            # Try to extract from INDEX_RESOURCE_NAME if provided
            index_resource = os.getenv("VERTEX_INDEX_RESOURCE_NAME", "")
            if index_resource:
                index_id = index_resource.split("/")[-1]
        
        return cls(
            project_id=_require_env("PROJECT_ID"),
            vertex_region=_require_env("VERTEX_AI_REGION"),
            docai_location=os.getenv("DOCAI_LOCATION", "us"),
            layout_processor_id=_require_env("LAYOUT_PROCESSOR_ID"),
            form_processor_id=_require_env("FORM_PROCESSOR_ID"),
            index_id=index_id,
            endpoint_id=endpoint_id,
            deployed_index_id=_require_env("DEPLOYED_INDEX_ID"),
            artifact_bucket=_require_env("ARTIFACT_BUCKET"),
        )


@dataclass
class Document:
    """Simple document class to replace LangChain dependency."""
    page_content: str
    metadata: Dict[str, Any]


def _require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def process_document(event: Dict[str, Any], context: Any) -> None:
    config = Config.from_env()
    bucket_name = event["bucket"]
    object_name = event["name"]
    print(f"Processing gs://{bucket_name}/{object_name}")

    path_parts = object_name.split("/")
    if len(path_parts) >= 2:
        user_id = path_parts[0]
        filename_part = path_parts[1]
        document_id = filename_part.split("_")[0] if "_" in filename_part else str(uuid.uuid4())
    else:
        user_id = "unknown"
        document_id = str(uuid.uuid4())

    print(f"Extracted user_id: {user_id}, document_id: {document_id}")

    pdf_bytes = _download_blob(bucket_name, object_name)

    layout_json, form_json = _run_docai_pipeline(
        pdf_bytes=pdf_bytes,
        project_id=config.project_id,
        location=config.docai_location,
        layout_processor_id=config.layout_processor_id,
        form_processor_id=config.form_processor_id,
    )

    chunks = _build_chunks(layout_json, form_json)
    print(f"Generated {len(chunks)} chunks from DocAI output")

    docs = [
        Document(page_content=chunk["text"], metadata=chunk["metadata"])
        for chunk in chunks
        if chunk["text"].strip()
    ]
    print(f"Prepared {len(docs)} documents for vector store")

    _upsert_documents(
        documents=docs,
        project_id=config.project_id,
        region=config.vertex_region,
        index_id=config.index_id,
        endpoint_id=config.endpoint_id,
        deployed_index_id=config.deployed_index_id,
        gcs_bucket_name=config.artifact_bucket,
        user_id=user_id,
        document_id=document_id,
        gcs_path=f"gs://{bucket_name}/{object_name}",
    )

    print("Ingestion completed successfully")

    try:
        db = firestore.Client(project=config.project_id)
        doc_ref = db.collection('documents').document(document_id)
        doc_ref.update({
            'processing_status': 'completed',
            'page_count': len(docs),
            'updated_at': firestore.SERVER_TIMESTAMP,
        })
        print(f"✓ Updated document {document_id} status to 'completed'")
    except Exception as e:
        print(f"Warning: Could not update document status: {e}")


def _download_blob(bucket_name: str, object_name: str) -> bytes:
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(object_name)
    with tempfile.NamedTemporaryFile() as temp_file:
        blob.download_to_file(temp_file)
        temp_file.flush()
        temp_file.seek(0)
        return temp_file.read()


def _run_docai_pipeline(
    pdf_bytes: bytes,
    project_id: str,
    location: str,
    layout_processor_id: str,
    form_processor_id: str,
) -> tuple[Dict[str, Any], Dict[str, Any]]:
    client_options = {"api_endpoint": f"{location}-documentai.googleapis.com"}
    client = documentai.DocumentProcessorServiceClient(client_options=client_options)

    def process(processor_id: str, name: str) -> Dict[str, Any]:
        processor_name = client.processor_path(project_id, location, processor_id)
        request = documentai.ProcessRequest(
            name=processor_name,
            raw_document=documentai.RawDocument(content=pdf_bytes, mime_type="application/pdf"),
        )
        result = client.process_document(request=request)
        document_dict = MessageToDict(result.document._pb)
        print(f"DocAI {name} processor complete")
        return document_dict

    layout_json = process(layout_processor_id, "layout")
    form_json = process(form_processor_id, "form")
    return layout_json, form_json


try:
    ENCODING = tiktoken.get_encoding("cl100k_base")
except Exception:  # pragma: no cover
    ENCODING = tiktoken.encoding_for_model("gpt-4")


def count_tokens(text: str) -> int:
    return len(ENCODING.encode(text))


def _split_into_sentences(text: str) -> List[str]:
    sentences = nltk.sent_tokenize(text)
    refined = []
    for sentence in sentences:
        refined.extend(segment.strip() for segment in sentence.split("\n") if segment.strip())
    return [s for s in refined if s]


# Removed SemanticChunker class - using simple rule-based chunking instead


def _extract_layout_text(layout_json: Dict[str, Any]) -> str:
    """
    Extract text from Document AI Layout Parser JSON.
    The layout parser returns documentLayout with nested blocks.
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


def _extract_form_kv_pairs(form_json: Dict[str, Any]) -> List[Dict[str, Any]]:
    full_text = form_json.get("text", "")
    kv_items = []
    for page in form_json.get("pages", []):
        page_number = page.get("pageNumber", 0)
        for form_field in page.get("formFields", []):
            key_anchor = form_field.get("fieldName", {}).get("textAnchor")
            value_anchor = form_field.get("fieldValue", {}).get("textAnchor")
            key = _read_anchor_text(key_anchor, full_text)
            value = _read_anchor_text(value_anchor, full_text)
            if key and value:
                kv_items.append({
                    "text": f"{key}: {value}",
                    "page": page_number,
                })
    return kv_items


def _read_anchor_text(anchor: Dict[str, Any], full_text: str) -> str:
    if not anchor:
        return ""
    out = []
    for segment in anchor.get("textSegments", []):
        start = int(segment.get("startIndex", 0))
        end = int(segment.get("endIndex", 0))
        out.append(full_text[start:end])
    return re.sub(r"\s+", " ", "".join(out)).strip()


def _build_chunks(layout_json: Dict[str, Any], form_json: Dict[str, Any]) -> List[Dict[str, Any]]:
    layout_text = _extract_layout_text(layout_json)
    sentences = _split_into_sentences(layout_text)
    
    # Simple rule-based chunking: group sentences by token count (no ML model needed)
    simple_chunks = []
    current_chunk = []
    current_tokens = 0
    max_tokens = 512  # Optimal size for retrieval
    
    for sentence in sentences:
        sentence_tokens = count_tokens(sentence)
        if current_tokens + sentence_tokens > max_tokens and current_chunk:
            simple_chunks.append(" ".join(current_chunk))
            current_chunk = [sentence]
            current_tokens = sentence_tokens
        else:
            current_chunk.append(sentence)
            current_tokens += sentence_tokens
    
    if current_chunk:
        simple_chunks.append(" ".join(current_chunk))

    doc_chunks = []
    for idx, chunk_text in enumerate(simple_chunks, start=1):
        doc_chunks.append({
            "text": chunk_text,
            "metadata": {
                "chunk_type": "rule_based",
                "chunk_index": idx,
            },
        })

    kv_items = _extract_form_kv_pairs(form_json)
    if kv_items:
        kv_texts = [item["text"] for item in kv_items]
        for idx, kv_text in enumerate(kv_texts, start=1):
            doc_chunks.append({
                "text": kv_text,
                "metadata": {
                    "chunk_type": "kv_pair",
                    "chunk_index": idx,
                },
            })

    return doc_chunks


def _save_chunks_to_firestore(
    documents: List[Document],
    project_id: str,
    user_id: str,
    document_id: str,
    gcs_path: str,
) -> None:
    """Save document chunks to Firestore for retrieval."""
    if not documents:
        return

    db = firestore.Client(project=project_id)

    print(f"Saving {len(documents)} chunks to Firestore...")

    batch = db.batch()
    filename = gcs_path.split("/")[-1]
    doc_title = (
        filename.rsplit('.pdf', 1)[0].split('_', 1)[-1]
        if '_' in filename
        else filename
    )

    for i, doc in enumerate(documents):
        chunk_id = str(uuid.uuid4())

        doc_ref = db.collection('chunks').document(chunk_id)
        batch.set(doc_ref, {
            'chunk_id': chunk_id,
            'user_id': user_id,
            'document_id': document_id,
            'text': doc.page_content,
            'embedding': [],
            'metadata': {
                'chunk_type': doc.metadata.get('chunk_type', 'unknown'),
                'chunk_index': doc.metadata.get('chunk_index', i),
                'document_title': doc_title,
                'upload_date': firestore.SERVER_TIMESTAMP,
            },
            'created_at': firestore.SERVER_TIMESTAMP,
        })

        doc.metadata['chunk_id'] = chunk_id

        if (i + 1) % 500 == 0:
            batch.commit()
            batch = db.batch()
            print(f"  Saved {i + 1}/{len(documents)} chunks")

    batch.commit()
    print(f"✓ Saved all {len(documents)} chunks to Firestore")


def _upsert_documents(
    documents: List[Document],
    project_id: str,
    region: str,
    index_id: str,
    endpoint_id: str,
    deployed_index_id: str,
    gcs_bucket_name: str,
    user_id: str,
    document_id: str,
    gcs_path: str,
    batch_size: int = 100,
    sleep_seconds: float = 2.0,
) -> None:
    """Upload documents using streaming upsert (for STREAM_UPDATE indexes)."""
    if not documents:
        print("No documents to upsert")
        return

    from google.cloud import aiplatform
    from google.cloud.aiplatform_v1.services.index_service import IndexServiceClient
    from google.cloud.aiplatform_v1.types import IndexDatapoint, UpsertDatapointsRequest
    from vertexai.language_models import TextEmbeddingModel
    
    # Initialize
    aiplatform.init(project=project_id, location=region)
    embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-004")
    
    print(f"Processing {len(documents)} documents for streaming index")

    _save_chunks_to_firestore(documents, project_id, user_id, document_id, gcs_path)

    # Get embeddings
    texts = [doc.page_content for doc in documents]
    all_embeddings = []

    for i in range(0, len(texts), 200):
        sub_batch = texts[i:i+200]
        print(f"Getting embeddings for {len(sub_batch)} texts")
        embeddings_response = embedding_model.get_embeddings(sub_batch)
        all_embeddings.extend([emb.values for emb in embeddings_response])
        time.sleep(0.5)
    
    # Create datapoints
    datapoints = []
    for doc, embedding in zip(documents, all_embeddings):
        datapoint = IndexDatapoint(
            datapoint_id=doc.metadata['chunk_id'],
            feature_vector=embedding,
        )
        datapoints.append(datapoint)
    
    print(f"Upserting {len(datapoints)} datapoints to streaming index")
    
    # Use IndexServiceClient for streaming upsert
    client = IndexServiceClient(
        client_options={"api_endpoint": f"{region}-aiplatform.googleapis.com"}
    )
    
    index_name = f"projects/{project_id}/locations/{region}/indexes/{index_id}"
    
    # Streaming upsert (works because index has STREAM_UPDATE enabled)
    request = UpsertDatapointsRequest(
        index=index_name,
        datapoints=datapoints
    )
    
    response = client.upsert_datapoints(request=request)
    print(f"✓ Successfully uploaded {len(datapoints)} datapoints")
    print(f"✓ Datapoints are immediately searchable")
    print(f"✓ Completed processing {len(documents)} documents")
