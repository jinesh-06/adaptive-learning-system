"""Advanced C Systems & Data Structures Curriculum, Dashboard, and Progress Tracking Routes."""

import json
from pathlib import Path
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

from backend.services.state_store import state_store
from backend.services.curriculum_service import curriculum_service
from backend.services.ml_service import ml_service
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(prefix="/c-adv", tags=["c-advanced"])

C_ADV_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "c_advanced_topics_data.json"
C_ADV_TOPICS: List[Dict[str, Any]] = []
C_ADV_TOPIC_MAP: Dict[str, Dict[str, Any]] = {}
TOPIC_METADATA: List[Dict[str, Any]] = []
MODULE_INFO: List[Dict[str, Any]] = []

if C_ADV_DATA_PATH.exists():
    try:
        with open(C_ADV_DATA_PATH, "r", encoding="utf-8") as f:
            _c_adv_data = json.load(f)
            C_ADV_TOPICS = _c_adv_data.get("topics", [])
            MODULE_INFO = _c_adv_data.get("modules", [])
            for t in C_ADV_TOPICS:
                C_ADV_TOPIC_MAP[t["id"]] = t
                TOPIC_METADATA.append({
                    "id": t["id"],
                    "number": t["number"],
                    "numberDisplay": t["numberDisplay"],
                    "moduleId": t.get("moduleId", "mod-c-adv-structures"),
                    "moduleTitle": t.get("moduleTitle", "Module 1: Structures and Data Organization"),
                    "title": t["title"],
                    "slug": t["slug"],
                    "difficulty": t["difficulty"],
                    "estimatedMinutes": t["estimatedMinutes"],
                    "desc": t.get("shortDescription", ""),
                    "shortDescription": t.get("shortDescription", ""),
                    "prerequisiteId": t.get("prerequisiteId")
                })
    except Exception as e:
        print(f"[c_adv_routes] Error loading C Advanced topics data: {e}")


class CAdvProgressUpdatePayload(BaseModel):
    topic_id: str
    status: Optional[str] = "IN_PROGRESS"
    completion_pct: Optional[float] = None
    quiz_score: Optional[float] = None
    attempts_delta: Optional[int] = 0
    time_spent_delta: Optional[float] = 0.0


