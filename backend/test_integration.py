"""Comprehensive End-to-End Integration Test Suite.

Verifies:
1. ML Module (Model Loading, Inference, Feature extraction, Evaluation)
2. RAG Module (ChromaDB Retrieval, Context formatting, Multi-language coverage)
3. LLM Module (Adaptive prompt conditioning, Response generation, Progressive hints)
4. Cognitive Engine (Learner Signals, Adaptive Learning Insights, Suggested Adaptations, Mode switching)
5. Backend REST APIs (Auth, Courses, Quizzes, Code Runner, Telemetry, Adaptive, Diagnostics)
"""

import sys
import unittest
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.ml_service import ml_service
from backend.services.rag_service import rag_service
from backend.services.llm_service import llm_service


class TestFullIntegration(unittest.TestCase):
    """End-to-End integration test suite."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    # ================= 1. ML Tests =================
    def test_01_ml_prediction(self):
        """Test ML cognitive load inference on behavioral telemetry."""
        payload_high = {
            "timeSpentSeconds": 1800,  # 30 min
            "recentQuizAccuracy": 40,
            "accuracy": 40,
            "quiz_attempts": 3,
            "backtracking": 4,
            "hesitation_time_seconds": 25,
            "scroll_speed": 0.8
        }
        res = ml_service.evaluate(payload_high)
        self.assertIn("cognitive_load", res)
        self.assertIn(res["cognitive_load"], ["LOW", "MEDIUM", "HIGH"])
        self.assertGreaterEqual(res["confidence"], 0.5)
        self.assertIn("recommended_action", res)
        self.assertIn("contributing_factors", res)
        self.assertIsInstance(res["contributing_factors"], list)

    def test_02_ml_metrics(self):
        """Test ML metrics report."""
        metrics = ml_service.get_metrics()
        self.assertIn("best_model", metrics)
        self.assertIn("models_comparison", metrics)
        self.assertGreaterEqual(metrics["best_f1"], 0.90)

    # ================= 2. RAG Tests =================
    def test_03_rag_retrieval(self):
        """Test RAG retrieval from ChromaDB knowledge base."""
        query = "Explain memory management and pointers"
        chunks = rag_service.retrieve(query=query, course="c", top_k=3)
        self.assertIsInstance(chunks, list)
        self.assertGreater(len(chunks), 0)
        first_chunk = chunks[0]
        self.assertIn("text", first_chunk)
        self.assertEqual(first_chunk.get("course"), "c")

    def test_04_rag_context_formatting(self):
        """Test formatting of retrieved documents for LLM prompts."""
        context = rag_service.get_formatted_context(
            query="Python loops",
            course="python",
            topic="control_flow",
            top_k=2
        )
        self.assertIsInstance(context, str)
        self.assertIn("COURSE: PYTHON", context)

    # ================= 3. LLM Tests =================
    def test_05_llm_adaptive_generation(self):
        """Test LLM adaptive explanation conditioned on cognitive load."""
        res_high = llm_service.generate_explanation(
            question="What is a loop?",
            cognitive_load="HIGH",
            course="python",
            topic="loops"
        )
        self.assertTrue(res_high.get("success"))
        self.assertIn("answer", res_high)
        self.assertEqual(res_high.get("cognitive_load"), "HIGH")
        self.assertIn("adaptation", res_high)

    def test_06_llm_progressive_hints(self):
        """Test multi-tier progressive hints."""
        hint1 = llm_service.generate_hint(
            question="Calculate sum of array elements",
            hint_level=1,
            cognitive_load="MEDIUM",
            topic="arrays"
        )
        self.assertTrue(hint1.get("success"))
        self.assertEqual(hint1.get("hint_level"), 1)
        self.assertIn("hint", hint1)

    # ================= 4. FastAPI Backend API Tests =================
    def test_07_root_and_health(self):
        """Test root and health check endpoints."""
        res_root = self.client.get("/")
        self.assertEqual(res_root.status_code, 200)
        self.assertEqual(res_root.json().get("status"), "online")

        res_health = self.client.get("/health")
        self.assertEqual(res_health.status_code, 200)
        self.assertEqual(res_health.json().get("status"), "healthy")

    def test_08_auth_flow(self):
        """Test user register, login, me, and preferences."""
        reg_res = self.client.post("/api/auth/register", json={
            "name": "Integration Tester",
            "email": "tester@adaptive.edu",
            "password": "Password123!"
        })
        self.assertEqual(reg_res.status_code, 200)
        token = reg_res.json().get("token")
        self.assertTrue(token)

        login_res = self.client.post("/api/auth/login", json={
            "email": "tester@adaptive.edu",
            "password": "Password123!"
        })
        self.assertEqual(login_res.status_code, 200)
        self.assertTrue(login_res.json().get("success"))

        me_res = self.client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me_res.status_code, 200)
        self.assertIn("user", me_res.json())

    def test_09_curriculum_apis(self):
        """Test courses and topic syllabus endpoints."""
        courses_res = self.client.get("/api/courses?language=python")
        self.assertEqual(courses_res.status_code, 200)
        courses = courses_res.json()
        self.assertIsInstance(courses, list)
        self.assertGreater(len(courses), 0)

        course_id = courses[0]["id"]
        detail_res = self.client.get(f"/api/courses/{course_id}")
        self.assertEqual(detail_res.status_code, 200)

        topic_res = self.client.get("/api/topics/top-py-loops")
        self.assertEqual(topic_res.status_code, 200)
        topic = topic_res.json()
        self.assertIn("title", topic)
        self.assertIn("sections", topic)

    def test_10_quiz_and_cognitive_evaluation(self):
        """Test quiz retrieval and grading with adaptive cognitive insight."""
        quiz_res = self.client.get("/api/topics/top-py-loops/quiz")
        self.assertEqual(quiz_res.status_code, 200)
        questions = quiz_res.json().get("questions", [])
        self.assertGreater(len(questions), 0)

        # Submit answers
        submit_res = self.client.post("/api/topics/top-py-loops/quiz/submit", json={
            "answers": {str(questions[0]["id"]): 0},
            "time_spent": 45.0
        })
        self.assertEqual(submit_res.status_code, 200)
        data = submit_res.json()
        self.assertIn("score", data)
        self.assertIn("cognitive_insight", data)
        insight = data["cognitive_insight"]
        self.assertIn("cognitive_load", insight)
        self.assertIn("confidence", insight)
        self.assertIn("recommended_action", insight)

    def test_11_code_execution_and_submission(self):
        """Test isolated Python code runner and code challenge submission."""
        code_run_res = self.client.post("/api/code/run", json={
            "code": "print('Integrated Test Result:', 21 * 2)",
            "language": "python"
        })
        self.assertEqual(code_run_res.status_code, 200)
        run_data = code_run_res.json()
        self.assertTrue(run_data.get("success"))
        self.assertIn("Integrated Test Result: 42", run_data.get("stdout"))

        # Submit challenge
        submit_res = self.client.post("/api/code/submit", json={
            "topicId": "top-py-loops",
            "code": "def solution():\n    return 42\nprint(solution())",
            "codingTimeSeconds": 25.0,
            "keystrokes": 35,
            "pasteEvents": 0
        })
        self.assertEqual(submit_res.status_code, 200)
        self.assertIn("cognitive_insight", submit_res.json())

    def test_12_telemetry_event_logging(self):
        """Test sending telemetry learning signals."""
        res = self.client.post("/api/behavior/event", json={
            "topic_id": "top-py-loops",
            "event_type": "PAGE_VIEW",
            "duration": 12.5,
            "metadata": {"scroll_depth": 0.8}
        })
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json().get("success"))

    def test_13_adaptive_engine_evaluate_and_history(self):
        """Test direct adaptive evaluate endpoint and historical retrieval."""
        eval_res = self.client.post("/api/adaptive/evaluate", json={
            "topicId": "top-py-loops",
            "recentQuizAccuracy": 85.0,
            "codingErrorCount": 0,
            "timeSpentSeconds": 150.0
        })
        self.assertEqual(eval_res.status_code, 200)
        eval_data = eval_res.json()
        self.assertIn("cognitive_load", eval_data)
        self.assertIn("suggested_adaptation", eval_data)

        hist_res = self.client.get("/api/adaptive/history")
        self.assertEqual(hist_res.status_code, 200)
        self.assertIsInstance(hist_res.json(), list)

    def test_14_ai_assistant_and_hints(self):
        """Test AI assistant asking with RAG + LLM integration."""
        ai_res = self.client.post("/api/ai/ask", json={
            "question": "What is the difference between for and while loops?",
            "language": "python",
            "topic": "loops",
            "cognitive_load": "MEDIUM"
        })
        self.assertEqual(ai_res.status_code, 200)
        data = ai_res.json()
        self.assertTrue(data.get("success"))
        self.assertIn("answer", data)
        self.assertIn("retrieved_context", data)

        hint_res = self.client.post("/api/ai/hint", json={
            "question": "Loop syntax error",
            "hint_level": 1,
            "topic": "loops",
            "language": "python"
        })
        self.assertEqual(hint_res.status_code, 200)
        self.assertTrue(hint_res.json().get("success"))

    def test_15_admin_and_diagnostics(self):
        """Test admin analytics and system diagnostics."""
        diag_res = self.client.post("/api/admin/run-diagnostics")
        self.assertEqual(diag_res.status_code, 200)
        data = diag_res.json()
        self.assertTrue(data.get("success"))
        self.assertIn("diagnostics", data)
        self.assertEqual(data["diagnostics"]["ml_engine"]["status"], "HEALTHY")
        self.assertEqual(data["diagnostics"]["rag_engine"]["status"], "HEALTHY")
        self.assertEqual(data["diagnostics"]["llm_engine"]["status"], "HEALTHY")
        self.assertEqual(data["diagnostics"]["database"]["status"], "HEALTHY")


if __name__ == "__main__":
    import os
    suite = unittest.TestLoader().loadTestsFromTestCase(TestFullIntegration)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    os._exit(0 if result.wasSuccessful() else 1)
