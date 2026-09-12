"""Configuration and client factory for the Gemini LLM adaptive explanation module."""

import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from google import genai

# Automatically search and load .env file from project root
_PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_PROJECT_ROOT / ".env", override=False)
load_dotenv()  # Fallback to current working directory .env

DEFAULT_MODEL = "gemini-2.5-flash"


def get_model_name() -> str:
    """Retrieve the configured Gemini model name from environment or fallback default.

    Returns:
        str: Active model name (e.g., 'gemini-2.5-flash').
    """
    model = os.environ.get("GEMINI_MODEL", DEFAULT_MODEL).strip()
    return model if model else DEFAULT_MODEL


def get_gemini_api_key() -> str:
    """Retrieve and validate that GEMINI_API_KEY exists in the environment.

    Returns:
        str: The API key.

    Raises:
        ValueError: If GEMINI_API_KEY is not set or is empty.
    """
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY environment variable is not set. "
            "Please set GEMINI_API_KEY in your environment or in a .env file."
        )
    return api_key


def get_gemini_client(api_key: Optional[str] = None) -> genai.Client:
    """Initialize and return a Google Gemini client.

    Args:
        api_key: Optional explicit API key. If not provided,
                 fetches from environment via get_gemini_api_key().

    Returns:
        genai.Client: Configured official Gemini client.
    """
    key = api_key or get_gemini_api_key()
    return genai.Client(api_key=key)
