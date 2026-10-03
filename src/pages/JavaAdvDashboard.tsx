import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { JAVA_ADV_TOPICS, JAVA_ADV_MODULES, JavaAdvTopic } from '../data/javaAdvData';
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
  HelpCircle,
  ShieldCheck,
  Box,
  Compass
} from 'lucide-react';

export interface JavaAdvDashboardProps {
  onSelectTopic: (topicId: string) => void;
  onSelectAdaptedLesson?: (topicId: string) => void;
  onBackToCatalog?: () => void;
  onStartQuiz?: (topicId: string) => void;
  onOpenCoding?: (topicId: string) => void;
}

export const JavaAdvDashboard: React.FC<JavaAdvDashboardProps> = ({
  onSelectTopic,
  onSelectAdaptedLesson,
  onBackToCatalog,
  onStartQuiz,
  onOpenCoding
}) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'Advanced'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress' | 'unlocked'>('all');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.getJavaAdvDashboard();
      if (data && data.topics && data.topics.length > 0) {
        setDashboardData(data);
      } else {
        fallbackLocalData();
      }
    } catch (err) {
      console.warn('Failed to load Advanced Java dashboard from API, using fallback:', err);
      fallbackLocalData();
    } finally {
      setLoading(false);
    }
  };

  const fallbackLocalData = () => {
    // Read persisted progress from localStorage
    let storedProgress: any[] = [];
    try {
      const raw = localStorage.getItem('cog_java_adv_progress');
      if (raw) storedProgress = JSON.parse(raw);
    } catch (e) {
      console.warn('Could not parse cog_java_adv_progress', e);
    }

    const progressMap: Record<string, any> = {};
    if (Array.isArray(storedProgress)) {
      storedProgress.forEach((p: any) => {
        progressMap[p.topic_id] = p;
      });
    }

    let completedCount = 0;
    let quizCompletedCount = 0;
    let currentTopicId = JAVA_ADV_TOPICS[0].id;
    let firstIncompleteFound = false;

    // Prerequisite sequential module unlocking
    let prevModuleCompleted = true;

    const moduleStats = JAVA_ADV_MODULES.map((mod) => {
      let modCompletedCount = 0;
      const isModuleUnlocked = prevModuleCompleted;

      const modProcessedTopics = mod.topics.map((topic, tIdx) => {
        const prog = progressMap[topic.id] || {};
        let status = prog.status || 'NOT_STARTED';
        const compPct = Number(prog.completion_pct || 0);
        const quizScore = prog.quiz_score;

        if (status === 'COMPLETED' || compPct >= 95) {
          status = 'COMPLETED';
          completedCount++;
          modCompletedCount++;
          if (quizScore !== undefined && quizScore > 0) quizCompletedCount++;
        } else if (status === 'IN_PROGRESS' || compPct > 0) {
          status = 'IN_PROGRESS';
          if (!firstIncompleteFound && isModuleUnlocked) {
            currentTopicId = topic.id;
            firstIncompleteFound = true;
          }
        } else {
          if (!isModuleUnlocked) {
            status = 'LOCKED';
          } else {
            if (tIdx === 0) {
              status = 'NOT_STARTED';
            } else {
              const prevTopic = mod.topics[tIdx - 1];
              const prevProg = progressMap[prevTopic.id] || {};
              if (prevProg.status === 'COMPLETED' || (prevProg.completion_pct || 0) >= 95) {
                status = 'NOT_STARTED';
              } else {
                status = 'LOCKED';
              }
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

      const modTotal = mod.topics.length;
      const modPct = modTotal > 0 ? Math.round((modCompletedCount / modTotal) * 100) : 0;
      const isModDone = modCompletedCount === modTotal && modTotal > 0;

      prevModuleCompleted = isModDone;

      return {
        id: mod.id,
        number: mod.number,
        numberDisplay: mod.numberDisplay,
        title: mod.title,
        level: mod.level,
        duration: mod.duration,
        estimatedMinutes: mod.estimatedMinutes,
        description: mod.description,
        topicsCount: modTotal,
        completedTopics: modCompletedCount,
        completionPercentage: modPct,
        isLocked: !isModuleUnlocked,
        is_locked: !isModuleUnlocked,
        isCompleted: isModDone,
        is_completed: isModDone,
        topics: modProcessedTopics
      };
    });

    const allProcessedTopics = moduleStats.flatMap(m => m.topics);
    const totalTopics = JAVA_ADV_TOPICS.length;
    const overallProgress = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
    const remainingMinutes = allProcessedTopics
      .filter(t => t.status !== 'COMPLETED')
      .reduce((acc, t) => acc + (t.estimatedMinutes || 25), 0);

    const completedModulesCount = moduleStats.filter(m => m.isCompleted).length;

    setDashboardData({
      title: 'Advanced Java & Collections Framework',
      subtitle: 'Master advanced Java programming concepts, including the Collections Framework, generics, functional programming, streams, lambda expressions, concurrency, multithreading, and modern Java features.',
      language: 'java',
      level: 'Advanced',
      difficulty: 'Advanced',
      total_modules: JAVA_ADV_MODULES.length,
      completed_modules: completedModulesCount,
      total_topics: totalTopics,
      completed_topics: completedCount,
      quizzes_completed: quizCompletedCount,
      overall_progress: overallProgress,
      current_topic_id: currentTopicId,
      streak_days: 5,
      estimated_remaining_minutes: remainingMinutes,
      total_duration_hours: 14,
      learning_signals_status: 'Cognitive Engine Calibrated & Active',
      modules: moduleStats,
      topics: allProcessedTopics
    });
  };

  const topicsList = dashboardData?.topics || [];
  const modulesList = dashboardData?.modules || [];

  // Filter topics
  const filteredTopics = topicsList.filter((topic: any) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (topic.shortDescription || topic.desc || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDifficulty =
      filterDifficulty === 'all' || topic.difficulty === filterDifficulty;

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && topic.status === 'COMPLETED') ||
      (filterStatus === 'in_progress' && topic.status === 'IN_PROGRESS') ||
      (filterStatus === 'unlocked' && topic.status !== 'LOCKED');

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono tracking-wider">CALIBRATING ADVANCED JAVA CURRICULUM...</p>
        </div>
      </div>
    );
  }

  const overallProgress = dashboardData?.overall_progress || 0;
  const currentTopicId = dashboardData?.current_topic_id || JAVA_ADV_TOPICS[0].id;
  const currentTopic = JAVA_ADV_TOPICS.find(t => t.id === currentTopicId) || JAVA_ADV_TOPICS[0];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* 1. TOP BREADCRUMB & BACK TO CATALOG */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {onBackToCatalog && (
            <button
              onClick={onBackToCatalog}
              className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Curriculum Explorer</span>
            </button>
          )}
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 font-semibold">Java Track</span>
          <span className="text-slate-600">/</span>
          <span className="text-cyan-400 font-bold">Advanced Java & Collections Framework</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-3 h-3" />
            <span>Advanced Track • 14 Hours</span>
          </span>
        </div>
      </div>

      {/* 2. HERO COURSE BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
              <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">JAVA TRACK</span>
              <span>•</span>
              <span className="text-amber-400">ADVANCED LEVEL</span>
              <span>•</span>
              <span className="text-emerald-400">5 SECTIONS • 28 LESSONS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Advanced Java & Collections Framework
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Master advanced Java programming concepts, including the Collections Framework, generics, functional
              programming, streams, lambda expressions, concurrency, multithreading, and modern Java features. Build
              production-ready, scalable Java applications with hands-on exercises and adaptive insights.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Sections</div>
                  <div className="text-sm font-bold text-white">5 Sections</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Total Lessons</div>
                  <div className="text-sm font-bold text-white">28 Lessons</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Estimated Duration</div>
                  <div className="text-sm font-bold text-white">14 Hours</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Completed</div>
                  <div className="text-sm font-bold text-emerald-400">{dashboardData?.completed_topics || 0} / 28</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Box: Progress & Continue CTA */}
          <div className="w-full lg:w-80 shrink-0 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-5 shadow-xl">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Track Progress</span>
              <span className="text-cyan-400 font-mono text-sm font-bold">{overallProgress}%</span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.max(overallProgress, 2)}%` }}
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>Recommended Next Lesson</span>
              </div>
              <p className="text-xs font-bold text-white line-clamp-1">{currentTopic?.title}</p>
              <p className="text-[11px] text-slate-400 font-mono">
                Lesson {currentTopic?.numberDisplay} • {currentTopic?.estimatedMinutes} mins
              </p>
            </div>

            <button
              onClick={() => onSelectTopic(currentTopicId)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all cursor-pointer group"
            >
              <span>{overallProgress === 100 ? 'Review Final Project' : overallProgress > 0 ? 'Continue Lesson' : 'Start Lesson 01'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. SECTION OVERVIEW ROADMAP */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>5 Curriculum Sections</span>
            </h2>
            <p className="text-xs text-slate-400">
              Structured progressive modules designed to build advanced mastery sequentially.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modulesList.map((m: any) => {
            const isDone = m.isCompleted;
            const isLocked = m.isLocked;

            return (
              <div
                key={m.id}
                className={`relative rounded-2xl p-5 border transition-all ${
                  isDone
                    ? 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/50'
                    : isLocked
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-75'
                    : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      SEC {m.numberDisplay}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">{m.duration}</span>
                  </div>

                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Done</span>
                    </span>
                  ) : isLocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded-full border border-slate-800">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      <span>{m.completionPercentage}%</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{m.title}</h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">{m.description}</p>

                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{m.completedTopics} of {m.topicsCount} lessons complete</span>
                    <span className="font-mono">{m.completionPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone ? 'bg-emerald-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${m.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. LESSON DIRECTORY WITH SEARCH & FILTERS */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-cyan-400" />
              <span>All 28 Lessons</span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive lessons featuring concept breakdowns, ASCII diagrams, real code, quizzes, and coding challenges.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lessons or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 w-48 sm:w-56"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500/60"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="unlocked">Unlocked</option>
            </select>
          </div>
        </div>

        {/* Lesson Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic: any) => {
            const isCompleted = topic.status === 'COMPLETED' || topic.completion_percentage >= 95;
            const isInProgress = topic.status === 'IN_PROGRESS' || (topic.completion_percentage > 0 && !isCompleted);
            const isLocked = topic.status === 'LOCKED';

            return (
              <div
                key={topic.id}
                className={`flex flex-col justify-between rounded-2xl p-5 border transition-all ${
                  isCompleted
                    ? 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/60'
                    : isInProgress
                    ? 'bg-slate-900/90 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                    : isLocked
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      LESSON {topic.numberDisplay}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{topic.estimatedMinutes}m</span>
                      </span>

                      {isCompleted ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Done</span>
                        </span>
                      ) : isLocked ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Prereq</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {topic.difficulty}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {topic.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5 line-clamp-1">
                      {topic.moduleTitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {topic.shortDescription || topic.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400 font-mono">
                    {topic.quiz_score !== undefined && topic.quiz_score > 0 ? (
                      <span className="text-emerald-400 font-bold">Quiz: {topic.quiz_score}%</span>
                    ) : (
                      <span>{isCompleted ? '100% Completed' : isLocked ? 'Complete preceding lesson' : 'Ready to start'}</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (!isLocked) onSelectTopic(topic.id);
                    }}
                    disabled={isLocked}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isLocked
                        ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800'
                        : isCompleted
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                    }`}
                  >
                    <span>{isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
