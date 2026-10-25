"""Unit and security tests for centralized AuthService and route protection.

Tier 1: In-memory unit and security tests verifying claims validation,
fail-closed database isolation, token provenance, production admin enforcement,
and account linking ownership rules.
"""

import os
import sys
import tempfile
import math
import time
import hashlib
import unittest
from pathlib import Path
from unittest.mock import MagicMock

# 1. Establish isolated database environment BEFORE any backend imports
_TEST_TEMP_DIR = tempfile.TemporaryDirectory()
_DISPOSABLE_DB = Path(_TEST_TEMP_DIR.name) / "test_auth_service.db"
os.environ["ADAPTIVE_LEARNING_DB_PATH"] = str(_DISPOSABLE_DB)
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

from fastapi import Request, HTTPException
from fastapi.testclient import TestClient

from backend.config import PROJECT_ROOT, JWT_SECRET, JWT_ALGORITHM, FIREBASE_PROJECT_ID
from backend.services.state_store import state_store
from backend.services.auth_service import (
    auth_service,
    AuthIdentity,
    set_firebase_verifier_for_testing,
    get_firebase_verifier
)
from backend.main import app


class TestAuthServiceUnitAndSecurity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Initialize synthetic schema on disposable DB
        state_store.set_db_path(str(_DISPOSABLE_DB), init_schema=True)
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        set_firebase_verifier_for_testing(None)
        _TEST_TEMP_DIR.cleanup()

    def setUp(self):
        # Reset test verifier
        set_firebase_verifier_for_testing(None)
        os.environ["ENVIRONMENT"] = "test"
        os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

    # --- 1. Database Isolation & Fail-Closed Guard Test ---
    def test_01_real_database_connection_fails_closed_and_leaves_db_unchanged(self):
        """Negative test proving that attempting to target backend/adaptive_learning.db in test mode
        immediately aborts and the real database file remains 100% unmodified.
        """
        real_db_path = str((PROJECT_ROOT / "backend" / "adaptive_learning.db").resolve())
        backup_db_path = str((PROJECT_ROOT / "backend" / "adaptive_learning.db.backup_20261022_151415").resolve())
        original_db_path = state_store.db_path

        with open(real_db_path, "rb") as f:
            pre_hash = hashlib.sha256(f.read()).hexdigest()

        try:
            # Intentionally rebind state_store to real DB path while in test environment
            state_store.db_path = real_db_path
            with self.assertRaises(RuntimeError) as ctx:
                state_store.get_connection()
            self.assertIn("CRITICAL TEST ISOLATION GUARD", str(ctx.exception))
        finally:
            state_store.db_path = original_db_path

        # Verify real database remains byte-for-byte identical
        with open(real_db_path, "rb") as f:
            post_hash = hashlib.sha256(f.read()).hexdigest()
        self.assertEqual(pre_hash, post_hash, "Real database was modified during negative test!")

    # --- 2. Claims Validation Tests (Tier 1 Simulated Verifier) ---
    def test_02_auth_time_boolean_rejection(self):
        """Verify that Boolean auth_time (True or False) is strictly rejected."""
        def mock_verifier(token):
            return {
                "iss": f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
                "sub": "user_123",
                "auth_time": True  # Python gotcha: isinstance(True, int) is True
            }
        set_firebase_verifier_for_testing(mock_verifier)
        with self.assertRaises(HTTPException) as ctx:
            auth_service.verify_firebase_id_token("dummy_token")
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("auth_time must be a valid numeric timestamp", ctx.exception.detail)

    def test_03_auth_time_non_finite_rejection(self):
        """Verify that NaN and Infinity in auth_time are strictly rejected."""
        for bad_val in [float("nan"), float("inf"), float("-inf")]:
            def mock_verifier(token, val=bad_val):
                return {
                    "iss": f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
                    "sub": "user_123",
                    "auth_time": val
                }
            set_firebase_verifier_for_testing(mock_verifier)
            with self.assertRaises(HTTPException) as ctx:
                auth_service.verify_firebase_id_token("dummy_token")
            self.assertEqual(ctx.exception.status_code, 401)
            self.assertIn("finite", ctx.exception.detail)

    def test_04_auth_time_future_and_negative_bounds(self):
        """Verify that future or negative auth_time timestamps are strictly rejected."""
        now = time.time()
        # Future (beyond 10s skew)
        set_firebase_verifier_for_testing(lambda t: {
            "iss": f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
            "sub": "user_123",
            "auth_time": now + 50.0
        })
        with self.assertRaises(HTTPException) as ctx:
            auth_service.verify_firebase_id_token("dummy_token")
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("future", ctx.exception.detail)

        # Negative
        set_firebase_verifier_for_testing(lambda t: {
            "iss": f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
            "sub": "user_123",
            "auth_time": -10.0
        })
        with self.assertRaises(HTTPException) as ctx:
            auth_service.verify_firebase_id_token("dummy_token")
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("negative", ctx.exception.detail)

    def test_05_issuer_and_subject_validation(self):
        """Verify that invalid issuer and missing subject are strictly rejected."""
        now = time.time()
        # Bad issuer
        set_firebase_verifier_for_testing(lambda t: {
            "iss": "https://accounts.google.com",
            "sub": "user_123",
            "auth_time": now
        })
        with self.assertRaises(HTTPException) as ctx:
            auth_service.verify_firebase_id_token("dummy_token")
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("Invalid token issuer", ctx.exception.detail)

        # Missing subject
        set_firebase_verifier_for_testing(lambda t: {
            "iss": f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
            "sub": "",
            "auth_time": now
        })
        with self.assertRaises(HTTPException) as ctx:
            auth_service.verify_firebase_id_token("dummy_token")
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("missing or empty subject", ctx.exception.detail)

    # --- 3. Token Provenance Neutralization ---
    def test_06_unforgeable_server_assigned_provenance(self):
        """Verify that client-supplied role and token_type claims in internal HS256 tokens
        are completely ignored by the server and cannot grant admin privileges in production.
        """
        os.environ["ENVIRONMENT"] = "production"

        # Create an internal token attempting to forge role='admin' and token_type='firebase'
        forged_payload = {
            "sub": "attacker_user",
            "email": "attacker@evil.com",
            "role": "admin",
            "token_type": "firebase",  # Attacker tries to forge provenance
            "iat": int(time.time()),
            "exp": int(time.time()) + 3600
        }
        import jwt
        token = jwt.encode(forged_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

        mock_req = MagicMock(spec=Request)
        mock_req.headers = {"Authorization": f"Bearer {token}"}

        identity = auth_service.verify_request(mock_req)
        self.assertIsNotNone(identity)
        # Server MUST assign 'internal_hs256', ignoring payload claim
        self.assertEqual(identity.token_type, "internal_hs256")

        # In production, require_admin must reject this token with 403
        with self.assertRaises(HTTPException) as ctx:
            auth_service.require_admin(mock_req)
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("Internal HS256 tokens cannot grant administrator privileges in production", ctx.exception.detail)

    # --- 4. Production Admin Authorization Across All 5 Endpoints (25 cases) ---
    def test_07_all_five_admin_endpoints_authorization_matrix(self):
        """Verify the complete authorization matrix for all five admin endpoints under production settings."""
        os.environ["ENVIRONMENT"] = "production"

        endpoints = [
            ("GET", "/api/admin/analytics"),
            ("GET", "/api/admin/ml-metrics"),
            ("POST", "/api/admin/retrain-ml"),
            ("POST", "/api/admin/reindex-rag"),
            ("POST", "/api/admin/run-diagnostics")
        ]

        # Generate a valid student Firebase token
        now = time.time()
        student_claims = {
            "iss": f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
            "sub": "student_101",
            "email": "student@test.edu",
            "email_verified": True,
            "auth_time": now
        }
        # Generate a valid Admin Firebase token (custom claim admin=True)
        admin_claims = {
            "iss": f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
            "sub": "admin_verified",
            "email": "admin@cognitive.edu",
            "email_verified": True,
            "admin": True,
            "auth_time": now
        }
        # Generate an Allowlisted Email Firebase token without admin custom claim
        allowlist_claims = {
            "iss": f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
            "sub": "admin_allowlisted",
            "email": "admin@cognitive.edu",
            "email_verified": True,
            "auth_time": now
        }

        # Setup test verifier dispatching by token string
        def multi_verifier(token):
            if token == "tok_student":
                return student_claims
            if token == "tok_admin":
                return admin_claims
            if token == "tok_allowlist":
                return allowlist_claims
            raise ValueError("Unknown token")

        set_firebase_verifier_for_testing(multi_verifier)

        # Forged HS256 token
        import jwt
        forged_hs256 = jwt.encode(
            {"sub": "attacker", "email": "admin@cognitive.edu", "role": "admin", "iat": int(now), "exp": int(now) + 3600},
            JWT_SECRET, algorithm=JWT_ALGORITHM
        )

        from unittest.mock import patch
        with patch("backend.routes.admin_routes.train_model", return_value=(None, {"f1_score": 0.96})), \
             patch("backend.routes.admin_routes.rag_service.reindex", return_value={"stored_in_chromadb": 10}), \
             patch("backend.routes.admin_routes.rag_service.get_chunk_count", return_value=10), \
             patch("backend.routes.admin_routes.rag_service.retrieve", return_value=[{"text": "mock"}]), \
             patch("backend.routes.admin_routes.llm_service.generate_explanation", return_value={"source": "mock"}):

            for method, path in endpoints:
                with self.subTest(endpoint=path):
                    # 1. Anonymous request -> 401
                    res = self.client.request(method, path)
                    self.assertEqual(res.status_code, 401, f"{path} did not reject anonymous request with 401")

                    # 2. Invalid/corrupted token -> 401
                    res = self.client.request(method, path, headers={"Authorization": "Bearer corrupt_token_xyz"})
                    self.assertEqual(res.status_code, 401, f"{path} did not reject corrupt token with 401")

                    # 3. Student Firebase token -> 403
                    res = self.client.request(method, path, headers={"Authorization": "Bearer tok_student"})
                    self.assertEqual(res.status_code, 403, f"{path} did not reject student token with 403")

                    # 4. Forged HS256 Admin token in production -> 403
                    res = self.client.request(method, path, headers={"Authorization": f"Bearer {forged_hs256}"})
                    self.assertEqual(res.status_code, 403, f"{path} did not reject forged HS256 admin with 403")

                    # 5. Verified Admin Firebase token -> Success (200)
                    res = self.client.request(method, path, headers={"Authorization": "Bearer tok_admin"})
                    self.assertEqual(res.status_code, 200, f"{path} rejected verified admin token")

    # --- 5. Account Linking Ownership and Conflict Rules ---
    def test_08_account_linking_ownership_and_conflicts(self):
        """Verify strict proof-of-local-ownership and 409 conflict rules during account linking."""
        conn = state_store.get_connection()
        cur = conn.cursor()
        # Seed an unlinked local user with a password
        import bcrypt
        hashed = bcrypt.hashpw(b"correct_password_123", bcrypt.gensalt()).decode("utf-8")
        cur.execute(
            "INSERT INTO users (id, email, name, password_hash, role, firebase_uid) VALUES (?, ?, ?, ?, ?, NULL)",
            ("local_learner_1", "linktest@test.edu", "Link Learner", hashed, "student")
        )
        conn.commit()
        conn.close()

        now = time.time()
        # Case A: Unverified email -> 403
        unverified_id = AuthIdentity(
            user_id="fb_unverified",
            email="linktest@test.edu",
            role="student",
            token_type="firebase",
            claims={"email_verified": False, "sub": "fb_unverified", "auth_time": now}
        )
        with self.assertRaises(HTTPException) as ctx:
            auth_service.link_account(unverified_id, local_password="correct_password_123")
        self.assertEqual(ctx.exception.status_code, 403)

        # Case B: Local user exists, no password provided -> 401 LOCAL_CREDENTIALS_REQUIRED
        verified_id = AuthIdentity(
            user_id="fb_valid_uid",
            email="linktest@test.edu",
            role="student",
            token_type="firebase",
            claims={"email_verified": True, "sub": "fb_valid_uid", "auth_time": now}
        )
        with self.assertRaises(HTTPException) as ctx:
            auth_service.link_account(verified_id, local_password=None)
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("LOCAL_CREDENTIALS_REQUIRED", ctx.exception.detail)

        # Case C: Local user exists, incorrect password provided -> 401
        with self.assertRaises(HTTPException) as ctx:
            auth_service.link_account(verified_id, local_password="wrong_password")
        self.assertEqual(ctx.exception.status_code, 401)

        # Case D: Local user exists, correct password -> Success (200)
        res = auth_service.link_account(verified_id, local_password="correct_password_123")
        self.assertTrue(res["success"])
        self.assertEqual(res["user_id"], "local_learner_1")

        # Case E: Duplicate UID conflict (UID already linked to local_learner_1, attempted link to another email)
        conflict_id = AuthIdentity(
            user_id="fb_valid_uid",
            email="different@test.edu",
            role="student",
            token_type="firebase",
            claims={"email_verified": True, "sub": "fb_valid_uid", "auth_time": now}
        )
        with self.assertRaises(HTTPException) as ctx:
            auth_service.link_account(conflict_id, local_password="any_password")
        self.assertEqual(ctx.exception.status_code, 409)
        self.assertIn("already linked to a different local account", ctx.exception.detail)

    # --- 6. Route Hardening: Zero-Trust Identity Enforcement ---
    def test_09_production_route_hardening_rejects_spoofing(self):
        """Verify that in production mode, routes reject X-User-Id, query params, and guest fallbacks."""
        os.environ["ENVIRONMENT"] = "production"

        # Protected endpoint: quiz submit
        quiz_payload = {"answers": {"q1": 0}, "time_spent": 30.0}

        # 1. Header spoofing: X-User-Id without valid Bearer token -> 401
        res = self.client.post(
            "/api/topics/top-py-intro/quiz/submit",
            json=quiz_payload,
            headers={"X-User-Id": "spoofed_admin"}
        )
        self.assertEqual(res.status_code, 401)

        # 2. Query param spoofing: ?user_id=spoofed_admin -> 401
        res = self.client.post(
            "/api/topics/top-py-intro/quiz/submit?user_id=spoofed_admin",
            json=quiz_payload
        )
        self.assertEqual(res.status_code, 401)

        # 3. Anonymous request (no headers) -> 401 (guest fallback eliminated)
        res = self.client.post(
            "/api/topics/top-py-intro/quiz/submit",
            json=quiz_payload
        )
        self.assertEqual(res.status_code, 401)


if __name__ == "__main__":
    unittest.main()
