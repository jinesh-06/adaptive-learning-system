import React, { useState, useEffect, useMemo } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  Navigate
} from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CognitiveProvider } from './context/CognitiveContext';
import { useOfflineSync } from './hooks/useOfflineSync';
import { Sidebar } from './components/Sidebar';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { PersonalizedOnboardingModal } from './components/PersonalizedOnboardingModal';
import { LiveDemoWalkthroughModal } from './components/LiveDemoWalkthroughModal';
import { LandingPage } from './pages/LandingPage';
import { CourseCatalogPage } from './pages/CourseCatalogPage';
import { TopicLessonPage } from './pages/TopicLessonPage';
import { QuizStationPage } from './pages/QuizStationPage';
import { CodingStudioPage } from './pages/CodingStudioPage';
import { ProjectHubPage } from './pages/ProjectHubPage';
import { LearnerDashboardPage } from './pages/LearnerDashboardPage';
import { DiagnosticAssessmentPage } from './pages/DiagnosticAssessmentPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { NotesPage } from './pages/NotesPage';
import { LearningHistoryPage } from './pages/LearningHistoryPage';
import { PythonFundamentalsDashboard } from './pages/PythonFundamentalsDashboard';
import { PythonIntermediateDashboard } from './pages/PythonIntermediateDashboard';
import { PythonAdvancedDashboard } from './pages/PythonAdvancedDashboard';
import { CProgrammingFoundationsDashboard } from './pages/CProgrammingFoundationsDashboard';
import { CIntermediateDashboard } from './pages/CIntermediateDashboard';
import { CAdvancedDashboard } from './pages/CAdvancedDashboard';
import { CppFundamentalsDashboard } from './pages/CppFundamentalsDashboard';
import { CppOopDashboard } from './pages/CppOopDashboard';
import { CppAdvancedDashboard } from './pages/CppAdvancedDashboard';
import { JavaArchitectureBasicsDashboard } from './pages/JavaArchitectureBasicsDashboard';
import { JavaOopDashboard } from './pages/JavaOopDashboard';
import { JavaAdvDashboard } from './pages/JavaAdvDashboard';
import { AdaptedLessonPage } from './pages/AdaptedLessonPage';
import { PYTHON_FUNDAMENTALS_TOPICS } from './data/pythonFundamentalsData';
import { PYTHON_INTERMEDIATE_TOPICS } from './data/pythonIntermediateData';
import { PYTHON_ADVANCED_TOPICS } from './data/pythonAdvancedData';
import { C_FUNDAMENTALS_TOPICS } from './data/cFundamentalsData';
import { C_INTERMEDIATE_TOPICS } from './data/cIntermediateData';
import { C_ADVANCED_TOPICS } from './data/cAdvancedData';
import { CPP_FUNDAMENTALS_TOPICS } from './data/cppFundamentalsData';
import { CPP_OOP_TOPICS } from './data/cppOopData';
import { CPP_ADVANCED_TOPICS } from './data/cppAdvancedData';
import { JAVA_FUNDAMENTALS_TOPICS } from './data/javaFundamentalsData';
import { JAVA_OOP_TOPICS } from './data/javaOopData';
import { JAVA_ADV_TOPICS } from './data/javaAdvData';
import { WifiOff, Menu, Brain, Search } from 'lucide-react';

const PYTHON_STAGE_TOPICS = [
  'top-py-fundamentals', // Stage 1 (Unit 1): Fundamentals
  'top-py-operators-io', // Stage 1 (Unit 1): Operators & I/O
  'top-py-flow-control', // Stage 2 (Unit 2): Flow Control
  'top-py-loops',        // Stage 2 (Unit 2): Loops & Patterns
  'top-py-strings',      // Stage 3 (Unit 3): Strings & Slicing
  'top-py-lists',        // Stage 4 (Unit 4): Lists & Comprehensions
  'top-py-tuples-sets',  // Stage 5 (Unit 5): Tuples & Sets
  'top-py-dictionaries', // Stage 5 (Unit 5): Dictionaries
  'top-py-functions',    // Stage 6 (Unit 6): Functions & Scope
  'top-py-recursion',    // Stage 6 (Unit 6): Recursion
  'top-py-modules-regex' // Stage 6 (Unit 6): Modules & Regex
];




