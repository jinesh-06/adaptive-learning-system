import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PYTHON_FUNDAMENTALS_TOPICS, PythonTopic } from '../data/pythonFundamentalsData';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  Sparkles,
  Flame,
  Search,
  Filter,
  Play,
  Award,
  Zap,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Brain
} from 'lucide-react';

export interface PythonDashboardProps {
  onSelectTopic: (topicId: string) => void;
  onSelectAdaptedLesson?: (topicId: string) => void;
  onBackToCatalog?: () => void;
}

export const PythonFundamentalsDashboard: React.FC<PythonDashboardProps> = ({
  onSelectTopic,
  onSelectAdaptedLesson,
  onBackToCatalog
}) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'Beginner' | 'Intermediate'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress' | 'unlocked'>('all');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.getPythonFundamentals();
      if (data && data.topics) {
        setDashboardData(data);
      } else {
        // Fallback using data
        fallbackLocalData();
      }
    } catch (err) {
      console.warn('Failed to load dashboard from API, using fallback:', err);
      fallbackLocalData();
    } finally {
      setLoading(false);
    }
  };

  const fallbackLocalData = () => {
    const total = PYTHON_FUNDAMENTALS_TOPICS.length;
    setDashboardData({
      title: 'Python Fundamentals',
      subtitle: 'Build a rock-solid Python foundation through structured concept walkthroughs, interactive coding, and adaptive learning.',
      total_topics: total,
      completed_topics: 0,
      quizzes_completed: 0,
      overall_progress: 0,
      current_topic_id: PYTHON_FUNDAMENTALS_TOPICS[0].id,
      streak_days: 3,
      estimated_remaining_minutes: PYTHON_FUNDAMENTALS_TOPICS.reduce((acc, t) => acc + t.estimatedMinutes, 0),
      learning_signals_status: 'Calibrated & Active',
      topics: PYTHON_FUNDAMENTALS_TOPICS.map((t, idx) => ({
        ...t,
        desc: t.shortDescription,
        status: idx === 0 ? 'NOT_STARTED' : 'LOCKED',
        completion_percentage: 0,
        quiz_score: null,
        has_adapted_lesson: false
      }))
    });
  };

  const topicsList = dashboardData?.topics || [];

  // Filter topics
  const filteredTopics = topicsList.filter((t: any) => {
    const matchQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.desc && t.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchDiff = filterDifficulty === 'all' || t.difficulty === filterDifficulty;
    let matchStatus = true;
    if (filterStatus === 'completed') matchStatus = t.status === 'COMPLETED';
    if (filterStatus === 'in_progress') matchStatus = t.status === 'IN_PROGRESS';
    if (filterStatus === 'unlocked') matchStatus = t.status !== 'LOCKED';
    return matchQuery && matchDiff && matchStatus;
  });

  const currentTopic = topicsList.find((t: any) => t.id === dashboardData?.current_topic_id) || topicsList[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Curriculum & Roadmaps</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <Brain className="w-3.5 h-3.5" />
          <span>{dashboardData?.learning_signals_status || 'Learning Signals Active'}</span>
        </div>
      </div>

      {/* Main Course Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                <span>🐍 Python Track • 16 Topics</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {dashboardData?.title || 'Python Fundamentals'}
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {dashboardData?.subtitle || 'Build a strong foundation in Python through guided lessons, practice, and adaptive learning.'}
              </p>
            </div>

            {/* Overall Progress Circle/Stat */}
            <div className="flex items-center gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center font-mono font-black text-xl text-white">
                {dashboardData?.overall_progress || 0}%
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-400 font-medium">Curriculum Progress</div>
                <div className="text-sm font-bold text-white">
                  {dashboardData?.completed_topics || 0} of {dashboardData?.total_topics || 16} Topics Completed
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Total Modules</span>
                <span className="font-bold text-white text-sm">16 Topics</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Quizzes Cleared</span>
                <span className="font-bold text-white text-sm">{dashboardData?.quizzes_completed || 0} Completed</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Current Streak</span>
                <span className="font-bold text-amber-400 text-sm">{dashboardData?.streak_days || 3} Days 🔥</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Est. Time Remaining</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {Math.round((dashboardData?.estimated_remaining_minutes || 360) / 60)} Hours
                </span>
              </div>
            </div>
          </div>

          {/* Overall Progress Line */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Overall Completion</span>
              <span className="text-cyan-400 font-bold">{dashboardData?.overall_progress || 0}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                style={{ width: `${dashboardData?.overall_progress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* "Continue Learning" Featured Topic Banner */}
      {currentTopic && (
        <div className="p-5 sm:p-6 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-purple-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-cyan-950/20">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended Next Step</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {currentTopic.numberDisplay}. {currentTopic.title}
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              {currentTopic.desc}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTopic(currentTopic.id)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <span>{currentTopic.status === 'IN_PROGRESS' ? 'Resume Lesson' : 'Start Topic'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/60 items-center">
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topic title or concept..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="sm:col-span-3">
          <select
            value={filterDifficulty}
            onChange={e => setFilterDifficulty(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner (Topics 1-6)</option>
            <option value="Intermediate">Intermediate (Topics 7-16)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-4">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Topics (16)</option>
            <option value="unlocked">Unlocked Topics</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* 16 Modular Topic Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs animate-pulse">
          Loading Python Fundamentals curriculum...
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
          No topics found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTopics.map((topic: any) => {
            const isLocked = topic.status === 'LOCKED';
            const isCompleted = topic.status === 'COMPLETED';
            const isInProgress = topic.status === 'IN_PROGRESS';
            const hasAdapted = topic.has_adapted_lesson;

            return (
              <div
                key={topic.id}
                className={`relative rounded-2xl border p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 group shadow-lg ${
                  isLocked
                    ? 'border-slate-800/40 bg-slate-950/40 opacity-60'
                    : isCompleted
                    ? 'border-emerald-500/30 bg-slate-900/60 hover:border-emerald-500/60 shadow-emerald-950/10'
                    : hasAdapted
                    ? 'border-purple-500/40 bg-gradient-to-b from-purple-950/20 to-slate-900/70 hover:border-purple-500/70 shadow-purple-950/20'
                    : 'border-slate-800 bg-slate-900/70 hover:border-cyan-500/50 shadow-black/30'
                }`}
              >
                <div>
                  {/* Card Header: Topic Number & Difficulty Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-sm font-extrabold text-cyan-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      #{topic.numberDisplay}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {topic.difficulty}
                      </span>

                      {/* Status Badges */}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Done
                        </span>
                      )}
                      {isInProgress && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold">
                          In Progress
                        </span>
                      )}
                      {isLocked && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-500 font-medium">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                    {topic.desc}
                  </p>

                  {/* Adapted Lesson Available Flag */}
                  {hasAdapted && (
                    <div className="mb-4 p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-[11px] text-purple-300">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        Adapted Lesson Available
                      </span>
                      {onSelectAdaptedLesson && (
                        <button
                          onClick={() => onSelectAdaptedLesson(topic.id)}
                          className="px-2 py-0.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] transition-all"
                        >
                          Open
                        </button>
                      )}
                    </div>
                  )}

                  {/* Metadata: Time and Quiz */}
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-4 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{topic.estimatedMinutes} min</span>
                    </div>
                    {topic.quiz_score !== null && topic.quiz_score !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-purple-400" />
                        <span>Quiz: {Math.round(topic.quiz_score)}%</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Line */}
                  <div className="mb-5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                      <span>Progress</span>
                      <span className="text-white font-bold">{topic.completion_percentage || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : hasAdapted
                            ? 'bg-purple-500'
                            : 'bg-cyan-500'
                        }`}
                        style={{ width: `${topic.completion_percentage || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card CTA */}
                <div>
                  {isLocked ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-slate-500 font-medium text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Prerequisite Required</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectTopic(topic.id)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 group/btn ${
                        isCompleted
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          : isInProgress
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white'
                      }`}
                    >
                      <span>
                        {isCompleted ? 'Review Topic' : isInProgress ? 'Continue Learning' : 'Start Topic'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
