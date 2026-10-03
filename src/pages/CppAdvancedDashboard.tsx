import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CPP_ADVANCED_TOPICS, CPP_ADVANCED_MODULES, CppAdvancedTopic } from '../data/cppAdvancedData';
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
  Compass,
  ChevronDown
} from 'lucide-react';

export interface CppAdvancedDashboardProps {
  onSelectTopic: (topicId: string) => void;
  onSelectAdaptedLesson?: (topicId: string) => void;
  onBackToCatalog?: () => void;
  onStartQuiz?: (topicId: string) => void;
  onOpenCoding?: (topicId: string) => void;
}

export const CppAdvancedDashboard: React.FC<CppAdvancedDashboardProps> = ({
  onSelectTopic,
  onSelectAdaptedLesson,
  onBackToCatalog,
  onStartQuiz,
  onOpenCoding
}) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'Advanced' | 'Advanced Project'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress' | 'unlocked'>('all');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('all');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-cpp-adv-01': true,
    'mod-cpp-adv-02': true,
    'mod-cpp-adv-03': true,
    'mod-cpp-adv-04': true,
    'mod-cpp-adv-05': true,
    'mod-cpp-adv-06': true
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.getCppAdvDashboard();
      if (data && data.topics && data.topics.length > 0) {
        setDashboardData(data);
      } else {
        fallbackLocalData();
      }
    } catch (err) {
      console.warn('Failed to load C++ Advanced dashboard from API, using fallback:', err);
      fallbackLocalData();
    } finally {
      setLoading(false);
    }
  };

  const fallbackLocalData = () => {
    let storedProgress: any[] = [];
    try {
      const raw = localStorage.getItem('cog_cpp_adv_progress');
      if (raw) storedProgress = JSON.parse(raw);
    } catch (e) {
      console.warn('Could not parse cog_cpp_adv_progress', e);
    }

    const progressMap: Record<string, any> = {};
    if (Array.isArray(storedProgress)) {
      storedProgress.forEach((p: any) => {
        progressMap[p.topic_id] = p;
      });
    }

    let completedCount = 0;
    let quizCompletedCount = 0;
    let currentTopicId = CPP_ADVANCED_TOPICS[0].id;
    let firstIncompleteFound = false;

    let prevModuleCompleted = true; // Module 01 unlocked by default
    const allProcessedTopics: any[] = [];
    const moduleStats: any[] = [];

    CPP_ADVANCED_MODULES.forEach((mod) => {
      let modCompletedCount = 0;
      const isModUnlocked = prevModuleCompleted;
      const modProcessedTopics: any[] = [];

      mod.topics.forEach((topic, tIdx) => {
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
          if (!firstIncompleteFound && isModUnlocked) {
            currentTopicId = topic.id;
            firstIncompleteFound = true;
          }
        } else {
          if (!isModUnlocked) {
            status = 'LOCKED';
          } else {
            if (tIdx === 0) {
              status = 'NOT_STARTED';
            } else {
              const prevProg = modProcessedTopics[tIdx - 1];
              if (prevProg && (prevProg.status === 'COMPLETED' || prevProg.status === 'IN_PROGRESS')) {
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

        const processed = {
          ...topic,
          desc: topic.shortDescription,
          status,
          completion_percentage: compPct,
          quiz_score: quizScore,
          attempts: prog.attempts || 0,
          time_spent_seconds: prog.time_spent_seconds || 0,
          has_adapted_lesson: false
        };

        modProcessedTopics.push(processed);
        allProcessedTopics.push(processed);
      });

      const modTotal = mod.topics.length;
      const modPct = modTotal > 0 ? Math.round((modCompletedCount / modTotal) * 100) : 0;
      const isModDone = modCompletedCount === modTotal && modTotal > 0;

      moduleStats.push({
        id: mod.id,
        number: mod.number,
        numberDisplay: mod.numberDisplay,
        title: mod.title,
        description: mod.description,
        estimatedMinutes: mod.estimatedMinutes,
        topicsCount: modTotal,
        completedTopics: modCompletedCount,
        completionPercentage: modPct,
        isLocked: !isModUnlocked,
        isCompleted: isModDone,
        topics: modProcessedTopics
      });

      prevModuleCompleted = isModDone;
    });

    const totalTopics = CPP_ADVANCED_TOPICS.length;
    const overallProgress = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
    const remainingMinutes = allProcessedTopics
      .filter(t => t.status !== 'COMPLETED')
      .reduce((acc, t) => acc + (t.estimatedMinutes || 25), 0);

    const completedModulesCount = moduleStats.filter(m => m.isCompleted).length;

    setDashboardData({
      title: 'Advanced C++ & STL Architecture',
      subtitle:
        'Master modern C++ programming through generic programming, Standard Template Library containers, iterators, algorithms, lambda expressions, and smart pointers. Develop efficient, reusable, and memory-safe applications using modern C++ techniques.',
      level: 'Advanced',
      total_modules: CPP_ADVANCED_MODULES.length,
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

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const modulesList: any[] = dashboardData?.modules || [];
  const topicsList: any[] = dashboardData?.topics || [];

  // Filter topics
  const filteredTopics = topicsList.filter((t: any) => {
    const matchQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.desc && t.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.shortDescription && t.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchDiff = filterDifficulty === 'all' || t.difficulty === filterDifficulty;
    const matchMod = selectedModuleId === 'all' || t.moduleId === selectedModuleId;
    let matchStatus = true;
    if (filterStatus === 'completed') matchStatus = t.status === 'COMPLETED';
    if (filterStatus === 'in_progress') matchStatus = t.status === 'IN_PROGRESS';
    if (filterStatus === 'unlocked') matchStatus = t.status !== 'LOCKED';
    return matchQuery && matchDiff && matchMod && matchStatus;
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

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                C++ Architecture
              </span>
              <span className="px-3 py-1 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                Advanced Track
              </span>
              <span className="px-3 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                RAII & Memory Safe
              </span>
              <span className="px-3 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                {dashboardData?.streak_days || 5} Day Streak
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Advanced C++ & STL Architecture
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Master modern C++ programming through generic programming, Standard Template Library containers, iterators, algorithms, lambda expressions, and smart pointers. Develop efficient, reusable, and memory-safe applications using modern C++ techniques.
            </p>

            {/* Quick stats pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Curriculum</div>
                  <div className="text-sm font-bold text-white">6 Modules</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Topics</div>
                  <div className="text-sm font-bold text-white">{dashboardData?.total_topics || 33} Lessons</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Duration</div>
                  <div className="text-sm font-bold text-white">14 Hours</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Mastery Progress</div>
                  <div className="text-sm font-bold text-white">{dashboardData?.overall_progress || 0}% Complete</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action / Continue Box */}
          <div className="lg:w-80 flex flex-col gap-4 bg-slate-800/90 border border-slate-700 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Next Step</span>
              <span className="text-xs font-bold text-cyan-400">
                {dashboardData?.completed_topics || 0} / {dashboardData?.total_topics || 33} Completed
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Course Progress</span>
                <span className="text-cyan-400 font-bold">{dashboardData?.overall_progress || 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
                  style={{ width: `${dashboardData?.overall_progress || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Recommended Next Lesson Card */}
            {currentTopic && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-1.5">
                <div className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Recommended Next Lesson:
                </div>
                <div className="text-sm font-bold text-white line-clamp-1">
                  Lesson {currentTopic.numberDisplay || '01'}: {currentTopic.title}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>{currentTopic.moduleTitle?.split(':')[0] || 'Module 01'}</span>
                  <span>•</span>
                  <span>~{currentTopic.estimatedMinutes || 20} mins</span>
                </div>
              </div>
            )}

            <button
              onClick={() => onSelectTopic(currentTopic?.id || 'top-cpp-adv-generic-programming-intro')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{dashboardData?.overall_progress === 100 ? 'Review Course' : dashboardData?.overall_progress > 0 ? 'Continue Course' : 'Start Lesson 01'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Six Modules Overview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Box className="w-5 h-5 text-cyan-400" />
              <span>Course Modules ({modulesList.length || 6})</span>
            </h2>
            <span className="text-xs text-slate-400">Sequential prerequisite progression</span>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            <span className="text-cyan-400 font-bold">{dashboardData?.completed_modules || 0}</span> of 6 modules unlocked/completed
          </div>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modulesList.map((mod: any) => {
            const isLocked = mod.isLocked;
            const isCompleted = mod.isCompleted;
            const pct = mod.completionPercentage || 0;
            const firstTopicInMod = mod.topics && mod.topics[0] ? mod.topics[0].id : 'top-cpp-adv-generic-programming-intro';

            return (
              <div
                key={mod.id}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                  isLocked
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                    : isCompleted
                    ? 'bg-gradient-to-br from-slate-900/90 to-emerald-950/30 border-emerald-500/30 hover:border-emerald-500/50'
                    : 'bg-gradient-to-br from-slate-900/90 to-cyan-950/30 border-slate-700/80 hover:border-cyan-500/50 shadow-lg'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-800 text-cyan-400 border border-slate-700">
                      MODULE {mod.numberDisplay || '01'}
                    </span>

                    {isLocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                        <Lock className="w-3 h-3 text-slate-400" />
                        Prerequisite Locked
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                        <Play className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                        In Progress
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {mod.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {mod.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      {mod.topicsCount || mod.topics?.length || 6} Topics
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {mod.estimatedHours ? `${mod.estimatedHours} Hours` : `${Math.round((mod.estimatedMinutes || 120) / 60)} Hours`}
                    </span>
                  </div>
                </div>

                {/* Bottom Bar: Progress & Action */}
                <div className="space-y-3 pt-4 border-t border-slate-800/80 mt-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-slate-400">Module Completion</span>
                      <span className="text-cyan-400 font-bold">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={isLocked}
                      onClick={() => onSelectTopic(firstTopicInMod)}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isLocked
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : isCompleted
                          ? 'bg-slate-800 hover:bg-slate-700 text-white'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold shadow-md shadow-cyan-500/20'
                      }`}
                    >
                      {isLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </>
                      ) : isCompleted ? (
                        <>
                          <span>Review Module</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>{pct > 0 ? 'Continue' : 'Start Module'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => toggleModuleExpand(mod.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title={expandedModules[mod.id] ? 'Collapse Topics' : 'Expand Topics'}
                    >
                      {expandedModules[mod.id] ? (
                        <ChevronDown className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates, STL containers, lambdas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Module Filter */}
          <select
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All 6 Modules</option>
            {modulesList.map((m: any) => (
              <option key={m.id} value={m.id}>
                Module {m.numberDisplay}: {m.title.replace(/Module \d+:\s*/, '')}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex items-center p-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${filterStatus === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              All Topics
            </button>
            <button
              onClick={() => setFilterStatus('unlocked')}
              className={`px-2.5 py-1 rounded-md transition-colors ${filterStatus === 'unlocked' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Unlocked
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-2.5 py-1 rounded-md transition-colors ${filterStatus === 'completed' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Topics Detailed Listing grouped by Module */}
      <div className="space-y-6">
        {modulesList.map((mod: any) => {
          const modTopics = filteredTopics.filter((t: any) => t.moduleId === mod.id);
          if (modTopics.length === 0 && selectedModuleId !== 'all') return null;
          const isExpanded = expandedModules[mod.id] ?? true;

          return (
            <div key={mod.id} className="space-y-3">
              {/* Module Header Strip */}
              <div
                onClick={() => toggleModuleExpand(mod.id)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
                    {mod.numberDisplay}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{mod.title}</span>
                      {mod.isLocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                      {mod.isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </h3>
                    <p className="text-xs text-slate-400">{mod.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    {mod.completedTopics || 0}/{mod.topicsCount || mod.topics?.length || 6}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Topics Grid for this Module */}
              {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-2">
                  {modTopics.map((topic: any) => {
                    const isTopicLocked = topic.status === 'LOCKED';
                    const isTopicCompleted = topic.status === 'COMPLETED';
                    const isTopicInProgress = topic.status === 'IN_PROGRESS';

                    return (
                      <div
                        key={topic.id}
                        className={`group relative flex flex-col justify-between p-4 rounded-xl border transition-all ${
                          isTopicLocked
                            ? 'bg-slate-900/30 border-slate-800/60 opacity-60'
                            : isTopicCompleted
                            ? 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-lg'
                            : 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/50 hover:shadow-lg'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold text-slate-400">
                              #{topic.numberDisplay || '01'}
                            </span>

                            {isTopicCompleted ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3" />
                                Completed
                              </span>
                            ) : isTopicInProgress ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                                <Play className="w-3 h-3 fill-cyan-400" />
                                In Progress
                              </span>
                            ) : isTopicLocked ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                                <Lock className="w-3 h-3" />
                                Locked
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                                Unlocked
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                            {topic.title}
                          </h4>

                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {topic.desc || topic.shortDescription}
                          </p>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              ~{topic.estimatedMinutes || 20}m
                            </span>
                            <span>•</span>
                            <span className="text-cyan-400 font-medium">{topic.difficulty || 'Advanced'}</span>
                            {topic.quiz_score !== undefined && topic.quiz_score > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-400 font-mono">Quiz: {topic.quiz_score}%</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Card Footer Button */}
                        <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center gap-2">
                          <button
                            disabled={isTopicLocked}
                            onClick={() => onSelectTopic(topic.id)}
                            className={`w-full py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                              isTopicLocked
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : isTopicCompleted
                                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold'
                            }`}
                          >
                            <span>{isTopicCompleted ? 'Review Lesson' : isTopicInProgress ? 'Resume Lesson' : 'Start Lesson'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
