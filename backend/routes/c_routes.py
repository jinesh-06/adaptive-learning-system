"""C Programming Foundations Curriculum, Dashboard, and Progress Tracking Routes."""

import json
from pathlib import Path
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

from backend.services.state_store import state_store
from backend.services.curriculum_service import curriculum_service
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(prefix="/c", tags=["c-fundamentals"])

C_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "c_topics_data.json"
C_TOPICS: List[Dict[str, Any]] = []
C_TOPIC_MAP: Dict[str, Dict[str, Any]] = {}
TOPIC_METADATA: List[Dict[str, Any]] = []

if C_DATA_PATH.exists():
    try:
        with open(C_DATA_PATH, "r", encoding="utf-8") as f:
            _c_data = json.load(f)
            C_TOPICS = _c_data.get("topics", [])
            for t in C_TOPICS:
                C_TOPIC_MAP[t["id"]] = t
                TOPIC_METADATA.append({
                    "id": t["id"],
                    "number": t["number"],
                    "numberDisplay": t["numberDisplay"],
                    "moduleId": t.get("moduleId", "mod-c-foundations"),
                    "moduleTitle": t.get("moduleTitle", "Module 01: Core Language Foundations"),
                    "title": t["title"],
                    "slug": t["slug"],
                    "difficulty": t["difficulty"],
                    "estimatedMinutes": t["estimatedMinutes"],
                    "desc": t.get("shortDescription", ""),
                    "shortDescription": t.get("shortDescription", ""),
                    "prerequisiteId": t.get("prerequisiteId")
                })
    except Exception as e:
        print(f"[c_routes] Error loading C topics data: {e}")


class CProgressUpdatePayload(BaseModel):
    topic_id: str
    status: Optional[str] = "IN_PROGRESS"
    completion_pct: Optional[float] = None
    quiz_score: Optional[float] = None
    attempts_delta: Optional[int] = 0
    time_spent_delta: Optional[float] = 0.0


@router.get("/fundamentals")
async def get_c_fundamentals_dashboard(request: Request):
    """Retrieve full dashboard overview for C Programming Foundations with live progress from SQLite."""
    user_id = get_current_user_id(request)
    raw_progress = state_store.get_user_course_progress(user_id, "c-beg")
    progress_map = {p["topic_id"]: p for p in raw_progress}

    completed_count = 0
    quiz_completed_count = 0
    total_time_spent = 0.0

    topics_output = []
    current_topic_id = TOPIC_METADATA[0]["id"] if TOPIC_METADATA else "top-c-intro"
    first_incomplete_found = False

    for idx, meta in enumerate(TOPIC_METADATA):
        t_id = meta["id"]
        prog = progress_map.get(t_id, {})
        status = prog.get("status", "NOT_STARTED")
        comp_pct = float(prog.get("completion_pct") or 0.0)
        quiz_score = prog.get("quiz_score")
        time_spent = float(prog.get("time_spent_seconds") or 0.0)
        total_time_spent += time_spent

        if status == "COMPLETED" or comp_pct >= 95.0:
            status = "COMPLETED"
            completed_count += 1
            if quiz_score is not None and quiz_score > 0:
                quiz_completed_count += 1
        elif status == "IN_PROGRESS" or comp_pct > 0.0:
            status = "IN_PROGRESS"
            if not first_incomplete_found:
                current_topic_id = t_id
                first_incomplete_found = True
        else:
            # Sequential topic unlock rule
            if idx == 0:
                status = "NOT_STARTED"
            elif idx > 0 and (topics_output[idx - 1]["status"] in ("COMPLETED", "IN_PROGRESS")):
                status = "NOT_STARTED"
            else:
                status = "LOCKED"

            if status != "LOCKED" and not first_incomplete_found:
                current_topic_id = t_id
                first_incomplete_found = True

        has_adaptation = state_store.get_adapted_lesson(user_id, t_id) is not None
        if has_adaptation and status != "COMPLETED":
            status = "ADAPTATION_AVAILABLE"

        topics_output.append({
            **meta,
            "status": status,
            "completion_percentage": round(comp_pct, 1),
            "quiz_score": quiz_score,
            "attempts": prog.get("attempts", 0),
            "time_spent_seconds": round(time_spent, 1),
            "has_adapted_lesson": has_adaptation
        })

    total_topics = len(TOPIC_METADATA)
    overall_progress = round((completed_count / total_topics) * 100) if total_topics > 0 else 0

    remaining_minutes = sum(
        t["estimatedMinutes"]
        for t in topics_output
        if t["status"] != "COMPLETED"
    )

    return {
        "title": "C Programming Foundations",
        "subtitle": "Master systems programming, hardware memory models, pointers, and manual memory management through 16 structured, cognitive load-aware topics.",
        "total_modules": 4,
        "total_topics": total_topics,
        "completed_topics": completed_count,
        "quizzes_completed": quiz_completed_count,
        "overall_progress": overall_progress,
        "current_topic_id": current_topic_id,
        "streak_days": 4,
        "estimated_remaining_minutes": remaining_minutes,
        "learning_signals_status": "Cognitive Engine Calibrated & Active",
        "topics": topics_output
    }


@router.get("/progress")
async def get_c_progress(request: Request):
    """Get raw progress for C course for current user."""
    user_id = get_current_user_id(request)
    raw_progress = state_store.get_user_course_progress(user_id, "c-beg")
    return {"course_id": "c-beg", "user_id": user_id, "progress": raw_progress}


@router.post("/progress")
async def update_c_progress(payload: CProgressUpdatePayload, request: Request):
    """Save progress for a C topic."""
    user_id = get_current_user_id(request)
    result = state_store.save_topic_progress(
        user_id=user_id,
        course_id="c-beg",
        topic_id=payload.topic_id,
        status=payload.status,
        completion_pct=payload.completion_pct,
        quiz_score=payload.quiz_score,
        attempts_delta=payload.attempts_delta or 0,
        time_spent_delta=payload.time_spent_delta or 0.0
    )
    return {"success": True, "progress": result}


@router.get("/topic/{topic_id}")
async def get_c_topic(topic_id: str):
    """Get topic details for a C topic."""
    topic = curriculum_service.get_topic_detail(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="C Topic not found")
    return topic
