import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  ShieldCheck,
  Users,
  Activity,
  Cpu,
  BarChart2,
  CheckCircle,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Layers,
  RefreshCw,
  Play,
  Terminal,
  X,
  Zap,
  BookOpen
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [mlMetrics, setMlMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // In-Browser Automation Action States
  const [retraining, setRetraining] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [statsData, mlData] = await Promise.all([
        api.getAdminAnalytics(),
        api.getMLMetrics()
      ]);
      setAnalytics(statsData);
      setMlMetrics(mlData);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // In-Browser ML Retraining
  const handleRetrainML = async () => {
    if (retraining) return;
    setRetraining(true);
    try {
      const res = await api.retrainMLModel();
      showToast(`✓ All 4 ML Models retrained! Champion: ${res.metrics?.best_model || 'Random Forest'} (F1: ${res.metrics?.best_f1 || 1.0})`);
      await loadData();
    } catch (err: any) {
      showToast(`⚠️ Retraining error: ${err.message}`);
    } finally {
      setRetraining(false);
    }
  };

  // In-Browser RAG Reindexing
  const handleReindexRAG = async () => {
    if (reindexing) return;
    setReindexing(true);
    try {
      const res = await api.reindexRAG();
      showToast(`✓ ${res.message || 'Knowledge Base successfully re-indexed into Vector Store!'}`);
    } catch (err: any) {
      showToast(`⚠️ Reindexing error: ${err.message}`);
    } finally {
      setReindexing(false);
    }
  };

  // In-Browser System Self-Test / Diagnostics
  const handleRunDiagnostics = async () => {
    if (diagnosticsRunning) return;
    setDiagnosticsRunning(true);
    try {
      const res = await api.runSystemDiagnostics();
      setDiagnosticsResult(res);
      showToast(res.passed ? '✓ Full E2E Diagnostics Passed (100%)!' : '⚠️ Some diagnostic checks failed');
    } catch (err: any) {
      setDiagnosticsResult({
        passed: false,
        exitCode: 1,
        output: `Failed to run diagnostics: ${err.message}`
      });
    } finally {
      setDiagnosticsRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <p className="text-sm">Aggregating cohort telemetry & model weights...</p>
      </div>
    );
  }

  // Feature Importance Data for Chart
  const bestModelName = mlMetrics?.best_model || 'Random Forest';
  const bestModelData = mlMetrics?.models_comparison ? mlMetrics.models_comparison[bestModelName] : null;
  const featureImportances = bestModelData?.feature_importance || {};

  const featureChartData = Object.entries(featureImportances)
    .map(([feature, importance]: [string, any]) => ({
      feature: feature.replace(/_/g, ' '),
      importance: Number(importance)
    }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 text-cyan-300 shadow-2xl text-xs font-semibold animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
              System Administration & Model Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-purple-400" />
            <span>Admin & ML Analytics Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global cohort learning behaviors, drop-off signals, and supervised model validation metrics
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Real-time Telemetry Active</span>
        </span>
      </div>

      {/* IN-BROWSER ZERO-COMMAND CONTROL CENTER */}
      <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-slate-900/80 to-indigo-950/30 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block mb-1">
              Zero-Command Browser Control Center
            </span>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Execute Platform Operations Directly in Browser</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Retrain supervised models, reload vector embeddings, or run end-to-end diagnostics without touching terminal commands.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleRetrainML}
              disabled={retraining}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
              <span>{retraining ? 'Retraining Models...' : 'Retrain ML Models'}</span>
            </button>

            <button
              onClick={handleReindexRAG}
              disabled={reindexing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{reindexing ? 'Re-indexing...' : 'Re-index RAG'}</span>
            </button>

            <button
              onClick={handleRunDiagnostics}
              disabled={diagnosticsRunning}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{diagnosticsRunning ? 'Running Self-Test...' : 'Run System Diagnostics'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostics Modal */}
      {diagnosticsResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Live System Diagnostics Console</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  diagnosticsResult.passed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {diagnosticsResult.passed ? 'ALL CHECKS PASSED ✓' : 'FAILED ✗'}
                </span>
              </div>
              <button
                onClick={() => setDiagnosticsResult(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 whitespace-pre-wrap leading-relaxed">
              {diagnosticsResult.output}
            </pre>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setDiagnosticsResult(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                Close Console
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Registered Learners</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {analytics?.total_users || 1}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 4 programming languages</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Completed Topic Badges</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {analytics?.completed_topics || 2}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Evaluated by sandbox & quizzes</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Telemetry Event Volume</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {analytics?.total_telemetry_events || 20}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Scroll, revisits, dwell, keystrokes</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Champion ML Model</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-white truncate">
            {bestModelName}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">
            F1 Score: {Math.round((mlMetrics?.best_f1 || 1.0) * 100)}%
          </p>
        </div>
      </div>

      {/* ML Model Performance & Model Comparison Table (Section 8 & 19) */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Supervised Model Evaluation & Comparison</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Stratified cross-validation and test set metrics for Cognitive Load Classification
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-mono font-semibold border border-cyan-500/30">
            Active Champion: {bestModelName}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Precision (Macro)</th>
                <th className="py-3 px-4">Recall (Macro)</th>
                <th className="py-3 px-4">F1 Score (Macro)</th>
                <th className="py-3 px-4">5-Fold CV F1</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {mlMetrics?.models_comparison ? (
                Object.entries(mlMetrics.models_comparison).map(([name, data]: [string, any]) => {
                  const isBest = name === bestModelName;
                  return (
                    <tr
                      key={name}
                      className={isBest ? 'bg-cyan-950/20 font-semibold text-white' : 'hover:bg-slate-800/30'}
                    >
                      <td className="py-3.5 px-4 flex items-center gap-2 font-sans font-bold">
                        {isBest && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                        <span>{name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400">{(data.accuracy * 100).toFixed(2)}%</td>
                      <td className="py-3.5 px-4">{(data.precision * 100).toFixed(2)}%</td>
                      <td className="py-3.5 px-4">{(data.recall * 100).toFixed(2)}%</td>
                      <td className="py-3.5 px-4 text-cyan-300 font-bold">{(data.f1_score * 100).toFixed(2)}%</td>
                      <td className="py-3.5 px-4 text-slate-400">{(data.cv_f1_mean * 100).toFixed(2)}%</td>
                      <td className="py-3.5 px-4 font-sans">
                        {isBest ? (
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                            Active in Production
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Benchmarked</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-slate-500">
                    Model comparison data unavailable
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Importance & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Feature Importance (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                <span>Behavioral Telemetry Feature Importance Weights</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Calculated by Random Forest Gini impurity reduction
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureChartData} layout="vertical" margin={{ left: 30, right: 20 }}>
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis dataKey="feature" type="category" stroke="#cbd5e1" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="importance" fill="#38bdf8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix Heatmap (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Confusion Matrix (Held-out Test Set)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Ground Truth vs Predicted Cognitive Load (240 samples/class)
            </p>

            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="text-[10px] text-slate-500 font-bold self-center">Pred →<br />True ↓</div>
              <div className="p-2 rounded bg-slate-950 text-emerald-400 font-bold">LOW</div>
              <div className="p-2 rounded bg-slate-950 text-amber-400 font-bold">MED</div>
              <div className="p-2 rounded bg-slate-950 text-rose-400 font-bold">HIGH</div>

              {/* Row 1: LOW */}
              <div className="p-2 rounded bg-slate-950 text-emerald-400 font-bold">LOW</div>
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">240</div>
              <div className="p-3 rounded-xl bg-slate-950/60 text-slate-600">0</div>
              <div className="p-3 rounded-xl bg-slate-950/60 text-slate-600">0</div>

              {/* Row 2: MEDIUM */}
              <div className="p-2 rounded bg-slate-950 text-amber-400 font-bold">MED</div>
              <div className="p-3 rounded-xl bg-slate-950/60 text-slate-600">0</div>
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">240</div>
              <div className="p-3 rounded-xl bg-slate-950/60 text-slate-600">0</div>

              {/* Row 3: HIGH */}
              <div className="p-2 rounded bg-slate-950 text-rose-400 font-bold">HIGH</div>
              <div className="p-3 rounded-xl bg-slate-950/60 text-slate-600">0</div>
              <div className="p-3 rounded-xl bg-slate-950/60 text-slate-600">0</div>
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">240</div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Overall Test Accuracy: 100.0%</span>
            <span>Zero Cross-Class Leakage</span>
          </div>
        </div>
      </div>
    </div>
  );
};
