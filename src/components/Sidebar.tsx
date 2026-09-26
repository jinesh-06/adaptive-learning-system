import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCognitive, CognitiveLoadLevel } from '../context/CognitiveContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  Brain,
  Home,
  BookOpen,
  Terminal,
  BarChart3,
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
  Search,
  Bookmark,
  FileText,
  History,
  FolderGit2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Monitor,
  Eye,
  X,
  HelpCircle,
  Zap,
  Flame,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
  openAuthModal: () => void;
  openAiDrawer: () => void;
  openSearchModal?: () => void;
  openOnboardingModal?: () => void;
  openDemoModal?: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  isDesktopOpen?: boolean;
  setIsDesktopOpen?: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  selectedTopicId,
  onSelectTopic,
  openAuthModal,
  openAiDrawer,
  openSearchModal,
  openOnboardingModal,
  openDemoModal,
  isMobileOpen = false,
  setIsMobileOpen,
  isDesktopOpen = true,
  setIsDesktopOpen
}) => {
  const { user, preferences, updateLanguage, logout } = useAuth();
  const { currentLoad, confidence } = useCognitive();
  const { theme, setTheme, reducedMotion, toggleReducedMotion } = useTheme();

  // Escape key closes mobile sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && setIsMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, setIsMobileOpen]);

  const [profileOpen, setProfileOpen] = useState(false);
  const [streakDays, setStreakDays] = useState<number>(3);
  const [languageSelectorOpen, setLanguageSelectorOpen] = useState(false);

  useEffect(() => {
    api.getUserSnapshot().then(res => {
      if (res && res.snapshot && typeof res.snapshot.streak_days === 'number') {
        setStreakDays(res.snapshot.streak_days);
      }
    }).catch(() => {});
  }, [user]);

  const languages = [
    { id: 'python', label: 'Python', icon: '🐍', tag: 'Data & AI' },
    { id: 'c', label: 'C Language', icon: '⚡', tag: 'Systems' },
    { id: 'cpp', label: 'C++', icon: '🚀', tag: 'High Speed' },
    { id: 'java', label: 'Java', icon: '☕', tag: 'Enterprise' }
  ];

  const currentLanguageObj = languages.find(l => l.id === preferences.selected_language) || languages[0];

  const getLoadBadgeColor = (load: CognitiveLoadLevel) => {
    switch (load) {
      case 'LOW':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 aura-low';
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 aura-high animate-pulse';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 aura-medium';
    }
  };

  const navItems = [
    { id: 'landing', label: 'Overview / Home', icon: Home },
    { id: 'catalog', label: 'Curriculum & Roadmaps', icon: BookOpen },
    { id: 'python-dashboard', label: 'Python Fundamentals', icon: GraduationCap },
    { id: 'diagnostic', label: 'Diagnostic Assessment', icon: Zap },
    { id: 'dashboard', label: 'Learner Dashboard', icon: BarChart3 },
    { id: 'bookmarks', label: 'Saved Bookmarks', icon: Bookmark },
    { id: 'notes', label: 'Personal Notes', icon: FileText },
    { id: 'history', label: 'Learning History', icon: History },
    { id: 'projects', label: 'Project Hub', icon: FolderGit2 },
    { id: 'admin', label: 'Admin Analytics', icon: ShieldCheck }
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Floating Collapse / Expand Toggle Button for Desktop */}
      <button
        onClick={() => setIsDesktopOpen && setIsDesktopOpen(prev => !prev)}
        aria-label={isDesktopOpen ? "Collapse curriculum sidebar" : "Expand curriculum sidebar"}
        aria-expanded={isDesktopOpen}
        title={isDesktopOpen ? "Collapse curriculum sidebar (Ctrl+B)" : "Expand curriculum sidebar (Ctrl+B)"}
        className={`hidden lg:flex fixed top-20 z-50 items-center justify-center w-6 h-10 rounded-r-xl border border-l-0 border-slate-800 bg-slate-950/95 hover:bg-slate-900 text-slate-400 hover:text-cyan-400 shadow-xl transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none cursor-pointer ${
          isDesktopOpen ? 'left-[260px]' : 'left-0'
        }`}
      >
        {isDesktopOpen ? (
          <ChevronLeft className="w-3.5 h-3.5 transition-transform hover:-translate-x-0.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-cyan-400 transition-transform hover:translate-x-0.5" />
        )}
      </button>

      {/* Vertical Sidebar */}
      <aside
        aria-label="Curriculum and navigation sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 w-[260px] bg-slate-950 border-r border-slate-800/90 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDesktopOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}`}
      >
        {/* TOP SECTION: Brand & Language & Search */}
        <div className="p-4 border-b border-slate-800/80 space-y-3 shrink-0">
          {/* Brand */}
          <div className="flex items-center justify-between">
            <div
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-base font-bold bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  Cognitive<span className="text-cyan-400">Load</span>
                </span>
                <span className="block text-[9px] text-cyan-400/80 font-mono tracking-wider uppercase">
                  Adaptive Learning
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            {setIsMobileOpen && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Vertical Language Selector Dropdown / Menu */}
          <div className="relative">
            <button
              onClick={() => setLanguageSelectorOpen(!languageSelectorOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{currentLanguageObj.icon}</span>
                <div className="text-left">
                  <div className="text-white text-xs font-bold leading-tight">{currentLanguageObj.label}</div>
                  <div className="text-[10px] text-cyan-400 font-mono leading-tight">{currentLanguageObj.tag}</div>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${languageSelectorOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Vertical language selection list */}
            {languageSelectorOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-30 space-y-1 animate-fade-in">
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Select Language Track
                </div>
                {languages.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      updateLanguage(lang.id);
                      setLanguageSelectorOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      preferences.selected_language === lang.id
                        ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{lang.icon}</span>
                      <span>{lang.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{lang.tag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Search Button */}
          {openSearchModal && (
            <button
              onClick={() => {
                openSearchModal();
                if (setIsMobileOpen) setIsMobileOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-400 text-xs transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px]">Search concepts...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">⌘K</kbd>
            </button>
          )}
        </div>

        {/* MIDDLE SECTION: Navigation Menu Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">

          {/* Group 2: Platform Navigation */}
          <div className="space-y-1">
            <div className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1.5">
              Platform Views
            </div>

            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-800/90 border border-slate-700/80 text-cyan-400 shadow-sm before:absolute before:left-1 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-cyan-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* AI Copilot & Live Demo CTA */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <button
              onClick={() => {
                openAiDrawer();
                if (setIsMobileOpen) setIsMobileOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 hover:border-purple-400 text-purple-300 text-xs font-bold transition-all group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
                <span>AI Tutor Copilot</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300">RAG</span>
            </button>

            {openDemoModal && (
              <button
                onClick={() => {
                  openDemoModal();
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-cyan-950/20 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Adaptive Live Demo</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400">Interactive</span>
              </button>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: Cognitive Load, Streak, Theme & User */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2 shrink-0">
          {/* Cognitive Load Telemetry Badge */}
          <div
            className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-semibold flex items-center justify-between transition-all ${getLoadBadgeColor(currentLoad)}`}
            title={`Real-Time Cognitive Load: ${currentLoad} (${Math.round(confidence * 100)}% Confidence)`}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  currentLoad === 'HIGH' ? 'bg-rose-400' : currentLoad === 'LOW' ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  currentLoad === 'HIGH' ? 'bg-rose-500' : currentLoad === 'LOW' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
              </span>
              <span className="font-bold text-[11px]">LOAD: {currentLoad}</span>
            </div>
            <span className="text-[10px] text-slate-400">{Math.round(confidence * 100)}% Conf</span>
          </div>

          {/* Streak & Accessibility Controls */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5" title={`${streakDays} Day Learning Streak`}>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-mono text-xs font-bold text-slate-200">{streakDays}d Streak</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleReducedMotion}
                className={`p-1.5 rounded-lg border transition-colors ${
                  reducedMotion
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                    : 'border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Toggle Reduced Motion"
              >
                <Eye className="w-3 h-3" />
              </button>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* User Profile / Auth */}
          <div className="relative pt-1 border-t border-slate-800/60">
            {user ? (
              <div>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left truncate">
                      <div className="text-xs font-semibold text-white truncate leading-tight">{user.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate leading-tight capitalize">{preferences.current_level}</div>
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl space-y-1 z-50 animate-fade-in">
                    <div className="px-2 py-1 text-[10px] font-mono text-slate-400 truncate">
                      {user.email}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
