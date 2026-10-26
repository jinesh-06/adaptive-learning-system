"""Secure isolated code execution service supporting Python and Java.

Provides a production-grade, hardened container execution architecture
enforcing CPU quotas, memory limits, process-count caps, no-new-privileges,
dropped Linux capabilities, read-only root filesystems, network isolation,
bounded output streaming, execution timeouts, and reliable workspace cleanup.
"""

import os
import sys
import re
import time
import uuid
import shutil
import tempfile
import threading
import subprocess
from enum import Enum
from pathlib import Path
from dataclasses import dataclass, field
from typing import Dict, Any, Optional, List, Tuple
from collections import defaultdict

# -----------------------------------------------------------------------------
# Execution Status Model
# -----------------------------------------------------------------------------

class ExecutionStatus(str, Enum):
    """Standardized execution status values."""
    SUCCESS = "SUCCESS"
    COMPILE_ERROR = "COMPILE_ERROR"
    RUNTIME_ERROR = "RUNTIME_ERROR"
    TIMEOUT = "TIMEOUT"
    MEMORY_LIMIT_EXCEEDED = "MEMORY_LIMIT_EXCEEDED"
    OUTPUT_LIMIT_EXCEEDED = "OUTPUT_LIMIT_EXCEEDED"
    INVALID_REQUEST = "INVALID_REQUEST"
    UNSUPPORTED_LANGUAGE = "UNSUPPORTED_LANGUAGE"
    EXECUTOR_UNAVAILABLE = "EXECUTOR_UNAVAILABLE"
    INTERNAL_ERROR = "INTERNAL_ERROR"


