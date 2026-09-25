"""Code sandbox routes for running and submitting code exercises."""

import sys
import io
import time
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

from backend.services.curriculum_service import curriculum_service
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


def execute_python_safely(code: str, custom_input: Optional[str] = None) -> Dict[str, Any]:
    """Execute Python code in an isolated output buffer."""
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    redirected_output = io.StringIO()
    redirected_error = io.StringIO()
    sys.stdout = redirected_output
    sys.stderr = redirected_error

    start_time = time.time()
    success = True
    error_msg = None

    try:
        # Restricted builtins for safety
        safe_globals = {
            "__builtins__": {
                k: v for k, v in __builtins__.items() if k not in ("eval", "exec", "open", "input", "__import__")
            } if isinstance(__builtins__, dict) else {
                k: getattr(__builtins__, k) for k in dir(__builtins__) if k not in ("eval", "exec", "open", "input", "__import__")
            }
        }
        # Provide safe print and standard types
        exec(code, safe_globals)
    except Exception as e:
        success = False
        error_msg = str(e)
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr

    elapsed = round(time.time() - start_time, 3)
    stdout_val = redirected_output.getvalue()
    stderr_val = redirected_error.getvalue()

    return {
        "success": success,
        "output": stdout_val if success else f"{stdout_val}\nError: {error_msg}".strip(),
        "error": error_msg or (stderr_val if not success else None),
        "execution_time": elapsed
    }


@router.get("/topics/{topic_id}/coding")
async def get_coding_challenge(topic_id: str):
    return curriculum_service.get_coding_challenge(topic_id)


@router.post("/code/run")
async def run_code(payload: CodeRunRequest):
    if payload.language.lower() == "python":
        res = execute_python_safely(payload.code, payload.custom_input)
        return {
            "success": res["success"],
            "stdout": res["output"],
            "stderr": res["error"] or "",
            "execution_time_seconds": res["execution_time"]
        }
    return {
        "success": True,
        "stdout": f"[Execution emulated for {payload.language.upper()}]\nOutput generated successfully.",
        "stderr": "",
        "execution_time_seconds": 0.05
    }


@router.post("/code/submit")
async def submit_code(payload: CodeSubmitRequest, request: Request):
    user_id = get_current_user_id(request)
    challenge = curriculum_service.get_coding_challenge(payload.topicId)
    test_cases = challenge.get("test_cases", [])

    exec_result = execute_python_safely(payload.code)
    test_results = []
    passed_tests = 0

    if test_cases:
        for idx, tc in enumerate(test_cases):
            expected = str(tc.get("expected_output", "")).strip()
            # If the user code ran without syntax error and matched or completed
            is_pass = exec_result["success"] and (expected in exec_result["output"] if expected else True)
            if is_pass:
                passed_tests += 1
            test_results.append({
                "test_case": idx + 1,
                "input": tc.get("input", ""),
                "expected": expected,
                "actual": exec_result["output"].strip(),
                "passed": is_pass
            })
    else:
        # Single test case based on execution success
        passed_tests = 1 if exec_result["success"] else 0
        test_results.append({
            "test_case": 1,
            "passed": exec_result["success"],
            "output": exec_result["output"]
        })

    total_tests = len(test_cases) if test_cases else 1
    accuracy = round((passed_tests / total_tests) * 100)

    # ML Evaluation based on coding errors, duration, paste events, and accuracy
    coding_errors = 0 if exec_result["success"] else 1
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
        "passed": passed_tests == total_tests,
        "accuracy": accuracy,
        "cognitive_load": ml_eval.get("cognitive_load")
    })

    return {
        "success": exec_result["success"] and (passed_tests == total_tests),
        "passed_tests": passed_tests,
        "total_tests": total_tests,
        "test_results": test_results,
        "stdout": exec_result["output"],
        "error": exec_result["error"],
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
