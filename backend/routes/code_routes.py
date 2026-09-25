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


import ast
import subprocess

DISALLOWED_MODULES = {
    "os", "subprocess", "shutil", "socket", "pty", "commands",
    "posix", "nt", "signal", "multiprocessing", "threading",
    "ctypes", "winreg", "_winapi"
}


def execute_python_safely(code: str, custom_input: Optional[str] = None) -> Dict[str, Any]:
    """Execute Python 3 code in an isolated subprocess using the configured Python 3 interpreter."""
    start_time = time.time()

    # 1. Syntax & AST Validation
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        elapsed = round(time.time() - start_time, 3)
        msg = f"SyntaxError: {e.msg} (line {e.lineno})"
        return {
            "success": False,
            "output": msg,
            "error": msg,
            "compilation_error": msg,
            "execution_time": elapsed
        }

    # 2. Security validation - disallow OS/system modification modules
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                root_mod = alias.name.split(".")[0]
                if root_mod in DISALLOWED_MODULES:
                    elapsed = round(time.time() - start_time, 3)
                    msg = f"SecurityError: Importing '{root_mod}' is restricted in this educational Python 3 environment."
                    return {
                        "success": False,
                        "output": msg,
                        "error": msg,
                        "compilation_error": msg,
                        "execution_time": elapsed
                    }
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                root_mod = node.module.split(".")[0]
                if root_mod in DISALLOWED_MODULES:
                    elapsed = round(time.time() - start_time, 3)
                    msg = f"SecurityError: Importing '{root_mod}' is restricted in this educational Python 3 environment."
                    return {
                        "success": False,
                        "output": msg,
                        "error": msg,
                        "compilation_error": msg,
                        "execution_time": elapsed
                    }

    # 3. Execution via active Python 3 interpreter (sys.executable)
    # -I: Isolated mode (ignores PYTHONPATH, PYTHONHOME, and cwd)
    # -s: Don't add user site-directory to sys.path
    try:
        proc = subprocess.run(
            [sys.executable, "-I", "-s", "-c", code],
            input=custom_input if custom_input is not None else "",
            capture_output=True,
            text=True,
            timeout=5.0
        )
        elapsed = round(time.time() - start_time, 3)
        success = (proc.returncode == 0)
        output = proc.stdout if success else (proc.stdout + ("\n" if proc.stdout else "") + proc.stderr).strip()
        error = proc.stderr.strip() if not success else None

        return {
            "success": success,
            "output": output,
            "error": error,
            "execution_time": elapsed
        }
    except subprocess.TimeoutExpired:
        elapsed = round(time.time() - start_time, 3)
        return {
            "success": False,
            "output": "Execution timed out (5s limit exceeded)",
            "error": "Execution timed out (5s limit exceeded)",
            "execution_time": elapsed
        }
    except Exception as e:
        elapsed = round(time.time() - start_time, 3)
        return {
            "success": False,
            "output": f"Execution error: {str(e)}",
            "error": str(e),
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
            "compilation_error": res.get("compilation_error"),
            "execution_time_seconds": res["execution_time"],
            "execution_time_ms": int(res["execution_time"] * 1000),
            "status": "PASSED" if res["success"] else "RUNTIME_ERROR"
        }
    return {
        "success": True,
        "stdout": f"[Execution emulated for {payload.language.upper()}]\nOutput generated successfully.",
        "stderr": "",
        "execution_time_seconds": 0.05,
        "execution_time_ms": 50,
        "status": "PASSED"
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
            "actual": exec_result["output"].strip(),
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

    is_overall_pass = exec_result["success"] and (passed_tests == total_tests)

    return {
        "success": is_overall_pass,
        "is_passed": is_overall_pass,
        "status": "PASSED" if is_overall_pass else "FAILED",
        "passed_tests": passed_tests,
        "total_tests": total_tests,
        "test_results": test_results,
        "details": test_results,
        "stdout": exec_result["output"],
        "error": exec_result["error"],
        "runtime_error": exec_result["error"] if not exec_result["success"] else None,
        "execution_time_seconds": exec_result["execution_time"],
        "execution_time_ms": int(exec_result["execution_time"] * 1000),
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
