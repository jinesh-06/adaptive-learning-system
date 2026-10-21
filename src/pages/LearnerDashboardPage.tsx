import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCognitive } from '../context/CognitiveContext';
import { api } from '../services/api';
import {
  Brain,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  Code2,
  Target,
  Layers,
  RotateCcw,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface LearnerDashboardProps {
  onSelectTopic: (topicId: string) => void;
}

export const LearnerDashboardPage: React.FC<LearnerDashboardProps> = ({ onSelectTopic }) => {
  const { user } = useAuth();
  const { currentLoad } = useCognitive();
  const [snapshot, setSnapshot] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = () => {
    setLoading(true);
    setError(null);
    api.getDashboardSnapshot()
      .then(data => {
        if (data) {
          setSnapshot(data);
        } else {
          setError('Failed to load personalized learning telemetry.');
        }
      })
      .catch(err => {
        console.error('Failed to load snapshot:', err);
        setError('Failed to load personalized learning telemetry.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !snapshot) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm">Synthesizing personalized learning telemetry...</p>
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 max-w-md mx-auto">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Telemetry Unavailable</h2>
          <p className="text-xs text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const s = snapshot?.learning_snapshot || {
    overall_progress: snapshot?.overall_progress ?? 0,
    quiz_accuracy: snapshot?.quiz_accuracy ?? 0,
    coding_accuracy: snapshot?.coding_accuracy ?? null,
    learning_time_minutes: snapshot?.learning_time_minutes ?? 0,
    topics_completed: snapshot?.topics_completed ?? 0
  };

  const langProgress = snapshot?.language_progress || {
    python: 0,
    c: 0,
    cpp: 0,
    java: 0
  };

  const streakDays = snapshot?.streak_days ?? snapshot?.current_streak_days ?? snapshot?.snapshot?.streak_days ?? 0;
  const currentTopicId = snapshot?.current_topic_id || 'top-py-intro';
  const currentTopicTitle = snapshot?.current_topic_title || 'Introduction to Python';
  const currentCourseTitle = snapshot?.current_course || 'Python Fundamentals';
  const topicProgress = snapshot?.topic_progress ?? 0;
  const rec = snapshot?.ai_recommendation || {
    action: 'START',
    topic_id: currentTopicId,
    reason: 'Welcome to your learning journey! Select a course or topic to begin.'
  };

  const achievements = snapshot?.achievements?.all || [];
  const unlockedCodes = new Set((snapshot?.achievements?.unlocked || []).map((u: any) => u.achievement_code));

  const chartData = (snapshot?.cognitive_trend || []).map((t: any, i: number) => ({
    name: `Session ${i + 1}`,
    score: t.state === 'LOW' ? 85 : t.state === 'MEDIUM' ? 60 : 35,
    label: t.label
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. TOP SECTION: COMMAND CENTER HERO (Section 44) */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/20 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 mb-3">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {streakDays} Day Learning Streak
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Welcome back, {snapshot?.user_name || user?.name || 'Learner'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Current Focus: <span className="text-cyan-400 font-semibold">{currentCourseTitle}</span>
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-700/60 bg-slate-950/60 min-w-[280px]">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-400">Topic Progress</span>
              <span className="font-bold text-white font-mono">{topicProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${topicProgress}%` }}
              />
            </div>
            <button
              onClick={() => onSelectTopic(currentTopicId)}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 group"
            >
              Continue {currentTopicTitle}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. YOUR LEARNING SNAPSHOT (Section 44) */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          Your Learning Snapshot
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="text-xs text-slate-400 mb-1">Overall Progress</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{s.overall_progress ?? 0}%</div>
            <div className="text-[10px] text-slate-500 mt-1">Curriculum completion</div>
          </div>
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="text-xs text-slate-400 mb-1">Quiz Accuracy</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">{s.quiz_accuracy ?? 0}%</div>
            <div className="text-[10px] text-slate-500 mt-1">Knowledge checks</div>
          </div>
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="text-xs text-slate-400 mb-1">Coding Accuracy</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
              {s.coding_accuracy !== null && s.coding_accuracy !== undefined && typeof s.coding_accuracy === 'number'
                ? `${s.coding_accuracy}%`
                : 'N/A'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Automated test suites</div>
          </div>
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="text-xs text-slate-400 mb-1">Study Time</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">{s.learning_time_minutes ?? 0}m</div>
            <div className="text-[10px] text-slate-500 mt-1">Active cognitive focus</div>
          </div>
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 col-span-2 sm:col-span-1">
            <div className="text-xs text-slate-400 mb-1">Topics Completed</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">{s.topics_completed ?? 0}</div>
            <div className="text-[10px] text-slate-500 mt-1">Modules mastered</div>
          </div>
        </div>
      </div>

      {/* 3. AI RECOMMENDATION (Section 44) */}
      <div className="p-5 sm:p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900/80 to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              AI Pedagogical Recommendation
            </div>
            <p className="text-sm text-slate-200 leading-relaxed max-w-2xl">
              {rec.reason}
            </p>
          </div>
        </div>
        <button
          onClick={() => onSelectTopic(rec.topic_id || currentTopicId)}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shrink-0 flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Start Recommended Revision
        </button>
      </div>

      {/* 4. TWO-COLUMN: LANGUAGE PROGRESS & SUPPORTIVE COGNITIVE TREND */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LANGUAGE PROGRESS (Section 44) */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            Language Curriculum Progress
          </h3>
          <div className="space-y-4">
            {[
              { lang: 'Python', pct: langProgress.python ?? 0, color: 'bg-amber-400' },
              { lang: 'C', pct: langProgress.c ?? 0, color: 'bg-blue-400' },
              { lang: 'C++', pct: langProgress.cpp ?? 0, color: 'bg-purple-400' },
              { lang: 'Java', pct: langProgress.java ?? 0, color: 'bg-rose-400' }
            ].map(item => (
              <div key={item.lang}>
                <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                  <span className="text-slate-300 font-sans font-semibold">{item.lang}</span>
                  <span className="text-slate-400">{item.pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUPPORTIVE COGNITIVE DIFFICULTY TREND (Section 71) */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                Cognitive State Trajectory
              </h3>
              <span className="text-[10px] text-slate-500">Supportive Indicator</span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Real-time telemetry indicators reflecting your comfort and pace throughout recent sessions.
            </p>

            {chartData.length > 0 ? (
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis domain={[20, 100]} hide />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                      formatter={(val: any, name: any, item: any) => [item.payload.label, 'Comfort Indicator']}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#a855f7"
                      strokeWidth={2.5}
                      dot={{ fill: '#c084fc', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-36 w-full flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-xl px-4 text-center">
                No cognitive sessions recorded yet. Complete lessons to generate trajectory data.
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Comfortable</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Optimal Engagement</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" /> Guided Pacing</span>
          </div>
        </div>
      </div>

      {/* 5. GAMIFICATION & ACHIEVEMENTS (Section 68, 69) */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Mastery Achievements & Milestones
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {achievements.length > 0 ? (
            achievements.map((ach: any) => {
              const isUnlocked = unlockedCodes.has(ach.code);
              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    isUnlocked
                      ? 'border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-slate-900/80 shadow-md shadow-amber-500/10'
                      : 'border-slate-800/60 bg-slate-950/40 opacity-40 grayscale'
                  }`}
                >
                  <div className="text-2xl mb-2">{ach.badge_icon}</div>
                  <div className="text-xs font-bold text-white mb-1 leading-tight">{ach.title}</div>
                  <div className="text-[10px] text-slate-400 leading-snug">{ach.description}</div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-2xl">
              Complete lessons, quizzes, and coding challenges to unlock mastery achievements.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
