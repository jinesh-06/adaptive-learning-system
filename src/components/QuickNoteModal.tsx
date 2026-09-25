import React, { useState } from 'react';
import { api } from '../services/api';
import { FileText, Check, X } from 'lucide-react';

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  topicId: string;
  subtopicTitle?: string;
  defaultTitle?: string;
}

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({
  isOpen,
  onClose,
  language,
  topicId,
  subtopicTitle,
  defaultTitle = ''
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await api.createNote({
        language,
        topic_id: topicId,
        subtopic_title: subtopicTitle,
        title,
        content
      });
      onClose();
    } catch (err) {
      console.error('Failed to create quick note:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Add Quick Note</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase font-bold">
              {language}
            </span>
            <span>{subtopicTitle || topicId}</span>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Title</label>
            <input
              type="text"
              placeholder="e.g. Scoping rule exception, Key formula"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Note Content</label>
            <textarea
              rows={4}
              placeholder="Write your note or code example..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={submitting || !title.trim() || !content.trim()}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Note</span>
          </button>
        </div>
      </div>
    </div>
  );
};
