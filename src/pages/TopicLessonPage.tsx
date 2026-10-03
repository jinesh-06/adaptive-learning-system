import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useCognitive, ContentMode } from '../context/CognitiveContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { telemetry } from '../services/telemetry';
import { mockTopicDetails, mockCourses } from '../services/mockFallback';
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

const ALL_TOPICS: any[] = [
  ...PYTHON_FUNDAMENTALS_TOPICS,
  ...PYTHON_INTERMEDIATE_TOPICS,
  ...PYTHON_ADVANCED_TOPICS,
  ...C_FUNDAMENTALS_TOPICS,
  ...C_INTERMEDIATE_TOPICS,
  ...C_ADVANCED_TOPICS,
  ...CPP_FUNDAMENTALS_TOPICS,
  ...CPP_OOP_TOPICS,
  ...CPP_ADVANCED_TOPICS,
  ...JAVA_FUNDAMENTALS_TOPICS,
  ...JAVA_OOP_TOPICS,
  ...JAVA_ADV_TOPICS
];
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
  onBackToPythonIntermediateDashboard?: () => void;
  onBackToPythonAdvancedDashboard?: () => void;
  onBackToCDashboard?: () => void;
  onBackToCIntermediateDashboard?: () => void;
  onBackToCAdvancedDashboard?: () => void;
  onBackToCppDashboard?: () => void;
  onBackToCppOopDashboard?: () => void;
  onBackToCppAdvDashboard?: () => void;
  onBackToJavaDashboard?: () => void;
  onBackToJavaOopDashboard?: () => void;
  onBackToJavaAdvDashboard?: () => void;
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
  onBackToPythonIntermediateDashboard,
  onBackToPythonAdvancedDashboard,
  onBackToCDashboard,
  onBackToCIntermediateDashboard,
  onBackToCAdvancedDashboard,
  onBackToCppDashboard,
  onBackToCppOopDashboard,
  onBackToCppAdvDashboard,
  onBackToJavaDashboard,
  onBackToJavaOopDashboard,
  onBackToJavaAdvDashboard,
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
  const [completedLocally, setCompletedLocally] = useState<boolean>(false);

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
      const curTopic = ALL_TOPICS.find(t => t.id === topicId);
      try {
        const data = await api.getTopicDetail(topicId);
        if (data) {
          setTopic(curTopic ? { ...curTopic, ...data } : data);
        } else {
          // Fallback to local mock topic details
          const fallback = mockTopicDetails[topicId] || (curTopic ? curTopic : mockTopicDetails['top-py-fundamentals']);
          setTopic(curTopic ? { ...curTopic, ...fallback } : fallback);
        }
      } catch (err) {
        console.warn('Failed to load topic detail via API, using mock:', err);
        const fallback = mockTopicDetails[topicId] || (curTopic ? curTopic : mockTopicDetails['top-py-fundamentals']);
        setTopic(curTopic ? { ...curTopic, ...fallback } : fallback);
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

    const isCInt = C_INTERMEDIATE_TOPICS.some(t => t.id === topicId);
    const isCAdv = C_ADVANCED_TOPICS.some(t => t.id === topicId);
    if (isCAdv) {
      return C_ADVANCED_TOPICS.map(t => ({
        id: t.id,
        title: t.title,
        moduleTitle: t.moduleTitle || 'Advanced C Systems & Data Structures'
      }));
    }
    if (isCInt) {
      return C_INTERMEDIATE_TOPICS.map(t => ({
        id: t.id,
        title: t.title,
        moduleTitle: t.moduleTitle || 'C Pointers & Memory Management'
      }));
    }
    if (topicId.startsWith('top-c-')) {

      return C_FUNDAMENTALS_TOPICS.map(t => ({
        id: t.id,
        title: t.title,
        moduleTitle: t.moduleTitle || 'Core Language Foundations'
      }));
    }
    if (topicId.startsWith('top-cpp-adv-')) {
      return CPP_ADVANCED_TOPICS.map(t => ({
        id: t.id,
        title: t.title,
        moduleTitle: t.moduleTitle || 'Advanced C++ & STL Architecture'
      }));
    }
    if (topicId.startsWith('top-cpp-oop-')) {
      return CPP_OOP_TOPICS.map(t => ({
        id: t.id,
        title: t.title,
        moduleTitle: t.moduleTitle || 'Object-Oriented C++ Architecture & Design'
      }));
    }
    if (topicId.startsWith('top-cpp-')) {
      return CPP_FUNDAMENTALS_TOPICS.map(t => ({
        id: t.id,
        title: t.title,
        moduleTitle: t.moduleTitle || 'C++ Modern Fundamentals'
      }));
    }
    if (topicId.startsWith('top-java-adv-')) {
      return JAVA_ADV_TOPICS.map(t => ({
        id: t.id,
        title: t.title,
        moduleTitle: t.moduleTitle || 'Advanced Java & Collections Framework'
      }));
    }
    if (topicId.startsWith('top-java-oop-')) {
      return JAVA_OOP_TOPICS.map(t => ({
        id: t.id,
        title: t.title,
        moduleTitle: t.moduleTitle || 'Java Object-Oriented Design'
      }));
    }
    if (topicId.startsWith('top-java-')) {
      return JAVA_FUNDAMENTALS_TOPICS.map(t => ({
        id: t.id,
        title: t.title,
        moduleTitle: t.moduleTitle || 'Java Core Architecture & Basics'
      }));
    }
    const isPyAdv = PYTHON_ADVANCED_TOPICS.some(t => t.id === topicId) || topicId.startsWith('top-py-adv-');
    if (isPyAdv) {
      return PYTHON_ADVANCED_TOPICS.map(t => ({
        id: t.id,
        title: t.title,
        moduleTitle: t.moduleTitle
      }));
    }
    const isPyInt = PYTHON_INTERMEDIATE_TOPICS.some(t => t.id === topicId) || topicId.startsWith('top-py-int-');
    if (isPyInt) {
      return PYTHON_INTERMEDIATE_TOPICS.map(t => ({
        id: t.id,
        title: t.title,
        moduleTitle: t.moduleTitle
      }));
    }
    const isPyFund = PYTHON_FUNDAMENTALS_TOPICS.some(t => t.id === topicId);
    if (isPyFund) {
      return PYTHON_FUNDAMENTALS_TOPICS.map(t => ({
        id: t.id,
        title: t.title,
        moduleTitle: 'Python Fundamentals'
      }));
    }
    const courseLang = topic?.language || (topicId.includes('-c-') ? 'c' : topicId.includes('-cpp-') ? 'cpp' : topicId.includes('-java-') ? 'java' : 'python');
    const pyCourse = mockCourses.find(c => c.language === courseLang) || mockCourses[0];
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
    const isTopicCAdv = C_ADVANCED_TOPICS.some(t => t.id === topicId);
    const isTopicCInt = C_INTERMEDIATE_TOPICS.some(t => t.id === topicId);
    if (isTopicCAdv) {
      api.updateCAdvProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 }).catch(() => {});
    } else if (isTopicCInt) {
      api.updateCIntermediateProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 }).catch(() => {});
    } else if (topicId.startsWith('top-c-')) {
      api.updateCProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 }).catch(() => {});
    } else if (topicId.startsWith('top-cpp-adv-')) {
      api.updateCppAdvProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 }).catch(() => {});
    } else if (topicId.startsWith('top-cpp-oop-')) {
      api.updateCppOopProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 }).catch(() => {});
    } else if (topicId.startsWith('top-cpp-')) {
      api.updateCppProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 }).catch(() => {});
    } else if (topicId.startsWith('top-java-')) {
      api.updateJavaProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 }).catch(() => {});
    } else if (topicId.startsWith('top-py-')) {
      api.updatePythonProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 }).catch(() => {});
    }
    if (onSelectTopic) {
      onSelectTopic(targetId);
    }
  };

  const handleMarkCompleted = async () => {
    setCompletedLocally(true);
    try {
      const isTopicCAdv = C_ADVANCED_TOPICS.some(t => t.id === topicId);
      const isTopicCInt = C_INTERMEDIATE_TOPICS.some(t => t.id === topicId);
      if (isTopicCAdv) {
        await api.updateCAdvProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 });
      } else if (isTopicCInt) {
        await api.updateCIntermediateProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 });
      } else if (topicId.startsWith('top-c-')) {
        await api.updateCProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 });
      } else if (topicId.startsWith('top-cpp-adv-')) {
        await api.updateCppAdvProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 });
      } else if (topicId.startsWith('top-cpp-oop-')) {
        await api.updateCppOopProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 });
      } else if (topicId.startsWith('top-cpp-')) {
        await api.updateCppProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 });
      } else if (topicId.startsWith('top-java-')) {
        await api.updateJavaProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 });
      } else if (topicId.startsWith('top-py-')) {
        await api.updatePythonProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 });
      }
    } catch (err) {
      console.warn('Could not save completion progress:', err);
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
      if (topicId.startsWith('top-c-')) {
        await api.updateCProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 });
      } else if (topicId.startsWith('top-cpp-adv-')) {
        await api.updateCppAdvProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 });
      } else if (topicId.startsWith('top-cpp-')) {
        await api.updateCppProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 });
      } else if (topicId.startsWith('top-java-adv-')) {
        await api.updateJavaAdvProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 });
      } else if (topicId.startsWith('top-java-oop-')) {
        await api.updateJavaOopProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 });
      } else if (topicId.startsWith('top-java-')) {
        await api.updateJavaProgress({ topic_id: topicId, status: 'COMPLETED', completion_pct: 100, time_spent_delta: 60 });
      }
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

  const isAdvanced = topicId.startsWith('top-py-adv-') || PYTHON_ADVANCED_TOPICS.some(t => t.id === topicId);
  const isIntermediate = topicId.startsWith('top-py-int-') || PYTHON_INTERMEDIATE_TOPICS.some(t => t.id === topicId);
  const isCInt = C_INTERMEDIATE_TOPICS.some(t => t.id === topicId);
  const isCAdv = C_ADVANCED_TOPICS.some(t => t.id === topicId);
  const isCppAdv = topicId.startsWith('top-cpp-adv-') || CPP_ADVANCED_TOPICS.some(t => t.id === topicId);
  const isCppOop = topicId.startsWith('top-cpp-oop-') || CPP_OOP_TOPICS.some(t => t.id === topicId);
  const isJavaAdv = topicId.startsWith('top-java-adv-') || JAVA_ADV_TOPICS.some(t => t.id === topicId);
  const isJavaOop = topicId.startsWith('top-java-oop-') || JAVA_OOP_TOPICS.some(t => t.id === topicId);
  const courseTitle = isAdvanced
    ? 'Advanced Python & Async'
    : isIntermediate
    ? 'Intermediate Python & DSA'
    : isCAdv
    ? 'Advanced C Systems & Data Structures'
    : isCInt
    ? 'C Pointers & Memory Management'
    : isCppAdv
    ? 'Advanced C++ & STL Architecture'
    : isCppOop
    ? 'Object-Oriented C++'
    : isJavaAdv
    ? 'Advanced Java & Collections Framework'
    : isJavaOop
    ? 'Java Object-Oriented Design'
    : topic.language === 'python'
    ? 'Python Fundamentals'
    : topic.language === 'c' || topicId.startsWith('top-c-')
    ? 'C Programming Foundations'
    : topic.language === 'cpp'
    ? (topicId === 'top-cpp-references-memory' || topicId.startsWith('top-cpp-adv-')
        ? 'Advanced C++ & STL Architecture'
        : topicId === 'top-cpp-oop'
        ? 'Object-Oriented C++'
        : 'C++ Modern Fundamentals')
    : topic.language === 'java' || topicId.startsWith('top-java-')
    ? 'Java Core Architecture & Basics'
    : `${(topic.language || 'Code').toUpperCase()} Track`;
  const moduleName = curriculumSequence[currentIndex]?.moduleTitle || 'Core Fundamentals';
  const progressPercent = Math.min(100, Math.round(((currentIndex + 1) / (curriculumSequence.length || 1)) * 100));

  // Key takeaways for summary
  const summaryItems = topic.summary || [
    'Master fundamental syntax and language paradigms',
    'Understand memory layout and runtime execution boundaries',
    'Write clean, well-tested code that prevents common anti-patterns'
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
              {isAdvanced && onBackToPythonAdvancedDashboard ? (
                <button
                  onClick={onBackToPythonAdvancedDashboard}
                  className="hover:text-cyan-400 light-theme:hover:text-blue-600 truncate font-medium text-cyan-400"
                >
                  Advanced Python & Async
                </button>
              ) : isIntermediate && onBackToPythonIntermediateDashboard ? (
                <button
                  onClick={onBackToPythonIntermediateDashboard}
                  className="hover:text-cyan-400 light-theme:hover:text-blue-600 truncate font-medium text-cyan-400"
                >
                  Intermediate Python & DSA
                </button>
              ) : onBackToPythonDashboard && topicId.startsWith('top-py-') ? (
                <button
                  onClick={onBackToPythonDashboard}
                  className="hover:text-cyan-400 light-theme:hover:text-blue-600 truncate font-medium text-cyan-400"
                >
                  Python Fundamentals
                </button>
              ) : isCAdv && onBackToCAdvancedDashboard ? (
                <button
                  onClick={onBackToCAdvancedDashboard}
                  className="hover:text-cyan-400 light-theme:hover:text-blue-600 truncate font-medium text-cyan-400"
                >
                  Advanced C Systems & Data Structures
                </button>
              ) : isCInt && onBackToCIntermediateDashboard ? (
                <button
                  onClick={onBackToCIntermediateDashboard}
                  className="hover:text-cyan-400 light-theme:hover:text-blue-600 truncate font-medium text-cyan-400"
                >
                  C Pointers & Memory Management
                </button>
              ) : onBackToCDashboard && topicId.startsWith('top-c-') ? (
                <button
                  onClick={onBackToCDashboard}
                  className="hover:text-cyan-400 light-theme:hover:text-blue-600 truncate font-medium text-cyan-400"
                >
                  C Programming Foundations
                </button>
              ) : onBackToCppAdvDashboard && (topicId.startsWith('top-cpp-adv-') || isCppAdv) ? (
                <button
                  onClick={onBackToCppAdvDashboard}
                  className="hover:text-cyan-400 light-theme:hover:text-blue-600 truncate font-medium text-cyan-400"
                >
                  Advanced C++ & STL Architecture
                </button>
              ) : onBackToCppOopDashboard && (topicId.startsWith('top-cpp-oop-') || isCppOop) ? (
                <button
                  onClick={onBackToCppOopDashboard}
                  className="hover:text-cyan-400 light-theme:hover:text-blue-600 truncate font-medium text-cyan-400"
                >
                  Object-Oriented C++
                </button>
              ) : onBackToCppDashboard && topicId.startsWith('top-cpp-') ? (
                <button
                  onClick={onBackToCppDashboard}
                  className="hover:text-cyan-400 light-theme:hover:text-blue-600 truncate font-medium text-cyan-400"
                >
                  C++ Modern Fundamentals
                </button>
              ) : onBackToJavaAdvDashboard && (topicId.startsWith('top-java-adv-') || isJavaAdv) ? (
                <button
                  onClick={onBackToJavaAdvDashboard}
                  className="hover:text-cyan-400 light-theme:hover:text-blue-600 truncate font-medium text-cyan-400"
                >
                  Advanced Java & Collections
                </button>
              ) : onBackToJavaOopDashboard && topicId.startsWith('top-java-oop-') ? (
                <button
                  onClick={onBackToJavaOopDashboard}
                  className="hover:text-cyan-400 light-theme:hover:text-blue-600 truncate font-medium text-cyan-400"
                >
                  Java Object-Oriented Design
                </button>
              ) : onBackToJavaDashboard && topicId.startsWith('top-java-') ? (
                <button
                  onClick={onBackToJavaDashboard}
                  className="hover:text-cyan-400 light-theme:hover:text-blue-600 truncate font-medium text-cyan-400"
                >
                  Java Core Architecture & Basics
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
                {topic.shortDescription || topic.desc || topic.conceptExplanation?.split('\n\n')[0] || 'Understand core operational primitives, memory organization, and syntax.'}
              </p>
              {topic.conceptExplanation?.split('\n\n')[1] && (
                <p>{topic.conceptExplanation.split('\n\n')[1]}</p>
              )}
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
                <div className="whitespace-pre-line leading-relaxed space-y-2">
                  {topic.conceptExplanation || topic.content_standard}
                </div>
                {topic.simpleExample && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-950/60 light-theme:bg-slate-50 border border-slate-800 light-theme:border-slate-200 space-y-2">
                    <strong className="text-xs text-cyan-400 light-theme:text-blue-600 font-mono uppercase tracking-wider block">Foundational Example:</strong>
                    <pre className="font-mono text-xs text-emerald-300 light-theme:text-emerald-800 overflow-x-auto whitespace-pre-wrap">{topic.simpleExample.code}</pre>
                    <p className="text-xs text-slate-400 light-theme:text-slate-600">{topic.simpleExample.explanation}</p>
                  </div>
                )}
              </div>
            )}

            {/* DETAILED MODE RENDERING */}
            {activeMode === 'DETAILED' && (
              <div className="p-6 rounded-2xl bg-slate-900/50 light-theme:bg-white border border-purple-500/30 space-y-5 text-sm text-slate-300 light-theme:text-slate-700 leading-relaxed animate-fade-in">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 light-theme:text-purple-800 font-medium">
                  <strong>Deep Architecture Breakdown:</strong> Execution pipeline, memory allocation, and runtime mechanics for {topic.title}.
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-white light-theme:text-slate-900">
                    Step-by-Step Architectural Mechanics
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    {(topic.stepByStep || [
                      "1. Program parsing and syntax tree construction",
                      "2. Static type checking and symbol table resolution",
                      "3. Code generation or bytecode interpretation",
                      "4. Stack and heap frame allocation during runtime execution"
                    ]).map((step: string, sIdx: number) => (
                      <div key={sIdx} className="p-2.5 rounded-lg bg-slate-950/60 light-theme:bg-slate-50 border border-slate-800/80 light-theme:border-slate-200">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SIMPLIFIED MODE RENDERING */}
            {activeMode === 'SIMPLIFIED' && (
              <div className="p-5 rounded-2xl bg-slate-900/40 light-theme:bg-white border border-cyan-500/30 space-y-4 text-sm text-slate-300 light-theme:text-slate-700 leading-relaxed animate-fade-in">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 light-theme:text-blue-800 font-medium">
                  <strong>Everyday Analogy & Core Concept:</strong>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white light-theme:text-slate-900">
                    {topic.title} Made Simple
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 light-theme:text-slate-700">
                    {topic.shortDescription || topic.desc || (topic.conceptExplanation ? topic.conceptExplanation.split('.')[0] + '.' : 'Master the foundational mechanics.')}
                  </p>
                  {topic.simpleExample && (
                    <div className="p-3 rounded-xl bg-slate-950/60 light-theme:bg-slate-50 border border-slate-800">
                      <p className="text-xs text-emerald-400 font-semibold mb-1">Key Rule:</p>
                      <p className="text-xs text-slate-300 light-theme:text-slate-600">{topic.simpleExample.explanation}</p>
                    </div>
                  )}
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
              <pre>{topic.syntax || `// Syntax for ${topic.title}\n${topic.codeExample || ''}`}</pre>
            </div>
          </section>

          {/* SECTION 6: INTERACTIVE CODE EXAMPLE (Connected to code runner) */}
          <section id="section-code-example" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-white light-theme:text-slate-900 flex items-center gap-2">
                <span className="w-2 h-5 rounded-full bg-emerald-500" />
                Interactive Code Example
              </h2>
              <span className="text-xs text-slate-400">Run & edit live in browser</span>
            </div>

            <InteractiveCodeBlock
              title={`${topic.title} Interactive Sandbox`}
              language={topic.language || 'python'}
              topicId={topicId}
              initialCode={topic.codeExample || topic.simpleExample?.code || `// Interactive code for ${topic.title}`}
              explanationOfOutput={topic.expectedOutput || topic.simpleExample?.explanation || `Executed ${topic.title} successfully.`}
            />
          </section>

          {/* SECTION 7: VISUAL LEARNING & ARCHITECTURAL DIAGRAMS */}
          {topic.visualDiagram && (
            <section id="section-diagram" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-white light-theme:text-slate-900 flex items-center gap-2">
                <span className="w-2 h-5 rounded-full bg-cyan-400" />
                Architectural & Memory Diagram
              </h2>
              <div className="rounded-xl border border-cyan-500/30 bg-slate-950 p-4 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto shadow-inner shadow-cyan-950/20 leading-relaxed">
                <pre>{typeof topic.visualDiagram === 'string' ? topic.visualDiagram : JSON.stringify(topic.visualDiagram, null, 2)}</pre>
              </div>
            </section>
          )}

          <VisualConceptExplainer
            topicId={topicId}
            topicTitle={topic.title}
            language={topic.language || 'python'}
          />

          {/* SECTION 8: KEY TAKEAWAYS */}
          <section id="section-takeaway" className="space-y-3">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/30 via-slate-900 to-indigo-950/30 light-theme:bg-blue-50/70 border border-blue-500/30 light-theme:border-blue-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 light-theme:text-blue-700">
                <Sparkles className="w-4 h-4" />
                Key Takeaway
              </div>
              <ul className="space-y-1.5 text-sm text-slate-200 light-theme:text-slate-800">
                {(topic.summary || [
                  'Master core procedural and architectural foundations',
                  'Verify memory structures and strict compiler bounds',
                  'Apply structured control patterns for robust execution'
                ]).map((item: string, sIdx: number) => (
                  <li key={sIdx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* SECTION 9: COMMON MISTAKES (Wrong vs Correct) */}
          <section id="section-mistakes" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white light-theme:text-slate-900 flex items-center gap-2">
              <span className="w-2 h-5 rounded-full bg-rose-500" />
              Common Mistakes & Pitfalls
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(topic.commonMistakes && topic.commonMistakes.length > 0
                ? topic.commonMistakes
                : [
                    {
                      mistake: 'Syntax and Type Mismatch',
                      codeSnippet: '// Invalid syntax or mismatched type assignment',
                      correction: 'Declare exact type matches and verify function prototypes.',
                      explanation: 'Statically typed languages catch these errors during compilation.'
                    }
                  ]
              ).map((mistake: any, mIdx: number) => (
                <div
                  key={mIdx}
                  className={`p-4 rounded-xl border space-y-2 text-xs ${
                    mIdx % 2 === 0
                      ? 'border-rose-500/30 bg-rose-950/10 light-theme:bg-rose-50/50'
                      : 'border-amber-500/30 bg-amber-950/10 light-theme:bg-amber-50/50'
                  }`}
                >
                  <div className={`flex items-center gap-1.5 font-bold ${mIdx % 2 === 0 ? 'text-rose-400 light-theme:text-rose-700' : 'text-amber-400 light-theme:text-amber-700'}`}>
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Mistake: {mistake.mistake}</span>
                  </div>
                  {mistake.codeSnippet && (
                    <div className="p-2.5 rounded-lg bg-slate-950 light-theme:bg-white font-mono text-[11px] text-rose-300 border border-rose-500/20 overflow-x-auto">
                      <pre className="whitespace-pre-wrap">{mistake.codeSnippet}</pre>
                    </div>
                  )}
                  <p className="text-slate-300 light-theme:text-slate-700">
                    <strong className="text-emerald-400 light-theme:text-emerald-700 block mb-0.5">Correction:</strong>
                    {mistake.correction}
                  </p>
                  <p className="text-slate-400 light-theme:text-slate-600 italic">
                    {mistake.explanation}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 10: REAL-WORLD EXAMPLE */}
          <section id="section-real-world" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white light-theme:text-slate-900 flex items-center gap-2">
              <span className="w-2 h-5 rounded-full bg-emerald-500" />
              Real-World Application
            </h2>
            <div className="p-5 rounded-2xl bg-slate-900/50 light-theme:bg-white border border-slate-800 light-theme:border-slate-200 text-xs sm:text-sm text-slate-300 light-theme:text-slate-700 leading-relaxed space-y-3">
              {topic.realWorldExample ? (
                <>
                  <div className="flex items-center gap-2 font-bold text-cyan-400 light-theme:text-blue-600 text-xs uppercase tracking-wide">
                    <span>Industry Scenario:</span>
                    <span className="text-white light-theme:text-slate-900">{topic.realWorldExample.scenario}</span>
                  </div>
                  <p className="text-slate-300 light-theme:text-slate-700 leading-relaxed">
                    {topic.realWorldExample.explanation}
                  </p>
                  {topic.realWorldExample.code && (
                    <div className="rounded-xl border border-slate-800 light-theme:border-slate-300 bg-slate-950 light-theme:bg-slate-50 p-3.5 font-mono text-xs text-emerald-400 light-theme:text-emerald-700 overflow-x-auto">
                      <pre>{topic.realWorldExample.code}</pre>
                    </div>
                  )}
                </>
              ) : (
                <p>
                  High-performance production environments rely on predictable resource consumption, strict memory budgeting, and zero-overhead abstractions.
                </p>
              )}
            </div>
          </section>

          {/* SECTION 11: TRY YOURSELF INTERACTIVE PRACTICE */}
          <TryYourselfSandbox
            topicId={topicId}
            language={topic.language || 'python'}
            prompt={topic.practice?.prompt}
            initialCode={topic.practice?.starterCode}
            expectedOutputMatcher={topic.practice?.expectedOutputMatcher}
            hint={topic.practice?.hint}
            solution={topic.practice?.solution}
          />

          {/* SECTION 12: IN-LESSON MINI QUIZ */}
          <InLessonQuiz topicId={topicId} initialQuestions={topic.quiz} />

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
            onMarkCompleted={handleMarkCompleted}
            isCompleted={completedLocally}
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
