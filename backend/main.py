"""Main FastAPI Application integrating ML, RAG, LLM, and Frontend APIs."""

import sys
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config import HOST, PORT
from backend.routes.auth_routes import router as auth_router
from backend.routes.curriculum_routes import router as curriculum_router
from backend.routes.quiz_routes import router as quiz_router
from backend.routes.code_routes import router as code_router
from backend.routes.telemetry_routes import router as telemetry_router
from backend.routes.adaptive_routes import router as adaptive_router
from backend.routes.ai_routes import router as ai_router
from backend.routes.admin_routes import router as admin_router
from backend.routes.stats_routes import router as stats_router
from backend.routes.project_routes import router as project_router
from backend.routes.diagnostic_routes import router as diagnostic_router
from backend.routes.user_routes import router as user_router

app = FastAPI(
    title="Cognitive Adaptive Learning API",
    description="Integrated API uniting ML cognitive load prediction, RAG knowledge retrieval, Gemini LLM, and interactive frontend learning flow.",
    version="1.0.0"
)

# CORS Middleware (allows Vite frontend dev server at port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Sub-router mounting all routers under /api
api_router = FastAPI()
api_router.include_router(auth_router)
api_router.include_router(curriculum_router)
api_router.include_router(quiz_router)
api_router.include_router(code_router)
api_router.include_router(telemetry_router)
api_router.include_router(adaptive_router)
api_router.include_router(ai_router)
api_router.include_router(admin_router)
api_router.include_router(stats_router)
api_router.include_router(project_router)
api_router.include_router(diagnostic_router)
api_router.include_router(user_router)

# Mount the /api sub-application
app.mount("/api", api_router)


@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Cognitive Adaptive Learning Platform Backend",
        "docs": "/docs",
        "api_root": "/api"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "modules": {
            "cognitive_engine": "active",
            "ml_classifier": "active",
            "rag_chromadb": "active",
            "gemini_llm": "active"
        }
    }


if __name__ == "__main__":
    import uvicorn
    print(f"Starting Adaptive Learning System Backend on {HOST}:{PORT}...")
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=False)
