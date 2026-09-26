"""Diagnostic Assessment routes for onboarding and placement testing with Cognitive Load Evaluation."""

from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime

from backend.services.curriculum_service import curriculum_service
from backend.services.ml_service import ml_service
from backend.services.state_store import state_store
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(prefix="/diagnostic", tags=["diagnostic"])


class DiagnosticSubmission(BaseModel):
    answers: Dict[str, int]
    time_spent: Optional[float] = 120.0
    observations: Optional[Dict[str, Any]] = None


@router.get("/{language}/questions")
async def get_diagnostic_questions(language: str):
    raw_questions = curriculum_service.get_diagnostic_questions(language=language)
    # Return questions with sanitized payload for client test taking
    client_questions = []
    for q in raw_questions:
        client_questions.append({
            "id": q.get("id"),
            "category": q.get("category", "concept"),
            "difficulty_weight": q.get("difficulty_weight", 1.0),
            "question": q.get("question"),
            "code_snippet": q.get("code_snippet"),
            "options": q.get("options", []),
            "concept": q.get("concept", language)
        })

    return {
        "language": language,
        "total_questions": len(client_questions),
        "questions": client_questions
    }


@router.post("/{language}/submit")
async def submit_diagnostic(language: str, payload: DiagnosticSubmission, request: Request):
    user_id = get_current_user_id(request)
    questions = curriculum_service.get_diagnostic_questions(language=language)

    correct_count = 0
    total = len(questions) if questions else 1
    
    category_totals: Dict[str, int] = {}
    category_correct: Dict[str, int] = {}
    breakdown: List[Dict[str, Any]] = []

    for q in questions:
        q_id = str(q.get("id"))
        cat = q.get("category", "concept")
        category_totals[cat] = category_totals.get(cat, 0) + 1

        user_choice = payload.answers.get(q_id)
        correct_idx = q.get("correct_index", 0)
        is_correct = user_choice is not None and user_choice == correct_idx

        if is_correct:
            correct_count += 1
            category_correct[cat] = category_correct.get(cat, 0) + 1

        breakdown.append({
            "id": q_id,
            "category": cat,
            "is_correct": is_correct,
            "user_choice": user_choice,
            "correct_index": correct_idx,
            "explanation": q.get("explanation", "Good effort reviewing this concept.")
        })

    score_pct = round((correct_count / total) * 100)

    # Category percentage scores
    def calc_cat_pct(cat_name: str) -> int:
        c_tot = category_totals.get(cat_name, 0)
        if c_tot == 0:
            return score_pct
        return round((category_correct.get(cat_name, 0) / c_tot) * 100)

    concept_score = calc_cat_pct("concept")
    ps_score = calc_cat_pct("problem_solving")
    coding_score = calc_cat_pct("coding_ability")

    # Extract test behavioral observations
    obs = payload.observations or {}
    switch_count = int(obs.get("revisions_count") or 0)
    avg_hesitation = float(obs.get("avg_hesitation_seconds") or 8.0)
    total_time_spent = float(payload.time_spent or 120.0)
    avg_time_per_q = round(total_time_spent / total, 1)

    # Feed test observations into Random Forest Cognitive Load Predictor
    ml_eval = ml_service.evaluate({
        "time_spent_seconds": total_time_spent,
        "accuracy": score_pct,
        "hesitation_time_seconds": avg_hesitation,
        "backtracking": switch_count,
        "quiz_attempts": 1,
        "scroll_speed": 1.5,
        "revisits": 1
    })

    predicted_load = ml_eval.get("predicted_cognitive_load", "MEDIUM")
    confidence = ml_eval.get("confidence", 0.88)
    contributing_factors = ml_eval.get("contributing_factors", [])

    # Map observations and score to Recommended Track & Cognitive Mode
    if score_pct >= 80 and predicted_load != "HIGH":
        recommended_level = "advanced"
        suggested_mode = "CONCISE"
    elif score_pct < 50 or predicted_load == "HIGH":
        recommended_level = "beginner"
        suggested_mode = "SIMPLIFIED"
    else:
        recommended_level = "intermediate"
        suggested_mode = "BALANCED"

    # Recommended starting topic based on language & calibrated track
    starting_topic_map = {
        "python": {
            "beginner": "top-py-fundamentals",
            "intermediate": "top-py-functions",
            "advanced": "top-py-recursion"
        },
        "c": {
            "beginner": "top-c-fundamentals",
            "intermediate": "top-c-pointers",
            "advanced": "top-c-structures"
        },
        "cpp": {
            "beginner": "top-cpp-fundamentals",
            "intermediate": "top-cpp-oop",
            "advanced": "top-cpp-containers"
        },
        "java": {
            "beginner": "top-java-fundamentals",
            "intermediate": "top-java-oop",
            "advanced": "top-java-collections"
        }
    }
    lang_key = language.lower()
    if lang_key in ("c++", "cpp"):
        lang_key = "cpp"
    starting_topic_id = starting_topic_map.get(lang_key, starting_topic_map["python"]).get(recommended_level, "top-py-fundamentals")

    # Update database preferences
    conn = state_store.get_connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT OR REPLACE INTO user_preferences (user_id, selected_language, current_level, preferred_mode)
           VALUES (?, ?, ?, ?)""",
        (user_id, language, recommended_level, "adaptive")
    )
    conn.commit()
    conn.close()

    # Record full telemetry
    state_store.record_telemetry(user_id, f"diagnostic_{language}", "DIAGNOSTIC_SUBMIT", total_time_spent, {
        "score_pct": score_pct,
        "concept_score": concept_score,
        "problem_solving_score": ps_score,
        "coding_score": coding_score,
        "predicted_cognitive_load": predicted_load,
        "recommended_level": recommended_level,
        "suggested_mode": suggested_mode,
        "switch_count": switch_count,
        "avg_time_per_q": avg_time_per_q
    })

    diagnostic_result = {
        "language": language,
        "total_score": score_pct,
        "concept_score": concept_score,
        "problem_solving_score": ps_score,
        "coding_score": coding_score,
        "recommended_level": recommended_level,
        "starting_topic_id": starting_topic_id,
        "cognitive_load": predicted_load,
        "suggested_mode": suggested_mode,
        "confidence": confidence,
        "contributing_factors": contributing_factors,
        "evaluated_at": datetime.utcnow().isoformat(),
        "observations": {
            "total_time_seconds": total_time_spent,
            "avg_seconds_per_question": avg_time_per_q,
            "revisions_count": switch_count,
            "predicted_load": predicted_load,
            "confidence": confidence
        }
    }

    return {
        "success": True,
        "score": correct_count,
        "total": total,
        "score_percentage": score_pct,
        "recommended_level": recommended_level,
        "suggested_content_mode": suggested_mode,
        "diagnostic_result": diagnostic_result,
        "question_breakdown": breakdown,
        "message": f"Diagnostic complete! Starting track calibrated to {recommended_level.capitalize()} with {suggested_mode} cognitive mode."
    }
