import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  RotateCcw,
  Play,
  ArrowRight,
  Database,
  FileCode,
  HardDrive,
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShieldAlert,
  Search,
  Plus,
  Trash2,
  Edit3,
  Save,
  Terminal,
  Activity,
  ArrowDown
} from 'lucide-react';

// ============================================================================
// 1. C COMPILATION PIPELINE VISUALIZER (Stages: cpp -> cc1 -> as -> ld)
// ============================================================================
export const CCompilationPipelineVisualizer: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages = [
    {
      id: 'preprocessor',
      name: '1. Preprocessor (cpp)',
      file: 'main.i',
      desc: 'Expands #include headers, replaces #define macros, and strips out all comments.',
      source: `// Source: main.c
#include <stdio.h>
#define PI 3.14159

int main(void) {
    printf("PI = %.2f\\n", PI);
    return 0;
}`,
      output: `// Generated: main.i (expanded)
// ... 800+ lines of stdio.h prototypes ...
extern int printf(const char *__format, ...);

int main(void) {
    printf("PI = %.2f\\n", 3.14159);
    return 0;
}`,
      highlight: 'Header copy-pasting + Macro substitution: PI became literal 3.14159'
    },
    {
      id: 'compiler',
      name: '2. Compiler (cc1 / clang)',
      file: 'main.s',
      desc: 'Parses C syntax into an Abstract Syntax Tree (AST), optimizes code, and emits CPU assembly.',
      source: `int main(void) {
    printf("PI = %.2f\\n", 3.14159);
    return 0;
}`,
      output: `.section .rodata
.LC0:
    .string "PI = %.2f\\n"
.text
.globl main
main:
    pushq   %rbp
    movq    %rsp, %rbp
    movsd   .LC1(%rip), %xmm0
    leaq    .LC0(%rip), %rdi
    call    printf@PLT
    movl    $0, %eax
    popq    %rbp
    ret`,
      highlight: 'High-level C syntax translated to low-level x86_64 CPU instructions'
    },
    {
      id: 'assembler',
      name: '3. Assembler (as)',
      file: 'main.o',
      desc: 'Encodes assembly instructions into relocatable machine-code binary opcodes.',
      source: `main:
    pushq   %rbp
    movq    %rsp, %rbp
    ...
    call    printf@PLT`,
      output: `7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00  .ELF............
01 00 3e 00 01 00 00 00 00 00 00 00 00 00 00 00  ..>.............
55 48 89 e5 48 83 ec 10 f2 0f 10 05 00 00 00 00  UH..H...........
48 8d 3d 00 00 00 00 b8 01 00 00 00 e8 00 00 00  H.=.............
b8 00 00 00 c9 c3                                ...`,
      highlight: 'Raw binary machine code (ELF/PE relocatable format) with unresolved printf symbol'
    },
    {
      id: 'linker',
      name: '4. Linker (ld)',
      file: 'main.exe / a.out',
      desc: 'Resolves external symbols like printf by binding libc.so / msvcrt.dll into a final runnable executable.',
      source: `main.o (Relocatable)
+ libc.a / libc.so (Standard C Library)
+ crt0.o (C Runtime Initialization Startup Code)`,
      output: `[ELF 64-bit LSB pie executable, x86-64]
EntryPoint: 0x0000000000001040 (_start)
Resolved: printf -> libc.so.6:0x00007ffff7e0a050
Virtual Memory Layout: .text (Code), .data, .rodata, .bss
Execution: $ ./a.out
Output: PI = 3.14`,
      highlight: 'Fully resolved executable with OS loader entry point ready to launch'
    }
  ];

  const current = stages[activeStage];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Cpu className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Interactive C Compilation Pipeline</h3>
            <p className="text-xs text-slate-400">Trace the exact 4-stage journey from source text to CPU machine code</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {stages.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => setActiveStage(idx)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeStage === idx
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Stage {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Stage Flow Indicator */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {stages.map((st, idx) => {
          const isDone = idx < activeStage;
          const isCurrent = idx === activeStage;
          return (
            <div
              key={st.id}
              onClick={() => setActiveStage(idx)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isCurrent
                  ? 'border-cyan-500 bg-cyan-950/30 text-white ring-1 ring-cyan-500/50'
                  : isDone
                  ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                  {st.file}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isCurrent ? (
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                ) : null}
              </div>
              <p className="text-xs font-bold truncate">{st.name}</p>
            </div>
          );
        })}
      </div>

      {/* Code Transformation View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 font-mono text-xs">
          <div className="text-[11px] text-slate-400 font-bold mb-2 flex items-center justify-between border-b border-slate-800 pb-1">
            <span>Input to Stage {activeStage + 1}</span>
            <span className="text-cyan-400">Step {activeStage + 1} of 4</span>
          </div>
          <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto text-[11px] max-h-48">
            {current.source}
          </pre>
        </div>

        <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-slate-950/80 font-mono text-xs">
          <div className="text-[11px] text-cyan-300 font-bold mb-2 flex items-center justify-between border-b border-slate-800 pb-1">
            <span>Output Artifact ({current.file})</span>
            <span className="text-emerald-400 font-bold">Generated</span>
          </div>
          <pre className="text-cyan-100 whitespace-pre-wrap leading-relaxed overflow-x-auto text-[11px] max-h-48">
            {current.output}
          </pre>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-xs text-cyan-200 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
        <span><strong>Key Takeaway:</strong> {current.highlight}</span>
      </div>
    </div>
  );
};

// ============================================================================
// 2. C MEMORY LAYOUT & DATA TYPES VISUALIZER (Bytes, Addresses & sizeof)
// ============================================================================
export const CMemoryLayoutVisualizer: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('int');
  const [intValue, setIntValue] = useState<number>(42);

  const typeData: Record<string, { size: number; spec: string; range: string; example: string }> = {
    char: { size: 1, spec: '%c / %d', range: '-128 to 127', example: "'A' (ASCII 65)" },
    int: { size: 4, spec: '%d', range: '-2,147,483,648 to 2,147,483,647', example: `${intValue}` },
    float: { size: 4, spec: '%.2f', range: '~1.2E-38 to ~3.4E+38 (6-7 digits)', example: '3.14f' },
    double: { size: 8, spec: '%.4lf', range: '~2.3E-308 to ~1.7E+308 (15-17 digits)', example: '3.14159265' }
  };

  const curr = typeData[selectedType];
  const baseAddress = 0x7ffe4a20;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Layers className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Hardware Memory & sizeof() Inspector</h3>
            <p className="text-xs text-slate-400">Examine how primitive C data types occupy exact hardware byte slots</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['char', 'int', 'float', 'double'] as const).map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                selectedType === t
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Slot Representation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Stack Frame Memory Allocation (64-bit architecture)</span>
          <span className="font-mono text-cyan-400">sizeof({selectedType}) = {curr.size} byte{curr.size > 1 ? 's' : ''}</span>
        </div>

        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: 8 }).map((_, idx) => {
            const isAllocated = idx < curr.size;
            const addrHex = `0x${(baseAddress + idx).toString(16)}`;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-center font-mono transition-all ${
                  isAllocated
                    ? 'border-purple-500/70 bg-purple-950/40 text-purple-200 ring-1 ring-purple-500/40'
                    : 'border-slate-800 bg-slate-950/40 text-slate-600'
                }`}
              >
                <div className="text-[10px] text-slate-400 mb-1">Byte {idx}</div>
                <div className="text-xs font-bold">
                  {isAllocated ? (idx === 0 ? '0x2A' : '0x00') : '--'}
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-1">{addrHex}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Type Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-slate-400 text-[11px] mb-1">Format Specifier</div>
          <div className="font-mono text-cyan-400 font-bold">{curr.spec}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-slate-400 text-[11px] mb-1">Byte Width</div>
          <div className="font-mono text-purple-400 font-bold">{curr.size} bytes ({curr.size * 8} bits)</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 sm:col-span-2">
          <div className="text-slate-400 text-[11px] mb-1">Numerical Value Range</div>
          <div className="font-mono text-emerald-400 font-semibold truncate">{curr.range}</div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400">Interactive C snippet:</span>
        <code className="font-mono text-purple-300">
          {selectedType} val = {curr.example}; printf("{curr.spec}\\n", val);
        </code>
      </div>
    </div>
  );
};

// ============================================================================
// 3. C EXPRESSION EVALUATION & OPERATORS VISUALIZER (Precedence & Short-Circuit)
// ============================================================================
export const CExpressionEvaluationVisualizer: React.FC = () => {
  const [a, setA] = useState<number>(5);
  const [b, setB] = useState<number>(3);
  const [evalStep, setEvalStep] = useState<number>(0);

  // Expression: result = (a++ * 2) + (++b * 3);
  const steps = [
    {
      label: 'Initial State',
      expr: 'result = (a++ * 2) + (++b * 3);',
      aState: `a = ${a}`,
      bState: `b = ${b}`,
      comment: 'Observe prefix (++b) vs postfix (a++) evaluation order'
    },
    {
      label: '1. Evaluate a++ (Postfix)',
      expr: `result = (${a} * 2) + (++b * 3); // a increments to ${a + 1} after use`,
      aState: `a = ${a + 1}`,
      bState: `b = ${b}`,
      comment: 'Postfix a++ yields the current value first, then increments memory'
    },
    {
      label: '2. Evaluate ++b (Prefix)',
      expr: `result = (${a} * 2) + (${b + 1} * 3); // b increments to ${b + 1} immediately`,
      aState: `a = ${a + 1}`,
      bState: `b = ${b + 1}`,
      comment: 'Prefix ++b increments memory FIRST, then yields the new value'
    },
    {
      label: '3. Multiplications (High Precedence)',
      expr: `result = ${a * 2} + ${(b + 1) * 3};`,
      aState: `a = ${a + 1}`,
      bState: `b = ${b + 1}`,
      comment: 'Arithmetic multiplication (*) has higher precedence than addition (+)'
    },
    {
      label: '4. Final Addition',
      expr: `result = ${a * 2 + (b + 1) * 3};`,
      aState: `a = ${a + 1}`,
      bState: `b = ${b + 1}`,
      comment: `Final computed result: ${a * 2 + (b + 1) * 3}`
    }
  ];

  const current = steps[evalStep];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Operator Precedence & Evaluation Visualizer</h3>
            <p className="text-xs text-slate-400">Step through order-of-operations, increment semantics, and register state</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEvalStep(Math.max(0, evalStep - 1))}
            disabled={evalStep === 0}
            className="px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setEvalStep(Math.min(steps.length - 1, evalStep + 1))}
            disabled={evalStep === steps.length - 1}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-cyan-500 text-slate-950 disabled:opacity-40"
          >
            Next Step
          </button>
          <button
            onClick={() => setEvalStep(0)}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Variables Chamber */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-[10px] text-slate-400">Variable a</div>
          <div className="text-sm font-mono font-bold text-cyan-400">{current.aState}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-[10px] text-slate-400">Variable b</div>
          <div className="text-sm font-mono font-bold text-amber-400">{current.bState}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 sm:col-span-2">
          <div className="text-[10px] text-slate-400">Evaluation Phase</div>
          <div className="text-xs font-bold text-white truncate">{current.label}</div>
        </div>
      </div>

      {/* Expression Display */}
      <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 font-mono text-xs">
        <div className="text-slate-400 text-[11px] mb-1">Evaluating C statement:</div>
        <div className="text-cyan-300 text-sm font-bold">{current.expr}</div>
      </div>

      <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{current.comment}</span>
      </div>
    </div>
  );
};

// ============================================================================
// 4. C CALL STACK & RECURSION VISUALIZER (Stack Frames, Base Cases & Unwinding)
// ============================================================================
export const CCallStackVisualizer: React.FC = () => {
  const [n, setN] = useState<number>(4);
  const [currentStep, setCurrentStep] = useState<number>(0);

  // factorial trace steps for n = 4
  const trace = [
    { frame: 'main()', args: '-', status: 'Calling factorial(4)', returnVal: 'Waiting...' },
    { frame: 'factorial(4)', args: 'n = 4', status: '4 * factorial(3)', returnVal: 'Waiting...' },
    { frame: 'factorial(3)', args: 'n = 3', status: '3 * factorial(2)', returnVal: 'Waiting...' },
    { frame: 'factorial(2)', args: 'n = 2', status: '2 * factorial(1)', returnVal: 'Waiting...' },
    { frame: 'factorial(1)', args: 'n = 1', status: 'Base case reached (n <= 1)', returnVal: '1' },
    { frame: 'factorial(2)', args: 'n = 2', status: 'Unwinding: 2 * 1', returnVal: '2' },
    { frame: 'factorial(3)', args: 'n = 3', status: 'Unwinding: 3 * 2', returnVal: '6' },
    { frame: 'factorial(4)', args: 'n = 4', status: 'Unwinding: 4 * 6', returnVal: '24' },
    { frame: 'main()', args: '-', status: 'Result received', returnVal: '24' }
  ];

  const curr = trace[currentStep];
  const isBaseCase = currentStep === 4;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Layers className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Interactive Call Stack & Recursion Visualizer</h3>
            <p className="text-xs text-slate-400">Observe stack frame allocation, base case triggers, and stack unwinding</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40"
          >
            Step Back
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(trace.length - 1, currentStep + 1))}
            disabled={currentStep === trace.length - 1}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-500 text-white disabled:opacity-40"
          >
            Step Forward
          </button>
          <button
            onClick={() => setCurrentStep(0)}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Call Stack Visual Representation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stack Cylinder */}
        <div className="md:col-span-2 p-4 rounded-xl border border-dashed border-rose-500/40 bg-slate-950/70 min-h-[220px] flex flex-col-reverse gap-2">
          <div className="text-[10px] text-slate-500 font-mono text-center">Stack Base (Higher Memory 0x7fff...)</div>
          {trace.slice(0, Math.min(currentStep + 1, 5)).map((t, idx) => {
            const isTop = idx === Math.min(currentStep, 4);
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border font-mono text-xs flex items-center justify-between transition-all ${
                  isTop
                    ? 'border-rose-400 bg-rose-950/50 text-white shadow-lg shadow-rose-500/20 ring-1 ring-rose-400'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-800 text-[10px] text-slate-400 flex items-center justify-center font-bold">
                    #{idx}
                  </span>
                  <span className="font-bold text-rose-300">{t.frame}</span>
                  <span className="text-[11px] text-slate-400">({t.args})</span>
                </div>
                {isTop && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/30 text-rose-200">
                    Active Stack Frame
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Current State Details */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between text-xs font-mono space-y-3">
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Current Action</div>
            <div className="text-white font-bold">{curr.status}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Return Value</div>
            <div className="text-cyan-400 font-bold">{curr.returnVal}</div>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Phase</div>
            <div className={`font-bold ${currentStep <= 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {currentStep <= 4 ? 'Stack Frame Expansion (Push)' : 'Stack Unwinding (Pop & Return)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. C POINTER DEREFERENCE & ADDRESS VISUALIZER
// ============================================================================
export const CPointerDereferenceVisualizer: React.FC = () => {
  const [varValue, setVarValue] = useState<number>(42);
  const [derefMode, setDerefMode] = useState<boolean>(false);

  const varAddr = '0x7ffe42b0';
  const ptrAddr = '0x7ffe42b8';

  const handleIncrementThroughPointer = () => {
    setVarValue(prev => prev + 10);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Search className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Pointer Dereference & Address Inspector</h3>
            <p className="text-xs text-slate-400">See how pointer p holds &x and how *p accesses target memory</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleIncrementThroughPointer}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
          >
            <span>*ptr += 10</span>
          </button>
          <button
            onClick={() => setVarValue(42)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pointer Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Pointer Variable Card */}
        <div className="p-4 rounded-xl border border-purple-500/50 bg-slate-950/80 space-y-2 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-purple-400">Pointer: int *ptr</span>
            <span className="text-[10px] font-mono text-slate-400">Location: {ptrAddr}</span>
          </div>
          <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/40 text-center">
            <div className="text-[10px] text-purple-300 font-mono">Stored Memory Value (&x)</div>
            <div className="text-sm font-mono font-bold text-cyan-300">{varAddr}</div>
          </div>
          <div className="text-[11px] text-slate-400">
            Size: 8 bytes (64-bit memory address)
          </div>
        </div>

        {/* Target Variable Card */}
        <div className="p-4 rounded-xl border border-cyan-500/50 bg-slate-950/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400">Target: int x</span>
            <span className="text-[10px] font-mono text-slate-400">Address: {varAddr}</span>
          </div>
          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/40 text-center">
            <div className="text-[10px] text-cyan-300 font-mono">Stored Value (*ptr)</div>
            <div className="text-lg font-mono font-bold text-white">{varValue}</div>
          </div>
          <div className="text-[11px] text-slate-400">
            Size: 4 bytes (int)
          </div>
        </div>
      </div>

      {/* Interactive Explanation */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
        <div><span className="text-purple-400">int x = {varValue};</span> // Variable allocated at {varAddr}</div>
        <div><span className="text-purple-400">int *ptr = &x;</span>   // ptr stores address {varAddr}</div>
        <div><span className="text-cyan-400">*ptr = {varValue};</span>     // Dereferencing ptr modifies x directly in memory</div>
      </div>
    </div>
  );
};

// ============================================================================
// 6. C DYNAMIC MEMORY ALLOCATION (Stack vs Heap, malloc & free)
// ============================================================================
export const CDynamicMemoryVisualizer: React.FC = () => {
  const [allocatedSize, setAllocatedSize] = useState<number>(3);
  const [isFreed, setIsFreed] = useState<boolean>(false);
  const [leakWarning, setLeakWarning] = useState<boolean>(false);

  const handleAllocate = (size: number) => {
    setAllocatedSize(size);
    setIsFreed(false);
    setLeakWarning(false);
  };

  const handleFree = () => {
    setIsFreed(true);
    setLeakWarning(false);
  };

  const handleSimulateLeak = () => {
    setLeakWarning(true);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HardDrive className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Dynamic Memory: Stack vs. Heap Visualizer</h3>
            <p className="text-xs text-slate-400">Inspect malloc(), realloc(), free(), and memory leak detection</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAllocate(allocatedSize === 3 ? 5 : 3)}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            {allocatedSize === 3 ? 'realloc(5)' : 'realloc(3)'}
          </button>
          <button
            onClick={handleFree}
            disabled={isFreed}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 transition-colors"
          >
            free(ptr)
          </button>
          <button
            onClick={handleSimulateLeak}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors"
          >
            Simulate Leak
          </button>
        </div>
      </div>

      {/* Heap Memory Arena */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Heap Space Allocation (malloc / calloc)</span>
          <span className="font-mono text-emerald-400">
            {isFreed ? 'Deallocated (Free List)' : `${allocatedSize * 4} bytes active`}
          </span>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, idx) => {
            const inRange = idx < allocatedSize;
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-center font-mono transition-all ${
                  isFreed
                    ? 'border-slate-800 bg-slate-950/40 text-slate-600'
                    : inRange
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500/40'
                    : 'border-slate-800 bg-slate-950/40 text-slate-600'
                }`}
              >
                <div className="text-[10px] text-slate-400">Index [{idx}]</div>
                <div className="text-xs font-bold my-1">
                  {isFreed ? 'FREED' : inRange ? `val_${idx * 10}` : '--'}
                </div>
                <div className="text-[9px] text-slate-400">0x{(0x9000 + idx * 4).toString(16)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {leakWarning && (
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/50 text-xs text-amber-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Memory Leak Detected:</strong> ptr pointer fell out of scope without calling free(). {allocatedSize * 4} bytes remain leaked in heap memory until process termination!
          </span>
        </div>
      )}

      {isFreed && (
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Memory Freed Safely:</strong> Chunk returned to OS free list. Set <code className="font-mono">ptr = NULL;</code> to eliminate dangling pointer hazards.
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 7. C STRUCT VS UNION MEMORY LAYOUT VISUALIZER
// ============================================================================
export const CStructUnionVisualizer: React.FC = () => {
  const [mode, setMode] = useState<'struct' | 'union'>('struct');

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Database className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Struct vs. Union Memory Layout Comparison</h3>
            <p className="text-xs text-slate-400">Compare sequential struct offsets with overlapping union memory addresses</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMode('struct')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              mode === 'struct' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            struct Student
          </button>
          <button
            onClick={() => setMode('union')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              mode === 'union' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            union Data
          </button>
        </div>
      </div>

      {mode === 'struct' ? (
        <div className="space-y-3">
          <div className="text-xs text-slate-300">
            In a <strong className="text-cyan-400">struct</strong>, each field receives its own distinct memory offset. Total size = sum of fields + padding bytes.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-cyan-500/60 bg-slate-950/80 font-mono text-xs">
              <div className="text-cyan-400 font-bold">int id (4B)</div>
              <div className="text-slate-400 text-[10px]">Offset: +0 bytes</div>
              <div className="text-slate-400 text-[10px]">Address: 0x1000 - 0x1003</div>
            </div>
            <div className="p-3 rounded-xl border border-purple-500/60 bg-slate-950/80 font-mono text-xs">
              <div className="text-purple-400 font-bold">char grade (1B + 3 pad)</div>
              <div className="text-slate-400 text-[10px]">Offset: +4 bytes</div>
              <div className="text-slate-400 text-[10px]">Address: 0x1004 - 0x1007</div>
            </div>
            <div className="p-3 rounded-xl border border-amber-500/60 bg-slate-950/80 font-mono text-xs">
              <div className="text-amber-400 font-bold">double gpa (8B)</div>
              <div className="text-slate-400 text-[10px]">Offset: +8 bytes</div>
              <div className="text-slate-400 text-[10px]">Address: 0x1008 - 0x100F</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 text-center">
            Total sizeof(struct Student) = 16 bytes (aligned to 8-byte boundary)
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-slate-300">
            In a <strong className="text-cyan-400">union</strong>, all fields share the exact same starting memory address (offset 0x00). Size = size of the largest field.
          </div>
          <div className="p-4 rounded-xl border border-purple-500/60 bg-slate-950/80 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-purple-300 font-bold">Shared Memory Arena (Base: 0x2000)</span>
              <span className="text-cyan-400 font-bold">Max Size: 8 bytes</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 rounded bg-purple-950/30 border border-purple-500/30">
                <span className="font-bold text-white">int i_val</span> (uses first 4 bytes)
              </div>
              <div className="p-2 rounded bg-purple-950/30 border border-purple-500/30">
                <span className="font-bold text-white">char c_val</span> (uses first 1 byte)
              </div>
              <div className="p-2 rounded bg-purple-950/30 border border-purple-500/30">
                <span className="font-bold text-white">double d_val</span> (uses all 8 bytes)
              </div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-purple-300 text-center">
            Total sizeof(union Data) = 8 bytes (only 1 active value at a time!)
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 8. FINAL MINI PROJECT: STUDENT RECORD SYSTEM SIMULATOR (Topic 16)
// ============================================================================
export const StudentRecordSystemVisualizer: React.FC = () => {
  const [students, setStudents] = useState<Array<{ id: number; name: string; marks: number; grade: string }>>([
    { id: 101, name: 'Alice Chen', marks: 92, grade: 'A' },
    { id: 102, name: 'Marcus Brody', marks: 78, grade: 'B' },
    { id: 103, name: 'Elena Rostova', marks: 85, grade: 'A' }
  ]);
  const [statusMsg, setStatusMsg] = useState<string>('System initialized. Ready for operations.');

  const handleAddSample = () => {
    const nextId = 101 + students.length;
    const newStudent = { id: nextId, name: `Student ${nextId}`, marks: 88, grade: 'A' };
    setStudents([...students, newStudent]);
    setStatusMsg(`Record #${nextId} inserted successfully into in-memory array.`);
  };

  const handleComputeAverage = () => {
    const sum = students.reduce((acc, s) => acc + s.marks, 0);
    const avg = (sum / students.length).toFixed(1);
    setStatusMsg(`Calculated class average: ${avg}% across ${students.length} student records.`);
  };

  const handleSaveSimulation = () => {
    setStatusMsg(`Writing ${students.length} binary records to students.dat via fwrite(). Flush complete.`);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Terminal className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Student Record Management Simulator (C Capstone)</h3>
            <p className="text-xs text-slate-400">Interactive live simulation of the Lesson 16 Capstone Project</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddSample}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Student
          </button>
          <button
            onClick={handleComputeAverage}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 transition-all"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" /> Calc Avg
          </button>
          <button
            onClick={handleSaveSimulation}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
          >
            <Save className="w-3.5 h-3.5" /> Save File
          </button>
        </div>
      </div>

      {/* Terminal Status Output */}
      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>[CLI Output]: {statusMsg}</span>
      </div>

      {/* In-Memory Struct Records Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Full Name</th>
              <th className="p-3">Score / 100</th>
              <th className="p-3">Grade</th>
              <th className="p-3">Memory Offset</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {students.map((st, idx) => (
              <tr key={st.id} className="hover:bg-slate-900/40">
                <td className="p-3 text-cyan-400 font-bold">#{st.id}</td>
                <td className="p-3 text-white">{st.name}</td>
                <td className="p-3 text-amber-300">{st.marks}%</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    {st.grade}
                  </span>
                </td>
                <td className="p-3 text-slate-500 text-[10px]">
                  0x{(0x4000 + idx * 64).toString(16)} (64B struct)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
