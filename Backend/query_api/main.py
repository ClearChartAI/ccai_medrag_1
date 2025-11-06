"""
ClearChartAI Query API - Clean Entry Point

This is the main application entry point. All business logic has been
extracted to modular services, repositories, and routes.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from google.cloud import aiplatform
import vertexai

# Load environment variables
load_dotenv()

# Import configuration
from app.config import Config
from app.routes import query_router, documents_router, health_router, profile_router

# Initialize configuration
config = Config.from_env()

# Initialize Vertex AI (global initialization)
aiplatform.init(project=config.project_id, location=config.vertex_region)
vertexai.init(project=config.project_id, location=config.vertex_region)

# Create FastAPI app
app = FastAPI(
    title="ClearChartAI Medical RAG API",
    description="AI-powered medical document analysis and Q&A system",
    version="2.0.0",
)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(health_router)
app.include_router(query_router)
app.include_router(documents_router)
app.include_router(profile_router)


# Root endpoint
@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "service": "ClearChartAI Medical RAG API",
        "version": "2.0.0",
        "status": "healthy",
        "endpoints": {
            "health": "/health",
            "query": "/query",
            "documents": "/documents/*",
            "profile": "/profile",
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8080)
