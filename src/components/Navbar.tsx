import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCognitive, CognitiveLoadLevel } from '../context/CognitiveContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  Brain,
  Home,
  Terminal,
  BookOpen,
  BarChart3,
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
  Flame,
  FolderGit2,
  Sun,
  Moon,
  Monitor,
  Eye,
  Bookmark,
  FileText,
  History,
  Search
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  openAuthModal: () => void;
  openAiDrawer: () => void;
  openSearchModal?: () => void;
  openOnboardingModal?: () => void;
  openDemoModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  openAuthModal,
  openAiDrawer,
  openSearchModal,
  openOnboardingModal,
  openDemoModal
}) => {
  const { user, preferences, updateLanguage, updateLevel, logout } = useAuth();
  const { currentLoad, confidence, contentMode } = useCognitive();
  const { theme, setTheme, reducedMotion, toggleReducedMotion } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [streakDays, setStreakDays] = useState<number>(3);

  useEffect(() => {
    api.getUserSnapshot().then(res => {
      if (res && res.snapshot && typeof res.snapshot.streak_days === 'number') {
        setStreakDays(res.snapshot.streak_days);
      }
    }).catch(() => {});
  }, [user]);

  const languages = [
    { id: 'python', label: 'Python', icon: '🐍' },
    { id: 'c', label: 'C Language', icon: '⚡' },
    { id: 'cpp', label: 'C++', icon: '🚀' },
    { id: 'java', label: 'Java', icon: '☕' }
  ];

  const levels = [
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' }
  ];

  const getLoadBadgeColor = (load: CognitiveLoadLevel) => {
    switch (load) {
      case 'LOW':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 aura-low';
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 aura-high';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 aura-medium';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                Cognitive<span className="text-cyan-400">Load</span>
              </span>
              <span className="block text-[10px] text-cyan-400/80 font-medium tracking-wider uppercase">
                Adaptive Learning Engine
              </span>
            </div>
          </div>

          {/* Language Selector */}
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
            {languages.map(lang => (
              <button
                key={lang.id}
                onClick={() => updateLanguage(lang.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  preferences.selected_language === lang.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{lang.icon}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Global Search Trigger (Section 111) */}
          <button
            onClick={openSearchModal}
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-400 text-xs transition-colors"
            title="Global Search (Cmd/Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">Search concepts, questions...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">⌘K</kbd>
          </button>
        </div>

        {/* Center: Nav links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => setCurrentView('landing')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'landing'
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setCurrentView('catalog')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'catalog' || currentView === 'lesson'
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curriculum</span>
          </button>

          <button
            onClick={() => setCurrentView('coding')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'coding'
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Sandbox Studio</span>
          </button>

          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'dashboard'
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('bookmarks')}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'bookmarks'
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
            title="Saved Bookmarks"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Saved</span>
          </button>

          <button
            onClick={() => setCurrentView('notes')}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'notes'
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
            title="Personal Notes"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Notes</span>
          </button>

          <button
            onClick={() => setCurrentView('admin')}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'admin'
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Right Section: Cognitive State Badge & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Button */}
          <button
            onClick={openSearchModal}
            className="xl:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Global Search"
          >
            <Search className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Section 117 Live Adaptive Demonstration Button */}
          <button
            onClick={openDemoModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition-all hover:scale-105 shadow-sm"
            title="Live Closed-Loop Adaptive Presentation Walkthrough (Section 117)"
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">Live Demo</span>
          </button>

          {/* Daily Streak Indicator (Section 68) */}
          <div
            title={`${streakDays} Day Learning Streak`}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{streakDays}d</span>
          </div>

          {/* Cognitive Indicator Pill */}
          <div
            title={`Cognitive Load: ${currentLoad} (${Math.round(confidence * 100)}% Confidence) - Mode: ${contentMode}`}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold ${getLoadBadgeColor(
              currentLoad
            )}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
            </span>
            <span className="hidden md:inline">Load:</span>
            <span>{currentLoad}</span>
          </div>

          {/* Theme & A11y Controls (Sections 86 & 87) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
              title={`Theme: ${theme} (Click to switch)`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
              aria-label={`Current theme is ${theme}. Click to switch theme.`}
            >
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : theme === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Monitor className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={toggleReducedMotion}
              title={reducedMotion ? "Reduced Motion Enabled" : "Standard Animations"}
              className={`p-1.5 rounded-lg transition-colors ${reducedMotion ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-slate-300'}`}
              aria-label="Toggle Reduced Motion"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Copilot Drawer Trigger */}
          <button
            onClick={openAiDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">AI Copilot</span>
          </button>

          {/* User Profile */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline text-xs font-medium max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className="text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-mono">
                      Role: {user.role}
                    </span>
                  </div>
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-slate-400 mb-1 font-medium">Difficulty Level:</p>
                    <div className="grid grid-cols-3 gap-1">
                      {levels.map(lvl => (
                        <button
                          key={lvl.id}
                          onClick={() => updateLevel(lvl.id)}
                          className={`py-1 rounded text-[10px] font-semibold ${
                            preferences.current_level === lvl.id
                              ? 'bg-cyan-500 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="py-1 border-b border-slate-800">
                    <button
                      onClick={() => {
                        setCurrentView('bookmarks');
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                      <span>My Bookmarks</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('notes');
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>My Notes</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('history');
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                    >
                      <History className="w-3.5 h-3.5 text-purple-400" />
                      <span>Learning History</span>
                    </button>
                    <button
                      onClick={() => {
                        openOnboardingModal?.();
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Personalize Path</span>
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-rose-400 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
