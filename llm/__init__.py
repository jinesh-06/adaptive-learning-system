"""Adaptive Learning Engine - LLM / Gemini Adaptive Explanation Module."""

from .adaptive_generator import generate_adaptive_explanation
from .config import get_gemini_client, get_model_name
from .prompt_builder import build_adaptive_prompt
from .schemas import (
    AdaptationMetadata,
    AdaptiveRequest,
    AdaptiveResponse,
    CognitiveLoadLevel,
    normalize_cognitive_load,
)

__all__ = [
    "generate_adaptive_explanation",
    "build_adaptive_prompt",
    "CognitiveLoadLevel",
    "normalize_cognitive_load",
    "AdaptiveRequest",
    "AdaptiveResponse",
    "AdaptationMetadata",
    "get_gemini_client",
    "get_model_name",
]
