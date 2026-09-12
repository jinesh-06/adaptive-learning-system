"""Test suite and standalone demonstration for the LLM adaptive explanation module."""

import os
import unittest
from unittest.mock import MagicMock

from llm.adaptive_generator import (
    INSUFFICIENT_CONTEXT_MESSAGE,
    generate_adaptive_explanation,
)
from llm.config import get_model_name
from llm.prompt_builder import build_adaptive_prompt
from llm.schemas import CognitiveLoadLevel, normalize_cognitive_load


class MockGenerateContentResponse:
    """Mock response object matching google-genai response structure."""

    def __init__(self, text: str):
        self.text = text


class TestAdaptiveGenerator(unittest.TestCase):
    """Unit tests for the adaptive explanation engine."""

    def setUp(self):
        self.sample_question = "What is machine learning?"
        self.sample_context = (
            "Machine learning is a branch of artificial intelligence that enables "
            "systems to learn patterns from data and make predictions."
        )

    def _create_mock_client(self, return_text: str) -> MagicMock:
        """Helper to create a mocked genai.Client."""
        mock_client = MagicMock()
        mock_client.models.generate_content.return_value = MockGenerateContentResponse(
            text=return_text
        )
        return mock_client

    # Test 1 — LOW Cognitive Load
    def test_1_low_cognitive_load(self):
        """Verify LOW cognitive load generates a detailed explanation with high detail metadata."""
        detailed_response = (
            "### Core Concept: Machine Learning\n"
            "Machine learning (ML) is a foundational discipline of artificial intelligence...\n\n"
            "#### Theoretical Foundation & Why It Works\n"
            "Rather than relying on static algorithmic rules, ML models optimize objective loss functions...\n\n"
            "#### Real-World Examples\n"
            "1. Medical Imaging: Convolutional neural networks detecting anomalies in X-rays.\n"
            "2. Recommendation Systems: Matrix factorization in streaming platforms.\n\n"
            "#### Challenge Question\n"
            "How does overfitting impact model generalization across non-stationary distributions?"
        )
        mock_client = self._create_mock_client(detailed_response)

        result = generate_adaptive_explanation(
            question=self.sample_question,
            retrieved_context=self.sample_context,
            cognitive_load="LOW",
            client=mock_client,
        )

        self.assertTrue(result["success"])
        self.assertEqual(result["cognitive_load"], "LOW")
        self.assertEqual(result["question"], self.sample_question)
        self.assertIn("Machine Learning", result["explanation"])
        self.assertEqual(result["adaptation"]["detail_level"], "high")
        self.assertEqual(result["adaptation"]["style"], "deep-conceptual")
        self.assertEqual(result["adaptation"]["examples"], 2)

        # Verify prompt instructions
        called_args, called_kwargs = mock_client.models.generate_content.call_args
        prompt_used = called_kwargs.get("contents") or called_args[0]
        self.assertIn("[ADAPTATION PROFILE: LOW COGNITIVE LOAD]", prompt_used)
        self.assertIn("Why it works", prompt_used)

    # Test 2 — MEDIUM Cognitive Load
    def test_2_medium_cognitive_load(self):
        """Verify MEDIUM cognitive load generates balanced, standard support."""
        medium_response = (
            "Machine learning is a type of artificial intelligence where computers "
            "learn from data instead of being explicitly programmed.\n\n"
            "**Key Points:**\n"
            "- It detects patterns in existing information.\n"
            "- It uses those patterns to make future predictions.\n\n"
            "**Example:** An email filter that learns to identify spam messages based on past emails.\n\n"
            "**Summary:** ML teaches machines to predict outcomes by studying historical data."
        )
        mock_client = self._create_mock_client(medium_response)

        result = generate_adaptive_explanation(
            question=self.sample_question,
            retrieved_context=self.sample_context,
            cognitive_load="MEDIUM",
            client=mock_client,
        )

        self.assertTrue(result["success"])
        self.assertEqual(result["cognitive_load"], "MEDIUM")
        self.assertEqual(result["adaptation"]["detail_level"], "medium")
        self.assertEqual(result["adaptation"]["style"], "balanced-standard")
        self.assertEqual(result["adaptation"]["examples"], 1)

    # Test 3 — HIGH Cognitive Load
    def test_3_high_cognitive_load(self):
        """Verify HIGH cognitive load generates short, simple, step-by-step guidance."""
        high_response = (
            "Machine learning means computers learning from examples.\n\n"
            "1. You show the computer many pictures of cats.\n"
            "2. The computer spots what cats have in common.\n"
            "3. Now the computer can recognize a new cat picture.\n\n"
            "Simple Example: Like teaching a child what a fruit looks like by showing them apples and oranges.\n\n"
            "Recap:\n"
            "- Computers look at examples.\n"
            "- They find patterns.\n"
            "- They make guesses on new data."
        )
        mock_client = self._create_mock_client(high_response)

        # Test normalization with mixed case & spaces
        result = generate_adaptive_explanation(
            question=self.sample_question,
            retrieved_context=self.sample_context,
            cognitive_load="  high  ",
            client=mock_client,
        )

        self.assertTrue(result["success"])
        self.assertEqual(result["cognitive_load"], "HIGH")
        self.assertEqual(result["adaptation"]["detail_level"], "low")
        self.assertEqual(result["adaptation"]["style"], "step-by-step")
        self.assertEqual(result["adaptation"]["examples"], 1)

    # Test 4 — Invalid Cognitive Load
    def test_4_invalid_cognitive_load(self):
        """Verify invalid cognitive load values (e.g., 'VERY_HIGH') are rejected gracefully."""
        result = generate_adaptive_explanation(
            question=self.sample_question,
            retrieved_context=self.sample_context,
            cognitive_load="VERY_HIGH",
        )

        self.assertFalse(result["success"])
        self.assertIn("error", result)
        self.assertIn("Invalid cognitive load", result["error"])

    # Test 5 — Empty Question
    def test_5_empty_question(self):
        """Verify that an empty question is rejected gracefully."""
        result = generate_adaptive_explanation(
            question="   ",
            retrieved_context=self.sample_context,
            cognitive_load="HIGH",
        )

        self.assertFalse(result["success"])
        self.assertIn("error", result)
        self.assertIn("Question cannot be empty", result["error"])

    # Test 6 — Empty RAG Context
    def test_6_empty_rag_context(self):
        """Verify that empty RAG context does not hallucinate and informs student of insufficient material."""
        result = generate_adaptive_explanation(
            question=self.sample_question,
            retrieved_context="   ",
            cognitive_load="HIGH",
        )

        self.assertTrue(result["success"])
        self.assertEqual(result["cognitive_load"], "HIGH")
        self.assertEqual(result["explanation"], INSUFFICIENT_CONTEXT_MESSAGE)
        self.assertIn("insufficient", result["explanation"].lower())


