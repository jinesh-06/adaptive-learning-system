import React, { useState } from 'react';
import { useCognitive } from '../context/CognitiveContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  X,
  Send,
  Sparkles,
  Lightbulb,
  Code2,
  HelpCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { BookmarkButton } from './BookmarkButton';

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
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  currentTopicTitle,
  currentCodeSnippet
}) => {
  const { currentLoad, activeTopicId } = useCognitive();
  const { preferences } = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your **Cognitive Learning Copilot**.\n\nI dynamically adjust explanations based on your current cognitive load (${currentLoad}). I can explain concepts with analogies, debug code, or provide step-by-step progressive hints without spoiling challenges.`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState(1);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: q
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const resp = await api.askAiAssistant({
        question: q,
        language: preferences.selected_language,
        level: preferences.current_level,
        topic: activeTopicId || 'loops',
        cognitive_load: currentLoad
      });

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: resp.answer || 'I am ready to assist with your programming questions.',
        sources: resp.sources
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ Could not reach AI service: ${e.message}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestHint = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const level = currentHintLevel;
    const stages = ['Conceptual Clue', 'Algorithmic Strategy', 'Pseudocode Blueprint', 'Code Skeleton'];

    try {
      const resp = await api.requestProgressiveHint({
        question: `Requesting Tier ${level} hint for coding challenge`,
        code_snippet: currentCodeSnippet || '',
        hint_level: level,
        topic: activeTopicId || 'general',
        language: preferences.selected_language
      });

      const hintMsg: Message = {
        id: `hint_${Date.now()}`,
        sender: 'assistant',
        text: `### 🎯 Tier ${level} Progressive Hint (${stages[level - 1]}):\n\n${resp.hint_text}`,
        isHint: true,
        hintLevel: level
      };

      setMessages(prev => [...prev, hintMsg]);
      if (resp.next_hint_available) {
        setCurrentHintLevel(prev => prev + 1);
      }
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ Hint request error: ${e.message}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/95 border-l border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              AI Learning Copilot
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono border border-cyan-500/20">
                {currentLoad} Load
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Targeted for {preferences.selected_language.toUpperCase()} • {currentTopicTitle || 'General'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progressive Hint Quick Bar */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-amber-400">
          <Lightbulb className="w-4 h-4" />
          <span className="font-semibold">Progressive Hints (Tier {currentHintLevel}/4):</span>
        </div>
        <button
          onClick={handleRequestHint}
          disabled={isLoading || currentHintLevel > 4}
          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all flex items-center gap-1"
        >
          <span>{currentHintLevel > 4 ? 'All Hints Used' : `Reveal Hint ${currentHintLevel}`}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                  : m.isHint
                  ? 'bg-amber-950/40 text-amber-100 border border-amber-500/40 rounded-bl-none shadow-lg'
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">
                {m.text}
              </div>

              {m.sources && m.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-700/50 text-[10px] text-slate-400 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-cyan-400" />
                  <span>RAG Grounding: {m.sources.join(', ')}</span>
                </div>
              )}

              {m.sender === 'assistant' && m.id !== 'welcome' && (
                <div className="mt-2 pt-2 border-t border-slate-700/30 flex items-center justify-end">
                  <BookmarkButton
                    itemType="ai_explanation"
                    itemId={`ai-drawer-${m.id}`}
                    title={`AI: ${currentTopicTitle || 'Tutor'} - ${m.text.slice(0, 40)}...`}
                    snippet={m.text}
                    topicId={activeTopicId || 'general'}
                    language={preferences.selected_language}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-400" />
            <span>Consulting knowledge base & adapting explanation...</span>
          </div>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <button
          onClick={() => handleSendMessage('Can you explain this using an everyday analogy?')}
          className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          💡 Give an analogy
        </button>
        <button
          onClick={() => handleSendMessage('What are the most common beginner pitfalls in this topic?')}
          className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          ⚠️ Common pitfalls
        </button>
        <button
          onClick={() => handleSendMessage('Break this concept down into simple micro-steps.')}
          className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          🌱 Micro-steps
        </button>
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder="Ask AI tutor anything about this lesson..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white transition-all shadow-md shadow-cyan-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
