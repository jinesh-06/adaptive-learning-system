"""Tests verifying the Firebase Authentication Audience Fix.

Verifies:
1. A valid ID token from the intended Firebase project ('cognitive-adaptive-learning') is accepted.
2. A token from the wrong Firebase project ('adaptive-learning-system' or other) is rejected.
3. Missing tokens return an appropriate unauthorized response (HTTP 401).
4. Expired or invalid tokens remain rejected.
5. Existing student authentication and user isolation continue working.
6. The diagnostic Python questions endpoint works when called by an authenticated user.
7. Diagnostic submission endpoint works when called by an authenticated user.
"""

import os
import time
import tempfile
import unittest
from pathlib import Path

# Setup disposable isolated test database before any backend imports
_TEST_TEMP_DIR = tempfile.TemporaryDirectory()
_DISPOSABLE_DB = Path(_TEST_TEMP_DIR.name) / "test_firebase_audience_fix.db"
os.environ["ADAPTIVE_LEARNING_DB_PATH"] = str(_DISPOSABLE_DB)
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

from fastapi.testclient import TestClient
from fastapi import HTTPException

from backend.main import app
from backend.config import FIREBASE_PROJECT_ID
from backend.services.state_store import state_store
from backend.services.auth_service import (
    auth_service,
    get_firebase_project_id,
    set_firebase_verifier_for_testing
)


