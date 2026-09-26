import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useCognitive, ContentMode } from '../context/CognitiveContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { telemetry } from '../services/telemetry';
import { mockTopicDetails, mockCourses } from '../services/mockFallback';
import { PYTHON_FUNDAMENTALS_TOPICS } from '../data/pythonFundamentalsData';
import {
  BookOpen,
  Code,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Terminal,
  Layers,
  Clock,
  Compass,
  FileText,
  Search,
  Sun,
  Moon,
  Sidebar as SidebarIcon,
  ChevronRight,
  X,
  AlignLeft,
  GraduationCap,
  ExternalLink,
  Zap,
  Bookmark
} from 'lucide-react';
import { BookmarkButton } from '../components/BookmarkButton';
import { QuickNoteModal } from '../components/QuickNoteModal';
import { LessonTOC, DEFAULT_TOC_ITEMS } from '../components/lesson/LessonTOC';
import { AdaptiveInsightCard } from '../components/lesson/AdaptiveInsightCard';
import { InteractiveCodeBlock } from '../components/lesson/InteractiveCodeBlock';
import { VisualConceptExplainer } from '../components/lesson/VisualConceptExplainer';
import { TryYourselfSandbox } from '../components/lesson/TryYourselfSandbox';
import { InLessonQuiz } from '../components/lesson/InLessonQuiz';
import { InLessonCodingChallenge } from '../components/lesson/InLessonCodingChallenge';
import { LessonSummaryCard } from '../components/lesson/LessonSummaryCard';

export interface TopicLessonPageProps {
  topicId: string;
  onSelectTopic?: (topicId: string) => void;
  onNextTopic?: () => void;
  onPrevTopic?: () => void;
  onStartQuiz?: () => void;
  onOpenCoding?: () => void;
  onBackToCatalog?: () => void;
  onBackToPythonDashboard?: () => void;
  onOpenAdaptedLesson?: (topicId: string) => void;
  onOpenAiDrawer?: () => void;
  onOpenSearch?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
}