@router.get("")
@router.get("/dashboard")
async def get_c_adv_dashboard(request: Request):
    """Retrieve full dashboard overview for Advanced C Systems & Data Structures with live progress from SQLite."""
    user_id = get_current_user_id(request)
    raw_progress = state_store.get_user_course_progress(user_id, "c-advanced-systems")
    progress_map = {p["topic_id"]: p for p in raw_progress}

    completed_count = 0
    quiz_completed_count = 0
    total_time_spent = 0.0

    # Group topics by module
    module_topics_map: Dict[str, List[Dict[str, Any]]] = {}
    for m in MODULE_INFO:
        module_topics_map[m["id"]] = []

    for t in TOPIC_METADATA:
        m_id = t["moduleId"]
        if m_id not in module_topics_map:
            module_topics_map[m_id] = []
        module_topics_map[m_id].append(t)

    module_stats = []
    prev_module_completed = True # Module 01 is unlocked by default

    all_processed_topics = []
    current_topic_id = TOPIC_METADATA[0]["id"] if TOPIC_METADATA else "top-c-advanced-structures"
    first_incomplete_found = False

    for m_idx, m_info in enumerate(MODULE_INFO):
        m_id = m_info["id"]
        mod_topics = module_topics_map.get(m_id, [])
        mod_completed_count = 0
        mod_processed_topics = []

        is_module_unlocked = prev_module_completed

        for t_idx, meta in enumerate(mod_topics):
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
                mod_completed_count += 1
                if quiz_score is not None and quiz_score > 0:
                    quiz_completed_count += 1
            elif status == "IN_PROGRESS" or comp_pct > 0.0:
                status = "IN_PROGRESS"
                if not first_incomplete_found and is_module_unlocked:
                    current_topic_id = t_id
                    first_incomplete_found = True
            else:
                if not is_module_unlocked:
                    status = "LOCKED"
                else:
                    if t_idx == 0:
                        status = "NOT_STARTED"
                    elif mod_processed_topics[t_idx - 1]["status"] in ("COMPLETED", "IN_PROGRESS"):
                        status = "NOT_STARTED"
                    else:
                        status = "LOCKED"

                if status != "LOCKED" and not first_incomplete_found:
                    current_topic_id = t_id
                    first_incomplete_found = True

            processed_topic = {
                **meta,
                "status": status,
                "completion_percentage": comp_pct,
                "quiz_score": quiz_score,
                "attempts": prog.get("attempts", 0),
                "time_spent_seconds": time_spent,
                "has_adapted_lesson": False
            }
            mod_processed_topics.append(processed_topic)
            all_processed_topics.append(processed_topic)

        mod_total = len(mod_topics)
        mod_pct = round((mod_completed_count / mod_total) * 100) if mod_total > 0 else 0
        is_mod_done = (mod_completed_count == mod_total) and (mod_total > 0)

        module_stats.append({
            **m_info,
            "topicsCount": mod_total,
            "completedTopics": mod_completed_count,
            "completionPercentage": mod_pct,
            "isLocked": not is_module_unlocked,
            "is_locked": not is_module_unlocked,
            "isCompleted": is_mod_done,
            "is_completed": is_mod_done,
            "topics": mod_processed_topics
        })

        prev_module_completed = is_mod_done

    total_topics = len(TOPIC_METADATA)
    overall_progress = round((completed_count / total_topics) * 100) if total_topics > 0 else 0
    remaining_minutes = sum(
        t["estimatedMinutes"] for t in all_processed_topics if t["status"] != "COMPLETED"
    )

    completed_modules_count = sum(1 for m in module_stats if m["isCompleted"])

    return {
        "course_id": "c-advanced-systems",
        "title": "Advanced C Systems & Data Structures",
        "subtitle": "Master structures, unions, file handling, linked lists, stacks, queues, trees, searching, sorting, and low-level systems programming through practical C implementations.",
        "language": "c",
        "level": "Advanced",
        "difficulty": "Advanced",
        "total_modules": len(MODULE_INFO),
        "completed_modules": completed_modules_count,
        "total_topics": total_topics,
        "completed_topics": completed_count,
        "quizzes_completed": quiz_completed_count,
        "overall_progress": overall_progress,
        "current_topic_id": current_topic_id,
        "streak_days": 4,
        "estimated_remaining_minutes": remaining_minutes,
        "total_duration_hours": 14,
        "learning_signals_status": "Cognitive Engine Calibrated & Active",
        "modules": module_stats,
        "topics": all_processed_topics
    }


@router.get("/topic/{topic_id}")
async def get_c_adv_topic(topic_id: str):
    """Retrieve full interactive topic content including code examples, exercises, and quizzes."""
    topic = C_ADV_TOPIC_MAP.get(topic_id)
    if not topic:
        # Fallback aliases
        aliases = {
            "top-c-adv": TOPIC_METADATA[0]["id"] if TOPIC_METADATA else "top-c-advanced-structures",
            "top-c-structures": "top-c-advanced-structures",
            "top-c-files": "top-c-file-fundamentals"
        }
        resolved = aliases.get(topic_id)
        if resolved and resolved in C_ADV_TOPIC_MAP:
            topic = C_ADV_TOPIC_MAP[resolved]

    if not topic:
        raise HTTPException(status_code=404, detail=f"C Advanced topic '{topic_id}' not found.")

    return {
        "success": True,
        "topic": topic
    }


