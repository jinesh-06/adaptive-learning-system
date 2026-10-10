import React, { useState, useEffect, useRef } from 'react';
import { useCognitive } from '../context/CognitiveContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  X,
  Send,
  Sparkles,
  Lightbulb,
  BookOpen,
  ArrowRight,
  RotateCcw,
  User,
  Bot,
  Copy,
  Check,
  Compass,
  Flame,
  HelpCircle
} from 'lucide-react';
import { BookmarkButton } from './BookmarkButton';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopicTitle?: string;
  currentCodeSnippet?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
  isHint?: boolean;
  hintLevel?: number;
  stageName?: string;
  timestamp?: string;
}

const STAGE_NAMES = [
  'Conceptual Clue',
  'Algorithmic Strategy',
  'Pseudocode Blueprint',
  'Code Skeleton'
];

function formatTopicDisplay(topicIdOrTitle?: string | null): string {
  if (!topicIdOrTitle) return 'General Programming';
  const mapping: Record<string, string> = {
    'top-py-fundamentals': 'Variables & Data Types',
    'top-py-control-flow': 'Conditionals & Branching',
    'top-py-loops': 'Loops & Iteration Constructs',
    'top-py-functions': 'Functions & Scope',
    'top-py-recursion': 'Recursion & Recursive Thinking',
    'top-c-pointers': 'Pointers & Memory Architecture',
    'top-c-arrays': 'Arrays & Pointer Arithmetic',
    'top-cpp-stl': 'STL Containers & Iterators',
    'top-cpp-oop': 'OOP Classes & Polymorphism',
    'top-java-oop': 'Encapsulation & Inheritance',
    'top-java-adv-collections': 'Collections Framework'
  };
  if (mapping[topicIdOrTitle]) return mapping[topicIdOrTitle];
  return topicIdOrTitle
    .replace(/^top-(py|c|cpp|java)(-(int|adv|oop))?-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  currentTopicTitle,
  currentCodeSnippet
}) => {
  const { currentLoad, activeTopicId } = useCognitive();
  const { preferences } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayTitle = formatTopicDisplay(currentTopicTitle || activeTopicId);

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your **Cognitive Learning Copilot**.\n\nI dynamically adjust explanations based on your current cognitive load (${currentLoad}). Ask me any programming question, request step-by-step breakdowns, debug issues, or reveal progressive hints without spoiling challenges.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState(1);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      // Focus input on drawer open
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleCopyMessage = async (msgId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(msgId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedMessageId(msgId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'assistant',
        text: `Conversation restarted. I am ready to guide you on **${displayTitle}** (${preferences.selected_language.toUpperCase()}). What would you like to explore or solve?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setCurrentHintLevel(1);
    setInputQuery('');
    inputRef.current?.focus();
  };

  const handleSendMessage = async (textToSend?: string, modeOverride?: string, loadOverride?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const historyContext = messages
        .filter(m => m.id !== 'welcome' && !m.id.startsWith('welcome_'))
        .slice(-6)
        .map(m => ({ sender: m.sender, text: m.text }));

      const resp = await api.askAiAssistant({
        question: q,
        language: preferences.selected_language,
        level: preferences.current_level,
        topic: activeTopicId || currentTopicTitle || 'Programming',
        section_title: displayTitle,
        cognitive_load: loadOverride || currentLoad,
        tutor_mode: modeOverride,
        history: historyContext
      });

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: resp.answer || 'I am ready to assist with your programming questions.',
        sources: resp.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Service Notice**: Could not reach the AI tutor engine (${e.message || 'Network error'}). Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestHint = async () => {
    if (isLoading || currentHintLevel > 4) return;
    setIsLoading(true);

    const level = currentHintLevel;
    const stageTitle = STAGE_NAMES[level - 1] || `Tier ${level}`;

    try {
      const resp = await api.requestProgressiveHint({
        question: `Requesting Tier ${level} hint for ${displayTitle} challenge`,
        code_snippet: currentCodeSnippet || '',
        hint_level: level,
        topic: activeTopicId || currentTopicTitle || 'general',
        language: preferences.selected_language,
        cognitive_load: currentLoad
      });

      const hintText = resp.hint_text || resp.hint || 'Focus on breaking down the logical requirements.';
      const activeStage = resp.stage || stageTitle;

      const hintMsg: Message = {
        id: `hint_${Date.now()}`,
        sender: 'assistant',
        text: `### 🎯 Tier ${level} Progressive Hint — ${activeStage}\n\n${hintText}`,
        isHint: true,
        hintLevel: level,
        stageName: activeStage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, hintMsg]);
      if (resp.next_hint_available ?? level < 4) {
        setCurrentHintLevel(prev => prev + 1);
      } else {
        setCurrentHintLevel(5);
      }
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Hint Error**: Could not retrieve hint (${e.message || 'Request failed'}).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBadgeColors: Record<string, string> = {
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl md:max-w-2xl bg-slate-900/95 border-l border-slate-800/90 shadow-2xl backdrop-blur-2xl flex flex-col transition-all duration-300 ease-out">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 ring-1 ring-white/10">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 ring-1 ring-emerald-500/50" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                AI Learning Copilot
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                  loadBadgeColors[currentLoad] || loadBadgeColors.MEDIUM
                }`}
              >
                {currentLoad} LOAD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Targeted for <span className="text-cyan-400 uppercase font-semibold">{preferences.selected_language}</span> • {displayTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleResetChat}
            title="Reset Conversation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95 border border-transparent hover:border-slate-700/60"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title="Close Copilot"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95 border border-transparent hover:border-slate-700/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progressive Hints Bar */}
      <div className="px-5 py-2.5 bg-gradient-to-r from-amber-950/20 via-slate-950/70 to-slate-950/40 border-b border-amber-500/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-amber-300 text-[11px] sm:text-xs">
              Progressive Hints (Tier {Math.min(currentHintLevel, 4)}/4):
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {currentHintLevel <= 4 ? STAGE_NAMES[currentHintLevel - 1] : 'All Hints Revealed'}
            </span>
          </div>
        </div>
        <button
          onClick={handleRequestHint}
          disabled={isLoading || currentHintLevel > 4}
          className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-amber-500/10"
        >
          <span>{currentHintLevel > 4 ? 'All Tiers Used' : `Reveal Hint ${currentHintLevel}`}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Tag */}
            <div className={`flex items-center gap-1.5 mb-1 px-1 text-[11px] font-medium text-slate-400 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.sender === 'user' ? (
                <>
                  <User className="w-3 h-3 text-cyan-400" />
                  <span>You</span>
                </>
              ) : m.isHint ? (
                <>
                  <Lightbulb className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-400 font-semibold">Tier {m.hintLevel} Hint • {m.stageName || 'Guidance'}</span>
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-purple-400" />
                  <span className="text-purple-300 font-semibold">Cognitive Copilot</span>
                </>
              )}
              {m.timestamp && <span className="text-[10px] text-slate-500">• {m.timestamp}</span>}
            </div>

            {/* Message Bubble Card */}
            <div
              className={`rounded-2xl transition-all ${
                m.sender === 'user'
                  ? 'max-w-[85%] sm:max-w-[78%] bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm p-3.5 sm:p-4 text-xs sm:text-sm shadow-lg shadow-cyan-900/20 font-medium'
                  : m.isHint
                  ? 'w-full max-w-[96%] sm:max-w-[92%] bg-gradient-to-b from-amber-950/30 to-slate-900/90 text-amber-100 border border-amber-500/40 rounded-tl-sm p-4 sm:p-5 shadow-xl shadow-amber-950/20 backdrop-blur-md'
                  : 'w-full max-w-[96%] sm:max-w-[92%] bg-slate-900/90 text-slate-200 border border-slate-800/90 rounded-tl-sm p-4 sm:p-5 shadow-xl backdrop-blur-md'
              }`}
            >
              {m.sender === 'user' ? (
                <div className="whitespace-pre-wrap leading-relaxed break-words">
                  {m.text}
                </div>
              ) : (
                <MarkdownRenderer content={m.text} />
              )}

              {/* RAG Source Grounding Badges */}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center gap-1 text-cyan-400 font-medium">
                    <BookOpen className="w-3 h-3" />
                    <span>Grounding Knowledge:</span>
                  </div>
                  {m.sources.map((src, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[10px] font-mono text-slate-300"
                    >
                      {src}
                    </span>
                  ))}
                </div>
              )}

              {/* Assistant Message Actions Toolbar */}
              {m.sender === 'assistant' && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-slate-400 text-[11px]">
                  <div className="text-[10px] text-slate-500 italic">
                    Adapted to {currentLoad} cognitive load
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyMessage(m.id, m.text)}
                      className="p-1 rounded-md hover:bg-slate-800 hover:text-slate-200 text-slate-400 transition-colors flex items-center gap-1"
                      title="Copy full explanation"
                    >
                      {copiedMessageId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[10px]">Copy</span>
                        </>
                      )}
                    </button>

                    {!m.id.startsWith('welcome') && (
                      <BookmarkButton
                        itemType="ai_explanation"
                        itemId={`ai-drawer-${m.id}`}
                        title={`AI: ${displayTitle} - ${m.text.slice(0, 36)}...`}
                        snippet={m.text}
                        topicId={activeTopicId || 'general'}
                        language={preferences.selected_language}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs w-fit shadow-md animate-pulse">
            <div className="w-6 h-6 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span>Consulting AI programming tutor & crafting adaptive explanation...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2.5 bg-slate-950/70 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none shrink-0">
        <button
          onClick={() => handleSendMessage('Can you explain this concept using an everyday real-world analogy?', 'SIMPLIFY')}
          className="shrink-0 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-750 active:bg-slate-700 text-slate-200 hover:text-white transition-all border border-slate-700/60 shadow-sm active:scale-95 flex items-center gap-1.5 font-medium"
        >
          <span>💡 Give an analogy</span>
        </button>
        <button
          onClick={() => handleSendMessage('What are the most common beginner pitfalls and bugs in this topic?', 'DEBUG')}
          className="shrink-0 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-750 active:bg-slate-700 text-slate-200 hover:text-white transition-all border border-slate-700/60 shadow-sm active:scale-95 flex items-center gap-1.5 font-medium"
        >
          <span>⚠️ Common pitfalls</span>
        </button>
        <button
          onClick={() => handleSendMessage('Break this concept down into simple micro-steps with clear instructions.', 'EXPLAIN', 'HIGH')}
          className="shrink-0 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-750 active:bg-slate-700 text-slate-200 hover:text-white transition-all border border-slate-700/60 shadow-sm active:scale-95 flex items-center gap-1.5 font-medium"
        >
          <span>🌱 Micro-steps</span>
        </button>
        <button
          onClick={() => handleSendMessage('Can you show a clean, runnable code example illustrating this?', 'EXAMPLE')}
          className="shrink-0 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-750 active:bg-slate-700 text-slate-200 hover:text-white transition-all border border-slate-700/60 shadow-sm active:scale-95 flex items-center gap-1.5 font-medium"
        >
          <span>💻 Code example</span>
        </button>
        <button
          onClick={() => handleSendMessage('Quiz me on this concept with a quick practice question!', 'QUIZ')}
          className="shrink-0 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-750 active:bg-slate-700 text-slate-200 hover:text-white transition-all border border-slate-700/60 shadow-sm active:scale-95 flex items-center gap-1.5 font-medium"
        >
          <span>❓ Quiz me</span>
        </button>
      </div>

      {/* Input Bar */}
      <div className="p-3.5 border-t border-slate-800/90 bg-slate-950/90 backdrop-blur-xl shrink-0">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-cyan-500/20 rounded-xl px-3 py-1.5 transition-all shadow-inner"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder={`Ask AI tutor anything about ${displayTitle}...`}
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none py-1"
          />
          {inputQuery.trim() && (
            <button
              type="button"
              onClick={() => setInputQuery('')}
              className="text-slate-500 hover:text-slate-300 p-1 rounded-md transition-colors"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-30 text-white transition-all shadow-md shadow-cyan-500/20 active:scale-95 shrink-0"
            title="Send query (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
