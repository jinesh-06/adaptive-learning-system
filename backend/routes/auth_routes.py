"""Authentication routes."""

import time
import jwt
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

from backend.services.state_store import state_store

router = APIRouter(prefix="/auth", tags=["auth"])
JWT_SECRET = "cognitive-adaptive-secret-key-2026"
JWT_ALGORITHM = "HS256"


def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": int(time.time()) + 86400 * 30  # 30 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user_id(request: Request) -> str:
    try:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()
            # 1. Try decoding as backend HS256 JWT
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                uid = payload.get("sub")
                if uid and isinstance(uid, str) and uid.strip():
                    return uid.strip()
            except Exception:
                pass

            # 2. Try decoding as Firebase ID token claims
            try:
                claims = jwt.decode(token, options={"verify_signature": False})
                uid = claims.get("user_id") or claims.get("sub")
                if uid and isinstance(uid, str) and uid.strip():
                    return uid.strip()
            except Exception:
                pass

        header_uid = request.headers.get("X-User-Id")
        if header_uid and isinstance(header_uid, str) and header_uid.strip():
            return header_uid.strip()

        query_uid = request.query_params.get("user_id")
        if query_uid and isinstance(query_uid, str) and query_uid.strip():
            return query_uid.strip()
    except Exception as e:
        print(f"[auth_routes] get_current_user_id exception: {e}")

    return "guest-learner"


class RegisterPayload(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "student"


class LoginPayload(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register(payload: RegisterPayload):
    user_id = f"user_{int(time.time() * 1000)}"
    conn = state_store.get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)",
            (user_id, payload.email, payload.name, payload.password, payload.role)
        )
        cur.execute(
            "INSERT INTO user_preferences (user_id, selected_language, current_level, preferred_mode) VALUES (?, ?, ?, ?)",
            (user_id, "python", "beginner", "adaptive")
        )
        conn.commit()
    except Exception:
        # User already exists or error
        pass
    finally:
        conn.close()

    token = create_token(user_id, payload.email)
    user_data = {
        "id": user_id,
        "name": payload.name,
        "email": payload.email,
        "role": payload.role
    }
    return {
        "success": True,
        "token": token,
        "user": user_data,
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
    cur.execute("SELECT id, email, name, role FROM users WHERE email = ?", (payload.email,))
    row = cur.fetchone()

    if row:
        user_id = row["id"]
        name = row["name"]
        role = row["role"]
    else:
        # Create user dynamically on first login
        user_id = f"user_{int(time.time() * 1000)}"
        name = payload.email.split("@")[0].capitalize()
        role = "student"
        cur.execute(
            "INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)",
            (user_id, payload.email, name, payload.password, role)
        )
        cur.execute(
            "INSERT INTO user_preferences (user_id, selected_language, current_level, preferred_mode) VALUES (?, ?, ?, ?)",
            (user_id, "python", "beginner", "adaptive")
        )
        conn.commit()

    conn.close()

    token = create_token(user_id, payload.email)
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


@router.get("/me")
async def get_me(request: Request):
    user_id = get_current_user_id(request)
    conn = state_store.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, email, name, role FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()

    if not row:
        email = "learner@cognitive.edu"
        name = "Learner"
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            try:
                claims = jwt.decode(auth_header[7:].strip(), options={"verify_signature": False})
                email = claims.get("email", email)
                name = claims.get("name") or email.split("@")[0].capitalize()
            except Exception:
                pass
        user = {"id": user_id, "name": name, "email": email, "role": "student"}
    else:
        user = dict(row)

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


class OAuthPayload(BaseModel):
    provider: str
    email: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None


@router.post("/oauth")
async def oauth_login(payload: OAuthPayload):
    provider = payload.provider.lower()
    email = payload.email or f"{provider}.developer@cognitive.edu"
    name = payload.name or (f"GitHub Developer" if provider == "github" else "Google Learner")
    
    conn = state_store.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, email, name, role FROM users WHERE email = ?", (email,))
    row = cur.fetchone()

    if row:
        user_id = row["id"]
        name = row["name"]
        role = row["role"]
    else:
        user_id = f"oauth_{provider}_{int(time.time() * 1000)}"
        role = "student"
        cur.execute(
            "INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)",
            (user_id, email, name, f"oauth_{provider}_token", role)
        )
        cur.execute(
            "INSERT INTO user_preferences (user_id, selected_language, current_level, preferred_mode) VALUES (?, ?, ?, ?)",
            (user_id, "python", "beginner", "adaptive")
        )
        conn.commit()

    conn.close()

    token = create_token(user_id, email)
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "role": role,
            "provider": provider,
            "avatar_url": payload.avatar_url
        },
        "preferences": {
            "selected_language": "python",
            "current_level": "beginner",
            "preferred_mode": "adaptive"
        }
    }


class ForgotPasswordPayload(BaseModel):
    email: str


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordPayload):
    # Check if user exists or simulate reset email dispatched
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
