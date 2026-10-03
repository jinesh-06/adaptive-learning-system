import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CPP_OOP_TOPICS, CPP_OOP_MODULES, CppOopTopic } from '../data/cppOopData';
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

export interface CppOopDashboardProps {
  onSelectTopic: (topicId: string) => void;
  onSelectAdaptedLesson?: (topicId: string) => void;
  onBackToCatalog?: () => void;
  onStartQuiz?: (topicId: string) => void;
  onOpenCoding?: (topicId: string) => void;
}

export const CppOopDashboard: React.FC<CppOopDashboardProps> = ({
  onSelectTopic,
  onSelectAdaptedLesson,
  onBackToCatalog,
  onStartQuiz,
  onOpenCoding
}) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'Intermediate' | 'Advanced Project'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress' | 'unlocked'>('all');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.getCppOopDashboard();
      if (data && data.topics && data.topics.length > 0) {
        setDashboardData(data);
      } else {
        fallbackLocalData();
      }
    } catch (err) {
      console.warn('Failed to load C++ OOP dashboard from API, using fallback:', err);
      fallbackLocalData();
    } finally {
      setLoading(false);
    }
  };

  const fallbackLocalData = () => {
    // Read persisted progress from localStorage
    let storedProgress: any[] = [];
    try {
      const raw = localStorage.getItem('cog_cpp_oop_progress');
      if (raw) storedProgress = JSON.parse(raw);
    } catch (e) {
      console.warn('Could not parse cog_cpp_oop_progress', e);
    }

    const progressMap: Record<string, any> = {};
    if (Array.isArray(storedProgress)) {
      storedProgress.forEach((p: any) => {
        progressMap[p.topic_id] = p;
      });
    }

    let completedCount = 0;
    let quizCompletedCount = 0;
    let currentTopicId = CPP_OOP_TOPICS[0].id;
    let firstIncompleteFound = false;

    const topicsOutput = CPP_OOP_TOPICS.map((topic, idx) => {
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
          const prevProg = progressMap[CPP_OOP_TOPICS[idx - 1].id] || {};
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

    const totalTopics = CPP_OOP_TOPICS.length;
    const overallProgress = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
    const remainingMinutes = topicsOutput
      .filter(t => t.status !== 'COMPLETED')
      .reduce((acc, t) => acc + (t.estimatedMinutes || 35), 0);

    const allCompleted = completedCount === totalTopics && totalTopics > 0;

    setDashboardData({
      title: 'Object-Oriented C++',
      subtitle:
        'Master object-oriented programming in C++ by learning how to design reusable, modular, and maintainable software with classes, constructors, encapsulation, inheritance, polymorphism, abstraction, operator overloading, and runtime memory management.',
      total_modules: 1,
      completed_modules: allCompleted ? 1 : 0,
      total_topics: totalTopics,
      completed_topics: completedCount,
      quizzes_completed: quizCompletedCount,
      overall_progress: overallProgress,
      current_topic_id: currentTopicId,
      streak_days: 5,
      estimated_remaining_minutes: remainingMinutes,
      total_duration_hours: 10,
      learning_signals_status: 'Cognitive Engine Calibrated & Active',
      topics: topicsOutput
    });
  };

  const topicsList: any[] = dashboardData?.topics || [];

  // Filter topics
  const filteredTopics = topicsList.filter((t: any) => {
    const matchQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.desc && t.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.shortDescription && t.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()));
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
                <Box className="w-3.5 h-3.5 text-cyan-400" />
                <span>C++ Track • 1 Module • 16 Lessons (10 Hours) • Intermediate</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {dashboardData?.title || 'Object-Oriented C++'}
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {dashboardData?.subtitle ||
                  'Master object-oriented programming in C++ by learning how to design reusable, modular, and maintainable software with classes, constructors, encapsulation, inheritance, polymorphism, abstraction, operator overloading, and runtime memory management.'}
              </p>
            </div>

            {/* Quick Resume CTA Button */}
            {currentTopic && (
              <button
                onClick={() => onSelectTopic(currentTopic.id)}
                className="self-start md:self-auto px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-2.5 shrink-0"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>
                  {dashboardData?.overall_progress > 0
                    ? `Resume Lesson ${currentTopic.numberDisplay}`
                    : 'Start First Lesson'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Key Course Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Progress</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {dashboardData?.overall_progress || 0}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Completed</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {dashboardData?.completed_topics || 0} / {dashboardData?.total_topics || 16}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>Quizzes</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {dashboardData?.quizzes_completed || 0} / {dashboardData?.total_topics || 16}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Module</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {dashboardData?.completed_modules || 0} / 1
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Streak</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {dashboardData?.streak_days || 5} Days
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Remaining</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {Math.round((dashboardData?.estimated_remaining_minutes || 600) / 60)} hrs
              </div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Overall Course Completion</span>
              <span className="font-mono text-cyan-400 font-bold">{dashboardData?.overall_progress || 0}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${dashboardData?.overall_progress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Next Lesson Card */}
      {currentTopic && (
        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-slate-900/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Recommended Next Step
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  Lesson {currentTopic.numberDisplay}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{currentTopic.title}</h3>
              <p className="text-xs text-slate-400 max-w-2xl line-clamp-1">{currentTopic.shortDescription || currentTopic.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => onSelectTopic(currentTopic.id)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <span>Continue Lesson</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search classes, inheritance, polymorphism, operators, banking project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60 text-xs shrink-0">
            <button
              onClick={() => setFilterDifficulty('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterDifficulty === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Levels
            </button>
            <button
              onClick={() => setFilterDifficulty('Intermediate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterDifficulty === 'Intermediate' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Intermediate (15)
            </button>
            <button
              onClick={() => setFilterDifficulty('Advanced Project')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterDifficulty === 'Advanced Project' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Capstone (1)
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60 text-xs shrink-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === 'completed' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilterStatus('unlocked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === 'unlocked' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unlocked
            </button>
          </div>
        </div>
      </div>

      {/* Module Header */}
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            {CPP_OOP_MODULES[0]?.title || 'Module 01: Object-Oriented C++ Architecture & Design'}
          </span>
          <p className="text-xs text-slate-400 mt-0.5">{CPP_OOP_MODULES[0]?.description || 'Master object-oriented programming in C++'}</p>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Showing {filteredTopics.length} of {topicsList.length} Lessons
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTopics.map((topic: any) => {
          const isCompleted = topic.status === 'COMPLETED';
          const isInProgress = topic.status === 'IN_PROGRESS';
          const isLocked = topic.status === 'LOCKED';

          return (
            <div
              key={topic.id}
              className={`group relative rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                isCompleted
                  ? 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5'
                  : isInProgress
                  ? 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-500/70 hover:shadow-xl hover:shadow-cyan-500/10'
                  : isLocked
                  ? 'bg-slate-950/40 border-slate-800/40 opacity-75'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:shadow-lg'
              }`}
            >
              {/* Card Top Section */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-cyan-400">
                      Lesson {topic.numberDisplay}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        topic.difficulty === 'Advanced Project'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {topic.difficulty}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Completed
                    </span>
                  ) : isInProgress ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      <Play className="w-3 h-3 fill-cyan-400" />
                      In Progress
                    </span>
                  ) : isLocked ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-500 border border-slate-700/50">
                      <Lock className="w-3 h-3 text-slate-500" />
                      Locked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800/80 text-slate-400 border border-slate-700/50">
                      Ready
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {topic.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {topic.shortDescription || topic.desc}
                  </p>
                </div>

                {/* Progress bar if in progress or completed */}
                {(isInProgress || isCompleted) && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>Completion</span>
                      <span className="text-cyan-400 font-bold">{Math.round(topic.completion_percentage || (isCompleted ? 100 : 0))}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${topic.completion_percentage || (isCompleted ? 100 : 0)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Meta details */}
                <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{topic.estimatedMinutes} mins</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>5 Quizzes</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Code className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Challenge</span>
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-950/60 border-t border-slate-800/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {onStartQuiz && !isLocked && (
                    <button
                      onClick={() => onStartQuiz(topic.id)}
                      title="Take 5-question Mini Quiz"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-purple-400 transition-colors text-xs"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onOpenCoding && !isLocked && (
                    <button
                      onClick={() => onOpenCoding(topic.id)}
                      title="Practice Coding Challenge"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors text-xs"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onSelectAdaptedLesson && !isLocked && (
                    <button
                      onClick={() => onSelectAdaptedLesson(topic.id)}
                      title="Explore Cognitive Adapted Version"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  disabled={isLocked}
                  onClick={() => onSelectTopic(topic.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                    isLocked
                      ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                      : isCompleted
                      ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30'
                      : isInProgress
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}
                >
                  <span>{isCompleted ? 'Review' : isInProgress ? 'Resume' : 'Study'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800 p-8">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No lessons match your filter</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Try adjusting your search query or reset your difficulty and status filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterDifficulty('all');
              setFilterStatus('all');
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
