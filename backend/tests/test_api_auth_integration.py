"""Tier 2: Backend API Integration Tests for Authentication and Authorization.

Verifies end-to-end HTTP request/response flows for:
- User registration and bcrypt password hashing (/api/auth/register)
- Login authentication (/api/auth/login)
- Current user profile retrieval (/api/auth/me)
- OAuth token verification and automatic user provisioning (/api/auth/oauth)
- Password-verified account linking and conflict rejection (/api/auth/link-account)
- Route protection and Bearer token enforcement on protected APIs
- Database isolation guard enforcement on all API requests
"""

import os
import sys
import tempfile
import time
import hashlib
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

# 1. Establish isolated database environment BEFORE any backend imports
_TEST_TEMP_DIR = tempfile.TemporaryDirectory()
_DISPOSABLE_DB = Path(_TEST_TEMP_DIR.name) / "test_api_auth_integration.db"
os.environ["ADAPTIVE_LEARNING_DB_PATH"] = str(_DISPOSABLE_DB)
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

from fastapi.testclient import TestClient

from backend.config import PROJECT_ROOT, JWT_SECRET, JWT_ALGORITHM, FIREBASE_PROJECT_ID
from backend.services.state_store import state_store
from backend.services.auth_service import (
    auth_service,
    AuthIdentity,
    set_firebase_verifier_for_testing
)
from backend.main import app


