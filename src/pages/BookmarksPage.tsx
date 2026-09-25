import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Bookmark,
  BookOpen,
  Code2,
  HelpCircle,
  Sparkles,
  Trash2,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';

interface BookmarksPageProps {
  onSelectTopic: (topicId: string) => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({ onSelectTopic }) => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadBookmarks();
  }, [selectedType]);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const data = await api.getBookmarks(selectedType);
      if (data && data.bookmarks) {
        setBookmarks(data.bookmarks);
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteBookmark(id);
      setBookmarks(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Delete bookmark error:', err);
    }
  };

  const filteredBookmarks = bookmarks.filter(b => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      (b.snippet && b.snippet.toLowerCase().includes(q)) ||
      (b.language && b.language.toLowerCase().includes(q))
    );
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case 'example':
        return <Code2 className="w-4 h-4 text-emerald-400" />;
      case 'question':
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
      case 'ai_explanation':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Bookmark className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Bookmark className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white">Your Bookmarks</h1>
          </div>
          <p className="text-xs text-slate-400">
            Quickly reference saved lessons, code snippets, quiz questions, and AI explanations.
          </p>
        </div>

        {/* Local Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter saved bookmarks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 outline-none"
          />
        </div>
      </div>

      {/* Type Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Items' },
          { id: 'lesson', label: 'Lessons' },
          { id: 'example', label: 'Code Examples' },
          { id: 'question', label: 'Questions' },
          { id: 'ai_explanation', label: 'AI Explanations' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedType(tab.id)}
            className={`px-4 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
              selectedType === tab.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookmarks Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading your saved bookmarks...
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800/80 bg-slate-900/40 text-center max-w-md mx-auto">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No bookmarks found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {searchQuery
              ? `No bookmarks matching "${searchQuery}".`
              : 'You can bookmark lessons, code examples, questions, and AI explanations as you study.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredBookmarks.map(b => (
            <div
              key={b.id}
              onClick={() => b.topic_id && onSelectTopic(b.topic_id)}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-900 cursor-pointer transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 shrink-0">
                      {getTypeIcon(b.item_type)}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                        {b.item_type.replace('_', ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {b.title}
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={e => handleDelete(b.id, e)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {b.snippet && (
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3">
                    {b.snippet}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
                <span className="font-mono">{b.language?.toUpperCase() || 'PYTHON'}</span>
                <span className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-1 transition-transform font-semibold">
                  <span>Go to topic</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
