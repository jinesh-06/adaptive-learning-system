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
import { AuthProvider } from './context/AuthContext';
import { CognitiveProvider } from './context/CognitiveContext';
import { useOfflineSync } from './hooks/useOfflineSync';
import { Sidebar } from './components/Sidebar';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { AuthModal } from './components/AuthModal';
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
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { DiagnosticAssessmentPage } from './pages/DiagnosticAssessmentPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { NotesPage } from './pages/NotesPage';
import { LearningHistoryPage } from './pages/LearningHistoryPage';
import { PythonFundamentalsDashboard } from './pages/PythonFundamentalsDashboard';
import { AdaptedLessonPage } from './pages/AdaptedLessonPage';
import { PYTHON_FUNDAMENTALS_TOPICS } from './data/pythonFundamentalsData';
import { C_FUNDAMENTALS_TOPICS } from './data/cFundamentalsData';
import { CPP_FUNDAMENTALS_TOPICS } from './data/cppFundamentalsData';
import { JAVA_FUNDAMENTALS_TOPICS } from './data/javaFundamentalsData';
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
  const [authModalOpen, setAuthModalOpen] = useState(false);
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
    if (currentTopicId.startsWith('top-c-')) {
      const idx = C_FUNDAMENTALS_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx >= 0 && idx < C_FUNDAMENTALS_TOPICS.length - 1) {
        return C_FUNDAMENTALS_TOPICS[idx + 1].id;
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
    if (currentTopicId.startsWith('top-java-')) {
      const idx = JAVA_FUNDAMENTALS_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx >= 0 && idx < JAVA_FUNDAMENTALS_TOPICS.length - 1) {
        return JAVA_FUNDAMENTALS_TOPICS[idx + 1].id;
      }
      return null;
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
    if (currentTopicId.startsWith('top-c-')) {
      const idx = C_FUNDAMENTALS_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx > 0) {
        return C_FUNDAMENTALS_TOPICS[idx - 1].id;
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
    if (currentTopicId.startsWith('top-java-')) {
      const idx = JAVA_FUNDAMENTALS_TOPICS.findIndex(t => t.id === currentTopicId);
      if (idx > 0) {
        return JAVA_FUNDAMENTALS_TOPICS[idx - 1].id;
      }
      return null;
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
    } else if (currentTopicId.startsWith('top-c-') || currentTopicId.startsWith('top-cpp-') || currentTopicId.startsWith('top-java-')) {
      navigate('/catalog');
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
        onBackToDashboard={() => navigate('/python-dashboard')}
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

  return (
    <div className="min-h-screen bg-slate-950 flex selection:bg-cyan-500 selection:text-white">
      {/* Modern Vertical Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedTopicId={selectedTopicId}
        onSelectTopic={handleSelectTopic}
        openAuthModal={() => setAuthModalOpen(true)}
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
            <Route
              path="/"
              element={
                <LandingPage
                  onStartLearning={() => setOnboardingModalOpen(true)}
                  onExploreCourses={() => navigate('/catalog')}
                />
              }
            />
            <Route path="/landing" element={<Navigate to="/" replace />} />

            <Route
              path="/catalog"
              element={
                <CourseCatalogPage
                  onSelectTopic={handleSelectTopic}
                  onOpenPythonDashboard={() => navigate('/python-dashboard')}
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
            <Route path="/admin" element={<AdminAnalyticsPage />} />

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

        {/* Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
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
