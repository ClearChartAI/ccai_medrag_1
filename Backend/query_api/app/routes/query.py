"""Query endpoints for medical RAG."""
from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.query import QueryRequest, QueryResponse
from app.models.auth import TokenData
from app.utils.auth import get_current_user
from app.utils.user_profile import ensure_user_profile
from app.services.query_service import QueryService
from app.repositories.firestore_repo import FirestoreRepository
from app.repositories.vector_repo import VectorRepository
from app.config import Config

router = APIRouter(prefix="/query", tags=["query"])

# Rate limiting
limiter = Limiter(key_func=get_remote_address)


def get_query_service(config: Config = Depends(lambda: Config.from_env())):
    """Dependency to get QueryService instance."""
    firestore_repo = FirestoreRepository(project_id=config.project_id)
    vector_repo = VectorRepository(
        index_endpoint=config.index_endpoint,
        deployed_index_id=config.deployed_index_id,
    )
    return QueryService(firestore_repo=firestore_repo, vector_repo=vector_repo)


@router.post("", response_model=QueryResponse)
@limiter.limit("100/minute")
async def query_endpoint(
    request: Request,
    query_request: QueryRequest,
    current_user: TokenData = Depends(get_current_user),
    query_service: QueryService = Depends(get_query_service),
    firestore_repo: FirestoreRepository = Depends(
        lambda config=Depends(lambda: Config.from_env()): FirestoreRepository(
            project_id=config.project_id
        )
    ),
):
    """
    Process a medical query using RAG.

    - Ensures user profile exists
    - Retrieves relevant document chunks
    - Generates answer using Gemini
    - Saves chat history
    - Logs PHI access (HIPAA §164.312(b) - Audit Controls)
    """
    # Ensure user profile exists (creates if needed)
    await ensure_user_profile(current_user, firestore_repo)

    result = query_service.process_query(
        question=query_request.question,
        user_id=current_user.uid,
        chat_id=query_request.chat_id,
        top_k=query_request.top_k,
        request=request,
    )

    return QueryResponse(**result)
