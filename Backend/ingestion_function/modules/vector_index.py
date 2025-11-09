"""Vector index upload operations."""
from typing import List, Dict, Any
import time
import uuid
from dataclasses import dataclass

from google.cloud import aiplatform, firestore
from google.cloud.aiplatform_v1.services.index_service import IndexServiceClient
from google.cloud.aiplatform_v1.types import IndexDatapoint, UpsertDatapointsRequest
from vertexai.language_models import TextEmbeddingModel


@dataclass
class Document:
    """Simple document class."""

    page_content: str
    metadata: Dict[str, Any]


class VectorIndexUploader:
    """Handles vector index upload operations."""

    def __init__(self, project_id: str, region: str, index_id: str):
        """Initialize uploader."""
        self.project_id = project_id
        self.region = region
        self.index_id = index_id
        aiplatform.init(project=project_id, location=region)
        self.embedding_model = TextEmbeddingModel.from_pretrained(
            "text-embedding-004"
        )
        self.db = firestore.Client(project=project_id)

    def upsert_documents(
        self,
        documents: List[Document],
        user_id: str,
        document_id: str,
        gcs_path: str,
        batch_size: int = 100,
    ) -> None:
        """
        Upload documents to vector index using streaming upsert.

        Args:
            documents: List of documents to upload
            user_id: User ID
            document_id: Document ID
            gcs_path: GCS path of source document
            batch_size: Batch size for processing
        """
        if not documents:
            print("No documents to upsert")
            return

        print(f"Processing {len(documents)} documents for streaming index")

        # Save chunks to Firestore
        self._save_chunks_to_firestore(documents, user_id, document_id, gcs_path)

        # Get embeddings
        texts = [doc.page_content for doc in documents]
        all_embeddings = []

        for i in range(0, len(texts), 200):
            sub_batch = texts[i : i + 200]
            print(f"Getting embeddings for {len(sub_batch)} texts")
            embeddings_response = self.embedding_model.get_embeddings(sub_batch)
            all_embeddings.extend([emb.values for emb in embeddings_response])
            time.sleep(0.5)

        # Create datapoints
        datapoints = []
        for doc, embedding in zip(documents, all_embeddings):
            datapoint = IndexDatapoint(
                datapoint_id=doc.metadata["chunk_id"], feature_vector=embedding
            )
            datapoints.append(datapoint)

        print(f"Upserting {len(datapoints)} datapoints to streaming index")

        # Use IndexServiceClient for streaming upsert
        client = IndexServiceClient(
            client_options={"api_endpoint": f"{self.region}-aiplatform.googleapis.com"}
        )

        index_name = (
            f"projects/{self.project_id}/locations/{self.region}/indexes/{self.index_id}"
        )

        # Streaming upsert (works because index has STREAM_UPDATE enabled)
        request = UpsertDatapointsRequest(index=index_name, datapoints=datapoints)

        response = client.upsert_datapoints(request=request)
        print(f"✓ Successfully uploaded {len(datapoints)} datapoints")
        print(f"✓ Datapoints are immediately searchable")
        print(f"✓ Completed processing {len(documents)} documents")

    def _save_chunks_to_firestore(
        self, documents: List[Document], user_id: str, document_id: str, gcs_path: str
    ) -> None:
        """Save document chunks to Firestore."""
        if not documents:
            return

        print(f"Saving {len(documents)} chunks to Firestore...")

        batch = self.db.batch()
        filename = gcs_path.split("/")[-1]
        doc_title = (
            filename.rsplit(".pdf", 1)[0].split("_", 1)[-1]
            if "_" in filename
            else filename
        )

        for i, doc in enumerate(documents):
            chunk_id = str(uuid.uuid4())

            # Store chunks in TOP-LEVEL collection (not subcollection)
            # This matches the query code expectation in firestore_repo.py
            doc_ref = self.db.collection("chunks").document(chunk_id)

            batch.set(
                doc_ref,
                {
                    "chunk_id": chunk_id,
                    "user_id": user_id,
                    "document_id": document_id,
                    "text": doc.page_content,
                    "embedding": [],
                    "metadata": {
                        "chunk_type": doc.metadata.get("chunk_type", "unknown"),
                        "chunk_index": doc.metadata.get("chunk_index", i),
                        "document_title": doc_title,
                        "upload_date": firestore.SERVER_TIMESTAMP,
                    },
                    "created_at": firestore.SERVER_TIMESTAMP,
                },
            )

            doc.metadata["chunk_id"] = chunk_id

            if (i + 1) % 500 == 0:
                batch.commit()
                batch = self.db.batch()
                print(f"  Saved {i + 1}/{len(documents)} chunks")

        batch.commit()
        print(f"✓ Saved all {len(documents)} chunks to Firestore")
