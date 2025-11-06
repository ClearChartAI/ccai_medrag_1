# Running Backend Locally

## Overview

The backend has been **refactored into a modular architecture** (see `ARCHITECTURE.md`). The new structure makes local development even easier!

## One-Time Setup

1. **Install Python dependencies:**
```bash
cd Backend\query_api
pip install -r requirements.txt
```

2. **Authenticate with Google Cloud:**
```bash
gcloud auth application-default login
```

This creates local credentials so your backend can access Vertex AI, Firestore, etc.

## Running Locally

### Option 1: Use the batch file (Easiest)
```bash
cd Backend\query_api
run_local.bat
```

### Option 2: Manual command
```bash
cd Backend\query_api
uvicorn main:app --reload --host 127.0.0.1 --port 8080
```

## Testing

Backend will run on: `http://127.0.0.1:8080`

Test it's working:
```bash
# Health check
curl http://127.0.0.1:8080/health

# Root endpoint (shows API info)
curl http://127.0.0.1:8080/
```

## Frontend Connection

The frontend `.env` is already configured to use local backend:
```
VITE_API_URL=http://127.0.0.1:8080
```

## Development Workflow

1. **Start backend locally:** `run_local.bat`
2. **Start frontend:** `cd frontend && npm run dev`
3. **Make changes** to any file in `app/` directory:
   - `app/routes/*.py` - API endpoints
   - `app/services/*.py` - Business logic
   - `app/repositories/*.py` - Database operations
   - `app/models/*.py` - Request/response schemas
   - `app/utils/*.py` - Helper functions
4. **Backend auto-reloads** (thanks to `--reload` flag)
5. **Test in browser** immediately
6. **When satisfied, deploy to Cloud Run:**
   ```bash
   gcloud run deploy clearchartai-api --source . --region us-central1 --allow-unauthenticated
   ```

## Modular Architecture Benefits

### Before (Monolithic):
- ❌ 1000-line `main.py`
- ❌ Hard to find specific functionality
- ❌ Difficult to test

### After (Modular):
- ✅ Clean separation: routes, services, repositories, models, utils
- ✅ Easy to find and modify specific features
- ✅ Each component is independently testable
- ✅ **Auto-reload works for ALL files in `app/` directory**

## Example: Making Changes

### Modify the prompt for Gemini
**File**: `app/services/query_service.py`
**Function**: `_generate_answer()`

1. Edit the prompt text
2. Save the file
3. Server automatically reloads
4. Test immediately in browser

### Add rate limiting to an endpoint
**File**: `app/routes/query.py`

1. Change `@limiter.limit("100/minute")` to desired rate
2. Save the file
3. Server automatically reloads

### Change how many vector results to retrieve
**File**: `app/repositories/vector_repo.py`
**Function**: `find_neighbors()`

1. Modify `num_neighbors` parameter
2. Save the file
3. Server automatically reloads

## Directory Structure Quick Reference

```
app/
├── routes/          # HTTP endpoints (thin layer)
│   ├── query.py     # /query endpoint
│   ├── documents.py # /documents/* endpoints
│   └── health.py    # /health endpoint
│
├── services/        # Business logic (thick layer)
│   ├── query_service.py    # RAG pipeline
│   └── document_service.py # Document operations
│
├── repositories/    # Database access
│   ├── firestore_repo.py   # Firestore CRUD
│   └── vector_repo.py      # Vector search
│
├── models/          # Data schemas
│   ├── query.py     # QueryRequest, QueryResponse
│   └── auth.py      # TokenData, User
│
└── utils/           # Helpers
    ├── auth.py      # Authentication
    └── embeddings.py # Embedding generation
```

## Notes

- The `--reload` flag makes the server auto-restart when you save changes to **any** `.py` file
- All environment variables are loaded from `.env` file
- Document ingestion (Cloud Function) should still be tested by deploying, not locally
- Local backend uses the same Firestore, Vertex AI, and Cloud Storage as production
- The old monolithic code is backed up in `main_old.py` for reference

## Troubleshooting

### Import errors after refactoring
```bash
# Make sure you're in the right directory
cd Backend/query_api

# Check Python can find the app module
python -c "from app.config import Config; print('OK')"
```

### Port already in use
```bash
# Kill process on port 8080 (Windows)
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Auto-reload not working
- Make sure you're using `--reload` flag
- Check you're editing files in `app/` directory, not `main_old.py`
