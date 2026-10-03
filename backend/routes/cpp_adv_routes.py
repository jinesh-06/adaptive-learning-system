"""Advanced C++ & STL Architecture Curriculum, Dashboard, and Progress Tracking Routes."""

import json
from pathlib import Path
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

from backend.services.state_store import state_store
from backend.services.curriculum_service import curriculum_service
from backend.services.ml_service import ml_service
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(prefix="/cpp-adv", tags=["cpp-adv"])

CPP_ADV_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "cpp_advanced_topics_data.json"
CPP_ADV_TOPICS: List[Dict[str, Any]] = []
CPP_ADV_TOPIC_MAP: Dict[str, Dict[str, Any]] = {}
TOPIC_METADATA: List[Dict[str, Any]] = []

MODULE_INFO = [
    {
        "id": "mod-cpp-adv-01",
        "number": 1,
        "numberDisplay": "01",
        "title": "Module 01: Templates & Generic Programming",
        "level": "Advanced",
        "estimatedHours": 2,
        "estimatedMinutes": 120,
        "description": "Build reusable and type-independent components using function templates, class templates, template parameters, specialization, and compile-time programming."
    },
    {
        "id": "mod-cpp-adv-02",
        "number": 2,
        "numberDisplay": "02",
        "title": "Module 02: STL Containers & Data Structures",
        "level": "Advanced",
        "estimatedHours": 3,
        "estimatedMinutes": 180,
        "description": "Master the C++ Standard Template Library containers and understand their internal behavior, memory characteristics, and performance trade-offs."
    },
    {
        "id": "mod-cpp-adv-03",
        "number": 3,
        "numberDisplay": "03",
        "title": "Module 03: Iterators & STL Algorithms",
        "level": "Advanced",
        "estimatedHours": 2.5,
        "estimatedMinutes": 150,
        "description": "Navigate STL containers efficiently and solve common programming problems using reusable algorithms and iterator-based operations."
    },
    {
        "id": "mod-cpp-adv-04",
        "number": 4,
        "numberDisplay": "04",
        "title": "Module 04: Lambda Expressions & Functional Programming",
        "level": "Advanced",
        "estimatedHours": 2,
        "estimatedMinutes": 120,
        "description": "Write concise, expressive, and reusable operations using lambda expressions, captures, function objects, and modern C++ functional programming tools."
    },
    {
        "id": "mod-cpp-adv-05",
        "number": 5,
        "numberDisplay": "05",
        "title": "Module 05: Smart Pointers & Memory Management",
        "level": "Advanced",
        "estimatedHours": 2.5,
        "estimatedMinutes": 150,
        "description": "Master modern C++ memory management through RAII, ownership semantics, smart pointers, and safe resource handling."
    },
    {
        "id": "mod-cpp-adv-06",
        "number": 6,
        "numberDisplay": "06",
        "title": "Module 06: Final Mini Project — STL-Based Task Management System",
        "level": "Advanced",
        "estimatedHours": 2,
        "estimatedMinutes": 120,
        "description": "Apply advanced C++ concepts to build a practical task management application using templates, STL containers, algorithms, lambdas, and smart pointers."
    }
]

if CPP_ADV_DATA_PATH.exists():
    try:
        with open(CPP_ADV_DATA_PATH, "r", encoding="utf-8") as f:
            _cpp_adv_data = json.load(f)
            CPP_ADV_TOPICS = _cpp_adv_data.get("topics", [])
            for t in CPP_ADV_TOPICS:
                CPP_ADV_TOPIC_MAP[t["id"]] = t
                TOPIC_METADATA.append({
                    "id": t["id"],
                    "number": t["number"],
                    "numberDisplay": t["numberDisplay"],
                    "moduleId": t.get("moduleId", "mod-cpp-adv-01"),
                    "moduleTitle": t.get("moduleTitle", "Module 01: Templates & Generic Programming"),
                    "title": t["title"],
                    "slug": t["slug"],
                    "difficulty": t["difficulty"],
                    "estimatedMinutes": t["estimatedMinutes"],
                    "desc": t.get("shortDescription", ""),
                    "shortDescription": t.get("shortDescription", ""),
                    "prerequisiteId": t.get("prerequisiteId")
                })
    except Exception as e:
        print(f"[cpp_adv_routes] Error loading C++ Advanced topics data: {e}")


class CppAdvProgressUpdatePayload(BaseModel):
    topic_id: str
    status: Optional[str] = "IN_PROGRESS"
    completion_pct: Optional[float] = None
    quiz_score: Optional[float] = None
    attempts_delta: Optional[int] = 0
    time_spent_delta: Optional[float] = 0.0