export const TopicLessonPage: React.FC<TopicLessonPageProps> = ({
  topicId,
  onSelectTopic,
  onNextTopic,
  onPrevTopic,
  onStartQuiz,
  onOpenCoding,
  onBackToCatalog,
  onBackToPythonDashboard,
  onOpenAdaptedLesson,
  onOpenAiDrawer,
  onOpenSearch,
  isSidebarOpen = true,
  onToggleSidebar,
  onOpenMobileSidebar
}) => {
  const { contentMode, currentLoad, setActiveTopicId, setContentModeManually } = useCognitive();
  const { theme, setTheme } = useTheme();

  const [topic, setTopic] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // In-Lesson Contextual AI Tutor state
  const [aiTutorResponse, setAiTutorResponse] = useState<any | null>(null);
  const [aiTutorLoading, setAiTutorLoading] = useState(false);
  const [activeTutorMode, setActiveTutorMode] = useState<string | null>(null);

  // Quick note modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  // Feedback state
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize adaptive content mode
  const activeMode: 'STANDARD' | 'DETAILED' | 'SIMPLIFIED' =
    contentMode === 'DETAILED' || contentMode === 'CONCISE'
      ? 'DETAILED'
      : contentMode === 'SIMPLIFIED'
      ? 'SIMPLIFIED'
      : 'STANDARD';

  useEffect(() => {
    setActiveTopicId(topicId);
    telemetry.initTopicSession(topicId);

    const loadTopic = async () => {
      setLoading(true);
      const pyTopic = PYTHON_FUNDAMENTALS_TOPICS.find(t => t.id === topicId);
      try {
        const data = await api.getTopicDetail(topicId);
        if (data) {
          setTopic(pyTopic ? { ...pyTopic, ...data } : data);
        } else {
          // Fallback to local mock topic details
          setTopic(pyTopic ? { ...pyTopic, ...mockTopicDetails[topicId] } : (mockTopicDetails[topicId] || mockTopicDetails['top-py-fundamentals']));
        }
      } catch (err) {
        console.warn('Failed to load topic detail via API, using mock:', err);
        setTopic(pyTopic ? { ...pyTopic, ...mockTopicDetails[topicId] } : (mockTopicDetails[topicId] || mockTopicDetails['top-py-fundamentals']));
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    loadTopic();

    // Listen to user scrolling to collect telemetry
    const handleScroll = () => {
      telemetry.recordScroll();
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      telemetry.flushSession();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [topicId, setActiveTopicId]);

  // Determine previous and next topics from curriculum sequence
  const curriculumSequence = useMemo(() => {
    const isPyFund = PYTHON_FUNDAMENTALS_TOPICS.some(t => t.id === topicId);
    if (isPyFund) {
      return PYTHON_FUNDAMENTALS_TOPICS.map(t => ({
        id: t.id,
        title: t.title,
        moduleTitle: 'Python Fundamentals'
      }));
    }
    const pyCourse = mockCourses.find(c => c.language === (topic?.language || 'python')) || mockCourses[0];
    if (!pyCourse || !pyCourse.modules) return [];
    return pyCourse.modules.flatMap((m: any) =>
      m.topics.map((t: any) => ({
        id: t.id,
        title: t.title,
        moduleTitle: m.title
      }))
    );
  }, [topicId, topic?.language]);

  const currentIndex = curriculumSequence.findIndex((t: any) => t.id === topicId);
  const prevTopic = currentIndex > 0 ? curriculumSequence[currentIndex - 1] : null;
  const nextTopic = currentIndex >= 0 && currentIndex < curriculumSequence.length - 1 ? curriculumSequence[currentIndex + 1] : null;

  const handleTopicNavigation = (targetId: string) => {
    if (onSelectTopic) {
      onSelectTopic(targetId);
    }
  };

  // Trigger contextual AI assistance
  const handleAiTutorAction = async (mode: string, promptText: string) => {
    setActiveTutorMode(mode);
    setAiTutorLoading(true);
    setAiTutorResponse(null);

    try {
      const resp = await api.askAiAssistant({
        question: promptText,
        language: topic?.language || 'python',
        topic: topic?.title || 'Programming',
        topic_id: topicId,
        cognitive_load: currentLoad,
        tutor_mode: mode
      });
      setAiTutorResponse(resp);
    } catch (err) {
      console.error('AI Tutor request failed:', err);
    } finally {
      setAiTutorLoading(false);
    }
  };

  const handleFeedback = async (type: 'yes' | 'somewhat' | 'no') => {
    setFeedbackSent(type);
    try {
      await api.submitContentFeedback(topicId, type);
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center animate-pulse">
          <GraduationCap className="w-6 h-6 text-cyan-400" />
        </div>
        <p className="text-sm font-medium text-slate-400">Loading lesson modules and workspace...</p>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-300">
        <h2 className="text-xl font-bold mb-2">Lesson Not Found</h2>
        <p className="text-xs text-slate-400 mb-4">We could not find content for topic id: {topicId}</p>
        {onBackToCatalog && (
          <button
            onClick={onBackToCatalog}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
          >
            Return to Curriculum
          </button>
        )}
      </div>
    );
  }

  const courseTitle = topic.language === 'python' ? 'Python Programming' : `${(topic.language || 'Code').toUpperCase()} Track`;
  const moduleName = curriculumSequence[currentIndex]?.moduleTitle || 'Core Fundamentals';
  const progressPercent = Math.min(100, Math.round(((currentIndex + 1) / (curriculumSequence.length || 1)) * 100));

  // Key takeaways for summary
  const summaryItems = [
    'Variables serve as memory reference labels to Python objects',
    'Fundamental datatypes (int, float, bool, str, tuple) are strictly immutable',
    'Small integers and short strings are interned for rapid memory lookup',
    'The is operator checks memory identity, whereas == tests equality',
    'Immutable objects cannot be modified in-place; reassignment binds a new object'
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030712] light-theme:bg-[#F7F8FA] text-slate-100 light-theme:text-slate-900 transition-colors">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-30 bg-slate-950/95 light-theme:bg-white/95 border-b border-slate-800 light-theme:border-slate-200 backdrop-blur-md px-4 sm:px-6 py-2.5">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-3">
          {/* Left: Curriculum Toggle & Breadcrumbs */}
          <div className="flex items-center gap-2 sm:gap-3 truncate">
            {/* Sidebar Toggle for Desktop / Tablet */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                aria-label={isSidebarOpen ? "Collapse curriculum sidebar" : "Expand curriculum sidebar"}
                aria-expanded={isSidebarOpen}
                className="hidden lg:flex p-1.5 rounded-lg border border-slate-800 light-theme:border-slate-200 bg-slate-900/80 light-theme:bg-slate-100 text-slate-300 light-theme:text-slate-700 hover:text-white light-theme:hover:text-slate-900 text-xs items-center gap-1.5 transition-colors cursor-pointer"
                title={isSidebarOpen ? 'Collapse Curriculum Sidebar (Ctrl+B)' : 'Expand Curriculum Sidebar (Ctrl+B)'}
              >
                <SidebarIcon className="w-3.5 h-3.5 text-cyan-400 light-theme:text-blue-600" />
                <span className="text-[11px] font-medium hidden xl:inline">
                  {isSidebarOpen ? 'Curriculum' : 'Show Curriculum'}
                </span>
              </button>
            )}

            {/* Mobile Curriculum Drawer Trigger */}
            <button
              onClick={() => onOpenMobileSidebar && onOpenMobileSidebar()}
              className="lg:hidden p-1.5 rounded-lg border border-slate-800 light-theme:border-slate-200 bg-slate-900 light-theme:bg-slate-100 text-slate-300 light-theme:text-slate-700 cursor-pointer"
              aria-label="Open Course Curriculum"
            >
              <BookOpen className="w-4 h-4 text-cyan-400 light-theme:text-blue-600" />
            </button>

            {/* Breadcrumb Path */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 light-theme:text-slate-500 truncate">
              {onBackToPythonDashboard && topicId.startsWith('top-py-') ? (
                <button
                  onClick={onBackToPythonDashboard}
                  className="hover:text-cyan-400 light-theme:hover:text-blue-600 truncate font-medium text-cyan-400"
                >
                  Python Fundamentals
                </button>
              ) : onBackToCatalog ? (
                <button
                  onClick={onBackToCatalog}
                  className="hover:text-cyan-400 light-theme:hover:text-blue-600 truncate font-medium"
                >
                  {courseTitle}
                </button>
              ) : (
                <span className="truncate">{courseTitle}</span>
              )}
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="hidden md:inline truncate">{moduleName}</span>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0 hidden md:inline" />
              <span className="font-bold text-white light-theme:text-slate-900 truncate">
                {topic.title}
              </span>
            </nav>
          </div>

          {/* Right: Progress, Theme, Search, Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Progress indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-slate-400 light-theme:text-slate-500 font-medium">Progress:</span>
              <div className="w-20 lg:w-28 h-2 rounded-full bg-slate-800 light-theme:bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="font-mono font-bold text-cyan-400 light-theme:text-blue-600 text-[11px]">
                {progressPercent}%
              </span>
            </div>

            {/* Bookmark button */}
            <BookmarkButton
              itemType="lesson"
              itemId={topic.id}
              title={topic.title}
              snippet={topic.content_standard?.slice(0, 100)}
              topicId={topic.id}
              language={topic.language || 'python'}
            />

            {/* Personal Notes button */}
            <button
              onClick={() => setNoteModalOpen(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl border border-slate-800 light-theme:border-slate-200 bg-slate-900/60 light-theme:bg-slate-100 hover:bg-slate-800 light-theme:hover:bg-slate-200 text-slate-300 light-theme:text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
              title="Add personal note"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400 light-theme:text-blue-600" />
              <span className="hidden md:inline">Note</span>
            </button>

            {/* AI Assistant drawer trigger */}
            {onOpenAiDrawer && (
              <button
                onClick={onOpenAiDrawer}
                className="px-2.5 py-1 rounded-xl bg-purple-600/20 light-theme:bg-purple-100 border border-purple-500/30 text-purple-300 light-theme:text-purple-700 text-xs font-bold flex items-center gap-1 hover:bg-purple-600/30 transition-colors"
                title="Open AI Learning Copilot"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Tutor</span>
              </button>
            )}

            {/* Search trigger */}
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="p-1.5 rounded-xl border border-slate-800 light-theme:border-slate-200 bg-slate-900/60 light-theme:bg-slate-100 hover:bg-slate-800 text-slate-400 hover:text-white light-theme:hover:text-slate-900"
                title="Search topics (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-cyan-400 light-theme:text-blue-600" />
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-xl border border-slate-800 light-theme:border-slate-200 bg-slate-900/60 light-theme:bg-slate-100 text-slate-400 hover:text-white light-theme:hover:text-slate-900 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            </button>
          </div>
        </div>

        {/* Full-width Ambient Reading Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-800/40 light-theme:bg-slate-200/60 overflow-hidden pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(34,211,238,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* 2. WORKSPACE LAYOUT: MAIN CONTENT + STICKY ON THIS PAGE */}
      <div className="max-w-[1600px] mx-auto flex min-h-[calc(100vh-52px)]">

        {/* CENTER COLUMN: MAIN LESSON CONTENT */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 xl:px-12 py-6 sm:py-8 space-y-8 max-w-4xl mx-auto">
          {/* Mobile TOC Dropdown */}
          <LessonTOC isMobileDropdown />

          {/* SECTION 1: LESSON HEADER */}
          <section id="section-header" className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 light-theme:text-blue-600">
              <span className="uppercase tracking-wider">{courseTitle}</span>
              <span>•</span>
              <span className="text-purple-400 light-theme:text-purple-600">{moduleName}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white light-theme:text-slate-900 leading-tight">
              {topic.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 light-theme:text-slate-700 leading-relaxed max-w-3xl">
              {topic.shortDescription || topic.desc || topic.content_standard || 'Learn fundamental concepts, memory references, and core syntax.'}
            </p>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 light-theme:bg-slate-100 border border-slate-800 light-theme:border-slate-200 text-slate-300 light-theme:text-slate-700">
                <Clock className="w-3.5 h-3.5 text-cyan-400 light-theme:text-blue-600" />
                <span>⏱ {topic.estimatedMinutes || 20} min read</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 light-theme:bg-slate-100 border border-slate-800 light-theme:border-slate-200 text-slate-300 light-theme:text-slate-700">
                <span className="font-semibold">Difficulty:</span>
                <span className="text-emerald-400 light-theme:text-emerald-600 font-bold capitalize">
                  {topic.difficulty || topic.level || 'Beginner'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 light-theme:bg-slate-100 border border-slate-800 light-theme:border-slate-200 text-slate-300 light-theme:text-slate-700">
                <span>Curriculum:</span>
                <span className="font-mono font-bold text-cyan-400 light-theme:text-blue-600">12 Sections</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 light-theme:bg-slate-100 border border-slate-800 light-theme:border-slate-200 text-slate-300 light-theme:text-slate-700">
                <span>Course Progress:</span>
                <span className="font-mono font-bold text-purple-400 light-theme:text-purple-600">{progressPercent}%</span>
              </div>
            </div>

            {/* Learning Objectives Box */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 light-theme:border-slate-300 bg-slate-900/60 light-theme:bg-white shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 light-theme:text-blue-600">
                <GraduationCap className="w-4 h-4" />
                <span>Learning Objectives</span>
              </div>
              <p className="text-xs text-slate-300 light-theme:text-slate-700 font-medium">
                By the end of this lesson, you will be able to:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 light-theme:text-slate-600">
                {(topic.learningObjectives || [
                  "Understand Python's fundamental data types and memory model",
                  "Explain the difference between mutable and immutable objects",
                  "Identify common Python collections and sequence types",
                  "Inspect memory addresses and references using id() and is"
                ]).map((obj: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* SECTION 2: ADAPTIVE LEARNING INSIGHT CARD */}
          <AdaptiveInsightCard
            onOpenAdaptedLesson={() => onOpenAdaptedLesson?.(topicId)}
            topicId={topicId}
          />

          {/* SECTION 3: INTRODUCTION */}
          <section id="section-intro" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white light-theme:text-slate-900 flex items-center gap-2">
              <span className="w-2 h-5 rounded-full bg-cyan-500" />
              Introduction
            </h2>
            <div className="text-sm text-slate-300 light-theme:text-slate-700 leading-relaxed space-y-3">
              <p>
                In Python, <strong className="text-white light-theme:text-slate-900">everything is an object</strong>. When you write a statement such as <code>x = 10</code>, Python does not allocate a storage slot specifically labelled "x". Instead, it creates an integer object <code>10</code> in heap memory, and binds the name <code>x</code> to reference that object.
              </p>
              <p>
                Understanding how Python handles data types and object mutability is one of the most critical foundational milestones for writing bug-free, efficient, and idiomatic Python programs.
              </p>
            </div>
          </section>

          {/* SECTION 4: CONCEPT EXPLANATION (Varies by Active Mode: STANDARD / DETAILED / SIMPLIFIED) */}
          <section id="section-concept" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80 light-theme:border-slate-200">
              <h2 className="text-lg sm:text-xl font-bold text-white light-theme:text-slate-900 flex items-center gap-2">
                <span className="w-2 h-5 rounded-full bg-blue-500" />
                Concept Explanation
              </h2>
              
              {/* Interactive Mode Switcher Chips */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-900/90 light-theme:bg-slate-100 p-1 rounded-xl border border-slate-800 light-theme:border-slate-300">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 px-1.5 hidden md:inline">Mode:</span>
                {[
                  { id: 'STANDARD', label: 'Standard', icon: '📘' },
                  { id: 'DETAILED', label: 'Detailed', icon: '🔬' },
                  { id: 'SIMPLIFIED', label: 'Simplified', icon: '💡' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setContentModeManually(m.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeMode === m.id
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-400 light-theme:text-slate-600 hover:text-white light-theme:hover:text-slate-900 hover:bg-slate-800/60'
                    }`}
                    title={`Switch to ${m.label} explanation`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* STANDARD MODE RENDERING */}
            {activeMode === 'STANDARD' && (
              <div className="p-5 rounded-2xl bg-slate-900/40 light-theme:bg-white border border-slate-800 light-theme:border-slate-200 space-y-4 text-sm text-slate-300 light-theme:text-slate-700 leading-relaxed animate-fade-in">
                <p>
                  Python provides 14 primary built-in data types grouped into fundamental numbers, sequences, sets, mappings, and singletons.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 light-theme:bg-slate-50 border border-slate-800 light-theme:border-slate-200">
                    <strong className="text-cyan-400 light-theme:text-blue-600 block mb-1">Fundamental Types:</strong>
                    <code>int</code>, <code>float</code>, <code>complex</code>, <code>bool</code>, <code>str</code>. All are strictly immutable.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 light-theme:bg-slate-50 border border-slate-800 light-theme:border-slate-200">
                    <strong className="text-purple-400 light-theme:text-purple-600 block mb-1">Collections & Sequences:</strong>
                    <code>list</code> (mutable), <code>tuple</code> (immutable), <code>dict</code> (mutable key-value), <code>set</code> (mutable unique).
                  </div>
                </div>
                <p>
                  <strong>Immutability Rule:</strong> Once an immutable object is allocated in memory, its content can never be modified. When you perform operations like <code>x = x + 1</code>, Python evaluates the right-hand side, allocates a brand new integer object, and re-points the variable label <code>x</code> to that new address.
                </p>
              </div>
            )}

            {/* DETAILED MODE RENDERING */}
            {activeMode === 'DETAILED' && (
              <div className="p-6 rounded-2xl bg-slate-900/50 light-theme:bg-white border border-purple-500/30 space-y-5 text-sm text-slate-300 light-theme:text-slate-700 leading-relaxed animate-fade-in">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 light-theme:text-purple-800 font-medium">
                  <strong>Detailed Technical Breakdown:</strong> Covering CPython 3 object structure, PyObject headers, reference counting, and object interning caches.
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-white light-theme:text-slate-900">
                    Why It Works: The CPython Object Architecture
                  </h3>
                  <p>
                    Under the hood, every Python object is backed by a C structure called <code>PyObject</code>. This contains two vital header fields:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-xs sm:text-sm">
                    <li><code>ob_refcnt</code>: A 64-bit reference counter tracking how many variable references point to this object.</li>
                    <li><code>ob_type</code>: A pointer to the type description object (defining its supported methods, arithmetic, and properties).</li>
                  </ol>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800 light-theme:border-slate-200">
                  <h3 className="text-base font-bold text-white light-theme:text-slate-900">
                    How It Works: Object Interning & Memory Optimization
                  </h3>
                  <p>
                    Because allocating thousands of small numbers would burden the heap and garbage collector, CPython automatically pre-allocates an internal array of integer objects for values between <strong>-5 and 256</strong>.
                  </p>
                  <p>
                    Any time your code uses an integer in this range (e.g. <code>a = 100; b = 100</code>), Python returns the exact same cached reference. Therefore, <code>a is b</code> evaluates to <code>True</code>! For numbers outside this range (e.g. 1000), separate objects may be created unless interned by compilation folding.
                  </p>
                </div>
              </div>
            )}

            {/* SIMPLIFIED MODE RENDERING */}
            {activeMode === 'SIMPLIFIED' && (
              <div className="p-5 rounded-2xl bg-slate-900/40 light-theme:bg-white border border-cyan-500/30 space-y-4 text-sm text-slate-300 light-theme:text-slate-700 leading-relaxed animate-fade-in">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 light-theme:text-blue-800 font-medium">
                  <strong>Everyday Analogy:</strong> Think of variables as sticky name tags on gift boxes.
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white light-theme:text-slate-900">
                    Simple Definition:
                  </h3>
                  <p>
                    A <strong className="text-white light-theme:text-slate-900">variable</strong> is just a name tag. An <strong className="text-white light-theme:text-slate-900">object</strong> is the box with value inside.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                    <li><strong className="text-emerald-400">Immutable:</strong> A sealed box that cannot be opened or changed. If you want a different number, you stick the name tag onto a new box.</li>
                    <li><strong className="text-amber-400">Mutable:</strong> An open shopping cart. You can add or take away items without getting a new cart.</li>
                  </ul>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 5: SYNTAX REFERENCE */}
          <section id="section-syntax" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white light-theme:text-slate-900 flex items-center gap-2">
              <span className="w-2 h-5 rounded-full bg-indigo-500" />
              Syntax & Usage
            </h2>
            <div className="rounded-xl border border-slate-800 light-theme:border-slate-300 bg-slate-950 light-theme:bg-slate-50 p-4 font-mono text-xs sm:text-sm text-cyan-300 light-theme:text-blue-800 overflow-x-auto leading-relaxed">
              <pre>{topic.syntax || `# Base conversions & variable binding\na = 15\nprint(bin(a)) # Output: 0b1111\nprint(hex(a)) # Output: 0xf\n\n# Memory identity check\nx = 256; y = 256\nprint(x is y) # True (interning)\nprint(id(x) == id(y)) # True`}</pre>
            </div>
          </section>

          {/* SECTION 6: INTERACTIVE CODE EXAMPLE (Connected to pythonRunner) */}
          <section id="section-code-example" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-white light-theme:text-slate-900 flex items-center gap-2">
                <span className="w-2 h-5 rounded-full bg-emerald-500" />
                Interactive Code Example
              </h2>
              <span className="text-xs text-slate-400">Run & edit live in browser</span>
            </div>

            <InteractiveCodeBlock
              title="Python Memory Identity & Immutability Sandbox"
              language="python"
              topicId={topicId}
              initialCode={`# 1. Variables referencing identical integer objects (Interning)
a = 100
b = 100
print("Same value (==)?", a == b)
print("Same memory reference (is)?", a is b)
print("Address of a:", id(a))

# 2. Immutability: Modify variable 'a'
a = a + 1
print("\\nAfter a = a + 1:")
print("New value of a:", a)
print("Value of b:", b)
print("Did address change?", a is not b)
print("New address of a:", id(a))
`}
              explanationOfOutput="Notice how `a` and `b` initially share the exact same memory address (`id(a) == id(b)`). When we compute `a = a + 1`, Python allocates a new integer 101 and rebinds the label `a`. Variable `b` continues pointing to the original immutable integer 100."
            />
          </section>

          {/* SECTION 7: VISUAL CONCEPT EXPLAINER */}
          <VisualConceptExplainer
            topicId={topicId}
            topicTitle={topic.title}
          />

          {/* SECTION 8: KEY TAKEAWAYS */}
          <section id="section-takeaway" className="space-y-3">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/30 via-slate-900 to-indigo-950/30 light-theme:bg-blue-50/70 border border-blue-500/30 light-theme:border-blue-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 light-theme:text-blue-700">
                <Sparkles className="w-4 h-4" />
                Key Takeaway
              </div>
              <p className="text-sm font-semibold text-white light-theme:text-slate-900 leading-relaxed">
                A variable in Python refers to an object. Mutable objects can be modified in-place, while immutable objects cannot be changed once created. Reassigning an immutable variable creates a new object in memory.
              </p>
            </div>
          </section>

          {/* SECTION 9: COMMON MISTAKES (Wrong vs Correct) */}
          <section id="section-mistakes" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white light-theme:text-slate-900 flex items-center gap-2">
              <span className="w-2 h-5 rounded-full bg-rose-500" />
              Common Mistakes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mistake 1 */}
              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/10 light-theme:bg-rose-50/50 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-rose-400 light-theme:text-rose-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Mistake: Trying to modify immutable string in-place</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 light-theme:bg-white font-mono text-[11px] text-rose-300 border border-rose-500/20">
                  <code>
                    s = "Hello"<br />
                    s[0] = "h" # ❌ TypeError: 'str' does not support item assignment
                  </code>
                </div>
                <p className="text-slate-300 light-theme:text-slate-600">
                  Strings cannot be changed in place. Instead, create a new string using slicing or formatting: <code>s = "h" + s[1:]</code>.
                </p>
              </div>

              {/* Mistake 2 */}
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/10 light-theme:bg-amber-50/50 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 light-theme:text-amber-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Mistake: Confusing `is` with `==`</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 light-theme:bg-white font-mono text-[11px] text-amber-300 border border-amber-500/20">
                  <code>
                    list1 = [1, 2, 3]<br />
                    list2 = [1, 2, 3]<br />
                    print(list1 is list2) # ❌ False (Distinct objects!)<br />
                    print(list1 == list2) # ✔ True (Same contents)
                  </code>
                </div>
                <p className="text-slate-300 light-theme:text-slate-600">
                  Use <code>==</code> when comparing values/content. Use <code>is</code> only when verifying if two variables point to the exact same memory address (e.g. <code>x is None</code>).
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 10: REAL-WORLD EXAMPLE */}
          <section id="section-real-world" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white light-theme:text-slate-900 flex items-center gap-2">
              <span className="w-2 h-5 rounded-full bg-emerald-500" />
              Real-World Application
            </h2>
            <div className="p-5 rounded-2xl bg-slate-900/50 light-theme:bg-white border border-slate-800 light-theme:border-slate-200 text-xs sm:text-sm text-slate-300 light-theme:text-slate-700 leading-relaxed space-y-2.5">
              <p>
                In production systems, understanding data types and immutability directly affects:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400 light-theme:text-slate-600">
                <li><strong className="text-white light-theme:text-slate-800">Thread Safety & Concurrency:</strong> Immutable objects like tuples and frozensets can be freely shared across multiple threads without lock contention.</li>
                <li><strong className="text-white light-theme:text-slate-800">Dictionary Keys:</strong> Only immutable, hashable types can be used as keys in Python dictionaries. Attempting to use a mutable list as a key raises an immediate <code>TypeError: unhashable type: 'list'</code>.</li>
                <li><strong className="text-white light-theme:text-slate-800">Database Serialization:</strong> Parsing JSON payloads into typed records prevents accidental mutation bugs in REST and GraphQL APIs.</li>
              </ul>
            </div>
          </section>

          {/* SECTION 11: TRY YOURSELF INTERACTIVE PRACTICE */}
          <TryYourselfSandbox
            topicId={topicId}
            prompt="Create a variable called age and assign it the integer value 20. Then print the value of age using print(age)."
            expectedOutputMatcher="20"
            hint="Define age = 20, then call print(age)."
            solution="age = 20\nprint(age)"
          />

          {/* SECTION 12: IN-LESSON MINI QUIZ */}
          <InLessonQuiz topicId={topicId} />

          {/* SECTION 13: IN-LESSON CODING CHALLENGE */}
          <InLessonCodingChallenge
            topicId={topicId}
            onOpenFullStudio={onOpenCoding}
          />

          {/* SECTION 14: CONTEXTUAL AI TUTOR ACTION BAR */}
          <section className="p-5 rounded-2xl border border-slate-800 light-theme:border-slate-200 bg-slate-900/40 light-theme:bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white light-theme:text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 light-theme:text-purple-600" />
                Ask In-Lesson AI Copilot
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Instant Contextual Explanations</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { mode: 'EXPLAIN', label: 'Explain this concept', prompt: `Explain ${topic.title} with clear mechanics.` },
                { mode: 'SIMPLIFY', label: 'Make it simpler', prompt: `Simplify ${topic.title} with a real-world analogy.` },
                { mode: 'EXAMPLE', label: 'Give another example', prompt: `Show another practical code example of ${topic.title}.` },
                { mode: 'DEBUG', label: 'Why does code fail?', prompt: `What are the most common subtle bugs related to ${topic.title}?` },
                { mode: 'HINT', label: 'Give me a hint', prompt: `Give me an educational hint to better master ${topic.title}.` }
              ].map(chip => (
                <button
                  key={chip.mode}
                  onClick={() => handleAiTutorAction(chip.mode, chip.prompt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    activeTutorMode === chip.mode
                      ? 'border-purple-500 bg-purple-950/40 text-purple-300 light-theme:bg-purple-100 light-theme:text-purple-800'
                      : 'border-slate-800 light-theme:border-slate-200 bg-slate-950/60 light-theme:bg-slate-50 text-slate-400 light-theme:text-slate-600 hover:text-white light-theme:hover:text-slate-900'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {aiTutorLoading && (
              <div className="py-3.5 px-4 rounded-xl border border-purple-500/20 bg-purple-950/20 light-theme:bg-purple-50/60 flex items-center gap-3 text-xs text-purple-300 light-theme:text-purple-700 animate-fade-in">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-typing-dot-1" />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-typing-dot-2" />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-typing-dot-3" />
                </div>
                <span className="font-medium">Consulting knowledge base calibrated to your learning pace...</span>
              </div>
            )}

            {aiTutorResponse && (
              <div className="p-4 sm:p-5 rounded-xl border border-purple-500/40 bg-gradient-to-b from-purple-950/20 to-slate-950 light-theme:bg-purple-50/80 text-xs text-slate-200 light-theme:text-slate-800 leading-relaxed animate-pop-in space-y-2.5 shadow-lg shadow-purple-950/20">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-400 light-theme:text-purple-700 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> AI Copilot Explanation
                    </span>
                    {activeTutorMode && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {activeTutorMode}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiTutorResponse.answer || '');
                    }}
                    className="px-2 py-0.5 rounded-lg border border-purple-500/30 hover:bg-purple-900/40 text-purple-300 hover:text-purple-100 transition-colors text-[11px] flex items-center gap-1"
                    title="Copy AI response"
                  >
                    <span>Copy</span>
                  </button>
                </div>
                <div className="whitespace-pre-line leading-relaxed text-slate-300 light-theme:text-slate-700 text-xs sm:text-sm">
                  {aiTutorResponse.answer}
                </div>
              </div>
            )}
          </section>

          {/* SECTION 15: USER FEEDBACK */}
          <div className="p-3.5 rounded-xl border border-slate-800 light-theme:border-slate-200 bg-slate-900/30 light-theme:bg-slate-50 flex items-center justify-between text-xs text-slate-400 light-theme:text-slate-600">
            <span>Was this lesson explanation clear and helpful?</span>
            <div className="flex items-center gap-2">
              {feedbackSent ? (
                <span className="text-emerald-400 font-semibold font-mono">✔ Feedback logged!</span>
              ) : (
                <>
                  <button
                    onClick={() => handleFeedback('yes')}
                    className="px-3 py-1 rounded-lg border border-slate-800 light-theme:border-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleFeedback('somewhat')}
                    className="px-3 py-1 rounded-lg border border-slate-800 light-theme:border-slate-300 hover:border-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Somewhat
                  </button>
                  <button
                    onClick={() => handleFeedback('no')}
                    className="px-3 py-1 rounded-lg border border-slate-800 light-theme:border-slate-300 hover:border-rose-500 hover:text-rose-400 transition-colors"
                  >
                    No
                  </button>
                </>
              )}
            </div>
          </div>

          {/* SECTION 16: LESSON SUMMARY & PREVIOUS / NEXT NAVIGATION */}
          <LessonSummaryCard
            topicTitle={topic.title}
            learnedItems={summaryItems}
            prevTopic={prevTopic}
            nextTopic={nextTopic}
            onSelectTopic={handleTopicNavigation}
            onReviewLesson={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
        </main>

        {/* RIGHT COLUMN: STICKY "ON THIS PAGE" TABLE OF CONTENTS */}
        <aside className="hidden xl:block w-64 shrink-0 px-4 py-8">
          <LessonTOC />
        </aside>
      </div>

      {/* Quick Personal Note Modal */}
      <QuickNoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        language={topic.language || 'python'}
        topicId={topic.id}
        subtopicTitle={topic.title}
        defaultTitle={`${topic.title} - Personal Notes`}
      />
    </div>
  );
};
