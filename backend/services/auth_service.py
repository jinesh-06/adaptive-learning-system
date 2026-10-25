"""Centralized Authentication & Authorization Service.

Enforces cryptographic token verification, server-assigned provenance,
unforgeable production admin authorization, and safe account-linking rules.
"""

import os
import math
import time
import jwt
from typing import Dict, Any, Optional, Callable
from pydantic import BaseModel
from fastapi import Request, HTTPException, Depends
from google.oauth2 import id_token
from google.auth.transport.requests import Request as GoogleAuthRequest
import bcrypt

from backend.config import (
    ENVIRONMENT,
    JWT_SECRET,
    JWT_ALGORITHM,
    FIREBASE_PROJECT_ID,
    PRODUCTION_ADMIN_EMAILS
)
from backend.services.state_store import state_store


class AuthIdentity(BaseModel):
    user_id: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: str = "student"
    token_type: str  # Server-assigned: "firebase" or "internal_hs256"
    claims: Dict[str, Any] = {}


# --- Pluggable In-Memory Verifier for Offline Testing ---
def _default_firebase_verifier(token: str) -> Dict[str, Any]:
    """Production verifier: validates against Google's live public certificates."""
    return id_token.verify_firebase_token(
        token,
        GoogleAuthRequest(),
        audience=FIREBASE_PROJECT_ID,
        clock_skew_in_seconds=10
    )

_active_firebase_verifier: Callable[[str], Dict[str, Any]] = _default_firebase_verifier


def get_firebase_verifier() -> Callable[[str], Dict[str, Any]]:
    """Dependency provider for Firebase token verifier."""
    return _active_firebase_verifier


def set_firebase_verifier_for_testing(verifier_fn: Optional[Callable[[str], Dict[str, Any]]]):
    """Inject a test-only verifier in memory (for offline unit tests)."""
    global _active_firebase_verifier
    if verifier_fn is None:
        _active_firebase_verifier = _default_firebase_verifier
    else:
        _active_firebase_verifier = verifier_fn


