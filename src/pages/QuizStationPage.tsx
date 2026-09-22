import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useCognitive } from '../context/CognitiveContext';
import { api } from '../services/api';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Terminal,
  Zap
} from 'lucide-react';
import { BookmarkButton } from '../components/BookmarkButton';
import { TopicLearningStepper } from '../components/TopicLearningStepper';

interface QuizStationProps {
  topicId: string;
  onBackToLesson: () => void;
  onGoToCoding: () => void;
  onNextTopic?: () => void;
}

export const QuizStationPage: React.FC<QuizStationProps> = ({
  topicId,
  onBackToLesson,
  onGoToCoding,
  onNextTopic
}) => {
  const { updateFromFeedback } = useCognitive();
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [adaptiveInfo, setAdaptiveInfo] = useState<{
    target_difficulty?: string;
    adaptive_note?: string;
    consecutive_correct?: number;
    consecutive_wrong?: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      try {
        const data = await api.getTopicQuiz(topicId);
        const questionList = Array.isArray(data) ? data : (data.questions || []);
        setQuestions(questionList);
        if (data && data.target_difficulty) {
          setAdaptiveInfo({
            target_difficulty: data.target_difficulty,
            adaptive_note: data.adaptive_note,
            consecutive_correct: data.consecutive_correct,
            consecutive_wrong: data.consecutive_wrong
          });
        }
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [topicId]);

  // Quiz timer
  useEffect(() => {
    if (result) return;
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [result]);

  const handleSelectOption = (questionId: string, optIndex: number) => {
    if (result) return; // Prevent change after submit
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optIndex
    }));
  };

  const handleSubmit = async () => {
    if (submitting || Object.keys(selectedAnswers).length === 0) return;
    setSubmitting(true);

    try {
      const res = await api.submitTopicQuiz(topicId, selectedAnswers, timeSpent);
      setResult(res);

      if (res.adaptive_feedback) {
        updateFromFeedback(res.adaptive_feedback);
      }

      if (res.passed) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setResult(null);
    setTimeSpent(0);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <p className="text-sm">Loading quiz questions...</p>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-slate-400">
        <p>No questions registered for this topic.</p>
        <button
          onClick={onBackToLesson}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
        >
          Return to Lesson
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 3-STAGE LEARNING STEPPER: 1. Lesson -> 2. Quiz -> 3. Coding */}
      <TopicLearningStepper
        currentStep="quiz"
        topicId={topicId}
        onNavigateStep={(step) => {
          if (step === 'lesson') onBackToLesson();
          if (step === 'coding') onGoToCoding();
        }}
        onBackToCurriculum={onBackToLesson}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-fade-in">
        {/* Quiz Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                Step 2 of 3 • Practice Quiz
              </span>
              <button
                onClick={onBackToLesson}
                className="text-xs text-cyan-400 hover:underline inline-block"
              >
                ← Review Lesson
              </button>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-purple-400" />
              <span>Validate Lesson Concepts</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatTimer(timeSpent)}</span>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300">
              {Object.keys(selectedAnswers).length}/{questions.length} Answered
            </span>
          </div>
        </div>

        {/* Post-Submission Result Card */}
        {result && (
          <div
            className={`p-6 rounded-3xl border mb-8 shadow-2xl backdrop-blur-md animate-fade-in ${
              result.passed
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {result.passed ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-400" />
                )}
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    {result.passed ? 'Quiz Passed! Ready for Coding Challenge 🎉' : 'Needs Review Before Advancing'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    You scored <strong>{result.score}%</strong> ({result.correct_count}/{result.total_questions} correct).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRetake}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>

                <button
                  onClick={onGoToCoding}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <span>Step 3: Solve Coding Challenge</span>
                  <Terminal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          {/* Adaptive Feedback Insight */}
          {result.adaptive_feedback && (
            <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white">Adaptive Recommendation:</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                  {result.adaptive_feedback.recommended_action}
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {result.adaptive_feedback.reason}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Difficulty Adjustment Banner (Section 55 & 56) */}
      {adaptiveInfo.target_difficulty && !result && (
        <div className="mb-6 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Dynamic Quiz Engine:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                  adaptiveInfo.target_difficulty === 'hard'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : adaptiveInfo.target_difficulty === 'easy'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {adaptiveInfo.target_difficulty} Tier
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {adaptiveInfo.adaptive_note}
              </p>
            </div>
          </div>

          {adaptiveInfo.consecutive_correct && adaptiveInfo.consecutive_correct > 0 ? (
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold flex items-center gap-1.5">
              <span>🔥</span>
              <span>{adaptiveInfo.consecutive_correct} Streak</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Question Cards */}
      <div className="space-y-6">
        {(result ? result.review : questions).map((q: any, idx: number) => {
          const selected = selectedAnswers[q.id];
          const isSubmitted = !!result;

          return (
            <div
              key={q.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  Question {idx + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] uppercase font-mono text-slate-400">
                    {q.difficulty}
                  </span>
                  <BookmarkButton
                    itemType="question"
                    itemId={q.id}
                    title={`Question: ${q.question.slice(0, 45)}...`}
                    snippet={q.options ? q.options.join(' | ') : q.question}
                    topicId={topicId}
                    language="python"
                  />
                </div>
              </div>

              <p className="text-sm font-semibold text-white mb-4 leading-relaxed">
                {q.question}
              </p>

              <div className="space-y-2.5">
                {q.options.map((opt: string, optIdx: number) => {
                  let optStyle = 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700';

                  if (isSubmitted) {
                    if (optIdx === q.correct_index) {
                      optStyle = 'border-emerald-500/60 bg-emerald-950/30 text-emerald-200 font-semibold';
                    } else if (selected === optIdx && !q.is_correct) {
                      optStyle = 'border-rose-500/60 bg-rose-950/30 text-rose-200';
                    }
                  } else if (selected === optIdx) {
                    optStyle = 'border-cyan-500 bg-cyan-950/30 text-cyan-200 font-semibold shadow-md shadow-cyan-500/10';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isSubmitted && optIdx === q.correct_index && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {isSubmitted && selected === optIdx && !q.is_correct && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isSubmitted && q.explanation && (
                <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
                  <strong className="text-slate-300 block mb-0.5">Explanation:</strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Bar */}
      {!result && (
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onBackToLesson}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel & Return
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(selectedAnswers).length === 0}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            <span>{submitting ? 'Evaluating with AI Engine...' : 'Submit Answers'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
      </div>
    </div>
  );
};
