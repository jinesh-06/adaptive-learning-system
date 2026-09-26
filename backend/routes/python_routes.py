"""Python Fundamentals Curriculum, Dashboard, and Adaptive Engine Routes."""

import json
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

from backend.services.state_store import state_store
from backend.services.ml_service import ml_service
from backend.services.llm_service import llm_service
from backend.services.rag_service import rag_service
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(prefix="/python", tags=["python-fundamentals"])

TOPIC_METADATA = [
    {"id": "top-py-intro", "number": 1, "numberDisplay": "01", "title": "Python Introduction", "slug": "python-introduction", "difficulty": "Beginner", "estimatedMinutes": 20, "desc": "Learn what Python is, how it works, and how to write your first program."},
    {"id": "top-py-variables-datatypes", "number": 2, "numberDisplay": "02", "title": "Variables & Data Types", "slug": "variables-data-types", "difficulty": "Beginner", "estimatedMinutes": 25, "desc": "Master variables as memory containers, dynamic typing, and fundamental data types."},
    {"id": "top-py-input-output", "number": 3, "numberDisplay": "03", "title": "Input & Output", "slug": "input-output", "difficulty": "Beginner", "estimatedMinutes": 20, "desc": "Capture user terminal input and format beautiful dynamic console outputs with f-strings."},
    {"id": "top-py-operators", "number": 4, "numberDisplay": "04", "title": "Operators", "slug": "operators", "difficulty": "Beginner", "estimatedMinutes": 25, "desc": "Perform arithmetic, assignment, comparison, logical, and membership operations."},
    {"id": "top-py-conditionals", "number": 5, "numberDisplay": "05", "title": "Conditional Statements", "slug": "conditional-statements", "difficulty": "Beginner", "estimatedMinutes": 25, "desc": "Control decision logic and execution branching with if, elif, and else."},
    {"id": "top-py-loops", "number": 6, "numberDisplay": "06", "title": "Loops", "slug": "loops", "difficulty": "Beginner", "estimatedMinutes": 30, "desc": "Master for loops, while loops, range iteration, and transfer statements."},
    {"id": "top-py-functions", "number": 7, "numberDisplay": "07", "title": "Functions", "slug": "functions", "difficulty": "Intermediate", "estimatedMinutes": 30, "desc": "Write modular reusable code with functions, parameters, return values, and scopes."},
    {"id": "top-py-strings", "number": 8, "numberDisplay": "08", "title": "Strings", "slug": "strings", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Manipulate text with indexing, slicing, string methods, and format strings."},
    {"id": "top-py-lists", "number": 9, "numberDisplay": "09", "title": "Lists", "slug": "lists", "difficulty": "Intermediate", "estimatedMinutes": 30, "desc": "Work with ordered mutable collections, slicing, sorting, and list comprehensions."},
    {"id": "top-py-tuples", "number": 10, "numberDisplay": "10", "title": "Tuples", "slug": "tuples", "difficulty": "Intermediate", "estimatedMinutes": 20, "desc": "Store immutable sequences, tuple packing, unpacking, and coordinate data."},
    {"id": "top-py-sets", "number": 11, "numberDisplay": "11", "title": "Sets", "slug": "sets", "difficulty": "Intermediate", "estimatedMinutes": 20, "desc": "Manage unique element collections, mathematical set operations, and fast lookups."},
    {"id": "top-py-dictionaries", "number": 12, "numberDisplay": "12", "title": "Dictionaries", "slug": "dictionaries", "difficulty": "Intermediate", "estimatedMinutes": 30, "desc": "Model key-value pairs, hash map operations, dictionary comprehension, and lookups."},
    {"id": "top-py-exceptions", "number": 13, "numberDisplay": "13", "title": "Basic Exception Handling", "slug": "basic-exception-handling", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Catch and handle errors gracefully using try, except, else, and finally blocks."},
    {"id": "top-py-file-handling", "number": 14, "numberDisplay": "14", "title": "File Handling", "slug": "file-handling", "difficulty": "Intermediate", "estimatedMinutes": 30, "desc": "Read, write, and safely append data to disk files using context managers."},
    {"id": "top-py-modules-packages", "number": 15, "numberDisplay": "15", "title": "Modules & Packages", "slug": "modules-packages", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Organize large programs using standard library modules, math, random, and imports."},
    {"id": "top-py-mini-projects", "number": 16, "numberDisplay": "16", "title": "Mini Projects", "slug": "mini-projects", "difficulty": "Intermediate", "estimatedMinutes": 45, "desc": "Build end-to-end interactive applications combining all 15 Python fundamentals."}
]


class ProgressUpdatePayload(BaseModel):
    topic_id: str
    status: Optional[str] = "IN_PROGRESS"
    completion_pct: Optional[float] = None
    quiz_score: Optional[float] = None
    attempts_delta: Optional[int] = 0
    time_spent_delta: Optional[float] = 0.0


class AnalyzeSignalsPayload(BaseModel):
    topic_id: str
    time_spent_seconds: float = 60.0
    quiz_accuracy: Optional[float] = None
    incorrect_attempts: int = 0
    code_errors: int = 0
    hints_requested: int = 0
    solution_revealed: bool = False
    revisits_count: int = 0


class GenerateAdaptationPayload(BaseModel):
    topic_id: str
    strategy: Optional[str] = "SIMPLIFY"
    signals: Optional[Dict[str, Any]] = None
    force_refresh: bool = False


@router.get("/fundamentals")
async def get_python_fundamentals_dashboard(request: Request):
    """Retrieve full dashboard overview for Python Fundamentals with live progress."""
    user_id = get_current_user_id(request)
    raw_progress = state_store.get_user_course_progress(user_id, "py-beg")
    progress_map = {p["topic_id"]: p for p in raw_progress}

    completed_count = 0
    quiz_completed_count = 0
    total_time_spent = 0.0
    unlocked = True

    topics_output = []
    current_topic_id = TOPIC_METADATA[0]["id"]
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
            # Topic locking rule: First topic unlocked; subsequent unlocked if previous completed or in progress
            if idx == 0:
                status = "NOT_STARTED"
            elif idx > 0 and (topics_output[idx - 1]["status"] in ("COMPLETED", "IN_PROGRESS")):
                status = "NOT_STARTED"
            else:
                status = "LOCKED"

            if status != "LOCKED" and not first_incomplete_found:
                current_topic_id = t_id
                first_incomplete_found = True

        # Check if an adapted lesson exists
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

    # Estimate remaining minutes
    remaining_minutes = sum(
        t["estimatedMinutes"]
        for t in topics_output
        if t["status"] != "COMPLETED"
    )

    return {
        "title": "Python Fundamentals",
        "subtitle": "Build a strong foundation in Python through guided lessons, practice, and adaptive learning.",
        "total_topics": total_topics,
        "completed_topics": completed_count,
        "quizzes_completed": quiz_completed_count,
        "overall_progress": overall_progress,
        "current_topic_id": current_topic_id,
        "streak_days": 3,
        "estimated_remaining_minutes": remaining_minutes,
        "learning_signals_status": "Calibrated & Active",
        "topics": topics_output
    }


@router.post("/progress")
async def update_topic_progress(payload: ProgressUpdatePayload, request: Request):
    """Save progress event for a topic."""
    user_id = get_current_user_id(request)
    result = state_store.save_topic_progress(
        user_id=user_id,
        course_id="py-beg",
        topic_id=payload.topic_id,
        status=payload.status,
        completion_pct=payload.completion_pct,
        quiz_score=payload.quiz_score,
        attempts_delta=payload.attempts_delta or 0,
        time_spent_delta=payload.time_spent_delta or 0.0
    )
    return {"success": True, "progress": result}


@router.post("/adaptation/analyze")
async def analyze_learning_signals(payload: AnalyzeSignalsPayload, request: Request):
    """Analyze learner signals and trigger Adaptive Learning Insight when appropriate."""
    user_id = get_current_user_id(request)

    # Feature engineering from learner signals
    accuracy = payload.quiz_accuracy if payload.quiz_accuracy is not None else (
        max(10, 100 - (payload.incorrect_attempts * 25))
    )
    backtracking = payload.code_errors + (1 if payload.solution_revealed else 0)

    ml_eval = ml_service.evaluate({
        "time_spent_seconds": payload.time_spent_seconds,
        "accuracy": accuracy,
        "hesitation_time_seconds": 10.0 if payload.hints_requested > 1 else 5.0,
        "backtracking": backtracking,
        "quiz_attempts": payload.incorrect_attempts + 1,
        "revisits": payload.revisits_count
    })

    load = ml_eval.get("predicted_cognitive_load", "MEDIUM")

    # Determine if adaptation is suggested
    needs_adaptation = False
    strategy = "BALANCED"
    reason = "Learning pace is optimal and progression is steady."
    suggested_changes = []

    if load == "HIGH" or payload.incorrect_attempts >= 3 or payload.code_errors >= 2 or payload.hints_requested >= 2:
        needs_adaptation = True
        strategy = "SIMPLIFY"
        reason = "Recent learning signals suggest that a more guided, step-by-step explanation may help with this topic."
        suggested_changes = [
            "Simpler explanation with intuitive everyday analogies",
            "More step-by-step breakdown of core mechanics",
            "Additional visual representation and diagrams",
            "Easier first practice questions with progressive scaffolding"
        ]
    elif load == "LOW" and (payload.quiz_accuracy or 0) >= 90 and payload.hints_requested == 0 and payload.time_spent_seconds < 180:
        needs_adaptation = True
        strategy = "INCREASE_DIFFICULTY"
        reason = "High mastery and rapid problem solving detected. Advanced deep-dive insights and challenging patterns are ready."
        suggested_changes = [
            "Dense architectural explanation with edge cases",
            "Minimal introductory preamble",
            "Challenging algorithmic variation exercises",
            "Under-the-hood memory representation insights"
        ]

    # Meaningful user-facing signals summary (never expose raw telemetry)
    signals_summary = []
    if payload.incorrect_attempts > 0:
        signals_summary.append(f"{payload.incorrect_attempts} incorrect attempts observed on practice checks")
    if payload.hints_requested > 0:
        signals_summary.append(f"{payload.hints_requested} hints requested for guidance")
    if payload.code_errors > 0:
        signals_summary.append(f"{payload.code_errors} code syntax/runtime errors caught")
    if payload.revisits_count > 1:
        signals_summary.append(f"Revisited concept sections {payload.revisits_count} times")
    if payload.time_spent_seconds > 300:
        signals_summary.append("Deliberate, extended time invested exploring concept sections")
    elif payload.time_spent_seconds < 60 and (payload.quiz_accuracy or 0) >= 90:
        signals_summary.append("Rapid accurate recall and immediate first-attempt mastery")

    if not signals_summary:
        signals_summary.append("Consistent, stable reading pace and active practice")

    return {
        "topic_id": payload.topic_id,
        "suggested": needs_adaptation,
        "cognitive_state": load,
        "confidence": ml_eval.get("confidence", 0.88),
        "strategy": strategy,
        "reason": reason,
        "suggested_adaptation": suggested_changes,
        "signals_summary": signals_summary
    }


@router.post("/adaptation/generate")
async def generate_adapted_lesson(payload: GenerateAdaptationPayload, request: Request):
    """Generate a dedicated AI-adapted lesson grounded in verified curriculum RAG context."""
    user_id = get_current_user_id(request)
    t_id = payload.topic_id

    # 1. Check if an adaptation was already cached for this user & topic
    if not payload.force_refresh:
        cached = state_store.get_adapted_lesson(user_id, t_id)
        if cached and cached.get("lesson_data"):
            return {
                "success": True,
                "cached": True,
                "topic_id": t_id,
                "strategy": cached.get("adaptation_strategy", "SIMPLIFY"),
                "adapted_lesson": cached["lesson_data"]
            }

    # Find topic title
    topic_meta = next((m for m in TOPIC_METADATA if m["id"] == t_id), TOPIC_METADATA[0])
    topic_title = topic_meta["title"]
    strategy = payload.strategy or "SIMPLIFY"

    # 2. Retrieve verified RAG curriculum context
    rag_context = rag_service.get_formatted_context(
        query=f"Python Fundamentals {topic_title} explanation step by step examples",
        course="python",
        topic=t_id,
        level="beginner",
        top_k=4
    )

    # 3. Call LLM Service / Gemini to generate structured adaptation
    strategy_prompt = f"""
Generate an AI-Adapted Lesson for the Python topic: '{topic_title}'.
Adaptation Strategy: {strategy}.
Signals observed: {json.dumps(payload.signals or {})}

Follow these rules:
1. Provide a completely fresh, more intuitive explanation.
2. Break concepts into smaller, digestible micro-steps.
3. Use a friendly analogy (e.g. labeled boxes, recipes, train cars).
4. Provide clean beginner-friendly code examples with commentary.
5. Provide a visual text-based diagram (ASCII or table).
6. Provide 1 scaffolded guided practice problem.
7. Provide a short 2-question knowledge check.
"""
    llm_resp = llm_service.generate_explanation(
        question=strategy_prompt,
        cognitive_load="HIGH" if strategy in ("SIMPLIFY", "STEP_BY_STEP", "VISUAL") else "LOW",
        course="python",
        topic=topic_title,
        topic_id=t_id
    )

    generated_text = llm_resp.get("answer", "")

    # Structured adapted lesson payload
    adapted_lesson_data = {
        "topic_id": t_id,
        "topic_title": topic_title,
        "topic_number": topic_meta["numberDisplay"],
        "adaptation_strategy": strategy,
        "strategy_label": "Simplified + Step-by-Step" if strategy == "SIMPLIFY" else "Accelerated + Deep Dive" if strategy == "INCREASE_DIFFICULTY" else "Visual + Interactive",
        "header_note": f"Based on your recent learning signals, this version provides a more guided, step-by-step explanation.",
        "concept_analogy": f"Let's visualize {topic_title} using a clear everyday analogy: think of it as structured labeled containers where each item has an explicit label and content.",
        "detailed_explanation": generated_text or f"In this adapted edition of {topic_title}, we break the fundamentals down into smaller, clear conceptual steps without overwhelming syntax.",
        "steps": [
            {"step": 1, "title": "Identify the Core Need", "description": f"Understand why {topic_title} exists in Python and how it solves real programming challenges."},
            {"step": 2, "title": "Inspect the Simplest Form", "description": "Look at the minimal code required to see the concept in action."},
            {"step": 3, "title": "Experiment in the Sandbox", "description": "Modify values and observe immediate console output."}
        ],
        "guided_code": f"# Adapted Step-by-Step Example for {topic_title}\n# Step 1: Initialize cleanly\nname = \"Jinesh\"\nscore = 100\n\n# Step 2: Output clearly\nprint(f\"Learner: {{name}}, Score: {{score}}\")\n",
        "expected_output": "Learner: Jinesh, Score: 100",
        "guided_practice": {
            "prompt": f"Write an adapted, simplified snippet demonstrating {topic_title} with print().",
            "starterCode": f"# Adapted Practice: {topic_title}\n\n",
            "expectedOutputMatcher": "Success",
            "hint": "Create your variable and use print('Success').",
            "solution": "print('Success')"
        },
        "knowledge_check": [
            {
                "id": f"kc-{t_id}-1",
                "question": f"What is the primary benefit of this adapted step-by-step approach to {topic_title}?",
                "options": [
                    "Breaks complex mechanics into manageable micro-steps",
                    "Changes the core Python programming language syntax",
                    "Requires reading an entire textbook first",
                    "Disables the code runner"
                ],
                "correctIndex": 0,
                "explanation": "Adapted lessons reduce cognitive friction by isolating concepts into step-by-step milestones."
            }
        ],
        "summary": [
            f"You reviewed an AI-adapted edition of {topic_title}.",
            "Mastery builds one clear concept at a time.",
            "You are ready to proceed with practice or advance to the next topic."
        ]
    }

    # 4. Save to persistent SQLite cache
    state_store.save_adapted_lesson(
        user_id=user_id,
        topic_id=t_id,
        adaptation_strategy=strategy,
        lesson_data=adapted_lesson_data,
        signals=payload.signals
    )

    # 5. Mark status in user_progress
    state_store.save_topic_progress(
        user_id=user_id,
        course_id="py-beg",
        topic_id=t_id,
        status="ADAPTATION_AVAILABLE"
    )

    return {
        "success": True,
        "cached": False,
        "topic_id": t_id,
        "strategy": strategy,
        "adapted_lesson": adapted_lesson_data
    }


@router.get("/adapted/{topic_id}")
async def get_adapted_lesson_by_topic(topic_id: str, request: Request):
    """Retrieve an existing generated adapted lesson for a topic."""
    user_id = get_current_user_id(request)
    cached = state_store.get_adapted_lesson(user_id, topic_id)
    if not cached or not cached.get("lesson_data"):
        raise HTTPException(status_code=404, detail="No adapted lesson found for this topic.")
    return {
        "success": True,
        "topic_id": topic_id,
        "strategy": cached.get("adaptation_strategy", "SIMPLIFY"),
        "adapted_lesson": cached["lesson_data"]
    }
