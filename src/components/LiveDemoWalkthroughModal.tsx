import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Brain,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Code2,
  FileText,
  TrendingUp,
  X,
  Layers,
  Database,
  Bot
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveDemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTopic: (topicId: string) => void;
}

export const LiveDemoWalkthroughModal: React.FC<LiveDemoWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTopic
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [realPrediction, setRealPrediction] = useState<any | null>(null);

  if (!isOpen) return null;

  const totalSteps = 7;

  // Auto-play stepper
  useEffect(() => {
    let timer: any;
    if (isPlaying && currentStep < totalSteps) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 4000);
    } else if (currentStep === totalSteps) {
      setIsPlaying(false);
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const stepsData = [
    {
      step: 1,
      title: '1. Learner Focus: Python Functions',
      badge: 'TOPIC SELECTION',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      description: 'Learner begins the study session on Python Functions, Parameters & Return Scope.',
      stateVisual: {
        language: 'Python',
        level: 'Beginner',
        topic: 'Functions, Parameters & Return Scope (top-py-functions)',
        telemetry: 'Active session started • Timer initialized'
      },
      loopHighlight: 'Learner & Content'
    },
    {
      step: 2,
      title: '2. Behavior Ingestion & Initial Assessment',
      badge: 'OBSERVABLE TELEMETRY',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: 'Learner struggles with parameter scoping and makes repeated mistakes on the quiz.',
      stateVisual: {
        scroll_time: '185 seconds (prolonged dwell)',
        revisit_count: '4 section revisits',
        hints_requested: '3 hint requests',
        quiz_score: '33% (Poor performance on scoping)',
        coding_friction: 'High pause duration before keystrokes'
      },
      loopHighlight: 'Interaction & Telemetry Ingestion'
    },
    {
      step: 3,
      title: '3. ML Inference: HIGH Cognitive Load',
      badge: 'RANDOM FOREST CLASSIFIER',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      description: 'Supervised ML model evaluates the 14 telemetry features and identifies cognitive overload.',
      stateVisual: {
        prediction: 'HIGH',
        confidence: '94.2%',
        top_factors: [
          'High dwell time (185s > 60s baseline)',
          'Low MCQ initial accuracy (33%)',
          'Multiple hint requests (3)'
        ],
        adaptive_decision: 'ACTION: SIMPLIFY • DEPTH: 1 (Micro-Steps)'
      },
      loopHighlight: 'Feature Engineering & ML Prediction'
    },
    {
      step: 4,
      title: '4. Adaptive Engine + RAG Knowledge Retrieval',
      badge: 'SEMANTIC VECTOR SEARCH',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      description: 'Adaptive Engine triggers content simplification. RAG retrieves grounded knowledge chunks with exact citations.',
      stateVisual: {
        retrieved_concepts: [
          'Function Parameters (positional vs keyword)',
          'Return Values (exiting & sending output)',
          'Real-World Analogy (kitchen blender / vending machine)'
        ],
        source: 'ml_service/knowledge_base/python/beginner_functions.json',
        citation_confidence: '98.5% semantic match'
      },
      loopHighlight: 'Adaptive Engine & RAG Retrieval'
    },
    {
      step: 5,
      title: '5. LLM Tutor Generates Plain Analogy',
      badge: 'COGNITIVE CONDITIONING',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      description: 'Conditioned on HIGH load, the AI tutor presents simplified micro-steps and plain intuition.',
      stateVisual: {
        tutor_mode: 'SIMPLIFY',
        explanation: 'Think of a function like a vending machine! You insert coins and select an item (parameters/inputs), the machine dispenses your snack (return value), and you can use it anytime without needing to know the internal wiring.',
        key_takeaway: 'Parameters = Inputs | return = Output'
      },
      loopHighlight: 'LLM Cognitive Synthesis'
    },
    {
      step: 6,
      title: '6. Retake Quiz & Performance Surge',
      badge: 'CLOSED-LOOP FEEDBACK',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      description: 'Learner retakes assessment after simplified explanation; score jumps from 33% to 90%!',
      stateVisual: {
        new_quiz_score: '90% (+57% improvement)',
        coding_challenge: 'Passed all 4 test cases (100%)',
        new_ml_prediction: 'MEDIUM → LOW (Confidence 96%)',
        adaptive_state: 'Optimal Flow Achieved'
      },
      loopHighlight: 'Assessment & New Behavior Data'
    },
    {
      step: 7,
      title: '7. Final Recommendation: Continue to Recursion',
      badge: 'CURRICULUM PROGRESSION',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'With cognitive load now LOW and concept retention validated, the engine promotes the learner to Recursion.',
      stateVisual: {
        recommendation: 'Continue to Recursion and Recursive Thinking (top-py-recursion)',
        reason: 'Functions and parameter scope successfully mastered. Ready for recursive call decomposition!',
        closed_loop_status: 'Complete End-to-End Adaptive Loop Validated'
      },
      loopHighlight: 'ML Again & Pedagogical Recommendation'
    }
  ];

  const currentData = stepsData[currentStep - 1];

  const handleGoToRecursion = () => {
    onNavigateToTopic('top-py-recursion');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Real-Time Adaptive Closed-Loop Session
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Section 117 Demo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live interactive walkthrough demonstrating ML inference, RAG retrieval, and adaptive decisions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Closed-Loop Visual Breadcrumb */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between overflow-x-auto text-[11px] gap-2">
          {[
            { id: 1, label: 'Learner' },
            { id: 2, label: 'Behavior' },
            { id: 3, label: 'ML High' },
            { id: 4, label: 'RAG Retrieval' },
            { id: 5, label: 'LLM Simplify' },
            { id: 6, label: 'Improvement' },
            { id: 7, label: 'Recursion Rec' }
          ].map(s => {
            const isCurrent = currentStep === s.id;
            const isPast = currentStep > s.id;
            return (
              <div
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : isPast
                    ? 'text-emerald-400 hover:bg-slate-900 font-medium'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {isPast ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                    {s.id}
                  </span>
                )}
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Step Title & Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-1.5 ${currentData.badgeColor}`}>
                {currentData.badge}
              </span>
              <h3 className="text-xl font-extrabold text-white">
                {currentData.title}
              </h3>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Loop Node: <span className="text-cyan-400 font-semibold">{currentData.loopHighlight}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {currentData.description}
          </p>

          {/* Interactive State Box */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-3 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800 font-sans font-semibold">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Live System Telemetry & ML State
              </span>
              <span className="text-slate-500 font-mono">Session: Alex • Python Track</span>
            </div>

            <div className="space-y-2 text-slate-200">
              {Object.entries(currentData.stateVisual).map(([key, val]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 py-1 border-b border-slate-900/60">
                  <span className="text-slate-400 capitalize text-[11px]">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  {Array.isArray(val) ? (
                    <div className="text-left sm:text-right space-y-0.5">
                      {val.map((item, idx) => (
                        <div key={idx} className="text-amber-300 text-[11px]">{item}</div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-left sm:text-right text-cyan-300 font-semibold text-[11px] max-w-md break-words">
                      {String(val)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 7 Call-to-action */}
          {currentStep === 7 && (
            <div className="p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-emerald-400 mb-1">
                  Ready to test the live platform?
                </h4>
                <p className="text-xs text-slate-300">
                  Click below to open the Recursion topic and experience the full curriculum live!
                </p>
              </div>
              <button
                onClick={handleGoToRecursion}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0"
              >
                <span>Continue to Recursion</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Controls Footer */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-slate-900/90">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {/* Center: Auto-play toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isPlaying ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Pause Auto-Play</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                <span>Auto-Play Sequence</span>
              </>
            )}
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Demo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
