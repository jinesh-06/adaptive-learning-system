import React from 'react';
import { useCognitive, ContentMode } from '../context/CognitiveContext';
import { Brain, Sparkles, AlertCircle, ArrowRight, RefreshCw, Zap } from 'lucide-react';

export const CognitiveLoadBanner: React.FC = () => {
  const {
    currentLoad,
    confidence,
    contentMode,
    reason,
    contributingFactors,
    unusualSignal,
    setContentModeManually
  } = useCognitive();

  const getTheme = () => {
    switch (currentLoad) {
      case 'LOW':
        return {
          bg: 'from-emerald-950/40 via-slate-900/60 to-emerald-900/30',
          border: 'border-emerald-500/30',
          glow: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <Zap className="w-5 h-5 text-emerald-400" />,
          title: 'Comfortable Cognitive State Detected (Low Difficulty)'
        };
      case 'HIGH':
        return {
          bg: 'from-rose-950/40 via-slate-900/60 to-rose-900/30',
          border: 'border-rose-500/30',
          glow: 'text-rose-400',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
          title: 'High Cognitive Load Detected (Concept Support Active)'
        };
      default:
        return {
          bg: 'from-amber-950/40 via-slate-900/60 to-amber-900/30',
          border: 'border-amber-500/30',
          glow: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <Brain className="w-5 h-5 text-amber-400" />,
          title: 'Moderate Cognitive Engagement (Balanced Flow)'
        };
    }
  };

  const theme = getTheme();

  return (
    <div className={`w-full rounded-2xl border p-4 bg-gradient-to-r ${theme.bg} ${theme.border} shadow-xl backdrop-blur-md mb-6 transition-all duration-300`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/50 shadow-inner">
            {theme.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-sm font-bold ${theme.glow}`}>
                {theme.title}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono border font-semibold ${theme.badge}`}>
                ML Confidence: {Math.round(confidence * 100)}%
              </span>
              {unusualSignal && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  ⚡ Unusually Fast Completion Signal Flagged
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {reason}
            </p>

            {contributingFactors && contributingFactors.length > 0 && (
              <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] text-slate-400">
                <span className="text-slate-500 font-medium">Behavioral Telemetry Signals:</span>
                {contributingFactors.slice(0, 3).map((factor, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-slate-300"
                  >
                    • {factor}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-4">
          <span className="text-[11px] text-slate-400 font-medium">Adaptive Content Mode:</span>
          <div className="inline-flex rounded-xl p-1 bg-slate-900/90 border border-slate-800">
            {(['CONCISE', 'BALANCED', 'SIMPLIFIED'] as ContentMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setContentModeManually(mode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  contentMode === mode
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {mode === 'CONCISE' ? '⚡ Concise' : mode === 'BALANCED' ? '📘 Balanced' : '🌱 Simplified'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
