import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Code2,
  RotateCcw,
  BookOpen,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  Check,
  X,
  Layers,
  Brain,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

interface StudentMasterySectionProps {
  onSelectTopic?: (topicId: string) => void;
}

export const StudentMasterySection: React.FC<StudentMasterySectionProps> = ({ onSelectTopic }) => {
  const { user } = useAuth();
  const [overallData, setOverallData] = useState<any | null>(null);
  const [statsData, setStatsData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchMasteryData = async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [meRes, statsRes] = await Promise.all([
        api.getMyMastery(),
        api.getMasteryStatistics()
      ]);

      if (meRes && meRes.success) {
        setOverallData(meRes.data);
      } else if (meRes && meRes.data) {
        setOverallData(meRes.data);
      } else {
        setOverallData(null);
      }

      if (statsRes && statsRes.success) {
        setStatsData(statsRes.data);
      } else if (statsRes && statsRes.data) {
        setStatsData(statsRes.data);
      } else {
        setStatsData(null);
      }

      if (!meRes && !statsRes) {
        // If both failed completely
        setError('Mastery service is temporarily unavailable.');
      }
    } catch (err: any) {
      console.error('Failed to load student mastery data:', err);
      setError('Could not connect to the student mastery engine.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMasteryData();

    // Listen for real-time mastery updates from quizzes / coding challenges
    const handleMasteryUpdated = (event: any) => {
      console.log('Real-time mastery update detected:', event.detail);
      fetchMasteryData(true);
    };

    window.addEventListener('mastery_updated', handleMasteryUpdated);
    return () => {
      window.removeEventListener('mastery_updated', handleMasteryUpdated);
    };
  }, []);

  // Filter topics
  const topicsList = useMemo(() => {
    const list: any[] = overallData?.topic_masteries || [];
    return list.filter(t => {
      const matchesSubject =
        selectedSubject === 'all' ||
        t.subject_id?.toLowerCase().includes(selectedSubject.toLowerCase()) ||
        t.topic_id?.toLowerCase().includes(selectedSubject.toLowerCase());

      const matchesSearch =
        !searchQuery ||
        t.topic_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject_id?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSubject && matchesSearch;
    });
  }, [overallData, selectedSubject, searchQuery]);

  // Chart data for comparing Quiz Accuracy vs Coding Score
  const comparisonChartData = useMemo(() => {
    const list: any[] = overallData?.topic_masteries || [];
    return list
      .filter(t => t.quiz_performance?.accuracy !== null || t.coding_performance?.score !== null)
      .slice(0, 8)
      .map(t => {
        const shortName = (t.topic_id || '')
          .replace(/^top-/, '')
          .replace(/^py-|^c-|^cpp-|^java-/, '')
          .replace(/-/g, ' ');
        return {
          name: shortName.length > 12 ? `${shortName.slice(0, 10)}...` : shortName,
          fullName: t.topic_id,
          'Quiz Accuracy': t.quiz_performance?.accuracy ?? 0,
          'Coding Score': t.coding_performance?.score ?? 0,
          'Mastery Score': t.mastery_score ?? t.current_mastery ?? 0
        };
      });
  }, [overallData]);

  // Categorical Badge Helper
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'MASTERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Mastered
          </span>
        );
      case 'PROFICIENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-500/40">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Proficient
          </span>
        );
      case 'PROGRESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-400 border border-amber-500/40">
            <Clock className="w-3 h-3 text-amber-400" /> Progressing
          </span>
        );
      case 'NOVICE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-950/80 text-rose-400 border border-rose-500/40">
            <AlertCircle className="w-3 h-3 text-rose-400" /> Novice
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            Not Assessed
          </span>
        );
    }
  };

  // Helper for improvement indicator
  const renderImprovement = (delta: number | null | undefined) => {
    if (delta === null || delta === undefined) {
      return (
        <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-mono font-medium">
          <Minus className="w-3.5 h-3.5 text-slate-500" /> Baseline
        </span>
      );
    }
    if (delta > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-mono font-bold">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> +{delta.toFixed(1)}%
        </span>
      );
    }
    if (delta < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-rose-400 text-xs font-mono font-bold">
          <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> {delta.toFixed(1)}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-mono font-medium">
        <Minus className="w-3.5 h-3.5 text-slate-500" /> 0.0% (Steady)
      </span>
    );
  };

  // Loading state
  if (loading && !overallData && !statsData) {
    return (
      <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 text-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading student-specific mastery analytics...</p>
      </div>
    );
  }

  // Error state
  if (error && !overallData) {
    return (
      <div className="p-6 rounded-3xl border border-rose-500/30 bg-rose-950/20 text-center max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-white mb-1">Mastery Telemetry Unavailable</h3>
        <p className="text-xs text-slate-400 mb-4">{error}</p>
        <button
          onClick={() => fetchMasteryData(false)}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all inline-flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Retry Sync
        </button>
      </div>
    );
  }

  const overallMastery = overallData?.overall_mastery ?? statsData?.overall_mastery ?? null;
  const overallDisplay = overallMastery !== null ? `${overallMastery.toFixed(1)}%` : 'Not assessed';
  const masteryStatus = overallData?.mastery_status ?? statsData?.mastery_status ?? 'NOT_ASSESSED';
  const totalAssessed = overallData?.total_assessed_topics ?? statsData?.total_assessed_topics ?? 0;
  const totalAttempts = overallData?.total_attempts ?? statsData?.total_attempts ?? 0;
  const totalCorrect = overallData?.total_correct_attempts ?? statsData?.total_correct_attempts ?? 0;
  const avgAccuracy = overallData?.average_accuracy ?? statsData?.average_accuracy ?? null;
  const netImprovement = overallData?.net_improvement ?? statsData?.net_improvement ?? null;
  const trend = overallData?.improvement_trend ?? statsData?.improvement_trend ?? 'STEADY';
  const subjectsList = overallData?.subjects || statsData?.subjects || [];
  const recentActivity = statsData?.recent_activity || [];

  return (
    <div className="space-y-6">
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 mb-2">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            Verified Competency Architecture
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Student-Specific Mastery Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time competency estimates grounded in verified quiz accuracy, code test evaluations, and performance improvements for{' '}
            <span className="text-cyan-300 font-semibold">{user?.name || user?.email || 'Student'}</span>.
          </p>
        </div>

        <button
          onClick={() => fetchMasteryData(true)}
          disabled={refreshing}
          className="self-start sm:self-auto px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-all inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
          title="Refresh mastery data"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Updating...' : 'Sync Mastery'}
        </button>
      </div>

      {/* 2. OVERALL MASTERY KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Overall Mastery Score */}
        <div className="p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 to-cyan-950/30 col-span-2 sm:col-span-1 shadow-lg shadow-cyan-950/20">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Overall Mastery</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight mb-2">
            {overallDisplay}
          </div>
          <div className="mb-3">{getStatusBadge(masteryStatus)}</div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${overallMastery ?? 0}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-mono">
            {totalAssessed} topic{totalAssessed === 1 ? '' : 's'} evaluated
          </div>
        </div>

        {/* Card 2: Improvement / Decline Delta */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Score Trajectory</span>
            {trend === 'IMPROVING' ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : trend === 'DECLINING' ? (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            ) : (
              <Minus className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tracking-tight mb-2">
            {renderImprovement(netImprovement)}
          </div>
          <div className="text-[11px] font-semibold text-slate-300 mb-2">
            {trend === 'IMPROVING'
              ? 'Positive Growth'
              : trend === 'DECLINING'
              ? 'Attention Needed'
              : 'Steady Baseline'}
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            Calculated across recent quiz & code evaluation changes
          </p>
        </div>

        {/* Card 3: Quiz Accuracy */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Quiz Accuracy</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight mb-2">
            {avgAccuracy !== null ? `${avgAccuracy}%` : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-300 font-medium mb-1">
            Weighted 60% of mastery
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            Ground-truth knowledge checks across all topics
          </p>
        </div>

        {/* Card 4: Coding Performance */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Coding Accuracy</span>
            <Code2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono tracking-tight mb-2">
            {statsData?.average_accuracy !== null && statsData?.average_accuracy !== undefined
              ? `${statsData.average_accuracy}%`
              : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-300 font-medium mb-1">
            Weighted 40% of mastery
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            Automated unit test execution passes
          </p>
        </div>

        {/* Card 5: Total Attempts & Correct Answers */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 col-span-2 sm:col-span-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Attempts</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400 font-mono tracking-tight mb-2">
            {totalAttempts}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-mono mb-1">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{totalCorrect} correct answers/tests</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            Combined interactive assessments logged
          </p>
        </div>
      </div>

      {/* 3. TWO-COLUMN: SUBJECT-WISE PROGRESS BARS & QUIZ/CODING COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SUBJECT-WISE MASTERY PROGRESS */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Subject-Wise Mastery Breakdown
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {subjectsList.length} Subject{subjectsList.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Curriculum progression aggregated across subjects. Each subject score is computed from verified student assessments.
            </p>

            {subjectsList.length > 0 ? (
              <div className="space-y-4">
                {subjectsList.map((sub: any) => {
                  const sScore = sub.mastery_score ?? sub.current_mastery;
                  const sDisplay = sScore !== null ? `${sScore.toFixed(1)}%` : 'Not assessed';
                  const sStatus = sub.mastery_status || 'NOT_ASSESSED';
                  const subjectName = (sub.subject_id || '')
                    .replace(/^py-/, 'Python ')
                    .replace(/^c-/, 'C ')
                    .replace(/^cpp-/, 'C++ ')
                    .replace(/^java-/, 'Java ')
                    .toUpperCase();

                  return (
                    <div
                      key={sub.subject_id}
                      className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-slate-700 transition-all"
                    >
                      <div className="flex justify-between items-center text-xs mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{subjectName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            ({sub.topics_assessed || 0} topics)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(sStatus)}
                          <span className="font-bold text-white font-mono text-xs">{sDisplay}</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                          style={{ width: `${sScore ?? 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                No subject-level mastery recorded yet. Start learning to populate metrics.
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Formula: Quiz Accuracy (60%) + Coding Score (40%)</span>
            <span className="text-cyan-400 font-mono">Idempotent</span>
          </div>
        </div>

        {/* COMPARISON CHART: QUIZ VS CODING PERFORMANCE */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                Assessment Modality Comparison
              </h3>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Multimodal Verification
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Comparison between conceptual quiz accuracy and practical coding execution scores across recently assessed topics.
            </p>

            {comparisonChartData.length > 0 ? (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                        color: '#f8fafc'
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={30}
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                    <Bar dataKey="Quiz Accuracy" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Coding Score" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Mastery Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 w-full flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl px-6 text-center">
                Complete both a quiz and a coding exercise on any topic to generate comparison analytics.
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Quiz (60%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" /> Coding (40%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Final Mastery
            </span>
          </div>
        </div>
      </div>

      {/* 4. TOPIC-WISE MASTERY CARDS & EXPLORER */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              Topic-Wise Mastery Status
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual topic assessments, previous vs current scores, and improvement indicators.
            </p>
          </div>

          {/* Search & Subject Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors w-40 sm:w-48"
              />
            </div>

            <div className="flex items-center rounded-xl border border-slate-700 bg-slate-950/60 p-0.5 text-xs">
              {['all', 'py', 'c', 'cpp', 'java'].map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all uppercase text-[11px] ${
                    selectedSubject === sub
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sub === 'py' ? 'Python' : sub === 'all' ? 'All' : sub}
                </button>
              ))}
            </div>
          </div>
        </div>

        {topicsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicsList.map(topic => {
              const currentScore = topic.mastery_score ?? topic.current_mastery;
              const prevScore = topic.previous_mastery;
              const displayScore = currentScore !== null ? `${currentScore.toFixed(1)}%` : 'Not assessed';
              const topicTitle = (topic.topic_id || '')
                .replace(/^top-/, '')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (c: string) => c.toUpperCase());

              const isProvisional = topic.provisional === true;

              return (
                <div
                  key={topic.id || topic.topic_id}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-950/50 hover:border-slate-700/90 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {topic.subject_id}
                      </span>
                      {getStatusBadge(topic.mastery_status)}
                    </div>

                    <h4 className="text-sm font-bold text-white mb-2 leading-tight">
                      {topicTitle}
                    </h4>

                    {/* Scores & Improvement */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-3 font-mono text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 font-sans">Current Mastery</div>
                        <div className="text-base font-extrabold text-white flex items-center gap-1">
                          {displayScore}
                          {isProvisional && (
                            <span className="text-[9px] text-amber-400 font-sans font-normal" title="Provisional: only 1 modality assessed">
                              *
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-sans">Change Delta</div>
                        <div>{renderImprovement(topic.improvement)}</div>
                      </div>
                    </div>

                    {/* Quiz & Coding Sub-metrics */}
                    <div className="space-y-1.5 text-xs text-slate-300 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3 text-emerald-400" /> Quiz Accuracy
                        </span>
                        <span className="font-mono font-semibold">
                          {topic.quiz_performance?.accuracy !== null && topic.quiz_performance?.accuracy !== undefined
                            ? `${topic.quiz_performance.accuracy}%`
                            : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Code2 className="w-3 h-3 text-cyan-400" /> Coding Score
                        </span>
                        <span className="font-mono font-semibold">
                          {topic.coding_performance?.score !== null && topic.coding_performance?.score !== undefined
                            ? `${topic.coding_performance.score}%`
                            : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                        <span>Total Attempts: {topic.total_attempts || 0}</span>
                        <span>Correct: {topic.correct_attempts || 0}</span>
                      </div>
                    </div>
                  </div>

                  {onSelectTopic && (
                    <button
                      onClick={() => onSelectTopic(topic.topic_id)}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-400 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 group"
                    >
                      Practice Topic
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl px-4">
            No topic mastery records found matching your filter criteria. Take a quiz or solve a coding problem to populate records.
          </div>
        )}
      </div>

      {/* 5. RECENT LEARNING ACTIVITY TIMELINE */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Recent Mastery-Changing Activity
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {recentActivity.length} event{recentActivity.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        {recentActivity.length > 0 ? (
          <div className="divide-y divide-slate-800/80 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
            {recentActivity.map((act: any, idx: number) => {
              const isQuiz = act.assessment_type === 'quiz';
              const dateStr = act.timestamp ? new Date(act.timestamp).toLocaleString() : 'Recent';

              return (
                <div key={act.assessment_id || idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isQuiz
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                          : 'bg-cyan-950/60 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      {isQuiz ? <BookOpen className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {isQuiz ? 'Quiz Attempt' : 'Coding Submission'}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {act.topic_id}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Score achieved: <span className="font-mono text-cyan-300 font-bold">{act.score}%</span>
                        {act.previous_mastery !== null && act.previous_mastery !== undefined && (
                          <span className="ml-2 text-slate-500">
                            (Previous: {act.previous_mastery}% → New: {act.new_mastery}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 font-mono text-xs">
                    {renderImprovement(act.change_delta)}
                    <span className="text-[10px] text-slate-500">{dateStr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            No assessment activity recorded yet. Complete quizzes or submit code to view history.
          </div>
        )}
      </div>
    </div>
  );
};

