"""Unit and integration tests for Concept-Level Learner Knowledge (Member 1).

Verifies:
1. Creating a concept knowledge record.
2. Retrieving an existing record.
3. Handling a concept with no record.
4. Updating a learner's concept state.
5. Recording correct assessment evidence.
6. Recording incorrect assessment evidence.
7. Retrieving a topic-specific learner concept profile.
8. Retrieving known concepts.
9. Retrieving concepts needing review.
10. Ensuring two learners have isolated records for the same concept.
11. Preventing updates from affecting another learner's record.
12. Repeated database initialization without loss of existing records.
13. Preventing duplicate assessment evidence from being counted twice where a stable evidence identifier is available.
14. Handling invalid knowledge-state values.
15. Handling invalid or missing identifiers.
16. Preserving existing quiz attempts and topic-level mastery data.
17. Conflicting topic IDs on the same concept (Task 1).
18. Evidence IDs that are absent, empty, or whitespace-only (Task 3).
19. Mastered concept receiving subsequent incorrect answer dropping to review (Task 3).
20. Recovery lifecycle from review-needed status toward mastery (Task 3).
21. Foreign key enforcement on connections and rejection of invalid user references (Task 2).
"""

import os
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path

# Setup disposable isolated test database before any backend imports
_TEST_TEMP_DIR = tempfile.TemporaryDirectory()
_DISPOSABLE_DB = Path(_TEST_TEMP_DIR.name) / "test_concept_knowledge_isolated.db"
os.environ["ADAPTIVE_LEARNING_DB_PATH"] = str(_DISPOSABLE_DB)
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

from backend.services.state_store import state_store
from backend.services.concept_service import (
    ConceptService,
    determine_knowledge_state,
    VALID_KNOWLEDGE_STATES,
)


