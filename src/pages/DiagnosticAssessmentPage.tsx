import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Brain,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  Code2,
  HelpCircle,
  Lightbulb,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DiagnosticAssessmentPageProps {
  initialLanguage?: string;
  onSelectTopic: (topicId: string) => void;
  onBackToCurriculum: () => void;
}

export const DiagnosticAssessmentPage: React.FC<DiagnosticAssessmentPageProps> = ({
  initialLanguage = 'python',
  onSelectTopic,
  onBackToCurriculum
}) => {
  const { preferences, updateLanguage, updateLevel } = useAuth();
  const [language, setLanguage] = useState<string>(initialLanguage || preferences.selected_language || 'python');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    loadQuestions(language);
  }, [language]);

  const loadQuestions = async (lang: string) => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    try {
      const data = await api.getDiagnosticQuestions(lang);
      if (data && data.questions) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error('Failed to load diagnostic questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const evalResult = await api.submitDiagnostic(language, answers);
      if (evalResult && evalResult.diagnostic_result) {
        setResult(evalResult);
        updateLanguage(language);
        updateLevel(evalResult.diagnostic_result.recommended_level);
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (err) {
      console.error('Diagnostic evaluation error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium">Assembling diagnostic assessment for {language.toUpperCase()}...</p>
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (result) {
    const diag = result.diagnostic_result;
    const breakdown = result.question_breakdown || [];

    const getLevelBadge = (lvl: string) => {
      switch (lvl) {
        case 'advanced':
          return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
        case 'intermediate':
          return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
        default:
          return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      }
    };

    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 animate-fadeIn">
        {/* Recommendation Header Card */}
        <div className="p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/20 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
            <Award className="w-7 h-7" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
              Assessment Completed
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Diagnostic Assessment Results
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-1">
              Based on your concept knowledge, problem solving, and code analysis in {language.toUpperCase()}.
            </p>
          </div>

          {/* Recommended Starting Point */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 max-w-md mx-auto">
            <div className="text-xs text-slate-400 uppercase font-semibold mb-1">
              Recommended Starting Level
            </div>
            <div className={`inline-block px-4 py-1.5 rounded-xl border text-sm font-bold uppercase tracking-wider ${getLevelBadge(diag.recommended_level)}`}>
              {diag.recommended_level} Track
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Diagnostic Score: <span className="font-bold text-white font-mono">{diag.total_score}%</span>
            </div>
          </div>

          {/* 3 Skill Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 max-w-lg mx-auto text-left">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">Concept Knowledge</span>
              <div className="flex justify-between items-center text-xs mb-1 font-mono">
                <span className="text-white font-bold">{diag.concept_score}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${diag.concept_score}%` }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">Problem Solving</span>
              <div className="flex justify-between items-center text-xs mb-1 font-mono">
                <span className="text-white font-bold">{diag.problem_solving_score}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${diag.problem_solving_score}%` }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">Coding Ability</span>
              <div className="flex justify-between items-center text-xs mb-1 font-mono">
                <span className="text-white font-bold">{diag.coding_score}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: `${diag.coding_score}%` }} />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>You are not locked into this level! You can change it anytime in your navigation bar or profile.</span>
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onSelectTopic(diag.starting_topic_id)}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <span>Start at Personalized Starting Point</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => loadQuestions(language)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Test</span>
            </button>
          </div>
        </div>

        {/* Detailed Question Review Accordion */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            Diagnostic Question Breakdown
          </h2>

          <div className="space-y-3">
            {breakdown.map((item: any, idx: number) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border ${
                  item.is_correct ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-rose-500/30 bg-rose-950/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {item.is_correct ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-white">Question {idx + 1}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded uppercase font-mono bg-slate-800 text-slate-400">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold ${item.is_correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.is_correct ? 'Correct' : 'Needs Review'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-2 leading-relaxed">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- QUESTION TAKING VIEW ---
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              {language.toUpperCase().slice(0, 2)}
            </div>
            <h1 className="text-lg font-bold text-white">Diagnostic Assessment</h1>
          </div>
          <p className="text-xs text-slate-400">
            Evaluating your knowledge across Concepts, Problem Solving, and Code.
          </p>
        </div>

        {/* Language switcher for test */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          {[
            { id: 'python', label: 'Python' },
            { id: 'c', label: 'C' },
            { id: 'cpp', label: 'C++' },
            { id: 'java', label: 'Java' }
          ].map(l => (
            <button
              key={l.id}
              onClick={() => setLanguage(l.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                language === l.id ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>Question {currentIndex + 1} of {totalQ}</span>
          <span>{answeredCount} of {totalQ} Answered</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
          />
        </div>
      </div>

      {/* Active Question Card */}
      {currentQ && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {currentQ.category?.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Weight: {currentQ.difficulty_weight || 1}x
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Optional Code Snippet */}
          {currentQ.code_snippet && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed">
              {currentQ.code_snippet}
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options?.map((opt: string, idx: number) => {
              const isSelected = answers[currentQ.id] === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(currentQ.id, idx)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-md shadow-cyan-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'border-cyan-500 bg-cyan-500 text-slate-950' : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-xs sm:text-sm font-medium">{opt}</span>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 font-semibold text-xs transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        {currentIndex < totalQ - 1 ? (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2"
          >
            <span>Next Question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || answeredCount === 0}
            className="px-8 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            {submitting ? (
              <span>Evaluating Diagnostic...</span>
            ) : (
              <>
                <span>Submit & View Recommendation</span>
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