class TestFirebaseAudienceFix(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        state_store.set_db_path(str(_DISPOSABLE_DB), init_schema=True)
        cls.client = TestClient(app)

        # Seed test student in SQLite users table
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
            ("student_fb_user", "student_fb@example.com", "Firebase Student", "student")
        )
        cur.execute(
            "INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
            ("student_other_user", "other@example.com", "Other Student", "student")
        )
        conn.commit()
        conn.close()

    def tearDown(self):
        set_firebase_verifier_for_testing(None)

    # ================= Verification 1 =================
    def test_01_valid_id_token_from_intended_project_accepted(self):
        """Criterion 1: A valid ID token from 'cognitive-adaptive-learning' is accepted."""
        self.assertEqual(FIREBASE_PROJECT_ID, "cognitive-adaptive-learning")
        self.assertEqual(get_firebase_project_id(), "cognitive-adaptive-learning")

        now = time.time()
        intended_claims = {
            "iss": "https://securetoken.google.com/cognitive-adaptive-learning",
            "aud": "cognitive-adaptive-learning",
            "sub": "student_fb_user",
            "email": "student_fb@example.com",
            "name": "Firebase Student",
            "email_verified": True,
            "auth_time": now - 10.0
        }

        # Mock the cryptographic certificate verifier returning valid claims for cognitive-adaptive-learning
        set_firebase_verifier_for_testing(lambda t: intended_claims if t == "valid_intended_token" else None)

        # 1. Direct service verification
        claims = auth_service.verify_firebase_id_token("valid_intended_token")
        self.assertEqual(claims["aud"], "cognitive-adaptive-learning")
        self.assertEqual(claims["sub"], "student_fb_user")

        # 2. API verification on protected endpoint /api/auth/me
        headers = {"Authorization": "Bearer valid_intended_token"}
        res = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(res.status_code, 200, f"Expected 200, got {res.status_code}: {res.text}")
        data = res.json()
        self.assertIn("user", data)
        self.assertEqual(data["user"]["email"], "student_fb@example.com")
        self.assertEqual(data["user"]["role"], "student")

    # ================= Verification 2 =================
    def test_02_token_from_wrong_firebase_project_rejected(self):
        """Criterion 2: A token from the wrong project ('adaptive-learning-system' or other) is rejected."""
        now = time.time()

        # Token with aud = 'adaptive-learning-system' (the old mismatch project)
        wrong_claims_old = {
            "iss": "https://securetoken.google.com/adaptive-learning-system",
            "aud": "adaptive-learning-system",
            "sub": "student_fb_user",
            "email": "student_fb@example.com",
            "auth_time": now - 10.0
        }
        set_firebase_verifier_for_testing(lambda t: wrong_claims_old)

        # Direct service verification must fail with 401
        with self.assertRaises(HTTPException) as ctx:
            auth_service.verify_firebase_id_token("token_wrong_project")
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("Invalid token issuer", ctx.exception.detail)

        # Token with mismatched aud claim even if iss was forged
        wrong_aud_claims = {
            "iss": "https://securetoken.google.com/cognitive-adaptive-learning",
            "aud": "wrong-adversary-project",
            "sub": "student_fb_user",
            "auth_time": now - 10.0
        }
        set_firebase_verifier_for_testing(lambda t: wrong_aud_claims)

        with self.assertRaises(HTTPException) as ctx2:
            auth_service.verify_firebase_id_token("token_wrong_aud")
        self.assertEqual(ctx2.exception.status_code, 401)
        self.assertIn("wrong audience", ctx2.exception.detail)

        # API endpoint rejects wrong token with 401
        res = self.client.get("/api/auth/me", headers={"Authorization": "Bearer token_wrong_project"})
        self.assertEqual(res.status_code, 401)

    # ================= Verification 3 =================
    def test_03_missing_tokens_return_unauthorized(self):
        """Criterion 3: Missing tokens return an appropriate unauthorized response."""
        res_me = self.client.get("/api/auth/me")
        self.assertEqual(res_me.status_code, 401)
        self.assertIn("authentication required", res_me.text.lower())

        res_diag_submit = self.client.post("/api/diagnostic/python/submit", json={"answers": {}})
        self.assertEqual(res_diag_submit.status_code, 401)

    # ================= Verification 4 =================
    def test_04_expired_or_invalid_tokens_remain_rejected(self):
        """Criterion 4: Expired or malformed tokens remain rejected."""
        # 1. Malformed token string
        res_malformed = self.client.get("/api/auth/me", headers={"Authorization": "Bearer not_a_valid_token_xyz"})
        self.assertEqual(res_malformed.status_code, 401)

        # 2. Expired internal token verified directly
        expired_token = auth_service.create_internal_token(
            user_id="student_fb_user",
            email="student_fb@example.com",
            expires_in_seconds=-3600
        )
        with self.assertRaises(HTTPException) as ctx_exp:
            auth_service.verify_internal_token(expired_token)
        self.assertEqual(ctx_exp.exception.status_code, 401)
        self.assertIn("expired", ctx_exp.exception.detail.lower())

        # Expired internal token via API request returns 401 Unauthorized
        res_expired = self.client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
        self.assertEqual(res_expired.status_code, 401)
        self.assertIn("authentication required", res_expired.text.lower())

        # 3. Invalid auth_time in Firebase claims
        now = time.time()
        future_auth_claims = {
            "iss": "https://securetoken.google.com/cognitive-adaptive-learning",
            "aud": "cognitive-adaptive-learning",
            "sub": "student_fb_user",
            "auth_time": now + 600.0  # 10 minutes in the future
        }
        set_firebase_verifier_for_testing(lambda t: future_auth_claims)
        with self.assertRaises(HTTPException) as ctx:
            auth_service.verify_firebase_id_token("future_token")
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("future", ctx.exception.detail)

    # ================= Verification 5 =================
    def test_05_student_authentication_and_user_isolation(self):
        """Criterion 5: Existing student authentication and user isolation continue working."""
        # Internal token authentication
        token_a = auth_service.create_internal_token("student_fb_user", "student_fb@example.com")
        token_b = auth_service.create_internal_token("student_other_user", "other@example.com")

        res_a = self.client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_a}"})
        self.assertEqual(res_a.status_code, 200)
        self.assertEqual(res_a.json()["user"]["id"], "student_fb_user")

        res_b = self.client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_b}"})
        self.assertEqual(res_b.status_code, 200)
        self.assertEqual(res_b.json()["user"]["id"], "student_other_user")

        # Student cannot access admin endpoints
        res_admin = self.client.get("/api/admin/analytics", headers={"Authorization": f"Bearer {token_a}"})
        self.assertEqual(res_admin.status_code, 403)

    # ================= Verification 6 =================
    def test_06_diagnostic_python_questions_with_authenticated_user(self):
        """Criterion 6: The diagnostic Python questions endpoint works when called by an authenticated user."""
        now = time.time()
        intended_claims = {
            "iss": "https://securetoken.google.com/cognitive-adaptive-learning",
            "aud": "cognitive-adaptive-learning",
            "sub": "student_fb_user",
            "email": "student_fb@example.com",
            "auth_time": now - 10.0
        }
        set_firebase_verifier_for_testing(lambda t: intended_claims if t == "valid_fb_token" else None)
        headers = {"Authorization": "Bearer valid_fb_token"}

        # 1. GET /api/diagnostic/python/questions with authenticated Firebase token
        res = self.client.get("/api/diagnostic/python/questions", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["language"], "python")
        self.assertIn("questions", data)
        self.assertGreater(data["total_questions"], 0)

        # Ensure questions are sanitized (no correct_index leaked)
        for q in data["questions"]:
            self.assertNotIn("correct_index", q)
            self.assertIn("options", q)
            self.assertIn("question", q)

        # 2. POST /api/diagnostic/python/submit with authenticated Firebase token
        first_q_id = str(data["questions"][0]["id"])
        sub_payload = {
            "answers": {first_q_id: 1},
            "time_spent": 45.0
        }
        sub_res = self.client.post("/api/diagnostic/python/submit", headers=headers, json=sub_payload)
        self.assertEqual(sub_res.status_code, 200)
        sub_data = sub_res.json()
        self.assertIn("score", sub_data)
        self.assertIn("recommended_level", sub_data)

    # ================= Verification 7 =================
    def test_07_dashboard_snapshot_authenticated_student(self):
        """Criterion 4: /api/dashboard/snapshot works for an authenticated student with valid Firebase token."""
        now = time.time()
        intended_claims = {
            "iss": "https://securetoken.google.com/cognitive-adaptive-learning",
            "aud": "cognitive-adaptive-learning",
            "sub": "student_fb_user",
            "email": "student_fb@example.com",
            "name": "Firebase Student",
            "auth_time": now - 10.0
        }
        set_firebase_verifier_for_testing(lambda t: intended_claims if t == "valid_fb_token" else None)
        headers = {"Authorization": "Bearer valid_fb_token"}

        res = self.client.get("/api/dashboard/snapshot", headers=headers)
        self.assertEqual(res.status_code, 200, f"Expected 200, got {res.status_code}: {res.text}")
        data = res.json()
        self.assertTrue(data.get("success"))
        self.assertEqual(data.get("user_id"), "student_fb_user")
        self.assertIn("learning_snapshot", data)
        self.assertIn("streak_days", data)
        self.assertIn("achievements", data)

    # ================= Verification 8 =================
    def test_08_dashboard_snapshot_rejection_matrix(self):
        """Criteria 2 & 3: Missing, malformed, expired, and wrong-project tokens rejected on /api/dashboard/snapshot."""
        # 1. Missing token
        res_missing = self.client.get("/api/dashboard/snapshot")
        self.assertEqual(res_missing.status_code, 401)

        # 2. Malformed token
        res_malformed = self.client.get("/api/dashboard/snapshot", headers={"Authorization": "Bearer not_a_real_token"})
        self.assertEqual(res_malformed.status_code, 401)

        # 3. Wrong project token ('adaptive-learning-system')
        now = time.time()
        wrong_claims = {
            "iss": "https://securetoken.google.com/adaptive-learning-system",
            "aud": "adaptive-learning-system",
            "sub": "student_fb_user",
            "email": "student_fb@example.com",
            "auth_time": now - 10.0
        }
        set_firebase_verifier_for_testing(lambda t: wrong_claims)
        res_wrong_proj = self.client.get("/api/dashboard/snapshot", headers={"Authorization": "Bearer token_wrong_project"})
        self.assertEqual(res_wrong_proj.status_code, 401)

        # 4. Adversary project token ('foreign-attacker-app')
        adversary_claims = {
            "iss": "https://securetoken.google.com/cognitive-adaptive-learning",
            "aud": "foreign-attacker-app",
            "sub": "student_fb_user",
            "email": "student_fb@example.com",
            "auth_time": now - 10.0
        }
        set_firebase_verifier_for_testing(lambda t: adversary_claims)
        res_adversary = self.client.get("/api/dashboard/snapshot", headers={"Authorization": "Bearer token_adversary"})
        self.assertEqual(res_adversary.status_code, 401)

        # 5. Expired internal token
        expired_token = auth_service.create_internal_token("student_fb_user", "student_fb@example.com", expires_in_seconds=-3600)
        res_expired = self.client.get("/api/dashboard/snapshot", headers={"Authorization": f"Bearer {expired_token}"})
        self.assertEqual(res_expired.status_code, 401)

    # ================= Verification 9 =================
    def test_09_dashboard_snapshot_data_scoping_and_isolation(self):
        """Criteria 5 & 6: Dashboard data is scoped to authenticated user; cross-student isolation is strictly enforced."""
        conn = state_store.get_connection()
        cur = conn.cursor()
        # Seed student A progress: 2 completed topics
        cur.execute(
            "INSERT OR REPLACE INTO user_progress (user_id, topic_id, course_id, status, completion_pct) VALUES (?, ?, ?, ?, ?)",
            ("student_fb_user", "top-py-adv-generators", "course-py-adv", "COMPLETED", 100.0)
        )
        cur.execute(
            "INSERT OR REPLACE INTO user_progress (user_id, topic_id, course_id, status, completion_pct) VALUES (?, ?, ?, ?, ?)",
            ("student_fb_user", "top-py-adv-decorators", "course-py-adv", "COMPLETED", 100.0)
        )
        # Ensure student B has no completed progress records
        cur.execute("DELETE FROM user_progress WHERE user_id = 'student_other_user'")
        conn.commit()
        conn.close()

        # Token for Student A
        now = time.time()
        claims_a = {
            "iss": "https://securetoken.google.com/cognitive-adaptive-learning",
            "aud": "cognitive-adaptive-learning",
            "sub": "student_fb_user",
            "email": "student_fb@example.com",
            "auth_time": now - 10.0
        }
        # Token for Student B
        claims_b = {
            "iss": "https://securetoken.google.com/cognitive-adaptive-learning",
            "aud": "cognitive-adaptive-learning",
            "sub": "student_other_user",
            "email": "other@example.com",
            "auth_time": now - 10.0
        }

        def mock_verifier(tok):
            if tok == "token_student_a":
                return claims_a
            elif tok == "token_student_b":
                return claims_b
            return None

        set_firebase_verifier_for_testing(mock_verifier)

        # 1. Student A gets their own dashboard: 2 completed topics
        res_a = self.client.get("/api/dashboard/snapshot", headers={"Authorization": "Bearer token_student_a"})
        self.assertEqual(res_a.status_code, 200)
        data_a = res_a.json()
        self.assertEqual(data_a["user_id"], "student_fb_user")
        self.assertEqual(data_a["learning_snapshot"]["topics_completed"], 2)

        # 2. Student B gets their own dashboard: 0 completed topics
        res_b = self.client.get("/api/dashboard/snapshot", headers={"Authorization": "Bearer token_student_b"})
        self.assertEqual(res_b.status_code, 200)
        data_b = res_b.json()
        self.assertEqual(data_b["user_id"], "student_other_user")
        self.assertEqual(data_b["learning_snapshot"]["topics_completed"], 0)

        # 3. Student B attempts to impersonate Student A via headers or query parameters
        res_spoof = self.client.get(
            "/api/dashboard/snapshot?user_id=student_fb_user",
            headers={
                "Authorization": "Bearer token_student_b",
                "X-User-Id": "student_fb_user"
            }
        )
        self.assertEqual(res_spoof.status_code, 200)
        data_spoof = res_spoof.json()
        # Data MUST remain scoped to Student B, ignoring any attempted spoofing
        self.assertEqual(data_spoof["user_id"], "student_other_user")
        self.assertEqual(data_spoof["learning_snapshot"]["topics_completed"], 0)


if __name__ == "__main__":
    unittest.main()
