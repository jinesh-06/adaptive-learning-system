"""Code sandbox routes for running and submitting code exercises."""

import sys
import io
import time
from fastapi import APIRouter, Request, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

from backend.services.curriculum_service import curriculum_service
from backend.services.code_executor import code_executor
from backend.services.ml_service import ml_service
from backend.services.state_store import state_store
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(tags=["coding"])


class CodeRunRequest(BaseModel):
    code: str
    language: Optional[str] = "python"
    custom_input: Optional[str] = None


class CodeSubmitRequest(BaseModel):
    topicId: str
    code: str
    language: Optional[str] = "python"
    codingTimeSeconds: Optional[float] = 30.0
    keystrokes: Optional[int] = 50
    pasteEvents: Optional[int] = 0


@router.get("/topics/{topic_id}/coding")
async def get_coding_challenge(topic_id: str, language: Optional[str] = Query("python")):
    return curriculum_service.get_coding_challenge(topic_id, language)


@router.post("/code/run")
async def run_code(payload: CodeRunRequest):
    res = code_executor.run_code(payload.code, payload.language, payload.custom_input)
    return {
        "success": res["success"],
        "stdout": res["output"],
        "stderr": res.get("error") or "",
        "compilation_error": res.get("compilation_error"),
        "execution_time_seconds": res.get("execution_time", 0.0),
        "execution_time_ms": res.get("execution_time_ms", 0),
        "status": res.get("status", "PASSED" if res["success"] else "RUNTIME_ERROR")
    }


@router.post("/code/submit")
async def submit_code(payload: CodeSubmitRequest, request: Request):
    user_id = get_current_user_id(request)
    challenge = curriculum_service.get_coding_challenge(payload.topicId, payload.language)
    test_cases = challenge.get("test_cases", [])

    eval_result = code_executor.evaluate_test_cases(payload.code, payload.language, test_cases)

    passed_tests = eval_result["passed_tests"]
    total_tests = eval_result["total_tests"]
    accuracy = round((passed_tests / total_tests) * 100) if total_tests > 0 else 0
    is_overall_pass = eval_result["success"]

    # ML Evaluation based on coding errors, duration, paste events, and accuracy
    coding_errors = 0 if is_overall_pass else 1
    ml_eval = ml_service.evaluate({
        "timeSpentSeconds": payload.codingTimeSeconds,
        "codingErrorCount": coding_errors,
        "accuracy": accuracy,
        "backtracking": coding_errors,
        "quiz_attempts": 1,
        "hesitation_time_seconds": 5.0
    })

    # Record telemetry & adaptive evaluation
    state_store.record_adaptive_evaluation(user_id, payload.topicId, ml_eval)
    state_store.record_telemetry(user_id, payload.topicId, "CODE_SUBMIT", payload.codingTimeSeconds, {
        "keystrokes": payload.keystrokes,
        "paste_events": payload.pasteEvents,
        "passed": is_overall_pass,
        "accuracy": accuracy,
        "cognitive_load": ml_eval.get("cognitive_load")
    })

    # Extract primary stdout / error
    stdout_display = eval_result.get("output") or (eval_result["details"][0]["actual"] if eval_result.get("details") else "")
    err_display = eval_result.get("error")

    return {
        "success": is_overall_pass,
        "is_passed": is_overall_pass,
        "status": eval_result["status"],
        "passed_tests": passed_tests,
        "total_tests": total_tests,
        "test_results": eval_result["details"],
        "details": eval_result["details"],
        "stdout": stdout_display,
        "error": err_display,
        "runtime_error": err_display if not is_overall_pass else None,
        "compilation_error": eval_result.get("compilation_error"),
        "execution_time_seconds": eval_result.get("execution_time", 0.0),
        "execution_time_ms": eval_result.get("execution_time_ms", 0),
        "cognitive_insight": {
            "cognitive_level": ml_eval.get("cognitive_level"),
            "cognitive_load": ml_eval.get("cognitive_load"),
            "confidence": ml_eval.get("confidence"),
            "content_mode": ml_eval.get("content_mode"),
            "recommended_action": ml_eval.get("recommended_action"),
            "reason": ml_eval.get("reason"),
            "contributing_factors": ml_eval.get("contributing_factors")
        }
    }
