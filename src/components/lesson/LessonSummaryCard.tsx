import React from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, Award, RotateCcw } from 'lucide-react';

export interface LessonSummaryProps {
  topicTitle: string;
  learnedItems: string[];
  prevTopic?: { id: string; title: string } | null;
  nextTopic?: { id: string; title: string } | null;
  onSelectTopic: (topicId: string) => void;
  onReviewLesson?: () => void;
  onMarkCompleted?: () => void;
  isCompleted?: boolean;
}

export const LessonSummaryCard: React.FC<LessonSummaryProps> = ({
  topicTitle,
  learnedItems,
  prevTopic,
  nextTopic,
  onSelectTopic,
  onReviewLesson,
  onMarkCompleted,
  isCompleted = false
}) => {
  return (
    <div
      id="section-summary"
      className="rounded-2xl border border-slate-800 light-theme:border-slate-300 bg-slate-900/60 light-theme:bg-white p-5 sm:p-8 shadow-sm space-y-6 overflow-hidden max-w-full"
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

      {/* Checkpoint Action Controls: Mark Completed & Review */}
      <div className="pt-4 border-t border-slate-800/80 light-theme:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full max-w-full">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {onMarkCompleted && (
            <button
              onClick={onMarkCompleted}
              disabled={isCompleted}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isCompleted
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400 light-theme:bg-emerald-50 light-theme:text-emerald-700 light-theme:border-emerald-300 cursor-default'
                  : 'border-emerald-500 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-[0.98]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{isCompleted ? 'Lesson Completed ✓' : 'Mark as Completed'}</span>
            </button>
          )}

          {isCompleted && (
            <span className="text-xs text-emerald-400 light-theme:text-emerald-600 font-mono font-medium hidden sm:inline-flex items-center gap-1.5">
              <span>Checkpoint recorded!</span>
            </span>
          )}
        </div>

        {onReviewLesson && (
          <button
            onClick={onReviewLesson}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-800 light-theme:border-slate-200 bg-slate-950/40 light-theme:bg-slate-100 hover:bg-slate-800 light-theme:hover:bg-slate-200 text-slate-400 light-theme:text-slate-600 hover:text-white light-theme:hover:text-slate-900 text-xs font-medium transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Review from start</span>
          </button>
        )}
      </div>

      {/* Lesson Navigation Buttons */}
      <div className="pt-4 border-t border-slate-800/80 light-theme:border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full max-w-full">
        {prevTopic ? (
          <button
            onClick={() => onSelectTopic(prevTopic.id)}
            title={`Previous Lesson: ${prevTopic.title}`}
            className="w-full sm:w-auto sm:flex-1 sm:max-w-[48%] min-w-0 max-w-full px-4 py-3 rounded-2xl border border-slate-800 light-theme:border-slate-300 bg-slate-950/60 light-theme:bg-slate-50 hover:border-slate-700 light-theme:hover:border-slate-400 text-xs font-semibold text-slate-300 light-theme:text-slate-700 hover:text-white light-theme:hover:text-slate-950 transition-all flex items-center gap-3 group overflow-hidden"
          >
            <ArrowLeft className="w-4 h-4 shrink-0 text-slate-400 light-theme:text-slate-500 group-hover:text-white light-theme:group-hover:text-slate-950 group-hover:-translate-x-1 transition-transform" />
            <div className="text-left min-w-0 flex-1 overflow-hidden">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 light-theme:text-slate-400 block leading-tight">
                Previous Lesson
              </span>
              <span className="block truncate text-xs sm:text-sm font-medium text-slate-200 light-theme:text-slate-800 group-hover:text-cyan-400 light-theme:group-hover:text-blue-600 transition-colors">
                {prevTopic.title}
              </span>
            </div>
          </button>
        ) : (
          <div className="hidden sm:block flex-1 sm:max-w-[48%]" />
        )}

        {nextTopic ? (
          <button
            onClick={() => onSelectTopic(nextTopic.id)}
            title={`Next Lesson: ${nextTopic.title}`}
            className="w-full sm:w-auto sm:flex-1 sm:max-w-[48%] min-w-0 max-w-full sm:ml-auto px-4 sm:px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 group flex flex-col justify-center overflow-hidden"
          >
            <div className="w-full flex items-center justify-end text-[10px] uppercase font-mono font-bold tracking-wider text-slate-900/70 leading-tight mb-0.5">
              <span>Next Lesson</span>
            </div>
            <div className="w-full flex items-center justify-between gap-2 min-w-0">
              <span className="truncate text-xs sm:text-sm font-bold text-slate-950 min-w-0 flex-1 text-left">
                {nextTopic.title}
              </span>
              <ArrowRight className="w-4 h-4 shrink-0 text-slate-950 group-hover:translate-x-1 transition-transform ml-1" />
            </div>
          </button>
        ) : (
          <div className="w-full sm:w-auto sm:flex-1 sm:max-w-[48%] min-w-0 max-w-full sm:ml-auto p-3.5 rounded-2xl bg-slate-950/40 light-theme:bg-slate-50 border border-slate-800 light-theme:border-slate-200 text-center sm:text-right">
            <span className="text-xs font-mono text-cyan-400 light-theme:text-cyan-600 font-bold">
              🎉 Course Section Complete!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
