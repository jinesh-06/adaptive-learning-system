import React, { useState, useEffect } from 'react';
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
import { api } from '../../services/api';
import { telemetry } from '../../services/telemetry';
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
}

export const InLessonQuiz: React.FC<InLessonQuizProps> = ({
  topicId,
  initialQuestions
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

  // Load exactly 10 questions for the topic
  useEffect(() => {
    let isMounted = true;
    setCurrentIndex(0);
    setSelectedAnswers({});
    setSubmittedQuestions({});
    setScore(0);
    setIsCompleted(false);
    setAdaptiveFeedback(null);
    setStartTime(Date.now());

    // 1. If initialQuestions has exactly 10 questions, use it directly
    if (initialQuestions && Array.isArray(initialQuestions) && initialQuestions.length === 10) {
      setQuestions(initialQuestions);
      setLoading(false);
      return;
    }

    // 2. Immediate zero-latency fallback from allTopicQuizzes dictionary
    const staticQuiz = (allTopicQuizzes as Record<string, QuizQuestion[]>)[topicId];
    if (staticQuiz && Array.isArray(staticQuiz) && staticQuiz.length === 10) {
      setQuestions(staticQuiz);
      setLoading(false);
    } else {
      setLoading(true);
    }

    // 3. Always request calibrated 10-question quiz from backend API
    api.getTopicQuiz(topicId)
      .then(data => {
        const qList = Array.isArray(data)
          ? data
          : (data && Array.isArray(data.questions) ? data.questions : []);
        if (isMounted) {
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
        reason: `Learner answered question ${currentIndex + 1} of 10 incorrectly. Concept clarification accessible.`,
        suggested_adaptation: 'Detailed explanation or everyday analogy may clarify this concept.',
        contributing_factors: ['Quiz question checkpoint attempt needing revision']
      });
    } else {
      updateFromFeedback({
        confidence: 0.92,
        cognitive_level: 'LOW',
        reason: `Solid grasp demonstrated on question ${currentIndex + 1} of 10.`,
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
    setIsSubmittingFinal(true);
    const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    // Map answers by question ID and index
    const answerPayload: Record<string, number> = {};
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] !== undefined) {
        answerPayload[q.id] = selectedAnswers[idx];
        answerPayload[String(idx)] = selectedAnswers[idx];
      }
    });

    try {
      const res = await api.submitTopicQuiz(topicId, answerPayload, timeSpent);
      if (res && res.adaptive_feedback) {
        setAdaptiveFeedback(res.adaptive_feedback);
        updateFromFeedback(res.adaptive_feedback);
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
    } finally {
      setIsSubmittingFinal(false);
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setSubmittedQuestions({});
    setScore(0);
    setCurrentIndex(0);
    setIsCompleted(false);
    setAdaptiveFeedback(null);
    setStartTime(Date.now());
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
    const totalQuestions = questions.length;
    const finalPct = Math.round((score / totalQuestions) * 100);
    const passed = finalPct >= 70;
    const incorrectCount = totalQuestions - score;

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
              {score} <span className="text-xs text-slate-500 font-normal">/ {totalQuestions}</span>
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
              {score}
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
                ? `Outstanding work! You solved ${score} of ${totalQuestions} questions correctly. Your mastery of this topic is solid.`
                : `You answered ${score} of ${totalQuestions} questions correctly. We have analyzed the questions you missed and recommended concepts to review.`
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
                              <span>{opt}</span>
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
              <span>Mini Quiz</span>
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
          {currentQ.question}
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
