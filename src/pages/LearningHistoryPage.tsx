import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  History,
  TrendingUp,
  Clock,
  Award,
  Brain,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';

interface LearningHistoryPageProps {
  onSelectTopic: (topicId: string) => void;
}

export const LearningHistoryPage: React.FC<LearningHistoryPageProps> = ({ onSelectTopic }) => {
  const [historyData, setHistoryData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getLearningHistory();
      if (data) {
        setHistoryData(data);
      }
    } catch (err) {
      console.error('Failed to load learning history:', err);
    } finally {
      setLoading(false);
    }
  };

  const records = historyData?.history || [];
  const filteredRecords = records.filter((r: any) =>
    languageFilter === 'all' || (r.language && r.language.toLowerCase() === languageFilter.toLowerCase())
  );

  const insights = historyData?.insights || {
    avg_quiz_score: 82,
    avg_coding_score: 88,
    total_time_minutes: 45,
    improvement_delta: 25,
    adaptive_efficiency_rate: '92%'
  };

  const getLoadBadge = (state: string) => {
    switch (state) {
      case 'LOW':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <History className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white">Comprehensive Learning History</h1>
          </div>
          <p className="text-xs text-slate-400">
            Audit trail of your study sessions, assessments, cognitive states, and improvement trajectories.
          </p>
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'python', label: 'Python' },
            { id: 'c', label: 'C' },
            { id: 'cpp', label: 'C++' },
            { id: 'java', label: 'Java' }
          ].map(l => (
            <button
              key={l.id}
              onClick={() => setLanguageFilter(l.id)}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                languageFilter === l.id ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Avg Quiz Score</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {insights.avg_quiz_score}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Knowledge assessments</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Avg Coding Score</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
            {insights.avg_coding_score}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Sandbox test cases</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Total Time</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">
            {insights.total_time_minutes}m
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Active cognitive focus</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span>Adaptive Rate</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
            {insights.adaptive_efficiency_rate}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Closed-loop efficiency</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Improvement</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            +{insights.improvement_delta}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Repeat score delta</div>
        </div>
      </div>

      {/* History Table */}
      <div className="border border-slate-800 rounded-3xl bg-slate-900/70 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Detailed Learning Trajectory</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {filteredRecords.length} Sessions Logged
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Aggregating historical learning telemetry...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No history records found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Topic / Session</th>
                  <th className="py-3 px-4 text-center">Quiz Score</th>
                  <th className="py-3 px-4 text-center">Coding Score</th>
                  <th className="py-3 px-4 text-center">Time</th>
                  <th className="py-3 px-4 text-center">Adaptive State</th>
                  <th className="py-3 px-4">Improvement Summary</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((r: any) => (
                  <tr
                    key={r.id}
                    onClick={() => r.topic_id && onSelectTopic(r.topic_id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(r.date).toLocaleDateString()} {new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase bg-slate-800 text-slate-300">
                        {r.language}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {r.topic_title}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      {typeof r.quiz_score === 'number' ? (
                        <span className={r.quiz_score >= 80 ? 'text-emerald-400' : r.quiz_score >= 60 ? 'text-cyan-400' : 'text-rose-400'}>
                          {r.quiz_score}%
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      {typeof r.coding_score === 'number' ? (
                        <span className={r.coding_score >= 80 ? 'text-emerald-400' : 'text-amber-400'}>
                          {r.coding_score}%
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                      {r.time_spent_seconds}s
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getLoadBadge(r.cognitive_state)}`}>
                        {r.cognitive_state} ({Math.round((r.confidence || 0.85) * 100)}%)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                      {r.improvement_summary || 'Standard learning progression'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center text-cyan-400 group-hover:translate-x-0.5 transition-transform text-xs font-semibold">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
