import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Edit3,
  Check,
  X,
  BookOpen,
  Calendar,
  Layers,
  Code2
} from 'lucide-react';

interface NotesPageProps {
  onSelectTopic: (topicId: string) => void;
}

export const NotesPage: React.FC<NotesPageProps> = ({ onSelectTopic }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  
  // Note edit/create modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    language: 'python',
    topic_id: 'top-py-loops',
    subtopic_title: ''
  });

  useEffect(() => {
    loadNotes();
  }, [selectedLanguage, searchQuery]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await api.getNotes(searchQuery, selectedLanguage);
      if (data && data.notes) {
        setNotes(data.notes);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingNoteId(null);
    setNoteForm({
      title: '',
      content: '',
      language: selectedLanguage !== 'all' ? selectedLanguage : 'python',
      topic_id: 'top-py-loops',
      subtopic_title: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (note: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNoteId(note.id);
    setNoteForm({
      title: note.title,
      content: note.content,
      language: note.language || 'python',
      topic_id: note.topic_id,
      subtopic_title: note.subtopic_title || ''
    });
    setModalOpen(true);
  };

  const handleSaveNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;
    try {
      if (editingNoteId) {
        const updated = await api.updateNote(editingNoteId, {
          title: noteForm.title,
          content: noteForm.content,
          subtopic_title: noteForm.subtopic_title
        });
        if (updated && updated.note) {
          setNotes(prev => prev.map(n => n.id === editingNoteId ? updated.note : n));
        }
      } else {
        const res = await api.createNote(noteForm);
        if (res && res.note) {
          setNotes(prev => [res.note, ...prev]);
        }
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Save note error:', err);
    }
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Delete note error:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white">Learner Notes</h1>
          </div>
          <p className="text-xs text-slate-400">
            Personal takeaways, code syntaxes, and explanations organized by language and topic.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 outline-none"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Language Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Languages' },
          { id: 'python', label: 'Python' },
          { id: 'c', label: 'C' },
          { id: 'cpp', label: 'C++' },
          { id: 'java', label: 'Java' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedLanguage(tab.id)}
            className={`px-4 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
              selectedLanguage === tab.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading your personal notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800/80 bg-slate-900/40 text-center max-w-md mx-auto">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No notes found</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            {searchQuery
              ? `No notes matching "${searchQuery}".`
              : 'Write down key concepts, syntax quirks, and solutions as you study.'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create your first note</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {notes.map(n => (
            <div
              key={n.id}
              onClick={() => n.topic_id && onSelectTopic(n.topic_id)}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-900 cursor-pointer transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {n.language || 'python'}
                      </span>
                      {n.subtopic_title && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          • {n.subtopic_title}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {n.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => handleOpenEdit(n, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      title="Edit note"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => handleDeleteNote(n.id, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto mb-3">
                  {n.content}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(n.updated_at || n.created_at).toLocaleDateString()}</span>
                </span>
                <span className="text-cyan-400 font-semibold group-hover:underline">
                  Study related topic →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note Edit / Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingNoteId ? 'Edit Personal Note' : 'Create New Note'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Note Title</label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={e => setNoteForm({ ...noteForm, title: e.target.value })}
                  placeholder="e.g. Loop iteration quirks, Pointer arithmetic notes"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Language</label>
                  <select
                    value={noteForm.language}
                    onChange={e => setNoteForm({ ...noteForm, language: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                  >
                    <option value="python">Python</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Subtopic / Tag</label>
                  <input
                    type="text"
                    value={noteForm.subtopic_title}
                    onChange={e => setNoteForm({ ...noteForm, subtopic_title: e.target.value })}
                    placeholder="e.g. While loop condition"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Note Content (supports code)</label>
                <textarea
                  rows={5}
                  value={noteForm.content}
                  onChange={e => setNoteForm({ ...noteForm, content: e.target.value })}
                  placeholder="Type your notes, formulas, or code snippets here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!noteForm.title.trim() || !noteForm.content.trim()}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
