"""C++ Modern Fundamentals Curriculum, Dashboard, and Progress Tracking Routes."""

import json
from pathlib import Path
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

from backend.services.state_store import state_store
from backend.services.curriculum_service import curriculum_service
from backend.services.ml_service import ml_service
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(prefix="/cpp", tags=["cpp-fundamentals"])

CPP_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "cpp_topics_data.json"
CPP_TOPICS: List[Dict[str, Any]] = []
CPP_TOPIC_MAP: Dict[str, Dict[str, Any]] = {}
TOPIC_METADATA: List[Dict[str, Any]] = []

if CPP_DATA_PATH.exists():
    try:
        with open(CPP_DATA_PATH, "r", encoding="utf-8") as f:
            _cpp_data = json.load(f)
            CPP_TOPICS = _cpp_data.get("topics", [])
            for t in CPP_TOPICS:
                CPP_TOPIC_MAP[t["id"]] = t
                TOPIC_METADATA.append({
                    "id": t["id"],
                    "number": t["number"],
                    "numberDisplay": t["numberDisplay"],
                    "moduleId": t.get("moduleId", "mod-cpp-intro-foundations"),
                    "moduleTitle": t.get("moduleTitle", "Module 01: C++ Introduction & Programming Foundations"),
                    "title": t["title"],
                    "slug": t["slug"],
                    "difficulty": t["difficulty"],
                    "estimatedMinutes": t["estimatedMinutes"],
                    "desc": t.get("shortDescription", ""),
                    "shortDescription": t.get("shortDescription", ""),
                    "prerequisiteId": t.get("prerequisiteId")
                })
    except Exception as e:
        print(f"[cpp_routes] Error loading C++ topics data: {e}")


class CppProgressUpdatePayload(BaseModel):
    topic_id: str
    status: Optional[str] = "IN_PROGRESS"
    completion_pct: Optional[float] = None
    quiz_score: Optional[float] = None
    attempts_delta: Optional[int] = 0
    time_spent_delta: Optional[float] = 0.0


@router.get("/fundamentals")
async def get_cpp_fundamentals_dashboard(request: Request):
    """Retrieve full dashboard overview for C++ Modern Fundamentals with live progress from SQLite."""
    user_id = get_current_user_id(request)
    raw_progress = state_store.get_user_course_progress(user_id, "cpp-beg")
    progress_map = {p["topic_id"]: p for p in raw_progress}

    completed_count = 0
    quiz_completed_count = 0
    total_time_spent = 0.0

    topics_output = []
    current_topic_id = TOPIC_METADATA[0]["id"] if TOPIC_METADATA else "top-cpp-intro"
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

        topics_output.append({
            **meta,
            "status": status,
            "completion_percentage": comp_pct,
            "quiz_score": quiz_score,
            "attempts": prog.get("attempts", 0),
            "time_spent_seconds": time_spent,
            "has_adapted_lesson": False
        })

    total_topics = len(TOPIC_METADATA)
    overall_progress = round((completed_count / total_topics) * 100) if total_topics > 0 else 0
    remaining_minutes = sum(
        t["estimatedMinutes"] for t in topics_output if t["status"] != "COMPLETED"
    )

    # Determine completed modules (Module 1: 0..7, Module 2: 8..15, Module 3: 16..23)
    mod1_done = all(t["status"] == "COMPLETED" for t in topics_output[0:8]) if len(topics_output) >= 8 else False
    mod2_done = all(t["status"] == "COMPLETED" for t in topics_output[8:16]) if len(topics_output) >= 16 else False
    mod3_done = all(t["status"] == "COMPLETED" for t in topics_output[16:24]) if len(topics_output) >= 24 else False
    completed_modules = sum([1 for m in [mod1_done, mod2_done, mod3_done] if m])

    return {
        "title": "C++ Modern Fundamentals",
        "subtitle": "Learn modern C++ programming from the ground up through structured lessons, interactive examples, hands-on coding exercises, quizzes, and adaptive explanations.",
        "language": "cpp",
        "level": "Beginner",
        "total_modules": 3,
        "completed_modules": completed_modules,
        "total_topics": total_topics,
        "completed_topics": completed_count,
        "quizzes_completed": quiz_completed_count,
        "overall_progress": overall_progress,
        "current_topic_id": current_topic_id,
        "streak_days": 5,
        "estimated_remaining_minutes": remaining_minutes,
        "total_duration_hours": 8,
        "learning_signals_status": "Calibrated & Active",
        "topics": topics_output
    }


