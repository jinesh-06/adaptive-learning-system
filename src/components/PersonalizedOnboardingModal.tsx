import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  Compass,
  GraduationCap,
  Briefcase,
  Code2,
  Trophy,
  BrainCircuit,
  HelpCircle,
  X
} from 'lucide-react';

interface PersonalizedOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDiagnostic: (language: string) => void;
  onCompleteOnboarding: (language: string, level: string) => void;
}

export const PersonalizedOnboardingModal: React.FC<PersonalizedOnboardingModalProps> = ({
  isOpen,
  onClose,
  onStartDiagnostic,
  onCompleteOnboarding
}) => {
  const { preferences, updateLanguage, updateLevel } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(preferences.selected_language || 'python');
  const [experience, setExperience] = useState<string>('beginner');
  const [goal, setGoal] = useState<string>('career');

  if (!isOpen) return null;

  const languages = [
    { id: 'python', name: 'Python', icon: '🐍', tag: 'Data & Automation', desc: 'Syntax clarity, rich libraries, rapid mastery' },
    { id: 'c', name: 'C Language', icon: '⚡', tag: 'Systems & Hardware', desc: 'Pointers, low-level memory, core foundations' },
    { id: 'cpp', name: 'C++', icon: '🚀', tag: 'Performance & Games', desc: 'OOP, STL, RAII, ultra high-speed architecture' },
    { id: 'java', name: 'Java', icon: '☕', tag: 'Enterprise & Android', desc: 'Robust OOP, JVM cross-platform, enterprise design' }
  ];

  const experienceLevels = [
    { id: 'beginner', title: 'Complete Beginner', desc: 'No previous coding experience. Start from zero.' },
    { id: 'some_experience', title: 'Some Experience', desc: 'Know basics like variables and simple conditions.' },
    { id: 'intermediate', title: 'Intermediate', desc: 'Comfortable with loops, functions, and arrays.' },
    { id: 'advanced', title: 'Advanced', desc: 'Proficient in algorithms, data structures, and OOP.' }
  ];

  const goals = [
    { id: 'college', title: 'College & University', icon: GraduationCap, desc: 'Ace coursework, lab assignments, and semester exams' },
    { id: 'interview', title: 'Tech Job Interviews', icon: Briefcase, desc: 'Master coding interviews, problem solving, and system questions' },
    { id: 'projects', title: 'Building Real Projects', icon: Code2, desc: 'Create full-stack applications, automations, and utilities' },
    { id: 'competitive_programming', title: 'Competitive Programming', icon: Trophy, desc: 'Optimize time complexity and solve competitive puzzles' },
    { id: 'career', title: 'Software Engineering Career', icon: Compass, desc: 'Comprehensive foundational roadmap for software developers' },
    { id: 'general_learning', title: 'General Curiosity', icon: Sparkles, desc: 'Learn programming fundamentals at a steady, enjoyable pace' }
  ];

  const handleFinishWithoutDiagnostic = () => {
    let initialLevel = 'beginner';
    if (experience === 'intermediate') initialLevel = 'intermediate';
    if (experience === 'advanced') initialLevel = 'advanced';

    updateLanguage(selectedLanguage);
    updateLevel(initialLevel);
    onCompleteOnboarding(selectedLanguage, initialLevel);
    onClose();
  };

  const handleLaunchDiagnostic = () => {
    updateLanguage(selectedLanguage);
    onStartDiagnostic(selectedLanguage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with step progress */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Personalized Learner Setup</h2>
              <p className="text-xs text-slate-400">Step {step} of 4 • Tailoring your intelligent learning path</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step ? 'w-6 bg-cyan-400' : s < step ? 'w-3 bg-cyan-600' : 'w-2 bg-slate-800'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 ml-2"
              aria-label="Close onboarding"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: CHOOSE LANGUAGE */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">What do you want to learn?</h3>
                <p className="text-xs text-slate-400">
                  Select your primary language. You can easily switch or add others anytime.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {languages.map(lang => {
                  const isSelected = selectedLanguage === lang.id;
                  return (
                    <div
                      key={lang.id}
                      onClick={() => setSelectedLanguage(lang.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{lang.icon}</span>
                          <span className="font-bold text-sm text-white">{lang.name}</span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 mb-1.5">
                        {lang.tag}
                      </span>
                      <p className="text-xs text-slate-400 leading-relaxed">{lang.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: EXPERIENCE LEVEL */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">What is your current coding experience?</h3>
                <p className="text-xs text-slate-400">
                  This helps us configure initial problem difficulty and lesson detail.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {experienceLevels.map(lvl => {
                  const isSelected = experience === lvl.id;
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => setExperience(lvl.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10 shadow-md shadow-cyan-500/10'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white mb-0.5">{lvl.title}</h4>
                        <p className="text-xs text-slate-400">{lvl.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-cyan-500 bg-cyan-500 text-slate-950' : 'border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: LEARNING GOAL */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">What is your primary goal?</h3>
                <p className="text-xs text-slate-400">
                  We customize your project recommendations and assessment challenges toward your objective.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {goals.map(g => {
                  const isSelected = goal === g.id;
                  const Icon = g.icon;
                  return (
                    <div
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10 shadow-md shadow-cyan-500/10'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                            <Icon className="w-4 h-4" />
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{g.title}</h4>
                        <p className="text-xs text-slate-400 leading-snug">{g.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: DIAGNOSTIC CHOICE & STARTING POINT */}
          {step === 4 && (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                <BrainCircuit className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white mb-2">How would you like to start?</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  You can take an optional 5-minute diagnostic test to pinpoint your exact baseline, or jump straight into the recommended curriculum.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
                {/* Option 1: Diagnostic */}
                <div
                  onClick={handleLaunchDiagnostic}
                  className="p-5 rounded-2xl border border-cyan-500/50 bg-gradient-to-b from-cyan-950/30 to-slate-900/90 hover:border-cyan-400 cursor-pointer transition-all shadow-lg shadow-cyan-500/10 flex flex-col justify-between group"
                >
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 mb-2">
                      Recommended
                    </span>
                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                      Diagnostic Test
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      Evaluates concept knowledge, problem solving, and coding ability (10–15 questions).
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                    <span>Take Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Option 2: Direct Roadmap */}
                <div
                  onClick={handleFinishWithoutDiagnostic}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 mb-2">
                      Fast Track
                    </span>
                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-slate-200 transition-colors">
                      Start at {experience === 'beginner' ? 'Beginner' : experience === 'intermediate' ? 'Intermediate' : 'Advanced'} Level
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      Begin directly with the foundational roadmap. You can change levels anytime.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 group-hover:text-white">
                    <span>Jump to Curriculum</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>You are never permanently locked into any level; you can adjust anytime.</span>
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 && (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
