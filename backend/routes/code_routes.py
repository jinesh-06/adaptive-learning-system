"""Code sandbox routes for running and submitting code exercises."""

import sys
import io
import time
import os
from fastapi import APIRouter, Request, HTTPException, Query, Response, status
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

from backend.config import ENVIRONMENT
from backend.services.curriculum_service import curriculum_service
from backend.services.code_executor import code_executor
from backend.services.sandbox_service import (
    sandbox_service,
    ExecutionStatus,
    MAX_SOURCE_CODE_BYTES,
    MAX_STDIN_BYTES,
    SUPPORTED_LANGUAGES,
    rate_limiter
)
from backend.services.ml_service import ml_service
from backend.services.state_store import state_store
from backend.services.auth_service import auth_service
from backend.routes.auth_routes import get_current_user_id
from backend.routes.c_adv_routes import C_ADV_TOPIC_MAP

router = APIRouter(tags=["coding"])


class CodeRunRequest(BaseModel):
    code: str
    language: Optional[str] = "python"
    custom_input: Optional[str] = None


class CodeExecuteRequest(BaseModel):
    code: str
    language: Optional[str] = "python"
    stdin: Optional[str] = None
    custom_input: Optional[str] = None


class CodeSubmitRequest(BaseModel):
    topicId: str
    code: str
    language: Optional[str] = "python"
    codingTimeSeconds: Optional[float] = 30.0
    keystrokes: Optional[int] = 50
    pasteEvents: Optional[int] = 0


def _resolve_user_id(request: Request, strict_in_prod: bool = True) -> str:
    """Safely extract authenticated user identity from request context."""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.strip():
        identity = auth_service.verify_request(request)
        if not identity or not identity.user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required: Invalid or expired credentials."
            )
        return identity.user_id

    env = os.getenv("ENVIRONMENT", ENVIRONMENT).lower()
    if env == "production" and strict_in_prod:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required: Valid Bearer token must be provided."
        )

    # In development or test, allow dev headers or fallback guest
    if os.getenv("ALLOW_DEV_TEST_HEADERS", "false").lower() == "true":
        header_uid = request.headers.get("X-User-Id")
        if header_uid and header_uid.strip():
            return header_uid.strip()

    return "guest-learner"


def _validate_code_request(code: Any, language: Any, stdin_val: Any = None):
    """Validate request size, types, and language allowlist."""
    if not isinstance(code, str) or not code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "status": ExecutionStatus.INVALID_REQUEST.value,
                "error": "Source code must be a non-empty string."
            }
        )

    code_bytes = len(code.encode("utf-8"))
    if code_bytes > MAX_SOURCE_CODE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "status": ExecutionStatus.INVALID_REQUEST.value,
                "error": f"Source code size ({code_bytes} bytes) exceeds limit of {MAX_SOURCE_CODE_BYTES} bytes (64 KiB)."
            }
        )

    lang_str = str(language or "python").strip().lower()
    if lang_str not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "status": ExecutionStatus.UNSUPPORTED_LANGUAGE.value,
                "error": f"Unsupported language '{language}'. Supported languages: {sorted(list(SUPPORTED_LANGUAGES))}"
            }
        )

    if stdin_val is not None:
        stdin_bytes = len(str(stdin_val).encode("utf-8"))
        if stdin_bytes > MAX_STDIN_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "status": ExecutionStatus.INVALID_REQUEST.value,
                    "error": f"Standard input size ({stdin_bytes} bytes) exceeds limit of {MAX_STDIN_BYTES} bytes (64 KiB)."
                }
            )


@router.get("/topics/{topic_id}/coding")
async def get_coding_challenge(topic_id: str, language: Optional[str] = Query("python")):
    challenge = curriculum_service.get_coding_challenge(topic_id, language)
    if challenge and isinstance(challenge, dict) and "test_cases" in challenge:
        client_challenge = dict(challenge)
        client_challenge["test_cases"] = [
            tc for tc in challenge.get("test_cases", [])
            if not tc.get("is_hidden")
        ]
        return client_challenge
    return challenge


