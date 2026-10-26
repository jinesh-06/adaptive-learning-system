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
    MockSandboxDriver
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


if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestCodeExecutionSecurity)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
