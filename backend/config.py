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
PRODUCTION_ADMIN_EMAILS = [
    e.strip().lower() for e in os.getenv("PRODUCTION_ADMIN_EMAILS", "admin@cognitive.edu").split(",") if e.strip()
]
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "adaptive-learning-system")

# JWT configuration: production strictly requires non-empty JWT_SECRET in environment
_raw_jwt_secret = os.getenv("JWT_SECRET")
if ENVIRONMENT == "production":
    if not _raw_jwt_secret or not _raw_jwt_secret.strip():
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: In production environment, "
            "the JWT_SECRET environment variable must be explicitly defined and non-empty. "
            "Startup aborted immediately to protect user authentication."
        )
    JWT_SECRET = _raw_jwt_secret.strip()
else:
    # In non-production (development / testing), allow fallback default if unset
    JWT_SECRET = _raw_jwt_secret.strip() if (_raw_jwt_secret and _raw_jwt_secret.strip()) else "cognitive-adaptive-secret-key-2026"

JWT_ALGORITHM = "HS256"

# SQLite DB Path for persistence (supports environment override for test isolation)
_env_db_path = os.getenv("ADAPTIVE_LEARNING_DB_PATH")
DB_PATH = Path(_env_db_path).resolve() if _env_db_path else PROJECT_ROOT / "backend" / "adaptive_learning.db"
