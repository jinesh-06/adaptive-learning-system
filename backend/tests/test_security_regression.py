"""Security Regression Test Suite.

Comprehensive tests covering all 10 required security controls:
1. Missing authentication token
2. Invalid or malformed token
3. Expired token
4. Student attempting an admin-only operation
5. Attempted self-assignment of the admin role during registration
6. Access to another student's private records (ownership enforcement)
7. Invalid authentication on protected endpoints
8. Production startup with missing or weak required secrets
9. CORS configuration validation (origin allowlist and credentials)
10. Valid student and administrator workflows
"""

import os
import sys
import time
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

# 1. Establish isolated database environment BEFORE any backend imports
_TEST_TEMP_DIR = tempfile.TemporaryDirectory()
_DISPOSABLE_DB = Path(_TEST_TEMP_DIR.name) / "test_security_regression.db"
os.environ["ADAPTIVE_LEARNING_DB_PATH"] = str(_DISPOSABLE_DB)
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

from fastapi.testclient import TestClient
import jwt

from backend.config import (
    PROJECT_ROOT,
    JWT_SECRET,
    JWT_ALGORITHM,
    FIREBASE_PROJECT_ID,
    ALLOWED_ORIGINS,
    validate_production_security
)
from backend.services.state_store import state_store
from backend.services.auth_service import (
    auth_service,
    AuthIdentity,
    set_firebase_verifier_for_testing
)
from backend.main import app


class TestSecurityRegressionSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls._original_env = dict(os.environ)
        cls._original_db_path = state_store.db_path
        state_store.set_db_path(str(_DISPOSABLE_DB), init_schema=True)
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        set_firebase_verifier_for_testing(None)
        state_store.db_path = cls._original_db_path
        _TEST_TEMP_DIR.cleanup()
        # Reliably restore original process environment
        for k in list(os.environ.keys()):
            if k not in cls._original_env:
                del os.environ[k]
        os.environ.update(cls._original_env)

    def setUp(self):
        set_firebase_verifier_for_testing(None)
        os.environ["ENVIRONMENT"] = "test"
        os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

    # --- 1. Missing Authentication Token ---
    def test_01_missing_authentication_token_rejected_on_all_protected_endpoints(self):
        """All protected endpoints must reject requests with no token with HTTP 401."""
        protected_endpoints = [
            ("GET", "/api/auth/me"),
            ("POST", "/api/auth/preferences", {"selected_language": "python"}),
            ("GET", "/api/admin/analytics"),
            ("GET", "/api/bookmarks"),
            ("POST", "/api/bookmarks", {"item_type": "lesson", "item_id": "top-1", "title": "T1"}),
            ("GET", "/api/notes"),
            ("POST", "/api/notes", {"language": "python", "topic_id": "t1", "title": "N1", "content": "C1"}),
            ("GET", "/api/learning-history"),
            ("POST", "/api/topics/top-py-intro/quiz/submit", {"answers": {"q1": 0}}),
            ("POST", "/api/code/submit", {"topicId": "top-py-intro", "code": "x = 1"}),
            ("GET", "/api/dashboard/snapshot"),
            ("POST", "/api/adaptive/evaluate", {"topicId": "top-py-intro"}),
            ("GET", "/api/adaptive/history"),
            ("POST", "/api/feedback/submit", {"topic_id": "top-py-intro", "feedback": "good"}),
            ("POST", "/api/behavior/event", {"event_type": "LESSON_VIEW"})
        ]

        for item in protected_endpoints:
            method, path = item[0], item[1]
            payload = item[2] if len(item) > 2 else None
            with self.subTest(endpoint=path, method=method):
                res = self.client.request(method, path, json=payload)
                self.assertEqual(
                    res.status_code,
                    401,
                    f"Expected 401 for anonymous request to {method} {path}, got {res.status_code}"
                )

    # --- 2. Invalid or Malformed Token ---
    def test_02_invalid_or_malformed_tokens_rejected(self):
        """Tokens with invalid signature, malformed encoding, or missing required claims must return 401."""
        bad_tokens = [
            "completely_garbage_token_string",
            "Bearer ",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.corrupt_signature",
            # Token signed with wrong secret
            jwt.encode(
                {"sub": "u1", "email": "a@b.com", "role": "student", "iat": int(time.time()), "exp": int(time.time()) + 3600},
                "wrong_attacker_secret_key_1234567890",
                algorithm="HS256"
            ),
            # Token missing required 'exp' claim
            jwt.encode(
                {"sub": "u1", "email": "a@b.com", "role": "student"},
                JWT_SECRET,
                algorithm=JWT_ALGORITHM
            ),
            # Token missing required 'sub' claim
            jwt.encode(
                {"email": "a@b.com", "role": "student", "exp": int(time.time()) + 3600},
                JWT_SECRET,
                algorithm=JWT_ALGORITHM
            )
        ]

        for token in bad_tokens:
            with self.subTest(token=token[:20]):
                res = self.client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
                self.assertEqual(res.status_code, 401)

    # --- 3. Expired Token ---
    def test_03_expired_tokens_rejected(self):
        """Tokens past expiration must be strictly rejected with HTTP 401."""
        now = time.time()
        # Expired internal HS256 token
        expired_internal = jwt.encode(
            {
                "sub": "expired_user",
                "email": "expired@test.edu",
                "role": "student",
                "iat": int(now) - 7200,
                "exp": int(now) - 3600
            },
            JWT_SECRET,
            algorithm=JWT_ALGORITHM
        )

        res = self.client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired_internal}"})
        self.assertEqual(res.status_code, 401)

        # Directly testing verify_internal_token raises Expired error
        with self.assertRaises(Exception) as ctx:
            auth_service.verify_internal_token(expired_internal)
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("expired", ctx.exception.detail.lower())

    # --- 4. Student Attempting Admin-Only Operation ---
    def test_04_student_forbidden_from_admin_operations(self):
        """Authenticated student must receive HTTP 403 Forbidden on all admin endpoints."""
        now = time.time()
        # Student internal token
        student_token = auth_service.create_internal_token("student_user_1", "student@test.edu", role="student")

        # Student Firebase token
        def mock_student_fb(token):
            if token == "student_fb_tok":
                return {
                    "iss": f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
                    "sub": "student_fb_1",
                    "email": "student_fb@test.edu",
                    "email_verified": True,
                    "auth_time": now,
                    "exp": int(now) + 3600
                }
            raise Exception("Invalid token")

        set_firebase_verifier_for_testing(mock_student_fb)

        admin_endpoints = [
            ("GET", "/api/admin/analytics"),
            ("GET", "/api/admin/ml-metrics"),
            ("POST", "/api/admin/retrain-ml"),
            ("POST", "/api/admin/reindex-rag"),
            ("POST", "/api/admin/run-diagnostics")
        ]

        for method, path in admin_endpoints:
            with self.subTest(endpoint=path, auth="internal_student"):
                res = self.client.request(method, path, headers={"Authorization": f"Bearer {student_token}"})
                self.assertEqual(res.status_code, 403, f"Student was not rejected with 403 on {path}")

            with self.subTest(endpoint=path, auth="firebase_student"):
                res = self.client.request(method, path, headers={"Authorization": "Bearer student_fb_tok"})
                self.assertEqual(res.status_code, 403, f"Firebase student was not rejected with 403 on {path}")

    # --- 5. Attempted Self-Assignment of Admin Role During Registration ---
    def test_05_admin_self_assignment_neutralized_during_registration(self):
        """Registration payload specifying role='admin' must be forced to 'student' in DB and token."""
        email = f"attacker_{int(time.time()*1000)}@evil.edu"
        res = self.client.post("/api/auth/register", json={
            "name": "Role Escalator",
            "email": email,
            "password": "Password123!",
            "role": "admin"  # Malicious self-assignment attempt
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["user"]["role"], "student")

        # Verify database record role
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute("SELECT role FROM users WHERE email = ?", (email,))
        row = cur.fetchone()
        conn.close()
        self.assertEqual(row["role"], "student", "Database stored escalated role!")

        # Verify returned token cannot access admin routes
        token = data["token"]
        admin_res = self.client.get("/api/admin/analytics", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(admin_res.status_code, 403)

    # --- 6. Access to Another Student's Private Records (Ownership Enforcement) ---
    def test_06_cross_student_ownership_validation_enforced(self):
        """A student must NOT be able to modify, delete, or view another student's private records."""
        # Setup Student A and Student B
        token_a = auth_service.create_internal_token("student_A", "student_a@test.edu")
        token_b = auth_service.create_internal_token("student_B", "student_b@test.edu")

        # Student A creates a note
        res_note = self.client.post(
            "/api/notes",
            json={"language": "python", "topic_id": "top-py-intro", "title": "A Private Note", "content": "Secret notes"},
            headers={"Authorization": f"Bearer {token_a}"}
        )
        self.assertEqual(res_note.status_code, 200)
        note_id = res_note.json().get("id")

        # Student A creates a bookmark
        res_bm = self.client.post(
            "/api/bookmarks",
            json={"item_type": "lesson", "item_id": "top-py-intro", "title": "A Bookmark"},
            headers={"Authorization": f"Bearer {token_a}"}
        )
        self.assertEqual(res_bm.status_code, 200)
        bm_id = res_bm.json().get("id")

        # 1. Student B attempts to modify Student A's note -> 403
        tamper_res = self.client.put(
            f"/api/notes/{note_id}",
            json={"title": "Hacked Title", "content": "Hacked Content"},
            headers={"Authorization": f"Bearer {token_b}"}
        )
        self.assertEqual(tamper_res.status_code, 403)
        self.assertIn("Forbidden", tamper_res.json().get("detail", ""))

        # 2. Student B attempts to delete Student A's note -> 403
        del_note_res = self.client.delete(
            f"/api/notes/{note_id}",
            headers={"Authorization": f"Bearer {token_b}"}
        )
        self.assertEqual(del_note_res.status_code, 403)

        # 3. Student B attempts to delete Student A's bookmark -> 403
        del_bm_res = self.client.delete(
            f"/api/bookmarks/{bm_id}",
            headers={"Authorization": f"Bearer {token_b}"}
        )
        self.assertEqual(del_bm_res.status_code, 403)

        # 4. Student B gets their notes -> Student A's note is NOT included
        list_notes_b = self.client.get("/api/notes", headers={"Authorization": f"Bearer {token_b}"})
        self.assertEqual(list_notes_b.status_code, 200)
        b_note_ids = [n["id"] for n in list_notes_b.json()]
        self.assertNotIn(note_id, b_note_ids)

        # 5. Non-existent note -> 404
        missing_note_res = self.client.put(
            "/api/notes/non_existent_note_999",
            json={"title": "Test"},
            headers={"Authorization": f"Bearer {token_a}"}
        )
        self.assertEqual(missing_note_res.status_code, 404)

        # 6. Student A can successfully update and delete their own note
        ok_update = self.client.put(
            f"/api/notes/{note_id}",
            json={"title": "Updated by Owner"},
            headers={"Authorization": f"Bearer {token_a}"}
        )
        self.assertEqual(ok_update.status_code, 200)

        ok_delete = self.client.delete(
            f"/api/notes/{note_id}",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        self.assertEqual(ok_delete.status_code, 200)

    def test_06b_shared_item_bookmark_deletion_isolation(self):
        """Verify that when two students bookmark the same item_id, one deleting it does not affect or fail against the other."""
        user_1 = f"user_bmark_1_{int(time.time()*1000)}"
        user_2 = f"user_bmark_2_{int(time.time()*1000)}"
        token_1 = auth_service.create_internal_token(user_1, f"{user_1}@test.edu")
        token_2 = auth_service.create_internal_token(user_2, f"{user_2}@test.edu")
        shared_item_id = "shared-topic-recursion-101"

        # Both users bookmark the exact same topic item_id
        res_1 = self.client.post(
            "/api/bookmarks",
            json={"item_type": "lesson", "item_id": shared_item_id, "title": "Recursion Notes"},
            headers={"Authorization": f"Bearer {token_1}"}
        )
        self.assertEqual(res_1.status_code, 200)
        bm_id_1 = res_1.json().get("id")

        res_2 = self.client.post(
            "/api/bookmarks",
            json={"item_type": "lesson", "item_id": shared_item_id, "title": "Recursion Notes"},
            headers={"Authorization": f"Bearer {token_2}"}
        )
        self.assertEqual(res_2.status_code, 200)
        bm_id_2 = res_2.json().get("id")
        self.assertNotEqual(bm_id_1, bm_id_2)

        # 1. User 2 deletes the bookmark by item_id (e.g. unbookmarking the topic) -> 200 OK
        del_item_res = self.client.delete(
            f"/api/bookmarks/{shared_item_id}",
            headers={"Authorization": f"Bearer {token_2}"}
        )
        self.assertEqual(del_item_res.status_code, 200)
        self.assertTrue(del_item_res.json().get("success"))

        # 2. User 2's bookmark is gone
        bmarks_2 = self.client.get("/api/bookmarks", headers={"Authorization": f"Bearer {token_2}"}).json()
        self.assertEqual(len(bmarks_2), 0)

        # 3. User 1's bookmark STILL EXISTS in the database and is returned
        bmarks_1 = self.client.get("/api/bookmarks", headers={"Authorization": f"Bearer {token_1}"}).json()
        self.assertEqual(len(bmarks_1), 1)
        self.assertEqual(bmarks_1[0]["id"], bm_id_1)
        self.assertEqual(bmarks_1[0]["item_id"], shared_item_id)

        # 4. User 2 attempts to delete User 1's bookmark by unique bookmark ID -> 403 Forbidden
        foreign_del = self.client.delete(
            f"/api/bookmarks/{bm_id_1}",
            headers={"Authorization": f"Bearer {token_2}"}
        )
        self.assertEqual(foreign_del.status_code, 403)
        self.assertIn("Forbidden", foreign_del.json().get("detail", ""))

        # 5. Non-existent bookmark ID deletion attempt -> 404 Not Found
        missing_del = self.client.delete(
            "/api/bookmarks/non_existent_bookmark_id_000",
            headers={"Authorization": f"Bearer {token_1}"}
        )
        self.assertEqual(missing_del.status_code, 404)

        # 6. User 1 can delete their own bookmark by unique ID -> 200 OK
        own_del = self.client.delete(
            f"/api/bookmarks/{bm_id_1}",
            headers={"Authorization": f"Bearer {token_1}"}
        )
        self.assertEqual(own_del.status_code, 200)

    # --- 7. Invalid Authentication on Protected Endpoints ---
    def test_07_invalid_auth_fails_closed_across_routes(self):
        """Endpoints fail closed with 401 when invalid authentication is supplied."""
        headers = {"Authorization": "Bearer forged_invalid_token"}
        res_quiz = self.client.post("/api/topics/top-py-intro/quiz/submit", json={"answers": {}}, headers=headers)
        self.assertEqual(res_quiz.status_code, 401)

        res_code = self.client.post("/api/code/submit", json={"topicId": "t", "code": "pass"}, headers=headers)
        self.assertEqual(res_code.status_code, 401)

        res_diag = self.client.post("/api/diagnostic/python/submit", json={"answers": {}}, headers=headers)
        self.assertEqual(res_diag.status_code, 401)

    # --- 8. Production Startup with Missing or Weak Required Secrets ---
    def test_08_production_startup_validation_rules(self):
        """Production validation must abort on missing secrets, insecure defaults, short keys, or wildcards."""
        # 1. Missing secret
        with self.assertRaises(RuntimeError) as ctx:
            validate_production_security(env="production", secret="", origins=["https://app.com"], firebase_id="my-fb")
        self.assertIn("must be explicitly defined", str(ctx.exception))

        # 2. Insecure default secret
        with self.assertRaises(RuntimeError) as ctx:
            validate_production_security(
                env="production",
                secret="cognitive-adaptive-secret-key-2026",
                origins=["https://app.com"],
                firebase_id="my-fb"
            )
        self.assertIn("cannot use an insecure development placeholder", str(ctx.exception))

        # 3. Secret too short (< 32 chars)
        with self.assertRaises(RuntimeError) as ctx:
            validate_production_security(
                env="production",
                secret="short_secret_under_32_chars!",
                origins=["https://app.com"],
                firebase_id="my-fb"
            )
        self.assertIn("at least 32 characters long", str(ctx.exception))

        # 4. Insecure CORS wildcard with credentials in production
        with self.assertRaises(RuntimeError) as ctx:
            validate_production_security(
                env="production",
                secret="a_valid_high_entropy_secret_with_more_than_32_characters!!",
                origins=["*"],
                firebase_id="my-fb"
            )
        self.assertIn("Wildcard '*' in ALLOWED_ORIGINS is strictly forbidden", str(ctx.exception))

        # 5. Invalid / placeholder Firebase project ID
        with self.assertRaises(RuntimeError) as ctx:
            validate_production_security(
                env="production",
                secret="a_valid_high_entropy_secret_with_more_than_32_characters!!",
                origins=["https://app.com"],
                firebase_id="your_project_id",
                admin_emails=["real_admin@institution.edu"]
            )
        self.assertIn("FIREBASE_PROJECT_ID must be a valid", str(ctx.exception))

        # 6. Missing or placeholder admin emails in production
        with self.assertRaises(RuntimeError) as ctx:
            validate_production_security(
                env="production",
                secret="a_valid_high_entropy_secret_with_more_than_32_characters!!",
                origins=["https://app.com"],
                firebase_id="adaptive-learning-system",
                admin_emails=[]
            )
        self.assertIn("PRODUCTION_ADMIN_EMAILS must be explicitly configured", str(ctx.exception))

        with self.assertRaises(RuntimeError) as ctx:
            validate_production_security(
                env="production",
                secret="a_valid_high_entropy_secret_with_more_than_32_characters!!",
                origins=["https://app.com"],
                firebase_id="adaptive-learning-system",
                admin_emails=["admin@cognitive.edu"]
            )
        self.assertIn("cannot use the default placeholder 'admin@cognitive.edu'", str(ctx.exception))

        # 7. Valid production configuration passes cleanly
        try:
            validate_production_security(
                env="production",
                secret="a_valid_high_entropy_secret_with_more_than_32_characters!!",
                origins=["https://adaptive-learning.vercel.app"],
                firebase_id="adaptive-learning-system",
                admin_emails=["lead_admin@institution.edu"]
            )
        except RuntimeError:
            self.fail("validate_production_security raised RuntimeError on a valid production config!")

    # --- 9. CORS Configuration Validation ---
    def test_09_cors_configuration_validation(self):
        """CORS headers must be returned for allowed origins and absent for untrusted origins."""
        # Preflight from allowed origin
        res_allowed = self.client.options(
            "/api/auth/me",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization"
            }
        )
        self.assertEqual(res_allowed.status_code, 200)
        self.assertEqual(res_allowed.headers.get("access-control-allow-origin"), "http://localhost:3000")
        self.assertEqual(res_allowed.headers.get("access-control-allow-credentials"), "true")

        # Request from untrusted origin
        res_untrusted = self.client.options(
            "/api/auth/me",
            headers={
                "Origin": "http://malicious-site.example.com",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization"
            }
        )
        # Untrusted origin must not be reflected in access-control-allow-origin
        self.assertNotEqual(
            res_untrusted.headers.get("access-control-allow-origin"),
            "http://malicious-site.example.com"
        )

    # --- 10. Valid Student and Administrator Workflows ---
    def test_10_valid_student_and_admin_workflows(self):
        """Legitimate student and administrator end-to-end workflows must execute successfully."""
        # 1. Student workflow
        email = f"legit_student_{int(time.time()*1000)}@test.edu"
        reg_res = self.client.post("/api/auth/register", json={
            "name": "Legit Student",
            "email": email,
            "password": "ValidPassword123!"
        })
        self.assertEqual(reg_res.status_code, 200)
        token = reg_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Check me
        me_res = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["user"]["email"], email)

        # Update preferences
        pref_res = self.client.post("/api/auth/preferences", json={"selected_language": "python", "current_level": "intermediate"}, headers=headers)
        self.assertEqual(pref_res.status_code, 200)

        # Learning history
        hist_res = self.client.get("/api/learning-history", headers=headers)
        self.assertEqual(hist_res.status_code, 200)
        self.assertTrue(hist_res.json().get("success"))

        # 2. Administrator workflow (production mode with verified Firebase admin claims)
        saved_env = os.environ.get("ENVIRONMENT", "test")
        saved_admins = os.environ.get("PRODUCTION_ADMIN_EMAILS")
        try:
            os.environ["ENVIRONMENT"] = "production"
            os.environ["PRODUCTION_ADMIN_EMAILS"] = "admin@institution.edu"
            now = time.time()
            admin_claims = {
                "iss": f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
                "sub": "admin_uid_verified",
                "email": "admin@institution.edu",
                "email_verified": True,
                "admin": True,
                "auth_time": now,
                "exp": int(now) + 3600
            }
            set_firebase_verifier_for_testing(lambda t: admin_claims if t == "valid_admin_token" else None)

            admin_headers = {"Authorization": "Bearer valid_admin_token"}
            admin_res = self.client.get("/api/admin/analytics", headers=admin_headers)
            self.assertEqual(admin_res.status_code, 200)
            self.assertIn("total_telemetry_events", admin_res.json())

            ml_res = self.client.get("/api/admin/ml-metrics", headers=admin_headers)
            self.assertEqual(ml_res.status_code, 200)
        finally:
            os.environ["ENVIRONMENT"] = saved_env
            if saved_admins is not None:
                os.environ["PRODUCTION_ADMIN_EMAILS"] = saved_admins
            else:
                os.environ.pop("PRODUCTION_ADMIN_EMAILS", None)
            set_firebase_verifier_for_testing(None)


if __name__ == "__main__":
    unittest.main()
