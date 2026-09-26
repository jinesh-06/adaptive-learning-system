import React, { useState, useEffect } from 'react';
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
  const [currentView, setCurrentView] = useState<string>('landing');
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

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setCurrentView('lesson');
  };

  const handleNextTopic = () => {
    const pyIndex = PYTHON_FUNDAMENTALS_TOPICS.findIndex(t => t.id === selectedTopicId);
    if (pyIndex >= 0 && pyIndex < PYTHON_FUNDAMENTALS_TOPICS.length - 1) {
      const nextTopicId = PYTHON_FUNDAMENTALS_TOPICS[pyIndex + 1].id;
      setSelectedTopicId(nextTopicId);
      setCurrentView('lesson');
      return;
    }

    const currentIndex = PYTHON_STAGE_TOPICS.indexOf(selectedTopicId);
    if (currentIndex >= 0 && currentIndex < PYTHON_STAGE_TOPICS.length - 1) {
      const nextTopicId = PYTHON_STAGE_TOPICS[currentIndex + 1];
      setSelectedTopicId(nextTopicId);
      setCurrentView('lesson');
    } else {
      setCurrentView('python-dashboard');
    }
  };

  const handlePrevTopic = () => {
    const pyIndex = PYTHON_FUNDAMENTALS_TOPICS.findIndex(t => t.id === selectedTopicId);
    if (pyIndex > 0) {
      const prevTopicId = PYTHON_FUNDAMENTALS_TOPICS[pyIndex - 1].id;
      setSelectedTopicId(prevTopicId);
      setCurrentView('lesson');
      return;
    }

    const currentIndex = PYTHON_STAGE_TOPICS.indexOf(selectedTopicId);
    if (currentIndex > 0) {
      const prevTopicId = PYTHON_STAGE_TOPICS[currentIndex - 1];
      setSelectedTopicId(prevTopicId);
      setCurrentView('lesson');
    }
  };

  const handleStartDiagnostic = (lang: string) => {
    setDiagnosticLang(lang);
    setCurrentView('diagnostic');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex selection:bg-cyan-500 selection:text-white">
      {/* Modern Vertical Sidebar (Matching reference layout) */}
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
              onClick={() => setCurrentView('landing')}
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
          {currentView === 'landing' && (
            <LandingPage
              onStartLearning={() => setOnboardingModalOpen(true)}
              onExploreCourses={() => setCurrentView('catalog')}
            />
          )}

          {currentView === 'catalog' && (
            <CourseCatalogPage
              onSelectTopic={handleSelectTopic}
              onOpenPythonDashboard={() => setCurrentView('python-dashboard')}
            />
          )}

          {currentView === 'python-dashboard' && (
            <PythonFundamentalsDashboard
              onSelectTopic={(topicId) => {
                setSelectedTopicId(topicId);
                setCurrentView('lesson');
              }}
              onSelectAdaptedLesson={(topicId) => {
                setSelectedTopicId(topicId);
                setCurrentView('adapted-lesson');
              }}
              onBackToCatalog={() => setCurrentView('catalog')}
            />
          )}

          {currentView === 'lesson' && (
            <TopicLessonPage
              topicId={selectedTopicId}
              onSelectTopic={handleSelectTopic}
              onNextTopic={handleNextTopic}
              onPrevTopic={handlePrevTopic}
              onStartQuiz={() => setCurrentView('quiz')}
              onOpenCoding={() => setCurrentView('coding')}
              onBackToCatalog={() => setCurrentView('catalog')}
              onBackToPythonDashboard={() => setCurrentView('python-dashboard')}
              onOpenAdaptedLesson={(topicId) => {
                if (topicId) setSelectedTopicId(topicId);
                setCurrentView('adapted-lesson');
              }}
              onOpenAiDrawer={() => setAiDrawerOpen(true)}
              onOpenSearch={() => setSearchModalOpen(true)}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={handleToggleSidebar}
              onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
            />
          )}

          {currentView === 'adapted-lesson' && (
            <AdaptedLessonPage
              topicId={selectedTopicId}
              onBackToOriginal={() => setCurrentView('lesson')}
              onNextTopic={handleNextTopic}
              onBackToDashboard={() => setCurrentView('python-dashboard')}
              onStartQuiz={() => setCurrentView('quiz')}
            />
          )}

          {currentView === 'quiz' && (
            <QuizStationPage
              topicId={selectedTopicId}
              onBackToLesson={() => setCurrentView('lesson')}
              onGoToCoding={() => setCurrentView('coding')}
              onNextTopic={handleNextTopic}
            />
          )}

          {currentView === 'coding' && (
            <CodingStudioPage
              topicId={selectedTopicId}
              onOpenAiDrawer={() => setAiDrawerOpen(true)}
              onBackToLesson={() => setCurrentView('lesson')}
              onGoToQuiz={() => setCurrentView('quiz')}
              onNextTopic={handleNextTopic}
            />
          )}

        {currentView === 'projects' && (
          <ProjectHubPage />
        )}

        {currentView === 'diagnostic' && (
          <DiagnosticAssessmentPage
            initialLanguage={diagnosticLang}
            onSelectTopic={handleSelectTopic}
            onBackToCurriculum={() => setCurrentView('catalog')}
          />
        )}

        {currentView === 'bookmarks' && (
          <BookmarksPage onSelectTopic={handleSelectTopic} />
        )}

        {currentView === 'notes' && (
          <NotesPage onSelectTopic={handleSelectTopic} />
        )}

        {currentView === 'history' && (
          <LearningHistoryPage onSelectTopic={handleSelectTopic} />
        )}

        {currentView === 'dashboard' && (
          <LearnerDashboardPage onSelectTopic={handleSelectTopic} />
        )}

        {currentView === 'admin' && (
          <AdminAnalyticsPage />
        )}
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
        onNavigateToCourse={() => setCurrentView('catalog')}
      />

      {/* Personalized Onboarding Modal */}
      <PersonalizedOnboardingModal
        isOpen={onboardingModalOpen}
        onClose={() => setOnboardingModalOpen(false)}
        onStartDiagnostic={handleStartDiagnostic}
        onCompleteOnboarding={() => setCurrentView('catalog')}
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
    <ThemeProvider>
      <AuthProvider>
        <CognitiveProvider>
          <AppContent />
        </CognitiveProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
