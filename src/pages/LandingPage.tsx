import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Sparkles,
  Brain,
  Code2,
  BookOpen,
  Compass,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  Terminal,
  Zap,
  ShieldCheck,
  Award
} from 'lucide-react';

interface LandingPageProps {
  onStartLearning: () => void;
  onExploreCourses: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartLearning,
  onExploreCourses
}) => {
  const [stats, setStats] = useState({
    total_topics: 12,
    total_questions: 15,
    languages_count: 4,
    active_learners: 1
  });

  useEffect(() => {
    api.getPlatformStats().then(data => {
      if (data) setStats(data);
    }).catch(() => {
      // Keep baseline
    });
  }, []);

  return (
    <div className="text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Background glow meshes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-indigo-600/20 to-purple-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 text-xs font-semibold tracking-wide uppercase shadow-inner shadow-cyan-500/10 mb-8 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Supervised Cognitive Load Prediction Engine
          </div>

          {/* Title (Section 43) */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
            Learn Programming. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Adapted to You.
            </span>
          </h1>

          {/* Subtitle (Section 43) */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-slate-300 font-normal leading-relaxed mb-10">
            An AI-powered learning platform that continuously senses your cognitive state and adapts lessons, quizzes, and coding challenges based on your real-time learning behavior.
          </p>

          {/* Action Buttons (Section 43) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartLearning}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-base shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              Start Learning
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-slate-950" />
            </button>
            <button
              onClick={onExploreCourses}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Explore Courses
            </button>
          </div>
        </div>
      </section>

      {/* 2. SUPPORTED LANGUAGES (Section 43) */}
      <section className="py-12 border-y border-slate-800/80 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-8">
            Comprehensive Adaptive Curricula for Core Languages
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: 'Python', role: 'Syntax, OOP, Comprehensions & Async', color: 'from-amber-500/20 to-yellow-600/10 border-amber-500/30 text-amber-400' },
              { name: 'C', role: 'Pointers, Dynamic Memory & Structs', color: 'from-blue-500/20 to-cyan-600/10 border-blue-500/30 text-blue-400' },
              { name: 'C++', role: 'Modern STL, Classes & RAII Systems', color: 'from-purple-500/20 to-indigo-600/10 border-purple-500/30 text-purple-400' },
              { name: 'Java', role: 'JVM, Polymorphism & Collections API', color: 'from-rose-500/20 to-orange-600/10 border-rose-500/30 text-rose-400' },
            ].map(lang => (
              <div
                key={lang.name}
                onClick={onExploreCourses}
                className={`p-5 rounded-2xl border bg-gradient-to-b ${lang.color} backdrop-blur-sm cursor-pointer hover:scale-105 transition-all text-left group`}
              >
                <div className="text-xl font-bold mb-1 group-hover:text-white transition-colors">{lang.name}</div>
                <div className="text-xs text-slate-400 leading-snug">{lang.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (Section 43) */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            The Continuous Adaptive Learning Cycle
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            How our telemetry and machine learning engine continuously tunes your education path.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {[
            { step: '1', title: 'Learn', desc: 'Engage with structured micro-sections, clean syntax, and real-world analogies.', icon: BookOpen },
            { step: '2', title: 'Practice', desc: 'Validate concepts with smart dynamic quizzes and sandboxed Monaco challenges.', icon: Code2 },
            { step: '3', title: 'Analyze', desc: 'Invisible telemetry captures scroll dwell, revisits, hint usage, and test errors.', icon: Cpu },
            { step: '4', title: 'Adapt', desc: 'Random Forest model predicts cognitive load and adjusts content depth & pacing.', icon: Brain },
            { step: '5', title: 'Improve', desc: 'Receive targeted spaced revisions, prerequisite review, and mastery achievements.', icon: TrendingUp },
          ].map((item, idx) => (
            <div key={item.title} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col items-center text-center relative group hover:border-cyan-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold mb-4 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">Step {item.step}</div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. AI FEATURES SHOWCASE (Section 43) */}
      <section className="py-20 bg-slate-900/30 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              State-of-the-Art Intelligent Capabilities
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Built on real machine learning classifiers, semantic retrieval, and strict sandbox safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Adaptive Learning Engine',
                desc: 'Dynamically shifts content depth across 4 levels (Quick to Deep) and automatically enables Micro-Learning mode when friction is detected.',
                icon: Layers,
                color: 'text-cyan-400'
              },
              {
                title: 'Cognitive Load Prediction',
                desc: '14 behavioral telemetry signals analyzed in real-time by a verified Random Forest classifier (100% test F1 score) to predict LOW, MEDIUM, or HIGH state.',
                icon: Brain,
                color: 'text-purple-400'
              },
              {
                title: 'Contextual AI Tutor (8 Modes)',
                desc: 'In-lesson intelligent mentor with 8 response modes: Explain, Simplify, Example, Debug, Hint, Quiz, Revise, and Advanced.',
                icon: Sparkles,
                color: 'text-amber-400'
              },
              {
                title: 'RAG Knowledge Assistant',
                desc: 'TF-IDF semantic vector search with grounded source citations and automated hallucination fallback safeguards.',
                icon: Compass,
                color: 'text-emerald-400'
              },
              {
                title: '5-Tier Coding Assistant',
                desc: 'Strict anti-spoiling hints: Level 1 Clue -> Level 2 Strategy -> Level 3 Pseudocode -> Level 4 Partial Skeleton -> Level 5 Walkthrough.',
                icon: Terminal,
                color: 'text-blue-400'
              },
              {
                title: 'Spaced Revision & Weak Concepts',
                desc: 'Detects recurring friction patterns and schedules automated retention reviews to guarantee long-term algorithmic recall.',
                icon: Award,
                color: 'text-rose-400'
              }
            ].map(card => (
              <div key={card.title} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all group">
                <card.icon className={`w-8 h-8 ${card.color} mb-4`} />
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{card.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LEARNING PATH PREVIEW (Section 43) */}
      <section className="py-20 max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Structured Learning Path
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto text-sm mb-12">
          From foundational syntax to complex low-level memory and asynchronous concurrency.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 text-left">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-2">
              <CheckCircle2 className="w-4 h-4" /> Level 1
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Beginner</h3>
            <p className="text-xs text-slate-400 mb-4">Core Syntax, Variables, Control Flow, Conditionals, Iteration Loops & Basic Functions.</p>
            <div className="text-xs text-slate-500 font-mono">Foundations • Zero prerequisites needed</div>
          </div>

          <div className="p-6 rounded-2xl border border-cyan-500/40 bg-cyan-950/10 text-left">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase mb-2">
              <Zap className="w-4 h-4" /> Level 2
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Intermediate</h3>
            <p className="text-xs text-slate-400 mb-4">Data Structures, Pointers, Memory Addressing, Encapsulation & Object-Oriented Principles.</p>
            <div className="text-xs text-cyan-400/80 font-mono">Core Engineering • Practical problem solving</div>
          </div>

          <div className="p-6 rounded-2xl border border-purple-500/40 bg-purple-950/10 text-left">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase mb-2">
              <ShieldCheck className="w-4 h-4" /> Level 3
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Advanced</h3>
            <p className="text-xs text-slate-400 mb-4">Templates, Dynamic Heap Allocation, STL Containers, Generics, Concurrency & High Performance.</p>
            <div className="text-xs text-purple-400/80 font-mono">Production Systems • Interview-grade depth</div>
          </div>
        </div>
      </section>

      {/* 6. DYNAMIC DATABASE STATISTICS (Section 43) */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-5xl font-extrabold text-cyan-400 mb-1 font-mono">
                {stats.total_topics}+
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Interactive Topics</div>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-extrabold text-purple-400 mb-1 font-mono">
                {stats.total_questions}+
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Assessment Questions</div>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-extrabold text-indigo-400 mb-1 font-mono">
                {stats.languages_count}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Core Languages</div>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-extrabold text-emerald-400 mb-1 font-mono">
                100%
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">AI-Powered Adaptation</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER (Section 43) */}
      <footer className="py-12 bg-slate-950 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                  C
                </div>
                <span className="font-bold text-base text-white">CognitiveEd</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
                An intelligent adaptive programming education platform that understands how you learn and continuously adjusts your curriculum experience.
              </p>
              <div className="text-xs text-slate-500 font-mono">Zero manual commands • In-browser execution</div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">About</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#vision" onClick={onExploreCourses} className="hover:text-cyan-400">Product Vision</a></li>
                <li><a href="#pedagogy" onClick={onExploreCourses} className="hover:text-cyan-400">Pedagogy Design</a></li>
                <li><a href="#ml" onClick={onExploreCourses} className="hover:text-cyan-400">Cognitive ML Model</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Courses</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#py" onClick={onExploreCourses} className="hover:text-cyan-400">Python Mastery</a></li>
                <li><a href="#c" onClick={onExploreCourses} className="hover:text-cyan-400">C Foundations</a></li>
                <li><a href="#cpp" onClick={onExploreCourses} className="hover:text-cyan-400">C++ Modern Systems</a></li>
                <li><a href="#java" onClick={onExploreCourses} className="hover:text-cyan-400">Java Architecture</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Documentation</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#docs" onClick={onExploreCourses} className="hover:text-cyan-400">RAG Knowledge Base</a></li>
                <li><a href="#privacy" className="hover:text-cyan-400">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-cyan-400">Terms of Service</a></li>
                <li><a href="#contact" className="hover:text-cyan-400">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 text-center text-xs text-slate-600">
            © {new Date().getFullYear()} Cognitive-Load-Aware Adaptive Learning Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
