"""Platform stats, dashboard snapshots, visual roadmap, feedback, and search."""

from fastapi import APIRouter, Request, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from backend.services.state_store import state_store
from backend.services.curriculum_service import curriculum_service
from backend.services.rag_service import rag_service
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(tags=["stats_and_dashboard"])


class FeedbackPayload(BaseModel):
    topic_id: str
    feedback: str
    comment: Optional[str] = None


@router.get("/stats/platform")
async def get_platform_stats():
    return {
        "active_learners": 1280,
        "completed_lessons": 8450,
        "code_executions": 34200,
        "accuracy_rate": 87.4,
        "supported_languages": ["Python", "C", "C++", "Java"]
    }


@router.get("/dashboard/snapshot")
async def get_dashboard_snapshot(request: Request):
    user_id = get_current_user_id(request)
    recent_evals = state_store.get_adaptive_history(user_id, limit=1)
    current_load = recent_evals[0].get("cognitive_load", "MEDIUM") if recent_evals else "MEDIUM"
    content_mode = "SIMPLIFIED" if current_load == "HIGH" else "CONCISE" if current_load == "LOW" else "BALANCED"

    return {
        "user_id": user_id,
        "current_streak_days": 4,
        "topics_completed": 7,
        "total_quizzes_taken": 12,
        "average_quiz_score": 86,
        "current_cognitive_load": current_load,
        "current_content_mode": content_mode,
        "recommended_next_topic": "top-py-loops",
        "recommended_next_topic_title": "Loops and Iteration Constructs",
        "recent_activity": [
            {"type": "LESSON", "title": "Loops and Iteration Constructs", "date": "Today"},
            {"type": "QUIZ", "title": "Knowledge Check: Loops", "score": "90%", "date": "Yesterday"}
        ]
    }


@router.get("/dashboard/roadmap/{language}")
async def get_language_roadmap(language: str):
    courses = curriculum_service.get_courses(language=language)
    nodes = []
    order = 1
    for c in courses:
        for m in c.get("modules", []):
            for t in m.get("topics", []):
                nodes.append({
                    "id": t.get("id"),
                    "title": t.get("title"),
                    "module": m.get("title"),
                    "level": t.get("level"),
                    "order": order,
                    "status": t.get("status", "LOCKED")
                })
                order += 1
    return {
        "language": language,
        "total_milestones": len(nodes),
        "milestones": nodes
    }


@router.post("/feedback/submit")
async def submit_feedback(payload: FeedbackPayload, request: Request):
    user_id = get_current_user_id(request)
    state_store.record_feedback(user_id, payload.topic_id, payload.feedback, payload.comment)
    return {"success": True}


@router.get("/search")
async def global_search(q: str = Query(...), language: Optional[str] = Query(None)):
    """Hybrid search across curriculum topics and RAG knowledge base chunks."""
    results = []

    # 1. Search curriculum topics
    courses = curriculum_service.get_courses(language=language)
    for c in courses:
        for m in c.get("modules", []):
            for t in m.get("topics", []):
                if q.lower() in t.get("title", "").lower():
                    results.append({
                        "id": t.get("id"),
                        "title": t.get("title"),
                        "type": "lesson",
                        "language": c.get("language"),
                        "snippet": f"Lesson module: {m.get('title')}"
                    })

    # 2. Search RAG semantic chunks
    try:
        rag_chunks = rag_service.retrieve(query=q, course=language, top_k=3)
        for ch in rag_chunks:
            results.append({
                "id": ch.get("chunk_id"),
                "title": f"{ch.get('section', 'Concept')}",
                "type": "knowledge",
                "language": ch.get("course"),
                "snippet": ch.get("text", "")[:120] + "..."
            })
    except Exception:
        pass

    return results
