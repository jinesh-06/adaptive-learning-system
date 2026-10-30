import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  AlertCircle,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Check,
  RefreshCw
} from 'lucide-react';
import {
  api,
  CorrectivePracticeQuestion,
  CorrectivePracticeSubmission,
  CorrectivePracticeResult
} from '../../services/api';
import { telemetry } from '../../services/telemetry';
import { renderFormattedText } from '../../utils/textFormatter';

export interface CorrectivePracticeSectionProps {
  topicId: string;
  originalScore: number;
  originalTotal: number;
  originalPercentage: number;
  originalAttemptId?: string;
  incorrectQuestions: CorrectivePracticeQuestion[];
  revisionConcepts?: string[];
  onPracticeCompleted?: (practiceScore: number, totalQuestions: number) => void;
  onResetPractice?: () => void;
}

export const CorrectivePracticeSection: React.FC<CorrectivePracticeSectionProps> = ({
  topicId,
  originalScore,
  originalTotal,
  originalPercentage,
  originalAttemptId,
  incorrectQuestions,
  revisionConcepts = [],
  onPracticeCompleted,
  onResetPractice
}) => {
  // Practice state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [practiceResult, setPracticeResult] = useState<CorrectivePracticeResult | null>(null);
  const [startTime] = useState<number>(Date.now());

  // Helper to extract concept name for a question
  const getConceptForQuestion = (q: CorrectivePracticeQuestion, index: number): string => {
    if (q.concept && q.concept.trim()) return q.concept.trim();
    if (revisionConcepts && revisionConcepts[index]) return revisionConcepts[index];
    const text = q.question || '';
    if (text.includes(':')) return text.split(':')[0].trim();
    if (text.includes('?')) return text.split('?')[0].trim().slice(0, 45);
    return `Concept Checkpoint ${index + 1}`;
  };

  // Check individual question
  const handleSelectOption = (questionId: string, optIdx: number) => {
    if (checkedQuestions[questionId]) return; // locked once checked until retry
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optIdx }));
  };

  const handleCheckQuestion = (questionId: string) => {
    if (selectedAnswers[questionId] === undefined) return;
    setCheckedQuestions(prev => ({ ...prev, [questionId]: true }));
  };

  const handleRetryQuestion = (questionId: string) => {
    setCheckedQuestions(prev => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setSelectedAnswers(prev => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  // Submit all completed practice questions
  const handleSubmitAllPractice = async () => {
    if (isSubmitting || incorrectQuestions.length === 0) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const payload: CorrectivePracticeSubmission = {
      topic_id: topicId,
      original_attempt_id: originalAttemptId,
      answers: selectedAnswers,
      time_spent_seconds: timeSpent
    };

    try {
      const res = await api.submitCorrectivePractice(payload);
      if (res && res.success) {
        setPracticeResult(res);
        if (onPracticeCompleted) {
          onPracticeCompleted(res.practice_score, res.total_practice_questions);
        }
        telemetry.logEvent('CORRECTIVE_PRACTICE_SUBMITTED', timeSpent, {
          topic_id: topicId,
          original_attempt_id: originalAttemptId,
          practice_score: res.practice_score,
          total_questions: res.total_practice_questions
        });
      } else {
        setSubmitError('Unable to record practice session. Please try again.');
      }
    } catch (err: any) {
      console.warn('Corrective practice submission failed:', err);
      setSubmitError(err?.message || 'Network error recording practice session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset practice session
  const handleReset = () => {
    setSelectedAnswers({});
    setCheckedQuestions({});
    setPracticeResult(null);
    setSubmitError(null);
    if (onResetPractice) {
      onResetPractice();
    }
  };

  // EMPTY STATE: 100% Score on Original Quiz
  if (!incorrectQuestions || incorrectQuestions.length === 0) {
    return (
      <div
        id="section-corrective-practice"
        className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 light-theme:bg-emerald-50/60 p-6 sm:p-7 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white light-theme:text-slate-900 flex items-center gap-2">
              <span>No Corrective Practice Needed!</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Mastery
              </span>
            </h4>
            <p className="text-xs text-slate-300 light-theme:text-slate-600 mt-1">
              Outstanding work! You solved all {originalTotal} quiz questions correctly on your initial attempt. Your original score of {originalPercentage}% has been recorded into your mastery profile.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3 text-xs text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>All topic objectives and conceptual checkpoints verified.</span>
        </div>
      </div>
    );
  }

  // Calculate local progress
  const answeredCount = Object.keys(checkedQuestions).length;
  const correctCount = incorrectQuestions.filter(q => {
    if (!checkedQuestions[q.id]) return false;
    const choice = selectedAnswers[q.id];
    const correctIdx = q.correct_index !== undefined ? q.correct_index : 0;
    return choice === correctIdx;
  }).length;
  const isAllAnswered = answeredCount === incorrectQuestions.length;

  return (
    <div
      id="section-corrective-practice"
      className="rounded-2xl border border-cyan-500/30 light-theme:border-cyan-200 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950 light-theme:bg-white p-5 sm:p-7 shadow-lg space-y-6 animate-pop-in"
    >
      {/* 1. Header with Preserved Original Baseline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 light-theme:border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white light-theme:text-slate-900">
                Targeted Corrective Practice
              </h3>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {incorrectQuestions.length} Misconception{incorrectQuestions.length === 1 ? '' : 's'} Identified
              </span>
            </div>
            <p className="text-xs text-slate-400 light-theme:text-slate-600 mt-0.5">
              Review and resolve the questions you missed. This targeted session strengthens your understanding without altering your original quiz results.
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-1.5 rounded-xl border border-slate-700 light-theme:border-slate-300 hover:bg-slate-800 light-theme:hover:bg-slate-100 text-slate-300 light-theme:text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Practice</span>
        </button>
      </div>

      {/* 2. Original Score vs. Practice Session Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Preserved Original Assessment Card */}
        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 light-theme:bg-purple-50/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-300 light-theme:text-purple-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Original Assessment Baseline
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30">
              Preserved
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white light-theme:text-slate-900 font-mono">
              {originalScore} <span className="text-xs text-slate-400 font-normal">/ {originalTotal}</span>
            </span>
            <span className="text-xs font-mono font-bold text-purple-400">
              ({originalPercentage}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 light-theme:text-slate-600">
            Recorded baseline score. This metric is immutable and permanently tracks your initial diagnostic attempt.
          </p>
        </div>

        {/* Current Practice Progress Card */}
        <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 light-theme:bg-cyan-50/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300 light-theme:text-cyan-800 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Corrective Practice Status
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">
              {practiceResult ? 'Submitted' : 'In Progress'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-400 font-mono">
              {correctCount} <span className="text-xs text-slate-400 font-normal">/ {incorrectQuestions.length}</span>
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              Resolved ({Math.round((correctCount / incorrectQuestions.length) * 100)}%)
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(correctCount / incorrectQuestions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Error Banner if submission fails */}
      {submitError && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{submitError}</span>
          </div>
          <button
            onClick={handleSubmitAllPractice}
            className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[11px] font-semibold transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. Incorrect Questions Practice List */}
      <div className="space-y-4 pt-1">
        {incorrectQuestions.map((q, idx) => {
          const qId = q.id;
          const conceptTitle = getConceptForQuestion(q, idx);
          const isChecked = !!checkedQuestions[qId];
          const selectedChoice = selectedAnswers[qId];
          const correctIdx = q.correct_index !== undefined ? q.correct_index : 0;
          const isRight = isChecked && selectedChoice === correctIdx;
          const originalUserChoice = q.user_choice;

          return (
            <div
              key={qId || idx}
              className={`p-4 sm:p-5 rounded-xl border transition-all text-xs space-y-3.5 ${
                isChecked
                  ? isRight
                    ? 'border-emerald-500/40 bg-emerald-950/15 light-theme:bg-emerald-50/40'
                    : 'border-rose-500/40 bg-rose-950/15 light-theme:bg-rose-50/40'
                  : 'border-slate-800 light-theme:border-slate-200 bg-slate-950/50 light-theme:bg-slate-50'
              }`}
            >
              {/* Question Header & Diagnosed Concept */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 light-theme:border-slate-200 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-slate-400 text-[11px]">
                    Practice Checkpoint {idx + 1} of {incorrectQuestions.length}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 light-theme:bg-purple-100 light-theme:text-purple-800 border border-purple-500/20 font-semibold">
                    Concept: {conceptTitle}
                  </span>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  {isChecked ? (
                    isRight ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Concept Corrected
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Still Needs Review
                      </span>
                    )
                  ) : (
                    <span className="text-amber-400/90 flex items-center gap-1 text-[11px] font-medium">
                      <BookOpen className="w-3.5 h-3.5" /> Action Required
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <p className="font-semibold text-slate-100 light-theme:text-slate-900 leading-relaxed text-sm whitespace-pre-line">
                {q.question}
              </p>

              {/* Original User Choice Callout */}
              {originalUserChoice !== null && originalUserChoice !== undefined && (
                <div className="px-3 py-2 rounded-lg bg-rose-950/30 light-theme:bg-rose-50 border border-rose-500/20 text-[11px] text-rose-300 light-theme:text-rose-800 flex items-center justify-between">
                  <span>
                    <strong>Initial Assessment Mistake:</strong> You selected Option {String.fromCharCode(65 + originalUserChoice)} (Incorrect)
                  </span>
                  <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">Diagnosed Gap</span>
                </div>
              )}

              {/* Practice Options */}
              <div className="space-y-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedChoice === optIdx;
                  const isCorrectAnswer = correctIdx === optIdx;

                  let optClass = 'border-slate-800 light-theme:border-slate-200 bg-slate-900/60 light-theme:bg-white text-slate-300 light-theme:text-slate-700 hover:border-slate-700 cursor-pointer';

                  if (isChecked) {
                    if (isCorrectAnswer) {
                      optClass = 'border-emerald-500 bg-emerald-950/40 light-theme:bg-emerald-50 text-emerald-300 font-bold';
                    } else if (isSelected && !isCorrectAnswer) {
                      optClass = 'border-rose-500 bg-rose-950/40 light-theme:bg-rose-50 text-rose-300 line-through';
                    } else {
                      optClass = 'border-slate-800/60 text-slate-500 opacity-60';
                    }
                  } else if (isSelected) {
                    optClass = 'border-cyan-500 bg-cyan-950/30 text-cyan-200 font-semibold ring-1 ring-cyan-500/50';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isChecked}
                      onClick={() => handleSelectOption(qId, optIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all ${optClass}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full font-mono text-[10px] flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-relaxed">{renderFormattedText(opt)}</span>
                      </div>
                      {isChecked && isCorrectAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {isChecked && isSelected && !isCorrectAnswer && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons for Question */}
              <div className="flex items-center justify-between pt-2">
                {!isChecked ? (
                  <button
                    type="button"
                    disabled={selectedChoice === undefined}
                    onClick={() => handleCheckQuestion(qId)}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Check Answer</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full justify-between">
                    <span className="text-[11px] font-medium text-slate-400">
                      {isRight ? '✓ Concept remediated successfully.' : 'Misconception persists. Re-read the explanation below.'}
                    </span>
                    {!isRight && (
                      <button
                        type="button"
                        onClick={() => handleRetryQuestion(qId)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Explanatory Pedagogical Feedback */}
              {isChecked && (
                <div className={`p-3 rounded-xl border text-[11px] leading-relaxed space-y-1 ${
                  isRight
                    ? 'border-emerald-500/20 bg-emerald-950/20 light-theme:bg-emerald-50 text-slate-200 light-theme:text-slate-800'
                    : 'border-rose-500/20 bg-rose-950/20 light-theme:bg-rose-50 text-slate-200 light-theme:text-slate-800'
                }`}>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    {isRight ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Concept Remediation Verified:
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Pedagogical Guidance:
                      </span>
                    )}
                  </div>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. Complete Practice Session Submission Action */}
      <div className="pt-3 border-t border-slate-800 light-theme:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-400 light-theme:text-slate-600">
          <span>{correctCount} of {incorrectQuestions.length} practice questions verified.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!isAllAnswered || isSubmitting}
            onClick={handleSubmitAllPractice}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white shadow-md transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Recording Session...</span>
              </>
            ) : (
              <>
                <Award className="w-3.5 h-3.5" />
                <span>Complete Corrective Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 6. Success Banner upon Complete Submission */}
      {practiceResult && (
        <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-cyan-200 text-xs space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-cyan-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Corrective Practice Completed Successfully!
            </span>
            <span className="font-mono text-[11px] bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
              Practice Score: {practiceResult.practice_score} / {practiceResult.total_practice_questions} ({practiceResult.practice_percentage}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-300 light-theme:text-slate-700 leading-relaxed">
            Your targeted practice session has been recorded. Your original assessment score of <strong>{originalScore}/{originalTotal} ({originalPercentage}%)</strong> remains preserved as your verified baseline.
          </p>
        </div>
      )}
    </div>
  );
};

