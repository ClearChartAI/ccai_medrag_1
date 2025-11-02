"""FastAPI Query API for Medical RAG System."""
from fastapi import Depends, FastAPI, HTTPException
from fastapi import File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import os
import uuid
from datetime import datetime, timedelta

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from google.cloud import aiplatform
from google.cloud.aiplatform.matching_engine.matching_engine_index_endpoint import (
    MatchingEngineIndexEndpoint,
)
from google.cloud import firestore
from google.cloud.firestore_v1 import Increment
from google.cloud.firestore_v1.base_query import FieldFilter
from google.cloud import storage
import firebase_admin
from firebase_admin import auth as firebase_auth
from vertexai.language_models import TextEmbeddingModel
from vertexai.generative_models import GenerativeModel
import vertexai

from auth import verify_identity_platform_token

app = FastAPI(title="Medical RAG Query API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration from environment
PROJECT_ID = os.getenv("PROJECT_ID", "sunlit-adviser-471323-p0")
REGION = os.getenv("VERTEX_AI_REGION", "us-central1")
INDEX_ENDPOINT = os.getenv("VERTEX_INDEX_ENDPOINT")
DEPLOYED_INDEX_ID = os.getenv("DEPLOYED_INDEX_ID")

# Initialize Vertex AI
aiplatform.init(project=PROJECT_ID, location=REGION)
vertexai.init(project=PROJECT_ID, location=REGION)

# Models
embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-004")
llm = GenerativeModel("gemini-2.0-flash-exp")


class QueryRequest(BaseModel):
    question: str
    top_k: int = 10


class QueryResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
    chat_id: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    display_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class ProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = None


def ensure_user_profile(user_info: Dict[str, Any], db: firestore.Client) -> Dict[str, Any]:
    """
    Create or update user profile in Firestore.
    Called on every authenticated request to track activity.
    """

    user_id = user_info["sub"]
    email = user_info.get("email", "unknown@example.com")
    now = datetime.now()

    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        user_data = {
            "user_id": user_id,
            "email": email,
            "display_name": user_info.get("name", email.split("@")[0]),
            "photo_url": user_info.get("picture", ""),
            "auth_provider": user_info.get("auth_provider", "unknown"),
            "email_verified": user_info.get("email_verified", False),
            "created_at": now.isoformat(),
            "last_login": now.isoformat(),
            "login_count": 1,
            "document_count": 0,
            "query_count": 0,
            "chat_count": 0,
            "is_active": True,
            "subscription_tier": "free",
            "retention_policy_expires_at": (now + timedelta(days=365)).isoformat(),
        }
        user_ref.set(user_data)
        print(f"✓ Created new user profile: {email}")

        log_activity(db, user_id, "account_created", {"email": email})

        return user_data

    user_ref.update(
        {
            "last_login": now.isoformat(),
            "login_count": firestore.Increment(1),
        }
    )
    return user_doc.to_dict()


def log_activity(
    db: firestore.Client,
    user_id: str,
    action: str,
    details: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Log user activity for HIPAA compliance and audit trails.
    """

    log_id = str(uuid.uuid4())
    activity_log = {
        "log_id": log_id,
        "user_id": user_id,
        "action": action,
        "timestamp": datetime.now().isoformat(),
        "details": details or {},
    }

    db.collection("activity_logs").document(log_id).set(activity_log)


def get_or_create_chat(
    db: firestore.Client,
    user_id: str,
    chat_id: Optional[str] = None,
    first_message: Optional[str] = None,
    chat_title: Optional[str] = None,
) -> Dict[str, Any]:
    """Get existing chat or create new one."""

    if chat_id:
        chat_ref = db.collection("chats").document(chat_id)
        chat_doc = chat_ref.get()

        if not chat_doc.exists:
            raise HTTPException(status_code=404, detail="Chat not found")

        chat_data = chat_doc.to_dict()
        if chat_data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        return chat_data

    new_chat_id = str(uuid.uuid4())
    title = chat_title or "New Chat"
    if not chat_title and first_message:
        title_candidate = first_message[:50].split(".")[0]
        if len(title_candidate) >= 10:
            title = title_candidate
        elif first_message[:50]:
            title = first_message[:50]

    chat_data = {
        "chat_id": new_chat_id,
        "user_id": user_id,
        "title": title,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "message_count": 0,
        "last_message": None,
        "last_message_at": None,
    }

    db.collection("chats").document(new_chat_id).set(chat_data)
    db.collection("users").document(user_id).update({"chat_count": firestore.Increment(1)})
    log_activity(db, user_id, "chat_created", {"chat_id": new_chat_id, "title": title})
    print(f"✓ Created new chat: {new_chat_id} - {title}")

    return chat_data


def ensure_chat_belongs_to_user(
    db: firestore.Client, chat_id: str, user_id: str
) -> Dict[str, Any]:
    chat_ref = db.collection("chats").document(chat_id)
    chat_snapshot = chat_ref.get()

    if not chat_snapshot.exists:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat_data = chat_snapshot.to_dict()
    if chat_data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return chat_data


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user_info: Dict[str, Any] = Depends(verify_identity_platform_token),
):
    """Upload PDF to GCS and persist metadata for Cloud Function processing."""

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    print(f"Uploading: {file.filename}")

    try:
        storage_client = storage.Client(project=PROJECT_ID)
        bucket = storage_client.bucket("ccai-medrag-patient-uploads")
        db = firestore.Client(project=PROJECT_ID)

        ensure_user_profile(user_info, db)

        user_id = user_info["sub"]
        document_id = str(uuid.uuid4())
        blob_name = f"{user_id}/{document_id}_{file.filename}"

        blob = bucket.blob(blob_name)
        content = await file.read()
        blob.upload_from_string(content, content_type="application/pdf")

        gcs_path = f"gs://ccai-medrag-patient-uploads/{blob_name}"

        now_iso = datetime.now().isoformat()

        document_metadata = {
            "document_id": document_id,
            "user_id": user_id,
            "filename": file.filename,
            "title": file.filename.rsplit(".pdf", 1)[0],
            "gcs_path": gcs_path,
            "upload_date": now_iso,
            "file_size": len(content),
            "page_count": 0,
            "processing_status": "processed",
            "created_at": now_iso,
            "updated_at": now_iso,
        }

        doc_ref = db.collection("documents").document(document_id)
        doc_ref.set(document_metadata)

        print(f"✓ Uploaded to GCS: {gcs_path}")
        print("✓ Document marked as processed and ready")

        db.collection("users").document(user_id).update(
            {"document_count": firestore.Increment(1)}
        )

        log_activity(
            db,
            user_id,
            "document_uploaded",
            {
                "document_id": document_id,
                "filename": file.filename,
                "file_size": len(content),
            },
        )

        return {
            "message": "Document uploaded successfully and is ready to use.",
            "document": document_metadata,
        }

    except Exception as exc:
        print(f"Upload error: {exc}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/documents/{document_id}/status")
async def get_document_status(
    document_id: str,
    user_info: Dict[str, Any] = Depends(verify_identity_platform_token),
):
    """Return processing status and chunk count for a document."""

    user_id = user_info["sub"]
    db = firestore.Client(project=PROJECT_ID)

    ensure_user_profile(user_info, db)

    doc_ref = db.collection("documents").document(document_id)
    doc_snapshot = doc_ref.get()

    if not doc_snapshot.exists:
        raise HTTPException(status_code=404, detail="Document not found")

    doc_data = doc_snapshot.to_dict()

    if doc_data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    chunks_ref = db.collection("chunks").where(
        filter=FieldFilter("document_id", "==", document_id)
    )
    chunk_count = len(list(chunks_ref.stream()))

    return {
        "document_id": document_id,
        "status": doc_data.get("processing_status", "unknown"),
        "chunk_count": chunk_count,
        "page_count": doc_data.get("page_count", 0),
        "updated_at": doc_data.get("updated_at"),
    }


@app.post("/query", response_model=QueryResponse)
def query_documents(
    request: QueryRequest,
    chat_id: Optional[str] = None,
    user_info: Dict[str, Any] = Depends(verify_identity_platform_token),
):
    """Query the vector index, generate an answer, and persist chat history."""

    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    user_id = user_info.get("sub")
    db = firestore.Client(project=PROJECT_ID)

    ensure_user_profile(user_info, db)

    chat = get_or_create_chat(db, user_id, chat_id, request.question)
    chat_id = chat["chat_id"]

    print("📊 Query details:")
    print(f" - Received chat_id param: {chat_id if chat_id else 'None (will create new)'}")
    print(f" - Using chat_id: {chat['chat_id']}")
    print(f" - Chat title: {chat.get('title', 'N/A')}")
    print(f" - Message count: {chat.get('message_count', 0)}")

    print(f"Processing query for chat {chat_id}: {request.question}")

    print("Generating query embedding...")
    query_embedding_response = embedding_model.get_embeddings([request.question])
    query_embedding = query_embedding_response[0].values

    print(f"Searching index for top {request.top_k} matches...")
    endpoint = MatchingEngineIndexEndpoint(index_endpoint_name=INDEX_ENDPOINT)

    matches = endpoint.find_neighbors(
        deployed_index_id=DEPLOYED_INDEX_ID,
        queries=[query_embedding],
        num_neighbors=request.top_k,
    )

    if not matches or not matches[0]:
        raise HTTPException(status_code=404, detail="No relevant documents found")

    neighbors = matches[0]
    print(f"Found {len(neighbors)} matches")

    print("Retrieving chunk text from Firestore...")

    chunks = []
    sources = []

    for neighbor in neighbors:
        print(f"DEBUG: Vector search returned chunk_id: {neighbor.id}")
        doc_ref = db.collection("chunks").document(neighbor.id)
        doc_snap = doc_ref.get()

        if doc_snap.exists:
            data = doc_snap.to_dict()
            if data.get("user_id") == user_id:
                chunks.append(data["text"])
                sources.append(
                    {
                        "id": neighbor.id,
                        "distance": float(neighbor.distance),
                        "metadata": data.get("metadata", {}),
                        "document_id": data.get("document_id"),
                    }
                )

    if not chunks:
        raise HTTPException(status_code=404, detail="No chunk text found in Firestore")

    print(f"Retrieved {len(chunks)} chunks from Firestore")

    print("Generating answer with Gemini...")
    context = "\n\n".join([f"Chunk {i + 1}:\n{chunk}" for i, chunk in enumerate(chunks)])

    prompt = f"""You are a helpful medical assistant. Answer the question based ONLY on the provided medical document excerpts.

Question: {request.question}

Medical Document Excerpts:
{context}

Instructions:
- Provide a clear, accurate answer based on the excerpts above
- If the excerpts don't contain enough information to answer, say so
- Use medical terminology appropriately but explain complex terms
- Be concise but thorough

Answer:"""

    response = llm.generate_content(prompt)
    answer = response.text

    now_iso = datetime.now().isoformat()

    user_message_id = str(uuid.uuid4())
    user_message = {
        "message_id": user_message_id,
        "chat_id": chat_id,
        "user_id": user_id,
        "role": "user",
        "content": request.question,
        "timestamp": now_iso,
    }
    db.collection("messages").document(user_message_id).set(user_message)

    ai_message_id = str(uuid.uuid4())
    ai_message = {
        "message_id": ai_message_id,
        "chat_id": chat_id,
        "user_id": user_id,
        "role": "assistant",
        "content": answer,
        "timestamp": datetime.now().isoformat(),
        "sources": sources,
    }
    db.collection("messages").document(ai_message_id).set(ai_message)

    chat_ref = db.collection("chats").document(chat_id)
    chat_ref.update(
        {
            "last_message": request.question,
            "last_message_at": now_iso,
            "updated_at": datetime.now().isoformat(),
            "message_count": Increment(2),
        }
    )

    db.collection("users").document(user_id).update(
        {"query_count": firestore.Increment(1)}
    )

    log_activity(
        db,
        user_id,
        "query_executed",
        {
            "chat_id": chat_id,
            "question": request.question[:100],
            "sources_count": len(sources),
        },
    )

    print(f"✓ Query completed and messages saved for chat {chat_id}")

    return QueryResponse(answer=answer, sources=sources, chat_id=chat_id)


@app.get("/chats")
async def get_user_chats(
    user_info: Dict[str, Any] = Depends(verify_identity_platform_token),
):
    """Get all chats for the authenticated user."""

    user_id = user_info["sub"]
    db = firestore.Client(project=PROJECT_ID)

    ensure_user_profile(user_info, db)

    chats_ref = db.collection("chats").where(
        filter=FieldFilter("user_id", "==", user_id)
    )
    chats_stream = chats_ref.order_by(
        "updated_at", direction=firestore.Query.DESCENDING
    ).stream()

    chats = [chat.to_dict() for chat in chats_stream]

    return {"chats": chats, "count": len(chats)}


class ChatCreateRequest(BaseModel):
    title: Optional[str] = "New Chat"


@app.post("/chats")
async def create_chat(
    payload: ChatCreateRequest,
    user_info: Dict[str, Any] = Depends(verify_identity_platform_token),
):
    """Create a new chat for the authenticated user."""

    db = firestore.Client(project=PROJECT_ID)
    ensure_user_profile(user_info, db)
    title = payload.title or "New Chat"
    chat_data = create_chat_record(db, user_info["sub"], title)

    print(f"✓ Created new chat: {chat_data['chat_id']}")

    return {"chat": chat_data}


@app.get("/chats/{chat_id}/messages")
async def get_chat_messages(
    chat_id: str,
    user_info: Dict[str, Any] = Depends(verify_identity_platform_token),
):
    """Get all messages for a specific chat."""

    user_id = user_info["sub"]
    db = firestore.Client(project=PROJECT_ID)

    ensure_user_profile(user_info, db)
    ensure_chat_belongs_to_user(db, chat_id, user_id)

    messages_ref = db.collection("messages").where(
        filter=FieldFilter("chat_id", "==", chat_id)
    )
    messages_stream = messages_ref.order_by("timestamp").stream()

    messages = [message.to_dict() for message in messages_stream]

    return {"messages": messages, "count": len(messages)}


@app.delete("/chats/{chat_id}")
async def delete_chat(
    chat_id: str,
    user_info: Dict[str, Any] = Depends(verify_identity_platform_token),
):
    """Delete a chat and all its messages."""

    user_id = user_info["sub"]
    db = firestore.Client(project=PROJECT_ID)

    ensure_user_profile(user_info, db)
    ensure_chat_belongs_to_user(db, chat_id, user_id)

    messages_ref = db.collection("messages").where(
        filter=FieldFilter("chat_id", "==", chat_id)
    )
    for message in messages_ref.stream():
        message.reference.delete()

    db.collection("chats").document(chat_id).delete()

    print(f"✓ Deleted chat: {chat_id}")

    return {"message": "Chat deleted successfully"}


@app.patch("/chats/{chat_id}")
async def update_chat(
    chat_id: str,
    title: str,
    user_info: Dict[str, Any] = Depends(verify_identity_platform_token),
):
    """Update chat title for the authenticated user."""

    user_id = user_info["sub"]
    db = firestore.Client(project=PROJECT_ID)

    ensure_user_profile(user_info, db)
    ensure_chat_belongs_to_user(db, chat_id, user_id)

    db.collection("chats").document(chat_id).update(
        {"title": title, "updated_at": datetime.now().isoformat()}
    )

    return {"message": "Chat updated successfully"}
@app.get("/documents")
async def get_user_documents(
    user_info: Dict[str, Any] = Depends(verify_identity_platform_token),
):
    """Get all documents for the authenticated user."""

    user_id = user_info["sub"]
    db = firestore.Client(project=PROJECT_ID)

    ensure_user_profile(user_info, db)
    docs_ref = db.collection("documents").where(filter=FieldFilter("user_id", "==", user_id))
    docs_stream = docs_ref.order_by("created_at", direction=firestore.Query.DESCENDING).stream()

    documents = [doc.to_dict() for doc in docs_stream]

    return {"documents": documents, "count": len(documents)}


@app.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    user_info: Dict[str, Any] = Depends(verify_identity_platform_token),
):
    """Delete document and cascade to vector index, Firestore, and GCS."""

    user_id = user_info["sub"]
    db = firestore.Client(project=PROJECT_ID)

    ensure_user_profile(user_info, db)
    doc_ref = db.collection("documents").document(document_id)
    doc_snapshot = doc_ref.get()

    if not doc_snapshot.exists:
        raise HTTPException(status_code=404, detail="Document not found")

    doc_data = doc_snapshot.to_dict()
    if doc_data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    print(f"Deleting document {document_id}")

    chunks_ref = db.collection("chunks").where(
        filter=FieldFilter("document_id", "==", document_id)
    )
    chunks_stream = list(chunks_ref.stream())
    chunk_ids = [chunk.id for chunk in chunks_stream]

    print(f"Found {len(chunk_ids)} chunks to delete")

    if chunk_ids and INDEX_ENDPOINT:
        try:
            endpoint = MatchingEngineIndexEndpoint(index_endpoint_name=INDEX_ENDPOINT)
            endpoint.remove_datapoints(
                deployed_index_id=DEPLOYED_INDEX_ID,
                datapoint_ids=chunk_ids,
            )
            print(f"✓ Removed {len(chunk_ids)} vectors from index")
        except Exception as exc:
            print(f"Warning: Error removing from vector index: {exc}")

    for chunk in chunks_stream:
        chunk.reference.delete()
    print(f"✓ Deleted {len(chunk_ids)} chunks from Firestore")

    try:
        storage_client = storage.Client(project=PROJECT_ID)
        bucket = storage_client.bucket("ccai-medrag-patient-uploads")
        blob_path = doc_data["gcs_path"].replace("gs://ccai-medrag-patient-uploads/", "")
        blob = bucket.blob(blob_path)
        blob.delete()
        print(f"✓ Deleted from GCS: {blob_path}")
    except Exception as exc:
        print(f"Warning: Error deleting from GCS: {exc}")

    doc_ref.delete()
    print("✓ Deleted document metadata")

    db.collection("users").document(user_id).update(
        {"document_count": firestore.Increment(-1)}
    )

    log_activity(
        db,
        user_id,
        "document_deleted",
        {
            "document_id": document_id,
            "filename": doc_data.get("filename"),
            "chunks_deleted": len(chunk_ids),
        },
    )

    return {
        "message": "Document deleted successfully",
        "chunks_deleted": len(chunk_ids),
        "document_id": document_id,
    }


@app.post("/admin/cleanup-orphaned-vectors")
async def cleanup_orphaned_vectors(
    user_info: Dict[str, Any] = Depends(verify_identity_platform_token),
):
    """Analyze Firestore state to help find orphaned documents/vectors."""

    print("🧹 Starting orphaned vector analysis...")

    db = firestore.Client(project=PROJECT_ID)

    chunks_ref = db.collection("chunks")
    valid_chunk_ids = {chunk.id for chunk in chunks_ref.stream()}
    print(f"✓ Found {len(valid_chunk_ids)} valid chunks in Firestore")

    docs_ref = db.collection("documents")
    documents = list(docs_ref.stream())
    print(f"✓ Found {len(documents)} documents")

    orphaned_docs = []
    for doc in documents:
        doc_data = doc.to_dict()
        document_id = doc_data.get("document_id")

        doc_chunks_ref = db.collection("chunks").where(
            filter=FieldFilter("document_id", "==", document_id)
        )
        chunk_count = len(list(doc_chunks_ref.stream()))

        if chunk_count == 0:
            orphaned_docs.append(doc_data)
            print(f"Found orphaned document: {document_id} (0 chunks)")

    if orphaned_docs:
        print(f"⚠️ Found {len(orphaned_docs)} orphaned documents")
        return {
            "status": "analysis_complete",
            "valid_chunks": len(valid_chunk_ids),
            "total_documents": len(documents),
            "orphaned_documents": len(orphaned_docs),
            "orphaned_doc_ids": [doc["document_id"] for doc in orphaned_docs],
            "message": "Delete the orphaned documents to trigger cascade cleanup",
        }

    print("✓ No orphaned documents found")
    return {
        "status": "clean",
        "valid_chunks": len(valid_chunk_ids),
        "total_documents": len(documents),
        "message": "All documents have chunks. Old vectors will be ignored in queries.",
    }


@app.post("/auth/register")
async def register_user(request: RegisterRequest):
    """Register new user with email and password."""

    try:
        user_record = firebase_auth.create_user(
            email=request.email,
            password=request.password,
            display_name=request.display_name or request.email.split("@")[0],
            email_verified=False,
        )

        db = firestore.Client(project=PROJECT_ID)
        now = datetime.now()
        user_data = {
            "user_id": user_record.uid,
            "email": request.email,
            "display_name": request.display_name or request.email.split("@")[0],
            "photo_url": "",
            "auth_provider": "password",
            "email_verified": False,
            "created_at": now.isoformat(),
            "last_login": now.isoformat(),
            "login_count": 0,
            "document_count": 0,
            "query_count": 0,
            "chat_count": 0,
            "is_active": True,
            "subscription_tier": "free",
            "retention_policy_expires_at": (now + timedelta(days=365)).isoformat(),
        }

        db.collection("users").document(user_record.uid).set(user_data)
        log_activity(db, user_record.uid, "account_created", {"email": request.email})
        print(f"✓ Registered new user: {request.email}")

        return {
            "message": "User registered successfully",
            "user_id": user_record.uid,
            "email": request.email,
        }

    except firebase_auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="Email already registered")
    except Exception as exc:
        print(f"Registration error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/profile")
async def get_user_profile(
    user_info: Dict[str, Any] = Depends(verify_identity_platform_token),
):
    """Get current user's profile."""

    db = firestore.Client(project=PROJECT_ID)
    user_data = ensure_user_profile(user_info, db)
    return {"profile": user_data}


@app.patch("/profile")
async def update_user_profile(
    request: ProfileUpdateRequest,
    user_info: Dict[str, Any] = Depends(verify_identity_platform_token),
):
    """Update user profile - supports display_name updates."""

    db = firestore.Client(project=PROJECT_ID)
    user_id = user_info["sub"]

    updates: Dict[str, Any] = {}
    if request.display_name:
        updates["display_name"] = request.display_name

    try:
        firebase_auth.update_user(user_id, display_name=request.display_name)
        print(f"✓ Updated Firebase Auth display name for {user_id}")
    except Exception as e:
        print(f"Warning: Could not update Firebase Auth: {e}")

    if updates:
        updates["updated_at"] = datetime.now().isoformat()
        db.collection("users").document(user_id).update(updates)
        log_activity(db, user_id, "profile_updated", updates)
        print(f"✓ Updated Firestore profile for {user_id}: {updates}")
        return {
            "message": "Profile updated successfully",
            "updated_fields": list(updates.keys()),
        }

    return {"message": "No fields to update"}


@app.get("/activity")
async def get_user_activity(
    limit: int = 50,
    user_info: Dict[str, Any] = Depends(verify_identity_platform_token),
):
    """Get user's activity logs."""

    db = firestore.Client(project=PROJECT_ID)
    user_id = user_info["sub"]

    ensure_user_profile(user_info, db)

    logs_ref = (
        db.collection("activity_logs")
        .where(filter=FieldFilter("user_id", "==", user_id))
        .order_by("timestamp", direction=firestore.Query.DESCENDING)
        .limit(limit)
    )

    logs = [log.to_dict() for log in logs_ref.stream()]
    return {"activity": logs, "count": len(logs)}


@app.get("/admin/users")
async def list_all_users(
    user_info: Dict[str, Any] = Depends(verify_identity_platform_token),
):
    """List all users (admin only - add role checks in production)."""

    db = firestore.Client(project=PROJECT_ID)
    ensure_user_profile(user_info, db)

    users_ref = db.collection("users").order_by(
        "created_at", direction=firestore.Query.DESCENDING
    )
    users = [user.to_dict() for user in users_ref.stream()]

    return {"users": users, "count": len(users)}


@app.get("/admin/analytics")
async def get_system_analytics(
    user_info: Dict[str, Any] = Depends(verify_identity_platform_token),
):
    """Get system-wide analytics."""

    db = firestore.Client(project=PROJECT_ID)
    ensure_user_profile(user_info, db)

    users_count = len(list(db.collection("users").stream()))
    documents_count = len(list(db.collection("documents").stream()))
    chats_count = len(list(db.collection("chats").stream()))

    return {
        "total_users": users_count,
        "total_documents": documents_count,
        "total_chats": chats_count,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