const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedTopicId, setSelectedTopicId] = useState<string>('top-py-fundamentals');
  const [diagnosticLang, setDiagnosticLang] = useState<string>('python');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Modals
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const { isOnline } = useOfflineSync();

  // Desktop Sidebar State (persisted in localStorage)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('cognitive_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem('cognitive_sidebar_open', String(next));
      return next;
    });
  };

  // Derive currentView from location.pathname to ensure active nav highlighting syncs with browser history
  const currentView = useMemo(() => {
    const segments = location.pathname.replace(/^\/+/, '').split('/');
    const first = segments[0];
    if (!first || first === 'landing') return 'landing';
    if (first === 'curriculum') return 'catalog';
    return first;
  }, [location.pathname]);

  // Synchronize route parameters with selectedTopicId and diagnosticLang
  useEffect(() => {
    const segments = location.pathname.replace(/^\/+/, '').split('/');
    const route = segments[0];
    const param = segments[1];
    if (param && ['lesson', 'adapted-lesson', 'quiz', 'coding'].includes(route)) {
      setSelectedTopicId(param);
    }
    if (param && route === 'diagnostic') {
      setDiagnosticLang(param);
    }
  }, [location.pathname]);

  // Global Ctrl+B shortcut to toggle sidebar & Escape to close mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleSidebar();
      }
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileSidebarOpen]);

  // Global Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const setCurrentView = (view: string) => {
    switch (view) {
      case 'landing':
        navigate('/');
        break;
      case 'lesson':
        navigate(`/lesson/${selectedTopicId}`);
        break;
      case 'adapted-lesson':
        navigate(`/adapted-lesson/${selectedTopicId}`);
        break;
      case 'quiz':
        navigate(`/quiz/${selectedTopicId}`);
        break;
      case 'coding':
        navigate(`/coding/${selectedTopicId}`);
        break;
      case 'diagnostic':
        navigate(diagnosticLang ? `/diagnostic/${diagnosticLang}` : '/diagnostic');
        break;
      case 'login':
      case 'signin':
        navigate('/login');
        break;
      case 'register':
        navigate('/register');
        break;
      default:
        navigate(`/${view}`);
        break;
    }
  };

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    navigate(`/lesson/${topicId}`);
  };

  const getNextTopicId = (currentTopicId: string): string | null => {
    const isAdvC = C_ADVANCED_TOPICS.some(t => t.id === currentTopicId);
    if (isAdvC) {
      const idxAdv = C_ADVANCED_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idxAdv >= 0 && idxAdv < C_ADVANCED_TOPICS.length - 1) {
        return C_ADVANCED_TOPICS[idxAdv + 1].id;
      }
      return null;
    }
    if (currentTopicId.startsWith('top-c-')) {
      const idx = C_FUNDAMENTALS_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx >= 0 && idx < C_FUNDAMENTALS_TOPICS.length - 1) {
        return C_FUNDAMENTALS_TOPICS[idx + 1].id;
      }
      const idxInt = C_INTERMEDIATE_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idxInt >= 0 && idxInt < C_INTERMEDIATE_TOPICS.length - 1) {
        return C_INTERMEDIATE_TOPICS[idxInt + 1].id;
      }
      return null;
    }
    if (currentTopicId.startsWith('top-cpp-adv-')) {
      const idx = CPP_ADVANCED_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx >= 0 && idx < CPP_ADVANCED_TOPICS.length - 1) {
        return CPP_ADVANCED_TOPICS[idx + 1].id;
      }
      return null;
    }
    if (currentTopicId.startsWith('top-cpp-oop-')) {
      const idx = CPP_OOP_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx >= 0 && idx < CPP_OOP_TOPICS.length - 1) {
        return CPP_OOP_TOPICS[idx + 1].id;
      }
      return null;
    }
    if (currentTopicId.startsWith('top-cpp-')) {
      const idx = CPP_FUNDAMENTALS_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx >= 0 && idx < CPP_FUNDAMENTALS_TOPICS.length - 1) {
        return CPP_FUNDAMENTALS_TOPICS[idx + 1].id;
      }
      return null;
    }
    if (currentTopicId.startsWith('top-java-adv-')) {
      const idx = JAVA_ADV_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx >= 0 && idx < JAVA_ADV_TOPICS.length - 1) {
        return JAVA_ADV_TOPICS[idx + 1].id;
      }
      return null;
    }
    if (currentTopicId.startsWith('top-java-oop-')) {
      const idx = JAVA_OOP_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx >= 0 && idx < JAVA_OOP_TOPICS.length - 1) {
        return JAVA_OOP_TOPICS[idx + 1].id;
      }
      return null;
    }
    if (currentTopicId.startsWith('top-java-')) {
      const idx = JAVA_FUNDAMENTALS_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx >= 0 && idx < JAVA_FUNDAMENTALS_TOPICS.length - 1) {
        return JAVA_FUNDAMENTALS_TOPICS[idx + 1].id;
      }
      return null;
    }

    const pyAdvIndex = PYTHON_ADVANCED_TOPICS.findIndex(t => t.id === currentTopicId);
    if (pyAdvIndex >= 0 && pyAdvIndex < PYTHON_ADVANCED_TOPICS.length - 1) {
      return PYTHON_ADVANCED_TOPICS[pyAdvIndex + 1].id;
    }

    const pyIntIndex = PYTHON_INTERMEDIATE_TOPICS.findIndex(t => t.id === currentTopicId);
    if (pyIntIndex >= 0 && pyIntIndex < PYTHON_INTERMEDIATE_TOPICS.length - 1) {
      return PYTHON_INTERMEDIATE_TOPICS[pyIntIndex + 1].id;
    }

    const pyIndex = PYTHON_FUNDAMENTALS_TOPICS.findIndex(t => t.id === currentTopicId);
    if (pyIndex >= 0 && pyIndex < PYTHON_FUNDAMENTALS_TOPICS.length - 1) {
      return PYTHON_FUNDAMENTALS_TOPICS[pyIndex + 1].id;
    }

    const currentIndex = PYTHON_STAGE_TOPICS.indexOf(currentTopicId);
    if (currentIndex >= 0 && currentIndex < PYTHON_STAGE_TOPICS.length - 1) {
      return PYTHON_STAGE_TOPICS[currentIndex + 1];
    }
    return null;
  };

  const getPrevTopicId = (currentTopicId: string): string | null => {
    const isAdvC = C_ADVANCED_TOPICS.some(t => t.id === currentTopicId);
    if (isAdvC) {
      const idxAdv = C_ADVANCED_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idxAdv > 0) {
        return C_ADVANCED_TOPICS[idxAdv - 1].id;
      }
      return null;
    }
    if (currentTopicId.startsWith('top-c-')) {
      const idx = C_FUNDAMENTALS_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx > 0) {
        return C_FUNDAMENTALS_TOPICS[idx - 1].id;
      }
      const idxInt = C_INTERMEDIATE_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idxInt > 0) {
        return C_INTERMEDIATE_TOPICS[idxInt - 1].id;
      }
      return null;
    }
    if (currentTopicId.startsWith('top-cpp-adv-')) {
      const idx = CPP_ADVANCED_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx > 0) {
        return CPP_ADVANCED_TOPICS[idx - 1].id;
      }
      return null;
    }
    if (currentTopicId.startsWith('top-cpp-oop-')) {
      const idx = CPP_OOP_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx > 0) {
        return CPP_OOP_TOPICS[idx - 1].id;
      }
      return null;
    }
    if (currentTopicId.startsWith('top-cpp-')) {
      const idx = CPP_FUNDAMENTALS_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx > 0) {
        return CPP_FUNDAMENTALS_TOPICS[idx - 1].id;
      }
      return null;
    }
    if (currentTopicId.startsWith('top-java-adv-')) {
      const idx = JAVA_ADV_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx > 0) {
        return JAVA_ADV_TOPICS[idx - 1].id;
      }
      return null;
    }
    if (currentTopicId.startsWith('top-java-oop-')) {
      const idx = JAVA_OOP_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx > 0) {
        return JAVA_OOP_TOPICS[idx - 1].id;
      }
      return null;
    }
    if (currentTopicId.startsWith('top-java-')) {
      const idx = JAVA_FUNDAMENTALS_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx > 0) {
        return JAVA_FUNDAMENTALS_TOPICS[idx - 1].id;
      }
      return null;
    }

    const pyAdvIndex = PYTHON_ADVANCED_TOPICS.findIndex(t => t.id === currentTopicId);
    if (pyAdvIndex > 0) {
      return PYTHON_ADVANCED_TOPICS[pyAdvIndex - 1].id;
    }

    const pyIntIndex = PYTHON_INTERMEDIATE_TOPICS.findIndex(t => t.id === currentTopicId);
    if (pyIntIndex > 0) {
      return PYTHON_INTERMEDIATE_TOPICS[pyIntIndex - 1].id;
    }

    const pyIndex = PYTHON_FUNDAMENTALS_TOPICS.findIndex(t => t.id === currentTopicId);
    if (pyIndex > 0) {
      return PYTHON_FUNDAMENTALS_TOPICS[pyIndex - 1].id;
    }

    const currentIndex = PYTHON_STAGE_TOPICS.indexOf(currentTopicId);
    if (currentIndex > 0) {
      return PYTHON_STAGE_TOPICS[currentIndex - 1];
    }
    return null;
  };

  const handleNextTopicFor = (currentTopicId: string, view: string = 'lesson') => {
    const nextTopicId = getNextTopicId(currentTopicId);
    if (nextTopicId) {
      setSelectedTopicId(nextTopicId);
      navigate(`/${view}/${nextTopicId}`);
    } else if (C_ADVANCED_TOPICS.some(t => t.id === currentTopicId)) {
      navigate('/c-advanced-systems-dashboard');
    } else if (currentTopicId.startsWith('top-cpp-adv-')) {
      navigate('/cpp-advanced-dashboard');
    } else if (currentTopicId.startsWith('top-py-adv-')) {
      navigate('/python-advanced-dashboard');
    } else if (currentTopicId.startsWith('top-py-int-')) {
      navigate('/python-intermediate-dashboard');
    } else if (currentTopicId.startsWith('top-c-')) {
      navigate('/c-dashboard');
    } else if (currentTopicId.startsWith('top-cpp-oop-')) {
      navigate('/cpp-oop-dashboard');
    } else if (currentTopicId.startsWith('top-cpp-')) {
      navigate('/cpp-dashboard');
    } else if (currentTopicId.startsWith('top-java-adv-')) {
      navigate('/java-adv-dashboard');
    } else if (currentTopicId.startsWith('top-java-oop-')) {
      navigate('/java-oop-dashboard');
    } else if (currentTopicId.startsWith('top-java-')) {
      navigate('/java-dashboard');
    } else {
      navigate('/python-dashboard');
    }
  };

  const handlePrevTopicFor = (currentTopicId: string, view: string = 'lesson') => {
    const prevTopicId = getPrevTopicId(currentTopicId);
    if (prevTopicId) {
      setSelectedTopicId(prevTopicId);
      navigate(`/${view}/${prevTopicId}`);
    }
  };

  const handleStartDiagnostic = (lang: string) => {
    setDiagnosticLang(lang);
    navigate(`/diagnostic/${lang}`);
  };

  // Route-aware wrappers
  const LessonRouteWrapper: React.FC = () => {
    const { topicId } = useParams<{ topicId?: string }>();
    const activeTopicId = topicId || selectedTopicId || 'top-py-fundamentals';

    useEffect(() => {
      if (topicId && topicId !== selectedTopicId) {
        setSelectedTopicId(topicId);
      }
    }, [topicId]);

    return (
      <TopicLessonPage
        topicId={activeTopicId}
        onSelectTopic={handleSelectTopic}
        onNextTopic={() => handleNextTopicFor(activeTopicId, 'lesson')}
        onPrevTopic={() => handlePrevTopicFor(activeTopicId, 'lesson')}
        onStartQuiz={() => navigate(`/quiz/${activeTopicId}`)}
        onOpenCoding={() => navigate(`/coding/${activeTopicId}`)}
        onBackToCatalog={() => navigate('/catalog')}
        onBackToPythonDashboard={() => navigate('/python-dashboard')}
        onBackToPythonIntermediateDashboard={() => navigate('/python-intermediate-dashboard')}
        onBackToPythonAdvancedDashboard={() => navigate('/python-advanced-dashboard')}
        onBackToCDashboard={() => navigate('/c-dashboard')}
        onBackToCIntermediateDashboard={() => navigate('/c-intermediate-dashboard')}
        onBackToCAdvancedDashboard={() => navigate('/c-advanced-systems-dashboard')}
        onBackToCppDashboard={() => navigate('/cpp-dashboard')}
        onBackToCppOopDashboard={() => navigate('/cpp-oop-dashboard')}
        onBackToCppAdvDashboard={() => navigate('/cpp-advanced-dashboard')}
        onBackToJavaDashboard={() => navigate('/java-dashboard')}
        onBackToJavaOopDashboard={() => navigate('/java-oop-dashboard')}
        onBackToJavaAdvDashboard={() => navigate('/java-adv-dashboard')}
        onOpenAdaptedLesson={(tId) => navigate(`/adapted-lesson/${tId || activeTopicId}`)}
        onOpenAiDrawer={() => setAiDrawerOpen(true)}
        onOpenSearch={() => setSearchModalOpen(true)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      />
    );
  };

  const AdaptedLessonRouteWrapper: React.FC = () => {
    const { topicId } = useParams<{ topicId?: string }>();
    const activeTopicId = topicId || selectedTopicId || 'top-py-fundamentals';

    useEffect(() => {
      if (topicId && topicId !== selectedTopicId) {
        setSelectedTopicId(topicId);
      }
    }, [topicId]);

    return (
      <AdaptedLessonPage
        topicId={activeTopicId}
        onBackToOriginal={() => navigate(`/lesson/${activeTopicId}`)}
        onNextTopic={() => handleNextTopicFor(activeTopicId, 'adapted-lesson')}
        onBackToDashboard={() =>
          C_ADVANCED_TOPICS.some(t => t.id === activeTopicId)
            ? navigate('/c-advanced-systems-dashboard')
            : activeTopicId.startsWith('top-cpp-adv-')
            ? navigate('/cpp-advanced-dashboard')
            : activeTopicId.startsWith('top-py-adv-')
            ? navigate('/python-advanced-dashboard')
            : activeTopicId.startsWith('top-py-int-')
            ? navigate('/python-intermediate-dashboard')
            : activeTopicId.startsWith('top-c-')
            ? navigate('/c-dashboard')
            : activeTopicId.startsWith('top-cpp-oop-')
            ? navigate('/cpp-oop-dashboard')
            : activeTopicId.startsWith('top-cpp-')
            ? navigate('/cpp-dashboard')
            : activeTopicId.startsWith('top-java-adv-')
            ? navigate('/java-adv-dashboard')
            : activeTopicId.startsWith('top-java-oop-')
            ? navigate('/java-oop-dashboard')
            : activeTopicId.startsWith('top-java-')
            ? navigate('/java-dashboard')
            : navigate('/python-dashboard')
        }
        onStartQuiz={() => navigate(`/quiz/${activeTopicId}`)}
      />
    );
  };

  const QuizRouteWrapper: React.FC = () => {
    const { topicId } = useParams<{ topicId?: string }>();
    const activeTopicId = topicId || selectedTopicId || 'top-py-fundamentals';

    useEffect(() => {
      if (topicId && topicId !== selectedTopicId) {
        setSelectedTopicId(topicId);
      }
    }, [topicId]);

    return (
      <QuizStationPage
        topicId={activeTopicId}
        onBackToLesson={() => navigate(`/lesson/${activeTopicId}`)}
        onGoToCoding={() => navigate(`/coding/${activeTopicId}`)}
        onNextTopic={() => handleNextTopicFor(activeTopicId, 'quiz')}
      />
    );
  };

  const CodingRouteWrapper: React.FC = () => {
    const { topicId } = useParams<{ topicId?: string }>();
    const activeTopicId = topicId || selectedTopicId || 'top-py-fundamentals';

    useEffect(() => {
      if (topicId && topicId !== selectedTopicId) {
        setSelectedTopicId(topicId);
      }
    }, [topicId]);

    return (
      <CodingStudioPage
        topicId={activeTopicId}
        onOpenAiDrawer={() => setAiDrawerOpen(true)}
        onBackToLesson={() => navigate(`/lesson/${activeTopicId}`)}
        onGoToQuiz={() => navigate(`/quiz/${activeTopicId}`)}
        onNextTopic={() => handleNextTopicFor(activeTopicId, 'coding')}
      />
    );
  };

  const DiagnosticRouteWrapper: React.FC = () => {
    const { lang } = useParams<{ lang?: string }>();
    const activeLang = lang || diagnosticLang || 'python';

    useEffect(() => {
      if (lang && lang !== diagnosticLang) {
        setDiagnosticLang(lang);
      }
    }, [lang]);

    return (
      <DiagnosticAssessmentPage
        initialLanguage={activeLang}
        onSelectTopic={handleSelectTopic}
        onBackToCurriculum={() => navigate('/catalog')}
      />
    );
  };

  const { user: authUser, isLoading: authLoading } = useAuth();

  // Render dedicated standalone LoginPage when on auth routes.
  // If the user is already authenticated, redirect them away from auth pages.
  const isAuthRoute = ['/login', '/signin', '/register'].includes(location.pathname);
  if (isAuthRoute) {
    if (authLoading) {
      // Wait for Firebase to resolve before deciding to redirect
      return (
        <div className="min-h-screen bg-[#020B1F] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#00D4E8] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#A5B4CC] font-medium tracking-wide">Verifying session...</p>
          </div>
        </div>
      );
    }
    if (authUser) {
      // Already signed in — send to the catalog, not the login page
      return <Navigate to="/catalog" replace />;
    }
    return (
      <Routes>
        <Route path="/login" element={<LoginPage initialMode="login" />} />
        <Route path="/signin" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<LoginPage initialMode="register" />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex selection:bg-cyan-500 selection:text-white">
      {/* Modern Vertical Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedTopicId={selectedTopicId}
        onSelectTopic={handleSelectTopic}
        openAuthModal={() => navigate('/login')}
        onOpenLogin={() => navigate('/login')}
        openAiDrawer={() => setAiDrawerOpen(true)}
        openSearchModal={() => setSearchModalOpen(true)}
        openOnboardingModal={() => setOnboardingModalOpen(true)}
        openDemoModal={() => setDemoModalOpen(true)}
        isMobileOpen={mobileSidebarOpen}
        setIsMobileOpen={setMobileSidebarOpen}
        isDesktopOpen={isSidebarOpen}
        setIsDesktopOpen={setIsSidebarOpen}
      />

      {/* Main Content Area with dynamic desktop padding for sliding sidebar */}
      <div className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ease-in-out ${isSidebarOpen ? 'lg:pl-[260px]' : 'lg:pl-0'}`}>
        {/* Offline Status Banner */}
        {!isOnline && (
          <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-2 text-center text-xs text-amber-300 flex items-center justify-center gap-2 font-medium">
            <WifiOff className="w-4 h-4 text-amber-400" />
            <span>You are currently working offline. Code drafts and responses are autosaving locally to your browser.</span>
          </div>
        )}

        {/* Mobile Top Header (visible only on mobile/tablet) */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Brain className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-bold text-white">CognitiveLoad</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              title="Global Search"
            >
              <Search className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={() => setAiDrawerOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold"
            >
              ✨ AI Tutor
            </button>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            {/* Root & Landing Page */}
            <Route
              path="/"
              element={
                <LandingPage
                  onStartLearning={() => {
                    if (authUser) {
                      navigate('/catalog');
                    } else {
                      setOnboardingModalOpen(true);
                    }
                  }}
                  onExploreCourses={() => navigate('/catalog')}
                />
              }
            />
            <Route
              path="/landing"
              element={
                <LandingPage
                  onStartLearning={() => {
                    if (authUser) {
                      navigate('/catalog');
                    } else {
                      setOnboardingModalOpen(true);
                    }
                  }}
                  onExploreCourses={() => navigate('/catalog')}
                />
              }
            />

            {/* Protected Routes Guarded by Firebase Authentication */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/catalog"
              element={
                <CourseCatalogPage
                  onSelectTopic={handleSelectTopic}
                  onOpenPythonDashboard={() => navigate('/python-dashboard')}
                  onOpenPythonIntermediateDashboard={() => navigate('/python-intermediate-dashboard')}
                  onOpenPythonAdvancedDashboard={() => navigate('/python-advanced-dashboard')}
                  onOpenCDashboard={() => navigate('/c-dashboard')}
                  onOpenCIntermediateDashboard={() => navigate('/c-intermediate-dashboard')}
                  onOpenCAdvancedDashboard={() => navigate('/c-advanced-systems-dashboard')}
                  onOpenCppDashboard={() => navigate('/cpp-dashboard')}
                  onOpenCppOopDashboard={() => navigate('/cpp-oop-dashboard')}
                  onOpenCppAdvDashboard={() => navigate('/cpp-advanced-dashboard')}
                  onOpenJavaDashboard={() => navigate('/java-dashboard')}
                  onOpenJavaOopDashboard={() => navigate('/java-oop-dashboard')}
                  onOpenJavaAdvDashboard={() => navigate('/java-adv-dashboard')}
                />
              }
            />
            <Route path="/curriculum" element={<Navigate to="/catalog" replace />} />

            <Route
              path="/python-dashboard"
              element={
                <PythonFundamentalsDashboard
                  onSelectTopic={handleSelectTopic}
                  onSelectAdaptedLesson={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/adapted-lesson/${topicId}`);
                  }}
                  onBackToCatalog={() => navigate('/catalog')}
                />
              }
            />

            <Route
              path="/python-intermediate-dashboard"
              element={
                <PythonIntermediateDashboard
                  onSelectTopic={handleSelectTopic}
                  onSelectAdaptedLesson={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/adapted-lesson/${topicId}`);
                  }}
                  onBackToCatalog={() => navigate('/catalog')}
                />
              }
            />
            <Route path="/intermediate-python-dashboard" element={<Navigate to="/python-intermediate-dashboard" replace />} />

            <Route
              path="/python-advanced-dashboard"
              element={
                <PythonAdvancedDashboard
                  onSelectTopic={handleSelectTopic}
                  onSelectAdaptedLesson={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/adapted-lesson/${topicId}`);
                  }}
                  onBackToCatalog={() => navigate('/catalog')}
                />
              }
            />
            <Route path="/advanced-python-dashboard" element={<Navigate to="/python-advanced-dashboard" replace />} />

            <Route
              path="/c-dashboard"
              element={
                <CProgrammingFoundationsDashboard
                  onSelectTopic={handleSelectTopic}
                  onSelectAdaptedLesson={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/adapted-lesson/${topicId}`);
                  }}
                  onBackToCatalog={() => navigate('/catalog')}
                  onStartQuiz={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/quiz/${topicId}`);
                  }}
                  onOpenCoding={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/coding/${topicId}`);
                  }}
                />
              }
            />
            <Route path="/c-foundations-dashboard" element={<Navigate to="/c-dashboard" replace />} />

            <Route
              path="/c-intermediate-dashboard"
              element={
                <CIntermediateDashboard
                  onSelectTopic={handleSelectTopic}
                  onSelectAdaptedLesson={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/adapted-lesson/${topicId}`);
                  }}
                  onBackToCatalog={() => navigate('/catalog')}
                />
              }
            />

            <Route
              path="/c-advanced-systems-dashboard"
              element={
                <CAdvancedDashboard
                  onSelectTopic={handleSelectTopic}
                  onSelectAdaptedLesson={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/adapted-lesson/${topicId}`);
                  }}
                  onBackToCatalog={() => navigate('/catalog')}
                />
              }
            />
            <Route path="/c-adv" element={<Navigate to="/c-advanced-systems-dashboard" replace />} />
            <Route path="/c-advanced-dashboard" element={<Navigate to="/c-advanced-systems-dashboard" replace />} />
            <Route path="/c-systems" element={<Navigate to="/c-advanced-systems-dashboard" replace />} />

            <Route
              path="/cpp-dashboard"
              element={
                <CppFundamentalsDashboard
                  onSelectTopic={handleSelectTopic}
                  onSelectAdaptedLesson={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/adapted-lesson/${topicId}`);
                  }}
                  onBackToCatalog={() => navigate('/catalog')}
                  onStartQuiz={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/quiz/${topicId}`);
                  }}
                  onOpenCoding={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/coding/${topicId}`);
                  }}
                />
              }
            />
            <Route path="/cpp-fundamentals-dashboard" element={<Navigate to="/cpp-dashboard" replace />} />
            <Route path="/cpp-fundamentals" element={<Navigate to="/cpp-dashboard" replace />} />

            <Route
              path="/cpp-oop-dashboard"
              element={
                <CppOopDashboard
                  onSelectTopic={handleSelectTopic}
                  onSelectAdaptedLesson={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/adapted-lesson/${topicId}`);
                  }}
                  onBackToCatalog={() => navigate('/catalog')}
                  onStartQuiz={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/quiz/${topicId}`);
                  }}
                  onOpenCoding={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/coding/${topicId}`);
                  }}
                />
              }
            />
            <Route path="/cpp-oop" element={<Navigate to="/cpp-oop-dashboard" replace />} />
            <Route path="/object-oriented-cpp" element={<Navigate to="/cpp-oop-dashboard" replace />} />

            <Route
              path="/cpp-advanced-dashboard"
              element={
                <CppAdvancedDashboard
                  onSelectTopic={handleSelectTopic}
                  onSelectAdaptedLesson={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/adapted-lesson/${topicId}`);
                  }}
                  onBackToCatalog={() => navigate('/catalog')}
                  onStartQuiz={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/quiz/${topicId}`);
                  }}
                  onOpenCoding={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/coding/${topicId}`);
                  }}
                />
              }
            />
            <Route path="/cpp-advanced" element={<Navigate to="/cpp-advanced-dashboard" replace />} />
            <Route path="/cpp-adv" element={<Navigate to="/cpp-advanced-dashboard" replace />} />

            <Route
              path="/java-dashboard"
              element={
                <JavaArchitectureBasicsDashboard
                  onSelectTopic={handleSelectTopic}
                  onSelectAdaptedLesson={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/adapted-lesson/${topicId}`);
                  }}
                  onBackToCatalog={() => navigate('/catalog')}
                  onStartQuiz={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/quiz/${topicId}`);
                  }}
                  onOpenCoding={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/coding/${topicId}`);
                  }}
                />
              }
            />
            <Route path="/java-basics" element={<Navigate to="/java-dashboard" replace />} />

            <Route
              path="/java-oop-dashboard"
              element={
                <JavaOopDashboard
                  onSelectTopic={handleSelectTopic}
                  onSelectAdaptedLesson={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/adapted-lesson/${topicId}`);
                  }}
                  onBackToCatalog={() => navigate('/catalog')}
                  onStartQuiz={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/quiz/${topicId}`);
                  }}
                  onOpenCoding={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/coding/${topicId}`);
                  }}
                />
              }
            />
            <Route path="/java-oop" element={<Navigate to="/java-oop-dashboard" replace />} />
            <Route path="/java-object-oriented-design" element={<Navigate to="/java-oop-dashboard" replace />} />
            <Route path="/java-int" element={<Navigate to="/java-oop-dashboard" replace />} />

            <Route
              path="/java-adv-dashboard"
              element={
                <JavaAdvDashboard
                  onSelectTopic={handleSelectTopic}
                  onSelectAdaptedLesson={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/adapted-lesson/${topicId}`);
                  }}
                  onBackToCatalog={() => navigate('/catalog')}
                  onStartQuiz={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/quiz/${topicId}`);
                  }}
                  onOpenCoding={(topicId) => {
                    setSelectedTopicId(topicId);
                    navigate(`/coding/${topicId}`);
                  }}
                />
              }
            />
            <Route path="/java-adv" element={<Navigate to="/java-adv-dashboard" replace />} />
            <Route path="/java-advanced" element={<Navigate to="/java-adv-dashboard" replace />} />
            <Route path="/java-advanced-dashboard" element={<Navigate to="/java-adv-dashboard" replace />} />
            <Route path="/java-collections" element={<Navigate to="/java-adv-dashboard" replace />} />

            <Route path="/lesson" element={<Navigate to={`/lesson/${selectedTopicId}`} replace />} />
            <Route path="/lesson/:topicId" element={<LessonRouteWrapper />} />

            <Route path="/adapted-lesson" element={<Navigate to={`/adapted-lesson/${selectedTopicId}`} replace />} />
            <Route path="/adapted-lesson/:topicId" element={<AdaptedLessonRouteWrapper />} />

            <Route path="/quiz" element={<Navigate to={`/quiz/${selectedTopicId}`} replace />} />
            <Route path="/quiz/:topicId" element={<QuizRouteWrapper />} />

            <Route path="/coding" element={<Navigate to={`/coding/${selectedTopicId}`} replace />} />
            <Route path="/coding/:topicId" element={<CodingRouteWrapper />} />

            <Route path="/projects" element={<ProjectHubPage />} />

            <Route
              path="/diagnostic"
              element={
                <DiagnosticAssessmentPage
                  initialLanguage={diagnosticLang}
                  onSelectTopic={handleSelectTopic}
                  onBackToCurriculum={() => navigate('/catalog')}
                />
              }
            />
            <Route path="/diagnostic/:lang" element={<DiagnosticRouteWrapper />} />

            <Route path="/bookmarks" element={<BookmarksPage onSelectTopic={handleSelectTopic} />} />
            <Route path="/notes" element={<NotesPage onSelectTopic={handleSelectTopic} />} />
            <Route path="/history" element={<LearningHistoryPage onSelectTopic={handleSelectTopic} />} />
            <Route path="/dashboard" element={<LearnerDashboardPage onSelectTopic={handleSelectTopic} />} />
            <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Floating AI Copilot Trigger for Mobile/Tablet */}
        <div className="fixed bottom-5 right-5 z-30 lg:hidden">
          <button
            onClick={() => setAiDrawerOpen(true)}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-500/30 active:scale-95 transition-transform"
          >
            ✨
          </button>
        </div>

        {/* In-Course AI Learning Copilot Drawer */}
        <AiAssistantDrawer
          isOpen={aiDrawerOpen}
          onClose={() => setAiDrawerOpen(false)}
          currentTopicTitle={selectedTopicId}
        />

        {/* Global Search Modal */}
        <GlobalSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onNavigateToTopic={handleSelectTopic}
          onNavigateToCourse={() => navigate('/catalog')}
        />

        {/* Personalized Onboarding Modal */}
        <PersonalizedOnboardingModal
          isOpen={onboardingModalOpen}
          onClose={() => setOnboardingModalOpen(false)}
          onStartDiagnostic={handleStartDiagnostic}
          onCompleteOnboarding={() => navigate('/catalog')}
        />

        {/* Section 117 Live Demonstration Walkthrough Modal */}
        <LiveDemoWalkthroughModal
          isOpen={demoModalOpen}
          onClose={() => setDemoModalOpen(false)}
          onNavigateToTopic={handleSelectTopic}
        />

        {/* Platform Footer */}
        {currentView !== 'landing' && (
          <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
            <p>Cognitive-Load-Aware Adaptive Learning Engine • Built with AI/ML, RAG, and Safe Sandbox Execution</p>
          </footer>
        )}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CognitiveProvider>
            <AppContent />
          </CognitiveProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
