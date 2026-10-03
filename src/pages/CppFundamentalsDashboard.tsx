import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CPP_FUNDAMENTALS_TOPICS, CPP_MODULES, CppTopic } from '../data/cppFundamentalsData';
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
  ShieldCheck
} from 'lucide-react';

export interface CppDashboardProps {
  onSelectTopic: (topicId: string) => void;
  onSelectAdaptedLesson?: (topicId: string) => void;
  onBackToCatalog?: () => void;
  onStartQuiz?: (topicId: string) => void;
  onOpenCoding?: (topicId: string) => void;
}

export const CppFundamentalsDashboard: React.FC<CppDashboardProps> = ({
  onSelectTopic,
  onSelectAdaptedLesson,
  onBackToCatalog,
  onStartQuiz,
  onOpenCoding
}) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'Beginner' | 'Intermediate'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress' | 'unlocked'>('all');
  const [activeModuleTab, setActiveModuleTab] = useState<string>('all');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.getCppFundamentals();
      if (data && data.topics) {
        setDashboardData(data);
      } else {
        fallbackLocalData();
      }
    } catch (err) {
      console.warn('Failed to load C++ dashboard from API, using fallback:', err);
      fallbackLocalData();
    } finally {
      setLoading(false);
    }
  };

  const fallbackLocalData = () => {
    // Read persisted progress from localStorage
    let storedProgress: any[] = [];
    try {
      const raw = localStorage.getItem('cog_cpp_progress');
      if (raw) storedProgress = JSON.parse(raw);
    } catch (e) {
      console.warn('Could not parse cog_cpp_progress', e);
    }

    const progressMap: Record<string, any> = {};
    if (Array.isArray(storedProgress)) {
      storedProgress.forEach((p: any) => {
        progressMap[p.topic_id] = p;
      });
    }

    let completedCount = 0;
    let quizCompletedCount = 0;
    let currentTopicId = CPP_FUNDAMENTALS_TOPICS[0].id;
    let firstIncompleteFound = false;

    const topicsOutput = CPP_FUNDAMENTALS_TOPICS.map((topic, idx) => {
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
          const prevProg = progressMap[CPP_FUNDAMENTALS_TOPICS[idx - 1].id] || {};
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

    const totalTopics = CPP_FUNDAMENTALS_TOPICS.length;
    const overallProgress = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
    const remainingMinutes = topicsOutput
      .filter(t => t.status !== 'COMPLETED')
      .reduce((acc, t) => acc + t.estimatedMinutes, 0);

    // Calculate completed modules out of 3
    const mod1Completed = topicsOutput.slice(0, 8).every(t => t.status === 'COMPLETED');
    const mod2Completed = topicsOutput.slice(8, 16).every(t => t.status === 'COMPLETED');
    const mod3Completed = topicsOutput.slice(16, 24).every(t => t.status === 'COMPLETED');
    const completedModulesCount = (mod1Completed ? 1 : 0) + (mod2Completed ? 1 : 0) + (mod3Completed ? 1 : 0);

    setDashboardData({
      title: 'C++ Modern Fundamentals',
      subtitle: 'Learn modern C++ programming from the ground up through structured lessons, interactive examples, hands-on coding exercises, quizzes, and adaptive explanations.',
      total_modules: 3,
      completed_modules: completedModulesCount,
      total_topics: totalTopics,
      completed_topics: completedCount,
      quizzes_completed: quizCompletedCount,
      overall_progress: overallProgress,
      current_topic_id: currentTopicId,
      streak_days: 5,
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
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>C++ Track • 3 Modules • 24 Lessons (8 Hours)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {dashboardData?.title || 'C++ Modern Fundamentals'}
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {dashboardData?.subtitle ||
                  'Master modern C++ from ground up: syntax, streams, variables, operators, control flow, functions, references, pointers, and memory fundamentals.'}
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

          {/* 6 Key Course Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Completion</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                {dashboardData?.overall_progress || 0}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Modules</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                {dashboardData?.completed_modules || 0}/{dashboardData?.total_modules || 3}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Lessons</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                {dashboardData?.completed_topics || 0}/{dashboardData?.total_topics || 24}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Quizzes</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                {dashboardData?.quizzes_completed || 0}/{dashboardData?.total_topics || 24}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Streak</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                {dashboardData?.streak_days || 5} Days
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Remaining</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                {Math.round((dashboardData?.estimated_remaining_minutes || 480) / 60)}h
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Next Lesson Banner */}
      {currentTopic && (
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-400 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Recommended Next Step • Module {currentTopic.moduleId?.includes('intro') ? '01' : currentTopic.moduleId?.includes('control') ? '02' : '03'}
              </div>
              <h3 className="text-base font-bold text-white">
                Lesson {currentTopic.numberDisplay}: {currentTopic.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                {currentTopic.shortDescription || currentTopic.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onStartQuiz && (
              <button
                onClick={() => onStartQuiz(currentTopic.id)}
                className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Quiz</span>
              </button>
            )}
            {onOpenCoding && (
              <button
                onClick={() => onOpenCoding(currentTopic.id)}
                className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Code Studio</span>
              </button>
            )}
            <button
              onClick={() => onSelectTopic(currentTopic.id)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>Open Lesson</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Module Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveModuleTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeModuleTab === 'all'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Modules (24 Lessons)
        </button>

        {CPP_MODULES.map(m => (
          <button
            key={m.id}
            onClick={() => setActiveModuleTab(m.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeModuleTab === m.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>Module {m.numberDisplay}: {m.number === 1 ? 'Foundations' : m.number === 2 ? 'Control Flow' : 'Functions & Memory'}</span>
            <span className="text-[10px] opacity-75 font-mono">({m.topics.length})</span>
          </button>
        ))}
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search C++ lessons, algorithms, operators, pointers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          {/* Difficulty Dropdown */}
          <select
            value={filterDifficulty}
            onChange={e => setFilterDifficulty(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="unlocked">Unlocked</option>
          </select>
        </div>
      </div>

      {/* Lesson Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic: any) => {
          const isCompleted = topic.status === 'COMPLETED';
          const isLocked = topic.status === 'LOCKED';
          const isInProgress = topic.status === 'IN_PROGRESS';

          return (
            <div
              key={topic.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between p-5 relative overflow-hidden group ${
                isCompleted
                  ? 'bg-slate-900/70 border-emerald-500/30 hover:border-emerald-500/50'
                  : isInProgress
                  ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-500/5'
                  : isLocked
                  ? 'bg-slate-950/50 border-slate-900 opacity-60'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 font-mono text-[11px] font-bold text-cyan-400">
                      {topic.numberDisplay}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {topic.difficulty}
                    </span>
                  </div>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Completed</span>
                    </span>
                  ) : isLocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </span>
                  ) : isInProgress ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30 animate-pulse">
                      <span>In Progress</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400">
                      {topic.estimatedMinutes}m
                    </span>
                  )}
                </div>

                {/* Lesson Title */}
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1 mb-1.5">
                  {topic.title}
                </h3>

                {/* Short Description */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {topic.shortDescription || topic.desc}
                </p>

                {/* Progress bar if in progress or completed */}
                {(isCompleted || isInProgress) && (
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>Mastery</span>
                      <span>{isCompleted ? '100%' : `${topic.completion_percentage || 50}%`}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                        style={{ width: `${isCompleted ? 100 : topic.completion_percentage || 50}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Card Controls */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {!isLocked && onStartQuiz && (
                    <button
                      onClick={() => onStartQuiz(topic.id)}
                      className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                      title="Take Lesson Quiz"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!isLocked && onOpenCoding && (
                    <button
                      onClick={() => onOpenCoding(topic.id)}
                      className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Open Code Studio"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!isLocked && onSelectAdaptedLesson && (
                    <button
                      onClick={() => onSelectAdaptedLesson(topic.id)}
                      className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-purple-400 transition-colors"
                      title="Adapted Explanation"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => !isLocked && onSelectTopic(topic.id)}
                  disabled={isLocked}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isLocked
                      ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                      : isCompleted
                      ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-white'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm shadow-cyan-500/20'
                  }`}
                >
                  <span>{isCompleted ? 'Review' : isLocked ? 'Locked' : 'Start'}</span>
                  {!isLocked && <ArrowRight className="w-3 h-3" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">No lessons matched your search criteria</h4>
          <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
        </div>
      )}
    </div>
  );
};
