"""Query processing business logic."""
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime

from vertexai.generative_models import GenerativeModel, GenerationConfig
from fastapi import HTTPException, Request

from app.repositories.firestore_repo import FirestoreRepository
from app.repositories.vector_repo import VectorRepository
from app.utils.embeddings import get_embedding
from app.utils.hipaa_audit import HIPAAAuditLogger


class QueryService:
    """Service for processing user queries with RAG."""

    def __init__(
        self,
        firestore_repo: FirestoreRepository,
        vector_repo: VectorRepository,
        llm_model_name: str = "gemini-2.0-flash-exp",
    ):
        """Initialize query service."""
        self.firestore_repo = firestore_repo
        self.vector_repo = vector_repo

        # Configure generation parameters
        generation_config = GenerationConfig(
            max_output_tokens=2048,  # Allow complete responses without cut-off
            temperature=0.7,
            top_p=0.9,
        )

        self.llm = GenerativeModel(llm_model_name, generation_config=generation_config)

    def process_query(
        self,
        question: str,
        user_id: str,
        chat_id: Optional[str] = None,
        top_k: int = 10,
        request: Optional[Request] = None,
    ) -> Dict[str, Any]:
        """
        Process a user query using RAG pipeline.

        Args:
            question: User's question
            user_id: User ID
            chat_id: Optional chat session ID
            top_k: Number of chunks to retrieve
            request: FastAPI request object (for audit logging)

        Returns:
            Dict with answer, sources, and chat_id

        Raises:
            HTTPException: If processing fails or no documents found
        """
        # 1. Check for processing documents
        self._check_processing_documents(user_id)

        # 2. Get or create chat
        chat = self._get_or_create_chat(user_id, chat_id)
        chat_id = chat["chat_id"]

        # 3. Enhance query with chat history context
        enhanced_question = self._enhance_query(question, chat_id)

        # 4. Generate query embedding from enhanced question
        query_embedding = get_embedding(enhanced_question)

        # 5. Search vector index
        # Increased from 100 to 200 to handle orphaned vectors from cleanup
        # This ensures we retrieve enough candidates to find valid chunks
        neighbors = self.vector_repo.find_neighbors(
            query_embedding=query_embedding, num_neighbors=200
        )

        if not neighbors:
            raise HTTPException(status_code=404, detail="No relevant documents found")

        # 6. Retrieve and filter chunks from Firestore
        chunks, sources = self._retrieve_user_chunks(neighbors, user_id, top_k)

        if not chunks:
            raise HTTPException(
                status_code=404,
                detail="No documents found for your account. Please upload a medical document first.",
            )

        # 7. Generate answer with LLM
        answer = self._generate_answer(question, chunks)

        # 8. Save messages to Firestore
        self._save_messages(chat_id, user_id, question, answer, sources)

        # 9. Update chat metadata
        self.firestore_repo.update_chat_timestamp(chat_id)
        self.firestore_repo.increment_message_count(chat_id, count=2)

        # 10. HIPAA Audit: Log PHI access via query
        if request:
            audit_logger = HIPAAAuditLogger(self.firestore_repo.db)
            document_ids = list(set(s.get("document_id") for s in sources if s.get("document_id")))
            audit_logger.log_query(
                user_id=user_id,
                query_text=question,
                documents_accessed=document_ids,
                request=request,
            )

        return {"answer": answer, "sources": sources, "chat_id": chat_id}

    def _enhance_query(self, question: str, chat_id: str) -> str:
        """
        Enhance query with chat history context to improve retrieval.

        Args:
            question: Original user question
            chat_id: Current chat session ID

        Returns:
            Enhanced question with context
        """
        # Get recent chat history (last 5 messages)
        messages = self.firestore_repo.get_chat_messages(chat_id, limit=5)

        # If no history, return original question
        if not messages or len(messages) <= 1:
            return question

        # Build conversation context (exclude current question)
        context_parts = []
        for msg in messages[:-1]:  # Exclude the last message (which is the current one)
            role = msg.get("role", "")
            content = msg.get("content", "")
            if role == "user":
                context_parts.append(f"User: {content}")
            elif role == "assistant":
                context_parts.append(f"Assistant: {content}")

        if not context_parts:
            return question

        conversation_context = "\n".join(context_parts)

        # Use LLM to rewrite question with context
        prompt = f"""Given the following conversation history and a new question, rewrite the question to be standalone and context-rich for better document retrieval.

Conversation History:
{conversation_context}

New Question: {question}

Instructions:
- Rewrite the question to include relevant context from the conversation history
- Make the question self-contained so it can be understood without the conversation history
- Keep medical terminology and specific details
- If the question already has enough context, return it as-is
- Keep the rewritten question concise (1-2 sentences max)

Rewritten Question:"""

        try:
            response = self.llm.generate_content(prompt)
            enhanced = response.text.strip()
            print(f"✓ Enhanced query: '{question}' → '{enhanced}'")
            return enhanced
        except Exception as e:
            print(f"Warning: Query enhancement failed, using original: {e}")
            return question

    def _check_processing_documents(self, user_id: str) -> None:
        """Check if user has documents still processing."""
        processing_docs = self.firestore_repo.get_processing_documents(user_id)

        if processing_docs:
            doc = processing_docs[0]
            doc_name = doc.get("title") or doc.get("filename", "your document")
            raise HTTPException(
                status_code=409,
                detail=f"Please wait - '{doc_name}' is still being processed. This usually takes 20-30 seconds. Try again in a moment!",
            )

    def _get_or_create_chat(
        self, user_id: str, chat_id: Optional[str]
    ) -> Dict[str, Any]:
        """Get existing chat or create new one."""
        if chat_id:
            chat = self.firestore_repo.get_chat(chat_id)
            if chat and chat.get("user_id") == user_id:
                return chat

        # Create new chat
        return self.firestore_repo.create_chat(user_id=user_id, title="New Chat")

    def _retrieve_user_chunks(
        self, neighbors: List[tuple], user_id: str, top_k: int
    ) -> tuple[List[str], List[Dict[str, Any]]]:
        """Retrieve chunks from Firestore and filter by user_id."""
        chunks = []
        sources = []

        for chunk_id, distance in neighbors:
            if len(chunks) >= top_k:
                break

            chunk_data = self.firestore_repo.get_chunk(chunk_id)

            if chunk_data and chunk_data.get("user_id") == user_id:
                chunks.append(chunk_data["text"])
                sources.append(
                    {
                        "id": chunk_id,
                        "distance": distance,
                        "metadata": chunk_data.get("metadata", {}),
                        "document_id": chunk_data.get("document_id"),
                    }
                )

        return chunks, sources

    def _generate_answer(self, question: str, chunks: List[str]) -> str:
        """Generate answer using LLM with retrieved context."""
        context = "\n\n".join(
            [f"Chunk {i + 1}:\n{chunk}" for i, chunk in enumerate(chunks)]
        )

        prompt = f"""You are a helpful medical assistant. Answer the question based ONLY on the provided medical document excerpts.

Question: {question}

Medical Document Excerpts:
{context}

Instructions:
- Provide a clear, accurate answer based on the excerpts above
- If the excerpts don't contain enough information to answer, say so
- Use medical terminology appropriately but explain complex terms
- Be concise but thorough
- Keep your response within 2048 tokens to ensure it displays completely without being cut off

Answer:"""

        response = self.llm.generate_content(prompt)
        return response.text

    def _save_messages(
        self,
        chat_id: str,
        user_id: str,
        question: str,
        answer: str,
        sources: List[Dict[str, Any]],
    ) -> None:
        """Save user and assistant messages to Firestore."""
        now_iso = datetime.now().isoformat()

        # Save user message
        user_message = {
            "message_id": str(uuid.uuid4()),
            "chat_id": chat_id,
            "user_id": user_id,
            "role": "user",
            "content": question,
            "timestamp": now_iso,
        }
        self.firestore_repo.create_message(user_message)

        # Save assistant message
        assistant_message = {
            "message_id": str(uuid.uuid4()),
            "chat_id": chat_id,
            "user_id": user_id,
            "role": "assistant",
            "content": answer,
            "timestamp": now_iso,
            "sources": sources,
        }
        self.firestore_repo.create_message(assistant_message)
