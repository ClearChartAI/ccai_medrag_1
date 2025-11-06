# Document Ingestion Function - Architecture Documentation

## Overview

The ingestion Cloud Function has been refactored from a **monolithic 500-line `main.py`** into a **clean modular structure** with clear separation of concerns.

## Architecture Pattern

Modular architecture with specialized components:

1. **Configuration** (`modules/config.py`) - Environment management
2. **Document AI Processing** (`modules/docai.py`) - PDF text extraction
3. **Chunking** (`modules/chunking.py`) - Text segmentation
4. **Vector Index Upload** (`modules/vector_index.py`) - Embedding & upload

## Directory Structure

```
Backend/ingestion_function/
├── main.py                      # Entry point (~120 lines)
├── main_old.py                  # Backup of old monolithic code
├── requirements.txt
└── modules/
    ├── __init__.py
    ├── config.py                # Configuration management
    ├── docai.py                 # Document AI processing
    ├── chunking.py              # Text chunking logic
    └── vector_index.py          # Vector index upload
```

## Module Responsibilities

### 1. Config (`modules/config.py`)

**Purpose**: Load and validate environment variables

**Config class**:
- `project_id`, `vertex_region`, `docai_location`
- `layout_processor_id`, `form_processor_id`
- `index_id`, `endpoint_id`, `deployed_index_id`
- `artifact_bucket`

**Usage**:
```python
config = Config.from_env()
```

### 2. Document AI Processor (`modules/docai.py`)

**Purpose**: Extract text from PDFs using Document AI

**DocumentAIProcessor class**:
- `process_document()` - Process with layout + form processors
- `extract_layout_text()` - Extract text from layout parser JSON
- `extract_form_kv_pairs()` - Extract key-value pairs from form parser

**Features**:
- Recursively extracts text from nested blocks
- Handles tables (header rows + body rows)
- Extracts form fields as structured key-value pairs

**Usage**:
```python
processor = DocumentAIProcessor(project_id, location)
layout_json, form_json = processor.process_document(
    pdf_bytes, layout_processor_id, form_processor_id
)
text = processor.extract_layout_text(layout_json)
```

### 3. Document Chunker (`modules/chunking.py`)

**Purpose**: Split documents into semantic chunks

**DocumentChunker class**:
- `chunk_text()` - Rule-based chunking by token count
- `build_chunks()` - Build chunks from DocAI outputs
- `filter_substantive_chunks()` - Remove short/empty chunks

**Configuration**:
- `MIN_CHUNK_LENGTH = 50` characters
- `MAX_TOKENS = 512` tokens per chunk

**Usage**:
```python
chunker = DocumentChunker()
chunks = chunker.build_chunks(layout_json, form_json)
filtered = chunker.filter_substantive_chunks(chunks)
```

### 4. Vector Index Uploader (`modules/vector_index.py`)

**Purpose**: Generate embeddings and upload to vector index

**VectorIndexUploader class**:
- `upsert_documents()` - Main upload orchestrator
- `_save_chunks_to_firestore()` - Save metadata to Firestore
- Batch embedding generation (200 texts at a time)
- Streaming upsert to vector index

**Features**:
- Uses text-embedding-004 model
- Batches for efficiency (200 embeddings, 500 Firestore writes)
- Streaming upsert for immediate searchability

**Usage**:
```python
uploader = VectorIndexUploader(project_id, region, index_id)
uploader.upsert_documents(
    documents, user_id, document_id, gcs_path
)
```

## Processing Flow

```
1. Cloud Storage Event
   ↓ PDF uploaded to gs://bucket/user_id/doc_id_file.pdf
   ↓
2. Main Entry Point (main.py)
   ↓ process_document(event, context)
   ↓
3. Download PDF
   ↓ _download_blob() from GCS
   ↓
4. Document AI Processing (modules/docai.py)
   ↓ Layout Parser → extract text blocks
   ↓ Form Parser → extract key-value pairs
   ↓
5. Chunking (modules/chunking.py)
   ↓ Split text into semantic chunks
   ↓ Filter short chunks (< 50 chars)
   ↓
6. Vector Index Upload (modules/vector_index.py)
   ↓ Generate embeddings (text-embedding-004)
   ↓ Save chunks to Firestore
   ↓ Upsert datapoints to vector index
   ↓
7. Update Document Status
   ↓ Set processing_status = "completed"
```

## Benefits of Modular Structure

### Maintainability
- ✅ Each module has single responsibility
- ✅ Easy to find and modify specific functionality
- ✅ Clear boundaries between components

### Testability
- ✅ Can unit test each module independently
- ✅ Mock external dependencies (DocAI, Firestore, Vector Search)
- ✅ Test chunking logic without hitting APIs

