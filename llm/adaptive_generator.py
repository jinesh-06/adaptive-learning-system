"""Main adaptive explanation generator integrating schema validation, prompt building, and Gemini API."""

import logging
from typing import Any, Dict, Optional, Union
from google import genai
from google.genai import errors as genai_errors
from pydantic import ValidationError

from .config import get_gemini_client, get_model_name
from .prompt_builder import build_adaptive_prompt
from .schemas import (
    AdaptationMetadata,
    AdaptiveRequest,
    AdaptiveResponse,
    CognitiveLoadLevel,
)

logger = logging.getLogger(__name__)

INSUFFICIENT_CONTEXT_MESSAGE = (
    "The available learning material is insufficient and does not contain enough information to address this question."
)


def _get_adaptation_metadata(level: CognitiveLoadLevel) -> AdaptationMetadata:
    """Map cognitive load level to descriptive adaptation metadata."""
    if level == CognitiveLoadLevel.LOW:
        return AdaptationMetadata(
            detail_level="high",
            style="deep-conceptual",
            examples=2,
        )
    elif level == CognitiveLoadLevel.MEDIUM:
        return AdaptationMetadata(
            detail_level="medium",
            style="balanced-standard",
            examples=1,
        )
    else:  # HIGH
        return AdaptationMetadata(
            detail_level="low",
            style="step-by-step",
            examples=1,
        )


def generate_adaptive_explanation(
    question: str,
    retrieved_context: str,
    cognitive_load: Union[str, CognitiveLoadLevel],
    topic: Optional[str] = None,
    client: Optional[genai.Client] = None,
) -> Dict[str, Any]:
    """Generate an explanation adapted to the learner's cognitive load level using Gemini.

    Args:
        question: The student's inquiry.
        retrieved_context: Knowledge context retrieved from the RAG module.
        cognitive_load: Cognitive load level ('LOW', 'MEDIUM', 'HIGH', case-insensitive).
        topic: Optional domain or topic classification.
        client: Optional pre-configured Google GenAI client (for testing/customization).

    Returns:
        Dict[str, Any]: Structured output conforming to AdaptiveResponse:
            {
                "success": bool,
                "cognitive_load": str,
                "question": str,
                "explanation": str,
                "adaptation": {
                    "detail_level": str,
                    "style": str,
                    "examples": int
                }
            }
            or on failure:
            {
                "success": false,
                "error": str
            }
    """
    # 1. Validate inputs and normalize cognitive load
    try:
        req = AdaptiveRequest(
            question=question,
            retrieved_context=retrieved_context,
            cognitive_load=cognitive_load,  # type: ignore[arg-type]
            topic=topic,
        )
    except (ValidationError, ValueError) as val_err:
        error_msg = str(val_err)
        # Extract clean message from Pydantic errors if present
        if isinstance(val_err, ValidationError):
            error_msg = val_err.errors()[0]["msg"]
        logger.warning("Input validation failed: %s", error_msg)
        return AdaptiveResponse(
            success=False,
            error=f"Validation error: {error_msg}",
        ).model_dump(exclude_none=True)

    adaptation_meta = _get_adaptation_metadata(req.cognitive_load)

    # 2. Handle empty or insufficient RAG context without hallucinating
    if not req.retrieved_context.strip():
        logger.info("Empty RAG context provided for question: '%s'", req.question)
        return AdaptiveResponse(
            success=True,
            cognitive_load=req.cognitive_load.value,
            question=req.question,
            explanation=INSUFFICIENT_CONTEXT_MESSAGE,
            adaptation=adaptation_meta,
        ).model_dump(exclude_none=True)

    # 3. Build adaptive prompt
    prompt = build_adaptive_prompt(
        question=req.question,
        retrieved_context=req.retrieved_context,
        cognitive_load=req.cognitive_load,
        topic=req.topic,
    )

    # 4. Resolve Gemini Client
    try:
        genai_client = client if client is not None else get_gemini_client()
    except Exception as config_err:
        logger.error("Configuration error initializing Gemini client: %s", config_err)
        return AdaptiveResponse(
            success=False,
            error=str(config_err),
        ).model_dump(exclude_none=True)

    # 5. Call Gemini API
    model_name = get_model_name()
    try:
        response = genai_client.models.generate_content(
            model=model_name,
            contents=prompt,
        )
        explanation_text = response.text.strip() if response.text else ""

        if not explanation_text:
            return AdaptiveResponse(
                success=False,
                error="The model generated an empty response.",
            ).model_dump(exclude_none=True)

        return AdaptiveResponse(
            success=True,
            cognitive_load=req.cognitive_load.value,
            question=req.question,
            explanation=explanation_text,
            adaptation=adaptation_meta,
        ).model_dump(exclude_none=True)

    except genai_errors.APIError as api_err:
        logger.error("Gemini API Error: %s", api_err.message if hasattr(api_err, "message") else str(api_err))
        return AdaptiveResponse(
            success=False,
            error=f"Gemini API error: {api_err.message if hasattr(api_err, 'message') else 'Request failed'}",
        ).model_dump(exclude_none=True)
    except Exception as err:
        logger.error("Unexpected error during adaptive explanation generation: %s", type(err).__name__)
        return AdaptiveResponse(
            success=False,
            error="Unable to generate explanation due to an unexpected error.",
        ).model_dump(exclude_none=True)
