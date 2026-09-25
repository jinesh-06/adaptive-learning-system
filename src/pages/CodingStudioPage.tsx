import React, { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useCognitive } from '../context/CognitiveContext';
import { useTheme } from '../context/ThemeContext';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { api } from '../services/api';
import { telemetry } from '../services/telemetry';
import {
  Terminal,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShieldAlert,
  HelpCircle,
  Zap,
  Code2,
  Bug,
  Cpu,
  BookOpen,
  FileText
} from 'lucide-react';
import { BookmarkButton } from '../components/BookmarkButton';
import { QuickNoteModal } from '../components/QuickNoteModal';
import { TopicLearningStepper } from '../components/TopicLearningStepper';

interface CodingStudioProps {
  topicId?: string;
  onOpenAiDrawer: () => void;
  onBackToLesson: () => void;
  onGoToQuiz?: () => void;
  onNextTopic?: () => void;
}

export const CodingStudioPage: React.FC<CodingStudioProps> = ({
  topicId,
  onOpenAiDrawer,
  onBackToLesson,
  onGoToQuiz,
  onNextTopic
}) => {
  const { preferences } = useAuth();
  const { updateFromFeedback, currentLoad } = useCognitive();
  const { monacoTheme } = useTheme();

  const activeTopic = topicId || 'top-py-loops';
  const { saveLocalDraft, loadLocalDraft } = useOfflineSync('coding_draft_');

  const [challenge, setChallenge] = useState<any | null>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [execResult, setExecResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'output' | 'custom'>('tests');
  const [codingStartTime, setCodingStartTime] = useState<number>(Date.now());
  const [keystrokes, setKeystrokes] = useState<number>(0);
  const [pasteEvents, setPasteEvents] = useState<number>(0);
  const [isPassed, setIsPassed] = useState<boolean>(false);

  // Section 54: 5-Tier Progressive Hint Modal
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState(1);
  const [hintContent, setHintContent] = useState<string | null>(null);
  const [hintStageTitle, setHintStageTitle] = useState<string>('Level 1: Conceptual Clue');
  const [hintLoading, setHintLoading] = useState(false);

  // Section 54: AI Assistant Action Modals / Cards
  const [aiActionLoading, setAiActionLoading] = useState(false);
  const [aiActionResult, setAiActionResult] = useState<{ title: string; content: string } | null>(null);

  // Section 112 & 113: Bookmarks & Quick Notes
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const quickKeys = ['()', '{}', '[]', ':', '=', '"', "'", 'tab', '->', ';', '<', '>'];
  const insertQuickKey = (token: string) => {
    const textToInsert = token === 'tab' ? '    ' : token;
    setCode(prev => {
      const next = prev + textToInsert;
      saveLocalDraft(activeTopic, next);
      return next;
    });
  };

  useEffect(() => {
    const loadChallenge = async () => {
      setLoading(true);
      try {
        const data = await api.getTopicCodingChallenge(activeTopic);
        setChallenge(data);

        // Check local draft first
        const localDraft = loadLocalDraft(activeTopic);
        if (localDraft) {
          setCode(localDraft);
        } else {
          // Pre-fill starter code
          const langKey = preferences.selected_language;
          const starter = (data.starter_code && data.starter_code[langKey]) ||
            (data.starter_code && Object.values(data.starter_code)[0]) ||
            '# Write your solution here\n';
          setCode(starter);
        }
      } catch (err) {
        console.error('Failed to load coding challenge:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChallenge();
    setCodingStartTime(Date.now());
    setKeystrokes(0);
    setPasteEvents(0);
    setIsPassed(false);
    setExecResult(null);

    // Behavioral event: CODE_START
    telemetry.logEvent('CODE_START', 0, { topic_id: activeTopic });
  }, [activeTopic, preferences.selected_language]);

  const handleEditorChange = (value?: string) => {
    const updated = value || '';
    setCode(updated);
    saveLocalDraft(activeTopic, updated);
    setKeystrokes(prev => prev + 1);
  };

  const handleEditorPaste = () => {
    setPasteEvents(prev => prev + 1);
  };

  // Run with custom input
  const handleRunCustom = async () => {
    setRunning(true);
    setActiveTab('output');
    try {
      const res = await api.runCode(code, preferences.selected_language, customInput);
      setExecResult(res);
    } catch (err: any) {
      setExecResult({
        status: 'RUNTIME_ERROR',
        runtime_error: err.message,
        details: []
      });
    } finally {
      setRunning(false);
    }
  };

  // Submit code for grading against visible and hidden test cases
  const handleSubmitCode = async () => {
    setRunning(true);
    setActiveTab('tests');
    const elapsedSeconds = Math.max(5, Math.round((Date.now() - codingStartTime) / 1000));

    try {
      const res = await api.submitCode({
        topicId: activeTopic,
        code,
        language: preferences.selected_language,
        codingTimeSeconds: elapsedSeconds,
        keystrokes,
        pasteEvents
      });

      const execution = res.execution || res;
      setExecResult(execution);
      const passed = res.is_passed !== undefined ? res.is_passed : (execution?.status === 'PASSED');
      setIsPassed(!!passed);

      if (passed) {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      }

      if (res.adaptive_feedback) {
        updateFromFeedback(res.adaptive_feedback);
      }
    } catch (err: any) {
      setExecResult({
        status: 'RUNTIME_ERROR',
        runtime_error: err.message,
        details: []
      });
    } finally {
      setRunning(false);
    }
  };

  // Section 54: Request Progressive Hint (Level 1..5)
  const fetchProgressiveHint = async (level: number) => {
    setHintLoading(true);
    setCurrentHintLevel(level);
    try {
      const res = await api.requestProgressiveHint({
        question: challenge?.problem_statement || 'Coding challenge',
        code_snippet: code,
        hint_level: level,
        topic: challenge?.title || 'Iteration',
        language: preferences.selected_language
      });
      setHintContent(res.hint_text);
      setHintStageTitle(res.stage);
    } catch (err: any) {
      setHintContent('Could not fetch hint at this time.');
    } finally {
      setHintLoading(false);
    }
  };

  const handleOpenHintModal = () => {
    setHintModalOpen(true);
    fetchProgressiveHint(currentHintLevel);
  };

  // Section 54: Editor AI Assistant Quick Action Buttons
  const handleAiAction = async (action: 'explain_error' | 'debug' | 'optimize' | 'explain_code' | 'test_case') => {
    setAiActionLoading(true);
    const actionTitles = {
      explain_error: 'Error Diagnostic & Remediation',
      debug: 'Static Logic Bug Analysis',
      optimize: 'Algorithmic Optimization Tips',
      explain_code: 'Line-by-Line Code Breakdown',
      test_case: 'Generated Edge Test Case'
    };

    let prompt = '';
    let tutorMode = 'EXPLAIN';

    if (action === 'explain_error') {
      prompt = `Diagnose this error: ${execResult?.compilation_error || execResult?.runtime_error || 'Code produced incorrect output'}`;
      tutorMode = 'DEBUG';
    } else if (action === 'debug') {
      prompt = `Inspect this code for potential edge case bugs or logic traps`;
      tutorMode = 'DEBUG';
    } else if (action === 'optimize') {
      prompt = `Suggest time and space complexity optimizations without spoiling the answer`;
      tutorMode = 'ADVANCED';
    } else if (action === 'explain_code') {
      prompt = `Explain how this code executes step by step`;
      tutorMode = 'EXPLAIN';
    } else {
      prompt = `Generate a tricky edge test case (e.g. empty, negative, max limits) for this problem`;
      tutorMode = 'EXAMPLE';
    }

    try {
      const resp = await api.askAiAssistant({
        question: prompt,
        language: preferences.selected_language,
        topic: challenge?.title || 'Coding Challenge',
        cognitive_load: currentLoad,
        tutor_mode: tutorMode,
        code_context: code
      });
      setAiActionResult({
        title: actionTitles[action],
        content: resp.answer
      });
    } catch (err: any) {
      setAiActionResult({
        title: actionTitles[action],
        content: 'AI Assistant currently synthesizing responses offline.'
      });
    } finally {
      setAiActionLoading(false);
    }
  };

  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case 'c':
      case 'cpp':
        return 'cpp';
      case 'java':
        return 'java';
      default:
        return 'python';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-mono">Provisioning isolated subprocess coding sandbox...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        No challenge found for this topic.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 3-STAGE LEARNING STEPPER: 1. Lesson -> 2. Quiz -> 3. Coding */}
      <TopicLearningStepper
        currentStep="coding"
        topicId={activeTopic}
        onNavigateStep={(step) => {
          if (step === 'lesson') onBackToLesson();
          if (step === 'quiz' && onGoToQuiz) onGoToQuiz();
        }}
        onBackToCurriculum={onBackToLesson}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 space-y-4">
        {/* Studio Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mb-1 font-bold">
              <span className="text-[10px] uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Step 3 of 3 • Coding Challenge
              </span>
              <span>•</span>
              <span className="uppercase">{preferences.selected_language}</span>
              <span>•</span>
              <span className="text-purple-400 uppercase">{challenge.difficulty}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {challenge.title}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <BookmarkButton
              itemType="lesson"
              itemId={challenge?.id || activeTopic}
              title={challenge?.title || 'Coding Challenge'}
              snippet={challenge?.problem_statement?.slice(0, 80)}
              topicId={activeTopic}
              language={preferences.selected_language}
            />
            <button
              onClick={() => setNoteModalOpen(true)}
              className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5"
              title="Add note for this challenge"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Note</span>
            </button>
            <button
              onClick={onBackToLesson}
              className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-all"
              title="Return to the lesson content"
            >
              ← Review Lesson
            </button>
            {onGoToQuiz && (
              <button
                onClick={onGoToQuiz}
                className="px-3.5 py-2 rounded-xl border border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/30 text-xs font-semibold text-purple-300 transition-all"
                title="Retake the quiz for this lesson"
              >
                ← Practice Quiz
              </button>
            )}
            {isPassed && onNextTopic && (
              <button
                onClick={onNextTopic}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <span>Advance to Next Topic Lesson</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          <button
            disabled={running}
            onClick={handleRunCustom}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            Run Code
          </button>
          <button
            disabled={running}
            onClick={handleSubmitCode}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            {running ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-slate-950" />
                Submit Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 54: AI CODING ASSISTANT QUICK ACTION BAR */}
      <div className="p-3 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-2 shrink-0 font-bold text-slate-300 font-mono">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>AI Assistant:</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleOpenHintModal}
            className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-300 hover:bg-amber-900/30 transition-all flex items-center gap-1.5 font-semibold"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            5-Tier Hint
          </button>
          <button
            onClick={() => handleAiAction('explain_error')}
            className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 hover:bg-rose-900/30 transition-all flex items-center gap-1.5 font-semibold"
          >
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            Explain Error
          </button>
          <button
            onClick={() => handleAiAction('debug')}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-all font-semibold"
          >
            Debug
          </button>
          <button
            onClick={() => handleAiAction('optimize')}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-all font-semibold"
          >
            Optimize
          </button>
          <button
            onClick={() => handleAiAction('explain_code')}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-all font-semibold"
          >
            Explain My Code
          </button>
          <button
            onClick={() => handleAiAction('test_case')}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-all font-semibold"
          >
            Generate Test Case
          </button>
        </div>
      </div>

      {/* AI Quick Action Response Drawer if triggered */}
      {aiActionLoading && (
        <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-950/10 text-xs text-purple-300 flex items-center gap-2 animate-pulse font-mono">
          <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
          AI Coding Assistant analyzing logic and curriculum guidelines...
        </div>
      )}

      {aiActionResult && (
        <div className="p-5 rounded-2xl border border-purple-500/40 bg-slate-900 shadow-xl space-y-3 relative">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              {aiActionResult.title}
            </div>
            <button
              onClick={() => setAiActionResult(null)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Close
            </button>
          </div>
          <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
            {aiActionResult.content}
          </div>
        </div>
      )}

      {/* Main Grid: Problem Statement (5 cols) & Monaco Editor (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Specification (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-5 text-xs text-slate-300 max-h-[750px] overflow-y-auto">
          <div>
            <h3 className="font-bold text-white text-sm mb-2">Problem Description</h3>
            <p className="leading-relaxed text-slate-300 whitespace-pre-line">
              {challenge.problem_statement}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-300 mb-1">Input Format</h3>
            <p className="text-slate-400">{challenge.input_format}</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-300 mb-1">Output Format</h3>
            <p className="text-slate-400">{challenge.output_format}</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-300 mb-1">Constraints</h3>
            <pre className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-cyan-300 font-mono text-[11px]">
              {challenge.constraints}
            </pre>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <h3 className="font-bold text-slate-300 mb-1">Sample Input</h3>
              <pre className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 font-mono text-[11px]">
                {challenge.sample_input}
              </pre>
            </div>
            <div>
              <h3 className="font-bold text-slate-300 mb-1">Sample Output</h3>
              <pre className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-emerald-300 font-mono text-[11px]">
                {challenge.sample_output}
              </pre>
            </div>
          </div>

          {/* Telemetry Tracking Summary */}
          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between font-mono">
            <span>Keystrokes: {keystrokes}</span>
            <span>Paste Count: {pasteEvents}</span>
            <span>Timeout Guard: 5000ms</span>
          </div>
        </div>

        {/* Right Column: Monaco Code Editor + Output Panel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
          {/* Editor Header */}
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-mono text-cyan-400 font-semibold">
              solution.{preferences.selected_language === 'python' ? 'py' : preferences.selected_language === 'c' ? 'c' : preferences.selected_language === 'cpp' ? 'cpp' : 'java'}
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              Safe Subprocess Isolation
            </span>
          </div>

          {/* Section 85: Mobile Virtual Quick-Key Bar */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 overflow-x-auto scrollbar-none" aria-label="Touch Code Quick-Keys">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0 mr-1">Quick:</span>
            {quickKeys.map(k => (
              <button
                key={k}
                type="button"
                onClick={() => insertQuickKey(k)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 active:bg-cyan-500/20 text-xs font-mono text-cyan-300 border border-slate-700 hover:border-cyan-500/40 shrink-0"
              >
                {k}
              </button>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className="h-[380px]" onPaste={handleEditorPaste}>
            <Editor
              height="100%"
              language={getMonacoLanguage(preferences.selected_language)}
              value={code}
              theme={monacoTheme}
              onChange={handleEditorChange}
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: true,
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>

          {/* Console / Test Results Drawer */}
          <div className="h-64 border-t border-slate-800 bg-slate-900/90 flex flex-col">
            {/* Tabs */}
            <div className="flex items-center border-b border-slate-800 px-3 bg-slate-950/60 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('tests')}
                className={`px-3 py-2 border-b-2 transition-colors ${
                  activeTab === 'tests'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Test Cases ({execResult ? `${execResult.passed_test_cases}/${execResult.total_test_cases}` : 'Ready'})
              </button>
              <button
                onClick={() => setActiveTab('output')}
                className={`px-3 py-2 border-b-2 transition-colors ${
                  activeTab === 'output'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Execution Log
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-2 border-b-2 transition-colors ${
                  activeTab === 'custom'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Custom Stdin
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-4 overflow-y-auto text-xs font-mono">
              {/* SECTION 58: ERROR CLASSIFICATION ALERT */}
              {execResult?.error_category && (
                <div className="mb-3 p-3 rounded-xl border border-rose-500/40 bg-rose-950/20 text-xs flex flex-col gap-1.5 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] font-mono bg-rose-500 text-slate-950 uppercase">
                      {execResult.error_category}
                    </span>
                    <span className="text-rose-300 font-semibold">{execResult.error_diagnosis}</span>
                  </div>
                  {execResult.recommended_review_concept && (
                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-rose-900/40">
                      <span>Recommendation: Review <strong>{execResult.recommended_review_concept}</strong></span>
                      <button
                        onClick={onBackToLesson}
                        className="text-cyan-400 hover:underline font-bold text-[11px]"
                      >
                        Review Topic →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tests' && (
                <div>
                  {!execResult ? (
                    <div className="text-slate-500 py-6 text-center">
                      Click "Submit Code" to run your solution against visible and hidden test cases.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="font-bold text-white flex items-center gap-2">
                          {isPassed ? (
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400">All Test Cases Passed!</span>
                              </div>
                              {onNextTopic && (
                                <button
                                  onClick={onNextTopic}
                                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-sm flex items-center gap-1"
                                >
                                  <span>Next Topic</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-400" />
                              <span className="text-rose-400">Test Cases Failed ({execResult.status})</span>
                            </>
                          )}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {execResult.execution_time_ms}ms
                        </span>
                      </div>

                      <div className="space-y-2">
                        {(execResult.details || []).map((tc: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border text-[11px] ${
                              tc.passed
                                ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-300'
                                : 'border-rose-500/20 bg-rose-950/10 text-rose-300'
                            }`}
                          >
                            <div className="flex justify-between font-bold mb-1">
                              <span>Test Case #{idx + 1} {tc.is_hidden ? '(Hidden Evaluation)' : ''}</span>
                              <span>{tc.passed ? 'PASSED' : 'FAILED'}</span>
                            </div>
                            {!tc.is_hidden && (
                              <div className="grid grid-cols-2 gap-2 mt-1 text-[10px] text-slate-400">
                                <div>Input: <code className="text-slate-200">{tc.input}</code></div>
                                <div>Expected: <code className="text-slate-200">{tc.expected}</code></div>
                                <div className="col-span-2">Output: <code className="text-slate-200">{tc.actual}</code></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'output' && (
                <div className="space-y-3 font-mono">
                  {execResult?.stdout && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Standard Output (stdout):</span>
                      </div>
                      <pre className="text-emerald-300 whitespace-pre-wrap bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed text-xs">
                        {execResult.stdout}
                      </pre>
                    </div>
                  )}
                  {execResult?.stderr && (
                    <div>
                      <div className="text-[10px] font-bold text-rose-400 mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Standard Error (stderr):</span>
                      </div>
                      <pre className="text-rose-300 whitespace-pre-wrap bg-rose-950/20 p-3 rounded-xl border border-rose-900/40 leading-relaxed text-xs">
                        {execResult.stderr}
                      </pre>
                    </div>
                  )}
                  {execResult?.compilation_error && (
                    <div>
                      <div className="text-[10px] font-bold text-rose-400 mb-1 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Compilation Error:</span>
                      </div>
                      <pre className="text-rose-300 whitespace-pre-wrap bg-rose-950/20 p-3 rounded-xl border border-rose-900/40 leading-relaxed text-xs">
                        {execResult.compilation_error}
                      </pre>
                    </div>
                  )}
                  {execResult?.runtime_error && (
                    <div>
                      <div className="text-[10px] font-bold text-rose-400 mb-1 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Runtime Error:</span>
                      </div>
                      <pre className="text-rose-300 whitespace-pre-wrap bg-rose-950/20 p-3 rounded-xl border border-rose-900/40 leading-relaxed text-xs">
                        {execResult.runtime_error}
                      </pre>
                    </div>
                  )}
                  {!execResult?.stdout && !execResult?.stderr && !execResult?.compilation_error && !execResult?.runtime_error && (
                    <div className="text-slate-400 py-4 text-center">
                      {(execResult?.details && execResult.details[0]?.actual) ? (
                        <pre className="text-slate-300 whitespace-pre-wrap text-left bg-slate-950 p-3 rounded-xl border border-slate-800">
                          {execResult.details[0].actual}
                        </pre>
                      ) : (
                        'No output recorded yet. Click "Run Code" or "Submit Code" to execute.'
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'custom' && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400">
                    Input piped directly into standard input (stdin):
                  </p>
                  <textarea
                    rows={3}
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder="Enter custom stdin parameters..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* SECTION 54: 5-TIER PROGRESSIVE HINTS MODAL */}
      {hintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl p-6 rounded-3xl border border-amber-500/30 bg-slate-900 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Lightbulb className="w-5 h-5" />
                <span>5-Tier Progressive Hint Assistant</span>
              </div>
              <button
                onClick={() => setHintModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Level Stepper */}
            <div className="flex items-center justify-between gap-1">
              {[1, 2, 3, 4, 5].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => fetchProgressiveHint(lvl)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                    currentHintLevel === lvl
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : currentHintLevel > lvl
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  Lvl {lvl}
                </button>
              ))}
            </div>

            {/* Hint Content */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 min-h-[140px] text-xs text-slate-300 leading-relaxed font-sans">
              <div className="text-[11px] font-mono text-amber-400 font-bold mb-2">
                {hintStageTitle}
              </div>
              {hintLoading ? (
                <div className="py-8 text-center text-slate-500 animate-pulse">
                  Unlocking pedagogical hint...
                </div>
              ) : (
                <div className="whitespace-pre-line">
                  {hintContent}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Anti-spoiling active: full solutions are never given in early tiers.</span>
              {currentHintLevel < 5 && (
                <button
                  onClick={() => fetchProgressiveHint(currentHintLevel + 1)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
                >
                  Reveal Next Hint (Lvl {currentHintLevel + 1}) →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Contextual Quick Note Modal */}
      <QuickNoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        language={preferences.selected_language}
        topicId={activeTopic}
        subtopicTitle={challenge?.title}
        defaultTitle={`${challenge?.title || 'Challenge'} - Notes`}
      />
    </div>
  );
};
