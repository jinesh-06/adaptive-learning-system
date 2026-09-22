import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import {
  Search,
  BookOpen,
  HelpCircle,
  Code2,
  BrainCircuit,
  ArrowRight,
  Sparkles,
  X,
  CornerDownLeft
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTopic: (topicId: string) => void;
  onNavigateToCourse: (courseId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTopic,
  onNavigateToCourse
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'course' | 'topic' | 'question' | 'concept'>('all');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (!query) {
        // Initial popular search or empty
        handleSearch('pointer');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = async (searchTerm: string) => {
    setQuery(searchTerm);
    if (!searchTerm.trim()) {
      setResults([]);
      setSynonyms([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.globalSearch(searchTerm);
      if (data) {
        setResults(data.results || []);
        setSynonyms(data.expanded_synonyms || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredResults = results.filter(r => categoryFilter === 'all' || r.type === categoryFilter);

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case 'topic':
        return <Code2 className="w-4 h-4 text-emerald-400" />;
      case 'question':
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
      case 'concept':
        return <BrainCircuit className="w-4 h-4 text-purple-400" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleItemClick = (item: any) => {
    if (item.topic_id) {
      onNavigateToTopic(item.topic_id);
      onClose();
    } else if (item.type === 'course') {
      onNavigateToCourse(item.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-20 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Bar Input */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center gap-3 bg-slate-900/90">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search courses, topics, questions, concepts (e.g. pointer, loops, oop)..."
            className="w-full bg-transparent text-white placeholder:text-slate-500 text-sm sm:text-base outline-none"
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-mono"
          >
            ESC
          </button>
        </div>

        {/* Synonym Indicator */}
        {synonyms.length > 1 && (
          <div className="px-5 py-2 bg-slate-950/70 border-b border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2 overflow-x-auto">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-300 shrink-0">Synonyms matched:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {synonyms.slice(0, 6).map(s => (
                <span key={s} className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 font-mono text-[10px]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="px-5 py-2.5 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'all', label: `All (${results.length})` },
            { id: 'course', label: 'Courses' },
            { id: 'topic', label: 'Topics' },
            { id: 'question', label: 'Questions' },
            { id: 'concept', label: 'Concepts' }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id as any)}
              className={`px-3 py-1 rounded-xl font-semibold transition-colors shrink-0 ${
                categoryFilter === c.id
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Searching across intelligent index...
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No results found for "{query}". Try terms like "pointer", "loop", "function", or "recursion".
            </div>
          ) : (
            filteredResults.map(item => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleItemClick(item)}
                className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-950/50 hover:bg-slate-800/50 hover:border-cyan-500/40 cursor-pointer transition-all flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5 group-hover:border-cyan-500/30 transition-colors">
                    {getCategoryIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h4>
                      {item.language && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-slate-800 text-slate-300">
                          {item.language}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mb-1">
                      {item.subtitle}
                    </p>
                    {item.snippet && (
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {item.snippet}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 mt-2">
                  <span className="text-[10px] font-semibold hidden sm:inline">Jump</span>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 text-center text-[11px] text-slate-500 flex items-center justify-between px-5">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Cmd/Ctrl + K</kbd> anywhere</span>
          <span>Synonym-Aware Index</span>
        </div>
      </div>
    </div>
  );
};
