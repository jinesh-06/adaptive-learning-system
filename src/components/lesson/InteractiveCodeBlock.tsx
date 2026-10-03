import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Eraser,
  Sparkles,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { executeCodeInBrowser } from '../../services/pythonRunner';
import { telemetry } from '../../services/telemetry';

export interface InteractiveCodeBlockProps {
  initialCode: string;
  language?: string;
  title?: string;
  explanationOfOutput?: string;
  expectedOutput?: string;
  topicId?: string;
  readOnly?: boolean;
}

export const InteractiveCodeBlock: React.FC<InteractiveCodeBlockProps> = ({
  initialCode,
  language = 'python',
  title = 'Python Interactive Example',
  explanationOfOutput,
  expectedOutput,
  topicId,
  readOnly = false
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [output, setOutput] = useState<string | null>(null);
  const [errorOutput, setErrorOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setCode(initialCode);
    setOutput(null);
    setErrorOutput(null);
    setStatus('IDLE');
  }, [initialCode]);

  const handleRun = async () => {
    setIsRunning(true);
    setErrorOutput(null);
    setStatus('IDLE');

    // Telemetry tracking
    telemetry.logEvent('CODE_RUN_ATTEMPT', 0, {
      topic_id: topicId,
      code_length: code.length,
      language
    });

    try {
      const res = await executeCodeInBrowser(code, language);
      setIsRunning(false);
      setExecutionTime(res.execution_time_ms);

      if (res.status === 'SUCCESS') {
        setOutput(res.stdout || '(Program completed with no output)');
        setStatus('SUCCESS');
        telemetry.logEvent('CODE_RUN_SUCCESS', res.execution_time_ms, {
          topic_id: topicId,
          language
        });
      } else {
        setErrorOutput(res.stderr || 'Runtime error occurred during execution');
        setOutput(res.stdout || null);
        setStatus('ERROR');
        telemetry.logEvent('CODE_RUN_ERROR', res.execution_time_ms, {
          topic_id: topicId,
          language
        });
      }
    } catch (err: any) {
      setIsRunning(false);
      setErrorOutput(err.message || 'Execution failed');
      setStatus('ERROR');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput(null);
    setErrorOutput(null);
    setStatus('IDLE');
    setExecutionTime(null);
  };

  const handleClearOutput = () => {
    setOutput(null);
    setErrorOutput(null);
    setStatus('IDLE');
    setExecutionTime(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    telemetry.recordKeystroke();
    // Allow Tab key indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        if (e.currentTarget) {
          e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const handlePaste = () => {
    telemetry.recordPaste();
  };

  // Line numbers calculation
  const lineCount = code.split('\n').length;

  return (
    <div className="rounded-2xl border border-slate-800 light-theme:border-slate-300 bg-slate-950 light-theme:bg-white overflow-hidden shadow-lg">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 light-theme:bg-slate-100 border-b border-slate-800 light-theme:border-slate-300">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 light-theme:text-slate-700 ml-2">
            {title}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 light-theme:bg-blue-100 light-theme:text-blue-700 border border-cyan-500/20">
            {language}
          </span>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white light-theme:hover:text-slate-900 hover:bg-slate-800 light-theme:hover:bg-slate-200 transition-colors flex items-center gap-1 text-xs"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {!readOnly && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white light-theme:hover:text-slate-900 hover:bg-slate-800 light-theme:hover:bg-slate-200 transition-colors flex items-center gap-1 text-xs"
              title="Reset Code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Reset</span>
            </button>
          )}

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run Code ▶'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body with line numbers */}
      <div className="relative flex font-mono text-xs sm:text-sm bg-slate-950 light-theme:bg-slate-50 min-h-[140px] max-h-[380px] overflow-auto">
        {/* Line Numbers */}
        <div className="py-3 pl-3 pr-2 select-none text-slate-600 light-theme:text-slate-400 bg-slate-950/80 light-theme:bg-slate-100/80 text-right font-mono text-xs border-r border-slate-850 light-theme:border-slate-200">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea code input */}
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          readOnly={readOnly}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-cyan-300 light-theme:text-slate-900 font-mono text-xs sm:text-sm leading-6 outline-none resize-none overflow-x-auto whitespace-pre selection:bg-cyan-500/30"
          rows={Math.max(4, lineCount)}
        />
      </div>

      {/* Output Panel */}
      {(output !== null || errorOutput !== null || isRunning) && (
        <div className="border-t border-slate-800 light-theme:border-slate-300 bg-slate-950/95 light-theme:bg-slate-100">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 light-theme:bg-slate-200 border-b border-slate-800/80 light-theme:border-slate-300 text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400 light-theme:text-blue-600" />
              <span className="font-bold text-slate-300 light-theme:text-slate-800">Program Output</span>
              {status === 'SUCCESS' && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> Done
                </span>
              )}
              {status === 'ERROR' && (
                <span className="flex items-center gap-1 text-[11px] text-rose-400 font-mono">
                  <AlertCircle className="w-3 h-3" /> Error
                </span>
              )}
              {executionTime !== null && (
                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {executionTime}ms
                </span>
              )}
            </div>

            <button
              onClick={handleClearOutput}
              className="text-[11px] text-slate-400 hover:text-white light-theme:hover:text-slate-900 flex items-center gap-1"
            >
              <Eraser className="w-3 h-3" />
              Clear
            </button>
          </div>

          <div className="p-4 font-mono text-xs overflow-x-auto max-h-48 leading-relaxed">
            {isRunning && (
              <div className="text-slate-400 animate-pulse flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Executing code in browser runtime...
              </div>
            )}

            {output && (
              <pre className="text-slate-200 light-theme:text-slate-900 whitespace-pre-wrap">
                {output}
              </pre>
            )}

            {errorOutput && (
              <pre className="text-rose-400 bg-rose-950/20 p-2.5 rounded-lg border border-rose-500/30 whitespace-pre-wrap mt-2">
                {errorOutput}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Explanation of Output Block */}
      {explanationOfOutput && (
        <div className="p-3.5 bg-slate-900/40 light-theme:bg-slate-50 border-t border-slate-800/80 light-theme:border-slate-300 flex items-start gap-2.5 text-xs text-slate-300 light-theme:text-slate-700">
          <Info className="w-4 h-4 text-cyan-400 light-theme:text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white light-theme:text-slate-900 block mb-0.5">Explanation of Output:</strong>
            {explanationOfOutput}
          </div>
        </div>
      )}
    </div>
  );
};
