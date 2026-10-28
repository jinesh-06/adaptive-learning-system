"""Learning Outcomes and Assessment Evaluation Service.

Calculates learning progress, pre-assessment vs post-assessment outcomes,
score and percentage-point improvements, accuracy, completion rates,
and handles student feedback validation and persistence.
"""

import math
import logging
from typing import Dict, Any, List, Optional, Tuple
from fastapi import HTTPException

from backend.services.state_store import state_store
from backend.services.quiz_service import quiz_service
from backend.services.curriculum_service import curriculum_service

logger = logging.getLogger(__name__)


class LearningOutcomesService:
    """Core domain logic for Pre/Post assessments, learning outcomes, and student feedback."""

    # Supported feedback categories
    VALID_FEEDBACK_TYPES = {"lesson", "quiz", "recommendation", "general"}

    # Supported assessment types
    VALID_ASSESSMENT_TYPES = {"pre", "post"}

    def __init__(self):
        pass

    def get_topic_info(self, topic_id: str) -> Dict[str, Any]:
        """Resolve topic metadata safely from curriculum or fallback."""
        safe_topic_id = str(topic_id or "").strip()
        topic = curriculum_service.get_topic_detail(safe_topic_id)
        if topic:
            return {
                "id": safe_topic_id,
                "title": topic.get("title", safe_topic_id),
                "language": topic.get("language", "python"),
                "level": topic.get("level", "beginner"),
                "module_id": topic.get("moduleId", "")
            }
        
        # Fallback friendly title
        clean_title = safe_topic_id.replace("top-", "").replace("py-", "").replace("c-", "").replace("cpp-", "").replace("java-", "").replace("-", " ").title()
        return {
            "id": safe_topic_id,
            "title": clean_title or safe_topic_id,
            "language": "python" if "py" in safe_topic_id else "c" if "c-" in safe_topic_id else "cpp" if "cpp" in safe_topic_id else "java",
            "level": "standard",
            "module_id": ""
        }

    def get_assessment_questions(self, topic_id: str, assessment_type: str) -> Dict[str, Any]:
        """
        Retrieve sanitized questions for Pre-Assessment (first 5 questions)
        or Post-Assessment (next 5 questions) without exposing correct answers.
        """
        safe_type = str(assessment_type or "pre").lower().strip()
        if safe_type not in self.VALID_ASSESSMENT_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid assessment type '{assessment_type}'. Must be 'pre' or 'post'."
            )

        safe_topic_id = str(topic_id or "").strip()
        if not safe_topic_id:
            raise HTTPException(status_code=400, detail="Topic ID must not be empty.")

        quiz_data = quiz_service.get_quiz_for_topic(safe_topic_id)
        all_questions = quiz_data.get("questions", [])

        # Slice 5 questions: 0..5 for Pre, 5..10 for Post
        if safe_type == "pre":
            selected_slice = all_questions[:5] if len(all_questions) >= 5 else all_questions
            label = "Pre-Assessment (Initial Baseline)"
            desc = "Initial diagnostic assessment to measure your baseline understanding before studying this topic."
        else:
            selected_slice = all_questions[5:10] if len(all_questions) >= 10 else all_questions
            label = "Post-Assessment (Topic Mastery)"
            desc = "Follow-up mastery assessment to measure your learning gains and concept retention after completing this topic."

        # Sanitize questions: do NOT leak correct_index or explanation before submission
        client_questions = []
        for idx, q in enumerate(selected_slice):
            client_questions.append({
                "id": str(q.get("id", f"q-{safe_type}-{idx+1}")),
                "question": q.get("question", ""),
                "options": q.get("options", []),
                "difficulty": q.get("difficulty", "medium"),
                "order": idx + 1
            })

        topic_info = self.get_topic_info(safe_topic_id)

        return {
            "topic_id": safe_topic_id,
            "topic_title": topic_info["title"],
            "assessment_type": safe_type,
            "label": label,
            "description": desc,
            "total_questions": len(client_questions),
            "questions": client_questions
        }

    def grade_and_record_assessment(
        self,
        student_id: str,
        topic_id: str,
        assessment_type: str,
        user_answers: Dict[str, Any],
        time_spent: float = 0.0
    ) -> Dict[str, Any]:
        """
        Validate submitted answers on backend, calculate score, accuracy,
        store in database, and compare post-assessment against pre-assessment.
        """
        safe_student_id = str(student_id or "").strip()
        if not safe_student_id:
            raise HTTPException(status_code=401, detail="Authentication required to submit assessment.")

        safe_type = str(assessment_type or "pre").lower().strip()
        if safe_type not in self.VALID_ASSESSMENT_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid assessment type '{assessment_type}'. Must be 'pre' or 'post'."
            )

        safe_topic_id = str(topic_id or "").strip()
        if not safe_topic_id:
            raise HTTPException(status_code=400, detail="Topic ID must not be empty.")

        # Retrieve full verified questions with answer keys
        quiz_data = quiz_service.get_quiz_for_topic(safe_topic_id)
        all_questions = quiz_data.get("questions", [])

        if safe_type == "pre":
            selected_slice = all_questions[:5] if len(all_questions) >= 5 else all_questions
        else:
            selected_slice = all_questions[5:10] if len(all_questions) >= 10 else all_questions

        total_questions = len(selected_slice)
        if total_questions == 0:
            # Handle empty questions safe case
            correct_count = 0
            accuracy = 0.0
            score = 0.0
            total_marks = 0.0
            review = []
        else:
            correct_count = 0
            review = []

            for idx, q in enumerate(selected_slice):
                q_id = str(q.get("id", f"q-{safe_type}-{idx+1}"))
                correct_idx = q.get("correct_index", 0)

                # Support answer lookup by question ID or by 0-indexed position
                user_choice = user_answers.get(q_id)
                if user_choice is None:
                    user_choice = user_answers.get(str(idx))

                # Normalize user choice to int if valid numeric
                parsed_choice: Optional[int] = None
                if user_choice is not None:
                    try:
                        parsed_choice = int(user_choice)
                    except (ValueError, TypeError):
                        parsed_choice = None

                is_correct = (parsed_choice is not None and parsed_choice == correct_idx)
                if is_correct:
                    correct_count += 1

                review.append({
                    "id": q_id,
                    "question": q.get("question", ""),
                    "options": q.get("options", []),
                    "correct_index": correct_idx,
                    "user_choice": parsed_choice,
                    "is_correct": is_correct,
                    "explanation": q.get("explanation", ""),
                    "difficulty": q.get("difficulty", "medium")
                })

            score = float(correct_count)
            total_marks = float(total_questions)
            # Accuracy (%) = (Correct answers / Total questions) * 100
            accuracy = round((correct_count / total_questions) * 100.0, 2)

        # Store in database
        assessment_id = state_store.save_assessment_result(
            student_id=safe_student_id,
            topic_id=safe_topic_id,
            assessment_type=safe_type,
            score=score,
            total_marks=total_marks,
            correct_answers=correct_count,
            total_questions=total_questions,
            accuracy=accuracy,
            answers=user_answers,
            review=review
        )

        # Record telemetry
        state_store.record_telemetry(
            user_id=safe_student_id,
            topic_id=safe_topic_id,
            event_type="ASSESSMENT_SUBMIT",
            duration=float(time_spent or 0.0),
            metadata={
                "assessment_id": assessment_id,
                "assessment_type": safe_type,
                "score": score,
                "total_marks": total_marks,
                "correct_answers": correct_count,
                "total_questions": total_questions,
                "accuracy": accuracy
            }
        )

        # Update topic mastery on post-assessment (pre-assessments serve purely as diagnostic baselines)
        if safe_type == "post":
            try:
                from backend.services.mastery_service import mastery_service
                mastery_service.record_assessment_result(
                    user_id=safe_student_id,
                    topic_id=safe_topic_id,
                    assessment_type="quiz",
                    score=accuracy,
                    assessment_id=f"post_{assessment_id}",
                    metadata={
                        "correct_count": correct_count,
                        "total_questions": total_questions,
                        "source": "post_assessment"
                    }
                )
            except Exception as e:
                logger.warning(f"Could not update mastery for post-assessment {assessment_id}: {e}")

        # Build comparison if post-assessment
        comparison: Optional[Dict[str, Any]] = None
        if safe_type == "post":
            pre_rec = state_store.get_latest_assessment(safe_student_id, safe_topic_id, "pre")
            if pre_rec:
                pre_score = float(pre_rec["score"])
                pre_total = float(pre_rec["total_marks"])
                pre_accuracy = float(pre_rec["accuracy"])

                # Formula: Score improvement = Post-assessment score − Pre-assessment score
                score_improvement = round(score - pre_score, 2)
                # Percentage-point improvement = Post accuracy - Pre accuracy
                pct_point_improvement = round(accuracy - pre_accuracy, 2)

                comparison = {
                    "has_pre_assessment": True,
                    "pre_assessment_id": pre_rec.get("id"),
                    "pre_score": pre_score,
                    "pre_total_marks": pre_total,
                    "pre_accuracy": pre_accuracy,
                    "pre_completed_at": pre_rec.get("completed_at"),
                    "post_score": score,
                    "post_total_marks": total_marks,
                    "post_accuracy": accuracy,
                    "score_improvement": score_improvement,
                    "percentage_point_improvement": pct_point_improvement,
                    "improved": score_improvement > 0,
                    "summary_text": (
                        f"Score improved by {score_improvement:+.1f} marks "
                        f"({pct_point_improvement:+.1f}% points) compared to your pre-assessment."
                    )
                }
            else:
                comparison = {
                    "has_pre_assessment": False,
                    "pre_assessment_id": None,
                    "pre_score": None,
                    "pre_total_marks": None,
                    "pre_accuracy": None,
                    "score_improvement": None,
                    "percentage_point_improvement": None,
                    "improved": None,
                    "summary_text": "Post-assessment recorded. No prior pre-assessment was found for this topic to compare against."
                }

        topic_info = self.get_topic_info(safe_topic_id)

        return {
            "success": True,
            "assessment_id": assessment_id,
            "student_id": safe_student_id,
            "topic_id": safe_topic_id,
            "topic_title": topic_info["title"],
            "assessment_type": safe_type,
            "score": score,
            "total_marks": total_marks,
            "correct_answers": correct_count,
            "total_questions": total_questions,
            "accuracy": accuracy,
            "time_spent": float(time_spent or 0.0),
            "review": review,
            "comparison": comparison
        }

    def calculate_learning_outcomes(self, student_id: str, topic_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Calculate complete learning outcome metrics for student:
        1. Pre-assessment score
        2. Post-assessment score
        3. Score improvement
        4. Accuracy percentage
        5. Assessment completion rate
        6. Number of completed assessments
        7. Topic-wise learning progress
        """
        safe_student_id = str(student_id or "").strip()
        if not safe_student_id:
            raise HTTPException(status_code=401, detail="Authentication required to view learning outcomes.")

        all_results = state_store.get_assessment_results(safe_student_id, topic_id=topic_id, limit=200)

        # Group results by topic_id
        topics_map: Dict[str, Dict[str, Any]] = {}
        total_correct = 0
        total_questions = 0

        for r in all_results:
            tid = r["topic_id"]
            atype = r["assessment_type"].lower()

            if tid not in topics_map:
                topic_info = self.get_topic_info(tid)
                topics_map[tid] = {
                    "topic_id": tid,
                    "topic_title": topic_info["title"],
                    "language": topic_info["language"],
                    "pre": None,
                    "post": None,
                    "all_attempts": []
                }

            # Keep latest attempt of each type
            if atype == "pre" and topics_map[tid]["pre"] is None:
                topics_map[tid]["pre"] = r
            elif atype == "post" and topics_map[tid]["post"] is None:
                topics_map[tid]["post"] = r

            topics_map[tid]["all_attempts"].append({
                "id": r["id"],
                "type": atype,
                "score": float(r["score"]),
                "total_marks": float(r["total_marks"]),
                "correct_answers": int(r["correct_answers"]),
                "total_questions": int(r["total_questions"]),
                "accuracy": float(r["accuracy"]),
                "completed_at": r.get("completed_at")
            })

            total_correct += int(r.get("correct_answers", 0))
            total_questions += int(r.get("total_questions", 0))

        # Build topic-wise progress list
        topic_outcomes: List[Dict[str, Any]] = []
        score_improvements: List[float] = []
        pct_point_improvements: List[float] = []

        for tid, data in topics_map.items():
            pre = data["pre"]
            post = data["post"]

            has_pre = pre is not None
            has_post = post is not None

            pre_score = float(pre["score"]) if has_pre else None
            pre_total = float(pre["total_marks"]) if has_pre else None
            pre_accuracy = float(pre["accuracy"]) if has_pre else None

            post_score = float(post["score"]) if has_post else None
            post_total = float(post["total_marks"]) if has_post else None
            post_accuracy = float(post["accuracy"]) if has_post else None

            score_imp: Optional[float] = None
            pct_imp: Optional[float] = None

            if has_pre and has_post:
                # Formula: Score improvement = Post-assessment score − Pre-assessment score
                score_imp = round(post_score - pre_score, 2)
                # Percentage-point improvement = Post accuracy - Pre accuracy
                pct_imp = round(post_accuracy - pre_accuracy, 2)
                score_improvements.append(score_imp)
                pct_point_improvements.append(pct_imp)
                status = "COMPLETED"
            elif has_post and not has_pre:
                status = "POST_ASSESSED_ONLY"
            elif has_pre and not has_post:
                status = "PRE_ASSESSED_ONLY"
            else:
                status = "NOT_STARTED"

            topic_outcomes.append({
                "topic_id": tid,
                "topic_title": data["topic_title"],
                "language": data["language"],
                "status": status,
                "has_pre_assessment": has_pre,
                "has_post_assessment": has_post,
                "pre_assessment": {
                    "score": pre_score,
                    "total_marks": pre_total,
                    "accuracy": pre_accuracy,
                    "completed_at": pre.get("completed_at") if has_pre else None
                } if has_pre else None,
                "post_assessment": {
                    "score": post_score,
                    "total_marks": post_total,
                    "accuracy": post_accuracy,
                    "completed_at": post.get("completed_at") if has_post else None
                } if has_post else None,
                "score_improvement": score_imp,
                "percentage_point_improvement": pct_imp,
                "total_attempts": len(data["all_attempts"])
            })

        completed_assessments = len(all_results)
        # Assigned assessments = 2 assessments per active attempted topic, minimum 2 if any attempt exists
        assigned_assessments = max(len(topics_map) * 2, completed_assessments) if len(topics_map) > 0 else 0

        # Formula: Accuracy (%) = (Correct answers / Total questions) * 100
        overall_accuracy = (
            round((total_correct / total_questions) * 100.0, 2)
            if total_questions > 0 else 0.0
        )

        # Formula: Completion rate (%) = (Completed assessments / Assigned assessments) * 100
        completion_rate = (
            round((completed_assessments / assigned_assessments) * 100.0, 2)
            if assigned_assessments > 0 else 0.0
        )

        avg_score_imp = (
            round(sum(score_improvements) / len(score_improvements), 2)
            if score_improvements else 0.0
        )
        avg_pct_imp = (
            round(sum(pct_point_improvements) / len(pct_point_improvements), 2)
            if pct_point_improvements else 0.0
        )

        # Recent assessment records for timeline
        recent_assessments = [
            {
                "id": r["id"],
                "topic_id": r["topic_id"],
                "topic_title": self.get_topic_info(r["topic_id"])["title"],
                "assessment_type": r["assessment_type"],
                "score": float(r["score"]),
                "total_marks": float(r["total_marks"]),
                "accuracy": float(r["accuracy"]),
                "correct_answers": int(r["correct_answers"]),
                "total_questions": int(r["total_questions"]),
                "completed_at": r.get("completed_at")
            }
            for r in all_results[:10]
        ]

        return {
            "student_id": safe_student_id,
            "summary": {
                "number_of_completed_assessments": completed_assessments,
                "number_of_assigned_assessments": assigned_assessments,
                "assessment_completion_rate": completion_rate,
                "accuracy_percentage": overall_accuracy,
                "average_score_improvement": avg_score_imp,
                "average_percentage_point_improvement": avg_pct_imp,
                "topics_assessed_count": len(topics_map),
                "fully_assessed_topics_count": len(score_improvements)
            },
            "topic_outcomes": topic_outcomes,
            "recent_assessments": recent_assessments
        }

    # --- Student Feedback Validation & Processing ---
    def validate_feedback_payload(self, topic_id: str, rating: Any, comments: Optional[str], feedback_type: Optional[str]) -> Tuple[str, int, str, str]:
        """Validate all feedback parameters against schema constraints."""
        safe_topic_id = str(topic_id or "").strip()
        if not safe_topic_id:
            raise HTTPException(status_code=400, detail="Topic or activity identifier is required.")

        try:
            rating_val = int(rating)
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="Rating must be an integer between 1 and 5.")

        if rating_val < 1 or rating_val > 5:
            raise HTTPException(status_code=400, detail="Rating must be an integer between 1 and 5.")

        safe_comments = str(comments or "").strip()
        if not safe_comments:
            raise HTTPException(status_code=400, detail="Feedback comment must not be empty.")
        if len(safe_comments) > 2000:
            raise HTTPException(status_code=400, detail="Feedback comment must not exceed 2000 characters.")

        safe_type = str(feedback_type or "lesson").lower().strip()
        if safe_type not in self.VALID_FEEDBACK_TYPES:
            safe_type = "lesson"

        return safe_topic_id, rating_val, safe_comments, safe_type

    def create_student_feedback(
        self,
        student_id: str,
        topic_id: str,
        rating: int,
        comments: str,
        feedback_type: str = "lesson"
    ) -> Dict[str, Any]:
        """Create new feedback record for authenticated student."""
        safe_student_id = str(student_id or "").strip()
        if not safe_student_id:
            raise HTTPException(status_code=401, detail="Authentication required to submit feedback.")

        v_topic, v_rating, v_comments, v_type = self.validate_feedback_payload(
            topic_id=topic_id,
            rating=rating,
            comments=comments,
            feedback_type=feedback_type
        )

        record = state_store.save_student_feedback(
            student_id=safe_student_id,
            topic_id=v_topic,
            rating=v_rating,
            comments=v_comments,
            feedback_type=v_type
        )

        topic_info = self.get_topic_info(v_topic)
        record["topic_title"] = topic_info["title"]
        return record

    def get_student_feedback_list(self, student_id: str, topic_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve feedback list submitted by the authenticated student."""
        safe_student_id = str(student_id or "").strip()
        if not safe_student_id:
            raise HTTPException(status_code=401, detail="Authentication required to view feedback.")

        rows = state_store.get_student_feedbacks(safe_student_id, topic_id=topic_id)
        for r in rows:
            r["topic_title"] = self.get_topic_info(r["topic_id"])["title"]
        return rows

    def update_student_feedback(
        self,
        feedback_id: str,
        student_id: str,
        rating: Optional[int] = None,
        comments: Optional[str] = None,
        feedback_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update existing feedback owned by the authenticated student."""
        safe_student_id = str(student_id or "").strip()
        if not safe_student_id:
            raise HTTPException(status_code=401, detail="Authentication required to update feedback.")

        if rating is not None:
            try:
                r_val = int(rating)
                if r_val < 1 or r_val > 5:
                    raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
            except (ValueError, TypeError):
                raise HTTPException(status_code=400, detail="Rating must be an integer between 1 and 5.")

        if comments is not None and not str(comments).strip():
            raise HTTPException(status_code=400, detail="Feedback comments cannot be empty.")

        try:
            updated = state_store.update_student_feedback(
                feedback_id=feedback_id,
                student_id=safe_student_id,
                rating=rating,
                comments=comments,
                feedback_type=feedback_type
            )
        except PermissionError:
            raise HTTPException(status_code=403, detail="Forbidden: You cannot modify feedback belonging to another student.")

        if not updated:
            raise HTTPException(status_code=404, detail="Feedback record not found.")

        updated["topic_title"] = self.get_topic_info(updated["topic_id"])["title"]
        return updated

    def delete_student_feedback(self, feedback_id: str, student_id: str) -> Dict[str, Any]:
        """Delete existing feedback owned by the authenticated student."""
        safe_student_id = str(student_id or "").strip()
        if not safe_student_id:
            raise HTTPException(status_code=401, detail="Authentication required to delete feedback.")

        try:
            deleted = state_store.delete_student_feedback(feedback_id, safe_student_id)
        except PermissionError:
            raise HTTPException(status_code=403, detail="Forbidden: You cannot delete feedback belonging to another student.")

        if not deleted:
            raise HTTPException(status_code=404, detail="Feedback record not found.")

        return {"success": True, "message": "Feedback deleted successfully.", "id": feedback_id}


learning_outcomes_service = LearningOutcomesService()
