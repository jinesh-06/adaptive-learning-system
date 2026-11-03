import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Zap,
  BarChart3
} from 'lucide-react';
import { api, CorrectivePracticeQuestion } from '../../services/api';
import { CorrectivePracticeSection } from './CorrectivePracticeSection';
import { telemetry } from '../../services/telemetry';
import { renderFormattedText } from '../../utils/textFormatter';
import { useCognitive } from '../../context/CognitiveContext';
import allTopicQuizzes from '../../data/allTopicQuizzes.json';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  correctIndex?: number;
  explanation: string;
  difficulty?: string;
}

export interface InLessonQuizProps {
  topicId: string;
  initialQuestions?: QuizQuestion[];
  quizType?: 'mastery' | 'adapted' | 'comprehension_check';
  detailLevel?: string;
  onQuizSubmitted?: () => void;
}

export const InLessonQuiz: React.FC<InLessonQuizProps> = ({
  topicId,
  initialQuestions,
  quizType = 'mastery',
  detailLevel,
  onQuizSubmitted
}) => {
  const { updateFromFeedback, setContentModeManually } = useCognitive();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState<boolean>(false);
  const [adaptiveFeedback, setAdaptiveFeedback] = useState<any | null>(null);
  const [showFullReview, setShowFullReview] = useState<boolean>(true);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  const lastTopicIdRef = useRef<string>(topicId);
  const submissionIdRef = useRef<string>(`sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  const isCompletedRef = useRef<boolean>(isCompleted);
  isCompletedRef.current = isCompleted;
  const isSubmittingRef = useRef<boolean>(isSubmittingFinal);
  isSubmittingRef.current = isSubmittingFinal;
  const selectedAnswersRef = useRef<Record<number, number>>(selectedAnswers);
  selectedAnswersRef.current = selectedAnswers;
  const questionsRef = useRef<QuizQuestion[]>(questions);
  questionsRef.current = questions;

  // Load questions and handle topic navigation without restarting on adapted lesson refresh
  useEffect(() => {
    let isMounted = true;
    const isTopicChange = lastTopicIdRef.current !== topicId;

    if (isTopicChange) {
      // User navigated to a new topic -> cleanly reset all quiz state
      lastTopicIdRef.current = topicId;
      submissionIdRef.current = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setCurrentIndex(0);
      setSelectedAnswers({});
      setSubmittedQuestions({});
      setScore(0);
      setIsCompleted(false);
      setAdaptiveFeedback(null);
      setSubmissionResult(null);
      setStartTime(Date.now());
      setQuestions([]);
      setLoading(true);
    } else {
      // Same topic: NEVER reset if quiz is already completed or submission is in progress
      if (isCompletedRef.current || isSubmittingRef.current) {
        return;
      }
      // Also never reset if user has already started answering questions
      if (Object.keys(selectedAnswersRef.current).length > 0) {
        return;
      }
      // If questions are already initialized and valid, do not reload
      if (questionsRef.current.length > 0) {
        return;
      }
    }

    // 1. If intentional comprehension check and initialQuestions provided, adopt directly
    if (quizType === 'comprehension_check' && initialQuestions && Array.isArray(initialQuestions) && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
      setLoading(false);
      return;
    }

    // 2. If standard mastery quiz and initialQuestions has strictly 10 questions, adopt it
    if (quizType === 'mastery' && initialQuestions && Array.isArray(initialQuestions) && initialQuestions.length === 10) {
      setQuestions(initialQuestions);
      setLoading(false);
      return;
    }

    // 3. Immediate zero-latency fallback from allTopicQuizzes dictionary (guaranteed 10 questions)
    const staticQuiz = (allTopicQuizzes as Record<string, QuizQuestion[]>)[topicId];
    if (staticQuiz && Array.isArray(staticQuiz) && staticQuiz.length === 10) {
      setQuestions(staticQuiz);
      setLoading(false);
    } else {
      setLoading(true);
    }

    // 3. Query existing completed quiz attempt to restore state on mount / refresh
    api.getLatestQuizAttempt(topicId)
      .then(attRes => {
        if (!isMounted) return;
        if (isSubmittingRef.current || isCompletedRef.current) return;
        if (Object.keys(selectedAnswersRef.current).length > 0) return;

        if (attRes && attRes.has_attempt && attRes.attempt) {
          const att = attRes.attempt;
          const restoredReview = Array.isArray(att.review) ? att.review : [];
          const restoredCorrect = typeof att.correct_count === 'number'
            ? att.correct_count
            : (typeof att.score === 'number' && att.score <= (att.total_questions || 10) ? Math.round(att.score) : 0);
          const restoredPct = typeof att.percentage === 'number'
            ? Math.round(att.percentage)
            : (typeof att.score === 'number' && att.score <= 100 ? Math.round(att.score) : 0);

          setScore(restoredCorrect);
          if (att.adaptive_feedback) {
            setAdaptiveFeedback(att.adaptive_feedback);
          }
          setSubmissionResult({
            attempt_id: att.id,
            score: att.score,
            percentage: restoredPct,
            correct_count: restoredCorrect,
            incorrect_count: att.incorrect_count,
            total_questions: att.total_questions || 10,
            passed: att.passed,
            review: restoredReview,
            adaptive_feedback: att.adaptive_feedback,
            concept_profile: att.concept_profile,
            concept_updates: att.concept_updates || []
          });
          setIsCompleted(true);
          setLoading(false);
        }
      })
      .catch(err => {
        console.warn('Could not load latest quiz attempt:', err);
      });

    // 4. Always request calibrated 10-question quiz from backend API
    api.getTopicQuiz(topicId)
      .then(data => {
        const qList = Array.isArray(data)
          ? data
          : (data && Array.isArray(data.questions) ? data.questions : []);
        if (isMounted && !isCompletedRef.current && !isSubmittingRef.current) {
          if (qList.length === 10) {
            setQuestions(qList);
          } else if (qList.length > 0 && (!staticQuiz || staticQuiz.length < 10)) {
            setQuestions(qList.slice(0, 10));
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [topicId, initialQuestions]);

  const currentQ = questions[currentIndex];
  const isAnswered = selectedAnswers[currentIndex] !== undefined;
  const isSubmitted = submittedQuestions[currentIndex] === true;
  const correctIdx = currentQ
    ? (currentQ.correct_index !== undefined ? currentQ.correct_index : currentQ.correctIndex ?? 0)
    : 0;
  const isCorrect = isSubmitted && selectedAnswers[currentIndex] === correctIdx;

  const submittedCount = Object.keys(submittedQuestions).length;
  const isLastQuestion = questions.length > 0 && currentIndex === questions.length - 1;

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted || isCompleted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optIdx }));
  };

  const handleSubmitAnswer = () => {
    if (!isAnswered || isSubmitted || isCompleted || !currentQ) return;

    setSubmittedQuestions(prev => ({ ...prev, [currentIndex]: true }));
    const wasRight = selectedAnswers[currentIndex] === correctIdx;
    const newScore = wasRight ? score + 1 : score;
    if (wasRight) setScore(newScore);

    const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    // Telemetry micro-event
    telemetry.logEvent('IN_LESSON_QUIZ_ANSWER', timeSpent, {
      topic_id: topicId,
      question_id: currentQ.id,
      question_index: currentIndex + 1,
      is_correct: wasRight,
      difficulty: currentQ.difficulty
    });

    // Provide immediate cognitive signal
    if (!wasRight) {
      updateFromFeedback({
        confidence: 0.82,
        cognitive_level: 'MEDIUM',
        reason: `Learner answered question ${currentIndex + 1} of ${questions.length || 10} incorrectly. Concept clarification accessible.`,
        suggested_adaptation: 'Detailed explanation or everyday analogy may clarify this concept.',
        contributing_factors: ['Quiz question checkpoint attempt needing revision']
      });
    } else {
      updateFromFeedback({
        confidence: 0.92,
        cognitive_level: 'LOW',
        reason: `Solid grasp demonstrated on question ${currentIndex + 1} of ${questions.length || 10}.`,
        suggested_adaptation: 'Standard or accelerated pace is appropriate.',
        contributing_factors: ['Correct quiz answer validation on first attempt']
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinishQuiz = async () => {
    if (isSubmittingFinal) return; // Prevent duplicate submissions
    setIsSubmittingFinal(true);
    const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    // Map answers by question ID and index
    const answerPayload: Record<string, number> = {};
    const presentedQuestionIds: string[] = [];
    questions.forEach((q, idx) => {
      presentedQuestionIds.push(q.id);
      if (selectedAnswers[idx] !== undefined) {
        answerPayload[q.id] = selectedAnswers[idx];
        answerPayload[String(idx)] = selectedAnswers[idx];
      }
    });

    try {
      const res = await api.submitTopicQuiz(
        topicId,
        answerPayload,
        timeSpent,
        submissionIdRef.current,
        {
          quizType: quizType || 'mastery',
          questionIds: presentedQuestionIds,
          detailLevel: detailLevel
        }
      );
      if (res) {
        setSubmissionResult(res);
      }
      if (res && res.adaptive_feedback) {
        setAdaptiveFeedback(res.adaptive_feedback);
        updateFromFeedback(res.adaptive_feedback);
      }
      if (res && res.mastery) {
        window.dispatchEvent(new CustomEvent('mastery_updated', { detail: res.mastery }));
      }
      setIsCompleted(true);
      if (onQuizSubmitted) {
        onQuizSubmitted();
      }
      const finalPct = Math.round((score / (questions.length || 10)) * 100);
      if (finalPct >= 70) {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.warn('Could not submit quiz results to backend API:', err);
      setIsCompleted(true);
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  const handleRestart = async () => {
    submissionIdRef.current = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setSelectedAnswers({});
    setSubmittedQuestions({});
    setScore(0);
    setCurrentIndex(0);
    setIsCompleted(false);
    setAdaptiveFeedback(null);
    setSubmissionResult(null);
    setStartTime(Date.now());

    // On intentional retake, fetch a fresh attempt-unique question set from API
    try {
      setLoading(true);
      const freshQuiz = await api.getTopicQuiz(topicId, {
        refresh: true,
        quizType: quizType || 'mastery',
        detailLevel
      });
      if (freshQuiz && Array.isArray(freshQuiz.questions) && freshQuiz.questions.length === 10) {
        setQuestions(freshQuiz.questions);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('[InLessonQuiz] Fresh quiz fetch notice:', e);
    }

    // Fallback: adopt initialQuestions or static 10-question bank
    if (quizType === 'comprehension_check' && initialQuestions && Array.isArray(initialQuestions) && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
      setLoading(false);
    } else if (initialQuestions && Array.isArray(initialQuestions) && initialQuestions.length === 10) {
      setQuestions(initialQuestions);
      setLoading(false);
    } else {
      const staticQuiz = (allTopicQuizzes as Record<string, QuizQuestion[]>)[topicId];
      if (staticQuiz && Array.isArray(staticQuiz) && staticQuiz.length === 10) {
        setQuestions(staticQuiz);
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-slate-800 light-theme:border-slate-300 bg-slate-900/40 text-center text-xs text-slate-500 animate-pulse">
        Loading topic quiz questions...
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return null;
  }

  // --- FINAL RESULTS VIEW ---
  if (isCompleted) {
    const totalQuestions = submissionResult?.total_questions || questions.length || 10;
    const finalPct = typeof submissionResult?.percentage === 'number'
      ? Math.round(submissionResult.percentage)
      : (typeof submissionResult?.score === 'number' && submissionResult.score <= 100
        ? Math.round(submissionResult.score)
        : Math.round((score / totalQuestions) * 100));
    const finalCorrectCount = typeof submissionResult?.correct_count === 'number'
      ? submissionResult.correct_count
      : (typeof submissionResult?.score === 'number' && submissionResult.score <= totalQuestions
        ? Math.round(submissionResult.score)
        : score);
    const passed = typeof submissionResult?.passed === 'boolean'
      ? submissionResult.passed
      : finalPct >= 70;
    const incorrectCount = typeof submissionResult?.incorrect_count === 'number'
      ? submissionResult.incorrect_count
      : totalQuestions - finalCorrectCount;

    // Derive review list for corrective practice
    const reviewList: CorrectivePracticeQuestion[] = (
      submissionResult?.review && submissionResult.review.length > 0
        ? submissionResult.review
        : questions.map((q, qIdx) => {
            const qCorrect = q.correct_index !== undefined ? q.correct_index : q.correctIndex ?? 0;
            const userChoice = selectedAnswers[qIdx] !== undefined ? selectedAnswers[qIdx] : null;
            return {
              id: q.id,
              question: q.question,
              options: q.options,
              correct_index: qCorrect,
              user_choice: userChoice,
              is_correct: userChoice === qCorrect,
              explanation: q.explanation,
              difficulty: q.difficulty
            };
          })
    );

    const incorrectQuestions = reviewList.filter(r => !r.is_correct);

    return (
      <div
        id="section-mini-quiz"
        className="rounded-2xl border border-purple-500/30 light-theme:border-purple-200 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950 light-theme:bg-white p-5 sm:p-7 shadow-lg space-y-6 animate-pop-in"
      >
        {/* Celebration Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 light-theme:border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              passed
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            }`}>
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white light-theme:text-slate-900">
                  Quiz Completed!
                </h3>
                <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  passed
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {passed ? 'Passed (≥ 70%)' : 'Review Recommended'}
                </span>
              </div>
              <p className="text-xs text-slate-400 light-theme:text-slate-600 mt-0.5">
                Here is your performance breakdown and personalized adaptive recommendations.
              </p>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="px-4 py-2 rounded-xl border border-slate-700 light-theme:border-slate-300 hover:bg-slate-800 light-theme:hover:bg-slate-100 text-slate-300 light-theme:text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Quiz</span>
          </button>
        </div>

        {/* 4 Score Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl border border-slate-800 light-theme:border-slate-200 bg-slate-950/60 light-theme:bg-slate-50 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Final Score</span>
            <div className="text-2xl font-black text-white light-theme:text-slate-900 font-mono">
              {finalCorrectCount} <span className="text-xs text-slate-500 font-normal">/ {totalQuestions}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 light-theme:border-slate-200 bg-slate-950/60 light-theme:bg-slate-50 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Percentage</span>
            <div className={`text-2xl font-black font-mono ${passed ? 'text-emerald-400' : 'text-amber-400'}`}>
              {finalPct}%
            </div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 light-theme:bg-emerald-50/50 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Correct
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {finalCorrectCount}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 light-theme:bg-rose-50/50 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Incorrect
            </span>
            <div className="text-2xl font-black text-rose-400 font-mono">
              {incorrectCount}
            </div>
          </div>
        </div>

        {/* AI-Generated Adaptive Feedback Card */}
        <div className="p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 light-theme:bg-purple-50/70 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 light-theme:text-purple-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 light-theme:text-purple-900">
                AI Cognitive Feedback & Recommendations
              </h4>
            </div>
            {adaptiveFeedback?.cognitive_load && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Cognitive Load: {adaptiveFeedback.cognitive_load}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-300 light-theme:text-slate-700 leading-relaxed">
            {adaptiveFeedback?.personalized_summary || (
              passed
                ? `Outstanding work! You solved ${finalCorrectCount} of ${totalQuestions} questions correctly. Your mastery of this topic is solid.`
                : `You answered ${finalCorrectCount} of ${totalQuestions} questions correctly. We have analyzed the questions you missed and recommended concepts to review.`
            )}
          </p>

          {/* Concepts to Revise */}
          {adaptiveFeedback?.revision_concepts && adaptiveFeedback.revision_concepts.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-purple-500/20">
              <span className="text-[11px] font-semibold text-purple-300 light-theme:text-purple-800 uppercase tracking-wide">
                Key Concepts to Revise:
              </span>
              <div className="flex flex-wrap gap-2">
                {adaptiveFeedback.revision_concepts.map((concept: string, cIdx: number) => (
                  <span
                    key={cIdx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/80 light-theme:bg-white text-slate-300 light-theme:text-slate-800 border border-purple-500/20"
                  >
                    • {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Adaptive Actions (Learner Control) */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setContentModeManually('SIMPLIFIED');
                const el = document.getElementById('section-concept');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5"
            >
              <span>Switch to Simplified Explanation</span>
            </button>

            <button
              onClick={() => {
                setContentModeManually('DETAILED');
                const el = document.getElementById('section-concept');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all flex items-center gap-1.5"
            >
              <span>Switch to Detailed Explanation</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('section-try-yourself') || document.getElementById('section-code-example');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5"
            >
              <span>Practice in Sandbox</span>
            </button>

            <button
              onClick={handleRestart}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>

        {/* Concept Mastery State Progress Badges */}
        {((submissionResult?.concept_updates && submissionResult.concept_updates.length > 0) ||
          (submissionResult?.concept_profile?.concepts && submissionResult.concept_profile.concepts.length > 0)) && (
          <div className="p-4 rounded-xl border border-slate-800 light-theme:border-slate-200 bg-slate-950/50 light-theme:bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 light-theme:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Concept Knowledge State Progression
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Mistake-Based Tracking</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(submissionResult?.concept_updates && submissionResult.concept_updates.length > 0
                ? submissionResult.concept_updates
                : (submissionResult?.concept_profile?.concepts || [])
              ).map((cu: any, cuIdx: number) => {
                const kState = cu.knowledge_state || 'LEARNING';
                const badgeColor = kState === 'MASTERED'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : kState === 'LEARNING'
                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30';
                return (
                  <span
                    key={cuIdx}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border ${badgeColor} flex items-center gap-1.5`}
                  >
                    <span className="text-slate-300 light-theme:text-slate-700 font-sans">
                      {cu.concept || cu.concept_id}:
                    </span>
                    <strong className="font-bold uppercase">{kState}</strong>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* MEMBER 4: TARGETED CORRECTIVE PRACTICE UI */}
        <CorrectivePracticeSection
          topicId={topicId}
          originalScore={finalCorrectCount}
          originalTotal={totalQuestions}
          originalPercentage={finalPct}
          originalAttemptId={submissionResult?.attempt_id}
          incorrectQuestions={incorrectQuestions}
          revisionConcepts={adaptiveFeedback?.revision_concepts || []}
          conceptUpdates={submissionResult?.concept_updates}
          conceptProfile={submissionResult?.concept_profile}
        />

        {/* Accordion / Full Review Section */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => setShowFullReview(!showFullReview)}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-800 light-theme:border-slate-200 bg-slate-950/60 light-theme:bg-slate-50 hover:bg-slate-900 transition-all text-xs font-bold text-slate-300 light-theme:text-slate-800"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Review All 10 Questions and Explanations</span>
            </div>
            {showFullReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFullReview && (
            <div className="space-y-3 pt-2">
              {questions.map((q, qIdx) => {
                const qCorrect = q.correct_index !== undefined ? q.correct_index : q.correctIndex ?? 0;
                const userChoice = selectedAnswers[qIdx];
                const wasCorrect = userChoice === qCorrect;

                return (
                  <div
                    key={q.id || qIdx}
                    className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all ${
                      wasCorrect
                        ? 'border-emerald-500/30 bg-emerald-950/10 light-theme:bg-emerald-50/40'
                        : 'border-rose-500/30 bg-rose-950/10 light-theme:bg-rose-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-400 text-[11px]">
                          Question {qIdx + 1} of 10
                        </span>
                        {q.difficulty && (
                          <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                            q.difficulty === 'easy'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : q.difficulty === 'hard'
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}>
                            {q.difficulty}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 font-bold text-xs">
                        {wasCorrect ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="font-semibold text-slate-200 light-theme:text-slate-900 leading-relaxed whitespace-pre-line">
                      {q.question}
                    </p>

                    {/* Options list */}
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isUserSelected = userChoice === optIdx;
                        const isCorrectAnswer = qCorrect === optIdx;

                        let optBadgeClass = 'border-slate-800 light-theme:border-slate-200 bg-slate-950/40 text-slate-400';
                        if (isCorrectAnswer) {
                          optBadgeClass = 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold';
                        } else if (isUserSelected && !isCorrectAnswer) {
                          optBadgeClass = 'border-rose-500 bg-rose-950/40 text-rose-300 line-through';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${optBadgeClass}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 font-mono text-[9px] flex items-center justify-center shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{renderFormattedText(opt)}</span>
                            </div>
                            {isCorrectAnswer && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            {isUserSelected && !isCorrectAnswer && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-2.5 rounded-lg bg-slate-950/60 light-theme:bg-slate-50 border border-slate-800 text-[11px] leading-relaxed text-slate-300 light-theme:text-slate-700">
                      <strong>Why:</strong> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- ACTIVE QUIZ QUESTION VIEW ---
  return (
    <div
      id="section-mini-quiz"
      className="rounded-2xl border border-slate-800 light-theme:border-slate-300 bg-slate-900/60 light-theme:bg-white p-5 sm:p-6 shadow-sm space-y-4"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 light-theme:border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 light-theme:bg-purple-100 light-theme:text-purple-700 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white light-theme:text-slate-900 flex items-center gap-2">
              <span>{quizType === 'comprehension_check' ? 'Knowledge Check' : quizType === 'adapted' ? 'Adapted Mastery Quiz' : 'Lesson Mastery Quiz'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 light-theme:bg-purple-100 light-theme:text-purple-700 border border-purple-500/20">
                Question {currentIndex + 1} of {questions.length}
              </span>
              {currentQ.difficulty && (
                <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                  currentQ.difficulty === 'easy'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : currentQ.difficulty === 'hard'
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                }`}>
                  {currentQ.difficulty}
                </span>
              )}
            </h3>

            {/* 10-Question Progress Indicator */}
            <div className="flex items-center gap-1.5 mt-1.5">
              {questions.map((_, idx) => {
                const isCurrent = idx === currentIndex;
                const isSub = submittedQuestions[idx];
                const cIdx = questions[idx].correct_index !== undefined ? questions[idx].correct_index : questions[idx].correctIndex;
                const wasCorrect = isSub && selectedAnswers[idx] === cIdx;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    title={`Question ${idx + 1}${isSub ? (wasCorrect ? ' (Correct)' : ' (Incorrect)') : ''}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? 'w-5 bg-purple-400 shadow-sm shadow-purple-500/50'
                        : isSub
                        ? wasCorrect
                          ? 'w-2 bg-emerald-400'
                          : 'w-2 bg-rose-400'
                        : 'w-1.5 bg-slate-700 light-theme:bg-slate-300 hover:bg-slate-500'
                    }`}
                  />
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 light-theme:text-slate-600 mt-0.5">
              Test your understanding and receive instant adaptive feedback
            </p>
          </div>
        </div>

        {/* Current Score Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-300 light-theme:text-slate-700">
            Score: {score}/{submittedCount > 0 ? submittedCount : questions.length}
          </span>
          <button
            onClick={handleRestart}
            className="p-1 rounded-lg hover:bg-slate-800 light-theme:hover:bg-slate-100 text-slate-400 transition-colors"
            title="Retake Quiz"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Question Card */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-100 light-theme:text-slate-900 leading-relaxed whitespace-pre-line">
          {renderFormattedText(currentQ.question)}
        </p>

        {/* Four Selectable Options */}
        <div className="space-y-2">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = selectedAnswers[currentIndex] === optIdx;
            const isCorrectOption = correctIdx === optIdx;

            let optionStyle =
              'border-slate-800 light-theme:border-slate-300 bg-slate-950/70 light-theme:bg-slate-50 text-slate-300 light-theme:text-slate-800 hover:border-slate-700';

            if (isSubmitted) {
              if (isCorrectOption) {
                optionStyle =
                  'border-emerald-500 bg-emerald-950/40 light-theme:bg-emerald-50 text-emerald-300 light-theme:text-emerald-900 font-bold animate-pop-in';
              } else if (isSelected && !isCorrectOption) {
                optionStyle =
                  'border-rose-500 bg-rose-950/40 light-theme:bg-rose-50 text-rose-300 light-theme:text-rose-900 line-through opacity-80 animate-shake';
              }
            } else if (isSelected) {
              optionStyle =
                'border-cyan-500 bg-cyan-950/40 light-theme:bg-blue-50 text-cyan-300 light-theme:text-blue-800 font-bold ring-1 ring-cyan-500/40';
            }

            return (
              <button
                key={optIdx}
                disabled={isSubmitted}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] shrink-0 ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 light-theme:bg-slate-200 text-slate-400'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{opt}</span>
                </div>

                {isSubmitted && isCorrectOption && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                {isSubmitted && isSelected && !isCorrectOption && (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Validation and Explanation Feedback */}
        {isSubmitted && (
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              isCorrect
                ? 'bg-emerald-950/20 light-theme:bg-emerald-50 border-emerald-500/30 text-emerald-300 light-theme:text-emerald-900 animate-pop-in'
                : 'bg-rose-950/20 light-theme:bg-rose-50 border-rose-500/30 text-rose-300 light-theme:text-rose-900 animate-shake'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Not quite.</span>
                </>
              )}
            </div>
            <p className="text-slate-300 light-theme:text-slate-700">
              <strong>Why:</strong> {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Action Button Row */}
        <div className="flex items-center justify-between pt-2">
          {/* Previous Button */}
          <button
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className="px-3.5 py-1.5 rounded-lg border border-slate-800 light-theme:border-slate-300 hover:bg-slate-800 light-theme:hover:bg-slate-100 disabled:opacity-40 text-xs text-slate-300 light-theme:text-slate-700 font-medium flex items-center gap-1 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {!isSubmitted ? (
            <button
              disabled={!isAnswered}
              onClick={handleSubmitAnswer}
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all"
            >
              Submit Answer
            </button>
          ) : !isLastQuestion ? (
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinishQuiz}
              disabled={isSubmittingFinal}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all animate-pulse"
            >
              <Award className="w-4 h-4" />
              <span>{isSubmittingFinal ? 'Evaluating...' : 'Finish Quiz'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