class TestConceptKnowledge(unittest.TestCase):
    """Test suite for concept knowledge tracking, state transitions, and database isolation."""

    @classmethod
    def setUpClass(cls):
        state_store.set_db_path(str(_DISPOSABLE_DB), init_schema=True)

        # Seed test learners
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
            ("learner-alice", "alice@test.edu", "Alice Learner", "student")
        )
        cur.execute(
            "INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
            ("learner-bob", "bob@test.edu", "Bob Learner", "student")
        )
        conn.commit()
        conn.close()

    @classmethod
    def tearDownClass(cls):
        _TEST_TEMP_DIR.cleanup()

    def setUp(self):
        self.service = ConceptService()

    # --- 1. Creating a concept knowledge record ---
    def test_01_create_concept_knowledge_record(self):
        rec = self.service.update_concept_state(
            user_id="learner-alice",
            concept_id="sigmoid_function",
            topic_id="top-py-logistic-regression",
            state="LEARNING"
        )
        self.assertIsNotNone(rec)
        self.assertEqual(rec["user_id"], "learner-alice")
        self.assertEqual(rec["concept_id"], "sigmoid_function")
        self.assertEqual(rec["topic_id"], "top-py-logistic-regression")
        self.assertEqual(rec["knowledge_state"], "LEARNING")
        self.assertEqual(rec["correct_count"], 0)
        self.assertEqual(rec["incorrect_count"], 0)
        self.assertEqual(rec["total_attempts"], 0)
        self.assertIsNotNone(rec["created_at"])
        self.assertIsNotNone(rec["updated_at"])

    # --- 2. Retrieving an existing record ---
    def test_02_retrieve_existing_record(self):
        rec = self.service.get_concept_knowledge(
            user_id="learner-alice",
            concept_id="sigmoid_function"
        )
        self.assertIsNotNone(rec)
        self.assertEqual(rec["concept_id"], "sigmoid_function")
        self.assertEqual(rec["user_id"], "learner-alice")

        # Also retrieve with explicit topic_id
        rec_topic = self.service.get_concept_knowledge(
            user_id="learner-alice",
            concept_id="sigmoid_function",
            topic_id="top-py-logistic-regression"
        )
        self.assertIsNotNone(rec_topic)
        self.assertEqual(rec_topic["topic_id"], "top-py-logistic-regression")

    # --- 3. Handling a concept with no record ---
    def test_03_handle_concept_with_no_record(self):
        missing = self.service.get_concept_knowledge(
            user_id="learner-alice",
            concept_id="non_existent_concept"
        )
        self.assertIsNone(missing)

        default_rec = self.service.get_concept_knowledge(
            user_id="learner-alice",
            concept_id="non_existent_concept",
            default_if_missing=True
        )
        self.assertIsNotNone(default_rec)
        self.assertEqual(default_rec["knowledge_state"], "NOT_ASSESSED")
        self.assertEqual(default_rec["correct_count"], 0)
        self.assertEqual(default_rec["total_attempts"], 0)

    # --- 4. Updating a learner's concept state ---
    def test_04_update_concept_state(self):
        updated = self.service.update_concept_state(
            user_id="learner-alice",
            concept_id="sigmoid_function",
            topic_id="top-py-logistic-regression",
            state="NEEDS_REVIEW"
        )
        self.assertEqual(updated["knowledge_state"], "NEEDS_REVIEW")
        self.assertEqual(updated["concept_id"], "sigmoid_function")

    # --- 5. Recording correct assessment evidence ---
    def test_05_record_correct_assessment_evidence(self):
        # Single correct answer transitions to LEARNING, never automatically MASTERED
        result = self.service.record_concept_evidence(
            user_id="learner-alice",
            concept_id="decision_threshold",
            topic_id="top-py-logistic-regression",
            is_correct=True,
            source="quiz_practice"
        )
        self.assertEqual(result["correct_count"], 1)
        self.assertEqual(result["incorrect_count"], 0)
        self.assertEqual(result["total_attempts"], 1)
        self.assertEqual(result["knowledge_state"], "LEARNING")
        self.assertIsNotNone(result["last_assessed_at"])

    # --- 6. Recording incorrect assessment evidence ---
    def test_06_record_incorrect_assessment_evidence(self):
        # Incorrect answer transitions to NEEDS_REVIEW
        result = self.service.record_concept_evidence(
            user_id="learner-alice",
            concept_id="binary_cross_entropy",
            topic_id="top-py-logistic-regression",
            is_correct=False,
            source="quiz_practice"
        )
        self.assertEqual(result["correct_count"], 0)
        self.assertEqual(result["incorrect_count"], 1)
        self.assertEqual(result["total_attempts"], 1)
        self.assertEqual(result["knowledge_state"], "NEEDS_REVIEW")

    # --- 7. Retrieving a topic-specific learner concept profile ---
    def test_07_get_learner_concept_profile(self):
        profile = self.service.get_learner_concept_profile(
            user_id="learner-alice",
            topic_id="top-py-logistic-regression"
        )
        self.assertEqual(profile["user_id"], "learner-alice")
        self.assertEqual(profile["topic_id"], "top-py-logistic-regression")
        self.assertGreaterEqual(len(profile["concepts"]), 3)
        self.assertIn("summary", profile)
        self.assertGreaterEqual(profile["summary"]["total_tracked"], 3)
        self.assertIn("learning_concepts", profile)
        self.assertIn("review_needed_concepts", profile)

        empty_profile = self.service.get_learner_concept_profile(
            user_id="learner-alice",
            topic_id="top-nonexistent-topic"
        )
        self.assertEqual(len(empty_profile["concepts"]), 0)
        self.assertEqual(empty_profile["summary"]["total_tracked"], 0)

    # --- 8. Retrieving known concepts ---
    def test_08_retrieve_known_concepts(self):
        for i in range(3):
            self.service.record_concept_evidence(
                user_id="learner-alice",
                concept_id="confusion_matrix",
                topic_id="top-py-logistic-regression",
                is_correct=True,
                evidence_id=f"alice_cm_attempt_{i+1}"
            )

        known = self.service.get_known_concepts(
            user_id="learner-alice",
            topic_id="top-py-logistic-regression"
        )
        self.assertIn("confusion_matrix", known)
        self.assertTrue(any(c["concept_id"] == "confusion_matrix" for c in known))

        known_ids = self.service.get_known_concepts(
            user_id="learner-alice",
            topic_id="top-py-logistic-regression",
            as_ids=True
        )
        self.assertIn("confusion_matrix", known_ids)

    # --- 9. Retrieving concepts needing review ---
    def test_09_retrieve_concepts_needing_review(self):
        review_needed = self.service.get_concepts_needing_review(
            user_id="learner-alice",
            topic_id="top-py-logistic-regression"
        )
        self.assertIn("binary_cross_entropy", review_needed)

        review_ids = self.service.get_concepts_needing_review(
            user_id="learner-alice",
            topic_id="top-py-logistic-regression",
            as_ids=True
        )
        self.assertIn("binary_cross_entropy", review_ids)

    # --- 10. Ensuring two learners have isolated records for the same concept ---
    def test_10_learner_isolation_same_concept(self):
        for i in range(3):
            self.service.record_concept_evidence(
                user_id="learner-bob",
                concept_id="binary_cross_entropy",
                topic_id="top-py-logistic-regression",
                is_correct=True,
                evidence_id=f"bob_bce_attempt_{i+1}"
            )

        alice_rec = self.service.get_concept_knowledge("learner-alice", "binary_cross_entropy", topic_id="top-py-logistic-regression")
        bob_rec = self.service.get_concept_knowledge("learner-bob", "binary_cross_entropy", topic_id="top-py-logistic-regression")

        self.assertEqual(alice_rec["knowledge_state"], "NEEDS_REVIEW")
        self.assertEqual(bob_rec["knowledge_state"], "MASTERED")
        self.assertEqual(alice_rec["correct_count"], 0)
        self.assertEqual(bob_rec["correct_count"], 3)

    # --- 11. Preventing updates from affecting another learner's record ---
    def test_11_cross_learner_update_protection(self):
        self.service.update_concept_state(
            user_id="learner-alice",
            concept_id="binary_cross_entropy",
            topic_id="top-py-logistic-regression",
            state="LEARNING"
        )

        bob_rec = self.service.get_concept_knowledge("learner-bob", "binary_cross_entropy", topic_id="top-py-logistic-regression")
        self.assertEqual(bob_rec["knowledge_state"], "MASTERED")
        self.assertEqual(bob_rec["correct_count"], 3)

    # --- 12. Repeated database initialization without loss of existing records ---
    def test_12_repeated_database_initialization(self):
        # Re-run schema initialization via public service method
        self.service._ensure_tables()

        alice_rec = self.service.get_concept_knowledge("learner-alice", "binary_cross_entropy", topic_id="top-py-logistic-regression")
        self.assertIsNotNone(alice_rec)
        self.assertEqual(alice_rec["knowledge_state"], "LEARNING")

    # --- 13. Preventing duplicate assessment evidence from being counted twice ---
    def test_13_prevent_duplicate_evidence_counting(self):
        evidence_key = "stable_submission_q42"

        res1 = self.service.record_concept_evidence(
            user_id="learner-alice",
            concept_id="cost_gradient",
            topic_id="top-py-logistic-regression",
            is_correct=True,
            evidence_id=evidence_key
        )
        self.assertEqual(res1["correct_count"], 1)
        self.assertFalse(res1.get("duplicate", False))

        res2 = self.service.record_concept_evidence(
            user_id="learner-alice",
            concept_id="cost_gradient",
            topic_id="top-py-logistic-regression",
            is_correct=True,
            evidence_id=evidence_key
        )
        self.assertEqual(res2["correct_count"], 1)  # NOT incremented to 2
        self.assertTrue(res2.get("duplicate", False))

    # --- 14. Handling invalid knowledge-state values ---
    def test_14_invalid_knowledge_state_values(self):
        with self.assertRaises(ValueError):
            self.service.update_concept_state(
                user_id="learner-alice",
                concept_id="sigmoid_function",
                topic_id="top-py-logistic-regression",
                state="CONFUSED"
            )

        with self.assertRaises(ValueError):
            self.service.update_concept_state(
                user_id="learner-alice",
                concept_id="sigmoid_function",
                topic_id="top-py-logistic-regression",
                state=""
            )

    # --- 15. Handling invalid or missing identifiers ---
    def test_15_invalid_or_missing_identifiers(self):
        with self.assertRaises(ValueError):
            self.service.get_concept_knowledge("", "sigmoid_function")

        with self.assertRaises(ValueError):
            self.service.get_concept_knowledge(None, "sigmoid_function")

        with self.assertRaises(ValueError):
            self.service.get_concept_knowledge("learner-alice", "")

        with self.assertRaises(ValueError):
            self.service.get_learner_concept_profile("learner-alice", "   ")

    # --- 16. Preserving existing quiz attempts and topic-level mastery data ---
    def test_16_preserve_existing_quiz_and_mastery_tables(self):
        conn = state_store.get_connection()
        cur = conn.cursor()

        cur.execute(
            """INSERT OR REPLACE INTO quiz_attempts
               (id, user_id, topic_id, score, percentage, correct_count, total_questions)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            ("attempt-legacy-1", "learner-alice", "top-py-logistic-regression", 8.0, 80.0, 8, 10)
        )

        cur.execute(
            """INSERT OR REPLACE INTO student_topic_mastery
               (id, user_id, subject_id, topic_id, current_mastery, mastery_status)
               VALUES (?, ?, ?, ?, ?, ?)""",
            ("mastery-legacy-1", "learner-alice", "py-ml", "top-py-logistic-regression", 80.0, "PROFICIENT")
        )
        conn.commit()
        conn.close()

        self.service.record_concept_evidence(
            user_id="learner-alice",
            concept_id="l2_regularization",
            topic_id="top-py-logistic-regression",
            is_correct=True
        )

        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute("SELECT score, percentage FROM quiz_attempts WHERE id = 'attempt-legacy-1'")
        qa = cur.fetchone()
        self.assertIsNotNone(qa)
        self.assertEqual(qa["percentage"], 80.0)

        cur.execute("SELECT current_mastery, mastery_status FROM student_topic_mastery WHERE id = 'mastery-legacy-1'")
        tm = cur.fetchone()
        self.assertIsNotNone(tm)
        self.assertEqual(tm["current_mastery"], 80.0)
        self.assertEqual(tm["mastery_status"], "PROFICIENT")
        conn.close()

    # --- 17. Conflicting topic IDs on the same concept (Task 1) ---
    def test_17_conflicting_topic_isolation(self):
        """Verify that concept knowledge in topic_A is NOT overwritten by practice in topic_B."""
        concept = "gradient_descent_step"

        # Topic A: Logistic Regression - learner achieves MASTERED (3 correct)
        for i in range(3):
            self.service.record_concept_evidence(
                user_id="learner-alice",
                concept_id=concept,
                topic_id="top-py-logistic-regression",
                is_correct=True,
                evidence_id=f"alice_lr_gd_{i+1}"
            )

        # Topic B: Neural Networks - learner struggles on gradient descent (1 incorrect)
        self.service.record_concept_evidence(
            user_id="learner-alice",
            concept_id=concept,
            topic_id="top-py-neural-networks",
            is_correct=False,
            evidence_id="alice_nn_gd_1"
        )

        # Retrieve profiles for both topics independently
        profile_lr = self.service.get_learner_concept_profile(
            user_id="learner-alice",
            topic_id="top-py-logistic-regression"
        )
        profile_nn = self.service.get_learner_concept_profile(
            user_id="learner-alice",
            topic_id="top-py-neural-networks"
        )

        # Topic A still retains gradient descent as MASTERED with 3 correct answers
        lr_rec = self.service.get_concept_knowledge("learner-alice", concept, topic_id="top-py-logistic-regression")
        self.assertIsNotNone(lr_rec)
        self.assertEqual(lr_rec["knowledge_state"], "MASTERED")
        self.assertEqual(lr_rec["correct_count"], 3)
        self.assertEqual(lr_rec["incorrect_count"], 0)
        self.assertIn(concept, profile_lr["known_concept_ids"])

        # Topic B tracks gradient descent as NEEDS_REVIEW with 1 incorrect answer
        nn_rec = self.service.get_concept_knowledge("learner-alice", concept, topic_id="top-py-neural-networks")
        self.assertIsNotNone(nn_rec)
        self.assertEqual(nn_rec["knowledge_state"], "NEEDS_REVIEW")
        self.assertEqual(nn_rec["correct_count"], 0)
        self.assertEqual(nn_rec["incorrect_count"], 1)
        self.assertIn(concept, profile_nn["review_needed_concept_ids"])

    # --- 18. Evidence IDs that are absent, empty, or whitespace-only (Task 3) ---
    def test_18_evidence_id_variations(self):
        concept = "learning_rate_decay"
        topic = "top-py-optim"

        # None evidence_id: non-idempotent raw evidence (increments normally)
        res_none = self.service.record_concept_evidence(
            user_id="learner-alice",
            concept_id=concept,
            topic_id=topic,
            is_correct=True,
            evidence_id=None
        )
        self.assertEqual(res_none["correct_count"], 1)
        self.assertFalse(res_none.get("duplicate", False))

        # Empty string evidence_id: treated as absent (increments to 2)
        res_empty = self.service.record_concept_evidence(
            user_id="learner-alice",
            concept_id=concept,
            topic_id=topic,
            is_correct=True,
            evidence_id=""
        )
        self.assertEqual(res_empty["correct_count"], 2)
        self.assertFalse(res_empty.get("duplicate", False))

        # Whitespace-only evidence_id: treated as absent (increments to 3 -> MASTERED)
        res_ws = self.service.record_concept_evidence(
            user_id="learner-alice",
            concept_id=concept,
            topic_id=topic,
            is_correct=True,
            evidence_id="    "
        )
        self.assertEqual(res_ws["correct_count"], 3)
        self.assertEqual(res_ws["knowledge_state"], "MASTERED")
        self.assertFalse(res_ws.get("duplicate", False))

    # --- 19. Mastered concept receiving subsequent incorrect answer (Task 3) ---
    def test_19_mastered_concept_subsequent_incorrect_drops_to_review(self):
        concept = "roc_auc_curve"
        topic = "top-py-evaluation"

        # Reach mastery with 3 correct answers
        for i in range(3):
            self.service.record_concept_evidence(
                user_id="learner-alice",
                concept_id=concept,
                topic_id=topic,
                is_correct=True,
                evidence_id=f"roc_mastery_{i+1}"
            )

        mastered_rec = self.service.get_concept_knowledge("learner-alice", concept, topic_id=topic)
        self.assertEqual(mastered_rec["knowledge_state"], "MASTERED")
        self.assertEqual(mastered_rec["correct_count"], 3)

        # Later, learner answers incorrectly
        res_err = self.service.record_concept_evidence(
            user_id="learner-alice",
            concept_id=concept,
            topic_id=topic,
            is_correct=False,
            evidence_id="roc_lapse_1"
        )

        # Must immediately drop to NEEDS_REVIEW
        self.assertEqual(res_err["knowledge_state"], "NEEDS_REVIEW")
        # Historical correct answers must be completely preserved (not erased)
        self.assertEqual(res_err["correct_count"], 3)
        self.assertEqual(res_err["incorrect_count"], 1)
        self.assertEqual(res_err["total_attempts"], 4)

    # --- 20. Recovery lifecycle from review-needed status toward mastery (Task 3) ---
    def test_20_recovery_lifecycle_review_to_mastered(self):
        concept = "eigenvalues_and_vectors"
        topic = "top-py-linear-algebra"

        # 1. Initial mistake -> NEEDS_REVIEW (correct=0, incorrect=1)
        res1 = self.service.record_concept_evidence(
            user_id="learner-alice",
            concept_id=concept,
            topic_id=topic,
            is_correct=False,
            evidence_id="la_recov_1"
        )
        self.assertEqual(res1["knowledge_state"], "NEEDS_REVIEW")
        self.assertEqual(res1["correct_count"], 0)
        self.assertEqual(res1["incorrect_count"], 1)

        # 2. 1st correct answer -> still NEEDS_REVIEW (1/2 = 50% accuracy < 60% threshold)
        res2 = self.service.record_concept_evidence(
            user_id="learner-alice",
            concept_id=concept,
            topic_id=topic,
            is_correct=True,
            evidence_id="la_recov_2"
        )
        self.assertEqual(res2["knowledge_state"], "NEEDS_REVIEW")
        self.assertEqual(res2["correct_count"], 1)
        self.assertEqual(res2["incorrect_count"], 1)

        # 3. 2nd correct answer -> transitions to LEARNING (2/3 = 66.7% accuracy >= 60%)
        res3 = self.service.record_concept_evidence(
            user_id="learner-alice",
            concept_id=concept,
            topic_id=topic,
            is_correct=True,
            evidence_id="la_recov_3"
        )
        self.assertEqual(res3["knowledge_state"], "LEARNING")
        self.assertEqual(res3["correct_count"], 2)
        self.assertEqual(res3["incorrect_count"], 1)

        # 4. 3rd correct answer -> still LEARNING (3/4 = 75% accuracy < 80% mastery threshold)
        res4 = self.service.record_concept_evidence(
            user_id="learner-alice",
            concept_id=concept,
            topic_id=topic,
            is_correct=True,
            evidence_id="la_recov_4"
        )
        self.assertEqual(res4["knowledge_state"], "LEARNING")
        self.assertEqual(res4["correct_count"], 3)
        self.assertEqual(res4["incorrect_count"], 1)

        # 5. 4th correct answer -> reaches MASTERED (4/5 = 80% accuracy >= 80% and >= 3 correct)
        res5 = self.service.record_concept_evidence(
            user_id="learner-alice",
            concept_id=concept,
            topic_id=topic,
            is_correct=True,
            evidence_id="la_recov_5"
        )
        self.assertEqual(res5["knowledge_state"], "MASTERED")
        self.assertEqual(res5["correct_count"], 4)
        self.assertEqual(res5["incorrect_count"], 1)

    # --- 21. Foreign key enforcement on connections (Task 2) ---
    def test_21_foreign_key_enforcement(self):
        """Verify that PRAGMA foreign_keys = ON is active and rejects orphaned records."""
        conn = state_store.get_connection()
        cur = conn.cursor()

        # Check PRAGMA foreign_keys is enabled (1)
        cur.execute("PRAGMA foreign_keys")
        fk_status = cur.fetchone()[0]
        self.assertEqual(fk_status, 1, "PRAGMA foreign_keys must be enabled on every connection.")

        # Attempting to insert a concept knowledge record for non-existent user must fail
        with self.assertRaises(sqlite3.IntegrityError):
            cur.execute(
                """INSERT INTO student_concept_knowledge
                   (id, user_id, concept_id, topic_id, knowledge_state)
                   VALUES ('invalid_fk_id', 'user-ghost-404', 'c_ghost', 't_ghost', 'NOT_ASSESSED')"""
            )
            conn.commit()

        # Attempting to insert an evidence log entry for non-existent user must also fail
        with self.assertRaises(sqlite3.IntegrityError):
            cur.execute(
                """INSERT INTO concept_evidence_log
                   (id, user_id, concept_id, topic_id, evidence_id, is_correct)
                   VALUES ('invalid_log_id', 'user-ghost-404', 'c_ghost', 't_ghost', 'ev_ghost', 1)"""
            )
            conn.commit()

        conn.close()


if __name__ == "__main__":
    unittest.main()
