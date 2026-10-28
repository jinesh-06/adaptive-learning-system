"""Authentication routes."""

import time
import bcrypt
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

from backend.config import JWT_SECRET, JWT_ALGORITHM
from backend.services.state_store import state_store
from backend.services.auth_service import auth_service, AuthIdentity

router = APIRouter(prefix="/auth", tags=["auth"])


def create_token(user_id: str, email: str, role: str = "student") -> str:
    """Create internal JWT token."""
    return auth_service.create_internal_token(user_id, email, role)


def get_current_user_id(request: Request) -> str:
    """Strictly authenticate request and return verified user_id."""
    return auth_service.get_current_user_id(request)


class RegisterPayload(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "student"


class LoginPayload(BaseModel):
    email: str
    password: str


class LinkAccountPayload(BaseModel):
    password: Optional[str] = None


class OAuthPayload(BaseModel):
    provider: str
    email: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None


@router.post("/register")
async def register(payload: RegisterPayload):
    conn = state_store.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = ?", (payload.email,))
    existing = cur.fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="User with this email already exists")

    user_id = f"user_{int(time.time() * 1000)}"
    # Store bcrypt hash
    hashed_password = bcrypt.hashpw(payload.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    # Public self-registration strictly assigns the default 'student' role to prevent privilege escalation
    role = "student"

    try:
        cur.execute(
            "INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)",
            (user_id, payload.email, payload.name, hashed_password, role)
        )
        cur.execute(
            "INSERT INTO user_preferences (user_id, selected_language, current_level, preferred_mode) VALUES (?, ?, ?, ?)",
            (user_id, "python", "beginner", "adaptive")
        )
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")
    finally:
        conn.close()

    token = create_token(user_id, payload.email, role)
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "name": payload.name,
            "email": payload.email,
            "role": role
        },
        "preferences": {
            "selected_language": "python",
            "current_level": "beginner",
            "preferred_mode": "adaptive"
        }
    }


@router.post("/login")
async def login(payload: LoginPayload):
    conn = state_store.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, email, name, password_hash, role FROM users WHERE email = ?", (payload.email,))
    row = cur.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = row["id"]
    name = row["name"]
    role = row["role"]
    stored_hash = row["password_hash"] or ""
    conn.close()

    # Password check: bcrypt hash or legacy plaintext match
    pwd_ok = False
    if stored_hash.startswith(("$2b$", "$2a$", "$2y$")):
        try:
            pwd_ok = bcrypt.checkpw(payload.password.encode("utf-8"), stored_hash.encode("utf-8"))
        except Exception:
            pwd_ok = False
    else:
        pwd_ok = (stored_hash == payload.password)

    if not pwd_ok:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(user_id, payload.email, role)
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": payload.email,
            "role": role
        },
        "preferences": {
            "selected_language": "python",
            "current_level": "beginner",
            "preferred_mode": "adaptive"
        }
    }


@router.post("/oauth")
async def oauth_login(payload: OAuthPayload, request: Request):
    """Verify Firebase ID token from Authorization header and safely provision/link account."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authorization Bearer token containing verified Firebase ID token is required"
        )

    raw_token = auth_header[7:].strip()
    claims = auth_service.verify_firebase_id_token(raw_token)

    firebase_identity = AuthIdentity(
        user_id=claims["sub"],
        email=claims.get("email"),
        name=claims.get("name") or payload.name,
        role="student",
        token_type="firebase",
        claims=claims
    )

    # Link or provision account
    link_result = auth_service.link_account(firebase_identity)
    effective_user_id = link_result["user_id"]

    conn = state_store.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, email, name, role FROM users WHERE id = ?", (effective_user_id,))
    user_row = cur.fetchone()
    conn.close()

    return {
        "success": True,
        "token": raw_token,
        "user": {
            "id": effective_user_id,
            "name": user_row["name"] if user_row else firebase_identity.name,
            "email": user_row["email"] if user_row else firebase_identity.email,
            "role": user_row["role"] if user_row else "student",
            "provider": payload.provider
        },
        "preferences": {
            "selected_language": "python",
            "current_level": "beginner",
            "preferred_mode": "adaptive"
        }
    }


@router.post("/link-account")
async def link_account_endpoint(payload: LinkAccountPayload, request: Request):
    """Link an existing local account to a Firebase ID token by providing the local account password."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Bearer token required")

    raw_token = auth_header[7:].strip()
    claims = auth_service.verify_firebase_id_token(raw_token)

    firebase_identity = AuthIdentity(
        user_id=claims["sub"],
        email=claims.get("email"),
        name=claims.get("name"),
        role="student",
        token_type="firebase",
        claims=claims
    )

    result = auth_service.link_account(firebase_identity, local_password=payload.password)
    return result


@router.get("/me")
async def get_me(request: Request):
    identity = auth_service.verify_request(request)
    if not identity:
        raise HTTPException(status_code=401, detail="Authentication required")

    user_id = identity.user_id
    conn = state_store.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, email, name, role FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()

    user = dict(row) if row else {
        "id": user_id,
        "name": identity.name or "Learner",
        "email": identity.email or "learner@cognitive.edu",
        "role": identity.role
    }

    cur.execute("SELECT selected_language, current_level, preferred_mode FROM user_preferences WHERE user_id = ?", (user_id,))
    pref_row = cur.fetchone()
    conn.close()

    preferences = dict(pref_row) if pref_row else {
        "selected_language": "python",
        "current_level": "beginner",
        "preferred_mode": "adaptive"
    }

    return {
        "user": user,
        "preferences": preferences
    }


@router.post("/preferences")
async def update_preferences(request: Request, payload: Dict[str, Any]):
    user_id = get_current_user_id(request)
    conn = state_store.get_connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT OR REPLACE INTO user_preferences (user_id, selected_language, current_level, preferred_mode)
           VALUES (?, ?, ?, ?)""",
        (
            user_id,
            payload.get("selected_language", "python"),
            payload.get("current_level", "beginner"),
            payload.get("preferred_mode", "adaptive")
        )
    )
    conn.commit()
    conn.close()
    return {"success": True, "preferences": payload}


class ForgotPasswordPayload(BaseModel):
    email: str


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordPayload):
    conn = state_store.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, email FROM users WHERE email = ?", (payload.email,))
    row = cur.fetchone()
    conn.close()

    return {
        "success": True,
        "message": f"Password reset instructions have been generated for {payload.email}.",
        "reset_sent": True
    }
