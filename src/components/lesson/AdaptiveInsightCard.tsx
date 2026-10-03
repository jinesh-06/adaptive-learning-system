import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Check, Activity, Sliders, Info, ShieldCheck } from 'lucide-react';
import { useCognitive, ContentMode } from '../../context/CognitiveContext';

export interface AdaptiveInsightCardProps {
  className?: string;
  onOpenAdaptedLesson?: () => void;
  topicId?: string;
}

export const AdaptiveInsightCard: React.FC<AdaptiveInsightCardProps> = ({
  className = '',
  onOpenAdaptedLesson,
  topicId
}) => {
  const {
    currentLoad,
    contentMode,
    reason,
    contributingFactors,
    suggestedAdaptation,
    pendingAdaptation,
    setContentModeManually,
    verifyAdaptation
  } = useCognitive();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Normalize current mode to Standard, Detailed, Simplified
  const activeMode: 'STANDARD' | 'DETAILED' | 'SIMPLIFIED' =
    contentMode === 'DETAILED' || contentMode === 'CONCISE'
      ? 'DETAILED'
      : contentMode === 'SIMPLIFIED'
      ? 'SIMPLIFIED'
      : 'STANDARD';

  const modeDescriptions: Record<'STANDARD' | 'DETAILED' | 'SIMPLIFIED', { title: string; desc: string }> = {
    STANDARD: {
      title: 'Standard Explanation',
      desc: 'Balanced progression: Concept → Explanation → Example → Practice'
    },
    DETAILED: {
      title: 'Detailed Explanation',
      desc: 'In-depth breakdown: Concept → Deep dive → Mechanics → Multiple examples → Visual explanation → Practice'
    },
    SIMPLIFIED: {
      title: 'Simplified Explanation',
      desc: 'Concise step-by-step: Simple definition → Everyday analogy → Small example → Try yourself'
    }
  };

  const signalsList = [
    { label: 'Reading pace', status: 'Optimal calibration' },
    { label: 'Section revisits', status: 'Tracked for clarity' },
    { label: 'Code execution attempts', status: 'Active sandbox signals' },
    { label: 'Quiz performance', status: 'Immediate accuracy check' },
    { label: 'Time spent per section', status: 'Continuous telemetry' },
    { label: 'Hint usage & navigation', status: 'Pacing signals' }
  ];

  return (
    <div
      id="section-adaptive"
      className={`rounded-2xl border transition-all duration-300 shadow-sm ${
        isExpanded
          ? 'bg-gradient-to-r from-purple-950/20 via-slate-900/60 to-slate-900/40 border-purple-500/40 light-theme:bg-purple-50/60 light-theme:border-purple-200'
          : 'bg-slate-900/40 light-theme:bg-white border-slate-800 light-theme:border-slate-200 hover:border-purple-500/30'
      } ${className}`}
    >
      {/* Pending Recommendation Banner if present */}
      {pendingAdaptation && (
        <div className="px-4 py-2.5 bg-purple-500/10 border-b border-purple-500/30 rounded-t-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-slate-200 light-theme:text-slate-800">
              <strong className="text-purple-300 light-theme:text-purple-700">Suggested Adaptation: </strong>
              {pendingAdaptation.suggestedAdaptation}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                verifyAdaptation(true);
                if (onOpenAdaptedLesson) onOpenAdaptedLesson();
              }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Yes, Adapt My Lesson</span>
            </button>
            <button
              onClick={() => verifyAdaptation(false)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 light-theme:border-slate-300 hover:bg-slate-800 light-theme:hover:bg-slate-100 text-slate-400 text-xs transition-all"
            >
              Keep Current Lesson
            </button>
          </div>
        </div>
      )}

      {/* Main Bar / Header */}
      <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 light-theme:bg-purple-100 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-purple-400 light-theme:text-purple-600" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 light-theme:bg-purple-100 light-theme:text-purple-700 border border-purple-500/20">
                Adaptive Learning Insight
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/80 light-theme:bg-slate-100 border border-slate-800 light-theme:border-slate-300 text-[10px] font-mono">
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentLoad === 'LOW'
                      ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                      : currentLoad === 'HIGH'
                      ? 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.8)] animate-pulse'
                      : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                  }`}
                />
                <span className="text-slate-300 light-theme:text-slate-700 capitalize font-medium">{currentLoad.toLowerCase()} Load</span>
              </div>
              <span className="text-xs font-semibold text-white light-theme:text-slate-900">
                {modeDescriptions[activeMode].title} selected
              </span>
            </div>
            <p className="text-[11px] text-slate-400 light-theme:text-slate-600 mt-0.5">
              Suggested based on your recent learning activity and interaction signals
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {/* Quick mode chips */}
          <div className="inline-flex rounded-xl bg-slate-950/60 light-theme:bg-slate-100 p-1 border border-slate-800/80 light-theme:border-slate-200">
            {(['STANDARD', 'DETAILED', 'SIMPLIFIED'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setContentModeManually(mode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeMode === mode
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 light-theme:text-slate-600 hover:text-slate-200 light-theme:hover:text-slate-900'
                }`}
                title={modeDescriptions[mode].desc}
              >
                {mode === 'STANDARD' ? 'Standard' : mode === 'DETAILED' ? 'Detailed' : 'Simplified'}
              </button>
            ))}
          </div>

          {onOpenAdaptedLesson && (
            <button
              onClick={onOpenAdaptedLesson}
              className="px-3 py-1.5 rounded-xl border border-purple-500/40 bg-purple-950/30 hover:bg-purple-900/50 text-purple-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Open separate AI-adapted lesson grounded in curriculum RAG"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Adapted Lesson</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-800 light-theme:border-slate-200 bg-slate-950/40 light-theme:bg-slate-50 text-slate-300 light-theme:text-slate-700 hover:text-white light-theme:hover:text-slate-900 text-xs font-medium transition-colors"
          >
            <span>{isExpanded ? 'Hide Details' : 'View Insight'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Details Drawer */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-800/60 light-theme:border-slate-200 space-y-4 text-xs animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Learning Signals card */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 light-theme:bg-white border border-slate-800/80 light-theme:border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-slate-300 light-theme:text-slate-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 light-theme:text-blue-600" />
                  Observable Learning Signals
                </span>
                <span className="text-[10px] font-mono text-slate-500">Live Telemetry</span>
              </div>
              <ul className="space-y-1.5">
                {signalsList.map(sig => (
                  <li key={sig.label} className="flex items-center justify-between text-slate-400 light-theme:text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 light-theme:bg-blue-600" />
                      {sig.label}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{sig.status}</span>
                  </li>
                ))}
              </ul>
              {contributingFactors && contributingFactors.length > 0 && (
                <div className="pt-2 border-t border-slate-800/60 light-theme:border-slate-100 text-[11px] text-purple-300 light-theme:text-purple-700 font-medium">
                  Recent note: {contributingFactors[0]}
                </div>
              )}
            </div>

            {/* Explanation Pacing Modes & Learner Control */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 light-theme:bg-white border border-slate-800/80 light-theme:border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-slate-300 light-theme:text-slate-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400 light-theme:text-purple-600" />
                  Explanation Depth Control
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Learner Choice</span>
              </div>

              <div className="space-y-2">
                {(['STANDARD', 'DETAILED', 'SIMPLIFIED'] as const).map(mode => {
                  const isCurrent = activeMode === mode;
                  const info = modeDescriptions[mode];
                  return (
                    <button
                      key={mode}
                      onClick={() => setContentModeManually(mode)}
                      className={`w-full text-left p-2 rounded-lg border transition-all ${
                        isCurrent
                          ? 'border-purple-500 bg-purple-950/30 light-theme:bg-purple-100 text-purple-200 light-theme:text-purple-900 font-medium'
                          : 'border-slate-800 light-theme:border-slate-200 text-slate-400 light-theme:text-slate-600 hover:border-slate-700 light-theme:hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{info.title}</span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-purple-400 light-theme:text-purple-600" />}
                      </div>
                      <p className="text-[11px] text-slate-400 light-theme:text-slate-500 mt-0.5">{info.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 light-theme:bg-slate-100 text-[11px] text-slate-400 light-theme:text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Learner Agency Guaranteed:</strong> The system adapts presentation pacing based on observable interaction signals. You always retain complete control to toggle your preferred explanation mode anytime.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
