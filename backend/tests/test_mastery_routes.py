"""Integration tests for Student Mastery API Routes (Task 4, 5, 6).

Verifies:
- Authentication & data isolation between students
- GET /api/mastery/me overall and topic breakdown
- GET /api/mastery/subjects/{subject_id}
- GET /api/mastery/topics/{topic_id}
- GET /api/mastery/history with pagination
- POST /api/mastery/assessment-result input validation and idempotency
- Quiz submission integration (/api/topics/{topic_id}/quiz/submit)
- Coding submission integration (/api/code/submit)
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

        # Seed two students
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
        """All mastery endpoints reject unauthenticated requests with 401."""
        endpoints = [
            ("GET", "/api/mastery/me"),
            ("GET", "/api/mastery/subjects/py-beg"),
            ("GET", "/api/mastery/topics/top-py-variables"),
            ("GET", "/api/mastery/history"),
            ("POST", "/api/mastery/assessment-result")
        ]
        for method, url in endpoints:
            if method == "GET":
                res = self.client.get(url)
            else:
                res = self.client.post(url, json={
                    "topic_id": "top-py-variables",
                    "assessment_type": "quiz",
                    "score": 85.0
                })
            self.assertEqual(res.status_code, 401, f"{method} {url} should require authentication.")

    # --- 2. POST /api/mastery/assessment-result Validation & Processing ---
    def test_02_record_assessment_result_validation(self):
        """Test input validation for assessment recording."""
        # Invalid score > 100
        res_high = self.client.post("/api/mastery/assessment-result", json={
            "topic_id": "top-py-intro",
            "assessment_type": "quiz",
            "score": 150.0
        }, headers=self.alice_headers)
        self.assertEqual(res_high.status_code, 422)

        # Invalid score < 0
        res_low = self.client.post("/api/mastery/assessment-result", json={
            "topic_id": "top-py-intro",
            "assessment_type": "quiz",
            "score": -10.0
        }, headers=self.alice_headers)
        self.assertEqual(res_low.status_code, 422)

        # Invalid assessment_type
        res_type = self.client.post("/api/mastery/assessment-result", json={
            "topic_id": "top-py-intro",
            "assessment_type": "essay",
            "score": 80.0
        }, headers=self.alice_headers)
        self.assertEqual(res_type.status_code, 422)

    def test_03_record_assessment_result_success(self):
        """Test successful assessment ingestion and recalculation."""
        payload = {
            "topic_id": "top-py-syntax",
            "subject_id": "py-beg",
            "assessment_type": "quiz",
            "score": 80.0,
            "assessment_id": "api_test_quiz_01",
            "details": {"correct_count": 8, "total_questions": 10}
        }
        res = self.client.post("/api/mastery/assessment-result", json=payload, headers=self.alice_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        topic_data = data["data"]
        self.assertEqual(topic_data["topic_id"], "top-py-syntax")
        self.assertEqual(topic_data["current_mastery"], 80.0)
        self.assertEqual(topic_data["mastery_status"], "PROFICIENT")
        self.assertTrue(topic_data["provisional"])

        # Now submit coding assessment for the same topic
        payload_code = {
            "topic_id": "top-py-syntax",
            "subject_id": "py-beg",
            "assessment_type": "coding",
            "score": 90.0,
            "assessment_id": "api_test_code_01",
            "details": {"passed_tests": 9, "total_tests": 10}
        }
        res_code = self.client.post("/api/mastery/assessment-result", json=payload_code, headers=self.alice_headers)
        self.assertEqual(res_code.status_code, 200)
        updated_data = res_code.json()["data"]
        # Expected: 80 * 0.6 + 90 * 0.4 = 48 + 36 = 84.0
        self.assertEqual(updated_data["current_mastery"], 84.0)
        self.assertEqual(updated_data["previous_mastery"], 80.0)
        self.assertFalse(updated_data["provisional"])
        self.assertEqual(updated_data["total_attempts"], 2)

    # --- 3. GET /api/mastery/me and Data Isolation ---
    def test_04_get_mastery_me_and_data_isolation(self):
        """Alice's data is isolated from Bob."""
        # Alice requests her profile
        res_alice = self.client.get("/api/mastery/me", headers=self.alice_headers)
        self.assertEqual(res_alice.status_code, 200)
        alice_data = res_alice.json()["data"]
        self.assertEqual(alice_data["user_id"], "student-alice")
        self.assertGreaterEqual(alice_data["total_assessed_topics"], 1)

        # Bob requests his profile -> completely empty
        res_bob = self.client.get("/api/mastery/me", headers=self.bob_headers)
        self.assertEqual(res_bob.status_code, 200)
        bob_data = res_bob.json()["data"]
        self.assertEqual(bob_data["user_id"], "student-bob")
        self.assertEqual(bob_data["total_assessed_topics"], 0)
        self.assertIsNone(bob_data["overall_mastery"])
        self.assertEqual(bob_data["mastery_display"], "Not assessed")

    # --- 4. GET /api/mastery/subjects/{subject_id} ---
    def test_05_get_subject_mastery(self):
        """Retrieve subject mastery and topic breakdown."""
        res = self.client.get("/api/mastery/subjects/py-beg", headers=self.alice_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(data["subject_id"], "py-beg")
        self.assertGreaterEqual(data["total_topics_assessed"], 1)
        self.assertIsNotNone(data["current_mastery"])
        self.assertTrue(len(data["topics"]) > 0)

    # --- 5. GET /api/mastery/topics/{topic_id} ---
    def test_06_get_topic_mastery(self):
        """Retrieve individual topic mastery."""
        # Assessed topic
        res = self.client.get("/api/mastery/topics/top-py-syntax", headers=self.alice_headers)
        self.assertEqual(res.status_code, 200)
        topic_data = res.json()["data"]
        self.assertEqual(topic_data["topic_id"], "top-py-syntax")
        self.assertEqual(topic_data["current_mastery"], 84.0)

        # Unassessed topic -> clean "Not assessed"
        res_unassessed = self.client.get("/api/mastery/topics/top-py-unassessed-xyz", headers=self.alice_headers)
        self.assertEqual(res_unassessed.status_code, 200)
        unassessed_data = res_unassessed.json()["data"]
        self.assertIsNone(unassessed_data["current_mastery"])
        self.assertEqual(unassessed_data["mastery_display"], "Not assessed")
        self.assertEqual(unassessed_data["mastery_status"], "NOT_ASSESSED")

    # --- 6. GET /api/mastery/history ---
    def test_07_get_mastery_history(self):
        """Retrieve chronological history with pagination."""
        res = self.client.get("/api/mastery/history?limit=10", headers=self.alice_headers)
        self.assertEqual(res.status_code, 200)
        history = res.json()["data"]
        self.assertGreaterEqual(len(history), 2)
        # Verify first entry is latest (coding assessment)
        self.assertEqual(history[0]["assessment_type"], "coding")
        self.assertEqual(history[0]["previous_mastery"], 80.0)
        self.assertEqual(history[0]["new_mastery"], 84.0)
        self.assertEqual(history[0]["change_delta"], 4.0)

    # --- 7. End-to-End Quiz Submission Integration ---
    def test_08_quiz_submission_updates_mastery(self):
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
        self.assertEqual(res_json["mastery"]["user_id"], "student-bob")
        self.assertEqual(res_json["mastery"]["quiz_performance"]["attempts"], 1)

    # --- 8. End-to-End Coding Submission Integration ---
    def test_09_code_submission_updates_mastery(self):
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
            self.assertEqual(res_json["mastery"]["user_id"], "student-bob")
            self.assertEqual(res_json["mastery"]["coding_performance"]["attempts"], 1)


if __name__ == "__main__":
    unittest.main()