@router.post("/code/execute")
async def execute_code(payload: CodeExecuteRequest, request: Request, response: Response):
    """Phase 6/7 Standardized execution endpoint with strict sandboxing and telemetry."""
    user_id = _resolve_user_id(request, strict_in_prod=True)
    _validate_code_request(payload.code, payload.language, payload.stdin or payload.custom_input)

    # Rate limiting
    allowed, retry_after = rate_limiter.check_and_record(user_id)
    if not allowed:
        response.headers["Retry-After"] = str(retry_after)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "status": ExecutionStatus.INVALID_REQUEST.value,
                "error": f"Execution rate limit exceeded. Please wait {retry_after} seconds before submitting code again."
            }
        )

    stdin_input = payload.stdin if payload.stdin is not None else (payload.custom_input or "")
    res = sandbox_service.execute(
        language=payload.language or "python",
        code=payload.code,
        stdin_input=stdin_input,
        user_id=user_id
    )

    # Real-time user activities tracking
    try:
        state_store.record_telemetry(
            user_id=user_id,
            topic_id=None,
            event_type="CODE_EXECUTE",
            duration=res.execution_time_seconds,
            metadata={
                "language": payload.language,
                "status": res.status.value,
                "success": res.success,
                "exit_code": res.exit_code,
                "execution_time_ms": res.execution_time_ms
            }
        )
    except Exception:
        pass

    if res.status == ExecutionStatus.EXECUTOR_UNAVAILABLE:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "success": res.success,
        "status": res.status.value,
        "stdout": res.stdout,
        "stderr": res.stderr,
        "output": res.output or res.stdout,
        "error": res.error or res.stderr,
        "exit_code": res.exit_code,
        "compilation_error": res.compilation_error,
        "runtime_error": res.runtime_error,
        "execution_time_seconds": round(res.execution_time_seconds, 3),
        "execution_time_ms": res.execution_time_ms
    }


@router.post("/code/run")
async def run_code(payload: CodeRunRequest, request: Request, response: Response):
    """Run code with custom input, integrating sandbox isolation and real-time telemetry."""
    user_id = _resolve_user_id(request, strict_in_prod=False)
    _validate_code_request(payload.code, payload.language, payload.custom_input)

    # Rate limiting
    allowed, retry_after = rate_limiter.check_and_record(user_id)
    if not allowed:
        response.headers["Retry-After"] = str(retry_after)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Execution rate limit exceeded. Please wait {retry_after} seconds before submitting code again."
        )

    res = code_executor.run_code(payload.code, payload.language, payload.custom_input, user_id=user_id)

    # Real-time user activity telemetry
    try:
        state_store.record_telemetry(
            user_id=user_id,
            topic_id=None,
            event_type="CODE_RUN",
            duration=res.get("execution_time_seconds") or 0.0,
            metadata={
                "language": payload.language,
                "status": res.get("status"),
                "success": res.get("success")
            }
        )
    except Exception:
        pass

    return {
        "success": res.get("success", False),
        "stdout": res.get("stdout") or res.get("output") or "",
        "stderr": res.get("stderr") or res.get("error") or "",
        "output": res.get("output") or res.get("stdout") or "",
        "error": res.get("error") or res.get("stderr") or "",
        "compilation_error": res.get("compilation_error"),
        "runtime_error": res.get("runtime_error"),
        "execution_time_seconds": res.get("execution_time_seconds") or res.get("execution_time", 0.0),
        "execution_time_ms": res.get("execution_time_ms", 0),
        "status": res.get("status", "PASSED" if res.get("success") else "RUNTIME_ERROR"),
        "execution_status": res.get("execution_status", "SUCCESS" if res.get("success") else "RUNTIME_ERROR")
    }


