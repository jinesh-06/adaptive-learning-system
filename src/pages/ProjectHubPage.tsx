import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useOfflineSync } from '../hooks/useOfflineSync';
import {
  FolderGit2,
  Award,
  CheckCircle2,
  Code2,
  Sparkles,
  Play,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Clock,
  Layers,
  CheckSquare,
  Zap,
  SlidersHorizontal,
  X,
  RefreshCw,
  Cpu
} from 'lucide-react';

interface ProjectHubProps {
  onBackToDashboard?: () => void;
}

export const ProjectHubPage: React.FC<ProjectHubProps> = () => {
  const { preferences } = useAuth();
  const { monacoTheme } = useTheme();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedLanguage, setSelectedLanguage] = useState<string>(preferences.selected_language || 'python');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [filterCapstoneOnly, setFilterCapstoneOnly] = useState<boolean>(false);

  // Active Project Workspace
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [code, setCode] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'brief' | 'milestones' | 'tests'>('brief');
  const [codingStartTime, setCodingStartTime] = useState<number>(Date.now());
  const [keystrokes, setKeystrokes] = useState<number>(0);
  const [pasteEvents, setPasteEvents] = useState<number>(0);

  // Offline Autosave Hook
  const { saveLocalDraft, loadLocalDraft } = useOfflineSync('project_draft_');

  useEffect(() => {
    loadProjects();
  }, [selectedLanguage, selectedLevel]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await api.getProjects(selectedLanguage, selectedLevel);
      setProjects(res.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProject = async (projId: string) => {
    try {
      const res = await api.getProjectDetail(projId);
      if (res && res.project) {
        setActiveProject(res.project);
        const savedDraft = loadLocalDraft(res.project.id);
        setCode(savedDraft || res.project.starter_code || '');
        setCodingStartTime(Date.now());
        setKeystrokes(0);
        setPasteEvents(0);
        setEvaluationResult(null);
        setActiveTab('brief');
      }
    } catch (err) {
      console.error('Failed to open project:', err);
    }
  };

  const handleEditorChange = (value?: string) => {
    const val = value || '';
    setCode(val);
    setKeystrokes(prev => prev + 1);
    if (activeProject) {
      saveLocalDraft(activeProject.id, val);
    }
  };

  const handleEditorPaste = () => {
    setPasteEvents(prev => prev + 1);
  };

  const handleSubmitProject = async () => {
    if (!activeProject || submitting) return;
    setSubmitting(true);

    const elapsedSeconds = Math.round((Date.now() - codingStartTime) / 1000);

    try {
      const res = await api.submitProject(activeProject.id, {
        code,
        completion_time_seconds: elapsedSeconds,
        keystrokes,
        paste_events: pasteEvents
      });

      setEvaluationResult(res);

      if (res.evaluation && res.evaluation.passed) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Failed to submit project:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Mobile virtual keyboard helpers
  const handleInsertToken = (token: string) => {
    setCode(prev => prev + token);
    setKeystrokes(prev => prev + 1);
  };

  const filteredProjects = projects.filter(p => {
    if (filterCapstoneOnly && !p.is_capstone) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Sections 82 & 83 • Real-World Engineering</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Projects & Capstone Portfolio
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Synthesize practical software architecture skills with guided milestones, automated test assertions, and multi-criteria rubric evaluation.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {['python', 'c', 'cpp', 'java'].map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition-all ${
                  selectedLanguage === lang
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Capstone Toggle */}
          <button
            onClick={() => setFilterCapstoneOnly(!filterCapstoneOnly)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filterCapstoneOnly
                ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Capstones Only</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
          <p className="text-sm">Loading curriculum projects & capstones...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 text-slate-400 border border-dashed border-slate-800 rounded-3xl">
          <FolderGit2 className="w-12 h-12 mx-auto mb-3 opacity-40 text-cyan-400" />
          <p className="text-base font-semibold text-white">No projects found for current filters</p>
          <p className="text-xs text-slate-500 mt-1">Try switching language or level filters above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredProjects.map(proj => (
            <div
              key={proj.id}
              className={`rounded-3xl border p-6 flex flex-col justify-between transition-all group ${
                proj.is_capstone
                  ? 'bg-gradient-to-b from-amber-950/20 to-slate-900 border-amber-500/40 shadow-xl shadow-amber-500/5'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-[10px] font-mono uppercase font-bold text-slate-300">
                    {proj.language} • {proj.level}
                  </span>
                  {proj.is_capstone && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                      <Award className="w-3 h-3" />
                      <span>CAPSTONE</span>
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                  {proj.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {proj.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-800/60 pt-3 mb-6">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{proj.milestone_count} Milestones</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{proj.test_case_count} Test Suites</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenProject(proj.id)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  proj.is_capstone
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:scale-[1.02]'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02]'
                }`}
              >
                <span>Launch Project Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ACTIVE PROJECT WORKSPACE MODAL / FULLVIEW */}
      {activeProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col p-2 sm:p-6 animate-fade-in overflow-hidden">
          {/* Workspace Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>{activeProject.title}</span>
                  {activeProject.is_capstone && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      CAPSTONE
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {activeProject.language.toUpperCase()} • {activeProject.level.toUpperCase()} • Multi-Criteria Rubric Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSubmitProject}
                disabled={submitting}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{submitting ? 'Evaluating Rubric...' : 'Submit for Certification'}</span>
              </button>

              <button
                onClick={() => setActiveProject(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Workspace Body: Split Screen */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
            {/* Left Column: Brief & Milestones (5 cols) */}
            <div className="lg:col-span-5 flex flex-col rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
              {/* Tab Selector */}
              <div className="flex items-center border-b border-slate-800 bg-slate-950/40 p-1 text-xs">
                <button
                  onClick={() => setActiveTab('brief')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === 'brief'
                      ? 'bg-slate-800 text-cyan-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Requirements
                </button>
                <button
                  onClick={() => setActiveTab('milestones')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === 'milestones'
                      ? 'bg-slate-800 text-cyan-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Milestones ({activeProject.milestones.length})
                </button>
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === 'tests'
                      ? 'bg-slate-800 text-cyan-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Test Cases ({activeProject.test_cases.length})
                </button>
              </div>

              {/* Tab Contents (Scrollable) */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
                {activeTab === 'brief' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1">Project Description</h4>
                      <p className="text-slate-300 leading-relaxed">{activeProject.description}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-2">Technical Requirements</h4>
                      <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                        {activeProject.requirements.map((req: string, i: number) => (
                          <li key={i} className="leading-relaxed">{req}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-2">Learning Objectives</h4>
                      <div className="space-y-1">
                        {activeProject.learning_objectives.map((obj: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-cyan-300/90">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                            <span>{obj}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'milestones' && (
                  <div className="space-y-3">
                    {activeProject.milestones.map((m: any, idx: number) => (
                      <div key={m.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-white">{m.title}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mb-2">{m.description}</p>
                        {m.hints && m.hints.length > 0 && (
                          <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300/90">
                            <strong>Hint:</strong> {m.hints[0]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'tests' && (
                  <div className="space-y-2">
                    {activeProject.test_cases.map((tc: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                          <span>Test Case #{i + 1}</span>
                          <span>{tc.is_hidden ? '🔒 Hidden Case' : '👁️ Public Case'}</span>
                        </div>
                        <div className="font-mono text-[11px]">
                          <span className="text-slate-500">Input:</span> <span className="text-slate-200">{tc.input || '(empty)'}</span>
                        </div>
                        <div className="font-mono text-[11px] mt-0.5">
                          <span className="text-slate-500">Expected:</span> <span className="text-emerald-400">{tc.expected_output}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Monaco Editor & Mobile Virtual Bar (7 cols) */}
            <div className="lg:col-span-7 flex flex-col rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
              {/* Virtual Touch Quick-Bar for Mobile / Tablet (Section 85) */}
              <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-950/70 border-b border-slate-800 overflow-x-auto text-xs">
                <span className="text-[10px] text-slate-500 uppercase font-mono font-bold mr-1 shrink-0">Tokens:</span>
                {['()', '{}', '[]', ':', '=', '"', "'", '->', 'def ', 'return ', '    '].map((tok, i) => (
                  <button
                    key={i}
                    onClick={() => handleInsertToken(tok)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] shrink-0 active:scale-95 transition-all"
                  >
                    {tok.trim() || 'tab'}
                  </button>
                ))}
              </div>

              {/* Monaco IDE */}
              <div className="flex-1 min-h-[300px]" onPaste={handleEditorPaste}>
                <Editor
                  height="100%"
                  language={activeProject.language === 'py' ? 'python' : activeProject.language}
                  value={code}
                  theme={monacoTheme}
                  onChange={handleEditorChange}
                  options={{
                    fontSize: 13,
                    fontFamily: 'Fira Code, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    lineNumbers: 'on',
                    tabSize: 4
                  }}
                />
              </div>
            </div>
          </div>

          {/* RUBRIC EVALUATION RESULTS MODAL (Section 84 & 94) */}
          {evaluationResult && (
            <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="max-w-xl w-full rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    {evaluationResult.evaluation.passed ? (
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <RefreshCw className="w-7 h-7 text-rose-400" />
                    )}
                    <div>
                      <h3 className="text-lg font-extrabold text-white">
                        {evaluationResult.evaluation.passed ? 'Project Certified! 🎉' : 'Needs Refinement'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Overall Score: <strong className="text-cyan-400">{evaluationResult.evaluation.overall_score}/100</strong>
                      </p>
                    </div>
                  </div>

                  {evaluationResult.integrity && (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      evaluationResult.integrity.status === 'normal'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      Cadence: {evaluationResult.integrity.status}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {evaluationResult.evaluation.feedback}
                </p>

                {/* 6-Criteria Rubric Grid */}
                <div className="space-y-2.5 text-xs">
                  <h4 className="font-bold text-white text-[11px] uppercase tracking-wider">Evaluation Rubric Breakdown:</h4>
                  {evaluationResult.evaluation.detailed_rubric.map((r: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                      <div className="flex items-center justify-between font-semibold mb-1">
                        <span className="text-white">{r.criterion}</span>
                        <span className="text-cyan-400 font-mono">{r.score}/{r.max_score}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${r.score}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">{r.feedback}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setEvaluationResult(null)}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
                  >
                    Close & Keep Coding
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
