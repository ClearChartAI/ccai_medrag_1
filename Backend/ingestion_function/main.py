"""
Cloud Function entry point for processing uploaded medical PDFs.

Triggered by: Google Cloud Storage (finalize event) on the uploads bucket.
Workflow:
    1. Download the uploaded PDF from GCS.
    2. Submit the document to Document AI (layout + form processors).
    3. Perform semantic chunking of the extracted text and key-value pairs.
    4. Filter out short chunks (< 50 chars) for better quality.
    5. Add resulting documents to the Vertex AI Vector Search index in batches.

Environment variables expected:
    PROJECT_ID               -> GCP Project ID
    VERTEX_AI_REGION         -> Region (e.g., us-central1)
    DOCAI_LOCATION           -> DocAI location (e.g., us)
    LAYOUT_PROCESSOR_ID      -> DocAI layout processor ID
    FORM_PROCESSOR_ID        -> DocAI form processor ID
    VERTEX_INDEX_ENDPOINT    -> Full resource name of the index endpoint
    DEPLOYED_INDEX_ID        -> Deployed index ID on the endpoint
    VERTEX_INDEX_ID          -> Vector index ID
    ARTIFACT_BUCKET          -> GCS bucket for artifacts
"""
from typing import Any, Dict
import tempfile
import uuid

from google.cloud import storage, firestore

from modules import Config, DocumentAIProcessor, DocumentChunker, VectorIndexUploader
from modules.vector_index import Document


def process_document(event: Dict[str, Any], context: Any) -> None:
    """
    Main entry point for Cloud Function.

    Args:
        event: GCS event data (bucket, name)
        context: Cloud Function context
    """
    config = Config.from_env()

    bucket_name = event["bucket"]
    object_name = event["name"]
    print(f"Processing gs://{bucket_name}/{object_name}")

    # Extract user_id and document_id from path
    path_parts = object_name.split("/")
    if len(path_parts) >= 2:
        user_id = path_parts[0]
        filename_part = path_parts[1]
        document_id = (
            filename_part.split("_")[0] if "_" in filename_part else str(uuid.uuid4())
        )
    else:
        user_id = "unknown"
        document_id = str(uuid.uuid4())

    print(f"Extracted user_id: {user_id}, document_id: {document_id}")

    # 1. Download PDF
    pdf_bytes = _download_blob(bucket_name, object_name)

    # 2. Process with Document AI
    docai_processor = DocumentAIProcessor(
        project_id=config.project_id, location=config.docai_location
    )
    layout_json, form_json = docai_processor.process_document(
        pdf_bytes=pdf_bytes,
        layout_processor_id=config.layout_processor_id,
        form_processor_id=config.form_processor_id,
    )

    # 3. Build chunks
    chunker = DocumentChunker()
    chunks = chunker.build_chunks(layout_json, form_json)
    print(f"Generated {len(chunks)} chunks from DocAI output")

    # 4. Filter out short chunks
    filtered_chunks = chunker.filter_substantive_chunks(chunks)
    print(
        f"Prepared {len(filtered_chunks)} documents for vector store "
        f"(filtered from {len(chunks)} total chunks, "
        f"min length: {chunker.MIN_CHUNK_LENGTH} chars)"
    )

    # Convert to Document objects
    docs = [
        Document(page_content=chunk["text"], metadata=chunk["metadata"])
        for chunk in filtered_chunks
    ]

    # 5. Upload to vector index
    uploader = VectorIndexUploader(
        project_id=config.project_id,
        region=config.vertex_region,
        index_id=config.index_id,
    )
    uploader.upsert_documents(
        documents=docs,
        user_id=user_id,
        document_id=document_id,
        gcs_path=f"gs://{bucket_name}/{object_name}",
    )

    print("Ingestion completed successfully")

    # 6. Generate document summary using Gemini
    summary = _generate_summary(docs, config)

    # 7. Update document status in Firestore with summary
    try:
        db = firestore.Client(project=config.project_id)
        doc_ref = db.collection("documents").document(document_id)
        update_data = {
            "processing_status": "completed",
            "page_count": len(docs),
            "chunk_count": len(docs),
            "updated_at": firestore.SERVER_TIMESTAMP,
        }
        if summary:
            update_data["summary"] = summary
            update_data["summary_generated_at"] = firestore.SERVER_TIMESTAMP

        doc_ref.update(update_data)
        print(f"✓ Updated document {document_id} status to 'completed' with summary")
    except Exception as e:
        print(f"Warning: Could not update document status: {e}")


