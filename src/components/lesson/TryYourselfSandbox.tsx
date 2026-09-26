import React, { useState } from 'react';
import { Play, CheckCircle2, RotateCcw, Lightbulb, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { executeCodeInBrowser } from '../../services/pythonRunner';
import { telemetry } from '../../services/telemetry';

export interface TryYourselfProps {
  prompt?: string;
  initialCode?: string;
  expectedOutputMatcher?: string | RegExp;
  hint?: string;
  solution?: string;
  topicId?: string;
}

export const TryYourselfSandbox: React.FC<TryYourselfProps> = ({
  prompt = 'Create a variable called age, assign it the integer value 20, and then print its value using print(age).',
  initialCode = '# Write your code below\n\n',
  expectedOutputMatcher = '20',
  hint = 'Remember syntax: variable_name = value, then call print(variable_name).',
  solution = 'age = 20\nprint(age)',
  topicId = 'top-py-fundamentals'
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    passed: boolean;
    message: string;
  } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);

  const handleRunAndCheck = async () => {
    setIsRunning(true);
    setValidationResult(null);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    telemetry.logEvent('TRY_YOURSELF_ATTEMPT', 0, {
      topic_id: topicId,
      attempt_number: newAttempts
    });

    try {
      const res = await executeCodeInBrowser(code, 'python');
      setIsRunning(false);
      setOutput(res.stdout || res.stderr || '(No output produced)');

      // Validate output
      const cleanOut = (res.stdout || '').trim();
      const isMatch =
        typeof expectedOutputMatcher === 'string'
          ? cleanOut.includes(expectedOutputMatcher)
          : expectedOutputMatcher.test(cleanOut);

      if (isMatch && res.status === 'SUCCESS') {
        setValidationResult({
          passed: true,
          message: 'Excellent job! Your code produced the expected output correctly.'
        });

        // Trigger confetti celebration
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 }
          });
        } catch {}

        telemetry.logEvent('TRY_YOURSELF_SUCCESS', 0, {
          topic_id: topicId,
          attempts: newAttempts
        });
      } else {
        setValidationResult({
          passed: false,
          message: cleanOut
            ? `Your output was "${cleanOut}", but we expected "${expectedOutputMatcher}". Check your logic and try again!`
            : 'No matching output was produced. Make sure to use the print() function.'
        });
      }
    } catch (err: any) {
      setIsRunning(false);
      setOutput(err.message || 'Execution error');
      setValidationResult({
        passed: false,
        message: 'A runtime error occurred. Check syntax or click Hint for help.'
      });
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput(null);
    setValidationResult(null);
  };

  return (
    <div
      id="section-try-yourself"
      className="rounded-2xl border border-cyan-500/40 light-theme:border-blue-300 bg-slate-900/60 light-theme:bg-blue-50/40 p-5 sm:p-6 shadow-md space-y-4"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 light-theme:border-blue-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 light-theme:bg-blue-200 flex items-center justify-center text-cyan-400 light-theme:text-blue-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white light-theme:text-slate-900 flex items-center gap-2">
              <span>Try Yourself</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 light-theme:bg-blue-100 light-theme:text-blue-800 border border-cyan-500/20 font-normal">
                Hands-On Practice
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 light-theme:text-slate-600">
              Apply what you just learned directly in this interactive exercise
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHint(!showHint)}
            className="p-1.5 rounded-lg border border-slate-700 light-theme:border-slate-300 hover:bg-slate-800 light-theme:hover:bg-slate-200 text-slate-300 light-theme:text-slate-700 text-xs flex items-center gap-1"
            title="Need a hint?"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline text-[11px]">Hint</span>
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg border border-slate-700 light-theme:border-slate-300 hover:bg-slate-800 light-theme:hover:bg-slate-200 text-slate-300 light-theme:text-slate-700 text-xs flex items-center gap-1"
            title="Reset exercise"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Exercise Prompt */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 light-theme:bg-white border border-slate-800 light-theme:border-blue-200 text-xs text-slate-200 light-theme:text-slate-800 font-medium leading-relaxed">
        {prompt}
      </div>

      {/* Hint Alert if toggled */}
      {showHint && (
        <div className="p-3 rounded-xl bg-amber-950/30 light-theme:bg-amber-50 border border-amber-500/30 text-xs text-amber-300 light-theme:text-amber-900 flex items-start gap-2 animate-fade-in">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Hint:</strong> {hint}
            {attempts >= 2 && !showSolution && (
              <button
                onClick={() => setShowSolution(true)}
                className="block mt-1 text-[11px] underline text-amber-400 hover:text-amber-300"
              >
                Still stuck? View expected solution
              </button>
            )}
          </div>
        </div>
      )}

      {/* Solution reveal if requested */}
      {showSolution && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
          <div className="text-[10px] text-slate-400 font-sans uppercase mb-1">Solution:</div>
          <pre>{solution}</pre>
        </div>
      )}

      {/* Interactive Code Editor */}
      <div className="rounded-xl border border-slate-800 light-theme:border-slate-300 bg-slate-950 light-theme:bg-white overflow-hidden">
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
          className="w-full p-3 font-mono text-xs sm:text-sm bg-transparent text-cyan-300 light-theme:text-slate-900 outline-none resize-y min-h-[90px] leading-relaxed"
          placeholder="Write your code here..."
        />

        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 light-theme:bg-slate-100 border-t border-slate-800 light-theme:border-slate-300">
          <div className="text-[11px] text-slate-400 font-mono">
            {attempts > 0 ? `Attempts: ${attempts}` : 'Not tested yet'}
          </div>

          <button
            onClick={handleRunAndCheck}
            disabled={isRunning}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Checking...' : 'Run & Check Answer'}</span>
          </button>
        </div>
      </div>

      {/* Output and Validation Banner */}
      {validationResult && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-fade-in ${
            validationResult.passed
              ? 'bg-emerald-950/30 light-theme:bg-emerald-50 border-emerald-500/40 text-emerald-300 light-theme:text-emerald-900'
              : 'bg-rose-950/30 light-theme:bg-rose-50 border-rose-500/40 text-rose-300 light-theme:text-rose-900'
          }`}
        >
          {validationResult.passed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed">
            <strong className="block mb-0.5 font-bold">
              {validationResult.passed ? 'Correct!' : 'Not quite yet'}
            </strong>
            {validationResult.message}
            {output && (
              <div className="mt-1.5 font-mono text-[11px] opacity-80">
                Your Output: <code>{output}</code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
