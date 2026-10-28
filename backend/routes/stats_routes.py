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
    return state_store.get_learner_dashboard_stats(user_id)


@router.get("/dashboard/roadmap/{language}")
async def get_language_roadmap(language: str, request: Request):
    user_id = get_current_user_id(request)
    courses = curriculum_service.get_courses(language=language)
    nodes = []
    order = 1
    prev_unlocked_or_done = True
    for c in courses:
        for m in c.get("modules", []):
            for t in m.get("topics", []):
                t_id = t.get("id")
                prog_status = state_store.get_topic_progress(t_id, user_id=user_id, course_id=c.get("id"))
                if prog_status == "COMPLETED":
                    status = "COMPLETED"
                    prev_unlocked_or_done = True
                elif prog_status == "IN_PROGRESS":
                    status = "IN_PROGRESS"
                    prev_unlocked_or_done = False
                elif order == 1 or prev_unlocked_or_done:
                    status = "UNLOCKED"
                    prev_unlocked_or_done = False
                else:
                    status = "LOCKED"

                nodes.append({
                    "id": t_id,
                    "topic_id": t_id,
                    "title": t.get("title"),
                    "module": m.get("title"),
                    "module_title": m.get("title"),
                    "level": t.get("level"),
                    "order": order,
                    "order_index": order,
                    "status": status,
                    "load": "MEDIUM"
                })
                order += 1
    return {
        "success": True,
        "language": language,
        "total_milestones": len(nodes),
        "milestones": nodes,
        "roadmap": nodes
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
