import React, { useEffect, useState } from 'react';
import { BookOpen, HelpCircle, Terminal, CheckCircle2, ChevronRight, Sparkles, Brain } from 'lucide-react';
import { useCognitive } from '../context/CognitiveContext';
import { api } from '../services/api';

export type LearningStep = 'lesson' | 'quiz' | 'coding';

interface TopicLearningStepperProps {
  currentStep: LearningStep;
  topicId: string;
  onNavigateStep: (step: LearningStep) => void;
  onBackToCurriculum?: () => void;
}

export const TopicLearningStepper: React.FC<TopicLearningStepperProps> = ({
  currentStep,
  topicId,
  onNavigateStep,
  onBackToCurriculum
}) => {
  const { currentLoad } = useCognitive();
  const [topicTitle, setTopicTitle] = useState<string>('Loading topic...');
  const [topicLanguage, setTopicLanguage] = useState<string>('python');

  useEffect(() => {
    let mounted = true;
    api.getTopicDetail(topicId)
      .then(data => {
        if (mounted && data) {
          setTopicTitle(data.title || topicId);
          if (data.language) setTopicLanguage(data.language);
        }
      })
      .catch(() => {
        if (mounted) setTopicTitle(topicId);
      });
    return () => {
      mounted = false;
    };
  }, [topicId]);

  const steps = [
    {
      id: 'lesson' as LearningStep,
      number: '1',
      title: 'Learn Lesson',
      subtitle: 'Read concepts & syntax',
      icon: BookOpen,
      badge: 'Theory & Concepts'
    },
    {
      id: 'quiz' as LearningStep,
      number: '2',
      title: 'Practice Quiz',
      subtitle: 'Validate understanding',
      icon: HelpCircle,
      badge: 'Assessment'
    },
    {
      id: 'coding' as LearningStep,
      number: '3',
      title: 'Coding Challenge',
      subtitle: 'Solve in sandbox',
      icon: Terminal,
      badge: 'Hands-on Practice'
    }
  ];

  const getStepStatus = (stepId: LearningStep) => {
    if (stepId === currentStep) return 'current';
    if (currentStep === 'coding') {
      return 'completed';
    }
    if (currentStep === 'quiz' && stepId === 'lesson') {
      return 'completed';
    }
    return 'upcoming';
  };

  const loadBadge = {
    LOW: { label: 'Optimal Load', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    MEDIUM: { label: 'Balanced Load', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    HIGH: { label: 'Deep Focus Load', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' }
  }[currentLoad] || { label: 'Balanced', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Active Topic Breadcrumb & Info */}
        <div className="flex items-center gap-3">
          {onBackToCurriculum && (
            <button
              onClick={onBackToCurriculum}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition-colors"
              title="Return to curriculum"
            >
              ← All Courses
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-cyan-400">
                {topicLanguage} TRACK
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${loadBadge.color} flex items-center gap-1`}>
                <Brain className="w-2.5 h-2.5" />
                {loadBadge.label}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5 mt-0.5">
              <span>{topicTitle}</span>
            </h2>
          </div>
        </div>

        {/* Right: 3-Stage Progress Stepper */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {steps.map((step, idx) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;
            const isCurrent = status === 'current';
            const isCompleted = status === 'completed';

            return (
              <React.Fragment key={step.id}>
                {idx > 0 && (
                  <ChevronRight className={`w-3.5 h-3.5 ${isCompleted ? 'text-cyan-400' : 'text-slate-700'}`} />
                )}
                <button
                  onClick={() => onNavigateStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                    isCurrent
                      ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300 font-bold shadow-md shadow-cyan-500/10 scale-[1.02]'
                      : isCompleted
                      ? 'border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-700'
                      : 'border-slate-800/60 bg-slate-950/40 text-slate-500 hover:text-slate-400 hover:border-slate-800'
                  }`}
                  title={`${step.title}: ${step.subtitle}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : step.number}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-semibold text-xs leading-none">{step.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 hidden lg:block leading-none">{step.subtitle}</div>
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
