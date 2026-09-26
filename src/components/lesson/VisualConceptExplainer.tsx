import React, { useState } from 'react';
import { Eye, Layers, ArrowRight, RefreshCw, Box, Check, X, ShieldAlert } from 'lucide-react';

export interface VisualConceptExplainerProps {
  topicId?: string;
  topicTitle?: string;
}

export const VisualConceptExplainer: React.FC<VisualConceptExplainerProps> = ({
  topicId = 'top-py-fundamentals',
  topicTitle = 'Datatypes & Immutability'
}) => {
  // Interactive state for the visual simulation
  const [step, setStep] = useState<number>(0);

  // Simulation steps for Python Object References and Immutability
  const steps = [
    {
      title: 'Step 1: Creating variable a = 100',
      description: 'Python creates an integer object 100 in heap memory and assigns variable "a" as a reference tag pointing to it.',
      variableA: { name: 'a', targetAddr: '0x10A4', val: '100' },
      variableB: null,
      heapObjects: [
        { addr: '0x10A4', type: 'int', val: '100', refCount: 1, isTargetA: true, isTargetB: false }
      ]
    },
    {
      title: 'Step 2: Assigning b = a (Reference Sharing)',
      description: 'Python does NOT make a duplicate copy of 100. Instead, "b" points to the exact same memory address (0x10A4). Notice `a is b` evaluates to True!',
      variableA: { name: 'a', targetAddr: '0x10A4', val: '100' },
      variableB: { name: 'b', targetAddr: '0x10A4', val: '100' },
      heapObjects: [
        { addr: '0x10A4', type: 'int', val: '100', refCount: 2, isTargetA: true, isTargetB: true }
      ]
    },
    {
      title: 'Step 3: Rebinding a = a + 1 (Immutability in Action)',
      description: 'Because integers are immutable, Python CANNOT change 100 to 101 in-place. It allocates a BRAND NEW object 101 at 0x20C8 and rebinds "a" to it! Variable "b" still refers to 100.',
      variableA: { name: 'a', targetAddr: '0x20C8', val: '101' },
      variableB: { name: 'b', targetAddr: '0x10A4', val: '100' },
      heapObjects: [
        { addr: '0x10A4', type: 'int', val: '100', refCount: 1, isTargetA: false, isTargetB: true },
        { addr: '0x20C8', type: 'int', val: '101', refCount: 1, isTargetA: true, isTargetB: false }
      ]
    }
  ];

  const currentStep = steps[step];

  return (
    <div
      id="section-visual"
      className="rounded-2xl border border-slate-800 light-theme:border-slate-300 bg-slate-900/40 light-theme:bg-white p-5 sm:p-6 shadow-sm space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 light-theme:border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 light-theme:bg-indigo-100 light-theme:text-indigo-600">
            <Eye className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white light-theme:text-slate-900">
              Visual Conceptual Model: Object References & Memory
            </h3>
            <p className="text-[11px] text-slate-400 light-theme:text-slate-500">
              Interactive demonstration of how variables act as pointer tags in memory
            </p>
          </div>
        </div>

        {/* Step controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setStep(idx)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                step === idx
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 light-theme:bg-slate-100 text-slate-400 hover:text-white light-theme:hover:text-slate-900'
              }`}
            >
              Step {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setStep((step + 1) % steps.length)}
            className="p-1 rounded-lg bg-slate-800 light-theme:bg-slate-200 text-slate-300 light-theme:text-slate-700 hover:text-white"
            title="Next Step"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Explanatory text for the current step */}
      <div className="p-3 rounded-xl bg-indigo-950/20 light-theme:bg-indigo-50/70 border border-indigo-500/20 text-xs leading-relaxed text-indigo-200 light-theme:text-indigo-900">
        <strong className="block font-bold mb-0.5">{currentStep.title}</strong>
        {currentStep.description}
      </div>

      {/* Visual Diagram Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 light-theme:bg-slate-50 border border-slate-800/80 light-theme:border-slate-200">
        {/* Left Column: Stack / Namespace Tags */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 light-theme:text-slate-600 border-b border-slate-800 light-theme:border-slate-200 pb-1.5">
            <span>Namespace (Variables / Names)</span>
            <span className="text-[10px] text-cyan-400 light-theme:text-blue-600">Tags / Labels</span>
          </div>

          <div className="space-y-2.5">
            {/* Variable A */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 light-theme:bg-white border-2 border-cyan-500/50 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 light-theme:text-blue-700 font-mono font-bold flex items-center justify-center text-xs">
                  a
                </span>
                <span className="text-xs text-slate-300 light-theme:text-slate-700 font-medium">Variable "a"</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-400 light-theme:text-blue-600 font-bold">
                <span>points to</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                <span className="px-1.5 py-0.5 rounded bg-slate-800 light-theme:bg-slate-100 text-[11px]">
                  {currentStep.variableA.targetAddr}
                </span>
              </div>
            </div>

            {/* Variable B if active */}
            {currentStep.variableB ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 light-theme:bg-white border-2 border-purple-500/50 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 light-theme:text-purple-700 font-mono font-bold flex items-center justify-center text-xs">
                    b
                  </span>
                  <span className="text-xs text-slate-300 light-theme:text-slate-700 font-medium">Variable "b"</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs text-purple-400 light-theme:text-purple-600 font-bold">
                  <span>points to</span>
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 light-theme:bg-slate-100 text-[11px]">
                    {currentStep.variableB.targetAddr}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-slate-800 light-theme:border-slate-300 text-center text-slate-600 light-theme:text-slate-400 text-xs">
                (Variable "b" not yet declared)
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Heap Memory Objects */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 light-theme:text-slate-600 border-b border-slate-800 light-theme:border-slate-200 pb-1.5">
            <span>Heap Memory (Python Objects)</span>
            <span className="text-[10px] text-emerald-400">Allocated Memory</span>
          </div>

          <div className="space-y-2.5">
            {currentStep.heapObjects.map(obj => (
              <div
                key={obj.addr}
                className={`p-3 rounded-xl border transition-all ${
                  obj.isTargetA && obj.isTargetB
                    ? 'border-indigo-500 bg-indigo-950/30 light-theme:bg-indigo-50 shadow-md'
                    : obj.isTargetA
                    ? 'border-cyan-500 bg-cyan-950/30 light-theme:bg-cyan-50 shadow-md'
                    : 'border-purple-500 bg-purple-950/30 light-theme:bg-purple-50 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                  <span className="font-bold text-slate-200 light-theme:text-slate-800 flex items-center gap-1">
                    <Box className="w-3.5 h-3.5" />
                    type: {obj.type}
                  </span>
                  <span className="text-[10px] text-slate-500">addr: {obj.addr}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold font-mono text-white light-theme:text-slate-900">
                    value = {obj.val}
                  </div>
                  <div className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 light-theme:bg-slate-200 text-slate-400 font-mono">
                    Ref Count: {obj.refCount}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-800/60 light-theme:border-slate-200 text-[10px] font-mono">
                  <span className="text-slate-500">Referenced by:</span>
                  {obj.isTargetA && (
                    <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">var a</span>
                  )}
                  {obj.isTargetB && (
                    <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">var b</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mutability Matrix Quick Reference */}
      <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/60 light-theme:bg-slate-100 border border-slate-800 light-theme:border-slate-200">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400 light-theme:text-emerald-700 mb-1">
            <Check className="w-3.5 h-3.5" />
            Immutable Types (Safe / Unchangeable)
          </div>
          <p className="text-[11px] text-slate-400 light-theme:text-slate-600">
            int, float, complex, bool, str, tuple, frozenset, bytes
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 light-theme:bg-slate-100 border border-slate-800 light-theme:border-slate-200">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 light-theme:text-amber-700 mb-1">
            <Layers className="w-3.5 h-3.5" />
            Mutable Types (Can modify in-place)
          </div>
          <p className="text-[11px] text-slate-400 light-theme:text-slate-600">
            list, dict, set, bytearray
          </p>
        </div>
      </div>
    </div>
  );
};