@router.get("")
@router.get("/dashboard")
async def get_cpp_adv_dashboard(request: Request):
    """Retrieve full dashboard overview for Advanced C++ & STL Architecture with live progress from SQLite."""
    user_id = get_current_user_id(request)
    raw_progress = state_store.get_user_course_progress(user_id, "cpp-adv")
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

    # Track module completion status to unlock subsequent modules
    module_stats = []
    prev_module_completed = True # Module 01 is unlocked by default

    all_processed_topics = []
    current_topic_id = TOPIC_METADATA[0]["id"] if TOPIC_METADATA else "top-cpp-adv-generic-programming-intro"
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
        "title": "Advanced C++ & STL Architecture",
        "subtitle": "Master modern C++ programming through generic programming, Standard Template Library containers, iterators, algorithms, lambda expressions, and smart pointers. Develop efficient, reusable, and memory-safe applications using modern C++ techniques.",
        "language": "cpp",
        "level": "Advanced",
        "difficulty": "Advanced",
        "total_modules": len(MODULE_INFO),
        "completed_modules": completed_modules_count,
        "total_topics": total_topics,
        "completed_topics": completed_count,
        "quizzes_completed": quiz_completed_count,
        "overall_progress": overall_progress,
        "current_topic_id": current_topic_id,
        "streak_days": 5,
        "estimated_remaining_minutes": remaining_minutes,
        "total_duration_hours": 14,
        "learning_signals_status": "Cognitive Engine Calibrated & Active",
        "modules": module_stats,
        "topics": all_processed_topics
    }


@router.get("/topic/{topic_id}")
async def get_cpp_adv_topic(topic_id: str):
    """Retrieve full interactive topic content including code examples, exercises, and quizzes."""
    topic = CPP_ADV_TOPIC_MAP.get(topic_id)
    if not topic:
        # Fallback aliases
        aliases = {
            "top-cpp-adv": TOPIC_METADATA[0]["id"] if TOPIC_METADATA else "top-cpp-adv-generic-programming-intro",
            "top-cpp-references-memory": TOPIC_METADATA[0]["id"] if TOPIC_METADATA else "top-cpp-adv-generic-programming-intro"
        }
        resolved = aliases.get(topic_id)
        if resolved and resolved in CPP_ADV_TOPIC_MAP:
            topic = CPP_ADV_TOPIC_MAP[resolved]

    if not topic:
        raise HTTPException(status_code=404, detail=f"C++ Advanced topic '{topic_id}' not found.")

    return {
        "success": True,
        "topic": topic
    }


@router.post("/progress")
async def update_cpp_adv_progress(payload: CppAdvProgressUpdatePayload, request: Request):
    """Persist user progress for a specific C++ Advanced topic into SQLite."""
    user_id = get_current_user_id(request)

    status = payload.status or "IN_PROGRESS"
    completion_pct = payload.completion_pct
    if completion_pct is None:
        completion_pct = 100.0 if status == "COMPLETED" else 50.0

    state_store.save_topic_progress(
        user_id=user_id,
        course_id="cpp-adv",
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


@router.post("/analyze-signals")
async def analyze_cpp_adv_signals(request: Request):
    """Evaluate cognitive telemetry signals for C++ Advanced learners."""
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

        # Evaluate using the ML cognitive load predictor
        ml_payload = {
            "time_spent_seconds": time_spent,
            "accuracy": quiz_score if quiz_score is not None else 75.0,
            "quiz_attempts": max(attempts, incorrect_quiz_attempts + 1),
            "backtracking": 3 if coding_failed else 0,
            "rereads": hints_used
        }
        eval_result = ml_service.evaluate(ml_payload)
        pred_level = str(eval_result.get("cognitive_load", "MEDIUM")).upper()

        # Incorporate learning struggle signals
        needs_adaptation = False
        recommended_mode = "STANDARD"
        reason = "Pacing and comprehension signals are optimal."
        prompt_message = None

        if (quiz_score is not None and quiz_score < 60) or hints_used >= 2 or incorrect_quiz_attempts >= 2 or coding_failed or attempts > 2 or pred_level == "HIGH":
            needs_adaptation = True
            recommended_mode = "SIMPLIFIED"
            reason = "High cognitive load detected. Shorter explanations, memory diagrams, and scaffolding recommended."
            prompt_message = "Your recent learning signals suggest that a simpler explanation may help. Would you like to explore this concept with a different explanation?"
        elif pred_level == "LOW" and (quiz_score is None or quiz_score >= 90):
            recommended_mode = "DETAILED"
            reason = "Rapid comprehension detected. Advanced memory diagrams and standard references available."
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