class AuthService:
    """Security and identity management service."""

    def verify_firebase_id_token(self, token: str) -> Dict[str, Any]:
        """Verify Firebase ID token and validate all strict claim requirements."""
        verifier = get_firebase_verifier()
        try:
            claims = verifier(token)
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid Firebase ID token: {str(e)}")

        if not isinstance(claims, dict):
            raise HTTPException(status_code=401, detail="Invalid token payload structure")

        # 1. Validate Issuer
        expected_iss = f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}"
        if claims.get("iss") != expected_iss:
            raise HTTPException(
                status_code=401,
                detail=f"Invalid token issuer: expected {expected_iss}, got {claims.get('iss')}"
            )

        # 2. Validate Subject
        sub = claims.get("sub")
        if not sub or not isinstance(sub, str) or not sub.strip():
            raise HTTPException(status_code=401, detail="Invalid token: missing or empty subject (sub)")

        # 3. Validate auth_time strictly (Boolean rejection, numeric type, isfinite, future/negative bounds)
        auth_time = claims.get("auth_time")
        if auth_time is None or isinstance(auth_time, bool):
            raise HTTPException(status_code=401, detail="Invalid token: auth_time must be a valid numeric timestamp")
        if not isinstance(auth_time, (int, float)):
            raise HTTPException(status_code=401, detail="Invalid token: auth_time must be numeric")
        if not math.isfinite(auth_time):
            raise HTTPException(status_code=401, detail="Invalid token: auth_time must be finite (no NaN or Infinity)")

        now = time.time()
        if auth_time > (now + 10.0):
            raise HTTPException(status_code=401, detail="Invalid token: auth_time cannot be in the future")
        if auth_time < 0:
            raise HTTPException(status_code=401, detail="Invalid token: auth_time cannot be negative")

        return claims

    def verify_internal_token(self, token: str) -> Dict[str, Any]:
        """Verify internally signed HS256 JWT."""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid session token: {str(e)}")

    def create_internal_token(self, user_id: str, email: str, role: str = "student", expires_in_seconds: int = 86400 * 30) -> str:
        """Create a securely signed internal HS256 token."""
        payload = {
            "sub": user_id,
            "email": email,
            "role": role,
            "iat": int(time.time()),
            "exp": int(time.time()) + expires_in_seconds
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    def verify_request(self, request: Request) -> Optional[AuthIdentity]:
        """Extract and cryptographically verify Bearer token from request.
        Assigns server-controlled token_type ('firebase' or 'internal_hs256').
        Ignores client-supplied role or token_type claims.
        """
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header[7:].strip()
        if not token:
            return None

        # 1. Attempt verification as Firebase ID token
        try:
            claims = self.verify_firebase_id_token(token)
            uid = claims["sub"]
            email = claims.get("email")

            # Look up role and user in database
            conn = state_store.get_connection()
            cur = conn.cursor()
            cur.execute("PRAGMA table_info(users)")
            user_cols = [r[1] for r in cur.fetchall()]
            if "firebase_uid" in user_cols:
                cur.execute("SELECT id, role, email, name FROM users WHERE id = ? OR firebase_uid = ?", (uid, uid))
            else:
                cur.execute("SELECT id, role, email, name FROM users WHERE id = ?", (uid,))
            user_row = cur.fetchone()
            conn.close()

            role = user_row["role"] if user_row else "student"
            user_id = user_row["id"] if user_row else uid
            user_name = user_row["name"] if user_row else claims.get("name")

            return AuthIdentity(
                user_id=user_id,
                email=email,
                name=user_name,
                role=role,
                token_type="firebase",  # Server-assigned
                claims=claims
            )
        except HTTPException:
            # Not a valid Firebase token; fall through to test internal token
            pass

        # 2. Attempt verification as internal HS256 token
        try:
            payload = self.verify_internal_token(token)
            sub = payload.get("sub")
            if not sub:
                return None

            conn = state_store.get_connection()
            cur = conn.cursor()
            cur.execute("SELECT id, role, email, name FROM users WHERE id = ?", (sub,))
            user_row = cur.fetchone()
            conn.close()

            role = user_row["role"] if user_row else payload.get("role", "student")
            email = user_row["email"] if user_row else payload.get("email")
            name = user_row["name"] if user_row else None

            return AuthIdentity(
                user_id=sub,
                email=email,
                name=name,
                role=role,
                token_type="internal_hs256",  # Server-assigned
                claims=payload
            )
        except HTTPException:
            return None

    def get_current_user_id(self, request: Request) -> str:
        """Strictly authenticate request and return verified user_id.
        In production: rejects X-User-Id, query-string user_id, unverified JWT, guest fallback.
        In test/dev: allows X-User-Id ONLY when explicit ALLOW_DEV_TEST_HEADERS=true is configured.
        """
        identity = self.verify_request(request)
        if identity and identity.user_id:
            return identity.user_id

        env = os.getenv("ENVIRONMENT", ENVIRONMENT).lower()

        # In production: zero tolerance for spoofed headers or guest fallback
        if env == "production":
            raise HTTPException(
                status_code=401,
                detail="Authentication required: Valid Bearer token must be provided."
            )

        # In development / test mode: check for explicit dev header allowance (for Phase 1 tests)
        if os.getenv("ALLOW_DEV_TEST_HEADERS", "false").lower() == "true":
            header_uid = request.headers.get("X-User-Id")
            if header_uid and header_uid.strip():
                return header_uid.strip()

        raise HTTPException(
            status_code=401,
            detail="Authentication required: Valid Bearer token must be provided."
        )

    def require_admin(self, request: Request) -> AuthIdentity:
        """Enforce unforgeable administrator authorization.
        In production:
          - Internal HS256 tokens are unconditionally rejected (403).
          - Requires token_type == 'firebase' AND (claims['admin'] is True OR verified email in allowlist).
        In development:
          - Allows demo admin access ONLY if ENABLE_DEMO_ADMIN=true.
        """
        identity = self.verify_request(request)
        if not identity:
            raise HTTPException(status_code=401, detail="Authentication required for admin access")

        env = os.getenv("ENVIRONMENT", ENVIRONMENT).lower()

        if env == "production":
            # 1. HS256 tokens are strictly forbidden from having admin rights in production
            if identity.token_type != "firebase":
                raise HTTPException(
                    status_code=403,
                    detail="Forbidden: Internal HS256 tokens cannot grant administrator privileges in production."
                )

            # 2. Must meet verified Firebase admin claim or verified allowlist email
            has_admin_claim = identity.claims.get("admin") is True
            email = (identity.email or "").strip().lower()
            is_email_verified = identity.claims.get("email_verified") is True
            is_allowlisted = is_email_verified and email in PRODUCTION_ADMIN_EMAILS

            if not (has_admin_claim or is_allowlisted):
                raise HTTPException(
                    status_code=403,
                    detail="Forbidden: User lacks verified production administrator privileges."
                )

            return identity

        # Development / Demo mode ONLY (when ENVIRONMENT != 'production')
        if os.getenv("ENABLE_DEMO_ADMIN", "false").lower() == "true":
            if identity.role == "admin" or (identity.email and identity.email.lower() in PRODUCTION_ADMIN_EMAILS):
                return identity

        raise HTTPException(status_code=403, detail="Forbidden: Administrator access disabled or unauthorized.")

    def link_account(self, firebase_identity: AuthIdentity, local_password: Optional[str] = None) -> Dict[str, Any]:
        """Safe account linking policy.
        Requires verified email and proof of local ownership (password) if linking an existing local account.
        """
        f_uid = firebase_identity.user_id
        email = (firebase_identity.email or "").strip().lower()
        email_verified = firebase_identity.claims.get("email_verified") is True

        if not email or not email_verified:
            raise HTTPException(
                status_code=403,
                detail="Account linking requires a verified email address from the identity provider."
            )

        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute("PRAGMA table_info(users)")
        user_cols = [r[1] for r in cur.fetchall()]
        if "firebase_uid" not in user_cols:
            conn.close()
            raise HTTPException(
                status_code=503,
                detail="Account linking is unavailable until database schema migration is completed."
            )

        # Check if Firebase UID is already linked to another local account
        cur.execute("SELECT id, email FROM users WHERE firebase_uid = ?", (f_uid,))
        existing_uid_owner = cur.fetchone()
        if existing_uid_owner:
            conn.close()
            if existing_uid_owner["email"] == email:
                return {"success": True, "message": "Already linked", "user_id": existing_uid_owner["id"]}
            raise HTTPException(
                status_code=409,
                detail="Firebase UID is already linked to a different local account."
            )

        # Check if local account exists with this email
        cur.execute("SELECT id, email, password_hash, firebase_uid FROM users WHERE email = ?", (email,))
        local_user = cur.fetchone()

        if local_user:
            # If already linked to another Firebase UID -> Conflict
            if local_user["firebase_uid"] and local_user["firebase_uid"] != f_uid:
                conn.close()
                raise HTTPException(
                    status_code=409,
                    detail="Local account is already linked to another identity provider account."
                )

            # Local account has no firebase_uid: requires proof of local ownership
            if not local_user["firebase_uid"]:
                if not local_password:
                    conn.close()
                    raise HTTPException(
                        status_code=401,
                        detail="LOCAL_CREDENTIALS_REQUIRED: Please enter your local account password to link accounts."
                    )

                # Verify password
                stored_pwd = local_user["password_hash"] or ""
                pwd_ok = False
                if stored_pwd.startswith(("$2b$", "$2a$", "$2y$")):
                    try:
                        pwd_ok = bcrypt.checkpw(local_password.encode("utf-8"), stored_pwd.encode("utf-8"))
                    except Exception:
                        pwd_ok = False
                else:
                    pwd_ok = (stored_pwd == local_password)

                if not pwd_ok:
                    conn.close()
                    raise HTTPException(status_code=401, detail="Invalid password for existing local account.")

            # Update link atomically with race protection
            cur.execute(
                "UPDATE users SET firebase_uid = ? WHERE id = ? AND (firebase_uid IS NULL OR firebase_uid = ?)",
                (f_uid, local_user["id"], f_uid)
            )
            if cur.rowcount == 0:
                conn.rollback()
                conn.close()
                raise HTTPException(status_code=409, detail="Concurrent linking attempt detected. Please retry.")

            conn.commit()
            conn.close()
            return {"success": True, "message": "Account linked successfully", "user_id": local_user["id"]}

        # No local user exists: provision new user safely
        cur.execute(
            "INSERT INTO users (id, email, name, role, firebase_uid) VALUES (?, ?, ?, ?, ?)",
            (f_uid, email, firebase_identity.name or email.split("@")[0].capitalize(), "student", f_uid)
        )
        cur.execute(
            "INSERT OR IGNORE INTO user_preferences (user_id, selected_language, current_level, preferred_mode) VALUES (?, ?, ?, ?)",
            (f_uid, "python", "beginner", "adaptive")
        )
        conn.commit()
        conn.close()
        return {"success": True, "message": "New account provisioned", "user_id": f_uid}


auth_service = AuthService()