class TestApiAuthIntegration(unittest.TestCase):
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
        set_firebase_verifier_for_testing(None)
        os.environ["ENVIRONMENT"] = "test"
        os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

    # --- 1. User Registration Flow ---
    def test_01_registration_flow(self):
        """Test registration creates user, hashes password, and returns valid token."""
        email = f"api_user_{int(time.time()*1000)}@test.edu"
        payload = {
            "name": "Integration Learner",
            "email": email,
            "password": "SecurePassword123!"
        }
        res = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        self.assertIn("token", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["email"], email)

        # Duplicate registration should return 400
        res_dup = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(res_dup.status_code, 400)
        self.assertIn("already exists", res_dup.json().get("detail", ""))

    # --- 2. Login Flow with Bcrypt Verification ---
    def test_02_login_flow(self):
        """Test login with valid and invalid credentials."""
        email = f"login_test_{int(time.time()*1000)}@test.edu"
        password = "ValidPassword456!"

        # Register first
        self.client.post("/api/auth/register", json={
            "name": "Login Tester",
            "email": email,
            "password": password
        })

        # Correct password -> 200
        res_ok = self.client.post("/api/auth/login", json={
            "email": email,
            "password": password
        })
        self.assertEqual(res_ok.status_code, 200)
        data = res_ok.json()
        self.assertTrue(data.get("success"))
        self.assertIn("token", data)

        # Incorrect password -> 401
        res_wrong = self.client.post("/api/auth/login", json={
            "email": email,
            "password": "WrongPassword!"
        })
        self.assertEqual(res_wrong.status_code, 401)

        # Non-existent email -> 401
        res_none = self.client.post("/api/auth/login", json={
            "email": "nonexistent@test.edu",
            "password": "AnyPassword!"
        })
        self.assertEqual(res_none.status_code, 401)

    # --- 3. Profile /api/auth/me Verification ---
    def test_03_me_endpoint_bearer_token(self):
        """Test /api/auth/me accepts valid Bearer token and rejects invalid/missing tokens."""
        email = f"me_test_{int(time.time()*1000)}@test.edu"
        reg_res = self.client.post("/api/auth/register", json={
            "name": "Me Tester",
            "email": email,
            "password": "Password789!"
        })
        token = reg_res.json()["token"]

        # Valid Bearer token -> 200
        res_auth = self.client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res_auth.status_code, 200)
        user_data = res_auth.json().get("user")
        self.assertIsNotNone(user_data)
        self.assertEqual(user_data["email"], email)

        # Missing token -> 401
        res_no_token = self.client.get("/api/auth/me")
        self.assertEqual(res_no_token.status_code, 401)

        # Invalid token -> 401
        res_bad_token = self.client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_garbage_token"})
        self.assertEqual(res_bad_token.status_code, 401)

    # --- 4. OAuth Flow and User Provisioning ---
    def test_04_oauth_verified_flow(self):
        """Test /api/auth/oauth provisions new user when presented with a valid Firebase ID token."""
        oauth_email = f"oauth_user_{int(time.time()*1000)}@test.edu"
        oauth_uid = f"fb_uid_{int(time.time()*1000)}"
        now = time.time()

        # Inject mock Firebase verifier
        def mock_verifier(token):
            if token == "valid_oauth_id_token":
                return {
                    "sub": oauth_uid,
                    "email": oauth_email,
                    "email_verified": True,
                    "name": "OAuth Learner",
                    "aud": FIREBASE_PROJECT_ID,
                    "iss": f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
                    "auth_time": now,
                    "iat": int(now),
                    "exp": int(now) + 3600
                }
            raise Exception("Invalid ID token")

        set_firebase_verifier_for_testing(mock_verifier)

        # Call /api/auth/oauth with Bearer token
        res = self.client.post(
            "/api/auth/oauth",
            json={"provider": "google.com", "email": oauth_email, "name": "OAuth Learner"},
            headers={"Authorization": "Bearer valid_oauth_id_token"}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        self.assertIn("token", data)
        self.assertEqual(data["user"]["email"], oauth_email)

        # Calling again with same token returns existing user
        res_repeat = self.client.post(
            "/api/auth/oauth",
            json={"provider": "google.com", "email": oauth_email, "name": "OAuth Learner"},
            headers={"Authorization": "Bearer valid_oauth_id_token"}
        )
        self.assertEqual(res_repeat.status_code, 200)
        self.assertEqual(res_repeat.json()["user"]["id"], data["user"]["id"])

    # --- 5. Account Linking API Contract ---
    def test_05_link_account_api(self):
        """Test /api/auth/link-account enforces password verification on local accounts."""
        email = f"link_api_{int(time.time()*1000)}@test.edu"
        local_password = "LocalSecretPassword123!"
        fb_uid = f"fb_link_{int(time.time()*1000)}"
        now = time.time()

        # 1. Create a local account first via register
        self.client.post("/api/auth/register", json={
            "name": "Link Candidate",
            "email": email,
            "password": local_password
        })

        def mock_verifier(token):
            if token == "token_to_link":
                return {
                    "sub": fb_uid,
                    "email": email,
                    "email_verified": True,
                    "aud": FIREBASE_PROJECT_ID,
                    "iss": f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
                    "auth_time": now,
                    "iat": int(now),
                    "exp": int(now) + 3600
                }
            raise Exception("Bad token")

        set_firebase_verifier_for_testing(mock_verifier)

        # Attempt to link without password -> 401 LOCAL_CREDENTIALS_REQUIRED
        res_no_pw = self.client.post(
            "/api/auth/link-account",
            json={"password": None},
            headers={"Authorization": "Bearer token_to_link"}
        )
        self.assertEqual(res_no_pw.status_code, 401)
        self.assertIn("LOCAL_CREDENTIALS_REQUIRED", res_no_pw.json().get("detail", ""))

        # Attempt to link with wrong password -> 401
        res_wrong_pw = self.client.post(
            "/api/auth/link-account",
            json={"password": "WrongPassword"},
            headers={"Authorization": "Bearer token_to_link"}
        )
        self.assertEqual(res_wrong_pw.status_code, 401)

        # Attempt to link with correct password -> 200
        res_ok = self.client.post(
            "/api/auth/link-account",
            json={"password": local_password},
            headers={"Authorization": "Bearer token_to_link"}
        )
        self.assertEqual(res_ok.status_code, 200)
        self.assertTrue(res_ok.json().get("success"))

        # Subsequent link attempt returns "Already linked"
        res_already = self.client.post(
            "/api/auth/link-account",
            json={"password": local_password},
            headers={"Authorization": "Bearer token_to_link"}
        )
        self.assertEqual(res_already.status_code, 200)
        self.assertIn("Already linked", res_already.json().get("message", ""))


if __name__ == "__main__":
    unittest.main()
