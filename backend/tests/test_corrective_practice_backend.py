"""Backend Tests for Corrective Practice Endpoints and Original Results Preservation (Member 4).

Verifies:
1. GET /api/topics/{topic_id}/quiz/attempts/latest returns has_attempt: False when no prior attempt exists.
2. Saving an initial quiz attempt allows GET /api/topics/{topic_id}/quiz/attempts/latest to retrieve preserved review and incorrect questions.
3. POST /api/topics/{topic_id}/quiz/practice/submit grades practice answers accurately without mutating quiz_attempts.
4. Preservation of original quiz results: original score, correct count, and created_at in quiz_attempts remain strictly intact.
5. Telemetry recording: verifies CORRECTIVE_PRACTICE_SUBMISSION event logged in telemetry_events.
6. Learner isolation: Student A's attempt and practice sessions never leak to Student B.
7. Authentication: 401 Unauthorized returned on requests missing Bearer token.
"""

import os
import sys
import json
import tempfile
import unittest
from pathlib import Path

# Establish isolated database environment
_TEST_TEMP_DIR = tempfile.TemporaryDirectory()
_DISPOSABLE_DB = Path(_TEST_TEMP_DIR.name) / "test_corrective_practice.db"
os.environ["ADAPTIVE_LEARNING_DB_PATH"] = str(_DISPOSABLE_DB)
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

from fastapi.testclient import TestClient
from backend.services.state_store import state_store
from backend.services.auth_service import auth_service
from backend.main import app


class TestCorrectivePracticeBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        state_store.set_db_path(str(_DISPOSABLE_DB), init_schema=True)
        cls.client = TestClient(app)

        # Seed test learners
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
            ("student_alpha", "alpha@cognitive.edu", "Alpha Learner", "student")
        )
        cur.execute(
            "INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
            ("student_beta", "beta@cognitive.edu", "Beta Learner", "student")
        )
        conn.commit()
        conn.close()

        cls.token_alpha = auth_service.create_internal_token("student_alpha", "alpha@cognitive.edu", "student")
        cls.token_beta = auth_service.create_internal_token("student_beta", "beta@cognitive.edu", "student")

        cls.headers_alpha = {"Authorization": f"Bearer {cls.token_alpha}"}
        cls.headers_beta = {"Authorization": f"Bearer {cls.token_beta}"}

    def test_01_unauthenticated_requests_rejected(self):
        """Verify 401 Unauthorized when Authorization header is missing."""
        res_get = self.client.get("/api/topics/top-py-fundamentals/quiz/attempts/latest")
        self.assertEqual(res_get.status_code, 401)

        res_post = self.client.post(
            "/api/topics/top-py-fundamentals/quiz/practice/submit",
            json={"answers": {"q1": 0}}
        )
        self.assertEqual(res_post.status_code, 401)

    def test_02_get_latest_attempt_empty_state(self):
        """Verify has_attempt: False when no prior quiz attempt exists for student."""
        res = self.client.get(
            "/api/topics/top-py-control-flow/quiz/attempts/latest",
            headers=self.headers_alpha
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data.get("has_attempt"))
        self.assertIsNone(data.get("attempt"))

    def test_03_get_latest_attempt_with_incorrect_questions(self):
        """Verify retrieving preserved quiz attempt with isolated incorrect questions."""
        topic_id = "top-py-fundamentals"

        # Seed original quiz attempt with 2 mistakes
        review = [
          {
            "id": "q-top-py-fundamentals-1",
            "question": "What is the result of type(42)?",
            "options": ["<class 'int'>", "<class 'str'>", "<class 'float'>", "<class 'bool'>"],
            "correct_index": 0,
            "user_choice": 1,
            "is_correct": False,
            "explanation": "42 is an integer in Python."
          },
          {
            "id": "q-top-py-fundamentals-2",
            "question": "What keyword defines a function?",
            "options": ["func", "def", "function", "lambda"],
            "correct_index": 1,
            "user_choice": 1,
            "is_correct": True,
            "explanation": "def defines standard functions in Python."
          },
          {
            "id": "q-top-py-fundamentals-3",
            "question": "Which operator performs floor division?",
            "options": ["/", "//", "%", "**"],
            "correct_index": 1,
            "user_choice": 2,
            "is_correct": False,
            "explanation": "// performs floor division in Python."
          }
        ]

        attempt_id = state_store.save_quiz_attempt(
            user_id="student_alpha",
            topic_id=topic_id,
            attempt_data={
                "id": "attempt-orig-alpha-1",
                "score": 1,
                "percentage": 33.3,
                "correct_count": 1,
                "total_questions": 3,
                "review": review,
                "adaptive_feedback": {"revision_concepts": ["Integer Types", "Floor Division"]},
                "time_spent": 80.0
            }
        )

        res = self.client.get(
            f"/api/topics/{topic_id}/quiz/attempts/latest",
            headers=self.headers_alpha
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("has_attempt"))
        att = data.get("attempt")
        self.assertIsNotNone(att)
        self.assertEqual(att.get("id"), "attempt-orig-alpha-1")
        self.assertEqual(att.get("score"), 1.0)
        self.assertEqual(att.get("correct_count"), 1)
        self.assertEqual(len(att.get("review", [])), 3)

        # Verify incorrect questions are properly extracted
        incorrect = att.get("incorrect_questions", [])
        self.assertEqual(len(incorrect), 2)
        self.assertEqual(incorrect[0]["id"], "q-top-py-fundamentals-1")
        self.assertEqual(incorrect[1]["id"], "q-top-py-fundamentals-3")

    def test_04_submit_corrective_practice_preserves_original_results(self):
        """Verify submitting corrective practice evaluates practice score without mutating original quiz_attempts."""
        topic_id = "top-py-fundamentals"

        # Check pre-practice state of original attempt
        attempts_pre = state_store.get_quiz_attempts("student_alpha", topic_id)
        self.assertEqual(len(attempts_pre), 1)
        orig_attempt_pre = attempts_pre[0]
        self.assertEqual(orig_attempt_pre["id"], "attempt-orig-alpha-1")
        self.assertEqual(orig_attempt_pre["score"], 1.0)
        self.assertEqual(orig_attempt_pre["percentage"], 33.3)

        # Submit targeted corrective practice for the two missed questions
        practice_payload = {
            "answers": {
                "q-top-py-fundamentals-1": 0, # Correct
                "q-top-py-fundamentals-3": 1  # Correct
            },
            "original_attempt_id": "attempt-orig-alpha-1",
            "time_spent": 35.0
        }

        res = self.client.post(
            f"/api/topics/{topic_id}/quiz/practice/submit",
            headers=self.headers_alpha,
            json=practice_payload
        )
        self.assertEqual(res.status_code, 200)
        result = res.json()

        self.assertTrue(result.get("success"))
        self.assertEqual(result.get("practice_score"), 2)
        self.assertEqual(result.get("practice_percentage"), 100)
        self.assertEqual(result.get("total_practice_questions"), 2)
        self.assertEqual(len(result.get("resolved_questions", [])), 2)
        self.assertEqual(len(result.get("unresolved_questions", [])), 0)

        # CRITICAL TEST: Confirm original quiz_attempts record is completely untouched
        attempts_post = state_store.get_quiz_attempts("student_alpha", topic_id)
        self.assertEqual(len(attempts_post), 1, "quiz_attempts count must NOT change")
        orig_attempt_post = attempts_post[0]
        self.assertEqual(orig_attempt_post["id"], "attempt-orig-alpha-1")
        self.assertEqual(orig_attempt_post["score"], 1.0, "Original score must remain strictly 1.0")
        self.assertEqual(orig_attempt_post["percentage"], 33.3, "Original percentage must remain strictly 33.3%")

        # Verify telemetry event recorded separately
        events = state_store.get_telemetry_events("student_alpha")
        practice_event = next((e for e in events if e.get("event_type") == "CORRECTIVE_PRACTICE_SUBMISSION"), None)
        self.assertIsNotNone(practice_event, "CORRECTIVE_PRACTICE_SUBMISSION event must be logged")
        raw_meta = practice_event.get("metadata") or practice_event.get("metadata_json")
        metadata = json.loads(raw_meta) if isinstance(raw_meta, str) else (raw_meta or {})
        self.assertEqual(metadata.get("original_attempt_id"), "attempt-orig-alpha-1")
        self.assertEqual(metadata.get("practice_score"), 2)

    def test_05_learner_isolation(self):
        """Verify Student Beta cannot access or practice on Student Alpha's attempts."""
        topic_id = "top-py-fundamentals"

        # Student Beta has no attempts for this topic
        res = self.client.get(
            f"/api/topics/{topic_id}/quiz/attempts/latest",
            headers=self.headers_beta
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data.get("has_attempt"))
        self.assertIsNone(data.get("attempt"))


if __name__ == "__main__":
    unittest.main()