@router.post("/progress")
async def update_c_adv_progress(payload: CAdvProgressUpdatePayload, request: Request):
    """Persist user progress for a specific C Advanced topic into SQLite."""
    user_id = get_current_user_id(request)

    status = payload.status or "IN_PROGRESS"
    completion_pct = payload.completion_pct
    if completion_pct is None:
        completion_pct = 100.0 if status == "COMPLETED" else 50.0

    state_store.save_topic_progress(
        user_id=user_id,
        course_id="c-advanced-systems",
        topic_id=payload.topic_id,
        status=status,
        completion_pct=completion_pct,
        quiz_score=payload.quiz_score,
        attempts_delta=payload.attempts_delta or 0,
        time_spent_delta=payload.time_spent_delta or 0.0
    )

    return {
        "success": True,
        "message": f"Updated progress for topic {payload.topic_id}",
        "topic_id": payload.topic_id,
        "status": status,
        "completion_pct": completion_pct
    }


@router.get("/progress")
async def get_c_adv_progress_list():
    """Retrieve list of all C Advanced topics and statuses."""
    progress = []
    for t in TOPIC_METADATA:
        status = state_store.get_topic_progress(t["id"])
        progress.append({
            "topic_id": t["id"],
            "status": status,
            "completed": status == "COMPLETED"
        })
    return {"progress": progress}


@router.post("/analyze-signals")
async def analyze_c_adv_signals(request: Request):
    """Evaluate cognitive telemetry signals for Advanced C Systems learners."""
    try:
        body = await request.json()
        keystrokes = body.get("keystrokes", [])
        time_spent = body.get("timeSpent", body.get("time_spent", 60.0))
        attempts = body.get("attempts", 1)
        signals = body.get("signals", {})

        quiz_score = signals.get("quiz_score")
        hints_used = signals.get("hints_used", 0)
        incorrect_quiz_attempts = signals.get("incorrect_quiz_attempts", 0)
        coding_failed = signals.get("coding_challenge_failed", False)

        ml_payload = {
            "time_spent_seconds": time_spent,
            "accuracy": quiz_score if quiz_score is not None else 75.0,
            "quiz_attempts": max(attempts, incorrect_quiz_attempts + 1),
            "backtracking": 3 if coding_failed else 0,
            "rereads": hints_used
        }
        eval_result = ml_service.evaluate(ml_payload)
        pred_level = str(eval_result.get("cognitive_load", "MEDIUM")).upper()

        needs_adaptation = False
        recommended_mode = "STANDARD"
        reason = "Pacing and comprehension signals are optimal."
        prompt_message = None

        if (quiz_score is not None and quiz_score < 60) or hints_used >= 2 or incorrect_quiz_attempts >= 2 or coding_failed or attempts > 2 or pred_level == "HIGH":
            needs_adaptation = True
            recommended_mode = "SIMPLIFIED"
            reason = "High cognitive load detected. Shorter explanations, memory diagrams, and scaffolding recommended."
            prompt_message = "Your recent learning signals suggest that a simpler explanation with memory diagrams may help. Would you like to explore this concept with an adapted view?"
        elif pred_level == "LOW" and (quiz_score is None or quiz_score >= 90):
            recommended_mode = "DETAILED"
            reason = "Rapid comprehension detected. In-depth pointer mechanics and assembly layouts available."
            prompt_message = "Would you like to explore this concept with an advanced, in-depth architectural breakdown?"

        return {
            "cognitive_load": 0.85 if pred_level == "HIGH" else 0.20 if pred_level == "LOW" else 0.45,
            "cognitive_level": pred_level,
            "recommended_mode": recommended_mode,
            "reason": reason,
            "needs_adaptation": needs_adaptation,
            "prompt_message": prompt_message,
            "adaptation_options": [
                {"id": "STANDARD", "label": "Standard Explanation"},
                {"id": "SIMPLIFIED", "label": "Simplified Explanation"},
                {"id": "DETAILED", "label": "Detailed Explanation"},
                {"id": "EXAMPLES", "label": "Additional Examples"}
            ],
            "signals_analyzed": len(keystrokes) or 1
        }
    except Exception as e:
        return {
            "cognitive_load": 0.35,
            "recommended_mode": "STANDARD",
            "reason": f"Default fallback: {str(e)}",
            "needs_adaptation": False,
            "prompt_message": None,
            "signals_analyzed": 0
        }
