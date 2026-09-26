import React, { useState, useEffect } from 'react';
import {
  Code,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Terminal,
  Trophy,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { executeCodeInBrowser } from '../../services/pythonRunner';
import { telemetry } from '../../services/telemetry';

export interface TestCase {
  input: string;
  expected_output: string;
}

export interface CodingChallengeData {
  id: string;
  title: string;
  difficulty: string;
  problem_statement: string;
  input_format?: string;
  output_format?: string;
  constraints?: string;
  starter_code: {
    python: string;
  };
  test_cases: TestCase[];
}

export interface InLessonCodingChallengeProps {
  topicId: string;
  initialChallenge?: CodingChallengeData;
  onOpenFullStudio?: () => void;
}

export const InLessonCodingChallenge: React.FC<InLessonCodingChallengeProps> = ({
  topicId,
  initialChallenge,
  onOpenFullStudio
}) => {
  const [challenge, setChallenge] = useState<CodingChallengeData | null>(initialChallenge || null);
  const [loading, setLoading] = useState<boolean>(!initialChallenge);
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<{
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }[] | null>(null);
  const [allPassed, setAllPassed] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [customOutput, setCustomOutput] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'custom'>('tests');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!initialChallenge) {
      setLoading(true);
      api.getTopicCodingChallenge(topicId)
        .then(data => {
          if (isMounted && data) {
            setChallenge(data);
            setCode(data.starter_code?.python || '# Write your solution\n');
          } else if (isMounted) {
            // High quality fallback challenge
            const fallback: CodingChallengeData = {
              id: 'code-py-base-conversion',
              title: 'Base Representation & Identity Inspector',
              difficulty: 'Easy',
              problem_statement: 'Read an integer N from standard input. Output its binary (bin), octal (oct), and hexadecimal (hex) representations separated by a single space on one line.',
              input_format: 'A single non-negative integer N on standard input.',
              output_format: 'Three space-separated strings: binary, octal, and hexadecimal values.',
              constraints: '0 <= N <= 10^9',
              starter_code: {
                python: 'import sys\n\ndef solve():\n    raw = sys.stdin.read().strip()\n    if not raw:\n        return\n    n = int(raw)\n    # Your logic here:\n    print(f"{bin(n)} {oct(n)} {hex(n)}")\n\nif __name__ == "__main__":\n    solve()\n'
              },
              test_cases: [
                { input: '15', expected_output: '0b1111 0o17 0xf' },
                { input: '0', expected_output: '0b0 0o0 0x0' },
                { input: '255', expected_output: '0b11111111 0o377 0xff' }
              ]
            };
            setChallenge(fallback);
            setCode(fallback.starter_code.python);
          }
          setLoading(false);
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setCode(initialChallenge.starter_code?.python || '');
    }

    return () => {
      isMounted = false;
    };
  }, [topicId, initialChallenge]);

  const handleRunAllTests = async () => {
    if (!challenge) return;
    setIsRunning(true);
    setTestResults(null);
    setAllPassed(false);
    setActiveTab('tests');

    telemetry.logEvent('CODING_CHALLENGE_SUBMIT', 0, {
      topic_id: topicId,
      challenge_id: challenge.id
    });

    const results: { input: string; expected: string; actual: string; passed: boolean }[] = [];
    let everyPassed = true;

    for (const tc of challenge.test_cases) {
      try {
        const res = await executeCodeInBrowser(code, 'python', tc.input);
        const cleanActual = (res.stdout || '').trim();
        const cleanExpected = tc.expected_output.trim();
        const passed = cleanActual === cleanExpected;
        if (!passed) everyPassed = false;

        results.push({
          input: tc.input,
          expected: cleanExpected,
          actual: cleanActual || (res.stderr ? `Error: ${res.stderr.slice(0, 100)}` : '(empty)'),
          passed
        });
      } catch (err: any) {
        everyPassed = false;
        results.push({
          input: tc.input,
          expected: tc.expected_output.trim(),
          actual: `Execution Exception: ${err.message || ''}`,
          passed: false
        });
      }
    }

    setIsRunning(false);
    setTestResults(results);
    setAllPassed(everyPassed);

    if (everyPassed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.8 }
        });
      } catch {}
      telemetry.logEvent('CODING_CHALLENGE_SUCCESS', 0, {
        topic_id: topicId,
        challenge_id: challenge.id
      });
      localStorage.setItem(`topic_challenge_passed_${topicId}`, 'true');
    }
  };

  const handleRunCustom = async () => {
    setIsRunning(true);
    setCustomOutput(null);
    try {
      const res = await executeCodeInBrowser(code, 'python', customInput);
      setIsRunning(false);
      setCustomOutput(res.stdout || res.stderr || '(No output produced)');
    } catch (err: any) {
      setIsRunning(false);
      setCustomOutput(err.message || 'Execution error');
    }
  };

  const handleResetCode = () => {
    if (challenge) {
      setCode(challenge.starter_code?.python || '');
      setTestResults(null);
      setAllPassed(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-slate-800 light-theme:border-slate-300 bg-slate-900/40 text-center text-xs text-slate-500 animate-pulse">
        Loading coding challenge sandbox...
      </div>
    );
  }

  if (!challenge) return null;

  return (
    <div
      id="section-challenge"
      className="rounded-2xl border border-slate-800 light-theme:border-slate-300 bg-slate-900/50 light-theme:bg-white overflow-hidden shadow-md space-y-4"
    >
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-800 light-theme:border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 light-theme:bg-emerald-100 light-theme:text-emerald-700 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white light-theme:text-slate-900 flex items-center gap-2">
                <span>Coding Challenge: {challenge.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 light-theme:bg-emerald-100 light-theme:text-emerald-700 border border-emerald-500/20">
                  {challenge.difficulty}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 light-theme:text-slate-600">
                Solve the challenge and validate against automated test cases
              </p>
            </div>
          </div>

          {onOpenFullStudio && (
            <button
              onClick={onOpenFullStudio}
              className="text-xs px-3 py-1 rounded-lg border border-slate-700 light-theme:border-slate-300 hover:bg-slate-800 light-theme:hover:bg-slate-100 text-slate-300 light-theme:text-slate-700 transition-colors self-start sm:self-auto"
            >
              Open in Full Studio ↗
            </button>
          )}
        </div>

        {/* Problem Statement */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 light-theme:bg-slate-50 border border-slate-800 light-theme:border-slate-200 space-y-2 text-xs">
          <div className="text-slate-200 light-theme:text-slate-800 leading-relaxed font-medium">
            {challenge.problem_statement}
          </div>
          {(challenge.input_format || challenge.constraints) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 light-theme:border-slate-200 text-[11px] text-slate-400 light-theme:text-slate-600">
              {challenge.input_format && (
                <div>
                  <strong className="text-slate-300 light-theme:text-slate-700">Input:</strong> {challenge.input_format}
                </div>
              )}
              {challenge.constraints && (
                <div>
                  <strong className="text-slate-300 light-theme:text-slate-700">Constraints:</strong> {challenge.constraints}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editor & Actions */}
      <div className="px-5 sm:px-6 space-y-3">
        <div className="rounded-xl border border-slate-800 light-theme:border-slate-300 bg-slate-950 light-theme:bg-white overflow-hidden">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 light-theme:bg-slate-100 border-b border-slate-800 light-theme:border-slate-300 text-xs">
            <span className="font-mono text-cyan-400 light-theme:text-blue-600 font-bold">solution.py</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="text-slate-400 hover:text-white light-theme:hover:text-slate-900 flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleResetCode}
                className="text-slate-400 hover:text-white light-theme:hover:text-slate-900 flex items-center gap-1 text-[11px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            rows={8}
            className="w-full p-3 font-mono text-xs sm:text-sm bg-transparent text-emerald-300 light-theme:text-slate-900 outline-none leading-relaxed resize-y"
          />

          {/* Action Bar */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-slate-900/90 light-theme:bg-slate-100 border-t border-slate-800 light-theme:border-slate-300">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('tests')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  activeTab === 'tests'
                    ? 'bg-slate-800 light-theme:bg-slate-200 text-white light-theme:text-slate-900'
                    : 'text-slate-400'
                }`}
              >
                Test Cases ({challenge.test_cases.length})
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  activeTab === 'custom'
                    ? 'bg-slate-800 light-theme:bg-slate-200 text-white light-theme:text-slate-900'
                    : 'text-slate-400'
                }`}
              >
                Custom Input
              </button>
            </div>

            <button
              onClick={activeTab === 'tests' ? handleRunAllTests : handleRunCustom}
              disabled={isRunning}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running Tests...' : activeTab === 'tests' ? 'Run Test Cases ▶' : 'Run Custom ▶'}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Test Cases Output */}
        {activeTab === 'tests' && testResults && (
          <div className="p-4 rounded-xl border border-slate-800 light-theme:border-slate-300 bg-slate-950/80 light-theme:bg-slate-50 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 light-theme:text-slate-800">
                Evaluation Results:
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  allPassed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {allPassed ? '✔ All Tests Passed!' : '✖ Some Tests Failed'}
              </span>
            </div>

            <div className="space-y-2">
              {testResults.map((tr, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs font-mono ${
                    tr.passed
                      ? 'border-emerald-500/30 bg-emerald-950/20 light-theme:bg-emerald-50 text-emerald-300 light-theme:text-emerald-900'
                      : 'border-rose-500/30 bg-rose-950/20 light-theme:bg-rose-50 text-rose-300 light-theme:text-rose-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 font-bold">
                    <span className="flex items-center gap-1.5">
                      {tr.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      Test Case {idx + 1}
                    </span>
                    <span>{tr.passed ? 'PASSED' : 'FAILED'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 opacity-90 text-[11px]">
                    <div>
                      <span className="opacity-60 block">Input:</span>
                      <code>{tr.input || '(empty)'}</code>
                    </div>
                    <div>
                      <span className="opacity-60 block">Expected:</span>
                      <code>{tr.expected}</code>
                    </div>
                    <div>
                      <span className="opacity-60 block">Your Output:</span>
                      <code>{tr.actual}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Custom Input & Output */}
        {activeTab === 'custom' && (
          <div className="p-3.5 rounded-xl border border-slate-800 light-theme:border-slate-300 bg-slate-950/80 light-theme:bg-slate-50 space-y-2 text-xs">
            <span className="text-slate-400 font-bold block">Provide Custom stdin Input:</span>
            <input
              type="text"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder="e.g. 42"
              className="w-full p-2 rounded-lg bg-slate-900 light-theme:bg-white border border-slate-800 light-theme:border-slate-300 text-slate-200 light-theme:text-slate-900 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
            {customOutput && (
              <div className="p-2.5 rounded-lg bg-slate-900 light-theme:bg-white border border-slate-800 font-mono text-cyan-300 light-theme:text-slate-900">
                <span className="text-[10px] text-slate-500 block">Output:</span>
                <pre>{customOutput}</pre>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-950/40 border-t border-slate-800/60 light-theme:border-slate-200 text-center text-xs text-slate-500">
        Challenge submissions track coding accuracy and time spent for adaptive calibration.
      </div>
    </div>
  );
};
