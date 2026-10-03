import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { C_FUNDAMENTALS_TOPICS, C_MODULES, CTopic } from '../data/cFundamentalsData';
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
  Brain,
  Code,
  Layers,
  Terminal,
  Cpu,
  HelpCircle
} from 'lucide-react';

export interface CDashboardProps {
  onSelectTopic: (topicId: string) => void;
  onSelectAdaptedLesson?: (topicId: string) => void;
  onBackToCatalog?: () => void;
  onStartQuiz?: (topicId: string) => void;
  onOpenCoding?: (topicId: string) => void;
}

export const CProgrammingFoundationsDashboard: React.FC<CDashboardProps> = ({
  onSelectTopic,
  onSelectAdaptedLesson,
  onBackToCatalog,
  onStartQuiz,
  onOpenCoding
}) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced Project'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress' | 'unlocked'>('all');
  const [activeModuleTab, setActiveModuleTab] = useState<string>('all');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.getCFundamentals();
      if (data && data.topics) {
        setDashboardData(data);
      } else {
        fallbackLocalData();
      }
    } catch (err) {
      console.warn('Failed to load C dashboard from API, using fallback:', err);
      fallbackLocalData();
    } finally {
      setLoading(false);
    }
  };

  const fallbackLocalData = () => {
    // Read persisted progress from localStorage
    let storedProgress: any[] = [];
    try {
      const raw = localStorage.getItem('cog_c_progress');
      if (raw) storedProgress = JSON.parse(raw);
    } catch (e) {
      console.warn('Could not parse cog_c_progress', e);
    }

    const progressMap: Record<string, any> = {};
    if (Array.isArray(storedProgress)) {
      storedProgress.forEach((p: any) => {
        progressMap[p.topic_id] = p;
      });
    }

    let completedCount = 0;
    let quizCompletedCount = 0;
    let currentTopicId = C_FUNDAMENTALS_TOPICS[0].id;
    let firstIncompleteFound = false;

    const topicsOutput = C_FUNDAMENTALS_TOPICS.map((topic, idx) => {
      const prog = progressMap[topic.id] || {};
      let status = prog.status || 'NOT_STARTED';
      const compPct = Number(prog.completion_pct || 0);
      const quizScore = prog.quiz_score;

      if (status === 'COMPLETED' || compPct >= 95) {
        status = 'COMPLETED';
        completedCount++;
        if (quizScore !== undefined && quizScore > 0) quizCompletedCount++;
      } else if (status === 'IN_PROGRESS' || compPct > 0) {
        status = 'IN_PROGRESS';
        if (!firstIncompleteFound) {
          currentTopicId = topic.id;
          firstIncompleteFound = true;
        }
      } else {
        if (idx === 0) {
          status = 'NOT_STARTED';
        } else {
          const prevProg = progressMap[C_FUNDAMENTALS_TOPICS[idx - 1].id] || {};
          if (prevProg.status === 'COMPLETED' || prevProg.completion_pct >= 95) {
            status = 'NOT_STARTED';
          } else {
            status = 'LOCKED';
          }
        }
        if (status !== 'LOCKED' && !firstIncompleteFound) {
          currentTopicId = topic.id;
          firstIncompleteFound = true;
        }
      }

      return {
        ...topic,
        desc: topic.shortDescription,
        status,
        completion_percentage: compPct,
        quiz_score: quizScore,
        attempts: prog.attempts || 0,
        time_spent_seconds: prog.time_spent_seconds || 0,
        has_adapted_lesson: false
      };
    });

    const totalTopics = C_FUNDAMENTALS_TOPICS.length;
    const overallProgress = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
    const remainingMinutes = topicsOutput
      .filter(t => t.status !== 'COMPLETED')
      .reduce((acc, t) => acc + t.estimatedMinutes, 0);

    setDashboardData({
      title: 'C Programming Foundations',
      subtitle: 'Master systems programming, hardware memory models, pointers, and manual memory management through 16 structured, cognitive load-aware topics.',
      total_modules: 4,
      total_topics: totalTopics,
      completed_topics: completedCount,
      quizzes_completed: quizCompletedCount,
      overall_progress: overallProgress,
      current_topic_id: currentTopicId,
      streak_days: 4,
      estimated_remaining_minutes: remainingMinutes,
      learning_signals_status: 'Cognitive Engine Calibrated & Active',
      topics: topicsOutput
    });
  };

  const topicsList: any[] = dashboardData?.topics || [];

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
    let matchModule = true;
    if (activeModuleTab !== 'all') matchModule = t.moduleId === activeModuleTab;
    return matchQuery && matchDiff && matchStatus && matchModule;
  });

  const currentTopic = topicsList.find((t: any) => t.id === dashboardData?.current_topic_id) || topicsList[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Top Breadcrumb & Status */}
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
          <span>{dashboardData?.learning_signals_status || 'Cognitive Engine Calibrated & Active'}</span>
        </div>
      </div>

      {/* Hero Course Overview Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" />
                <span>C Systems Track • 16 Topics (8h 30m)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {dashboardData?.title || 'C Programming Foundations'}
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {dashboardData?.subtitle ||
                  'Master systems programming, hardware memory models, pointers, and manual memory management through 16 structured, cognitive load-aware topics.'}
              </p>
            </div>

            {/* Overall Progress Circle/Stat */}
            <div className="flex items-center gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center font-mono font-black text-xl text-white">
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
                <div className="text-slate-400 text-[11px]">Total Modules</div>
                <div className="font-bold text-white text-sm">16 Topics</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">Quizzes Cleared</div>
                <div className="font-bold text-white text-sm">
                  {dashboardData?.quizzes_completed || 0} Cleared
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">Current Streak</div>
                <div className="font-bold text-white text-sm">{dashboardData?.streak_days || 4} Days</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">Remaining</div>
                <div className="font-bold text-white text-sm">
                  {Math.round((dashboardData?.estimated_remaining_minutes || 510) / 60)} hrs remaining
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Next Step Callout */}
          {currentTopic && (
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Recommended Next Step</span>
                </div>
                <div className="text-white font-bold text-base sm:text-lg">
                  {currentTopic.numberDisplay}. {currentTopic.title}
                </div>
                <p className="text-xs text-slate-300 max-w-xl">
                  {currentTopic.shortDescription || currentTopic.desc}
                </p>
              </div>

              <button
                onClick={() => onSelectTopic(currentTopic.id)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 shrink-0 cursor-pointer"
              >
                <span>Continue Lesson</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Module Quick Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveModuleTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeModuleTab === 'all'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
              : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All 16 Topics
        </button>
        {C_MODULES.map(m => (
          <button
            key={m.id}
            onClick={() => setActiveModuleTab(m.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeModuleTab === m.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {m.title}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search C topics, pointers, structs, files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['all', 'Beginner', 'Intermediate', 'Advanced Project'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff)}
                className={`px-3 py-1 rounded-lg transition-colors font-medium capitalize whitespace-nowrap ${
                  filterDifficulty === diff
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff === 'all' ? 'All Diff' : diff}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['all', 'unlocked', 'in_progress', 'completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg transition-colors font-medium capitalize whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'all' ? 'All Status' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Curriculum Topics Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Showing {filteredTopics.length} of {topicsList.length} Lessons</span>
          <span>Click any unlocked lesson card to begin</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic: any) => {
            const isLocked = topic.status === 'LOCKED';
            const isCompleted = topic.status === 'COMPLETED';
            const isInProgress = topic.status === 'IN_PROGRESS';

            return (
              <div
                key={topic.id}
                onClick={() => !isLocked && onSelectTopic(topic.id)}
                className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                  isLocked
                    ? 'bg-slate-950/40 border-slate-900 opacity-60 cursor-not-allowed'
                    : isCompleted
                    ? 'bg-slate-900/70 border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer shadow-lg hover:shadow-emerald-500/5'
                    : isInProgress
                    ? 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-500/70 cursor-pointer shadow-lg hover:shadow-cyan-500/5 ring-1 ring-cyan-500/20'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 cursor-pointer shadow-md'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Number & Badges */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-cyan-400 transition-colors">
                      LESSON {topic.numberDisplay}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>COMPLETED</span>
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold">
                          <Play className="w-3 h-3" />
                          <span>IN PROGRESS</span>
                        </span>
                      ) : isLocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-500 text-[10px] font-mono font-bold">
                          <Lock className="w-3 h-3" />
                          <span>LOCKED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold">
                          READY
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {topic.shortDescription || topic.desc}
                    </p>
                  </div>
                </div>

                {/* Footer Info & Action */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {topic.estimatedMinutes} min
                    </span>
                    <span className="text-cyan-400 font-semibold">{topic.difficulty}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLocked) onSelectTopic(topic.id);
                      }}
                      disabled={isLocked}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isLocked
                          ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                          : isCompleted
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <span>Review</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </>
                      ) : (
                        <>
                          <span>{isInProgress ? 'Resume' : 'Start Lesson'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    {onStartQuiz && !isLocked && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartQuiz(topic.id);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                        title="Take 5-Question Quiz"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    )}

                    {onOpenCoding && !isLocked && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCoding(topic.id);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                        title="Practice in C Sandbox"
                      >
                        <Code className="w-3.5 h-3.5 text-cyan-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