@router.get("/topic/{topic_id}")
async def get_cpp_topic_detail(topic_id: str, request: Request):
    """Retrieve full curriculum details for a specific C++ topic."""
    # Check legacy aliases
    if topic_id in ("top-cpp-fundamentals", "top-cpp-intro"):
        topic_id = "top-cpp-intro"
    elif topic_id == "top-cpp-control-functions":
        topic_id = "top-cpp-conditional-statements"
    elif topic_id == "top-cpp-references-memory":
        topic_id = "top-cpp-references"
    elif topic_id == "top-cpp-oop":
        topic_id = "top-cpp-student-management-project"

    topic = CPP_TOPIC_MAP.get(topic_id)
    if not topic:
        topic = curriculum_service.get_topic_detail(topic_id)
        if not topic:
            raise HTTPException(status_code=404, detail=f"C++ topic {topic_id} not found")

    user_id = get_current_user_id(request)
    raw_progress = state_store.get_user_course_progress(user_id, "cpp-beg")
    progress_map = {p["topic_id"]: p for p in raw_progress}
    p = progress_map.get(topic_id, {})

    return {
        **topic,
        "user_progress": {
            "status": p.get("status", "NOT_STARTED"),
            "completion_pct": p.get("completion_pct", 0),
            "quiz_score": p.get("quiz_score"),
            "attempts": p.get("attempts", 0),
            "time_spent_seconds": p.get("time_spent_seconds", 0)
        }
    }


@router.post("/progress")
async def update_cpp_progress(payload: CppProgressUpdatePayload, request: Request):
    """Save user progress and quiz scores for a C++ topic."""
    user_id = get_current_user_id(request)
    state_store.save_topic_progress(
        user_id=user_id,
        course_id="cpp-beg",
        topic_id=payload.topic_id,
        status=payload.status,
        completion_pct=payload.completion_pct,
        quiz_score=payload.quiz_score,
        attempts_delta=payload.attempts_delta,
        time_spent_delta=payload.time_spent_delta
    )
    return {
        "success": True,
        "message": f"Updated C++ progress for {payload.topic_id}",
        "topic_id": payload.topic_id,
        "status": payload.status
    }


@router.post("/analyze-signals")
@router.post("/adaptation/analyze")
async def analyze_cpp_signals(request: Request):
    """Analyze learner behavioral signals and return cognitive load insights."""
    body = await request.json()
    user_id = get_current_user_id(request)
    topic_id = body.get("topic_id", "top-cpp-intro")

    eval_result = ml_service.evaluate({
        "timeSpentSeconds": body.get("time_spent_seconds", 60.0),
        "codingErrorCount": body.get("coding_error_count", 0),
        "accuracy": body.get("accuracy", 100),
        "backtracking": body.get("backtracking", 0),
        "quiz_attempts": body.get("quiz_attempts", 1),
        "hesitation_time_seconds": body.get("hesitation_time_seconds", 5.0)
    })

    state_store.record_adaptive_evaluation(user_id, topic_id, eval_result)

    return {
        "topic_id": topic_id,
        "cognitive_load": eval_result.get("cognitive_load", "MEDIUM"),
        "confidence": eval_result.get("confidence", 0.85),
        "action": eval_result.get("action", "MAINTAIN_PACE"),
        "recommendation": eval_result.get("recommendation", "Your cognitive load is optimal. Keep advancing in Modern C++!"),
        "features": eval_result.get("features", {})
    }
