import React, { useState, useEffect, useRef } from 'react';
import { api, AdaptedLessonData, AdaptedLessonSection } from '../services/api';
import { PYTHON_FUNDAMENTALS_TOPICS } from '../data/pythonFundamentalsData';
import { PYTHON_INTERMEDIATE_TOPICS } from '../data/pythonIntermediateData';
import { PYTHON_ADVANCED_TOPICS } from '../data/pythonAdvancedData';
import { C_FUNDAMENTALS_TOPICS } from '../data/cFundamentalsData';
import { C_INTERMEDIATE_TOPICS } from '../data/cIntermediateData';
import { C_ADVANCED_TOPICS } from '../data/cAdvancedData';
import { CPP_FUNDAMENTALS_TOPICS } from '../data/cppFundamentalsData';
import { CPP_OOP_TOPICS } from '../data/cppOopData';
import { CPP_ADVANCED_TOPICS } from '../data/cppAdvancedData';
import { JAVA_FUNDAMENTALS_TOPICS } from '../data/javaFundamentalsData';
import { JAVA_OOP_TOPICS } from '../data/javaOopData';
import { JAVA_ADV_TOPICS } from '../data/javaAdvData';
import { executeCodeInBrowser } from '../services/pythonRunner';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useCognitive } from '../context/CognitiveContext';
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
  Cpu,
  ShieldCheck,
  Zap,
  Activity,
  Sliders,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff,
  Layers
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
  const { currentLoad, contentMode, setContentModeManually } = useCognitive();

  // Active mode: STANDARD, DETAILED, or SIMPLIFIED
  const [activeMode, setActiveMode] = useState<'STANDARD' | 'DETAILED' | 'SIMPLIFIED'>(() => {
    if (contentMode === 'DETAILED' || contentMode === 'CONCISE') return 'DETAILED';
    if (contentMode === 'SIMPLIFIED') return 'SIMPLIFIED';
    return 'STANDARD';
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [adaptedLesson, setAdaptedLesson] = useState<AdaptedLessonData | null>(null);
  const [topicInfo, setTopicInfo] = useState<any | null>(null);
  const [showInsightDetails, setShowInsightDetails] = useState<boolean>(false);

  // Section Progress & Collapsible State
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Practice sandbox state
  const [userCode, setUserCode] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [running, setRunning] = useState<boolean>(false);
  const [hintVisible, setHintVisible] = useState<boolean>(false);
  const [solutionVisible, setSolutionVisible] = useState<boolean>(false);

  // Knowledge check quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Feedback state
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [helpfulFeedback, setHelpfulFeedback] = useState<boolean | null>(null);
  const [depthRating, setDepthRating] = useState<'too_simple' | 'just_right' | 'too_complex' | null>(null);
  const [copiedDiagram, setCopiedDiagram] = useState<boolean>(false);

  const findAnyTopic = (id: string) => {
    return (
      C_ADVANCED_TOPICS.find(t => t.id === id) ||
      C_INTERMEDIATE_TOPICS.find(t => t.id === id) ||
      JAVA_ADV_TOPICS.find(t => t.id === id) ||
      JAVA_OOP_TOPICS.find(t => t.id === id) ||
      CPP_ADVANCED_TOPICS.find(t => t.id === id) ||
      CPP_OOP_TOPICS.find(t => t.id === id) ||
      CPP_FUNDAMENTALS_TOPICS.find(t => t.id === id) ||
      JAVA_FUNDAMENTALS_TOPICS.find(t => t.id === id) ||
      C_FUNDAMENTALS_TOPICS.find(t => t.id === id) ||
      PYTHON_ADVANCED_TOPICS.find(t => t.id === id) ||
      PYTHON_INTERMEDIATE_TOPICS.find(t => t.id === id) ||
      PYTHON_FUNDAMENTALS_TOPICS.find(t => t.id === id) ||
      PYTHON_FUNDAMENTALS_TOPICS[0]
    );
  };

  useEffect(() => {
    const topic = findAnyTopic(topicId);
    setTopicInfo(topic);
    loadAdaptedLesson(topic.id, activeMode, false);
  }, [topicId]);

  const loadAdaptedLesson = async (
    tId: string,
    mode: 'STANDARD' | 'DETAILED' | 'SIMPLIFIED',
    forceRefresh: boolean = false
  ) => {
    setLoading(true);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setOutput('');
    setHintVisible(false);
    setSolutionVisible(false);

    try {
      // 1. Primary call to the AI Personalization service
      const res = await api.adaptLesson({
        topic_id: tId,
        detail_level: mode,
        force_refresh: forceRefresh,
        signals: {
          currentCognitiveLoad: currentLoad,
          preferredMode: mode
        }
      });

      const lessonData = res?.lesson || res?.adapted_lesson;

      if (lessonData && lessonData.sections) {
        setAdaptedLesson(lessonData);
        // Find practice section starter code
        const practiceSec = lessonData.sections.find(
          (s: any) => s.type === 'guided_practice' || s.type === 'practice'
        );
        if (practiceSec?.practice?.starter_code) {
          setUserCode(practiceSec.practice.starter_code);
        } else if (practiceSec?.code) {
          setUserCode(practiceSec.code);
        }
      } else {
        // Fallback to client synthesis
        synthesizeFallbackLesson(tId, mode);
      }
    } catch (err) {
      console.warn('Could not retrieve adapted lesson from API, using client fallback:', err);
      synthesizeFallbackLesson(tId, mode);
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const synthesizeFallbackLesson = (tId: string, mode: 'STANDARD' | 'DETAILED' | 'SIMPLIFIED') => {
    const t = findAnyTopic(tId);
    const lang = (t as any)?.language || (tId.includes('py') ? 'python' : tId.includes('c-') ? 'c' : tId.includes('cpp') ? 'cpp' : 'java');
    const isSimplified = mode === 'SIMPLIFIED';
    const isDetailed = mode === 'DETAILED';

    const fallback: AdaptedLessonData = {
      title: `${isSimplified ? 'Intuitive Guide' : isDetailed ? 'Architectural Deep Dive' : 'Adapted Guide'}: ${t.title}`,
      subject: lang,
      topic: t.title,
      topic_id: t.id,
      adaptation: {
        strategy: isSimplified ? 'guided_step_by_step' : isDetailed ? 'deep_conceptual_dive' : 'balanced_standard',
        detail_level: mode.toLowerCase(),
        cognitive_load: currentLoad,
        confidence: 0.88,
        reason: isSimplified
          ? 'Simplified mode selected: breaking concepts into intuitive bite-sized milestones.'
          : isDetailed
          ? 'Detailed mode selected: expanding with architectural depth, memory mechanics, and edge cases.'
          : 'Standard mode selected: maintaining balanced pacing, practical examples, and core definitions.',
        signals_used: ['Continuous section telemetry', 'Cognitive state calibration']
      },
      learning_objectives: t.learningObjectives || [
        `Understand core mechanics of ${t.title}`,
        `Inspect execution behavior in ${lang.toUpperCase()}`,
        'Apply principles in hands-on practice'
      ],
      introduction: `This AI-adapted lesson for **${t.title}** provides a calibrated alternative learning path. It breaks down complex operations into clear mental models, verified syntax examples, and guided practice.`,
      sections: [
        {
          id: 'sec-intuition',
          type: 'explanation',
          title: '1. Conceptual Foundation',
          content: isSimplified
            ? `### 💡 Core Idea in Plain Terms\n\n${t.shortDescription || t.conceptExplanation?.split('\n\n')[0] || 'Understand the core definition without overwhelming syntax.'}\n\n**Key Intuition:** Focus on one small step at a time. Every variable and statement in ${lang} serves a specific purpose.`
            : isDetailed
            ? `### 🔬 Architectural Depth\n\n${t.conceptExplanation || t.shortDescription}\n\n**Runtime Mechanics:** In ${lang}, execution involves memory allocation, symbol resolution, and stack/heap frame state transitions.`
            : `### 📘 Conceptual Overview\n\n${t.conceptExplanation || t.shortDescription}\n\n**Core Definition:** In ${lang}, instructions execute sequentially while managing scoped identifiers and memory state.`,
          importance: 'primary'
        },
        {
          id: 'sec-analogy',
          type: 'analogy',
          title: '2. Everyday Analogy',
          content: `Think of **${t.title}** like an organized parcel delivery system:\n\n- **Inputs:** Parcels arriving with clear shipping labels.\n- **Process:** Workers sorting items systematically according to rulebooks.\n- **Output:** Cleanly routed parcels reaching their destinations.\n\nJust like sorting parcels, ${lang} processes data step by step so every state is accounted for.`,
          importance: 'primary'
        },
        {
          id: 'sec-diagram',
          type: 'visual_diagram',
          title: '3. Visual System Flow',
          diagram_type: 'ascii',
          diagram_content: `+-----------------------+       +-------------------------+       +-----------------------+\n|   Input Expression    |  -->  |   Runtime Evaluation    |  -->  |   Verified Result     |\n|   (Source Syntax)     |       |   (State Transition)    |       |   (Standard Output)   |\n+-----------------------+       +-------------------------+       +-----------------------+`,
          diagram_caption: `Data and execution lifecycle for ${t.title}.`,
          importance: 'secondary'
        },
        {
          id: 'sec-steps',
          type: 'step_by_step',
          title: '4. Step-by-Step Walkthrough',
          steps: [
            { step: 1, title: 'Define the Goal', description: `Clarify what computational result ${t.title} accomplishes.` },
            { step: 2, title: 'Observe Syntax Structure', description: 'Review the minimal keywords and identifiers required.' },
            { step: 3, title: 'Trace Memory State', description: 'Follow how values update line by line without side effects.' },
            { step: 4, title: 'Test Boundary Conditions', description: 'Verify handling of empty inputs, edge cases, and unexpected types.' }
          ],
          importance: 'primary'
        },
        {
          id: 'sec-code',
          type: 'code_example',
          title: '5. Runnable Code Demonstration',
          language: lang,
          code: t.codeExample || t.simpleExample?.code || `# Exploring ${t.title}\nprint("Mastering ${t.title}")`,
          code_explanation: `This snippet illustrates the canonical implementation pattern for ${t.title}.`,
          line_by_line: [
            { line: 'Initialization', explanation: 'Declares required variables and scope.' },
            { line: 'Execution', explanation: 'Transforms data according to core language mechanics.' }
          ],
          importance: 'primary'
        },
        {
          id: 'sec-practice',
          type: 'guided_practice',
          title: '6. Guided Hands-on Practice',
          practice: {
            prompt: t.practice?.prompt || `Write code demonstrating ${t.title} and print the result.`,
            starter_code: t.practice?.starterCode || `# Write your code for ${t.title}\n`,
            expected_output: t.practice?.expectedOutputMatcher || '',
            hint: t.practice?.hint || 'Check lesson examples above.',
            solution: t.practice?.solution || ''
          },
          importance: 'primary'
        },
        {
          id: 'sec-quiz',
          type: 'quiz',
          title: '7. Knowledge Check',
          questions: (t.quiz || []).slice(0, 2).map((q: any, idx: number) => ({
            id: `q-${idx}`,
            question: q.question,
            options: q.options,
            correct_index: q.correctIndex ?? 0,
            explanation: q.explanation || 'Step-by-step reasoning confirms this answer.'
          })),
          importance: 'primary'
        }
      ],
      key_takeaways: [
        `Mastered the core mental model for ${t.title}.`,
        'Inspected real code syntax and verified execution output.',
        'Completed interactive sandbox challenges to reinforce understanding.'
      ],
      next_step: 'Proceed to Topic Quiz to test full mastery.'
    };

    setAdaptedLesson(fallback);
    setUserCode(fallback.sections.find(s => s.type === 'guided_practice')?.practice?.starter_code || '');
  };

  const handleModeChange = (newMode: 'STANDARD' | 'DETAILED' | 'SIMPLIFIED') => {
    setActiveMode(newMode);
    setContentModeManually(newMode);
    if (topicInfo?.id) {
      loadAdaptedLesson(topicInfo.id, newMode, false);
    }
  };

  const handleRegenerate = () => {
    if (topicInfo?.id) {
      loadAdaptedLesson(topicInfo.id, activeMode, true);
    }
  };

  const handleRunCode = async () => {
    setRunning(true);
    try {
      const subject = adaptedLesson?.subject || 'python';
      const result = await executeCodeInBrowser(userCode, subject, '');
      setOutput(result.stdout || (result.stderr ? `Error: ${result.stderr}` : 'Code executed with no output.'));
    } catch (err: any) {
      setOutput(`Execution error: ${err.message || err}`);
    } finally {
      setRunning(false);
    }
  };

  const handleSelectOption = (qId: string, optIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDiagram(true);
    setTimeout(() => setCopiedDiagram(false), 2000);
  };

  const handleFeedback = async (isHelpful: boolean, rating?: 'too_simple' | 'just_right' | 'too_complex') => {
    setHelpfulFeedback(isHelpful);
    if (rating) setDepthRating(rating);
    setFeedbackSubmitted(true);

    try {
      await api.submitAdaptationFeedback({
        topic_id: topicId,
        detail_level: activeMode,
        helpful: isHelpful,
        rating: rating || depthRating || 'just_right',
        completed_practice: output.length > 0
      });
    } catch (err) {
      console.warn('Feedback submit error:', err);
    }
  };

  const toggleCollapse = (secId: string) => {
    setCollapsedSections(prev => ({ ...prev, [secId]: !prev[secId] }));
  };

  const toggleSectionComplete = (secId: string) => {
    setCompletedSections(prev => {
      const next = new Set(prev);
      if (next.has(secId)) next.delete(secId);
      else next.add(secId);
      return next;
    });
  };

  const scrollToSection = (secId: string) => {
    const el = document.getElementById(secId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const totalSections = adaptedLesson?.sections?.length || 0;
  const progressPct = totalSections > 0 ? Math.round((completedSections.size / totalSections) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* 1. TOP BREADCRUMB & BACK NAVIGATION */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToOriginal}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
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
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>AI-Adapted Lesson</span>
          </span>
          <span className="text-xs text-slate-600 hidden sm:inline">|</span>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Original Curriculum Untouched
          </span>
        </div>
      </div>

      {/* 2. ADAPTIVE LEARNING INSIGHT & CONTROLS (Target UI direction) */}
      <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/30 via-slate-900/80 to-slate-950 p-4 sm:p-5 shadow-xl transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left badge & explanation summary */}
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
              <Sparkles className="w-4 h-4 text-purple-300" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30">
                  Adaptive Learning Insight
                </span>

                {/* Cognitive Load Dot */}
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] font-mono">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      adaptedLesson?.adaptation?.cognitive_load === 'LOW'
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                        : adaptedLesson?.adaptation?.cognitive_load === 'HIGH'
                        ? 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.9)] animate-pulse'
                        : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                    }`}
                  />
                  <span className="text-slate-200 font-medium capitalize">
                    {(adaptedLesson?.adaptation?.cognitive_load || currentLoad).toLowerCase()} Load
                  </span>
                </div>

                <span className="text-xs font-bold text-white">
                  {activeMode === 'STANDARD'
                    ? 'Standard Explanation selected'
                    : activeMode === 'DETAILED'
                    ? 'Detailed Explanation selected'
                    : 'Simplified Explanation selected'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {adaptedLesson?.adaptation?.reason ||
                  'Suggested based on your recent learning activity and interaction signals'}
              </p>
            </div>
          </div>

          {/* Right Mode Switchers & View Insight Button */}
          <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center flex-wrap">
            {/* Mode Toggle Chips */}
            <div className="inline-flex rounded-xl bg-slate-950/80 p-1 border border-slate-800 shadow-inner">
              {(['STANDARD', 'DETAILED', 'SIMPLIFIED'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                    activeMode === mode
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`}
                  title={`Switch explanation to ${mode.toLowerCase()} mode`}
                >
                  {mode === 'STANDARD' ? 'Standard' : mode === 'DETAILED' ? 'Detailed' : 'Simplified'}
                </button>
              ))}
            </div>

            {/* View Insight Dropdown Button */}
            <button
              onClick={() => setShowInsightDetails(!showInsightDetails)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <span>{showInsightDetails ? 'Hide Insight' : 'View Insight'}</span>
              {showInsightDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded Insight Drawer */}
        {showInsightDetails && (
          <div className="mt-4 pt-4 border-t border-purple-500/20 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-fade-in">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-200 font-bold">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Activity className="w-3.5 h-3.5" />
                  Observable Learning Signals Used
                </span>
                <span className="font-mono text-[10px] text-slate-400">Live Telemetry</span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                {(adaptedLesson?.adaptation?.signals_used || ['Continuous reading telemetry', 'Steady baseline pacing']).map(
                  (sig: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span>{sig}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-200 font-bold">
                <span className="flex items-center gap-1.5 text-purple-300">
                  <Sliders className="w-3.5 h-3.5" />
                  Pedagogical Adaptation Strategy
                </span>
                <span className="font-mono text-[10px] text-emerald-400">
                  Confidence: {Math.round((adaptedLesson?.adaptation?.confidence || 0.85) * 100)}%
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Strategy: <strong className="text-purple-300">{adaptedLesson?.adaptation?.strategy}</strong>. Presentation depth and scaffolding calibrated dynamically for {adaptedLesson?.subject?.toUpperCase() || 'CS'}.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Learner agency guaranteed: Switch mode anytime or return to standard lesson.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. LOADING STATE */}
      {loading ? (
        <div className="py-24 text-center space-y-4 rounded-3xl border border-slate-800 bg-slate-900/40">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto animate-spin">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Synthesizing Personalized Adapted Lesson...</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Analyzing cognitive signals, retrieving verified curriculum context, and calibrating step-by-step scaffolding for <span className="text-purple-300 font-semibold">{topicInfo?.title || 'your topic'}</span>.
            </p>
          </div>
        </div>
      ) : adaptedLesson ? (
        <div className="space-y-8">
          {/* 4. LESSON HEADER BANNER & OBJECTIVES */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider">
                {adaptedLesson.adaptation?.detail_level?.toUpperCase()} MODE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Topic #{topicInfo?.numberDisplay || '1'} • {adaptedLesson.subject?.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {adaptedLesson.title || `Adapted Guide: ${topicInfo?.title}`}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {adaptedLesson.introduction}
            </p>

            {/* Learning Objectives */}
            {adaptedLesson.learning_objectives && adaptedLesson.learning_objectives.length > 0 && (
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                  What you will master in this adapted edition:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {adaptedLesson.learning_objectives.map((obj: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 5. STICKY TABLE OF CONTENTS & PROGRESS BAR */}
          <div className="sticky top-2 z-20 rounded-2xl border border-slate-800/90 bg-slate-950/90 backdrop-blur-md p-3 shadow-lg flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider pl-1 shrink-0">
                Sections:
              </span>
              {adaptedLesson.sections.map((sec, idx) => {
                const isDone = completedSections.has(sec.id);
                return (
                  <button
                    key={sec.id || idx}
                    onClick={() => scrollToSection(sec.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="font-mono text-[10px]">{idx + 1}</span>}
                    <span className="truncate max-w-[140px]">{sec.title.replace(/^\d+\.\s*/, '')}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-slate-400">
                {completedSections.size}/{totalSections} Read
              </span>
              <div className="w-20 sm:w-28 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* 6. DYNAMIC SECTIONS RENDERER */}
          <div className="space-y-6">
            {adaptedLesson.sections.map((section: AdaptedLessonSection, secIdx: number) => {
              const isCollapsed = collapsedSections[section.id];
              const isDone = completedSections.has(section.id);

              return (
                <div
                  key={section.id || secIdx}
                  id={section.id}
                  className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 scroll-mt-20 transition-all hover:border-slate-700/80 shadow-md"
                >
                  {/* Section Title Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-purple-300 shrink-0">
                        {secIdx + 1}
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        {section.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Mark as read button */}
                      <button
                        onClick={() => toggleSectionComplete(section.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title="Mark section as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isDone ? 'Completed' : 'Mark Read'}</span>
                      </button>

                      {/* Collapse toggle */}
                      <button
                        onClick={() => toggleCollapse(section.id)}
                        className="p-1 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title={isCollapsed ? 'Expand section' : 'Collapse section'}
                      >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Section Content (respects collapsed state) */}
                  {!isCollapsed && (
                    <div className="space-y-4 pt-1">
                      {/* TYPE: EXPLANATION */}
                      {section.type === 'explanation' && section.content && (
                        <div className="text-sm text-slate-300 leading-relaxed">
                          <MarkdownRenderer content={section.content} />
                        </div>
                      )}

                      {/* TYPE: ANALOGY */}
                      {section.type === 'analogy' && (
                        <div className="p-4 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 to-slate-950 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                            <Lightbulb className="w-4 h-4 text-amber-400" />
                            <span>Real-World Intuition</span>
                          </div>
                          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                            <MarkdownRenderer content={section.content || ''} />
                          </div>
                        </div>
                      )}

                      {/* TYPE: VISUAL DIAGRAM */}
                      {section.type === 'visual_diagram' && section.diagram_content && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5" />
                              <span>{section.diagram_caption || 'Visual Structural Diagram'}</span>
                            </span>
                            <button
                              onClick={() => handleCopyText(section.diagram_content || '')}
                              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-colors"
                            >
                              {copiedDiagram ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedDiagram ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed shadow-inner">
                            {section.diagram_content}
                          </pre>
                        </div>
                      )}

                      {/* TYPE: STEP BY STEP */}
                      {section.type === 'step_by_step' && section.steps && (
                        <div className="space-y-2.5">
                          {section.content && (
                            <p className="text-xs text-slate-400">{section.content}</p>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {section.steps.map((st: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-3.5 rounded-xl border border-slate-800/90 bg-slate-950/70 space-y-1.5"
                              >
                                <div className="flex items-center gap-2 text-xs font-bold text-white">
                                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-mono text-[10px]">
                                    {st.step || idx + 1}
                                  </span>
                                  <span>{st.title}</span>
                                </div>
                                <p className="text-xs text-slate-300 pl-7 leading-relaxed">
                                  {st.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TYPE: CODE EXAMPLE */}
                      {section.type === 'code_example' && section.code && (
                        <div className="space-y-3">
                          {section.code_explanation && (
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {section.code_explanation}
                            </p>
                          )}
                          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
                            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                              <span className="text-cyan-400 font-semibold uppercase">
                                {section.language || adaptedLesson.subject || 'code'}
                              </span>
                              <button
                                onClick={() => handleCopyText(section.code || '')}
                                className="flex items-center gap-1 hover:text-white transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </button>
                            </div>
                            <pre className="p-4 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                              {section.code}
                            </pre>
                          </div>

                          {/* Line-by-line breakdown if present */}
                          {section.line_by_line && section.line_by_line.length > 0 && (
                            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                                Line-by-Line Mechanics:
                              </span>
                              <div className="space-y-1.5 text-xs">
                                {section.line_by_line.map((item: any, lIdx: number) => (
                                  <div key={lIdx} className="flex items-start gap-2 text-slate-300">
                                    <span className="font-mono text-cyan-400 font-semibold shrink-0">
                                      {item.line}:
                                    </span>
                                    <span>{item.explanation}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TYPE: COMMON MISTAKES */}
                      {section.type === 'common_mistakes' && section.mistakes && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {section.mistakes.map((m: any, mIdx: number) => (
                            <div
                              key={mIdx}
                              className="p-4 rounded-xl border border-rose-500/20 bg-slate-950/70 space-y-2"
                            >
                              <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>{m.mistake}</span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                <strong className="text-slate-300">Why it happens:</strong> {m.why_wrong}
                              </p>
                              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono">
                                ✔ Fix: {m.fix}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* TYPE: GUIDED PRACTICE / SANDBOX */}
                      {(section.type === 'guided_practice' || section.type === 'practice') && (
                        <div className="space-y-4">
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {section.practice?.prompt || section.content || 'Complete the exercise below and verify your code in the sandbox:'}
                          </p>

                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setHintVisible(!hintVisible)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-amber-300 text-xs transition-colors"
                              >
                                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                                <span>{hintVisible ? 'Hide Hint' : 'Need a Hint?'}</span>
                              </button>

                              {section.practice?.solution && (
                                <button
                                  onClick={() => setSolutionVisible(!solutionVisible)}
                                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-cyan-300 text-xs transition-colors"
                                >
                                  {solutionVisible ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
                                  <span>{solutionVisible ? 'Hide Solution' : 'View Solution'}</span>
                                </button>
                              )}
                            </div>

                            <button
                              onClick={() => setUserCode(section.practice?.starter_code || section.code || '')}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white text-xs transition-colors"
                              title="Reset starter code"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reset</span>
                            </button>
                          </div>

                          {hintVisible && section.practice?.hint && (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2 animate-fade-in">
                              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>{section.practice.hint}</span>
                            </div>
                          )}

                          {solutionVisible && section.practice?.solution && (
                            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 space-y-1.5 animate-fade-in">
                              <span className="font-bold font-mono uppercase text-[10px] block">Verified Solution Reference:</span>
                              <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap">{section.practice.solution}</pre>
                            </div>
                          )}

                          {/* Interactive Sandbox Code Editor */}
                          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
                            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                              <span>solution_sandbox.{adaptedLesson.subject === 'python' ? 'py' : adaptedLesson.subject === 'cpp' ? 'cpp' : adaptedLesson.subject === 'java' ? 'java' : 'c'}</span>
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
                              placeholder={`# Write your ${adaptedLesson.subject || 'code'} here...`}
                            />
                          </div>

                          {/* Terminal Console Output */}
                          {output && (
                            <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 font-mono text-xs space-y-1.5 shadow-inner">
                              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                                Console Terminal Output:
                              </span>
                              <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">{output}</pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TYPE: KNOWLEDGE CHECK QUIZ */}
                      {section.type === 'quiz' && section.questions && section.questions.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                              Check your retention with these concept questions:
                            </span>
                            {!quizSubmitted && (
                              <button
                                onClick={() => setQuizSubmitted(true)}
                                disabled={Object.keys(selectedAnswers).length === 0}
                                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-40"
                              >
                                Check Answers
                              </button>
                            )}
                          </div>

                          <div className="space-y-3.5">
                            {section.questions.map((q: any, qIdx: number) => {
                              const userAnswer = selectedAnswers[q.id || `q-${qIdx}`];
                              const isCorrect = userAnswer === q.correct_index;

                              return (
                                <div
                                  key={q.id || qIdx}
                                  className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3"
                                >
                                  <h4 className="text-xs font-bold text-white flex items-start gap-2">
                                    <span className="text-purple-400 font-mono">Q{qIdx + 1}.</span>
                                    <span>{q.question}</span>
                                  </h4>

                                  <div className="space-y-2">
                                    {q.options.map((opt: string, optIdx: number) => {
                                      const isSelected = userAnswer === optIdx;
                                      let btnStyle = 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700';

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
                                          onClick={() => handleSelectOption(q.id || `q-${qIdx}`, optIdx)}
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

                                  {quizSubmitted && q.explanation && (
                                    <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                                      <strong className="text-slate-300">Explanation:</strong> {q.explanation}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 7. KEY TAKEAWAYS & NEXT STEP */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-5">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Key Takeaways</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(adaptedLesson.key_takeaways || [
                  `Gained crystal-clear intuition for ${topicInfo?.title}.`,
                  'Practiced runnable implementation in the interactive sandbox.',
                  'Prepared for advanced curriculum challenges.'
                ]).map((pt: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {adaptedLesson.next_step && (
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200">
                <strong>Next Step:</strong> {adaptedLesson.next_step}
              </div>
            )}
          </div>

          {/* 8. LEARNER FEEDBACK & REVERSIBILITY BAR */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-white block">Was this explanation helpful?</span>
              <p className="text-[11px] text-slate-400">
                Your feedback directly tunes future lesson adaptation strategies.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              {feedbackSubmitted ? (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Thank you! Feedback recorded.</span>
                </span>
              ) : (
                <>
                  <button
                    onClick={() => handleFeedback(true)}
                    className="px-3 py-1.5 rounded-xl border border-slate-800 hover:border-emerald-500/50 bg-slate-900 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-300 text-xs font-medium transition-all flex items-center gap-1.5"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Helpful</span>
                  </button>

                  <button
                    onClick={() => handleFeedback(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-800 hover:border-rose-500/50 bg-slate-900 hover:bg-rose-500/10 text-slate-300 hover:text-rose-300 text-xs font-medium transition-all flex items-center gap-1.5"
                  >
                    <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
                    <span>Needs work</span>
                  </button>

                  <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
                    <button
                      onClick={() => handleFeedback(true, 'too_simple')}
                      className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-[11px] text-slate-400 hover:text-white"
                      title="Mark as too simple"
                    >
                      Too Simple
                    </button>
                    <button
                      onClick={() => handleFeedback(true, 'just_right')}
                      className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-[11px] text-slate-400 hover:text-white"
                      title="Mark as just right"
                    >
                      Just Right
                    </button>
                    <button
                      onClick={() => handleFeedback(true, 'too_complex')}
                      className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-[11px] text-slate-400 hover:text-white"
                      title="Mark as too complex"
                    >
                      Too Detailed
                    </button>
                  </div>
                </>
              )}

              <button
                onClick={handleRegenerate}
                className="px-3 py-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                title="Regenerate this adapted explanation with fresh AI calibration"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Another Explanation</span>
              </button>
            </div>
          </div>

          {/* 9. BOTTOM NAVIGATION ACTIONS */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={onBackToOriginal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs transition-all shadow-sm"
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
      ) : null}
    </div>
  );
};