### Reusability
- ✅ Can reuse DocumentChunker in other projects
- ✅ DocumentAIProcessor can be used standalone
- ✅ VectorIndexUploader can handle other data sources

### Scalability
- ✅ Easy to add new processors (e.g., OCR, entity extraction)
- ✅ Can swap chunking strategies without touching other code
- ✅ Can add different vector index backends

## Example: Adding New Feature

**Add entity extraction from medical documents**

1. **Create new module** (`modules/entity_extractor.py`):
```python
class EntityExtractor:
    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        # Use Medical NER model
        entities = {
            "diagnoses": [...],
            "medications": [...],
            "procedures": [...]
        }
        return entities
```

2. **Update main.py**:
```python
from modules import EntityExtractor

extractor = EntityExtractor()
entities = extractor.extract_entities(layout_text)

# Add entities to chunk metadata
for chunk in chunks:
    chunk["metadata"]["entities"] = entities
```

3. **Deploy**:
```bash
gcloud functions deploy document-ingestion \
  --gen2 \
  --runtime=python311 \
  --region=us-central1 \
  --source=. \
  --entry-point=process_document \
  --trigger-bucket=ccai-medrag-patient-uploads
```

## Configuration

Environment variables for Cloud Function:

```bash
PROJECT_ID=sunlit-adviser-471323-p0
VERTEX_AI_REGION=us-central1
DOCAI_LOCATION=us
LAYOUT_PROCESSOR_ID=abc123
FORM_PROCESSOR_ID=def456
VERTEX_INDEX_ENDPOINT=projects/.../indexEndpoints/...
DEPLOYED_INDEX_ID=medical_rag_v1_...
VERTEX_INDEX_ID=8701106212684431360
ARTIFACT_BUCKET=ccai-medrag-artifacts
```

## Deployment

No changes to deployment process:

```bash
gcloud functions deploy document-ingestion \
  --gen2 \
  --runtime=python311 \
  --region=us-central1 \
  --source=. \
  --entry-point=process_document \
  --trigger-bucket=ccai-medrag-patient-uploads \
  --timeout=540s \
  --memory=2GiB \
  --set-env-vars PROJECT_ID=...,VERTEX_AI_REGION=...
```

## Testing

### Unit Tests

```python
# Test chunker
def test_filter_substantive_chunks():
    chunker = DocumentChunker()
    chunks = [
        {"text": "Short", "metadata": {}},  # 5 chars - filtered
        {"text": "A" * 100, "metadata": {}},  # 100 chars - kept
    ]
    filtered = chunker.filter_substantive_chunks(chunks)
    assert len(filtered) == 1

# Test DocAI extraction
def test_extract_layout_text():
    layout_json = {
        "documentLayout": {
            "blocks": [
                {"textBlock": {"text": "Patient diagnosis..."}}
            ]
        }
    }
    text = DocumentAIProcessor.extract_layout_text(layout_json)
    assert "diagnosis" in text
```

### Integration Tests

Test full pipeline with sample PDF:

```python
def test_full_ingestion_pipeline():
    with open("test_medical_record.pdf", "rb") as f:
        pdf_bytes = f.read()

    config = Config.from_env()
    processor = DocumentAIProcessor(config.project_id, config.docai_location)
    layout_json, form_json = processor.process_document(pdf_bytes, ...)

    chunker = DocumentChunker()
    chunks = chunker.build_chunks(layout_json, form_json)

    assert len(chunks) > 0
    assert all(len(chunk["text"]) >= 50 for chunk in chunks)
```

## Comparison: Old vs New

### Old Monolithic (main.py - 500 lines)

❌ **Problems**:
- All logic in one file
- Hard to test without Cloud Function environment
- Difficult to reuse components
- Complex nested functions

### New Modular Structure

✅ **Benefits**:
- **Clear separation**: Each module has one job
- **Testable**: Can unit test without GCS/DocAI/Firestore
- **Reusable**: Modules work independently
- **Maintainable**: Easy to find and fix issues

## Future Improvements

1. **Add caching** for Document AI results (reduce costs)
2. **Add retry logic** for transient failures
3. **Add progress tracking** (update status during processing)
4. **Add OCR fallback** for scanned documents
5. **Add medical entity extraction** (NER model)
6. **Add document classification** (lab results, prescriptions, etc.)
7. **Add quality checks** (validate chunks before upload)

## Summary

The refactoring transforms a **500-line monolithic file** into a **clean, modular architecture** with:

- ✅ **4 specialized modules** (config, docai, chunking, vector_index)
- ✅ **Clear separation of concerns**
- ✅ **Fully testable components**
- ✅ **Easy to extend and maintain**
- ✅ **Production-grade quality**
