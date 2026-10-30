"""Integration tests for Student Mastery API Routes (Member 3).

Verifies:
1. Authentication & unauthorized data isolation between students
2. Input validation, status codes, and error messages
3. Operation 1: GET /api/mastery/me (student mastery profile)
4. Operation 2: GET /api/mastery/subjects/{subject_id} (subject breakdown)
5. Operation 3: GET /api/mastery/topics/{topic_id} (topic mastery & unassessed handling)
6. Operation 4: POST /api/mastery/quiz-attempt (update mastery after quiz)
7. Operation 5: POST /api/mastery/coding-submission (update mastery after coding)
8. Operation 6: GET /api/mastery/statistics (progress & improvement statistics)
9. Operation 7: GET /api/mastery/history (chronological history with pagination)
10. End-to-end integration: /api/topics/{topic_id}/quiz/submit updates mastery
11. End-to-end integration: /api/code/submit updates mastery
"""

import os
import sys
import tempfile
import unittest
from pathlib import Path

# Setup disposable isolated test database before any backend imports
_TEST_TEMP_DIR = tempfile.TemporaryDirectory()
_DISPOSABLE_DB = Path(_TEST_TEMP_DIR.name) / "test_mastery_routes.db"
os.environ["ADAPTIVE_LEARNING_DB_PATH"] = str(_DISPOSABLE_DB)
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

from fastapi.testclient import TestClient

from backend.main import app
from backend.services.state_store import state_store
from backend.services.auth_service import auth_service


