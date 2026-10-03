import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { JAVA_OOP_TOPICS, JAVA_OOP_MODULES, JavaOopTopic } from '../data/javaOopData';
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

export interface JavaOopDashboardProps {
  onSelectTopic: (topicId: string) => void;
  onSelectAdaptedLesson?: (topicId: string) => void;
  onBackToCatalog?: () => void;
  onStartQuiz?: (topicId: string) => void;
  onOpenCoding?: (topicId: string) => void;
}

export const JavaOopDashboard: React.FC<JavaOopDashboardProps> = ({
  onSelectTopic,
  onSelectAdaptedLesson,
  onBackToCatalog,
  onStartQuiz,
  onOpenCoding
}) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'Intermediate'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress' | 'unlocked'>('all');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.getJavaOopDashboard();
      if (data && data.topics && data.topics.length > 0) {
        setDashboardData(data);
      } else {
        fallbackLocalData();
      }
    } catch (err) {
      console.warn('Failed to load Java OOP dashboard from API, using fallback:', err);
      fallbackLocalData();
    } finally {
      setLoading(false);
    }
  };

  const fallbackLocalData = () => {
    // Read persisted progress from localStorage
    let storedProgress: any[] = [];
    try {
      const raw = localStorage.getItem('cog_java_oop_progress');
      if (raw) storedProgress = JSON.parse(raw);
    } catch (e) {
      console.warn('Could not parse cog_java_oop_progress', e);
    }

    const progressMap: Record<string, any> = {};
    if (Array.isArray(storedProgress)) {
      storedProgress.forEach((p: any) => {
        progressMap[p.topic_id] = p;
      });
    }

    let completedCount = 0;
    let quizCompletedCount = 0;
    let currentTopicId = JAVA_OOP_TOPICS[0].id;
    let firstIncompleteFound = false;

    // Prerequisite sequential module unlocking
    let prevModuleCompleted = true;

    const moduleStats = JAVA_OOP_MODULES.map((mod) => {
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
    const totalTopics = JAVA_OOP_TOPICS.length;
    const overallProgress = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
    const remainingMinutes = allProcessedTopics
      .filter(t => t.status !== 'COMPLETED')
      .reduce((acc, t) => acc + (t.estimatedMinutes || 20), 0);

    const completedModulesCount = moduleStats.filter(m => m.isCompleted).length;

    setDashboardData({
      title: 'Java Object-Oriented Design',
      subtitle: 'Master object-oriented programming in Java by learning classes, objects, constructors, encapsulation, inheritance, polymorphism, abstraction, interfaces, and object-oriented design principles. Build reusable, maintainable, and scalable applications using real-world Java programming techniques.',
      language: 'java',
      level: 'Intermediate',
      difficulty: 'Intermediate',
      total_modules: JAVA_OOP_MODULES.length,
      completed_modules: completedModulesCount,
      total_topics: totalTopics,
      completed_topics: completedCount,
      quizzes_completed: quizCompletedCount,
      overall_progress: overallProgress,
      current_topic_id: currentTopicId,
      streak_days: 4,
      estimated_remaining_minutes: remainingMinutes,
      total_duration_hours: 10,
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
          <p className="text-sm font-mono tracking-wider">CALIBRATING JAVA OOP CURRICULUM...</p>
        </div>
      </div>
    );
  }

  const overallProgress = dashboardData?.overall_progress || 0;
  const currentTopicId = dashboardData?.current_topic_id || JAVA_OOP_TOPICS[0].id;
  const currentTopic = JAVA_OOP_TOPICS.find(t => t.id === currentTopicId) || JAVA_OOP_TOPICS[0];

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
          <span className="text-cyan-400 font-bold">Java Object-Oriented Design</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-3 h-3" />
            <span>Intermediate Track • 10 Hours</span>
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
              <span className="text-purple-400">INTERMEDIATE</span>
              <span>•</span>
              <span className="text-emerald-400">8 MODULES • 37 TOPICS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Java Object-Oriented Design
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Master object-oriented programming in Java by learning classes, objects, constructors, encapsulation,
              inheritance, polymorphism, abstraction, interfaces, and object-oriented design principles. Build reusable,
              maintainable, and scalable applications using real-world Java programming techniques.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Modules</div>
                  <div className="text-sm font-bold text-white">8 Modules</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Topics</div>
                  <div className="text-sm font-bold text-white">37 Complete</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Estimated Duration</div>
                  <div className="text-sm font-bold text-white">10 Hours</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Completed</div>
                  <div className="text-sm font-bold text-emerald-400">{dashboardData?.completed_topics || 0} / 37</div>
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
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                style={{ width: `${overallProgress}%` }}
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-xs text-slate-400">Recommended Next Topic:</div>
              <div className="text-sm font-bold text-white line-clamp-1">{currentTopic?.title}</div>
            </div>

            <button
              onClick={() => onSelectTopic(currentTopic.id)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{overallProgress === 100 ? 'Review Track' : overallProgress > 0 ? 'Continue Lesson' : 'Start Track'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MODULE ARCHITECTURE CARDS (Prerequisite sequential unlocking) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-5 rounded-full bg-cyan-400" />
            Curriculum Modules (8 Modules)
          </h2>
          <span className="text-xs text-slate-400">Prerequisite unlocking enforced</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modulesList.map((m: any) => {
            const isLocked = m.isLocked;
            const isCompleted = m.isCompleted;
            const pct = m.completionPercentage || 0;

            return (
              <div
                key={m.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isLocked
                    ? 'bg-slate-900/30 border-slate-800/60 opacity-60'
                    : isCompleted
                    ? 'bg-slate-900/70 border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40 shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      MODULE {m.numberDisplay || m.number}
                    </span>
                    {isLocked ? (
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>Locked</span>
                      </span>
                    ) : isCompleted ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-blue-400 font-mono font-semibold">
                        {pct}%
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                    {m.title.replace(/^MODULE \d+:\s*/, '')}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-400'
                          : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{m.completedTopics || 0} / {m.topicsCount || m.topicCount} topics</span>
                    <span>⏱ {m.duration}</span>
                  </div>

                  <button
                    disabled={isLocked}
                    onClick={() => {
                      if (!isLocked && m.topics && m.topics.length > 0) {
                        const firstIncomp = m.topics.find((t: any) => t.status !== 'COMPLETED');
                        onSelectTopic(firstIncomp ? firstIncomp.id : m.topics[0].id);
                      }
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isLocked
                        ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                        : isCompleted
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 cursor-pointer'
                        : 'bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/20 cursor-pointer'
                    }`}
                  >
                    <span>{isLocked ? 'Locked' : isCompleted ? 'Review Module' : 'Explore Module'}</span>
                    {!isLocked && <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. SEARCH & FILTER CONTROLS */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search topics (e.g. Encapsulation, Polymorphism, Interfaces)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </span>
            {(['all', 'unlocked', 'in_progress', 'completed'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* 5. TOPIC LIST TABLE / CARDS */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/80 overflow-hidden shadow-xl">
          {filteredTopics.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No topics match your current search and filter criteria.
            </div>
          ) : (
            filteredTopics.map((topic: any) => {
              const isLocked = topic.status === 'LOCKED';
              const isDone = topic.status === 'COMPLETED';
              const isInProg = topic.status === 'IN_PROGRESS';

              return (
                <div
                  key={topic.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isLocked
                      ? 'bg-slate-950/30 opacity-60'
                      : 'hover:bg-slate-900/60 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!isLocked) onSelectTopic(topic.id);
                  }}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Status Icon */}
                    <div className="shrink-0 mt-0.5 sm:mt-0">
                      {isLocked ? (
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                          <Lock className="w-4 h-4" />
                        </div>
                      ) : isDone ? (
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : isInProg ? (
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-cyan-400">
                          <Play className="w-4 h-4 fill-current" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-mono text-xs font-bold">
                          {topic.numberDisplay || topic.number}
                        </div>
                      )}
                    </div>

                    {/* Topic Metadata */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                        <span className="text-cyan-400 font-bold">TOPIC {topic.numberDisplay || topic.number}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">{topic.moduleTitle || 'Java Object-Oriented Design'}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {topic.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {topic.shortDescription || topic.desc}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Completion info */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <div className="text-right hidden md:block">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{topic.estimatedMinutes || 20} mins</span>
                      </div>
                      {topic.quiz_score !== undefined && topic.quiz_score !== null && (
                        <div className="text-[11px] text-cyan-400 font-mono font-semibold">
                          Quiz: {topic.quiz_score}%
                        </div>
                      )}
                    </div>

                    <button
                      disabled={isLocked}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLocked) onSelectTopic(topic.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isLocked
                          ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                          : isDone
                          ? 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800'
                          : isInProg
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/20'
                      }`}
                    >
                      <span>{isLocked ? 'Locked' : isDone ? 'Review' : isInProg ? 'Continue' : 'Start'}</span>
                      {!isLocked && <ArrowRight className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
