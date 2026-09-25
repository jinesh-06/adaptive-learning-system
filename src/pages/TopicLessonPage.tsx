import React, { useEffect, useState, useRef } from 'react';
import { useCognitive } from '../context/CognitiveContext';
import { CognitiveLoadBanner } from '../components/CognitiveLoadBanner';
import { api } from '../services/api';
import { telemetry } from '../services/telemetry';
import {
  BookOpen,
  Code,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  Terminal,
  Layers,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Zap,
  HelpCircle as QuestionIcon,
  FileText
} from 'lucide-react';
import { BookmarkButton } from '../components/BookmarkButton';
import { QuickNoteModal } from '../components/QuickNoteModal';
import { TopicLearningStepper } from '../components/TopicLearningStepper';

interface TopicLessonPageProps {
  topicId: string;
  onStartQuiz: () => void;
  onOpenCoding: () => void;
  onBackToCatalog: () => void;
}

export const TopicLessonPage: React.FC<TopicLessonPageProps> = ({
  topicId,
  onStartQuiz,
  onOpenCoding,
  onBackToCatalog
}) => {
  const { contentMode, currentLoad, setActiveTopicId } = useCognitive();
  const [topic, setTopic] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Section 47: Subtopic Section Navigation & Progress
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>({});

  // Section 50: Micro-Learning Mode State
  const [microCheckAnswer, setMicroCheckAnswer] = useState<number | null>(null);
  const [microCheckSubmitted, setMicroCheckSubmitted] = useState(false);

  // Section 52 & 53: In-Lesson AI Tutor Action Bar
  const [aiTutorResponse, setAiTutorResponse] = useState<any | null>(null);
  const [aiTutorLoading, setAiTutorLoading] = useState(false);
  const [activeTutorMode, setActiveTutorMode] = useState<string | null>(null);

  // Section 79: User Feedback
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);

  // Section 112 & 113: Bookmarks & Quick Notes
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTopicId(topicId);
    telemetry.initTopicSession(topicId);

    // Load saved section position if available
    const savedPos = localStorage.getItem(`topic_section_${topicId}`);
    if (savedPos !== null) {
      setCurrentSectionIndex(parseInt(savedPos, 10) || 0);
    } else {
      setCurrentSectionIndex(0);
    }

    const loadTopic = async () => {
      setLoading(true);
      try {
        const data = await api.getTopicDetail(topicId);
        setTopic(data);
      } catch (err) {
        console.error('Failed to load topic:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTopic();

    return () => {
      telemetry.flushSession();
    };
  }, [topicId, setActiveTopicId]);

  // Track section navigation
  const handleNextSection = () => {
    if (!topic?.sections || currentSectionIndex >= topic.sections.length - 1) return;
    const nextIdx = currentSectionIndex + 1;
    setCurrentSectionIndex(nextIdx);
    localStorage.setItem(`topic_section_${topicId}`, nextIdx.toString());
    setMicroCheckAnswer(null);
    setMicroCheckSubmitted(false);
    setAiTutorResponse(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevSection = () => {
    if (currentSectionIndex <= 0) return;
    const prevIdx = currentSectionIndex - 1;
    setCurrentSectionIndex(prevIdx);
    localStorage.setItem(`topic_section_${topicId}`, prevIdx.toString());
    setMicroCheckAnswer(null);
    setMicroCheckSubmitted(false);
    setAiTutorResponse(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkComplete = () => {
    setCompletedSections(prev => ({ ...prev, [currentSectionIndex]: true }));
    handleNextSection();
  };

  // Trigger Contextual AI Tutor Mode (Section 52, 53)
  const handleAiTutorAction = async (mode: string, promptText: string) => {
    setActiveTutorMode(mode);
    setAiTutorLoading(true);
    setAiTutorResponse(null);

    try {
      const resp = await api.askAiAssistant({
        question: promptText,
        language: topic?.language || 'python',
        topic: topic?.title || 'Programming',
        topic_id: topicId,
        section_id: currentSection?.id,
        section_title: currentSection?.title,
        section_content: currentSection?.content,
        code_context: currentSection?.code_snippet,
        cognitive_load: currentLoad,
        tutor_mode: mode
      });
      setAiTutorResponse(resp);
    } catch (err) {
      console.error('AI Tutor request failed:', err);
    } finally {
      setAiTutorLoading(false);
    }
  };

  // User Feedback loop (Section 79)
  const handleFeedback = async (type: 'yes' | 'somewhat' | 'no') => {
    setFeedbackSent(type);
    try {
      await api.submitContentFeedback(topicId, type);
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400 animate-pulse">
        Loading topic syllabus and sections...
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Topic not found.
      </div>
    );
  }

  const sections = topic.sections && topic.sections.length > 0 ? topic.sections : [
    {
      id: 'default-1',
      title: '1. Core Conceptual Overview',
      order_index: 1,
      content: topic.content_standard,
      code_snippet: topic.syntax,
      pitfalls: topic.common_mistakes
    }
  ];

  const currentSection = sections[currentSectionIndex] || sections[0];
  const totalSections = sections.length;
  const progressPercent = Math.round(((currentSectionIndex + 1) / totalSections) * 100);

  // Content depth indicator (Section 49)
  const contentDepthVal = currentLoad === 'LOW' ? 1 : currentLoad === 'HIGH' ? 4 : 2;
  const contentDepthLabels = { 1: '1 (Quick)', 2: '2 (Normal)', 3: '3 (Detailed)', 4: '4 (Deep)' };

  // Section 50: Is Micro-Learning Active?
  const isMicroLearning = currentLoad === 'HIGH';

  return (
    <div ref={containerRef} className="space-y-6">
      {/* 3-STAGE LEARNING STEPPER: 1. Lesson -> 2. Quiz -> 3. Coding */}
      <TopicLearningStepper
        currentStep="lesson"
        topicId={topicId}
        onNavigateStep={(step) => {
          if (step === 'quiz') onStartQuiz();
          if (step === 'coding') onOpenCoding();
        }}
        onBackToCurriculum={onBackToCatalog}
      />

      <div className="max-w-4xl mx-auto px-4 py-2 space-y-6">
        {/* 1. REAL-TIME COGNITIVE LOAD BANNER & OVERRIDE */}
        <CognitiveLoadBanner />

        {/* 2. TOPIC HEADER & SUBTOPIC PROGRESS (Section 47) */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold mb-1">
              <span>SECTION {currentSectionIndex + 1} OF {totalSections}</span>
              <span>•</span>
              <span className="text-purple-400">Depth: {contentDepthLabels[contentDepthVal as keyof typeof contentDepthLabels]}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {topic.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <BookmarkButton
              itemType="lesson"
              itemId={topic.id}
              title={topic.title}
              snippet={currentSection.title}
              topicId={topic.id}
              language="python"
            />
            <button
              onClick={() => setNoteModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5"
              title="Add personal note for this topic"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add Note</span>
            </button>
            <span className="text-xs font-mono font-bold text-slate-300 ml-2">
              {progressPercent}% Complete
            </span>
          </div>
        </div>

        {/* Section Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Section Pill Quick Navigator */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {sections.map((sec: any, idx: number) => (
            <button
              key={sec.id}
              onClick={() => {
                setCurrentSectionIndex(idx);
                localStorage.setItem(`topic_section_${topicId}`, idx.toString());
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                idx === currentSectionIndex
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : completedSections[idx]
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {idx + 1}. {sec.title.split('. ')[1] || sec.title}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MICRO-LEARNING MODE ALERT (Section 50) */}
      {isMicroLearning && (
        <div className="p-4 rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900 flex items-start gap-3 animate-pulse">
          <Zap className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-rose-400 block mb-0.5">Micro-Learning Mode Active (High Cognitive Load Detected)</span>
            We have divided this lesson into 5-minute modular checkpoints with immediate single-question feedback to eliminate information overload.
          </div>
        </div>
      )}

      {/* 4. ACTIVE SECTION CONTENT CARD */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/40 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            {currentSection.title}
          </h2>
          <div className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
            {currentSection.content}
          </div>
        </div>

        {/* Code Snippet if present */}
        {currentSection.code_snippet && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5"><Code className="w-3.5 h-3.5 text-cyan-400" /> Example Code</span>
              <div className="flex items-center gap-2">
                <BookmarkButton
                  itemType="example"
                  itemId={`${topic.id}-sec-${currentSectionIndex}-code`}
                  title={`${topic.title} Code Snippet (${currentSection.title})`}
                  snippet={currentSection.code_snippet}
                  topicId={topic.id}
                  language="python"
                />
                <button
                  onClick={() => copyCode(currentSection.code_snippet)}
                  className="hover:text-white flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <pre className="p-4 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
              <code>{currentSection.code_snippet}</code>
            </pre>
          </div>
        )}

        {/* Pitfalls & Mistakes if present */}
        {currentSection.pitfalls && (
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-950/10 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <span className="font-bold text-amber-400 block mb-1">Common Beginner Pitfall</span>
              {currentSection.pitfalls}
            </div>
          </div>
        )}

        {/* SECTION 50: MICRO-LEARNING MINI-CHECK */}
        {currentSection.mini_check && (
          <div className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Micro-Checkpoint (1 Question)
            </div>
            <p className="text-sm font-semibold text-white">
              {currentSection.mini_check.question}
            </p>
            <div className="space-y-2">
              {currentSection.mini_check.options.map((opt: string, optIdx: number) => (
                <button
                  key={opt}
                  disabled={microCheckSubmitted}
                  onClick={() => setMicroCheckAnswer(optIdx)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-all border ${
                    microCheckAnswer === optIdx
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {!microCheckSubmitted ? (
              <button
                disabled={microCheckAnswer === null}
                onClick={() => setMicroCheckSubmitted(true)}
                className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-all"
              >
                Validate Answer
              </button>
            ) : (
              <div className={`p-3 rounded-xl text-xs ${
                microCheckAnswer === currentSection.mini_check.correct_index
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
              }`}>
                {microCheckAnswer === currentSection.mini_check.correct_index ? '✔ Correct!' : '✖ Not quite right.'}{' '}
                {currentSection.mini_check.explanation}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. IN-LESSON CONTEXTUAL AI TUTOR ACTION BAR (Section 52, 53) */}
      <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            In-Lesson AI Tutor Assistance
          </span>
          <span className="text-[11px] text-slate-400 font-mono">8 Contextual Modes</span>
        </div>

        {/* Action Chips (Section 52) */}
        <div className="flex flex-wrap gap-2">
          {[
            { mode: 'EXPLAIN', label: 'Explain this', prompt: `Explain ${currentSection.title} in detail` },
            { mode: 'SIMPLIFY', label: 'Make it simpler', prompt: `Simplify ${currentSection.title} with a real-world analogy` },
            { mode: 'EXAMPLE', label: 'Give an example', prompt: `Provide a minimal code example of ${currentSection.title}` },
            { mode: 'DEBUG', label: 'Why is this wrong?', prompt: `What common bugs occur with ${currentSection.title}?` },
            { mode: 'HINT', label: 'Show a hint', prompt: `Give me a hint on mastering ${currentSection.title}` },
            { mode: 'QUIZ', label: 'Quiz me', prompt: `Ask me a quick practice question on ${currentSection.title}` },
            { mode: 'REVISE', label: 'Summarize', prompt: `Summarize key takeaways for ${currentSection.title}` },
            { mode: 'ADVANCED', label: 'Advanced deep dive', prompt: `Give an advanced technical breakdown for ${currentSection.title}` },
          ].map(chip => (
            <button
              key={chip.mode}
              onClick={() => handleAiTutorAction(chip.mode, chip.prompt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                activeTutorMode === chip.mode
                  ? 'border-purple-500 bg-purple-950/40 text-purple-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* AI Response Box */}
        {aiTutorLoading && (
          <div className="py-4 text-xs text-purple-400 flex items-center gap-2 animate-pulse font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            Consulting RAG knowledge base conditioned on your {currentLoad} cognitive state...
          </div>
        )}

        {aiTutorResponse && (
          <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-950/10 text-xs text-slate-200 leading-relaxed whitespace-pre-line animate-fade-in relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-500/20">
              <span className="font-bold text-purple-400 uppercase text-[10px] tracking-wider">AI Tutor Response</span>
              <BookmarkButton
                itemType="ai_explanation"
                itemId={`ai-${topic.id}-${activeTutorMode || 'mode'}-${Date.now().toString().slice(-4)}`}
                title={`${topic.title} - AI: ${activeTutorMode || 'Explanation'}`}
                snippet={aiTutorResponse.answer}
                topicId={topic.id}
                language="python"
              />
            </div>
            {aiTutorResponse.answer}
          </div>
        )}
      </div>

      {/* 6. USER EXPLANATION FEEDBACK (Section 79) */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30 flex items-center justify-between text-xs text-slate-400">
        <span>Was this section helpful?</span>
        <div className="flex items-center gap-2">
          {feedbackSent ? (
            <span className="text-emerald-400 font-semibold font-mono">✔ Feedback logged!</span>
          ) : (
            <>
              <button
                onClick={() => handleFeedback('yes')}
                className="px-3 py-1 rounded-lg border border-slate-800 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => handleFeedback('somewhat')}
                className="px-3 py-1 rounded-lg border border-slate-800 hover:border-amber-500 hover:text-amber-400 transition-colors"
              >
                Somewhat
              </button>
              <button
                onClick={() => handleFeedback('no')}
                className="px-3 py-1 rounded-lg border border-slate-800 hover:border-rose-500 hover:text-rose-400 transition-colors"
              >
                No
              </button>
            </>
          )}
        </div>
      </div>

      {/* 7. SECTION STEPPER (Section 47) */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          disabled={currentSectionIndex === 0}
          onClick={handlePrevSection}
          className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 disabled:opacity-40 text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous Section
        </button>

        <div className="flex items-center gap-2">
          {currentSectionIndex < totalSections - 1 ? (
            <button
              onClick={handleMarkComplete}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              Next Section
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={onStartQuiz}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
              >
                <span>Step 2: Take {topic.title} Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenCoding}
                className="px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                <span>Step 3: Code</span>
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Contextual Quick Note Modal */}
      <QuickNoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        language="python"
        topicId={topic.id}
        subtopicTitle={currentSection.title}
        defaultTitle={`${topic.title} - Notes`}
      />
    </div>
  );
};