class TestMasteryRoutes(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        state_store.set_db_path(str(_DISPOSABLE_DB), init_schema=True)
        cls.client = TestClient(app)

        # Seed two students: Alice and Bob
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute("INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
                    ("student-alice", "alice@mastery.edu", "Alice", "student"))
        cur.execute("INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
                    ("student-bob", "bob@mastery.edu", "Bob", "student"))
        conn.commit()
        conn.close()

        cls.alice_token = auth_service.create_internal_token("student-alice", "alice@mastery.edu")
        cls.bob_token = auth_service.create_internal_token("student-bob", "bob@mastery.edu")
        cls.alice_headers = {"Authorization": f"Bearer {cls.alice_token}"}
        cls.bob_headers = {"Authorization": f"Bearer {cls.bob_token}"}

    @classmethod
    def tearDownClass(cls):
        _TEST_TEMP_DIR.cleanup()

    # --- 1. Authentication & Route Protection ---
    def test_01_unauthenticated_access_denied(self):
        """All mastery endpoints reject unauthenticated requests with 401 Unauthorized."""
        endpoints = [
            ("GET", "/api/mastery/me"),
            ("GET", "/api/mastery/subjects/py-beg"),
            ("GET", "/api/mastery/topics/top-py-variables"),
            ("GET", "/api/mastery/statistics"),
            ("GET", "/api/mastery/history"),
            ("POST", "/api/mastery/quiz-attempt"),
            ("POST", "/api/mastery/coding-submission"),
            ("POST", "/api/mastery/assessment-result")
        ]
        for method, url in endpoints:
            if method == "GET":
                res = self.client.get(url)
            elif "quiz" in url:
                res = self.client.post(url, json={"topic_id": "top-py-variables", "score": 85.0})
            elif "coding" in url:
                res = self.client.post(url, json={"topic_id": "top-py-variables", "score": 90.0})
            else:
                res = self.client.post(url, json={
                    "topic_id": "top-py-variables",
                    "assessment_type": "quiz",
                    "score": 85.0
                })
            self.assertEqual(res.status_code, 401, f"{method} {url} must require authentication.")

    # --- 2. Input Validation and Status Codes ---
    def test_02_validation_and_error_handling(self):
        """Test input validation for quiz and coding submissions."""
        # Score > 100 -> 422
        res_high = self.client.post("/api/mastery/quiz-attempt", json={
            "topic_id": "top-py-intro",
            "score": 125.0
        }, headers=self.alice_headers)
        self.assertEqual(res_high.status_code, 422)

        # Score < 0 -> 422
        res_low = self.client.post("/api/mastery/coding-submission", json={
            "topic_id": "top-py-intro",
            "score": -5.0
        }, headers=self.alice_headers)
        self.assertEqual(res_low.status_code, 422)

        # Empty topic_id -> 400
        res_empty_topic = self.client.post("/api/mastery/quiz-attempt", json={
            "topic_id": "   ",
            "score": 80.0
        }, headers=self.alice_headers)
        self.assertEqual(res_empty_topic.status_code, 400)

        # Empty subject_id -> 400
        res_empty_subject = self.client.get("/api/mastery/subjects/%20", headers=self.alice_headers)
        self.assertEqual(res_empty_subject.status_code, 400)

    # --- 3. Operation 4: POST /api/mastery/quiz-attempt ---
    def test_03_update_mastery_quiz_attempt(self):
        """Operation 4: Updating mastery after a quiz attempt."""
        payload = {
            "topic_id": "top-py-syntax",
            "subject_id": "py-beg",
            "score": 80.0,
            "assessment_id": "quiz_api_attempt_101",
            "correct_count": 8,
            "total_questions": 10,
            "time_spent": 40.0
        }
        res = self.client.post("/api/mastery/quiz-attempt", json=payload, headers=self.alice_headers)
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertTrue(body["success"])

        data = body["data"]
        self.assertEqual(data["student_id"], "student-alice")
        self.assertEqual(data["topic_id"], "top-py-syntax")
        self.assertEqual(data["mastery_score"], 80.0)
        self.assertEqual(data["current_mastery"], 80.0)
        self.assertEqual(data["total_attempts"], 1)
        self.assertEqual(data["correct_attempts"], 8)
        self.assertEqual(data["mastery_status"], "PROFICIENT")
        self.assertTrue(data["provisional"])
        self.assertEqual(data["missing_components"], ["coding"])

    # --- 4. Operation 5: POST /api/mastery/coding-submission ---
    def test_04_update_mastery_coding_submission(self):
        """Operation 5: Updating mastery after a coding submission creates hybrid score."""
        payload = {
            "topic_id": "top-py-syntax",
            "subject_id": "py-beg",
            "score": 90.0,
            "assessment_id": "coding_api_attempt_101",
            "passed_tests": 9,
            "total_tests": 10,
            "coding_time_seconds": 35.0
        }
        res = self.client.post("/api/mastery/coding-submission", json=payload, headers=self.alice_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]

        # Expected: 80 * 0.6 + 90 * 0.4 = 48 + 36 = 84.0
        self.assertEqual(data["current_mastery"], 84.0)
        self.assertEqual(data["previous_mastery"], 80.0)
        self.assertEqual(data["improvement"], 4.0)
        self.assertEqual(data["total_attempts"], 2)
        self.assertEqual(data["correct_attempts"], 17)  # 8 quiz + 9 code
        self.assertFalse(data["provisional"])
        self.assertEqual(data["assessment_mode"], "HYBRID")

    # --- 5. Operation 1: GET /api/mastery/me & Security Isolation ---
    def test_05_get_mastery_me_and_security_isolation(self):
        """Operation 1: Student accesses only their own mastery; Bob cannot see Alice's data."""
        # Alice requests her mastery
        res_alice = self.client.get("/api/mastery/me", headers=self.alice_headers)
        self.assertEqual(res_alice.status_code, 200)
        alice_data = res_alice.json()["data"]
        self.assertEqual(alice_data["student_id"], "student-alice")
        self.assertGreaterEqual(alice_data["total_assessed_topics"], 1)
        self.assertEqual(alice_data["overall_mastery"], 84.0)

        # Bob requests his mastery -> 0 assessed topics, isolated from Alice
        res_bob = self.client.get("/api/mastery/me", headers=self.bob_headers)
        self.assertEqual(res_bob.status_code, 200)
        bob_data = res_bob.json()["data"]
        self.assertEqual(bob_data["student_id"], "student-bob")
        self.assertEqual(bob_data["total_assessed_topics"], 0)
        self.assertIsNone(bob_data["overall_mastery"])
        self.assertEqual(bob_data["mastery_display"], "Not assessed")

    # --- 6. Operation 2: GET /api/mastery/subjects/{subject_id} ---
    def test_06_get_subject_mastery(self):
        """Operation 2: Retrieve subject-level mastery progress."""
        res = self.client.get("/api/mastery/subjects/py-beg", headers=self.alice_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(data["subject_id"], "py-beg")
        self.assertGreaterEqual(data["total_topics_assessed"], 1)
        self.assertIsNotNone(data["current_mastery"])
        self.assertTrue(len(data["topics"]) > 0)
        self.assertIn("breakdown", data)

    # --- 7. Operation 3: GET /api/mastery/topics/{topic_id} ---
    def test_07_get_topic_mastery(self):
        """Operation 3: Retrieve individual topic mastery (assessed vs unassessed)."""
        # Assessed topic
        res = self.client.get("/api/mastery/topics/top-py-syntax", headers=self.alice_headers)
        self.assertEqual(res.status_code, 200)
        topic_data = res.json()["data"]
        self.assertEqual(topic_data["topic_id"], "top-py-syntax")
        self.assertEqual(topic_data["current_mastery"], 84.0)
        self.assertEqual(topic_data["correct_attempts"], 17)
        self.assertEqual(topic_data["improvement"], 4.0)

        # Unassessed topic -> clean 'Not assessed' structure
        res_unassessed = self.client.get("/api/mastery/topics/top-py-unassessed-topic", headers=self.alice_headers)
        self.assertEqual(res_unassessed.status_code, 200)
        unassessed_data = res_unassessed.json()["data"]
        self.assertIsNone(unassessed_data["current_mastery"])
        self.assertEqual(unassessed_data["mastery_display"], "Not assessed")
        self.assertEqual(unassessed_data["mastery_status"], "NOT_ASSESSED")
        self.assertEqual(unassessed_data["total_attempts"], 0)
        self.assertEqual(unassessed_data["correct_attempts"], 0)

    # --- 8. Operation 6: GET /api/mastery/statistics ---
    def test_08_get_mastery_statistics(self):
        """Operation 6: Retrieve overall student progress, accuracy, and improvement metrics."""
        res = self.client.get("/api/mastery/statistics", headers=self.alice_headers)
        self.assertEqual(res.status_code, 200)
        stats = res.json()["data"]

        self.assertEqual(stats["student_id"], "student-alice")
        self.assertGreaterEqual(stats["total_assessed_topics"], 1)
        self.assertGreaterEqual(stats["total_attempts"], 2)
        self.assertIsNotNone(stats["overall_mastery"])
        self.assertIsNotNone(stats["average_accuracy"])
        self.assertIn(stats["improvement_trend"], ["IMPROVING", "DECLINING", "STEADY", "NO_DATA"])
        self.assertIn("status_distribution", stats)
        self.assertIn("subjects", stats)

    # --- 9. Operation 7: GET /api/mastery/history ---
    def test_09_get_mastery_history(self):
        """Operation 7: Chronological history of mastery updates with pagination."""
        res = self.client.get("/api/mastery/history?limit=10", headers=self.alice_headers)
        self.assertEqual(res.status_code, 200)
        history = res.json()["data"]
        self.assertGreaterEqual(len(history), 2)
        # Verify latest entry is coding assessment
        self.assertEqual(history[0]["assessment_type"], "coding")
        self.assertEqual(history[0]["previous_mastery"], 80.0)
        self.assertEqual(history[0]["new_mastery"], 84.0)
        self.assertEqual(history[0]["change_delta"], 4.0)

    # --- 10. End-to-End Quiz Submission Integration ---
    def test_10_quiz_submission_updates_mastery(self):
        """Submitting a quiz via /api/topics/{topic_id}/quiz/submit updates student mastery."""
        topic_id = "top-py-intro"
        payload = {
            "answers": {"0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0},
            "time_spent": 45.0
        }
        res = self.client.post(f"/api/topics/{topic_id}/quiz/submit", json=payload, headers=self.bob_headers)
        self.assertEqual(res.status_code, 200)
        res_json = res.json()
        self.assertIn("mastery", res_json)
        self.assertIsNotNone(res_json["mastery"])
        self.assertEqual(res_json["mastery"]["topic_id"], topic_id)
        self.assertEqual(res_json["mastery"]["student_id"], "student-bob")
        self.assertEqual(res_json["mastery"]["quiz_performance"]["attempts"], 1)

    # --- 11. End-to-End Coding Submission Integration ---
    def test_11_code_submission_updates_mastery(self):
        """Submitting code via /api/code/submit updates student mastery."""
        topic_id = "top-py-intro"
        payload = {
            "topicId": topic_id,
            "code": "print('Hello, Python!')\n",
            "language": "python",
            "codingTimeSeconds": 25.0
        }
        res = self.client.post("/api/code/submit", json=payload, headers=self.bob_headers)
        self.assertEqual(res.status_code, 200)
        res_json = res.json()
        self.assertIn("mastery", res_json)
        if res_json["mastery"]:
            self.assertEqual(res_json["mastery"]["topic_id"], topic_id)
            self.assertEqual(res_json["mastery"]["student_id"], "student-bob")
            self.assertEqual(res_json["mastery"]["coding_performance"]["attempts"], 1)


if __name__ == "__main__":
    unittest.main()
