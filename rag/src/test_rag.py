"""
Comprehensive Test and Evaluation Suite for the RAG Module.
Tests:
1. All 4 supported programming courses (C, CPP, PYTHON, JAVA)
2. Ambiguous query disambiguation across courses
3. Multi-attribute metadata filtering (course, topic, level)
4. Adaptive learner_level ranking
5. Hit@1, Hit@3, Hit@5 retrieval accuracy metrics across educational queries
6. Repeated ingestion idempotency
7. Edge cases (empty queries, invalid filters, out-of-range thresholds)
8. Context formatter output validation
"""

import sys
import os
import unittest
from typing import List, Dict, Any

# Ensure workspace root is in sys.path
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from rag.src.config import RAGConfig
from rag.src.document_loader import load_documents, normalize_course_name
from rag.src.text_chunker import chunk_documents
from rag.src.embeddings import get_embedding_model, embed_query, embed_documents
from rag.src.vector_store import get_vector_store
from rag.src.retriever import retrieve_documents
from rag.src.context_formatter import format_context, format_rag_prompt
from rag.src.ingest import run_ingestion


class TestRAGComprehensiveSuite(unittest.TestCase):
    """Full automated evaluation and regression suite for the RAG module."""

    @classmethod
    def setUpClass(cls):
        """Ensure knowledge base is fully indexed in ChromaDB before testing."""
        print("\n" + "=" * 70)
        print("SETTING UP RAG TEST SUITE: RUNNING INGESTION...")
        print("=" * 70)
        cls.config = RAGConfig()
        cls.ingest_stats = run_ingestion(config=cls.config, reset_collection=False)
        cls.vstore = get_vector_store(config=cls.config)
        print("SETUP COMPLETED.\n")

    def test_01_document_count_and_course_distribution(self):
        """Verify exactly 32 documents exist, exactly 8 per course."""
        docs = load_documents(config=self.config)
        self.assertEqual(len(docs), 32, f"Expected 32 documents, found {len(docs)}")

        counts = {"c": 0, "cpp": 0, "python": 0, "java": 0}
        for d in docs:
            self.assertIn(d.course, counts, f"Unknown course: {d.course}")
            counts[d.course] += 1

        for c, count in counts.items():
            self.assertEqual(count, 8, f"Course {c} expected 8 documents, got {count}")

    def test_02_chunking_metadata_and_section_preservation(self):
        """Verify chunks retain course, topic, level, source, and section."""
        docs = load_documents(config=self.config)
        chunks = chunk_documents(docs, config=self.config)
        self.assertGreater(len(chunks), 100, "Expected at least 100 total chunks across 32 documents")

        for ch in chunks:
            self.assertTrue(ch.chunk_id)
            self.assertIn(ch.course, ("c", "cpp", "python", "java"))
            self.assertTrue(ch.topic)
            self.assertIn(ch.level, ("beginner", "intermediate", "advanced"))
            self.assertTrue(ch.source)
            self.assertTrue(hasattr(ch, "section"))
            self.assertGreaterEqual(ch.char_length, self.config.min_chunk_length)

    def test_03_course_filtering_all_four_languages(self):
        """Test retrieving with specific course filters returns only that course's content."""
        test_cases = [
            ("Explain memory allocation with malloc and pointers", "c"),
            ("How do smart pointers and unique_ptr work?", "cpp"),
            ("Explain list comprehensions and dictionaries", "python"),
            ("How does HashMap and garbage collection work in JVM?", "java")
        ]
        for query, expected_course in test_cases:
            results = retrieve_documents(query=query, top_k=4, course=expected_course, config=self.config)
            self.assertGreater(len(results), 0, f"No results for {query} with course={expected_course}")
            for r in results:
                self.assertEqual(
                    r["course"], expected_course,
                    f"Course filter violation: expected {expected_course}, got {r['course']} for chunk {r['chunk_id']}"
                )

    def test_04_ambiguous_query_disambiguation(self):
        """
        Verify that ambiguous terminology is strictly directed to the target course when specified.
        """
        ambiguous_cases = [
            ("What is a vector?", "cpp", "cpp"),
            ("What is a list?", "python", "python"),
            ("What is inheritance?", "java", "java"),
            ("What is a pointer?", "c", "c"),
        ]
        for query, filter_course, expected_course in ambiguous_cases:
            results = retrieve_documents(query=query, top_k=3, course=filter_course, config=self.config)
            self.assertGreater(len(results), 0, f"Query '{query}' returned no results for course '{filter_course}'")
            for r in results:
                self.assertEqual(
                    r["course"], expected_course,
                    f"Ambiguous query '{query}' returned course '{r['course']}' instead of '{expected_course}'"
                )

    def test_05_topic_filtering(self):
        """Verify topic filtering restricts results to the specified topic."""
        results = retrieve_documents(
            query="Explain memory leaks and malloc",
            top_k=3,
            course="c",
            topic="pointers_memory",
            config=self.config
        )
        self.assertGreater(len(results), 0)
        for r in results:
            self.assertEqual(r["course"], "c")
            self.assertEqual(r["topic"], "pointers_memory")

    def test_06_adaptive_learner_level_ranking(self):
        """Verify learner_level prioritizes matching difficulty levels."""
        # Query beginner level
        beg_results = retrieve_documents(
            query="What is a pointer?",
            top_k=3,
            course="c",
            learner_level="beginner",
            config=self.config
        )
        self.assertGreater(len(beg_results), 0)
        # Top result should ideally be beginner
        self.assertEqual(beg_results[0]["level"], "beginner")

        # Query advanced level
        adv_results = retrieve_documents(
            query="Pointer arithmetic and memory layout optimization",
            top_k=3,
            course="c",
            learner_level="advanced",
            config=self.config
        )
        self.assertGreater(len(adv_results), 0)
        self.assertIn(adv_results[0]["level"], ("intermediate", "advanced"))

    def test_07_hit_metrics_evaluation(self):
        """
        Measure Hit@1, Hit@3, and Hit@5 accuracy across an extensive evaluation test set.
        """
        eval_dataset = [
            # C questions
            {"query": "How does printf and format specifiers work in C?", "course": "c", "expected_topic": "fundamentals"},
            {"query": "Explain switch case and fall-through in C", "course": "c", "expected_topic": "control_flow"},
            {"query": "What are function pointers and callbacks in C?", "course": "c", "expected_topic": "functions"},
            {"query": "How to use strcmp and strlen safely in C?", "course": "c", "expected_topic": "arrays_strings"},
            {"query": "What is malloc, free, and memory leak in C?", "course": "c", "expected_topic": "pointers_memory"},
            {"query": "How to define struct, typedef and union in C?", "course": "c", "expected_topic": "structures_unions"},
            {"query": "How does fopen and fclose work in C file handling?", "course": "c", "expected_topic": "file_handling"},
            {"query": "What are macros, preprocessor and include guards in C?", "course": "c", "expected_topic": "advanced_topics"},
            
            # C++ questions
            {"query": "What is std::vector and how does push_back work?", "course": "cpp", "expected_topic": "stl"},
            {"query": "Explain virtual functions, vtable, and polymorphism in C++", "course": "cpp", "expected_topic": "inheritance_polymorphism"},
            {"query": "What is RAII and std::unique_ptr in C++?", "course": "cpp", "expected_topic": "memory_management"},
            {"query": "Explain move semantics, rvalue references, and std::move", "course": "cpp", "expected_topic": "advanced_topics"},
            
            # Python questions
            {"query": "How do list comprehensions and dictionaries work in Python?", "course": "python", "expected_topic": "data_structures"},
            {"query": "Explain decorators and *args **kwargs in Python", "course": "python", "expected_topic": "functions"},
            {"query": "How does try except finally and custom exceptions work in Python?", "course": "python", "expected_topic": "exceptions_modules"},
            {"query": "How does open() with context manager work for JSON and CSV?", "course": "python", "expected_topic": "file_handling"},
            
            # Java questions
            {"query": "What is JVM bytecode and memory areas in Java?", "course": "java", "expected_topic": "fundamentals"},
            {"query": "Explain ArrayList, HashMap, and HashSet in Java", "course": "java", "expected_topic": "collections"},
            {"query": "How does try-with-resources and Exception hierarchy work in Java?", "course": "java", "expected_topic": "exceptions_file_handling"},
            {"query": "Explain Stream API, map, filter, and lambdas in Java", "course": "java", "expected_topic": "advanced_topics"},
        ]

        hit_1 = 0
        hit_3 = 0
        hit_5 = 0
        total = len(eval_dataset)

        for item in eval_dataset:
            query = item["query"]
            course = item["course"]
            exp_topic = item["expected_topic"]

            results = retrieve_documents(query=query, top_k=5, course=course, config=self.config)
            retrieved_topics = [r["topic"] for r in results]

            if retrieved_topics and exp_topic in retrieved_topics[0]:
                hit_1 += 1
            if any(exp_topic in t for t in retrieved_topics[:3]):
                hit_3 += 1
            if any(exp_topic in t for t in retrieved_topics[:5]):
                hit_5 += 1

        hit_1_rate = (hit_1 / total) * 100
        hit_3_rate = (hit_3 / total) * 100
        hit_5_rate = (hit_5 / total) * 100

        print(f"\n--- EVALUATION BENCHMARK RESULTS ({total} Queries) ---")
        print(f"Hit@1: {hit_1}/{total} ({hit_1_rate:.1f}%)")
        print(f"Hit@3: {hit_3}/{total} ({hit_3_rate:.1f}%)")
        print(f"Hit@5: {hit_5}/{total} ({hit_5_rate:.1f}%)")
        print("-" * 50)

        self.assertGreaterEqual(hit_1_rate, 85.0, f"Hit@1 rate {hit_1_rate:.1f}% below 85% target")
        self.assertGreaterEqual(hit_3_rate, 95.0, f"Hit@3 rate {hit_3_rate:.1f}% below 95% target")
        self.assertEqual(hit_5_rate, 100.0, f"Hit@5 rate {hit_5_rate:.1f}% below 100% target")

    def test_08_repeated_ingestion_idempotency(self):
        """Verify that repeating ingestion does not duplicate chunks in ChromaDB."""
        initial_count = self.vstore.count()
        # Ingest again without reset
        run_ingestion(config=self.config, reset_collection=False)
        after_count = self.vstore.count()
        self.assertEqual(initial_count, after_count, f"Idempotency failed: count grew from {initial_count} to {after_count}")

    def test_09_context_formatter_output(self):
        """Verify context formatter output format adheres to Member 3 interface specifications."""
        sample_results = retrieve_documents("Explain pointers", top_k=2, course="c", config=self.config)
        formatted = format_context(sample_results)
        self.assertIn("COURSE: C", formatted)
        self.assertIn("TOPIC:", formatted)
        self.assertIn("LEVEL:", formatted)
        self.assertIn("SOURCE:", formatted)
        self.assertIn("SECTION:", formatted)

        # Prompt formatting
        prompt = format_rag_prompt("Explain pointers", sample_results, cognitive_load="MEDIUM")
        self.assertIn("STUDENT COGNITIVE LOAD: MEDIUM", prompt)
        self.assertIn("STUDENT QUESTION: Explain pointers", prompt)

    def test_10_edge_cases(self):
        """Test edge cases such as empty query, empty filters, and extreme thresholds."""
        # Empty query
        self.assertEqual(retrieve_documents("", course="c"), [])
        self.assertEqual(retrieve_documents("   ", course="c"), [])

        # Extreme threshold
        high_thresh = retrieve_documents("pointers", course="c", threshold=0.999)
        self.assertEqual(len(high_thresh), 0)

        # Invalid course filter
        res_invalid = retrieve_documents("pointers", course="invalid_lang_xyz")
        self.assertEqual(len(res_invalid), 0)


def run_tests():
    """Run test suite and exit with code."""
    suite = unittest.TestLoader().loadTestsFromTestCase(TestRAGComprehensiveSuite)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)


if __name__ == "__main__":
    run_tests()