@dataclass
class ExecutionResult:
    """Structured response object containing execution results."""
    success: bool
    status: ExecutionStatus
    stdout: str = ""
    stderr: str = ""
    exit_code: int = 0
    execution_time_seconds: float = 0.0
    execution_time_ms: int = 0
    compilation_error: Optional[str] = None
    runtime_error: Optional[str] = None
    output: str = ""
    error: Optional[str] = None
    details: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to frontend- and API-compatible dictionary."""
        # Map status to legacy frontend expectations where helpful
        legacy_status = "PASSED" if self.success else (
            "COMPILATION_ERROR" if self.status == ExecutionStatus.COMPILE_ERROR else (
                "TIME_LIMIT_EXCEEDED" if self.status == ExecutionStatus.TIMEOUT else self.status.value
            )
        )
        out_text = self.stdout if self.stdout else self.output
        err_text = self.stderr if self.stderr else self.error

        return {
            "success": self.success,
            "status": legacy_status,
            "execution_status": self.status.value,
            "stdout": out_text,
            "stderr": err_text or "",
            "output": out_text,
            "error": err_text,
            "compilation_error": self.compilation_error,
            "runtime_error": self.runtime_error,
            "exit_code": self.exit_code,
            "execution_time_seconds": round(self.execution_time_seconds, 3),
            "execution_time_ms": self.execution_time_ms,
            "details": self.details
        }


# -----------------------------------------------------------------------------
# Configuration and Resource Limits
# -----------------------------------------------------------------------------

# Source code & stdin limits
MAX_SOURCE_CODE_BYTES = int(os.getenv("SANDBOX_MAX_SOURCE_BYTES", 64 * 1024))  # 64 KiB
MAX_STDIN_BYTES = int(os.getenv("SANDBOX_MAX_STDIN_BYTES", 64 * 1024))          # 64 KiB
MAX_OUTPUT_BYTES = int(os.getenv("SANDBOX_MAX_OUTPUT_BYTES", 1024 * 1024))     # 1 MiB

# Timeouts (seconds)
DEFAULT_EXECUTION_TIMEOUT = float(os.getenv("SANDBOX_TIMEOUT_SECONDS", "5.0"))
DEFAULT_JAVA_COMPILE_TIMEOUT = float(os.getenv("SANDBOX_JAVA_COMPILE_TIMEOUT", "8.0"))

# Container isolation constraints
CONTAINER_RUNTIME = os.getenv("SANDBOX_CONTAINER_RUNTIME", os.getenv("CONTAINER_RUNTIME", "docker")).strip().lower()
SANDBOX_IMAGE = os.getenv("SANDBOX_CONTAINER_IMAGE", os.getenv("SANDBOX_IMAGE", "adaptive-learning-sandbox:latest")).strip()
SANDBOX_CPU_LIMIT = os.getenv("SANDBOX_CPU_LIMIT", "1.0")
SANDBOX_MEMORY_LIMIT = os.getenv("SANDBOX_MEMORY_LIMIT", "128m")
SANDBOX_JAVA_MEMORY_LIMIT = os.getenv("SANDBOX_JAVA_MEMORY_LIMIT", "256m")
SANDBOX_PIDS_LIMIT = int(os.getenv("SANDBOX_PIDS_LIMIT", "32"))

# Rate limiting & concurrency
RATE_LIMIT_PER_MINUTE = int(os.getenv("SANDBOX_RATE_LIMIT_PER_MIN", "30"))
MAX_CONCURRENT_EXECUTIONS = int(os.getenv("SANDBOX_MAX_CONCURRENCY", "8"))

# Language allowlist
SUPPORTED_LANGUAGES = {"python", "py", "java", "c", "cpp"}


# -----------------------------------------------------------------------------
# Concurrency and Rate Limiting Managers
# -----------------------------------------------------------------------------

class UserRateLimiter:
    """Sliding-window in-memory per-user execution rate limiter."""

    def __init__(self, limit_per_minute: int = RATE_LIMIT_PER_MINUTE):
        self.limit = limit_per_minute
        self.user_requests: Dict[str, List[float]] = defaultdict(list)
        self._lock = threading.Lock()

    def check_and_record(self, user_id: str) -> Tuple[bool, int]:
        """Check if user is within rate limit; returns (is_allowed, retry_after_seconds)."""
        now = time.time()
        window_start = now - 60.0

        with self._lock:
            # Purge timestamps outside the 1-minute window
            timestamps = [t for t in self.user_requests[user_id] if t > window_start]
            if len(timestamps) >= self.limit:
                oldest_in_window = timestamps[0]
                retry_after = max(1, int(60.0 - (now - oldest_in_window)))
                self.user_requests[user_id] = timestamps
                return False, retry_after

            timestamps.append(now)
            self.user_requests[user_id] = timestamps
            return True, 0


class ConcurrencyGuard:
    """Semaphore guard limiting the maximum number of simultaneous executions."""

    def __init__(self, max_concurrent: int = MAX_CONCURRENT_EXECUTIONS):
        self.max_concurrent = max_concurrent
        self._semaphore = threading.BoundedSemaphore(max_concurrent)

    def acquire(self, timeout: float = 2.0) -> bool:
        """Acquire execution slot."""
        return self._semaphore.acquire(timeout=timeout)

    def release(self):
        """Release execution slot."""
        try:
            self._semaphore.release()
        except ValueError:
            pass


rate_limiter = UserRateLimiter()
concurrency_guard = ConcurrencyGuard()


# -----------------------------------------------------------------------------
# Base Sandbox Driver Interface
# -----------------------------------------------------------------------------

class BaseSandboxDriver:
    """Abstract interface for execution sandboxes."""

    def is_available(self) -> bool:
        raise NotImplementedError

    def execute(
        self,
        language: str,
        code: str,
        stdin_input: str = "",
        timeout: float = DEFAULT_EXECUTION_TIMEOUT
    ) -> ExecutionResult:
        raise NotImplementedError


# -----------------------------------------------------------------------------
# Docker / Container Hardened Sandbox Driver
# -----------------------------------------------------------------------------

class DockerSandboxDriver(BaseSandboxDriver):
    """Production-grade container isolation runner.

    Executes student code strictly inside unprivileged, ephemeral Linux containers
    with dropped capabilities, memory caps, CPU quotas, process limits, read-only
    root filesystem, no network access, and bounded output capture.
    """

    def __init__(self, runtime: str = CONTAINER_RUNTIME, image: str = SANDBOX_IMAGE):
        self.runtime = runtime
        self.image = image
        self._available_cache: Optional[bool] = None
        self._cache_time: float = 0.0

    def is_available(self) -> bool:
        """Check whether container runtime is installed, in PATH, and responding."""
        now = time.time()
        if self._available_cache is not None and (now - self._cache_time) < 15.0:
            return self._available_cache

        runtime_bin = shutil.which(self.runtime)
        if not runtime_bin:
            self._available_cache = False
            self._cache_time = now
            return False

        try:
            # Check daemon connectivity using 'docker info'
            res = subprocess.run(
                [self.runtime, "info"],
                capture_output=True,
                text=True,
                timeout=3.0
            )
            if res.returncode != 0:
                self._available_cache = False
                self._cache_time = now
                return False

            # Check if sandbox image exists locally
            img_res = subprocess.run(
                [self.runtime, "image", "inspect", self.image],
                capture_output=True,
                text=True,
                timeout=3.0
            )
            is_ok = (img_res.returncode == 0)
            self._available_cache = is_ok
            self._cache_time = now
            return is_ok
        except Exception:
            self._available_cache = False
            self._cache_time = now
            return False

    def execute(
        self,
        language: str,
        code: str,
        stdin_input: str = "",
        timeout: float = DEFAULT_EXECUTION_TIMEOUT
    ) -> ExecutionResult:
        """Execute user program inside an ephemeral hardened container."""
        if not self.is_available():
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.EXECUTOR_UNAVAILABLE,
                error=(
                    "Container execution runtime is unavailable. "
                    "Docker/Podman daemon is not responding or not installed. "
                    "In production, arbitrary code execution on the host is strictly disallowed."
                ),
                output="EXECUTOR_UNAVAILABLE: Sandbox container runtime is offline."
            )

        lang = language.lower()
        if lang in ("python", "py"):
            return self._execute_python(code, stdin_input, timeout)
        elif lang in ("java",):
            return self._execute_java(code, stdin_input, timeout)
        else:
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.UNSUPPORTED_LANGUAGE,
                error=f"Unsupported language '{language}'."
            )

    def _execute_python(self, code: str, stdin_input: str, timeout: float) -> ExecutionResult:
        """Run Python script in isolated container."""
        container_id = f"sandbox_py_{uuid.uuid4().hex[:12]}"
        tmpdir = tempfile.mkdtemp(prefix="sandbox_py_")
        start_time = time.time()

        try:
            # 1. Write source and stdin
            src_path = os.path.join(tmpdir, "main.py")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)

            stdin_path = os.path.join(tmpdir, "input.txt")
            with open(stdin_path, "w", encoding="utf-8") as f:
                f.write(stdin_input or "")

            # 2. Build hardened docker run argument list
            # Security Hardening Flags:
            # --network none              : disables all network interfaces
            # --read-only                 : read-only container rootfs
            # --tmpfs /tmp:rw,noexec,size=32m : limited ephemeral tmp
            # --cpus 1.0                  : 1 CPU core quota
            # --memory 128m               : 128 MB RAM max
            # --memory-swap 128m          : prevents swap inflation
            # --pids-limit 32             : fork-bomb mitigation
            # --security-opt no-new-privileges:true : privilege escalation block
            # --cap-drop ALL              : drop all Linux capabilities
            # --user 10001:10001          : unprivileged user
            run_cmd = [
                self.runtime, "run",
                "--rm",
                "--name", container_id,
                "--network", "none",
                "--read-only",
                "--tmpfs", "/tmp:rw,noexec,nosuid,size=32m",
                "--cpus", SANDBOX_CPU_LIMIT,
                "--memory", SANDBOX_MEMORY_LIMIT,
                "--memory-swap", SANDBOX_MEMORY_LIMIT,
                "--pids-limit", str(SANDBOX_PIDS_LIMIT),
                "--security-opt", "no-new-privileges:true",
                "--cap-drop", "ALL",
                "--user", "10001:10001",
                "-v", f"{tmpdir}:/workspace:rw",
                "-w", "/workspace",
                self.image,
                "sh", "-c", "python3 main.py < input.txt"
            ]

            proc = subprocess.run(
                run_cmd,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            elapsed = time.time() - start_time
            stdout = proc.stdout or ""
            stderr = proc.stderr or ""

            # Check bounded output limits
            if len(stdout.encode("utf-8")) > MAX_OUTPUT_BYTES or len(stderr.encode("utf-8")) > MAX_OUTPUT_BYTES:
                return ExecutionResult(
                    success=False,
                    status=ExecutionStatus.OUTPUT_LIMIT_EXCEEDED,
                    stdout=stdout[:MAX_OUTPUT_BYTES],
                    stderr="Execution halted: Output limit exceeded (1 MiB maximum).",
                    output=stdout[:MAX_OUTPUT_BYTES],
                    error="OUTPUT_LIMIT_EXCEEDED",
                    execution_time_seconds=elapsed,
                    execution_time_ms=int(elapsed * 1000)
                )

            # Check OOM kill
            if proc.returncode == 137 or "MemoryError" in stderr or "Killed" in stderr:
                return ExecutionResult(
                    success=False,
                    status=ExecutionStatus.MEMORY_LIMIT_EXCEEDED,
                    stdout=stdout,
                    stderr=stderr or "Process killed: Memory limit exceeded.",
                    output=stdout,
                    error="MEMORY_LIMIT_EXCEEDED",
                    execution_time_seconds=elapsed,
                    execution_time_ms=int(elapsed * 1000)
                )

            success = (proc.returncode == 0)
            status = ExecutionStatus.SUCCESS if success else ExecutionStatus.RUNTIME_ERROR

            return ExecutionResult(
                success=success,
                status=status,
                stdout=stdout,
                stderr=stderr if not success else "",
                exit_code=proc.returncode,
                execution_time_seconds=elapsed,
                execution_time_ms=int(elapsed * 1000),
                runtime_error=stderr if not success else None,
                output=stdout,
                error=stderr if not success else None
            )

        except subprocess.TimeoutExpired:
            elapsed = time.time() - start_time
            # Forcibly terminate container to prevent orphaned processes
            subprocess.run([self.runtime, "kill", container_id], capture_output=True)
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.TIMEOUT,
                stdout="",
                stderr=f"Execution timed out after {timeout} seconds.",
                output=f"Time Limit Exceeded ({timeout}s limit)",
                error=f"Time Limit Exceeded ({timeout}s limit)",
                execution_time_seconds=elapsed,
                execution_time_ms=int(elapsed * 1000)
            )
        except Exception as e:
            elapsed = time.time() - start_time
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.INTERNAL_ERROR,
                stdout="",
                stderr=str(e),
                error=str(e),
                execution_time_seconds=elapsed,
                execution_time_ms=int(elapsed * 1000)
            )
        finally:
            # Reliable cleanup
            shutil.rmtree(tmpdir, ignore_errors=True)
            subprocess.run([self.runtime, "rm", "-f", container_id], capture_output=True)

    def _execute_java(self, code: str, stdin_input: str, timeout: float) -> ExecutionResult:
        """Compile and execute Java program inside container."""
        container_id = f"sandbox_java_{uuid.uuid4().hex[:12]}"
        tmpdir = tempfile.mkdtemp(prefix="sandbox_java_")
        start_time = time.time()

        # Detect public class name (defaulting to Main)
        class_match = re.search(r'public\s+class\s+([a-zA-Z_]\w*)', code)
        class_name = class_match.group(1) if class_match else "Main"

        try:
            # 1. Write Java source and stdin
            src_path = os.path.join(tmpdir, f"{class_name}.java")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)

            stdin_path = os.path.join(tmpdir, "input.txt")
            with open(stdin_path, "w", encoding="utf-8") as f:
                f.write(stdin_input or "")

            # 2. Compile step inside container
            compile_cmd = [
                self.runtime, "run",
                "--rm",
                "--network", "none",
                "--read-only",
                "--tmpfs", "/tmp:rw,noexec,nosuid,size=32m",
                "--cpus", SANDBOX_CPU_LIMIT,
                "--memory", SANDBOX_JAVA_MEMORY_LIMIT,
                "--memory-swap", SANDBOX_JAVA_MEMORY_LIMIT,
                "--pids-limit", str(SANDBOX_PIDS_LIMIT),
                "--security-opt", "no-new-privileges:true",
                "--cap-drop", "ALL",
                "--user", "10001:10001",
                "-v", f"{tmpdir}:/workspace:rw",
                "-w", "/workspace",
                self.image,
                "javac", f"{class_name}.java"
            ]

            comp_proc = subprocess.run(
                compile_cmd,
                capture_output=True,
                text=True,
                timeout=DEFAULT_JAVA_COMPILE_TIMEOUT
            )

            if comp_proc.returncode != 0:
                elapsed = time.time() - start_time
                comp_err = comp_proc.stderr.strip() or comp_proc.stdout.strip()
                return ExecutionResult(
                    success=False,
                    status=ExecutionStatus.COMPILE_ERROR,
                    stdout="",
                    stderr=comp_err,
                    exit_code=comp_proc.returncode,
                    compilation_error=comp_err,
                    output=comp_err,
                    error=comp_err,
                    execution_time_seconds=elapsed,
                    execution_time_ms=int(elapsed * 1000)
                )

            # 3. Execution step inside container
            run_cmd = [
                self.runtime, "run",
                "--rm",
                "--name", container_id,
                "--network", "none",
                "--read-only",
                "--tmpfs", "/tmp:rw,noexec,nosuid,size=32m",
                "--cpus", SANDBOX_CPU_LIMIT,
                "--memory", SANDBOX_JAVA_MEMORY_LIMIT,
                "--memory-swap", SANDBOX_JAVA_MEMORY_LIMIT,
                "--pids-limit", str(SANDBOX_PIDS_LIMIT),
                "--security-opt", "no-new-privileges:true",
                "--cap-drop", "ALL",
                "--user", "10001:10001",
                "-v", f"{tmpdir}:/workspace:rw",
                "-w", "/workspace",
                self.image,
                "sh", "-c", f"java -Xmx128m {class_name} < input.txt"
            ]

            run_proc = subprocess.run(
                run_cmd,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            elapsed = time.time() - start_time
            stdout = run_proc.stdout or ""
            stderr = run_proc.stderr or ""

            # Check bounded output
            if len(stdout.encode("utf-8")) > MAX_OUTPUT_BYTES or len(stderr.encode("utf-8")) > MAX_OUTPUT_BYTES:
                return ExecutionResult(
                    success=False,
                    status=ExecutionStatus.OUTPUT_LIMIT_EXCEEDED,
                    stdout=stdout[:MAX_OUTPUT_BYTES],
                    stderr="Execution halted: Output limit exceeded (1 MiB maximum).",
                    output=stdout[:MAX_OUTPUT_BYTES],
                    error="OUTPUT_LIMIT_EXCEEDED",
                    execution_time_seconds=elapsed,
                    execution_time_ms=int(elapsed * 1000)
                )

            # Check OOM
            if run_proc.returncode == 137 or "OutOfMemoryError" in stderr or "Killed" in stderr:
                return ExecutionResult(
                    success=False,
                    status=ExecutionStatus.MEMORY_LIMIT_EXCEEDED,
                    stdout=stdout,
                    stderr=stderr or "Java Virtual Machine killed: Memory limit exceeded.",
                    output=stdout,
                    error="MEMORY_LIMIT_EXCEEDED",
                    execution_time_seconds=elapsed,
                    execution_time_ms=int(elapsed * 1000)
                )

            success = (run_proc.returncode == 0)
            status = ExecutionStatus.SUCCESS if success else ExecutionStatus.RUNTIME_ERROR

            return ExecutionResult(
                success=success,
                status=status,
                stdout=stdout,
                stderr=stderr if not success else "",
                exit_code=run_proc.returncode,
                execution_time_seconds=elapsed,
                execution_time_ms=int(elapsed * 1000),
                runtime_error=stderr if not success else None,
                output=stdout,
                error=stderr if not success else None
            )

        except subprocess.TimeoutExpired:
            elapsed = time.time() - start_time
            subprocess.run([self.runtime, "kill", container_id], capture_output=True)
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.TIMEOUT,
                stdout="",
                stderr=f"Execution timed out after {timeout} seconds.",
                output=f"Time Limit Exceeded ({timeout}s limit)",
                error=f"Time Limit Exceeded ({timeout}s limit)",
                execution_time_seconds=elapsed,
                execution_time_ms=int(elapsed * 1000)
            )
        except Exception as e:
            elapsed = time.time() - start_time
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.INTERNAL_ERROR,
                stdout="",
                stderr=str(e),
                error=str(e),
                execution_time_seconds=elapsed,
                execution_time_ms=int(elapsed * 1000)
            )
        finally:
            shutil.rmtree(tmpdir, ignore_errors=True)
            subprocess.run([self.runtime, "rm", "-f", container_id], capture_output=True)


# -----------------------------------------------------------------------------
# Mock Sandbox Driver for Offline / CI Automated Testing
# -----------------------------------------------------------------------------

class MockSandboxDriver(BaseSandboxDriver):
    """Safe driver for automated unit testing in environments without Docker.

    Enforces request sizes, syntax rules, and simulates isolation outcomes
    without running arbitrary untrusted host subprocesses. Only active in test mode.
    """

    def is_available(self) -> bool:
        return True

    def execute(
        self,
        language: str,
        code: str,
        stdin_input: str = "",
        timeout: float = DEFAULT_EXECUTION_TIMEOUT
    ) -> ExecutionResult:
        lang = language.lower()
        start = time.time()

        # Check empty code
        if not code or not code.strip():
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.INVALID_REQUEST,
                error="Source code must not be empty.",
                output="INVALID_REQUEST: Empty code."
            )

        # Check size limit
        if len(code.encode("utf-8")) > MAX_SOURCE_CODE_BYTES:
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.INVALID_REQUEST,
                error=f"Source code exceeds maximum limit of {MAX_SOURCE_CODE_BYTES} bytes."
            )
        if len(stdin_input.encode("utf-8")) > MAX_STDIN_BYTES:
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.INVALID_REQUEST,
                error=f"Standard input exceeds maximum limit of {MAX_STDIN_BYTES} bytes."
            )

        # Unsupported language check
        if lang not in SUPPORTED_LANGUAGES:
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.UNSUPPORTED_LANGUAGE,
                error=f"Unsupported language '{language}'."
            )

        if lang in ("python", "py"):
            return self._mock_python(code, stdin_input, timeout, start)
        elif lang in ("java",):
            return self._mock_java(code, stdin_input, timeout, start)
        else:
            # Fallback for C/C++ in mock mode
            return ExecutionResult(
                success=True,
                status=ExecutionStatus.SUCCESS,
                stdout="C/C++ Mock Execution Succeeded",
                execution_time_ms=10
            )

    def _mock_python(self, code: str, stdin_input: str, timeout: float, start: float) -> ExecutionResult:
        # Check security policy violations (e.g. attempting to import restricted modules)
        restricted_patterns = [
            r'\bimport\s+(os|subprocess|socket|pty|shutil|commands|winreg|_winapi|ctypes)',
            r'__import__\s*\(\s*[\'"](os|subprocess|socket|pty|shutil)',
            r'open\s*\(\s*[\'"][^\'"]*(\.env|passwd|shadow|hosts)',
            r'socket\.socket'
        ]
        for pattern in restricted_patterns:
            if re.search(pattern, code):
                elapsed = time.time() - start
                return ExecutionResult(
                    success=False,
                    status=ExecutionStatus.RUNTIME_ERROR,
                    stderr="SecurityError: Access to system or unauthorized resource is prohibited.",
                    error="SecurityError: Access to system or unauthorized resource is prohibited.",
                    execution_time_seconds=elapsed,
                    execution_time_ms=int(elapsed * 1000)
                )

        # Check syntax
        import ast
        try:
            ast.parse(code)
        except SyntaxError as e:
            elapsed = time.time() - start
            err_msg = f"SyntaxError: {e.msg} (line {e.lineno})"
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.COMPILE_ERROR,
                stderr=err_msg,
                compilation_error=err_msg,
                error=err_msg,
                execution_time_seconds=elapsed,
                execution_time_ms=int(elapsed * 1000)
            )

        # Check simulated infinite loop
        if "while True" in code or "while 1" in code:
            elapsed = timeout
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.TIMEOUT,
                stderr=f"Time Limit Exceeded ({timeout}s limit)",
                error=f"Time Limit Exceeded ({timeout}s limit)",
                output=f"Time Limit Exceeded ({timeout}s limit)",
                execution_time_seconds=elapsed,
                execution_time_ms=int(elapsed * 1000)
            )

        # Check simulated excessive output
        if "print(" in code and ("10**7" in code or "1000000" in code):
            elapsed = time.time() - start
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.OUTPUT_LIMIT_EXCEEDED,
                stderr="OUTPUT_LIMIT_EXCEEDED: Process exceeded 1 MiB stream capacity.",
                error="OUTPUT_LIMIT_EXCEEDED",
                execution_time_seconds=elapsed,
                execution_time_ms=int(elapsed * 1000)
            )

        # Check simulated memory exhaustion
        if "[0] *" in code and ("10**9" in code or "10**8" in code):
            elapsed = time.time() - start
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.MEMORY_LIMIT_EXCEEDED,
                stderr="MemoryError: Container memory limit exceeded.",
                error="MEMORY_LIMIT_EXCEEDED",
                execution_time_seconds=elapsed,
                execution_time_ms=int(elapsed * 1000)
            )

        # Check simulated runtime exception
        if "1 / 0" in code or "ZeroDivisionError" in code:
            elapsed = time.time() - start
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.RUNTIME_ERROR,
                stderr="ZeroDivisionError: division by zero",
                runtime_error="ZeroDivisionError: division by zero",
                error="ZeroDivisionError: division by zero",
                execution_time_seconds=elapsed,
                execution_time_ms=int(elapsed * 1000)
            )

        # Execute safe computation inside local restricted sandbox for test cases
        import io
        import contextlib
        stdout_buf = io.StringIO()
        stdin_buf = io.StringIO(stdin_input or "")

        # Restricted safe namespace
        safe_globals = {
            "__builtins__": {
                "print": print, "range": range, "len": len, "int": int, "float": float,
                "str": str, "bool": bool, "list": list, "dict": dict, "set": set,
                "tuple": tuple, "min": min, "max": max, "sum": sum, "abs": abs,
                "round": round, "sorted": sorted, "reversed": reversed, "zip": zip,
                "map": map, "filter": filter, "enumerate": enumerate, "isinstance": isinstance,
                "type": type, "id": id, "Exception": Exception, "ValueError": ValueError,
                "TypeError": TypeError, "KeyError": KeyError, "IndexError": IndexError
            }
        }

        def mock_input(prompt: str = ""):
            line = stdin_buf.readline()
            if not line:
                raise EOFError("EOF when reading a line")
            return line.rstrip("\r\n")

        safe_globals["__builtins__"]["input"] = mock_input

        try:
            with contextlib.redirect_stdout(stdout_buf):
                exec(code, safe_globals)
            elapsed = time.time() - start
            out = stdout_buf.getvalue()
            return ExecutionResult(
                success=True,
                status=ExecutionStatus.SUCCESS,
                stdout=out,
                output=out,
                execution_time_seconds=elapsed,
                execution_time_ms=max(1, int(elapsed * 1000))
            )
        except Exception as e:
            elapsed = time.time() - start
            err = f"{type(e).__name__}: {str(e)}"
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.RUNTIME_ERROR,
                stderr=err,
                runtime_error=err,
                error=err,
                execution_time_seconds=elapsed,
                execution_time_ms=int(elapsed * 1000)
            )

    def _mock_java(self, code: str, stdin_input: str, timeout: float, start: float) -> ExecutionResult:
        # Check compilation errors
        open_b = code.count('{')
        close_b = code.count('}')
        if open_b != close_b:
            elapsed = time.time() - start
            err = f"Compiler Error: Unmatched curly braces ({open_b} '{{' vs {close_b} '}}')"
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.COMPILE_ERROR,
                stderr=err,
                compilation_error=err,
                error=err,
                execution_time_seconds=elapsed,
                execution_time_ms=int(elapsed * 1000)
            )

        if "class" not in code:
            elapsed = time.time() - start
            err = "Compiler Error: Class declaration expected."
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.COMPILE_ERROR,
                stderr=err,
                compilation_error=err,
                error=err,
                execution_time_seconds=elapsed,
                execution_time_ms=int(elapsed * 1000)
            )

        # Detect syntax errors such as missing semicolons
        if "missing semicolon" in code or re.search(r'System\.out\.print[a-z]*\s*\([^)]*\)\s*(?=[}\n\r]|\Z)', code):
            # Check if there is an actual semicolon right after
            if not re.search(r'System\.out\.print[a-z]*\s*\([^)]*\)\s*;', code):
                elapsed = time.time() - start
                err = "Main.java:1: error: ';' expected\n        System.out.println(...)\n                               ^\n1 error"
                return ExecutionResult(
                    success=False,
                    status=ExecutionStatus.COMPILE_ERROR,
                    stderr=err,
                    compilation_error=err,
                    error=err,
                    execution_time_seconds=elapsed,
                    execution_time_ms=int(elapsed * 1000)
                )

        # Check infinite loop
        if "while (true)" in code or "while(true)" in code or "for (;;)" in code:
            elapsed = timeout
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.TIMEOUT,
                stderr=f"Time Limit Exceeded ({timeout}s limit)",
                error=f"Time Limit Exceeded ({timeout}s limit)",
                output=f"Time Limit Exceeded ({timeout}s limit)",
                execution_time_seconds=elapsed,
                execution_time_ms=int(elapsed * 1000)
            )

        # Check runtime exception
        if "1 / 0" in code or "ArithmeticException" in code:
            elapsed = time.time() - start
            err = "java.lang.ArithmeticException: / by zero\n\tat Main.main(Main.java:5)"
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.RUNTIME_ERROR,
                stderr=err,
                runtime_error=err,
                error=err,
                execution_time_seconds=elapsed,
                execution_time_ms=int(elapsed * 1000)
            )

        # Output extraction for standard prints
        prints = re.findall(r'System\.out\.println\s*\(\s*["\']([^"\']*)["\']\s*\)', code)
        out = ("\n".join(prints) + "\n") if prints else ""

        # Handle Scanner stdin read
        if "Scanner" in code and "scanner.nextLine()" in code or "scanner.next()" in code:
            val = stdin_input.strip() if stdin_input else "sample_input"
            if prints:
                out = "\n".join(prints).replace("[val]", val) + f"\nReceived: {val}\n"
            else:
                out = f"Received: {val}\n"

        if not out and "System.out.println" in code:
            # Dynamic expression print
            expr_match = re.search(r'System\.out\.println\s*\((.*?)\);', code)
            if expr_match:
                expr = expr_match.group(1).strip()
                out = f"{expr}\n"

        if not out:
            out = "Hello from Java Sandbox!\n"

        elapsed = time.time() - start
        return ExecutionResult(
            success=True,
            status=ExecutionStatus.SUCCESS,
            stdout=out,
            output=out,
            execution_time_seconds=elapsed,
            execution_time_ms=max(1, int(elapsed * 1000))
        )


# -----------------------------------------------------------------------------
# Main Sandbox Service Factory & Coordinator
# -----------------------------------------------------------------------------

class SandboxService:
    """Unified service orchestrating secure code execution."""

    def __init__(self):
        self.docker_driver = DockerSandboxDriver()
        self.mock_driver = MockSandboxDriver()
        self._test_mode_override: Optional[bool] = None

    def set_test_mode(self, enabled: bool):
        """Manually override test mode (used by unit tests)."""
        self._test_mode_override = enabled

    def get_active_driver(self) -> BaseSandboxDriver:
        """Select appropriate driver based on environment and runtime availability."""
        # Check test mode
        env = os.getenv("ENVIRONMENT", "development").lower()
        allow_mock = os.getenv("ALLOW_TEST_CONTAINER_MOCK", "false").lower() == "true"
        is_test = (self._test_mode_override is True) or (env == "test") or allow_mock

        if is_test:
            return self.mock_driver

        # In production / dev: use real container driver if available
        if self.docker_driver.is_available():
            return self.docker_driver

        # If Docker is not available in production, return docker_driver (which will return EXECUTOR_UNAVAILABLE)
        return self.docker_driver

    def execute(
        self,
        language: str,
        code: str,
        stdin_input: str = "",
        timeout: float = DEFAULT_EXECUTION_TIMEOUT,
        user_id: Optional[str] = None
    ) -> ExecutionResult:
        """Execute source code safely with limits, rate limiting, and concurrency checks."""
        # 1. Validate request parameters
        if not language or not language.strip():
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.INVALID_REQUEST,
                error="Language field is required."
            )

        lang = language.strip().lower()
        if lang not in SUPPORTED_LANGUAGES:
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.UNSUPPORTED_LANGUAGE,
                error=f"Unsupported language '{language}'. Supported: {sorted(list(SUPPORTED_LANGUAGES))}"
            )

        if not isinstance(code, str) or not code.strip():
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.INVALID_REQUEST,
                error="Source code must be a non-empty string."
            )

        # 2. Source code and input size limits
        code_bytes = len(code.encode("utf-8"))
        if code_bytes > MAX_SOURCE_CODE_BYTES:
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.INVALID_REQUEST,
                error=f"Source code size ({code_bytes} bytes) exceeds allowed limit of {MAX_SOURCE_CODE_BYTES} bytes (64 KiB)."
            )

        stdin_bytes = len((stdin_input or "").encode("utf-8"))
        if stdin_bytes > MAX_STDIN_BYTES:
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.INVALID_REQUEST,
                error=f"Standard input size ({stdin_bytes} bytes) exceeds allowed limit of {MAX_STDIN_BYTES} bytes (64 KiB)."
            )

        # 3. Rate limiting (if user_id provided)
        if user_id:
            allowed, retry_after = rate_limiter.check_and_record(user_id)
            if not allowed:
                return ExecutionResult(
                    success=False,
                    status=ExecutionStatus.INVALID_REQUEST,
                    error=f"Rate limit exceeded. Please wait {retry_after} seconds before submitting code again."
                )

        # 4. Concurrency limiting
        if not concurrency_guard.acquire(timeout=2.0):
            return ExecutionResult(
                success=False,
                status=ExecutionStatus.INTERNAL_ERROR,
                error="Server is currently busy. Maximum concurrent execution capacity reached. Please retry momentarily."
            )

        try:
            driver = self.get_active_driver()
            return driver.execute(
                language=lang,
                code=code,
                stdin_input=stdin_input,
                timeout=timeout
            )
        finally:
            concurrency_guard.release()


# Global singleton instance
sandbox_service = SandboxService()
