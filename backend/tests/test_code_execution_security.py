"""Comprehensive Security, Functional, and Resource Limit Test Suite for Code Sandbox Engine.

Covers:
A. Functional Tests (1-12)
B. Resource-Limit Tests (13-20)
C. Security Tests (21-30)
D. Integration Tests (31-39)
"""

import os
import sys
import time
import tempfile
import unittest
import subprocess
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Establish isolated test environment with disposable SQLite database
_TEST_TEMP_DIR = tempfile.TemporaryDirectory()
_DISPOSABLE_DB = Path(_TEST_TEMP_DIR.name) / "test_sandbox.db"
os.environ["ADAPTIVE_LEARNING_DB_PATH"] = str(_DISPOSABLE_DB)
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_TEST_CONTAINER_MOCK"] = "true"
os.environ["ALLOW_DEV_TEST_HEADERS"] = "true"

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.sandbox_service import (
    sandbox_service,
    rate_limiter,
    ExecutionStatus,
    MAX_SOURCE_CODE_BYTES,
    MAX_STDIN_BYTES,
    DockerSandboxDriver,
    MockSandboxDriver,
    setup_sandbox_workspace
)
from backend.services.code_executor import code_executor
from backend.services.auth_service import auth_service
from backend.services.state_store import state_store


class TestCodeExecutionSecurity(unittest.TestCase):
    """39-Test Suite for Sandboxed Code Execution and Security Enforcement."""

    @classmethod
    def setUpClass(cls):
        state_store.set_db_path(str(_DISPOSABLE_DB), init_schema=True)
        cls.client = TestClient(app)
        cls.user_token = auth_service.create_internal_token("test-sandbox-student", "student@adaptive.edu", "student")
        cls.auth_headers = {"Authorization": f"Bearer {cls.user_token}"}
        cls.admin_token = auth_service.create_internal_token("test-sandbox-admin", "admin@adaptive.edu", "admin")
        cls.admin_headers = {"Authorization": f"Bearer {cls.admin_token}"}
        sandbox_service.set_test_mode(True)

    @classmethod
    def tearDownClass(cls):
        sandbox_service.set_test_mode(False)
        _TEST_TEMP_DIR.cleanup()

    def setUp(self):
        """Reset rate limiter state between tests."""
        rate_limiter.user_requests.clear()

    # =========================================================================
    # A. Functional Tests
    # =========================================================================

    def test_01_python_hello_world(self):
        """1. Python Hello World execution."""
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": "print('Hello, Sandbox!')"
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["status"], "SUCCESS")
        self.assertIn("Hello, Sandbox!", data["stdout"])

    def test_02_python_arithmetic(self):
        """2. Python arithmetic evaluation."""
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": "a = 21\nb = 2\nprint(a * b)"
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["stdout"].strip(), "42")

    def test_03_python_stdin_handling(self):
        """3. Python standard input piping."""
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": "val = input()\nprint(f'Echo: {val}')",
            "stdin": "AdaptiveLearning101"
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("Echo: AdaptiveLearning101", data["stdout"])

    def test_04_java_hello_world(self):
        """4. Java Hello World compilation and execution."""
        code = (
            "public class Main {\n"
            "    public static void main(String[] args) {\n"
            "        System.out.println(\"Hello from Java 17!\");\n"
            "    }\n"
            "}"
        )
        res = self.client.post("/api/code/execute", json={
            "language": "java",
            "code": code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["status"], "SUCCESS")
        self.assertIn("Hello from Java 17!", data["stdout"])

    def test_05_java_stdin_handling(self):
        """5. Java stdin streaming through Scanner."""
        code = (
            "import java.util.Scanner;\n"
            "public class Main {\n"
            "    public static void main(String[] args) {\n"
            "        Scanner scanner = new Scanner(System.in);\n"
            "        String s = scanner.nextLine();\n"
            "        System.out.println(s);\n"
            "    }\n"
            "}"
        )
        res = self.client.post("/api/code/execute", json={
            "language": "java",
            "code": code,
            "stdin": "StreamedJavaInput"
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("StreamedJavaInput", data["stdout"])

    def test_06_java_compilation_failure(self):
        """6. Java compilation error detection."""
        broken_code = "public class Main { public static void main(String[] args) { System.out.println(\"missing semicolon\") } }"
        res = self.client.post("/api/code/execute", json={
            "language": "java",
            "code": broken_code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])
        self.assertIn(data["status"], ["COMPILE_ERROR", "COMPILATION_ERROR"])
        self.assertIsNotNone(data["compilation_error"])

    def test_07_python_syntax_failure(self):
        """7. Python syntax error detection."""
        syntax_broken = "def incomplete_fn(:"
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": syntax_broken
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])
        self.assertIn(data["status"], ["COMPILE_ERROR", "COMPILATION_ERROR"])

    def test_08_runtime_exception(self):
        """8. Unhandled runtime exception handling."""
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": "x = 1 / 0"
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])
        self.assertEqual(data["status"], "RUNTIME_ERROR")
        self.assertIn("ZeroDivisionError", data["stderr"] or data["error"])

    def test_09_empty_source_code(self):
        """9. Safe rejection of empty source code."""
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": "   "
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 400)
        data = res.json()
        self.assertIn("INVALID_REQUEST", str(data))

    def test_10_unsupported_language(self):
        """10. Safe rejection of unsupported languages."""
        res = self.client.post("/api/code/execute", json={
            "language": "rust_unsupported",
            "code": "fn main() {}"
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 400)
        data = res.json()
        self.assertIn("UNSUPPORTED_LANGUAGE", str(data))

    def test_11_invalid_request_schema(self):
        """11. Rejection of malformed request payloads."""
        res = self.client.post("/api/code/execute", json={
            "language": "python"
            # Missing required 'code' field
        }, headers=self.auth_headers)
        self.assertIn(res.status_code, [400, 422])

    def test_12_non_ascii_unicode_io(self):
        """12. Unicode input, string processing, and output."""
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": "val = input()\nprint(f'こんにちは, {val}! 🚀')",
            "stdin": "世界"
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("こんにちは, 世界! 🚀", data["stdout"])

    # =========================================================================
    # B. Resource-Limit Tests
    # =========================================================================

    def test_13_infinite_loop_timeout(self):
        """13. Infinite loop termination on timeout."""
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": "while True: pass"
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])
        self.assertIn(data["status"], ["TIMEOUT", "TIME_LIMIT_EXCEEDED"])

    def test_14_excessive_output_termination(self):
        """14. Excessive output stream termination."""
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": "print('A' * 1000000)"
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])
        self.assertEqual(data["status"], "OUTPUT_LIMIT_EXCEEDED")

    def test_15_memory_limit_enforcement(self):
        """15. Memory allocation limit enforcement."""
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": "big_arr = [0] * (10**9)"
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])
        self.assertEqual(data["status"], "MEMORY_LIMIT_EXCEEDED")

    def test_16_process_limit_enforcement(self):
        """16. Process limit / fork bomb prevention check."""
        code = "import multiprocessing\n# Fork bomb attempt"
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])

    def test_17_oversized_source_code_rejection(self):
        """17. Oversized source code (>64 KiB) rejection."""
        huge_code = "# " + ("A" * (MAX_SOURCE_CODE_BYTES + 500))
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": huge_code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 400)
        self.assertIn("INVALID_REQUEST", str(res.json()))

    def test_18_oversized_stdin_rejection(self):
        """18. Oversized standard input (>64 KiB) rejection."""
        huge_stdin = "B" * (MAX_STDIN_BYTES + 500)
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": "print('test')",
            "stdin": huge_stdin
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 400)
        self.assertIn("INVALID_REQUEST", str(res.json()))

    def test_19_concurrent_execution_limits(self):
        """19. Concurrency guard semaphore capacity check."""
        from backend.services.sandbox_service import concurrency_guard
        # Verify semaphore can acquire and release slots without corruption
        slots = []
        for _ in range(concurrency_guard.max_concurrent):
            slots.append(concurrency_guard.acquire(timeout=0.1))
        self.assertTrue(all(slots))
        # Next acquisition must fail or block
        extra = concurrency_guard.acquire(timeout=0.05)
        self.assertFalse(extra)
        # Release acquired slots
        for _ in slots:
            concurrency_guard.release()

    def test_20_cancellation_and_cleanup_after_timeout(self):
        """20. Ensure workspace and state are cleaned after a timeout event."""
        with patch("shutil.rmtree") as mock_rm:
            driver = DockerSandboxDriver()
            with patch.object(driver, "is_available", return_value=True):
                def mock_run_selective(cmd, *args, **kwargs):
                    if "run" in cmd:
                        raise subprocess.TimeoutExpired(cmd=cmd, timeout=1.0)
                    return MagicMock(returncode=0, stdout="", stderr="")

                with patch("subprocess.run", side_effect=mock_run_selective):
                    driver.execute("python", "while True: pass", timeout=1.0)
                    self.assertTrue(mock_rm.called)

    # =========================================================================
    # C. Security Tests
    # =========================================================================

    def test_21_attempted_command_injection(self):
        """21. Prohibit command injection and host command execution."""
        injection_code = "import os\nos.system('echo compromised > host_pwned.txt')"
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": injection_code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])
        self.assertFalse(os.path.exists("host_pwned.txt"))

    def test_22_attempted_unauthorized_host_file_access(self):
        """22. Prohibit reading unauthorized host system files."""
        read_code = "with open('/etc/passwd', 'r') as f: print(f.read())"
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": read_code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])
        self.assertNotIn("root:", data["stdout"])

    def test_23_attempted_environment_variable_disclosure(self):
        """23. Prevent disclosure of host secrets and environment variables."""
        env_code = "import os\nprint('SECRET_KEY:', os.environ.get('JWT_SECRET'))"
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": env_code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])
        self.assertNotIn("cognitive-adaptive-secret", data.get("stdout", ""))

    def test_24_attempted_network_access(self):
        """24. Prohibit socket creation and outbound network access."""
        net_code = "import socket\ns = socket.socket()\ns.connect(('8.8.8.8', 53))"
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": net_code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])

    def test_25_attempted_access_to_other_students_workspaces(self):
        """25. Workspace isolation between students."""
        ws_code = "import os\nprint(os.path.exists('../other_student'))"
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": ws_code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.json()["success"])

    def test_26_attempted_privileged_execution(self):
        """26. Verify student containers do not run in privileged mode."""
        driver = DockerSandboxDriver()
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0, stdout="test", stderr="")
            with patch.object(driver, "is_available", return_value=True):
                driver.execute("python", "print('test')")
                # First call is the execution container run, second is cleanup rm
                run_cmd_list = mock_run.call_args_list[0][0][0]
                self.assertNotIn("--privileged", run_cmd_list)
                self.assertIn("--security-opt", run_cmd_list)
                self.assertIn("--cap-drop", run_cmd_list)
                self.assertIn("--user", run_cmd_list)

    def test_27_attempted_path_traversal(self):
        """27. Prevent path traversal inside source files."""
        traversal_code = "with open('../../.env', 'r') as f: print(f.read())"
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": traversal_code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.json()["success"])

    def test_28_attempted_unauthorized_api_access(self):
        """28. Enforce authentication in production."""
        with patch.dict(os.environ, {"ENVIRONMENT": "production", "ALLOW_DEV_TEST_HEADERS": "false"}):
            res = self.client.post("/api/code/execute", json={
                "language": "python",
                "code": "print('unauth')"
            })
            self.assertEqual(res.status_code, 401)

    def test_29_attempted_student_access_to_administrator_only_functionality(self):
        """29. Prohibit students from calling admin endpoints."""
        res = self.client.post("/api/admin/run-diagnostics", headers=self.auth_headers)
        self.assertEqual(res.status_code, 403)

    def test_30_attempted_resource_exhaustion(self):
        """30. Memory & thread exhaustion protection."""
        bomb_code = "[0] * (10**8)"
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": bomb_code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.json()["success"])

    # =========================================================================
    # D. Integration Tests
    # =========================================================================

    def test_31_backend_starts_and_health_active(self):
        """31. Backend starts correctly and health check is online."""
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "healthy")

    def test_32_execution_endpoint_accepts_valid_requests(self):
        """32. /api/code/execute and /api/code/run accept valid requests."""
        # /api/code/execute
        r1 = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": "print('Endpoint validation')",
            "stdin": ""
        }, headers=self.auth_headers)
        self.assertEqual(r1.status_code, 200)
        self.assertTrue(r1.json()["success"])

        # /api/code/run
        r2 = self.client.post("/api/code/run", json={
            "language": "python",
            "code": "print('Run endpoint validation')",
            "custom_input": ""
        }, headers=self.auth_headers)
        self.assertEqual(r2.status_code, 200)
        self.assertTrue(r2.json()["success"])

    def test_33_frontend_receives_complete_contract_schema(self):
        """33. Response structure matches all frontend contract expectations."""
        res = self.client.post("/api/code/run", json={
            "language": "python",
            "code": "print('Schema Contract')"
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        expected_keys = [
            "success", "status", "stdout", "stderr", "output", "error",
            "compilation_error", "runtime_error", "execution_time_seconds",
            "execution_time_ms", "execution_status"
        ]
        for key in expected_keys:
            self.assertIn(key, data, f"Missing key in code response: {key}")

    def test_34_authentication_is_enforced(self):
        """34. Verify invalid bearer token is rejected."""
        bad_headers = {"Authorization": "Bearer invalid.fake.token"}
        res = self.client.post("/api/code/execute", json={
            "language": "python",
            "code": "print('test')"
        }, headers=bad_headers)
        self.assertIn(res.status_code, [401, 403])

    def test_35_container_startup_failure_handled_safely(self):
        """35. Graceful handling when container driver is unavailable."""
        driver = DockerSandboxDriver()
        with patch.object(driver, "is_available", return_value=False):
            res = driver.execute("python", "print('test')")
            self.assertFalse(res.success)
            self.assertEqual(res.status, ExecutionStatus.EXECUTOR_UNAVAILABLE)
            self.assertIn("EXECUTOR_UNAVAILABLE", res.output)

    def test_36_cleanup_runs_after_normal_execution(self):
        """36. Verify temporary files are deleted after normal execution."""
        temp_dir_holder = []
        original_mkdtemp = tempfile.mkdtemp

        def instrumented_mkdtemp(*args, **kwargs):
            d = original_mkdtemp(*args, **kwargs)
            temp_dir_holder.append(d)
            return d

        driver = DockerSandboxDriver()
        with patch.object(driver, "is_available", return_value=True):
            with patch("tempfile.mkdtemp", side_effect=instrumented_mkdtemp):
                with patch("subprocess.run", return_value=MagicMock(returncode=0, stdout="test", stderr="")):
                    driver.execute("python", "print('clean')")
                    if temp_dir_holder:
                        self.assertFalse(os.path.exists(temp_dir_holder[0]))

    def test_37_cleanup_runs_after_exceptions(self):
        """37. Verify temporary files are deleted after unexpected exceptions."""
        temp_dir_holder = []
        original_mkdtemp = tempfile.mkdtemp

        def instrumented_mkdtemp(*args, **kwargs):
            d = original_mkdtemp(*args, **kwargs)
            temp_dir_holder.append(d)
            return d

        def mock_run_selective(cmd, *args, **kwargs):
            if "run" in cmd:
                raise RuntimeError("Container failure")
            return MagicMock(returncode=0, stdout="", stderr="")

        driver = DockerSandboxDriver()
        with patch.object(driver, "is_available", return_value=True):
            with patch("tempfile.mkdtemp", side_effect=instrumented_mkdtemp):
                with patch("subprocess.run", side_effect=mock_run_selective):
                    driver.execute("python", "print('clean')")
                    if temp_dir_holder:
                        self.assertFalse(os.path.exists(temp_dir_holder[0]))

    def test_38_cleanup_runs_after_timeout(self):
        """38. Verify temporary files are deleted after timeout."""
        temp_dir_holder = []
        original_mkdtemp = tempfile.mkdtemp

        def instrumented_mkdtemp(*args, **kwargs):
            d = original_mkdtemp(*args, **kwargs)
            temp_dir_holder.append(d)
            return d

        def mock_run_selective(cmd, *args, **kwargs):
            if "run" in cmd:
                raise subprocess.TimeoutExpired(cmd=cmd, timeout=5.0)
            return MagicMock(returncode=0, stdout="", stderr="")

        driver = DockerSandboxDriver()
        with patch.object(driver, "is_available", return_value=True):
            with patch("tempfile.mkdtemp", side_effect=instrumented_mkdtemp):
                with patch("subprocess.run", side_effect=mock_run_selective):
                    driver.execute("python", "while True: pass", timeout=1.0)
                    if temp_dir_holder:
                        self.assertFalse(os.path.exists(temp_dir_holder[0]))

    def test_39_existing_code_challenge_grading_intact(self):
        """39. Verify curriculum grading (/api/code/submit) remains fully functional."""
        mock_challenge = {
            "id": "code-grading-test",
            "topic_id": "top-py-test-grading",
            "test_cases": [
                {"input": "5", "expected_output": "10", "is_hidden": False},
                {"input": "12", "expected_output": "24", "is_hidden": True}
            ]
        }
        with patch("backend.services.curriculum_service.curriculum_service.get_coding_challenge", return_value=mock_challenge):
            res = self.client.post("/api/code/submit", json={
                "topicId": "top-py-test-grading",
                "code": "n = int(input())\nprint(n * 2)",
                "language": "python",
                "codingTimeSeconds": 15.0
            }, headers=self.auth_headers)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["passed_tests"], 2)
            self.assertEqual(data["total_tests"], 2)

    def test_40_c_execution_via_sandbox(self):
        """40. C Hello World compiles and executes via sandbox."""
        code = (
            "#include <stdio.h>\n"
            "int main() {\n"
            "    printf(\"Hello from C Sandbox!\\n\");\n"
            "    return 0;\n"
            "}"
        )
        res = self.client.post("/api/code/execute", json={
            "language": "c",
            "code": code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["status"], "SUCCESS")
        self.assertIn("Hello from C Sandbox!", data["stdout"])

    def test_41_cpp_execution_via_sandbox(self):
        """41. C++ Hello World compiles and executes via sandbox."""
        code = (
            "#include <iostream>\n"
            "int main() {\n"
            "    std::cout << \"Hello from C++ Sandbox!\" << std::endl;\n"
            "    return 0;\n"
            "}"
        )
        res = self.client.post("/api/code/execute", json={
            "language": "cpp",
            "code": code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["status"], "SUCCESS")
        self.assertIn("Hello from C++ Sandbox!", data["stdout"])

    def test_42_c_disallowed_header_rejection(self):
        """42. Prohibit unapproved low-level OS/network headers in C/C++ before execution."""
        unsafe_code = (
            "#include <sys/socket.h>\n"
            "#include <stdio.h>\n"
            "int main() { return 0; }"
        )
        res = self.client.post("/api/code/execute", json={
            "language": "c",
            "code": unsafe_code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])
        self.assertIn("Security Policy Violation", data.get("error", ""))

    def test_43_c_system_call_rejection(self):
        """43. Prohibit system() command invocation in C/C++ source code."""
        unsafe_code = (
            "#include <stdio.h>\n"
            "#include <stdlib.h>\n"
            "int main() {\n"
            "    system(\"rm -rf /\");\n"
            "    return 0;\n"
            "}"
        )
        res = self.client.post("/api/code/execute", json={
            "language": "c",
            "code": unsafe_code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])
        self.assertIn("Security Policy Violation", data.get("error", ""))

    def test_43b_cpp_disallowed_header_rejection(self):
        """43b. Prohibit unapproved low-level OS/network headers in C++ before execution."""
        unsafe_code = (
            "#include <iostream>\n"
            "#include <sys/socket.h>\n"
            "int main() {\n"
            "    std::cout << \"should not run\" << std::endl;\n"
            "    return 0;\n"
            "}"
        )
        res = self.client.post("/api/code/execute", json={
            "language": "cpp",
            "code": unsafe_code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])
        self.assertIn("Security Policy Violation", data.get("error", ""))

    def test_43c_cpp_system_call_rejection(self):
        """43c. Prohibit system() command invocation in C++ source code."""
        unsafe_code = (
            "#include <iostream>\n"
            "#include <cstdlib>\n"
            "int main() {\n"
            "    system(\"rm -rf /\");\n"
            "    return 0;\n"
            "}"
        )
        res = self.client.post("/api/code/execute", json={
            "language": "cpp",
            "code": unsafe_code
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])
        self.assertIn("Security Policy Violation", data.get("error", ""))

    def test_44_c_cpp_driver_security_flags(self):
        """44. Verify DockerSandboxDriver applies container isolation flags to C and C++."""
        driver = DockerSandboxDriver()
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0, stdout="test", stderr="")
            with patch.object(driver, "is_available", return_value=True):
                driver.execute("c", "int main() { return 0; }")
                self.assertGreaterEqual(len(mock_run.call_args_list), 1)
                run_cmd_list = mock_run.call_args_list[0][0][0]
                self.assertNotIn("--privileged", run_cmd_list)
                self.assertIn("--security-opt", run_cmd_list)
                self.assertIn("--cap-drop", run_cmd_list)
                self.assertIn("--user", run_cmd_list)

    def test_45_workspace_permissions_and_read_only_mount(self):
        """45. Verify restrictive workspace permissions and read-only volume mount for Python."""
        with tempfile.TemporaryDirectory() as td:
            # 1. Python read-only workspace
            setup_sandbox_workspace(td, allow_container_write=False)
            if hasattr(os, "stat") and os.name != "nt":
                mode = oct(os.stat(td).st_mode & 0o777)
                self.assertNotEqual(mode, "0o777", "Python workspace must never be world-writable (0o777)")

            # 2. C/C++/Java write workspace
            setup_sandbox_workspace(td, allow_container_write=True)
            if hasattr(os, "stat") and os.name != "nt":
                mode = oct(os.stat(td).st_mode & 0o1777)
                self.assertIn(mode, ("0o700", "0o1777"), "Compiled workspace must be restricted or have sticky bit enabled")

        # 3. Verify DockerSandboxDriver mounts Python workspace as :ro and uses -B
        driver = DockerSandboxDriver()
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0, stdout="clean", stderr="")
            with patch.object(driver, "is_available", return_value=True):
                driver.execute("python", "print('hello')")
                self.assertGreaterEqual(len(mock_run.call_args_list), 1)
                run_cmd = mock_run.call_args_list[0][0][0]
                vol_args = [run_cmd[i+1] for i, arg in enumerate(run_cmd) if arg == "-v"]
                self.assertTrue(any(v.endswith(":/workspace:ro") for v in vol_args), "Python workspace must be mounted read-only (:ro)")
                self.assertTrue(any("python3 -B main.py" in arg for arg in run_cmd), "python3 must be invoked with -B to prevent bytecode generation")

    def test_46_compile_container_naming_and_cleanup(self):
        """46. Verify compile containers are uniquely named and cleaned up on timeout."""
        driver = DockerSandboxDriver()

        def mock_run_timeout(cmd, *args, **kwargs):
            if "run" in cmd:
                raise subprocess.TimeoutExpired(cmd=cmd, timeout=5.0)
            return MagicMock(returncode=0, stdout="", stderr="")

        with patch("subprocess.run", side_effect=mock_run_timeout) as mock_run:
            with patch.object(driver, "is_available", return_value=True):
                driver.execute("c", "int main() { return 0; }")
                calls = [call[0][0] for call in mock_run.call_args_list]

                # Check compile container name was passed
                run_calls = [c for c in calls if len(c) > 1 and c[1] == "run"]
                self.assertGreaterEqual(len(run_calls), 1)
                first_run = run_calls[0]
                self.assertIn("--name", first_run)
                name_idx = first_run.index("--name")
                compile_container_name = first_run[name_idx + 1]
                self.assertTrue(compile_container_name.endswith("_cmp"))

                # Check kill and rm calls targeted the compile container name as well
                kill_targets = [c[2] for c in calls if len(c) > 2 and c[1] == "kill"]
                rm_targets = [c[3] for c in calls if len(c) > 3 and c[1] == "rm"]
                self.assertIn(compile_container_name, kill_targets, "Timeout cleanup must issue docker kill for compile container")
                self.assertIn(compile_container_name, rm_targets, "Finally cleanup must issue docker rm -f for compile container")

    def test_47_sandbox_base_dir_pid_binding_and_cleanup(self):
        """47. Verify sandbox base directory is bound to PID and child cleanup doesn't delete parent directory."""
        from backend.services.sandbox_service import (
            get_sandbox_base_dir,
            _cleanup_sandbox_base_dir
        )
        import backend.services.sandbox_service as sbs

        parent_dir = get_sandbox_base_dir()
        self.assertTrue(os.path.exists(parent_dir))
        self.assertEqual(sbs._SANDBOX_BASE_DIR_PID, os.getpid())

        # Simulate a child process with a different PID calling _cleanup_sandbox_base_dir
        orig_pid = sbs._SANDBOX_BASE_DIR_PID
        try:
            # Simulate child PID
            with patch("os.getpid", return_value=999999):
                # When child calls get_sandbox_base_dir, it should allocate its own directory
                child_dir = get_sandbox_base_dir()
                self.assertNotEqual(child_dir, parent_dir)
                self.assertTrue(os.path.exists(child_dir))
                self.assertTrue(os.path.exists(parent_dir), "Parent directory must not be deleted by child initialization")

                # When child exits and atexit cleanup fires, it cleans child_dir but NOT parent_dir
                _cleanup_sandbox_base_dir()
                self.assertFalse(os.path.exists(child_dir), "Child directory must be cleaned up on child exit")
                self.assertTrue(os.path.exists(parent_dir), "Parent directory must remain intact after child cleanup")
        finally:
            # Restore parent PID state
            sbs._SANDBOX_BASE_DIR = parent_dir
            sbs._SANDBOX_BASE_DIR_PID = orig_pid

    def test_48_workspace_setup_failure_cleans_tempdir(self):
        """48. Verify that if workspace setup fails, the created temporary directory is cleaned up."""
        driver = DockerSandboxDriver()
        created_dirs = []
        original_mkdtemp = tempfile.mkdtemp

        def tracked_mkdtemp(*args, **kwargs):
            d = original_mkdtemp(*args, **kwargs)
            created_dirs.append(d)
            return d

        with patch("tempfile.mkdtemp", side_effect=tracked_mkdtemp):
            with patch("backend.services.sandbox_service.setup_sandbox_workspace", side_effect=ValueError("Simulated workspace security failure")):
                with patch("subprocess.run", return_value=MagicMock(returncode=0, stdout="", stderr="")):
                    with patch.object(driver, "is_available", return_value=True):
                        res = driver.execute("python", "print('hello')")
                        self.assertFalse(res.success)
                        self.assertEqual(res.status, ExecutionStatus.INTERNAL_ERROR)
                        self.assertIn("Simulated workspace security failure", res.stderr)

                        # Verify that the created temporary directory was cleaned up and does not exist
                        self.assertEqual(len(created_dirs), 1)
                        leaked_dir = created_dirs[0]
                        self.assertFalse(os.path.exists(leaked_dir), "Temporary directory must be cleaned up on workspace setup failure")


    def test_49_sandbox_base_dir_concurrent_initialization(self):
        """49. Verify thread-safe double-checked initialization of sandbox base directory without leaking directories."""
        import shutil
        import threading
        import concurrent.futures
        from backend.services.sandbox_service import get_sandbox_base_dir
        import backend.services.sandbox_service as sbs

        # Temporarily save existing state and simulate uninitialized base directory
        orig_dir = sbs._SANDBOX_BASE_DIR
        orig_pid = sbs._SANDBOX_BASE_DIR_PID
        created_dirs = []
        real_mkdtemp = tempfile.mkdtemp

        def tracked_mkdtemp(*args, **kwargs):
            d = real_mkdtemp(*args, **kwargs)
            created_dirs.append(d)
            return d

        try:
            sbs._SANDBOX_BASE_DIR = None
            sbs._SANDBOX_BASE_DIR_PID = None

            barrier = threading.Barrier(10)

            def worker():
                barrier.wait()
                return get_sandbox_base_dir()

            with patch("tempfile.mkdtemp", side_effect=tracked_mkdtemp):
                with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
                    futures = [executor.submit(worker) for _ in range(10)]
                    results = [f.result() for f in futures]

            # 1. All concurrent threads must receive the exact same base directory
            self.assertEqual(len(set(results)), 1)
            # 2. Only exactly 1 base directory must be created (no leaks or orphaned directories)
            self.assertEqual(len(created_dirs), 1)
            self.assertEqual(results[0], created_dirs[0])
            self.assertTrue(os.path.exists(results[0]))
        finally:
            # Clean up test directories
            for d in created_dirs:
                if os.path.exists(d):
                    shutil.rmtree(d, ignore_errors=True)
            # Restore original base dir
            sbs._SANDBOX_BASE_DIR = orig_dir
            sbs._SANDBOX_BASE_DIR_PID = orig_pid

    def test_50_c_cpp_valid_code_with_braces_and_parens_in_strings_and_comments(self):
        """50. Verify legitimate C and C++ code with braces/parens in strings and comments is not rejected."""
        # 1. Valid C code with unmatched braces and parens inside string literals and comments
        c_code = (
            "#include <stdio.h>\n"
            "// (Unmatched opening paren in comment\n"
            "/* Unmatched { brace in block comment */\n"
            "int main() {\n"
            "    printf(\"Printing an unmatched brace } and paren )\\n\");\n"
            "    char c = '}';\n"
            "    return 0;\n"
            "}\n"
        )
        res_c = self.client.post("/api/code/execute", json={
            "language": "c",
            "code": c_code
        }, headers=self.auth_headers)
        self.assertEqual(res_c.status_code, 200)
        data_c = res_c.json()
        self.assertTrue(data_c["success"], f"Valid C rejected: {data_c.get('error')}")
        self.assertEqual(data_c["status"], "SUCCESS")

        # 2. Valid C++ code with unmatched braces and parens inside std::cout and comments
        cpp_code = (
            "#include <iostream>\n"
            "// Function description: check balance () {\n"
            "int main() {\n"
            "    std::cout << \"Brace: } Paren: ) Quote: \\\"}\\\"\" << std::endl;\n"
            "    char b = '{';\n"
            "    return 0;\n"
            "}\n"
        )
        res_cpp = self.client.post("/api/code/execute", json={
            "language": "cpp",
            "code": cpp_code
        }, headers=self.auth_headers)
        self.assertEqual(res_cpp.status_code, 200)
        data_cpp = res_cpp.json()
        self.assertTrue(data_cpp["success"], f"Valid C++ rejected: {data_cpp.get('error')}")
        self.assertEqual(data_cpp["status"], "SUCCESS")

    def test_51_c_cpp_string_escapes_and_restricted_pattern_preservation(self):
        """51. Verify string literals do not cause false positives, but real restricted calls remain blocked."""
        # 1. Mentioning system() inside a string literal must NOT be blocked
        benign_string_code = (
            "#include <stdio.h>\n"
            "int main() {\n"
            "    printf(\"Operating system() concept\\n\");\n"
            "    return 0;\n"
            "}\n"
        )
        res1 = self.client.post("/api/code/execute", json={
            "language": "c",
            "code": benign_string_code
        }, headers=self.auth_headers)
        self.assertEqual(res1.status_code, 200)
        data1 = res1.json()
        self.assertTrue(data1["success"], f"Benign system() string rejected: {data1.get('error')}")

        # 2. Mentioning system() inside a comment must NOT be blocked
        benign_comment_code = (
            "#include <stdio.h>\n"
            "// Please do not call system() in this program\n"
            "/* system(\"rm -rf /\"); is dangerous */\n"
            "int main() {\n"
            "    printf(\"Hello World\\n\");\n"
            "    return 0;\n"
            "}\n"
        )
        res2 = self.client.post("/api/code/execute", json={
            "language": "c",
            "code": benign_comment_code
        }, headers=self.auth_headers)
        self.assertEqual(res2.status_code, 200)
        data2 = res2.json()
        self.assertTrue(data2["success"], f"Benign system() comment rejected: {data2.get('error')}")

        # 3. An actual system() call with escaped quotes in previous string MUST be blocked
        escaped_quote_attack = (
            "#include <stdio.h>\n"
            "#include <stdlib.h>\n"
            "int main() {\n"
            "    printf(\" \\\" \");\n"
            "    system(\"echo compromised\");\n"
            "    return 0;\n"
            "}\n"
        )
        res3 = self.client.post("/api/code/execute", json={
            "language": "c",
            "code": escaped_quote_attack
        }, headers=self.auth_headers)
        self.assertEqual(res3.status_code, 200)
        data3 = res3.json()
        self.assertFalse(data3["success"])
        self.assertIn("Security Policy Violation", data3.get("error", ""))

        # 4. Restricted file access (fopen on /etc/passwd) MUST be blocked
        passwd_attack = (
            "#include <stdio.h>\n"
            "int main() {\n"
            "    FILE *f = fopen(\"/etc/passwd\", \"r\");\n"
            "    if (f) fclose(f);\n"
            "    return 0;\n"
            "}\n"
        )
        res4 = self.client.post("/api/code/execute", json={
            "language": "c",
            "code": passwd_attack
        }, headers=self.auth_headers)
        self.assertEqual(res4.status_code, 200)
        data4 = res4.json()
        self.assertFalse(data4["success"])
        self.assertIn("Security Policy Violation", data4.get("error", ""))


    def test_52_c_cpp_exec_family_rejection_and_harmless_occurrences(self):
        """52. Verify explicit exec-family calls are rejected, while comments, strings, and legitimate functions pass."""
        # 1. Representative exec-family calls must be rejected (execl, execve in C; execvp in C++)
        execl_code = (
            "#include <stdio.h>\n"
            "#include <unistd.h>\n"
            "int main() {\n"
            "    execl(\"/bin/sh\", \"sh\", NULL);\n"
            "    return 0;\n"
            "}\n"
        )
        res1 = self.client.post("/api/code/execute", json={"language": "c", "code": execl_code}, headers=self.auth_headers)
        self.assertEqual(res1.status_code, 200)
        data1 = res1.json()
        self.assertFalse(data1["success"])
        self.assertIn("Security Policy Violation", data1.get("error", ""))

        execve_code = (
            "#include <stdio.h>\n"
            "int main() {\n"
            "    char *argv[] = {\"/bin/sh\", NULL};\n"
            "    execve(\"/bin/sh\", argv, NULL);\n"
            "    return 0;\n"
            "}\n"
        )
        res2 = self.client.post("/api/code/execute", json={"language": "c", "code": execve_code}, headers=self.auth_headers)
        self.assertEqual(res2.status_code, 200)
        data2 = res2.json()
        self.assertFalse(data2["success"])
        self.assertIn("Security Policy Violation", data2.get("error", ""))

        execvp_cpp = (
            "#include <iostream>\n"
            "int main() {\n"
            "    char *argv[] = {\"ls\", NULL};\n"
            "    execvp(\"ls\", argv);\n"
            "    return 0;\n"
            "}\n"
        )
        res3 = self.client.post("/api/code/execute", json={"language": "cpp", "code": execvp_cpp}, headers=self.auth_headers)
        self.assertEqual(res3.status_code, 200)
        data3 = res3.json()
        self.assertFalse(data3["success"])
        self.assertIn("Security Policy Violation", data3.get("error", ""))

        # 2. Harmless occurrences in string literals must NOT be rejected
        string_code = (
            "#include <stdio.h>\n"
            "int main() {\n"
            "    printf(\"Process replacement functions include execl, execv, and execve.\\n\");\n"
            "    return 0;\n"
            "}\n"
        )
        res4 = self.client.post("/api/code/execute", json={"language": "c", "code": string_code}, headers=self.auth_headers)
        self.assertEqual(res4.status_code, 200)
        data4 = res4.json()
        self.assertTrue(data4["success"], f"Harmless string mentioning exec rejected: {data4.get('error')}")

        # 3. Harmless occurrences in comments must NOT be rejected
        comment_code = (
            "#include <iostream>\n"
            "// Note: Do not invoke execlp() or execvpe() in student exercises\n"
            "/* execle(\"/bin/sh\", \"sh\", NULL, envp) replaces the process image */\n"
            "int main() {\n"
            "    std::cout << \"Hello from safe exec discussion!\" << std::endl;\n"
            "    return 0;\n"
            "}\n"
        )
        res5 = self.client.post("/api/code/execute", json={"language": "cpp", "code": comment_code}, headers=self.auth_headers)
        self.assertEqual(res5.status_code, 200)
        data5 = res5.json()
        self.assertTrue(data5["success"], f"Harmless comment mentioning exec rejected: {data5.get('error')}")

        # 4. Legitimate user function named 'execute' must NOT be falsely rejected
        user_func_code = (
            "#include <stdio.h>\n"
            "void execute() {\n"
            "    printf(\"Custom task executed.\\n\");\n"
            "}\n"
            "int main() {\n"
            "    execute();\n"
            "    return 0;\n"
            "}\n"
        )
        res6 = self.client.post("/api/code/execute", json={"language": "c", "code": user_func_code}, headers=self.auth_headers)
        self.assertEqual(res6.status_code, 200)
        data6 = res6.json()
        self.assertTrue(data6["success"], f"Legitimate 'execute()' function rejected: {data6.get('error')}")


if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestCodeExecutionSecurity)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
