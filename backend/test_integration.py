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
from unittest.mock import patch

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi.testclient import TestClient
import sqlite3
import uuid
from datetime import datetime, timedelta
import jwt

from backend.main import app
from backend.services.ml_service import ml_service
from backend.services.rag_service import rag_service
from backend.services.llm_service import llm_service
from backend.services.state_store import state_store
from backend.routes.auth_routes import JWT_SECRET, JWT_ALGORITHM


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
        self.assertIn("predicted_cognitive_load", res)
        self.assertEqual(res["predicted_cognitive_load"], res["cognitive_load"])
        self.assertIn("cognitive_level", res)
        self.assertEqual(res["cognitive_level"], res["cognitive_load"])
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


    # ================= 6. Diagnostic Assessment Tests =================
    def test_16_diagnostic_submit_high_cognitive_load_calibration(self):
        """Test HIGH cognitive-load propagation and beginner/SIMPLIFIED track calibration."""
        mock_eval = {
            "cognitive_load": "HIGH",
            "cognitive_level": "HIGH",
            "predicted_cognitive_load": "HIGH",
            "confidence": 0.94,
            "content_mode": "SIMPLIFIED",
            "contributing_factors": ["High hesitation and struggle"]
        }
        with patch.object(ml_service, "evaluate", return_value=mock_eval):
            # Perfect score (100%), but HIGH cognitive load must route to beginner + SIMPLIFIED
            payload = {
                "answers": {
                    "diag-py-1": 1,
                    "diag-py-2": 2,
                    "diag-py-3": 1,
                    "diag-py-4": 0,
                    "diag-py-5": 0,
                    "diag-py-6": 0
                },
                "time_spent": 300.0,
                "observations": {
                    "revisions_count": 5,
                    "avg_hesitation_seconds": 18.0
                }
            }
            res = self.client.post("/api/diagnostic/python/submit", json=payload)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data.get("success"))
            self.assertEqual(data.get("recommended_level"), "beginner")
            self.assertEqual(data.get("suggested_content_mode"), "SIMPLIFIED")

            diag = data.get("diagnostic_result", {})
            self.assertEqual(diag.get("cognitive_load"), "HIGH")
            self.assertEqual(diag.get("suggested_mode"), "SIMPLIFIED")
            self.assertEqual(diag.get("recommended_level"), "beginner")
            self.assertEqual(diag.get("starting_topic_id"), "top-py-fundamentals")
            self.assertEqual(diag.get("observations", {}).get("predicted_load"), "HIGH")

    def test_17_diagnostic_submit_low_cognitive_load_calibration(self):
        """Test LOW cognitive-load propagation and advanced/CONCISE track calibration."""
        mock_eval = {
            "cognitive_load": "LOW",
            "cognitive_level": "LOW",
            "predicted_cognitive_load": "LOW",
            "confidence": 0.92,
            "content_mode": "CONCISE",
            "contributing_factors": ["Rapid traversal", "Strong accuracy"]
        }
        with patch.object(ml_service, "evaluate", return_value=mock_eval):
            # Perfect score (100%) and LOW load -> advanced + CONCISE
            payload = {
                "answers": {
                    "diag-py-1": 1,
                    "diag-py-2": 2,
                    "diag-py-3": 1,
                    "diag-py-4": 0,
                    "diag-py-5": 0,
                    "diag-py-6": 0
                },
                "time_spent": 60.0,
                "observations": {
                    "revisions_count": 0,
                    "avg_hesitation_seconds": 2.0
                }
            }
            res = self.client.post("/api/diagnostic/python/submit", json=payload)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data.get("success"))
            self.assertEqual(data.get("recommended_level"), "advanced")
            self.assertEqual(data.get("suggested_content_mode"), "CONCISE")

            diag = data.get("diagnostic_result", {})
            self.assertEqual(diag.get("cognitive_load"), "LOW")
            self.assertEqual(diag.get("suggested_mode"), "CONCISE")
            self.assertEqual(diag.get("recommended_level"), "advanced")
            self.assertEqual(diag.get("starting_topic_id"), "top-py-recursion")
            self.assertEqual(diag.get("observations", {}).get("predicted_load"), "LOW")

    def test_18_diagnostic_submit_medium_cognitive_load_calibration(self):
        """Test MEDIUM cognitive-load propagation and intermediate/BALANCED track calibration."""
        mock_eval = {
            "cognitive_load": "MEDIUM",
            "cognitive_level": "MEDIUM",
            "predicted_cognitive_load": "MEDIUM",
            "confidence": 0.88,
            "content_mode": "BALANCED",
            "contributing_factors": ["Consistent pace"]
        }
        with patch.object(ml_service, "evaluate", return_value=mock_eval):
            # 4 out of 6 correct = 67% score with MEDIUM load -> intermediate + BALANCED
            payload = {
                "answers": {
                    "diag-py-1": 1,
                    "diag-py-2": 2,
                    "diag-py-3": 1,
                    "diag-py-4": 0,
                    "diag-py-5": 99,
                    "diag-py-6": 99
                },
                "time_spent": 120.0,
                "observations": {
                    "revisions_count": 1,
                    "avg_hesitation_seconds": 6.0
                }
            }
            res = self.client.post("/api/diagnostic/python/submit", json=payload)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data.get("success"))
            self.assertEqual(data.get("recommended_level"), "intermediate")
            self.assertEqual(data.get("suggested_content_mode"), "BALANCED")

            diag = data.get("diagnostic_result", {})
            self.assertEqual(diag.get("cognitive_load"), "MEDIUM")
            self.assertEqual(diag.get("suggested_mode"), "BALANCED")
            self.assertEqual(diag.get("recommended_level"), "intermediate")
            self.assertEqual(diag.get("starting_topic_id"), "top-py-functions")

    def test_19_diagnostic_submit_fallback_when_keys_missing_or_empty(self):
        """Test fallback to MEDIUM when cognitive load keys are missing or empty."""
        payload = {
            "answers": {
                "diag-py-1": 1,
                "diag-py-2": 2,
                "diag-py-3": 1,
                "diag-py-4": 0,
                "diag-py-5": 0,
                "diag-py-6": 0
            },
            "time_spent": 100.0
        }

        # Case 1: Empty dictionary returned from evaluate
        with patch.object(ml_service, "evaluate", return_value={}):
            res = self.client.post("/api/diagnostic/python/submit", json=payload)
            self.assertEqual(res.status_code, 200)
            diag = res.json().get("diagnostic_result", {})
            self.assertEqual(diag.get("cognitive_load"), "MEDIUM")
            self.assertEqual(diag.get("observations", {}).get("predicted_load"), "MEDIUM")

        # Case 2: Keys exist but are None, whitespace, or empty string
        mock_empty_keys = {
            "cognitive_load": "",
            "cognitive_level": None,
            "predicted_cognitive_load": "   "
        }
        with patch.object(ml_service, "evaluate", return_value=mock_empty_keys):
            res = self.client.post("/api/diagnostic/python/submit", json=payload)
            self.assertEqual(res.status_code, 200)
            diag = res.json().get("diagnostic_result", {})
            self.assertEqual(diag.get("cognitive_load"), "MEDIUM")
            self.assertEqual(diag.get("observations", {}).get("predicted_load"), "MEDIUM")

    def test_20_diagnostic_submit_priority_on_conflicting_aliases(self):
        """Test strict priority order: cognitive_load > cognitive_level > predicted_cognitive_load."""
        payload = {
            "answers": {
                "diag-py-1": 1,
                "diag-py-2": 2,
                "diag-py-3": 1,
                "diag-py-4": 0,
                "diag-py-5": 0,
                "diag-py-6": 0
            },
            "time_spent": 100.0
        }

        # Priority 1: cognitive_load overrides cognitive_level and predicted_cognitive_load
        mock_conflict_1 = {
            "cognitive_load": "HIGH",
            "cognitive_level": "LOW",
            "predicted_cognitive_load": "MEDIUM"
        }
        with patch.object(ml_service, "evaluate", return_value=mock_conflict_1):
            res = self.client.post("/api/diagnostic/python/submit", json=payload)
            self.assertEqual(res.status_code, 200)
            diag = res.json().get("diagnostic_result", {})
            self.assertEqual(diag.get("cognitive_load"), "HIGH")
            self.assertEqual(diag.get("suggested_mode"), "SIMPLIFIED")

        # Priority 2: cognitive_level is used when cognitive_load is empty
        mock_conflict_2 = {
            "cognitive_load": "",
            "cognitive_level": "LOW",
            "predicted_cognitive_load": "HIGH"
        }
        with patch.object(ml_service, "evaluate", return_value=mock_conflict_2):
            res = self.client.post("/api/diagnostic/python/submit", json=payload)
            self.assertEqual(res.status_code, 200)
            diag = res.json().get("diagnostic_result", {})
            self.assertEqual(diag.get("cognitive_load"), "LOW")
            self.assertEqual(diag.get("suggested_mode"), "CONCISE")

        # Priority 3: predicted_cognitive_load is used when first two are empty
        mock_conflict_3 = {
            "cognitive_load": None,
            "cognitive_level": "  ",
            "predicted_cognitive_load": "HIGH"
        }
        with patch.object(ml_service, "evaluate", return_value=mock_conflict_3):
            res = self.client.post("/api/diagnostic/python/submit", json=payload)
            self.assertEqual(res.status_code, 200)
            diag = res.json().get("diagnostic_result", {})
            self.assertEqual(diag.get("cognitive_load"), "HIGH")
            self.assertEqual(diag.get("suggested_mode"), "SIMPLIFIED")

    def test_21_diagnostic_submit_response_schema_compatibility(self):
        """Test full diagnostic submission response structure compatibility with live ML model."""
        payload = {
            "answers": {
                "diag-py-1": 1,
                "diag-py-2": 2,
                "diag-py-3": 1,
                "diag-py-4": 0,
                "diag-py-5": 0,
                "diag-py-6": 0
            },
            "time_spent": 150.0,
            "observations": {
                "revisions_count": 1,
                "avg_hesitation_seconds": 4.5
            }
        }
        res = self.client.post("/api/diagnostic/python/submit", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Top-level contract verification
        required_top_keys = [
            "success", "score", "total", "score_percentage",
            "recommended_level", "suggested_content_mode",
            "diagnostic_result", "question_breakdown", "message"
        ]
        for key in required_top_keys:
            self.assertIn(key, data)

        self.assertEqual(data["score"], 6)
        self.assertEqual(data["total"], 6)
        self.assertEqual(data["score_percentage"], 100)
        self.assertIsInstance(data["question_breakdown"], list)
        self.assertEqual(len(data["question_breakdown"]), 6)

        # Diagnostic result dictionary verification
        diag = data["diagnostic_result"]
        required_diag_keys = [
            "language", "total_score", "concept_score", "problem_solving_score",
            "coding_score", "recommended_level", "starting_topic_id",
            "cognitive_load", "suggested_mode", "confidence",
            "contributing_factors", "evaluated_at", "observations"
        ]
        for key in required_diag_keys:
            self.assertIn(key, diag)

        self.assertIn(diag["cognitive_load"], ["LOW", "MEDIUM", "HIGH"])
        self.assertIn(diag["suggested_mode"], ["SIMPLIFIED", "BALANCED", "CONCISE"])
        self.assertIn(diag["recommended_level"], ["beginner", "intermediate", "advanced"])
        self.assertIn(diag["observations"]["predicted_load"], ["LOW", "MEDIUM", "HIGH"])

    # ================= 6. Task 2 Dashboard & Metrics Contract Tests =================

    def test_22_new_learner_zero_empty_state(self):
        """Verify that a brand new learner with no activity receives genuine zero/empty metrics."""
        user_id = f"test_user_empty_{uuid.uuid4().hex[:8]}"
        stats = state_store.get_learner_dashboard_stats(user_id)

        # Verify nested structure
        self.assertEqual(stats["learning_snapshot"]["overall_progress"], 0)
        self.assertEqual(stats["learning_snapshot"]["quiz_accuracy"], 0)
        self.assertIsNone(stats["learning_snapshot"]["coding_accuracy"])
        self.assertEqual(stats["learning_snapshot"]["learning_time_minutes"], 0)
        self.assertEqual(stats["learning_snapshot"]["topics_completed"], 0)
        self.assertEqual(stats["streak_days"], 0)
        self.assertEqual(stats["snapshot"]["streak_days"], 0)
        self.assertEqual(stats["topic_progress"], 0)
        self.assertEqual(len(stats["cognitive_trend"]), 0)
        self.assertEqual(len(stats["achievements"]["unlocked"]), 0)
        self.assertEqual(len(stats["recent_activity"]), 0)

        # Verify legacy flat keys
        self.assertEqual(stats["overall_progress"], 0)
        self.assertEqual(stats["quiz_accuracy"], 0)
        self.assertIsNone(stats["coding_accuracy"])
        self.assertEqual(stats["current_streak_days"], 0)
        self.assertEqual(stats["topics_completed"], 0)

    def test_23_learner_stored_progress_calculation(self):
        """Verify metrics are calculated from learner's actual database records and stored units."""
        user_id = f"test_user_active_{uuid.uuid4().hex[:8]}"

        # Insert known progress records
        state_store.update_topic_progress("top-py-intro", "COMPLETED", 300, user_id=user_id, course_id="py-beg")
        state_store.update_topic_progress("top-py-variables", "COMPLETED", 300, user_id=user_id, course_id="py-beg")

        # 2 quizzes (scores 80 and 90 -> avg = 85)
        state_store.record_quiz_attempt(user_id, "top-py-intro", 80, 2, 60)
        state_store.record_quiz_attempt(user_id, "top-py-variables", 90, 2, 60)

        # 1 CODE_SUBMIT with score 95, duration 240 seconds (4 min) on top-py-intro
        state_store.record_telemetry_event(
            user_id=user_id,
            topic_id="top-py-intro",
            event_type="CODE_SUBMIT",
            duration=240,
            metadata={"score": 95}
        )

        stats = state_store.get_learner_dashboard_stats(user_id)

        # Verified calculations:
        # Topics completed: 2
        self.assertEqual(stats["learning_snapshot"]["topics_completed"], 2)
        # Total topics in curriculum is 238. 2 / 238 * 100 = 1%
        self.assertEqual(stats["learning_snapshot"]["overall_progress"], 1)
        # Quiz accuracy: (80 + 90) / 2 = 85
        self.assertEqual(stats["learning_snapshot"]["quiz_accuracy"], 85)
        self.assertEqual(stats["quiz_attempts_count"], 2)
        # Coding accuracy: 95
        self.assertEqual(stats["learning_snapshot"]["coding_accuracy"], 95)
        # Study time: max(300, 240) for intro + max(300, 0) for variables = 600s = 10 minutes (avoids double-counting)
        self.assertEqual(stats["learning_snapshot"]["learning_time_minutes"], 10)

    def test_24_multi_user_isolation(self):
        """Verify strict multi-user isolation: User A's records never leak to User B."""
        user_a = f"test_user_iso_a_{uuid.uuid4().hex[:8]}"
        user_b = f"test_user_iso_b_{uuid.uuid4().hex[:8]}"

        # User A has 3 completed topics and 100% quiz score
        state_store.update_topic_progress("top-py-intro", "COMPLETED", 120, user_id=user_a, course_id="py-beg")
        state_store.update_topic_progress("top-py-variables", "COMPLETED", 120, user_id=user_a, course_id="py-beg")
        state_store.update_topic_progress("top-py-operators-io", "COMPLETED", 120, user_id=user_a, course_id="py-beg")
        state_store.record_quiz_attempt(user_a, "top-py-intro", 100, 2, 45)

        # User B has only 1 completed topic and 60% quiz score
        state_store.update_topic_progress("top-py-intro", "COMPLETED", 60, user_id=user_b, course_id="py-beg")
        state_store.record_quiz_attempt(user_b, "top-py-intro", 60, 2, 45)

        stats_a = state_store.get_learner_dashboard_stats(user_a)
        stats_b = state_store.get_learner_dashboard_stats(user_b)

        self.assertEqual(stats_a["learning_snapshot"]["topics_completed"], 3)
        self.assertEqual(stats_a["learning_snapshot"]["quiz_accuracy"], 100)

        self.assertEqual(stats_b["learning_snapshot"]["topics_completed"], 1)
        self.assertEqual(stats_b["learning_snapshot"]["quiz_accuracy"], 60)

    def test_25_learning_streak_calculation(self):
        """Verify streak logic: consecutive active days, gaps, and zero activity."""
        # 1. Inactive user -> 0
        user_streak_0 = f"test_user_no_act_{uuid.uuid4().hex[:8]}"
        self.assertEqual(state_store.get_user_streak(user_streak_0), 0)

        # 2. Activity today -> 1
        user_streak_1 = f"test_user_today_{uuid.uuid4().hex[:8]}"
        state_store.record_telemetry_event(
            user_id=user_streak_1,
            topic_id="top-py-intro",
            event_type="LESSON_READ",
            duration=60
        )
        self.assertEqual(state_store.get_user_streak(user_streak_1), 1)

        # 3. Activity older than yesterday (e.g. 3 days ago) -> 0
        user_streak_gap = f"test_user_gap_{uuid.uuid4().hex[:8]}"
        three_days_ago = (datetime.utcnow() - timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S")
        with state_store._lock:
            conn = sqlite3.connect(state_store.db_path)
            conn.cursor().execute(
                "INSERT INTO telemetry_events (user_id, topic_id, event_type, duration, timestamp) VALUES (?, ?, ?, ?, ?)",
                (user_streak_gap, "top-py-intro", "LESSON_READ", 60, three_days_ago)
            )
            conn.commit()
            conn.close()
        self.assertEqual(state_store.get_user_streak(user_streak_gap), 0)

    def test_26_learning_history_api_contract(self):
        """Verify /api/learning-history returns expected 'history', 'insights', and 'recent_events'."""
        user_id = f"test_user_hist_{uuid.uuid4().hex[:8]}"
        token = jwt.encode({"sub": user_id}, JWT_SECRET, algorithm=JWT_ALGORITHM)
        headers = {"Authorization": f"Bearer {token}"}

        # Empty history
        res_empty = self.client.get("/api/learning-history", headers=headers)
        self.assertEqual(res_empty.status_code, 200)
        data_empty = res_empty.json()
        self.assertIn("history", data_empty)
        self.assertIn("insights", data_empty)
        self.assertIn("recent_events", data_empty)
        self.assertEqual(len(data_empty["history"]), 0)
        self.assertEqual(data_empty["insights"]["avg_quiz_score"], 0)
        self.assertEqual(data_empty["insights"]["total_time_minutes"], 0)

        # Add event and quiz
        state_store.record_quiz_attempt(user_id, "top-py-intro", 85, 2, 90)
        res_with_data = self.client.get("/api/learning-history", headers=headers)
        self.assertEqual(res_with_data.status_code, 200)
        data = res_with_data.json()
        self.assertEqual(len(data["history"]), 1)
        self.assertEqual(data["history"][0]["quiz_score"], 85)
        self.assertEqual(data["insights"]["avg_quiz_score"], 85)

    def test_27_roadmap_milestones_status(self):
        """Verify /api/dashboard/roadmap/{language} reflects progress and milestone fields."""
        user_id = f"test_user_road_{uuid.uuid4().hex[:8]}"
        token = jwt.encode({"sub": user_id}, JWT_SECRET, algorithm=JWT_ALGORITHM)
        headers = {"Authorization": f"Bearer {token}"}

        # Initial state: first milestone is UNLOCKED, rest LOCKED
        res = self.client.get("/api/dashboard/roadmap/python", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("milestones", data)
        self.assertIn("roadmap", data)
        milestones = data["milestones"]
        self.assertGreater(len(milestones), 0)
        first_node = milestones[0]
        self.assertIn("topic_id", first_node)
        self.assertIn("module_title", first_node)
        self.assertEqual(first_node["status"], "UNLOCKED")

        # Mark first milestone completed
        state_store.update_topic_progress(first_node["topic_id"], "COMPLETED", 120, user_id=user_id, course_id="py-beg")
        res_after = self.client.get("/api/dashboard/roadmap/python", headers=headers)
        data_after = res_after.json()
        self.assertEqual(data_after["milestones"][0]["status"], "COMPLETED")
        self.assertEqual(data_after["milestones"][1]["status"], "UNLOCKED")

    def test_28_course_routes_use_actual_streak(self):
        """Verify course dashboard routes (python, c, cpp, java) use dynamic streak calculation."""
        user_id = f"test_user_course_{uuid.uuid4().hex[:8]}"
        token = jwt.encode({"sub": user_id}, JWT_SECRET, algorithm=JWT_ALGORITHM)
        headers = {"Authorization": f"Bearer {token}"}

        # 0 streak for inactive user
        res_py = self.client.get("/api/python/fundamentals", headers=headers)
        if res_py.status_code == 200:
            data = res_py.json()
            self.assertEqual(data.get("streak_days"), 0)

        # After activity today, streak becomes 1
        state_store.record_telemetry_event(user_id=user_id, topic_id="top-py-intro", event_type="LESSON_READ", duration=60)
        res_py_active = self.client.get("/api/python/fundamentals", headers=headers)
        if res_py_active.status_code == 200:
            data = res_py_active.json()
            self.assertEqual(data.get("streak_days"), 1)

    # ================= 7. Five Confirmed Bug Regression Tests =================

    def test_29_coding_accuracy_none_when_unsubmitted_and_zero_when_failed(self):
        """Fix 1: coding_accuracy must be None when no submissions exist, and 0 when failed."""
        user_no_sub = f"test_user_no_sub_{uuid.uuid4().hex[:8]}"
        stats_no_sub = state_store.get_learner_dashboard_stats(user_no_sub)
        self.assertIsNone(stats_no_sub["learning_snapshot"]["coding_accuracy"])
        self.assertIsNone(stats_no_sub["coding_accuracy"])

        # User with a genuinely failed submission
        user_failed = f"test_user_fail_{uuid.uuid4().hex[:8]}"
        state_store.record_telemetry_event(
            user_id=user_failed,
            topic_id="top-py-intro",
            event_type="CODE_SUBMIT",
            duration=60,
            metadata={"passed": False, "accuracy": 0}
        )
        stats_failed = state_store.get_learner_dashboard_stats(user_failed)
        self.assertEqual(stats_failed["learning_snapshot"]["coding_accuracy"], 0)
        self.assertEqual(stats_failed["coding_accuracy"], 0)

    def test_30_study_time_no_double_counting(self):
        """Fix 2: Overlapping telemetry and user_progress durations must not be double-counted."""
        user_id = f"test_user_study_{uuid.uuid4().hex[:8]}"
        # User spent 300s reading lesson on top-py-intro
        state_store.save_topic_progress(user_id, "py-beg", "top-py-intro", "IN_PROGRESS", time_spent_delta=300)
        # Then submitted code for top-py-intro: logged 240s to telemetry AND updated topic progress with 240s
        state_store.record_telemetry(user_id, "top-py-intro", "CODE_SUBMIT", 240, {"passed": True, "accuracy": 100})
        state_store.save_topic_progress(user_id, "py-beg", "top-py-intro", "COMPLETED", time_spent_delta=240)

        # Total legitimate study time on top-py-intro is 300 + 240 = 540 seconds (9 minutes)
        # Buggy implementation would sum 240 + 540 = 780s (13 minutes)
        stats = state_store.get_learner_dashboard_stats(user_id)
        self.assertEqual(stats["learning_snapshot"]["learning_time_minutes"], 9)
        self.assertEqual(stats["learning_time_minutes"], 9)

    def test_31_streak_ignores_unstudied_progress_updates(self):
        """Fix 3: Bare user_progress records without study time/completion must not increment streak."""
        user_id = f"test_user_bare_prog_{uuid.uuid4().hex[:8]}"
        # Insert bare unstudied progress record
        state_store.save_topic_progress(user_id, "py-beg", "top-py-intro", "NOT_STARTED", time_spent_delta=0)
        # Streak must remain 0
        self.assertEqual(state_store.get_user_streak(user_id), 0)

        # Once genuine study activity occurs today (time_spent > 0 or telemetry)
        state_store.record_telemetry(user_id, "top-py-intro", "LESSON_READ", 60, {})
        self.assertEqual(state_store.get_user_streak(user_id), 1)

    def test_32_roadmap_in_progress_does_not_unlock_next_milestone(self):
        """Fix 4: An IN_PROGRESS topic must NOT unlock its successor."""
        user_id = f"test_user_road_prog_{uuid.uuid4().hex[:8]}"
        token = jwt.encode({"sub": user_id}, JWT_SECRET, algorithm=JWT_ALGORITHM)
        headers = {"Authorization": f"Bearer {token}"}

        # Topic 1 completed, Topic 2 IN_PROGRESS
        res = self.client.get("/api/dashboard/roadmap/python", headers=headers)
        milestones = res.json()["milestones"]
        t1_id = milestones[0]["topic_id"]
        t2_id = milestones[1]["topic_id"]

        state_store.update_topic_progress(t1_id, "COMPLETED", 120, user_id=user_id, course_id="py-beg")
        state_store.update_topic_progress(t2_id, "IN_PROGRESS", 60, user_id=user_id, course_id="py-beg")

        res_check = self.client.get("/api/dashboard/roadmap/python", headers=headers)
        m = res_check.json()["milestones"]
        self.assertEqual(m[0]["status"], "COMPLETED")
        self.assertEqual(m[1]["status"], "IN_PROGRESS")
        # Topic 3 MUST remain LOCKED because Topic 2 is not completed
        self.assertEqual(m[2]["status"], "LOCKED")

    def test_33_learning_history_cognitive_and_adaptive_state_alignment(self):
        """Fix 5: /api/learning-history must include both cognitive_state and adaptive_state."""
        user_id = f"test_user_hist_align_{uuid.uuid4().hex[:8]}"
        token = jwt.encode({"sub": user_id}, JWT_SECRET, algorithm=JWT_ALGORITHM)
        headers = {"Authorization": f"Bearer {token}"}

        # Record a quiz attempt and telemetry event
        state_store.record_quiz_attempt(user_id, "top-py-intro", 90, 10, 60)
        state_store.record_telemetry(user_id, "top-py-intro", "LESSON_READ", 120, {})

        res = self.client.get("/api/learning-history", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        history = data["history"]
        self.assertGreaterEqual(len(history), 2)
        for item in history:
            self.assertIn("cognitive_state", item)
            self.assertIn("adaptive_state", item)
            self.assertEqual(item["cognitive_state"], item["adaptive_state"])
            self.assertIn(item["cognitive_state"], ["LOW", "MEDIUM", "HIGH"])

    def test_34_learning_history_no_double_counting_quiz_duration(self):
        """Test A: Verify quiz duration is counted once when both quiz_attempts and QUIZ_SUBMIT telemetry exist."""
        user_id = f"test_user_hist_nodbl_{uuid.uuid4().hex[:8]}"
        token = jwt.encode({"sub": user_id}, JWT_SECRET, algorithm=JWT_ALGORITHM)
        headers = {"Authorization": f"Bearer {token}"}

        # Another user to verify isolation
        other_user = f"test_other_{uuid.uuid4().hex[:8]}"
        state_store.record_quiz_attempt(other_user, "top-py-intro", 90, 10, 300)

        # 120s quiz attempt and matching QUIZ_SUBMIT telemetry event
        state_store.record_quiz_attempt(user_id, "top-py-intro", 80, 10, 120.0)
        state_store.record_telemetry(user_id, "top-py-intro", "QUIZ_SUBMIT", 120.0, {
            "percentage": 80.0,
            "correct_count": 8,
            "total_questions": 10,
            "passed": True
        })

        res = self.client.get("/api/learning-history", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Duration must be 120s (2 minutes), not double-counted (240s / 4 minutes)
        self.assertEqual(data["insights"]["total_time_minutes"], 2)
        self.assertEqual(data["total_time_minutes"], 2)

        # Both the quiz attempt and telemetry event must remain present in history
        history_types = [h["type"] for h in data["history"]]
        self.assertIn("QUIZ", history_types)
        self.assertIn("QUIZ_SUBMIT", history_types)
        self.assertEqual(len(data["history"]), 2)

        # Telemetry event remains in recent_events
        self.assertEqual(len(data["recent_events"]), 1)
        self.assertEqual(data["recent_events"][0]["type"], "QUIZ_SUBMIT")
        self.assertEqual(data["recent_events"][0]["duration_seconds"], 120)

    def test_35_learning_history_zero_duration_quiz(self):
        """Test B: Verify quiz duration of zero seconds reports 0s and does not inflate aggregate."""
        user_id = f"test_user_hist_zero_{uuid.uuid4().hex[:8]}"
        token = jwt.encode({"sub": user_id}, JWT_SECRET, algorithm=JWT_ALGORITHM)
        headers = {"Authorization": f"Bearer {token}"}

        state_store.record_quiz_attempt(user_id, "top-py-intro", 90, 10, 0.0)

        res = self.client.get("/api/learning-history", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(len(data["history"]), 1)
        item = data["history"][0]
        # Reports zero seconds, not fallback 60s
        self.assertEqual(item["time_spent_seconds"], 0)
        self.assertEqual(item["duration_seconds"], 0)
        self.assertEqual(data["insights"]["total_time_minutes"], 0)
        self.assertEqual(data["total_time_minutes"], 0)

    def test_36_learning_history_negative_improvement_delta(self):
        """Test C: Verify negative improvement_delta when newest quiz score is lower than previous."""
        user_id = f"test_user_hist_neg_{uuid.uuid4().hex[:8]}"
        token = jwt.encode({"sub": user_id}, JWT_SECRET, algorithm=JWT_ALGORITHM)
        headers = {"Authorization": f"Bearer {token}"}

        earlier_ts = "2026-10-21 10:00:00"
        later_ts = "2026-10-21 10:15:00"

        # Previous attempt: 85%
        att1_id = state_store.save_quiz_attempt(user_id, "top-py-intro", {
            "score": 85,
            "percentage": 85.0,
            "correct_count": 8,
            "total_questions": 10,
            "time_spent": 60
        })
        # Latest attempt: 70%
        att2_id = state_store.save_quiz_attempt(user_id, "top-py-intro", {
            "score": 70,
            "percentage": 70.0,
            "correct_count": 7,
            "total_questions": 10,
            "time_spent": 60
        })

        with state_store._lock:
            conn = state_store.get_connection()
            conn.cursor().execute("UPDATE quiz_attempts SET created_at = ? WHERE id = ?", (earlier_ts, att1_id))
            conn.cursor().execute("UPDATE quiz_attempts SET created_at = ? WHERE id = ?", (later_ts, att2_id))
            conn.commit()
            conn.close()

        res = self.client.get("/api/learning-history", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Delta must be 70 - 85 = -15 (not clamped to 0)
        self.assertEqual(data["insights"]["improvement_delta"], -15)
        self.assertEqual(data["improvement_delta"], -15)
        # Verify newest attempt (70%) is identified first in sorted history
        self.assertEqual(data["history"][0]["quiz_score"], 70)
        self.assertEqual(data["history"][1]["quiz_score"], 85)

    def test_37_learning_history_positive_and_unchanged_delta(self):
        """Test D: Verify positive score delta and unchanged score delta."""
        # 1. Positive delta: 60 -> 75 = +15
        user_pos = f"test_user_hist_pos_{uuid.uuid4().hex[:8]}"
        token_pos = jwt.encode({"sub": user_pos}, JWT_SECRET, algorithm=JWT_ALGORITHM)
        headers_pos = {"Authorization": f"Bearer {token_pos}"}

        earlier_ts = "2026-10-21 11:00:00"
        later_ts = "2026-10-21 11:20:00"

        att_pos1 = state_store.save_quiz_attempt(user_pos, "top-py-intro", {"percentage": 60.0, "time_spent": 60})
        att_pos2 = state_store.save_quiz_attempt(user_pos, "top-py-intro", {"percentage": 75.0, "time_spent": 60})
        with state_store._lock:
            conn = state_store.get_connection()
            conn.cursor().execute("UPDATE quiz_attempts SET created_at = ? WHERE id = ?", (earlier_ts, att_pos1))
            conn.cursor().execute("UPDATE quiz_attempts SET created_at = ? WHERE id = ?", (later_ts, att_pos2))
            conn.commit()
            conn.close()

        res_pos = self.client.get("/api/learning-history", headers=headers_pos)
        self.assertEqual(res_pos.status_code, 200)
        self.assertEqual(res_pos.json()["insights"]["improvement_delta"], 15)
        self.assertEqual(res_pos.json()["improvement_delta"], 15)

        # 2. Unchanged delta: 80 -> 80 = 0
        user_eq = f"test_user_hist_eq_{uuid.uuid4().hex[:8]}"
        token_eq = jwt.encode({"sub": user_eq}, JWT_SECRET, algorithm=JWT_ALGORITHM)
        headers_eq = {"Authorization": f"Bearer {token_eq}"}

        att_eq1 = state_store.save_quiz_attempt(user_eq, "top-py-intro", {"percentage": 80.0, "time_spent": 60})
        att_eq2 = state_store.save_quiz_attempt(user_eq, "top-py-intro", {"percentage": 80.0, "time_spent": 60})
        with state_store._lock:
            conn = state_store.get_connection()
            conn.cursor().execute("UPDATE quiz_attempts SET created_at = ? WHERE id = ?", (earlier_ts, att_eq1))
            conn.cursor().execute("UPDATE quiz_attempts SET created_at = ? WHERE id = ?", (later_ts, att_eq2))
            conn.commit()
            conn.close()

        res_eq = self.client.get("/api/learning-history", headers=headers_eq)
        self.assertEqual(res_eq.status_code, 200)
        self.assertEqual(res_eq.json()["insights"]["improvement_delta"], 0)
        self.assertEqual(res_eq.json()["improvement_delta"], 0)

        # 3. Only one attempt: delta = 0
        user_single = f"test_user_hist_single_{uuid.uuid4().hex[:8]}"
        token_single = jwt.encode({"sub": user_single}, JWT_SECRET, algorithm=JWT_ALGORITHM)
        headers_single = {"Authorization": f"Bearer {token_single}"}
        state_store.record_quiz_attempt(user_single, "top-py-intro", 80, 10, 60)
        res_single = self.client.get("/api/learning-history", headers=headers_single)
        self.assertEqual(res_single.status_code, 200)
        self.assertEqual(res_single.json()["insights"]["improvement_delta"], 0)
        self.assertEqual(res_single.json()["improvement_delta"], 0)

    def test_38_learning_history_api_compatibility(self):
        """Test E: Verify all expected API keys, cognitive_state, and adaptive_state compatibility."""
        user_compat = f"test_user_hist_compat_{uuid.uuid4().hex[:8]}"
        token_compat = jwt.encode({"sub": user_compat}, JWT_SECRET, algorithm=JWT_ALGORITHM)
        headers_compat = {"Authorization": f"Bearer {token_compat}"}

        state_store.record_quiz_attempt(user_compat, "top-py-intro", 80, 10, 60)
        state_store.record_telemetry(user_compat, "top-py-intro", "LESSON_READ", 60, {})

        res = self.client.get("/api/learning-history", headers=headers_compat)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        expected_keys = [
            "success",
            "history",
            "recent_events",
            "insights",
            "avg_quiz_score",
            "avg_coding_score",
            "total_time_minutes",
            "improvement_delta",
            "adaptive_efficiency_rate"
        ]
        for k in expected_keys:
            self.assertIn(k, data)

        insights_keys = [
            "avg_quiz_score",
            "avg_coding_score",
            "total_time_minutes",
            "improvement_delta",
            "adaptive_efficiency_rate"
        ]
        for k in insights_keys:
            self.assertIn(k, data["insights"])

        self.assertGreaterEqual(len(data["history"]), 2)
        for item in data["history"]:
            self.assertIn("adaptive_state", item)
            self.assertIn("cognitive_state", item)
            self.assertEqual(item["adaptive_state"], item["cognitive_state"])
            self.assertIn(item["cognitive_state"], ["LOW", "MEDIUM", "HIGH"])

    def test_39_learning_history_mixed_timestamp_timezone_normalization(self):
        """Verify sorting and duplicate matching handle mixed timezone-aware and SQL-naive timestamps."""
        user_id = f"test_user_hist_tz_{uuid.uuid4().hex[:8]}"
        token = jwt.encode({"sub": user_id}, JWT_SECRET, algorithm=JWT_ALGORITHM)
        headers = {"Authorization": f"Bearer {token}"}

        # Attempt 1: SQL-style timestamp without timezone (older: 80%)
        att1_id = state_store.save_quiz_attempt(user_id, "top-py-intro", {
            "percentage": 80.0,
            "score": 80.0,
            "correct_count": 8,
            "total_questions": 10,
            "time_spent": 120
        })
        with state_store._lock:
            conn = state_store.get_connection()
            conn.cursor().execute("UPDATE quiz_attempts SET created_at = ? WHERE id = ?", ("2026-10-21 10:00:00", att1_id))
            conn.commit()
            conn.close()

        # Attempt 2: ISO timestamp with explicit timezone (newer: 90%)
        att2_id = state_store.save_quiz_attempt(user_id, "top-py-intro", {
            "percentage": 90.0,
            "score": 90.0,
            "correct_count": 9,
            "total_questions": 10,
            "time_spent": 60
        })
        with state_store._lock:
            conn = state_store.get_connection()
            conn.cursor().execute("UPDATE quiz_attempts SET created_at = ? WHERE id = ?", ("2026-10-21T10:15:00+00:00", att2_id))
            conn.commit()
            conn.close()

        # Telemetry event: ISO timestamp with 'Z' matching attempt 2
        with state_store._lock:
            conn = state_store.get_connection()
            conn.cursor().execute(
                "INSERT INTO telemetry_events (user_id, topic_id, event_type, duration, timestamp) VALUES (?, ?, ?, ?, ?)",
                (user_id, "top-py-intro", "QUIZ_SUBMIT", 60.0, "2026-10-21T10:15:00Z")
            )
            conn.commit()
            conn.close()

        res = self.client.get("/api/learning-history", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Must not crash with TypeError when sorting attempts or comparing timestamps
        self.assertEqual(data["insights"]["improvement_delta"], 10)
        self.assertEqual(data["improvement_delta"], 10)
        # Total time must not double-count the matching QUIZ_SUBMIT event (120s + 60s = 180s = 3m)
        self.assertEqual(data["insights"]["total_time_minutes"], 3)
        self.assertEqual(data["total_time_minutes"], 3)


if __name__ == "__main__":
    import os
    suite = unittest.TestLoader().loadTestsFromTestCase(TestFullIntegration)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    os._exit(0 if result.wasSuccessful() else 1)
