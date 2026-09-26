import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PYTHON_FUNDAMENTALS_TOPICS, PythonTopic } from '../data/pythonFundamentalsData';
import { executeCodeInBrowser } from '../services/pythonRunner';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Code,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  HelpCircle,
  Lightbulb,
  Check,
  Copy,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  CornerDownRight,
  Split
} from 'lucide-react';

export interface AdaptedLessonPageProps {
  topicId: string;
  onBackToOriginal: () => void;
  onNextTopic?: () => void;
  onBackToDashboard?: () => void;
  onStartQuiz?: () => void;
}

export const AdaptedLessonPage: React.FC<AdaptedLessonPageProps> = ({
  topicId,
  onBackToOriginal,
  onNextTopic,
  onBackToDashboard,
  onStartQuiz
}) => {
  const [loading, setLoading] = useState(true);
  const [adaptedData, setAdaptedData] = useState<any>(null);
  const [topicInfo, setTopicInfo] = useState<PythonTopic | null>(null);

  // Practice runner state
  const [userCode, setUserCode] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [running, setRunning] = useState<boolean>(false);
  const [hintVisible, setHintVisible] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Knowledge check state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const topic = PYTHON_FUNDAMENTALS_TOPICS.find(t => t.id === topicId) || PYTHON_FUNDAMENTALS_TOPICS[0];
    setTopicInfo(topic);
    loadAdaptedLesson(topic.id);
  }, [topicId]);

  const loadAdaptedLesson = async (tId: string) => {
    setLoading(true);
    try {
      const res = await api.getAdaptedLesson(tId);
      if (res && res.lesson_data) {
        setAdaptedData(res.lesson_data);
        setUserCode(res.lesson_data.practice_challenge?.starter_code || '');
      } else {
        // Generate on the fly
        const genRes = await api.generateAdaptedLesson({ topic_id: tId });
        if (genRes && genRes.lesson_data) {
          setAdaptedData(genRes.lesson_data);
          setUserCode(genRes.lesson_data.practice_challenge?.starter_code || '');
        }
      }
    } catch (err) {
      console.warn('Failed to load adapted lesson from API, generating client fallback:', err);
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRunCode = async () => {
    setRunning(true);
    try {
      const result = await executeCodeInBrowser(userCode, 'python', '');
      setOutput(result.stdout || (result.stderr ? `Error: ${result.stderr}` : 'No output returned.'));
    } catch (err: any) {
      setOutput(`Execution error: ${err.message || err}`);
    } finally {
      setRunning(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSelectOption = (qId: string, optIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToOriginal}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Standard Lesson</span>
          </button>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="text-xs text-slate-400 hover:text-cyan-400 font-medium transition-colors"
            >
              Dashboard
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Dedicated Adapted Page</span>
          </span>
          <span className="text-xs text-slate-500">|</span>
          <span className="text-xs font-mono text-slate-400">
            Original Lesson Untouched
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto animate-spin">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-sm font-semibold text-slate-300">Synthesizing personalized adapted lesson...</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Retrieving curriculum context, formatting step-by-step breakdowns, and calibrating practice challenges.
          </p>
        </div>
      ) : adaptedData ? (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-950/30 via-slate-900/80 to-slate-950 p-6 sm:p-8 shadow-2xl">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider">
                  {adaptedData.adaptation_badge || 'Simplified & Step-by-Step'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Topic #{topicInfo?.numberDisplay} • {topicInfo?.title}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Adapted Guide: {adaptedData.topic_title || topicInfo?.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                This alternative learning path was calibrated by our adaptive engine in response to your recent interaction signals. It breaks down the concept into bite-sized analogies and step-by-step execution.
              </p>
            </div>
          </div>

          {/* Section 1: Concept Breakdown & Intuition */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
              <BookOpen className="w-4 h-4" />
              <span>1. Intuition & Simplified Breakdown</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(adaptedData.concept_breakdown || []).map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-2.5"
                >
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    {item.heading}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Visual Representation */}
          {adaptedData.visual_representation && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <Cpu className="w-4 h-4" />
                  <span>2. Visual System Representation</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Structural Schema
                </span>
              </div>

              <p className="text-xs text-slate-300">
                {adaptedData.visual_representation.description}
              </p>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed shadow-inner">
                {adaptedData.visual_representation.diagram_text}
              </pre>
            </div>
          )}

          {/* Section 3: Calibrated Walkthrough Example */}
          {adaptedData.step_by_step_example && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <Code className="w-4 h-4" />
                  <span>3. {adaptedData.step_by_step_example.title || 'Calibrated Walkthrough'}</span>
                </div>
                <button
                  onClick={() => handleCopy(adaptedData.step_by_step_example.code)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Steps List */}
              <div className="space-y-2">
                {(adaptedData.step_by_step_example.steps || []).map((step: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-cyan-400 shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5">{step}</span>
                  </div>
                ))}
              </div>

              {/* Code Snippet */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>python_example.py</span>
                  <span className="text-cyan-400">Verified Syntax</span>
                </div>
                <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                  {adaptedData.step_by_step_example.code}
                </pre>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed italic">
                💡 {adaptedData.step_by_step_example.explanation}
              </p>
            </div>
          )}

          {/* Section 4: Interactive Practice Sandbox */}
          {adaptedData.practice_challenge && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <Play className="w-4 h-4" />
                  <span>4. Guided Practice Sandbox</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHintVisible(!hintVisible)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-amber-300 text-xs transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>{hintVisible ? 'Hide Hint' : 'Need a Hint?'}</span>
                  </button>
                  <button
                    onClick={() => setUserCode(adaptedData.practice_challenge.starter_code)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white text-xs transition-colors"
                    title="Reset to starter code"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                {adaptedData.practice_challenge.instruction}
              </p>

              {hintVisible && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{adaptedData.practice_challenge.hint}</span>
                </div>
              )}

              {/* Code Editor Area */}
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>solution_sandbox.py</span>
                    <button
                      onClick={handleRunCode}
                      disabled={running}
                      className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{running ? 'Executing...' : 'Run Code'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={userCode}
                    onChange={e => setUserCode(e.target.value)}
                    className="w-full p-4 font-mono text-xs bg-slate-950 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-y"
                    placeholder="# Write your Python code here..."
                  />
                </div>

                {/* Console Output */}
                {output && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 font-mono text-xs space-y-1.5">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                      Terminal Output:
                    </span>
                    <pre className="text-emerald-400 whitespace-pre-wrap">{output}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Knowledge Check (2 questions) */}
          {adaptedData.knowledge_check && adaptedData.knowledge_check.length > 0 && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                  <HelpCircle className="w-4 h-4" />
                  <span>5. Step-by-Step Knowledge Check</span>
                </div>
                {!quizSubmitted && (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    disabled={Object.keys(selectedAnswers).length === 0}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-40"
                  >
                    Check Answers
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {adaptedData.knowledge_check.map((q: any, qIdx: number) => {
                  const userAnswer = selectedAnswers[q.id];
                  const isCorrect = userAnswer === q.correct_index;

                  return (
                    <div
                      key={q.id || qIdx}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-3"
                    >
                      <h4 className="text-xs font-bold text-white flex items-start gap-2">
                        <span className="text-purple-400 font-mono">Q{qIdx + 1}.</span>
                        <span>{q.question}</span>
                      </h4>

                      <div className="space-y-2">
                        {q.options.map((opt: string, optIdx: number) => {
                          const isSelected = userAnswer === optIdx;
                          let btnStyle = 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700';

                          if (quizSubmitted) {
                            if (optIdx === q.correct_index) {
                              btnStyle = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'border-rose-500/60 bg-rose-500/10 text-rose-300';
                            }
                          } else if (isSelected) {
                            btnStyle = 'border-purple-500 bg-purple-500/20 text-white font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && optIdx === q.correct_index && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                              {quizSubmitted && isSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 6: Key Takeaways & Action Bar */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Key Takeaways</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(adaptedData.key_takeaways || []).map((point: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={onBackToOriginal}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs transition-all"
              >
                Back to Standard Lesson
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {onStartQuiz && (
                  <button
                    onClick={onStartQuiz}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/20"
                  >
                    Take Topic Quiz
                  </button>
                )}

                {onNextTopic && (
                  <button
                    onClick={onNextTopic}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-cyan-500/20"
                  >
                    <span>Proceed to Next Topic</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
