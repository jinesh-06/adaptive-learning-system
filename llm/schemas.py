"""Schemas and data models for the LLM adaptive explanation module."""

from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field, field_validator


class CognitiveLoadLevel(str, Enum):
    """Allowed cognitive load levels for the learner."""

    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


def normalize_cognitive_load(value: Any) -> CognitiveLoadLevel:
    """Normalize and validate a cognitive load value.

    Transforms inputs like 'high', 'High', ' HIGH ' to CognitiveLoadLevel.HIGH.
    Rejects invalid values like 'VERY_HIGH'.

    Args:
        value: Input string or CognitiveLoadLevel enum.

    Returns:
        CognitiveLoadLevel: Validated enum instance.

    Raises:
        ValueError: If value is not a recognized cognitive load level.
    """
    if isinstance(value, CognitiveLoadLevel):
        return value
    if isinstance(value, str):
        normalized = value.strip().upper()
        try:
            return CognitiveLoadLevel(normalized)
        except ValueError:
            valid_values = [level.value for level in CognitiveLoadLevel]
            raise ValueError(
                f"Invalid cognitive load '{value}'. Must be one of: {', '.join(valid_values)}"
            )
    raise ValueError(
        f"Cognitive load must be a string or CognitiveLoadLevel, got {type(value).__name__}"
    )


class AdaptationMetadata(BaseModel):
    """Metadata describing the explanation style and adaptation properties."""

    detail_level: str
    style: str
    examples: int


class AdaptiveRequest(BaseModel):
    """Validated input structure for generating an adaptive explanation."""

    question: str = Field(..., description="Student question")
    retrieved_context: str = Field(
        default="", description="Text context retrieved by RAG"
    )
    cognitive_load: CognitiveLoadLevel = Field(
        ..., description="Predicted cognitive load level (LOW, MEDIUM, HIGH)"
    )
    topic: Optional[str] = Field(
        default=None, description="Optional topic or domain category"
    )

    @field_validator("question", mode="before")
    @classmethod
    def validate_question(cls, v: Any) -> str:
        """Validate question is non-empty after stripping whitespace."""
        if not isinstance(v, str) or not v.strip():
            raise ValueError("Question cannot be empty.")
        return v.strip()

    @field_validator("retrieved_context", mode="before")
    @classmethod
    def validate_retrieved_context(cls, v: Any) -> str:
        """Coerce and trim context."""
        if v is None:
            return ""
        return str(v).strip()

    @field_validator("cognitive_load", mode="before")
    @classmethod
    def validate_cognitive_load(cls, v: Any) -> CognitiveLoadLevel:
        """Normalize case and whitespace for cognitive_load."""
        return normalize_cognitive_load(v)


class AdaptiveResponse(BaseModel):
    """Structured response returned by the adaptive generator."""

    success: bool
    cognitive_load: Optional[str] = None
    question: Optional[str] = None
    explanation: Optional[str] = None
    adaptation: Optional[AdaptationMetadata] = None
    error: Optional[str] = None
