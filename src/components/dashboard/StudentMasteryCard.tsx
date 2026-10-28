import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  AlertTriangle,
  Layers,
  BookOpen,
  Target
} from 'lucide-react';
import { api } from '../../services/api';

interface SubjectSummary {
  subject_id: string;
  current_mastery: number | null;
  mastery_display: string;
  mastery_status: string;
  topics_assessed: number;
  total_attempts: number;
}

interface TopicMasteryItem {
  topic_id: string;
  subject_id: string;
  current_mastery: number | null;
  mastery_display: string;
  mastery_status: string;
  total_attempts: number;
  completed_assessments: number;
  quiz_accuracy: number | null;
  coding_score: number | null;
  provisional: boolean;
}

interface MasteryData {
  user_id: string;
  overall_mastery: number | null;
  mastery_display: string;
  mastery_status: string;
  total_assessed_topics: number;
  total_completed_assessments: number;
  breakdown: {
    mastered: number;
    proficient: number;
    progressing: number;
    novice: number;
  };
  subjects: SubjectSummary[];
  topic_masteries: TopicMasteryItem[];
}

const getStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'MASTERED':
      return {
        label: 'Mastered',
        classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      };
    case 'PROFICIENT':
      return {
        label: 'Proficient',
        classes: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
      };
    case 'PROGRESSING':
      return {
        label: 'Progressing',
        classes: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      };
    case 'NOVICE':
      return {
        label: 'Novice',
        classes: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
      };
    default:
      return {
        label: 'Not Assessed',
        classes: 'text-slate-400 bg-slate-800/40 border-slate-700/30'
      };
  }
};

const formatSubjectName = (subjectId: string): string => {
  switch (subjectId.toLowerCase()) {
    case 'py':
    case 'python':
      return 'Python 3';
    case 'c':
      return 'C Programming';
    case 'cpp':
    case 'c++':
      return 'C++ Modern';
    case 'java':
      return 'Java SE';
    default:
      return subjectId.toUpperCase();
  }
};

export const StudentMasteryCard: React.FC = () => {
  const [masteryData, setMasteryData] = useState<MasteryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMastery = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMyMastery();
      if (res && res.success && res.data) {
        setMasteryData(res.data);
      } else if (res && res.data) {
        setMasteryData(res.data);
      } else {
        setError('Unable to load mastery records.');
      }
    } catch (err: any) {
      console.error('Failed to load mastery data:', err);
      setError('Failed to fetch mastery profile from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMastery();
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-slate-800 rounded w-48" />
          <div className="h-6 bg-slate-800 rounded-full w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="h-20 bg-slate-800/50 rounded-xl" />
          <div className="h-20 bg-slate-800/50 rounded-xl" />
          <div className="h-20 bg-slate-800/50 rounded-xl" />
        </div>
        <div className="h-24 bg-slate-800/30 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-center">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-white mb-1">Mastery Telemetry Unavailable</h3>
        <p className="text-xs text-slate-400 mb-3">{error}</p>
        <button
          onClick={fetchMastery}
          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const overall = masteryData?.overall_mastery;
  const statusBadge = getStatusBadge(masteryData?.mastery_status || 'NOT_ASSESSED');
  const subjects = masteryData?.subjects || [];
  const breakdown = masteryData?.breakdown || { mastered: 0, proficient: 0, progressing: 0, novice: 0 };
  const totalAssessed = masteryData?.total_assessed_topics || 0;

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            Verified Skill Mastery Overview
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Objective, authenticated evaluation calculated from post-assessments, quizzes, and coding challenges.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge.classes}`}>
            {statusBadge.label}
          </span>
          <button
            onClick={fetchMastery}
            title="Refresh mastery data"
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {totalAssessed === 0 ? (
        <div className="py-8 px-4 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-300 mb-1">No Evaluated Topics Yet</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Complete post-assessments or interactive coding exercises to calculate your verified subject and topic mastery.
          </p>
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Overall Mastery
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  {overall !== null && overall !== undefined ? `${overall.toFixed(1)}%` : 'N/A'}
                </span>
                <span className="text-xs text-slate-500">
                  {masteryData?.mastery_display}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, overall ?? 0))}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Topics Evaluated
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{totalAssessed}</span>
                <span className="text-xs text-slate-500">topics</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {masteryData?.total_completed_assessments || 0} completed submissions
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Competency Distribution
              </span>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  {breakdown.mastered} Mastered
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  {breakdown.proficient} Proficient
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  {breakdown.progressing} Progressing
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  {breakdown.novice} Novice
                </span>
              </div>
            </div>
          </div>

          {/* Subject-Wise Mastery Breakdown */}
          {subjects.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Track Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subjects.map(sub => {
                  const subBadge = getStatusBadge(sub.mastery_status);
                  const subScore = sub.current_mastery ?? 0;
                  return (
                    <div
                      key={sub.subject_id}
                      className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/30 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">
                          {formatSubjectName(sub.subject_id)}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${subBadge.classes}`}>
                          {sub.mastery_display}
                        </span>
                      </div>
                      {sub.current_mastery !== null ? (
                        <div className="w-full h-1.5 rounded-full bg-slate-800 mb-2 overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, sub.current_mastery))}%` }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-1.5 rounded-full bg-slate-800/50 mb-2" />
                      )}
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{sub.topics_assessed} topic{sub.topics_assessed === 1 ? '' : 's'} evaluated</span>
                        <span>{sub.total_attempts} attempt{sub.total_attempts === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
