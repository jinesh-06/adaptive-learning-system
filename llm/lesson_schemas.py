"""Pydantic schemas and models for AI-Generated Personalized Adapted Lessons."""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class AdaptationInfo(BaseModel):
    """Metadata describing the pedagogical strategy and cognitive load signals used."""
    strategy: str = Field(..., description="Selected teaching strategy (e.g., guided_step_by_step, deep_conceptual_dive, balanced_standard)")
    detail_level: str = Field(..., description="Explanation detail level: standard, detailed, or simplified")
    cognitive_load: str = Field(default="MEDIUM", description="Predicted or inferred cognitive load: LOW, MEDIUM, or HIGH")
    confidence: float = Field(default=0.85, description="Model confidence score (0.0 to 1.0)")
    reason: str = Field(..., description="Clear explanation of why this adaptation was selected")
    signals_used: List[str] = Field(default_factory=list, description="Observed signals that informed the adaptation")


class SectionStep(BaseModel):
    step: int
    title: str
    description: str


class CommonMistakeItem(BaseModel):
    mistake: str
    why_wrong: str
    fix: str


class QuizQuestionItem(BaseModel):
    id: str = Field(default="q1")
    question: str
    options: List[str]
    correct_index: int = Field(default=0)
    explanation: str = Field(default="")


class PracticeChallengeItem(BaseModel):
    prompt: str
    starter_code: str = Field(default="")
    expected_output: Optional[str] = None
    hint: Optional[str] = None
    solution: Optional[str] = None


class LessonSection(BaseModel):
    """A modular section within an adapted lesson rendered by dynamic UI components."""
    id: str
    type: str = Field(..., description="Section type: explanation, analogy, step_by_step, visual_diagram, code_example, common_mistakes, guided_practice, quiz, summary")
    title: str
    content: Optional[str] = Field(default="", description="Markdown explanation content")
    importance: Optional[str] = Field(default="primary", description="primary, secondary, or advanced")
    
    # Specific attributes depending on section type:
    language: Optional[str] = Field(default=None, description="Programming language for code snippets")
    code: Optional[str] = Field(default=None, description="Executable or illustrative code block")
    code_explanation: Optional[str] = Field(default=None, description="Explanation for code block")
    line_by_line: Optional[List[Dict[str, str]]] = Field(default=None, description="Line-by-line code explanation")
    
    steps: Optional[List[Dict[str, Any]]] = Field(default=None, description="Steps for step_by_step section")
    
    diagram_type: Optional[str] = Field(default="flowchart", description="flowchart, ascii, conceptual, or table")
    diagram_content: Optional[str] = Field(default=None, description="ASCII or text-based diagram string")
    diagram_caption: Optional[str] = Field(default=None, description="Caption describing the visual representation")
    
    mistakes: Optional[List[Dict[str, Any]]] = Field(default=None, description="List of common pitfalls with causes and fixes")
    
    practice: Optional[Dict[str, Any]] = Field(default=None, description="Interactive practice challenge payload")
    
    questions: Optional[List[Dict[str, Any]]] = Field(default=None, description="Quiz questions for knowledge check")


class AdaptedLesson(BaseModel):
    """Complete structured adapted lesson schema."""
    title: str
    subject: str
    topic: str
    topic_id: str
    adaptation: AdaptationInfo
    learning_objectives: List[str] = Field(default_factory=list)
    introduction: str = Field(default="")
    sections: List[LessonSection] = Field(default_factory=list)
    key_takeaways: List[str] = Field(default_factory=list)
    next_step: Optional[str] = Field(default="Proceed to interactive practice or next curriculum milestone")


class AdaptedLessonRequest(BaseModel):
    """Request payload to generate or retrieve an adapted lesson."""
    topic_id: str
    detail_level: Optional[str] = Field(default="STANDARD", description="STANDARD, DETAILED, or SIMPLIFIED")
    force_refresh: Optional[bool] = Field(default=False, description="Whether to bypass cache and regenerate")
    signals: Optional[Dict[str, Any]] = Field(default=None, description="Client telemetry signals (accuracy, time, backtracking, etc.)")
    learner_feedback: Optional[str] = Field(default=None, description="Optional feedback on previous explanation")


class AdaptationFeedbackRequest(BaseModel):
    """Feedback submitted by learner for an adapted lesson."""
    topic_id: str
    detail_level: str
    helpful: bool
    rating: Optional[str] = Field(default="just_right", description="too_simple, just_right, or too_complex")
    comment: Optional[str] = None
    completed_practice: Optional[bool] = False
