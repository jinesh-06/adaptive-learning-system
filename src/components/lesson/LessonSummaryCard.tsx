import React from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, Award, RotateCcw } from 'lucide-react';

export interface LessonSummaryProps {
  topicTitle: string;
  learnedItems: string[];
  prevTopic?: { id: string; title: string } | null;
  nextTopic?: { id: string; title: string } | null;
  onSelectTopic: (topicId: string) => void;
  onReviewLesson?: () => void;
}

export const LessonSummaryCard: React.FC<LessonSummaryProps> = ({
  topicTitle,
  learnedItems,
  prevTopic,
  nextTopic,
  onSelectTopic,
  onReviewLesson
}) => {
  return (
    <div
      id="section-summary"
      className="rounded-2xl border border-slate-800 light-theme:border-slate-300 bg-slate-900/60 light-theme:bg-white p-6 sm:p-8 shadow-sm space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 light-theme:bg-emerald-100 light-theme:text-emerald-700 flex items-center justify-center">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400 light-theme:text-emerald-700 block">
            Checkpoint Reached
          </span>
          <h3 className="text-lg font-bold text-white light-theme:text-slate-900">
            What You Learned in this Lesson
          </h3>
        </div>
      </div>

      {/* Learned checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {learnedItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 light-theme:bg-slate-50 border border-slate-800 light-theme:border-slate-200 text-xs text-slate-200 light-theme:text-slate-800 font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* Lesson Navigation Buttons */}
      <div className="pt-4 border-t border-slate-800 light-theme:border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        {prevTopic ? (
          <button
            onClick={() => onSelectTopic(prevTopic.id)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-800 light-theme:border-slate-300 bg-slate-950/60 light-theme:bg-slate-100 hover:border-slate-700 text-xs font-semibold text-slate-300 light-theme:text-slate-700 hover:text-white light-theme:hover:text-slate-900 transition-all flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <div className="text-left">
              <span className="text-[10px] text-slate-500 block">Previous Lesson</span>
              <span className="truncate max-w-[180px]">{prevTopic.title}</span>
            </div>
          </button>
        ) : (
          <div className="hidden sm:block" />
        )}

        {onReviewLesson && (
          <button
            onClick={onReviewLesson}
            className="text-xs text-slate-400 hover:text-white light-theme:hover:text-slate-900 flex items-center gap-1.5 py-1 px-3"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Review from start</span>
          </button>
        )}

        {nextTopic ? (
          <button
            onClick={() => onSelectTopic(nextTopic.id)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 group"
          >
            <div className="text-right">
              <span className="text-[10px] text-slate-900/70 font-semibold block">Next Lesson</span>
              <span className="truncate max-w-[180px]">{nextTopic.title}</span>
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <div className="text-xs font-mono text-cyan-400 font-bold">
            🎉 Course Section Complete!
          </div>
        )}
      </div>
    </div>
  );
};
