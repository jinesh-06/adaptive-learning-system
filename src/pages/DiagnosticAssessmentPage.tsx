import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCognitive, ContentMode, CognitiveLoadLevel } from '../context/CognitiveContext';
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
  Check,
  Clock,
  Activity,
  Zap,
  ShieldCheck,
  Gauge,
  Sliders,
  ChevronRight,
  BookOpen
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
  const { setContentModeManually, updateFromFeedback } = useCognitive();

  const [language, setLanguage] = useState<string>(initialLanguage || preferences.selected_language || 'python');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);

  // Behavioral Observation Telemetry State
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [switchCount, setSwitchCount] = useState<number>(0);
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<Record<string, number>>({});
  const questionStartTimeRef = useRef<number>(Date.now());

  // Interactive Cognitive Mode Choice
  const [selectedMode, setSelectedMode] = useState<ContentMode>('BALANCED');

  useEffect(() => {
    loadQuestions(language);
  }, [language]);

  // Live timer during assessment
  useEffect(() => {
    if (loading || result || questions.length === 0) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, result, questions.length]);

  // Reset question timer on navigation
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [currentIndex]);

  const loadQuestions = async (lang: string) => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    setElapsedSeconds(0);
    setSwitchCount(0);
    setTimeSpentPerQuestion({});
    questionStartTimeRef.current = Date.now();

    try {
      const data = await api.getDiagnosticQuestions(lang);
      // Support array or wrapped object { questions: [...] }
      const qList = Array.isArray(data) ? data : (data?.questions || []);
      setQuestions(qList);
    } catch (err) {
      console.error('Failed to load diagnostic questions:', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const recordTimeOnCurrentQuestion = () => {
    const currentQ = questions[currentIndex];
    if (currentQ) {
      const duration = (Date.now() - questionStartTimeRef.current) / 1000;
      setTimeSpentPerQuestion(prev => ({
        ...prev,
        [currentQ.id]: (prev[currentQ.id] || 0) + duration
      }));
    }
    questionStartTimeRef.current = Date.now();
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    // Detect answer revisions (hesitation observation)
    if (answers[questionId] !== undefined && answers[questionId] !== optionIndex) {
      setSwitchCount(prev => prev + 1);
    }
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNext = () => {
    recordTimeOnCurrentQuestion();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    recordTimeOnCurrentQuestion();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    recordTimeOnCurrentQuestion();
    setSubmitting(true);

    const totalTimeSpent = Math.max(12, elapsedSeconds);
    const avgHesitation = questions.length > 0 ? totalTimeSpent / questions.length : 8.0;

    const observations = {
      revisions_count: switchCount,
      avg_hesitation_seconds: avgHesitation,
      total_time_seconds: totalTimeSpent,
      time_per_question: timeSpentPerQuestion
    };

    try {
      const evalResult = await api.submitDiagnostic(language, answers, totalTimeSpent, observations);
      if (evalResult && evalResult.diagnostic_result) {
        setResult(evalResult);
        const diag = evalResult.diagnostic_result;

        // Auto-select initial recommended mode
        const rawSuggested: string = diag.suggested_mode || 'BALANCED';
        const initMode: ContentMode =
          rawSuggested === 'SIMPLIFIED' ? 'SIMPLIFIED' : rawSuggested === 'CONCISE' ? 'CONCISE' : 'BALANCED';
        setSelectedMode(initMode);

        updateLanguage(language);
        updateLevel(diag.recommended_level);

        try {
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (err) {
      console.error('Diagnostic evaluation error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyAdaptationAndStart = () => {
    if (!result) return;
    const diag = result.diagnostic_result;

    // Apply chosen cognitive mode in state store & context
    setContentModeManually(selectedMode);
    updateFromFeedback({
      cognitive_level: diag.cognitive_load || 'MEDIUM',
      content_mode: selectedMode,
      confidence: diag.confidence || 0.88,
      recommended_action: `Calibrated to ${selectedMode} mode via diagnostic assessment.`
    });

    updateLanguage(language);
    updateLevel(diag.recommended_level);

    if (diag.starting_topic_id) {
      onSelectTopic(diag.starting_topic_id);
    } else {
      onBackToCurriculum();
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400 animate-fadeIn">
        <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-base font-bold text-white mb-1">Calibrating Diagnostic Engine</h3>
        <p className="text-xs text-slate-400">Loading verified benchmark questions for {language.toUpperCase()}...</p>
      </div>
    );
  }

  // --- RESULT & COGNITIVE MODE ADAPTATION VIEW ---
  if (result) {
    const diag = result.diagnostic_result;
    const breakdown = result.question_breakdown || [];
    const observations = diag.observations || {};
    const loadLevel: CognitiveLoadLevel = diag.cognitive_load || 'MEDIUM';

    const getLoadInfo = (load: CognitiveLoadLevel) => {
      switch (load) {
        case 'LOW':
          return {
            badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
            dot: 'bg-emerald-400',
            title: 'Low Cognitive Load • High Mastery',
            desc: 'Rapid retrieval pace and minimal hesitation detected. Your working memory has ample bandwidth for accelerated deep-dive content.'
          };
        case 'HIGH':
          return {
            badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
            dot: 'bg-rose-400',
            title: 'High Cognitive Load • High Mental Effort',
            desc: 'Observable hesitation and conceptual hurdles detected. Scaffolded bite-sized explanations will significantly improve retention and clarity.'
          };
        default:
          return {
            badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
            dot: 'bg-amber-400',
            title: 'Optimal Cognitive Flow • Balanced',
            desc: 'Steady, deliberate problem-solving pace with balanced recall. Content calibrated to standard hands-on interactive pacing.'
          };
      }
    };

    const loadMeta = getLoadInfo(loadLevel);

    const cognitiveModes = [
      {
        id: 'SIMPLIFIED' as ContentMode,
        name: 'Simplified Mode',
        icon: '🛡️',
        recommended: loadLevel === 'HIGH' || diag.total_score < 50,
        badge: 'Scaffolded',
        desc: 'Micro-steps, low jargon, visual diagrams, and guided code examples to reduce cognitive overload.'
      },
      {
        id: 'BALANCED' as ContentMode,
        name: 'Balanced Mode',
        icon: '⚖️',
        recommended: loadLevel === 'MEDIUM' || (diag.total_score >= 50 && diag.total_score < 80),
        badge: 'Interactive',
        desc: 'Balanced progression blending conceptual theory, real-world analogies, and hands-on coding.'
      },
      {
        id: 'CONCISE' as ContentMode,
        name: 'Concise / Deep Dive',
        icon: '⚡',
        recommended: loadLevel === 'LOW' || diag.total_score >= 80,
        badge: 'Accelerated',
        desc: 'Dense architectural insights, minimal preamble, advanced algorithm edge-cases, and high velocity.'
      }
    ];

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
        {/* Header Hero Card */}
        <div className="p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 via-slate-900/90 to-cyan-950/20 shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
            <Award className="w-7 h-7" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
              Diagnostic Assessment Complete
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Adaptive Calibration & Cognitive Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-1">
              Assessment evaluated across Concepts, Problem Solving, and Code for{' '}
              <span className="text-cyan-400 font-semibold">{language.toUpperCase()}</span>.
            </p>
          </div>

          {/* Calibrated Level Badge & Score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Calibrated Level</span>
              <div className="text-lg font-bold text-white capitalize">{diag.recommended_level} Track</div>
              <span className="text-[11px] text-cyan-400 font-medium">Personalized curriculum starting point</span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Diagnostic Score</span>
              <div className="text-lg font-mono font-bold text-white">{diag.total_score}%</div>
              <span className="text-[11px] text-emerald-400 font-medium">{result.score} of {result.total} Correct</span>
            </div>
          </div>
        </div>

        {/* Cognitive Observation & Telemetry Panel */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Live Test Behavioral Observations</h2>
                <p className="text-[11px] text-slate-400">Random Forest telemetry signals gathered during testing</p>
              </div>
            </div>

            {/* Telemetry Load Tag */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${loadMeta.badge}`}>
              <span className={`w-2 h-2 rounded-full ${loadMeta.dot} animate-pulse`} />
              <span>{loadMeta.title}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 leading-relaxed">
            {loadMeta.desc}
          </p>

          {/* Metric Telemetry Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/50">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Total Duration</span>
              <div className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{formatTimer(observations.total_time_seconds || elapsedSeconds)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/50">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Pacing Speed</span>
              <div className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>{observations.avg_seconds_per_question || 12}s / question</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/50">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Answer Revisions</span>
              <div className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                <span>{observations.revisions_count ?? switchCount} switches</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/50">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Model Confidence</span>
              <div className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>{Math.round((diag.confidence || 0.88) * 100)}% Conf</span>
              </div>
            </div>
          </div>

          {/* 3 Skill Dimensions */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider">Mastery Dimension Breakdown</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/60">
                <span className="text-[11px] text-slate-400 font-semibold block mb-1">Concept Knowledge</span>
                <div className="flex justify-between items-center text-xs mb-1 font-mono">
                  <span className="text-white font-bold">{diag.concept_score}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${diag.concept_score}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/60">
                <span className="text-[11px] text-slate-400 font-semibold block mb-1">Problem Solving</span>
                <div className="flex justify-between items-center text-xs mb-1 font-mono">
                  <span className="text-white font-bold">{diag.problem_solving_score}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${diag.problem_solving_score}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/60">
                <span className="text-[11px] text-slate-400 font-semibold block mb-1">Coding Ability</span>
                <div className="flex justify-between items-center text-xs mb-1 font-mono">
                  <span className="text-white font-bold">{diag.coding_score}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: `${diag.coding_score}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cognitive Mode Selector (User Selection & Adaptation) */}
        <div className="p-6 rounded-3xl border border-cyan-500/30 bg-slate-900/90 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Select Your Cognitive Learning Mode</h2>
                <p className="text-xs text-slate-400">Choose how lesson depth, step pacing, and scaffolding are structured</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              Adaptive Agency
            </span>
          </div>

          {/* Mode Option Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {cognitiveModes.map(mode => {
              const isSelected = selectedMode === mode.id;
              return (
                <div
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 relative ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/10'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                  }`}
                >
                  {mode.recommended && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow">
                      AI Recommended
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{mode.icon}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-cyan-400 bg-cyan-500 text-slate-950' : 'border-slate-700'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-white">{mode.name}</div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mode.desc}</p>
                  </div>

                  <span className={`inline-block text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded self-start ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {mode.badge}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Action Confirmation CTA */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleApplyAdaptationAndStart}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Apply {selectedMode} Mode & Start Learning</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => loadQuestions(language)}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                onClick={onBackToCurriculum}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Curriculum Roadmaps</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Question Review */}
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
                      {item.category?.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold ${item.is_correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.is_correct ? 'Correct' : 'Needs Review'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- EMPTY STATE FALLBACK ---
  if (totalQ === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4 animate-fadeIn">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">No Diagnostic Questions Found</h2>
        <p className="text-xs text-slate-400">
          Could not assemble questions for {language.toUpperCase()}. Try refreshing or selecting another language track.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => loadQuestions(language)}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
          <button
            onClick={onBackToCurriculum}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Back to Curriculum
          </button>
        </div>
      </div>
    );
  }

  // --- QUESTION TAKING VIEW ---
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Top Header with live observation indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              {language.toUpperCase().slice(0, 2)}
            </div>
            <h1 className="text-lg font-bold text-white">Diagnostic Assessment</h1>
          </div>
          <p className="text-xs text-slate-400">
            Evaluating knowledge across Concepts, Problem Solving, and Code.
          </p>
        </div>

        {/* Live Observation Strip & Language Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400">
            <Clock className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
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
      </div>

      {/* Real-time observation banner */}
      <div className="px-3.5 py-2 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between text-[11px] text-cyan-300">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Active Cognitive Telemetry: Observing problem-solving cadence & hesitation</span>
        </div>
        <span className="font-mono text-[10px] text-cyan-400/80">
          {switchCount > 0 ? `${switchCount} answer revisions` : 'Direct recall'}
        </span>
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
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
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
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        {currentIndex < totalQ - 1 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
          >
            <span>Next Question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || answeredCount === 0}
            className="px-8 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <span>Evaluating Behavioral Observations...</span>
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