def _download_blob(bucket_name: str, object_name: str) -> bytes:
    """Download blob from GCS."""
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(object_name)
    with tempfile.NamedTemporaryFile() as temp_file:
        blob.download_to_file(temp_file)
        temp_file.flush()
        temp_file.seek(0)
        return temp_file.read()


def _generate_summary(docs: list, config: Config) -> str:
    """Generate a comprehensive, detailed summary of the document using Gemini."""
    try:
        from vertexai.generative_models import GenerativeModel, GenerationConfig

        # Combine ALL chunks for comprehensive summary (use more content)
        combined_text = "\n\n".join([doc.page_content for doc in docs])
        # Limit to ~15000 chars to fit in context (allows for much more detail)
        if len(combined_text) > 15000:
            combined_text = combined_text[:15000]

        prompt = f"""You are a medical document summarizer. Create a comprehensive summary that explains medical information in VERY SIMPLE, CLEAR language that anyone can understand - as if explaining to someone with no medical knowledge.

**CRITICAL REQUIREMENTS:**
1. **Explain ALL medical jargon** - Never use medical terms without immediately explaining them in plain English
2. Use VERY SIMPLE language - write as if talking to a friend
3. Keep the summary up to 2000 tokens (approximately 1500 words)
4. Use markdown formatting with headers, bullet points, and bold for highlights
5. Include ALL important information from the document
6. Be STRAIGHT TO THE POINT - no complex sentences

**STRUCTURE YOUR SUMMARY:**

# Brief Summary
[In 2-3 SIMPLE sentences, explain what this medical document is about and the main points. Use everyday language.]

# Patient Information
- **Name:** [if available]
- **Age/DOB:** [if available]
- **Gender:** [if available]
- **ID Number:** [if available]

# Why They Went to the Doctor
[Explain in simple words what problem or symptoms brought them to the hospital/clinic]

# Medical Background
## Previous Health Problems
- [List conditions in plain English. For example: "High blood pressure (when blood pushes too hard against artery walls)" or "Diabetes (body can't properly control blood sugar levels)"]

## Current Medications
- [List medications and explain what they do. For example: "Metformin (helps lower blood sugar)" or "Lisinopril (lowers blood pressure)"]

## Allergies
- [List any allergies and reactions in simple terms]

# This Visit
## What They Were Experiencing
- [Describe symptoms in everyday language. Instead of "dyspnea", say "trouble breathing" or "shortness of breath"]

## What the Doctor Found
- **Vital Signs:** [Explain what these numbers mean. For example: "Blood pressure 140/90 (a bit high, normal is around 120/80)"]
- **Physical Exam:** [Describe findings in plain English]

## Tests Done & Results
- [Explain tests and results simply. For example: "Blood sugar test: 180 mg/dL (higher than normal, which is 70-100)" or "X-ray showed fluid in lungs (meaning lungs had extra water in them)"]
- **IMPORTANT RESULTS** in bold with explanations

## What's Wrong (Diagnosis)
- [Explain conditions in simple terms. For example: instead of "acute myocardial infarction", say "heart attack (when blood flow to the heart is blocked)"]

## Treatment & What They Did
- [Describe treatments clearly. For example: "Started on antibiotics (medicine to kill bacteria causing infection)" or "Given IV fluids (water and minerals through a tube into the vein)"]

# Most Important Things to Know
[List the critical points in simple bullet points - things that really matter for the patient to understand]

# What Happens Next
[Explain follow-up care, instructions, or next appointments in clear, simple language]

---

**MEDICAL DOCUMENT:**
{combined_text}

---

**REMEMBER: Explain EVERY medical term you use. Be as simple and clear as possible. Imagine explaining to someone who knows nothing about medicine.**"""

        # Configure for longer output
        generation_config = GenerationConfig(
            max_output_tokens=2048,  # Allow full 2000 token summary
            temperature=0.3,  # Lower temperature for more factual, structured output
        )

        model = GenerativeModel("gemini-2.0-flash-exp", generation_config=generation_config)
        response = model.generate_content(prompt)
        summary = response.text.strip()
        print(f"✓ Generated comprehensive summary ({len(summary)} chars)")
        return summary
    except Exception as e:
        print(f"Warning: Could not generate summary: {e}")
        return None
