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

# SQLite DB Path for persistence
DB_PATH = PROJECT_ROOT / "backend" / "adaptive_learning.db"