@router.post("/code/submit")
async def submit_code(payload: CodeSubmitRequest, request: Request, response: Response):
    user_id = get_current_user_id(request)
    _validate_code_request(payload.code, payload.language)

    # Rate limiting
    allowed, retry_after = rate_limiter.check_and_record(user_id)
    if not allowed:
        response.headers["Retry-After"] = str(retry_after)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Submission rate limit exceeded. Please wait {retry_after} seconds before submitting code again."
        )

    challenge = curriculum_service.get_coding_challenge(payload.topicId, payload.language)
    test_cases = challenge.get("test_cases", []) if challenge else []

    # Safeguard against empty or missing test cases: never pass, never mark completed
    if not test_cases:
        no_tests_insight = {
            "cognitive_level": None,
            "cognitive_load": None,
            "confidence": None,
            "content_mode": None,
            "recommended_action": "No test cases configured.",
            "reason": "Challenge has no configured test cases.",
            "contributing_factors": []
        }
        return {
            "success": False,
            "is_passed": False,
            "status": "NO_TEST_CASES",
            "passed_tests": 0,
            "total_tests": 0,
            "test_results": [],
            "details": [],
            "stdout": "",
            "error": "No test cases configured for this challenge.",
            "runtime_error": None,
            "compilation_error": None,
            "execution_time_seconds": 0.0,
            "execution_time_ms": 0,
            "cognitive_insight": no_tests_insight,
            "adaptive_feedback": no_tests_insight
        }

    eval_result = code_executor.evaluate_test_cases(payload.code, payload.language, test_cases)

    # Extra safety: if evaluate_test_cases reported NO_TEST_CASES
    if eval_result.get("status") == "NO_TEST_CASES" or eval_result.get("total_tests", 0) == 0:
        no_tests_insight = {
            "cognitive_level": None,
            "cognitive_load": None,
            "confidence": None,
            "content_mode": None,
            "recommended_action": "No test cases configured.",
            "reason": "Challenge has no configured test cases.",
            "contributing_factors": []
        }
        return {
            "success": False,
            "is_passed": False,
            "status": "NO_TEST_CASES",
            "passed_tests": 0,
            "total_tests": 0,
            "test_results": [],
            "details": [],
            "stdout": "",
            "error": "No test cases configured for this challenge.",
            "runtime_error": None,
            "compilation_error": None,
            "execution_time_seconds": 0.0,
            "execution_time_ms": 0,
            "cognitive_insight": no_tests_insight,
            "adaptive_feedback": no_tests_insight
        }

    passed_tests = eval_result["passed_tests"]
    total_tests = eval_result["total_tests"]
    accuracy = round((passed_tests / total_tests) * 100) if total_tests > 0 else 0
    is_overall_pass = eval_result["success"] and total_tests > 0

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

    # Persist topic progress into SQLite user_progress table
    course_id = curriculum_service.get_course_id_for_topic(payload.topicId)

    if is_overall_pass:
        state_store.save_topic_progress(
            user_id=user_id,
            course_id=course_id,
            topic_id=payload.topicId,
            status="COMPLETED",
            completion_pct=100.0,
            attempts_delta=1,
            time_spent_delta=payload.codingTimeSeconds or 0.0
        )
    else:
        state_store.save_topic_progress(
            user_id=user_id,
            course_id=course_id,
            topic_id=payload.topicId,
            status="IN_PROGRESS",
            completion_pct=max(25.0, float(accuracy)),
            attempts_delta=1,
            time_spent_delta=payload.codingTimeSeconds or 0.0
        )

    # Extract primary stdout / error without leaking hidden test output
    visible_details = [d for d in eval_result.get("details", []) if not d.get("is_hidden")]
    first_visible_actual = visible_details[0].get("actual", "") if visible_details else ""
    stdout_display = eval_result.get("stdout") or first_visible_actual
    err_display = eval_result.get("error")

    # Double-ensure hidden test inputs/outputs are never returned across the wire
    sanitized_details = []
    for d in eval_result.get("details", []):
        if d.get("is_hidden"):
            sanitized_details.append({
                "test_case": d.get("test_case"),
                "input": "[Hidden]",
                "expected": "[Hidden]",
                "actual": "[Hidden]",
                "passed": d.get("passed", False),
                "is_hidden": True,
                "execution_time_ms": d.get("execution_time_ms", 0)
            })
        else:
            sanitized_details.append(d)

    cognitive_insight = {
        "cognitive_level": ml_eval.get("cognitive_level"),
        "cognitive_load": ml_eval.get("cognitive_load"),
        "confidence": ml_eval.get("confidence"),
        "content_mode": ml_eval.get("content_mode"),
        "recommended_action": ml_eval.get("recommended_action"),
        "reason": ml_eval.get("reason"),
        "contributing_factors": ml_eval.get("contributing_factors")
    }

    return {
        "success": is_overall_pass,
        "is_passed": is_overall_pass,
        "status": eval_result["status"],
        "passed_tests": passed_tests,
        "total_tests": total_tests,
        "test_results": sanitized_details,
        "details": sanitized_details,
        "stdout": stdout_display,
        "error": err_display,
        "runtime_error": err_display if not is_overall_pass else None,
        "compilation_error": eval_result.get("compilation_error"),
        "execution_time_seconds": eval_result.get("execution_time_seconds") or eval_result.get("execution_time", 0.0),
        "execution_time_ms": eval_result.get("execution_time_ms", 0),
        "cognitive_insight": cognitive_insight,
        "adaptive_feedback": cognitive_insight
    }
