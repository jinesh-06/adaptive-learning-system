"""
Unit and Mocked Regression Test Suite for the RAG Module.
Tests document loading, chunking, embeddings, vector store upsertion,
retrieval, filtering, context formatting, and error handling using lightweight mocks
without requiring model downloads or ChromaDB disk rebuilds.
Runs in < 2 seconds.
"""

import sys
import os
import unittest
from unittest.mock import MagicMock, patch
from pathlib import Path
from typing import List, Dict, Any

# Ensure workspace root is in sys.path
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent
if str(WORKSPACE_ROOT) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_ROOT))

from rag.src.config import RAGConfig
from rag.src.document_loader import (
    Document,
    normalize_course_name,
    extract_metadata_from_text,
    derive_metadata_from_path,
    clean_text
)
from rag.src.text_chunker import (
    DocumentChunk,
    detect_level_from_section,
    parse_sections,
    chunk_single_text,
    chunk_documents
)
from rag.src.context_formatter import format_context, format_rag_prompt
from rag.src.retriever import (
    retrieve_documents,
    retrieve_with_status,
    retrieve_context,
    resolve_topic_slug
)


class TestRAGMockedSuite(unittest.TestCase):
    """Fast, lightweight unit tests using mocks and fixtures."""

    def setUp(self):
        self.config = RAGConfig()
        self.mock_docs = [
            Document(
                text="Introduction to C pointers.\nA pointer holds memory address.\nSECTION: Pointer Basics\nExample code:\nint *ptr;",
                source="c_pointers_memory.txt",
                course="c",
                topic="pointers_memory",
                level="beginner"
            ),
            Document(
                text="Python dictionary methods.\nDictionaries map keys to values.\nSECTION: Hash Maps\nExample: d = {'a': 1}",
                source="python_data_structures.txt",
                course="python",
                topic="data_structures",
                level="intermediate"
            )
        ]

    # --- 1. Course Normalization & Metadata Parsing ---
    def test_normalize_course_name(self):
        self.assertEqual(normalize_course_name("C++"), "cpp")
        self.assertEqual(normalize_course_name("cplusplus"), "cpp")
        self.assertEqual(normalize_course_name("CPP"), "cpp")
        self.assertEqual(normalize_course_name("Python 3"), "python")
        self.assertEqual(normalize_course_name("JAVA"), "java")
        self.assertEqual(normalize_course_name("C"), "c")
        self.assertEqual(normalize_course_name("c_programming"), "c")

    def test_extract_metadata_from_text(self):
        sample_header = "COURSE: java\nTOPIC: collections\nLEVEL: advanced\nSOURCE: java_collections.txt\n\nContent here..."
        meta = extract_metadata_from_text(sample_header)
        self.assertEqual(meta.get("course"), "java")
        self.assertEqual(meta.get("topic"), "collections")
        self.assertEqual(meta.get("level"), "advanced")
        self.assertEqual(meta.get("source"), "java_collections.txt")

    def test_derive_metadata_from_path(self):
        fake_path = Path("rag/documents/PYTHON/python_data_structures.txt")
        meta = derive_metadata_from_path(fake_path)
        self.assertEqual(meta.get("course"), "python")
        self.assertEqual(meta.get("topic"), "data_structures")
        self.assertEqual(meta.get("source"), "python_data_structures.txt")

    def test_clean_text(self):
        dirty = "Line 1\r\n\r\n\r\n\r\nLine 2   \t   \n"
        cleaned = clean_text(dirty)
        self.assertNotIn("\r", cleaned)
        self.assertNotIn("\n\n\n", cleaned)

    # --- 2. Chunking and Section Tagging ---
    def test_detect_level_from_section(self):
        self.assertEqual(detect_level_from_section("1. Introduction and Basics", "advanced"), "beginner")
        self.assertEqual(detect_level_from_section("Debugging Common Errors", "beginner"), "intermediate")
        self.assertEqual(detect_level_from_section("Memory Optimization and Performance", "beginner"), "advanced")
        self.assertEqual(detect_level_from_section("General Overview", "intermediate"), "intermediate")

    def test_chunk_single_document(self):
        chunks = chunk_documents([self.mock_docs[0]], self.config)
        self.assertGreater(len(chunks), 0)
        chunk = chunks[0]
        self.assertIsInstance(chunk, DocumentChunk)
        self.assertEqual(chunk.course, "c")
        self.assertEqual(chunk.topic, "pointers_memory")
        self.assertTrue(chunk.chunk_id.startswith("c_"))
        self.assertIn("pointers_memory", chunk.chunk_id)
        self.assertGreater(chunk.char_length, 0)

    # --- 3. Context Formatter ---
    def test_format_context_empty(self):
        formatted = format_context([])
        self.assertEqual(formatted, "No relevant context found in knowledge base.")

    def test_format_context_with_documents(self):
        sample_docs = [
            {
                "chunk_id": "c_ptr_0",
                "text": "int *p = &x; dereferencing yields value.",
                "source": "c_pointers.txt",
                "course": "c",
                "topic": "pointers",
                "level": "beginner",
                "section": "Pointer Basics"
            }
        ]
        formatted = format_context(sample_docs)
        self.assertIn("COURSE: C", formatted)
        self.assertIn("TOPIC: POINTERS", formatted)
        self.assertIn("LEVEL: BEGINNER", formatted)
        self.assertIn("SOURCE: c_pointers.txt", formatted)
        self.assertIn("SECTION: Pointer Basics", formatted)
        self.assertIn("int *p = &x;", formatted)

    def test_format_rag_prompt(self):
        sample_docs = [{"text": "Sample context", "source": "s.txt", "course": "c", "topic": "t", "level": "b", "section": "sec"}]
        prompt = format_rag_prompt(
            query="How do pointers work?",
            retrieved_documents=sample_docs,
            cognitive_load="HIGH"
        )
        self.assertIn("STUDENT COGNITIVE LOAD: HIGH", prompt)
        self.assertIn("How do pointers work?", prompt)
        self.assertIn("Sample context", prompt)

    # --- 4. Topic Slug Normalization ---
    def test_resolve_topic_slug(self):
        self.assertEqual(resolve_topic_slug("top-c-fundamentals", "c"), "fundamentals")
        self.assertEqual(resolve_topic_slug("top-py-oop", "python"), "oop")
        self.assertEqual(resolve_topic_slug("top-cpp-stl", "cpp"), "stl")
        self.assertEqual(resolve_topic_slug("top-java-collections", "java"), "collections")

    # --- 5. Mocked Retrieval and Filtering ---
    @patch("rag.src.retriever.embed_query")
    def test_retrieve_with_status_empty_query(self, mock_embed):
        res = retrieve_with_status(query="", top_k=5)
        self.assertTrue(res["success"])
        self.assertEqual(res["status"], "EMPTY_RESULT")
        self.assertEqual(res["documents"], [])
        mock_embed.assert_not_called()

    @patch("rag.src.retriever.embed_query")
    def test_retrieve_with_status_embedding_failure(self, mock_embed):
        mock_embed.side_effect = RuntimeError("Embedding model offline")
        res = retrieve_with_status(query="Explain pointers", top_k=3)
        self.assertFalse(res["success"])
        self.assertEqual(res["status"], "EMBEDDING_UNAVAILABLE")
        self.assertEqual(res["documents"], [])
        self.assertIn("Embedding model offline", res["error"])

    @patch("rag.src.retriever.get_vector_store")
    @patch("rag.src.retriever.embed_query")
    def test_retrieve_context_helper_success(self, mock_embed, mock_vstore):
        mock_embed.return_value = [0.1] * 384
        fake_store = MagicMock()
        fake_store.query.return_value = {
            "ids": [["c_ptr_0"]],
            "documents": [["Pointers store memory addresses."]],
            "metadatas": [[{
                "chunk_id": "c_ptr_0",
                "course": "c",
                "topic": "pointers_memory",
                "level": "beginner",
                "source": "c_pointers_memory.txt",
                "section": "Basics"
            }]],
            "distances": [[0.15]]
        }
        mock_vstore.return_value = fake_store

        result = retrieve_context(
            query="Explain pointers in C",
            language="C",
            difficulty="beginner",
            top_k=2
        )

        self.assertIsInstance(result, dict)
        self.assertTrue(result["success"])
        self.assertEqual(result["language"], "c")
        self.assertEqual(result["difficulty"], "beginner")
        self.assertEqual(result["total"], 1)
        self.assertIn("c_pointers_memory.txt", result["sources"])
        self.assertIn("pointers_memory", result["topics"])
        self.assertIn("COURSE: C", result["retrieved_context"])
        self.assertIn("Pointers store memory addresses.", result["retrieved_context"])

    # --- 6. End-to-End Retrieval for All 4 Languages ---
    @patch("rag.src.retriever.get_vector_store")
    @patch("rag.src.retriever.embed_query")
    def test_all_four_languages_retrieval(self, mock_embed, mock_vstore):
        mock_embed.return_value = [0.05] * 384
        languages = ["c", "cpp", "java", "python"]

        for lang in languages:
            fake_store = MagicMock()
            fake_store.query.return_value = {
                "ids": [[f"{lang}_0"]],
                "documents": [[f"Educational content for {lang}"]],
                "metadatas": [[{
                    "chunk_id": f"{lang}_0",
                    "course": lang,
                    "topic": "fundamentals",
                    "level": "beginner",
                    "source": f"{lang}_fundamentals.txt",
                    "section": "Overview"
                }]],
                "distances": [[0.10]]
            }
            mock_vstore.return_value = fake_store

            res = retrieve_context(
                query=f"Basics of {lang}",
                language=lang,
                difficulty="beginner",
                top_k=1
            )
            self.assertTrue(res["success"])
            self.assertEqual(res["language"], lang)
            self.assertEqual(len(res["documents"]), 1)
            self.assertEqual(res["documents"][0]["course"], lang)


if __name__ == "__main__":
    unittest.main()