def run_standalone_demo():
    """Run the required standalone demo scenario for Member 3."""
    print("=" * 70)
    print("MEMBER 3 — ADAPTIVE LEARNING ENGINE: STANDALONE DEMO")
    print("=" * 70)

    demo_question = "What is photosynthesis?"
    demo_context = (
        "Photosynthesis is the process by which green plants use sunlight, "
        "water and carbon dioxide to produce glucose and oxygen."
    )
    demo_load = "HIGH"
    demo_topic = "Biology"

    print(f"\n[INPUT]")
    print(f"Question       : {demo_question}")
    print(f"RAG Context    : {demo_context}")
    print(f"Cognitive Load : {demo_load}")
    print(f"Topic          : {demo_topic}")
    print("\n" + "-" * 70)

    # If an actual API key is present in environment, test live with Gemini
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if api_key:
        print("[MODE] Active GEMINI_API_KEY detected. Performing LIVE Gemini generation...")
        response = generate_adaptive_explanation(
            question=demo_question,
            retrieved_context=demo_context,
            cognitive_load=demo_load,
            topic=demo_topic,
        )
    else:
        print("[MODE] No GEMINI_API_KEY found in environment. Running with verified mock client...")
        mock_client = MagicMock()
        mock_client.models.generate_content.return_value = MockGenerateContentResponse(
            text=(
                "Photosynthesis is how green plants make their food using sunlight.\n\n"
                "1. Plant leaves absorb sunlight and carbon dioxide from the air.\n"
                "2. Plant roots draw water up from the soil.\n"
                "3. The plant combines sunlight, water, and gas to make sugar (glucose) and oxygen.\n\n"
                "Simple Example: Think of a plant leaf as a solar-powered solar kitchen baking sugar!\n\n"
                "Quick Recap:\n"
                "- Uses sunlight, water, and carbon dioxide.\n"
                "- Makes food (glucose) for the plant.\n"
                "- Releases fresh oxygen into the air."
            )
        )
        response = generate_adaptive_explanation(
            question=demo_question,
            retrieved_context=demo_context,
            cognitive_load=demo_load,
            topic=demo_topic,
            client=mock_client,
        )

    print("\n[OUTPUT STRUCTURE]")
    import json
    print(json.dumps(response, indent=2))
    print("=" * 70)


if __name__ == "__main__":
    import sys

    # Run unit test suite
    print("Running automated test suite (Tests 1 through 6)...")
    suite = unittest.TestLoader().loadTestsFromTestCase(TestAdaptiveGenerator)
    test_runner = unittest.TextTestRunner(verbosity=2)
    test_result = test_runner.run(suite)

    if not test_result.wasSuccessful():
        sys.exit(1)

    # Run standalone demo
    print("\nRunning Member 3 Standalone Demonstration...")
    run_standalone_demo()
