"""Configuration for the integrated Adaptive Learning Backend."""

import os
from pathlib import Path
from dotenv import load_dotenv

# Project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Load environment variables
load_dotenv(PROJECT_ROOT / ".env", override=False)
load_dotenv()

# Server Settings
HOST = os.getenv("BACKEND_HOST", "127.0.0.1")
PORT = int(os.getenv("BACKEND_PORT", "5000"))

# Gemini / LLM Settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Platform Data
PLATFORM_DATA_PATH = PROJECT_ROOT / "src" / "data" / "platformData.json"

# Environment & Security Settings
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").strip().lower()
_raw_admin_emails = os.getenv("PRODUCTION_ADMIN_EMAILS")
if _raw_admin_emails and _raw_admin_emails.strip():
    PRODUCTION_ADMIN_EMAILS = [e.strip().lower() for e in _raw_admin_emails.split(",") if e.strip()]
else:
    # In production, do not fall back to dummy placeholder admin email
    PRODUCTION_ADMIN_EMAILS = [] if ENVIRONMENT == "production" else ["admin@cognitive.edu"]

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "adaptive-learning-system").strip()

INSECURE_DEFAULT_SECRETS = {
    "cognitive-adaptive-secret-key-2026",
    "secret",
    "changeme",
    "your_jwt_secret_here",
    "jwt_secret",
    "password",
    "12345678",
    "default_secret"
}

# CORS Configuration
_raw_allowed_origins = os.getenv("ALLOWED_ORIGINS") or os.getenv("CORS_ORIGINS")
if _raw_allowed_origins and _raw_allowed_origins.strip():
    ALLOWED_ORIGINS = [o.strip() for o in _raw_allowed_origins.split(",") if o.strip()]
else:
    # Safe development defaults
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]


def validate_production_security(
    env: str = ENVIRONMENT,
    secret: str = None,
    origins: list = None,
    firebase_id: str = None,
    admin_emails: list = None
):
    """Enforce strict production validation rules. Raises RuntimeError on any security violation."""
    target_env = (env or "").strip().lower()
    if target_env != "production":
        return

    # 1. JWT Secret Validation
    sec = secret if secret is not None else os.getenv("JWT_SECRET", "")
    if not sec or not sec.strip():
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: In production environment, "
            "the JWT_SECRET environment variable must be explicitly defined and non-empty. "
            "Startup aborted immediately to protect user authentication."
        )
    sec_clean = sec.strip()
    if sec_clean.lower() in INSECURE_DEFAULT_SECRETS:
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: In production environment, "
            "JWT_SECRET cannot use an insecure development placeholder or default secret."
        )
    if len(sec_clean) < 32:
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: In production environment, "
            "JWT_SECRET must be at least 32 characters long for cryptographic security."
        )

    # 2. Firebase Project ID Validation
    fb_id = firebase_id if firebase_id is not None else os.getenv("FIREBASE_PROJECT_ID", FIREBASE_PROJECT_ID)
    if not fb_id or not fb_id.strip() or fb_id.strip().lower() in ("your_project_id", "placeholder"):
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: In production environment, "
            "FIREBASE_PROJECT_ID must be a valid non-placeholder project identifier."
        )

    # 3. CORS Origins Validation
    eff_origins = origins if origins is not None else ALLOWED_ORIGINS
    if not eff_origins:
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: In production environment, "
            "ALLOWED_ORIGINS must be explicitly configured with trusted origins."
        )
    if "*" in eff_origins:
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: Wildcard '*' in ALLOWED_ORIGINS "
            "is strictly forbidden in production when credentialed requests are enabled."
        )

    # 4. Production Admin Emails Validation
    eff_admin_emails = admin_emails if admin_emails is not None else (
        [e.strip().lower() for e in os.getenv("PRODUCTION_ADMIN_EMAILS", "").split(",") if e.strip()]
    )
    if not eff_admin_emails or "admin@cognitive.edu" in eff_admin_emails:
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: In production environment, "
            "PRODUCTION_ADMIN_EMAILS must be explicitly configured with genuine administrator email(s) "
            "and cannot use the default placeholder 'admin@cognitive.edu'."
        )


# JWT configuration loading
_raw_jwt_secret = os.getenv("JWT_SECRET")
if ENVIRONMENT == "production":
    validate_production_security(
        env="production",
        secret=_raw_jwt_secret,
        origins=ALLOWED_ORIGINS,
        firebase_id=FIREBASE_PROJECT_ID,
        admin_emails=PRODUCTION_ADMIN_EMAILS
    )
    JWT_SECRET = _raw_jwt_secret.strip()
else:
    # In non-production (development / testing), allow fallback default if unset
    JWT_SECRET = _raw_jwt_secret.strip() if (_raw_jwt_secret and _raw_jwt_secret.strip()) else "cognitive-adaptive-secret-key-2026"

JWT_ALGORITHM = "HS256"

# SQLite DB Path for persistence (supports environment override for test isolation)
_env_db_path = os.getenv("ADAPTIVE_LEARNING_DB_PATH")
DB_PATH = Path(_env_db_path).resolve() if _env_db_path else PROJECT_ROOT / "backend" / "adaptive_learning.db"
