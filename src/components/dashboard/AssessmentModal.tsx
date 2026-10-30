import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Award
} from 'lucide-react';
import { api, AssessmentQuestion, AssessmentSubmissionResult } from '../../services/api';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  topicTitle: string;
  assessmentType: 'pre' | 'post';
  onCompleted?: () => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  onClose,
  topicId,
  topicTitle,
  assessmentType,
  onCompleted
}) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [result, setResult] = useState<AssessmentSubmissionResult | null>(null);
  const [startTime] = useState<number>(Date.now());

  useEffect(() => {
    if (!isOpen) {
      setResult(null);
      setSelectedAnswers({});
      setCurrentIdx(0);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedAnswers({});
    setCurrentIdx(0);

    api.getAssessmentQuestions(topicId, assessmentType)
      .then(data => {
        if (data && data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          setError('No assessment questions found for this topic.');
        }
      })
      .catch(err => {
        console.error('Failed to load assessment questions:', err);
        setError('Failed to load questions. Please check connection and retry.');
      })
      .finally(() => setLoading(false));
  }, [isOpen, topicId, assessmentType]);

  if (!isOpen) return null;

  const currentQ = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelectOption = (qId: string, optIdx: number) => {
    if (result) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    const durationSeconds = Math.max(5, Math.round((Date.now() - startTime) / 1000));

    try {
      const res = await api.submitAssessment(topicId, {
        assessment_type: assessmentType,
        answers: selectedAnswers,
        time_spent: durationSeconds
      });

      if (res && res.success) {
        setResult(res);
        if (onCompleted) onCompleted();
      } else {
        setError('Failed to process assessment submission.');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err?.message || 'Error submitting assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              assessmentType === 'pre'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {assessmentType === 'pre' ? 'Pre-Assessment' : 'Post-Assessment'}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
              {topicTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading && (
            <div className="py-16 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs">Preparing calibrated {assessmentType}-assessment questions...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Assessment Form (In Progress) */}
          {!loading && !result && questions.length > 0 && currentQ && (
            <div className="space-y-6">
              {/* Stepper / Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Question {currentIdx + 1} of {questions.length}</span>
                  <span className="font-mono text-cyan-400">{answeredCount}/{questions.length} answered</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {currentIdx + 1}
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                    {currentQ.question}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 shadow-md shadow-cyan-500/10'
                          : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-full border text-[11px] font-bold flex items-center justify-center ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                            : 'border-slate-700 text-slate-500'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results View */}
          {result && (
            <div className="space-y-6">
              {/* Score Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/30 border border-slate-800 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {assessmentType === 'pre' ? 'Pre-Assessment Complete!' : 'Post-Assessment Complete!'}
                </h3>
                <div className="flex items-center justify-center gap-4 text-sm font-mono mt-2">
                  <div className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300">
                    Score: <span className="font-bold text-white">{result.score} / {result.total_marks}</span>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 font-bold">
                    Accuracy: {result.accuracy}%
                  </div>
                </div>

                {/* Score Improvement Comparison (Feature 2 & 3) */}
                {result.comparison && (
                  <div className={`mt-4 p-4 rounded-xl border text-xs text-left ${
                    result.comparison.has_pre_assessment
                      ? (result.comparison.score_improvement ?? 0) >= 0
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <span>Learning Outcome Comparison</span>
                    </div>
                    <p className="leading-relaxed">{result.comparison.summary_text}</p>
                    {result.comparison.has_pre_assessment && (
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700/60 font-mono text-[11px]">
                        <div>Pre-Assessment: <span className="text-white">{result.comparison.pre_score}/{result.comparison.pre_total_marks} ({result.comparison.pre_accuracy}%)</span></div>
                        <div>Post-Assessment: <span className="text-white">{result.comparison.post_score}/{result.comparison.post_total_marks} ({result.comparison.post_accuracy}%)</span></div>
                        <div>Score Improvement: <span className="font-bold text-cyan-400">{result.comparison.score_improvement! > 0 ? '+' : ''}{result.comparison.score_improvement} marks</span></div>
                        <div>Pct-Point Improvement: <span className="font-bold text-emerald-400">{result.comparison.percentage_point_improvement! > 0 ? '+' : ''}{result.comparison.percentage_point_improvement}% pts</span></div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Detailed Question Review */}
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
                  Question Breakdown & Review
                </h4>
                <div className="space-y-3">
                  {result.review.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border text-xs ${
                        item.is_correct
                          ? 'bg-emerald-950/10 border-emerald-500/30 text-slate-300'
                          : 'bg-rose-950/10 border-rose-500/30 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2 font-semibold text-white">
                        {item.is_correct ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <span>Q{idx + 1}: {item.question}</span>
                      </div>
                      <div className="space-y-1 ml-6 text-slate-400 text-[11px]">
                        <div>Your answer: <span className={item.is_correct ? 'text-emerald-400' : 'text-rose-400'}>
                          {item.user_choice !== null && item.options[item.user_choice]
                            ? item.options[item.user_choice]
                            : 'Unanswered'}
                        </span></div>
                        {!item.is_correct && (
                          <div>Correct answer: <span className="text-emerald-400 font-semibold">{item.options[item.correct_index]}</span></div>
                        )}
                        {item.explanation && (
                          <p className="text-slate-400 mt-1 italic border-l-2 border-slate-700 pl-2">
                            {item.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          {!result ? (
            <>
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {!isLastQuestion ? (
                  <button
                    onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    Next Question
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-cyan-500/20 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        Submit Assessment
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              Done & Return to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
