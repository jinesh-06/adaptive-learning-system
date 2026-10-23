import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileText, Check, X, Trash2, Edit3, Plus, Loader2 } from 'lucide-react';

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  topicId: string;
  subtopicTitle?: string;
  defaultTitle?: string;
  onNoteSaved?: (note: any) => void;
  onNoteDeleted?: (noteId: string) => void;
}

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({
  isOpen,
  onClose,
  language,
  topicId,
  subtopicTitle,
  defaultTitle = '',
  onNoteSaved,
  onNoteDeleted
}) => {
  const [existingNoteId, setExistingNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mode, setMode] = useState<'edit' | 'create'>('create');

  // Load existing note when modal opens or topicId changes
  useEffect(() => {
    if (!isOpen) {
      setShowConfirmDelete(false);
      setSaveSuccess(false);
      return;
    }

    let isMounted = true;
    const fetchExistingNote = async () => {
      setLoading(true);
      setShowConfirmDelete(false);
      setSaveSuccess(false);
      try {
        const res = await api.getNotes(undefined, language, topicId);
        const list = Array.isArray(res) ? res : (res?.notes || []);
        
        // Find existing note for this topic
        const matched = list.find((n: any) => 
          n.topic_id === topicId || 
          (n.title && n.title.toLowerCase().includes(topicId.toLowerCase()))
        );

        if (isMounted) {
          if (matched && matched.id) {
            setExistingNoteId(matched.id);
            setTitle(matched.title || defaultTitle || `${subtopicTitle || topicId} - Personal Notes`);
            setContent(matched.content || '');
            setMode('edit');
          } else {
            setExistingNoteId(null);
            setTitle(defaultTitle || `${subtopicTitle || topicId} - Personal Notes`);
            setContent('');
            setMode('create');
          }
        }
      } catch (err) {
        console.error('Failed to check existing note for topic:', err);
        if (isMounted) {
          setExistingNoteId(null);
          setTitle(defaultTitle || `${subtopicTitle || topicId} - Personal Notes`);
          setContent('');
          setMode('create');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExistingNote();

    return () => {
      isMounted = false;
    };
  }, [isOpen, topicId, language, defaultTitle, subtopicTitle]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      if (mode === 'edit' && existingNoteId) {
        // Update existing note in place - DO NOT create a new note!
        const res = await api.updateNote(existingNoteId, {
          title: title.trim(),
          content: content.trim(),
          subtopic_title: subtopicTitle,
          language,
          topic_id: topicId
        });
        const savedNote = res?.note || {
          id: existingNoteId,
          title: title.trim(),
          content: content.trim(),
          subtopic_title: subtopicTitle,
          language,
          topic_id: topicId,
          updated_at: new Date().toISOString()
        };
        onNoteSaved?.(savedNote);
      } else {
        // Create new note
        const res = await api.createNote({
          language,
          topic_id: topicId,
          subtopic_title: subtopicTitle,
          title: title.trim(),
          content: content.trim()
        });
        const newId = res?.id || res?.note?.id;
        if (newId) {
          setExistingNoteId(newId);
          setMode('edit');
        }
        onNoteSaved?.(res?.note || res);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      console.error('Failed to save quick note:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingNoteId) return;
    setDeleting(true);
    try {
      await api.deleteNote(existingNoteId);
      onNoteDeleted?.(existingNoteId);
      setExistingNoteId(null);
      setContent('');
      setTitle(defaultTitle || `${subtopicTitle || topicId} - Personal Notes`);
      setMode('create');
      setShowConfirmDelete(false);
      onClose();
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleSwitchToCreate = () => {
    setMode('create');
    setExistingNoteId(null);
    setTitle(defaultTitle || `${subtopicTitle || topicId} - Personal Notes`);
    setContent('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{mode === 'edit' ? 'Edit Personal Note' : 'Add Personal Note'}</span>
                {mode === 'edit' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Edit3 className="w-2.5 h-2.5" />
                    Editing Existing Note
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    New Note
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'edit' 
                  ? 'Changes will update this note directly without creating duplicates.'
                  : 'Saves your personal takeaways and syntax examples for this topic.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            <span>Checking existing notes for this lesson...</span>
          </div>
        ) : (
          <>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase font-bold">
                    {language}
                  </span>
                  <span className="truncate max-w-[200px]">{subtopicTitle || topicId}</span>
                </div>

                {mode === 'edit' && (
                  <button
                    type="button"
                    onClick={handleSwitchToCreate}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create separate new note</span>
                  </button>
                )}
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Scoping rule exception, Key formula"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Note Content (supports code)</label>
                <textarea
                  rows={5}
                  placeholder="Write your note or code example..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none font-mono text-xs leading-relaxed"
                />
              </div>
            </div>

            {/* Confirmation delete alert if triggered */}
            {showConfirmDelete && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-xs">
                <span className="text-rose-300 font-medium">Delete this note permanently?</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 flex items-center gap-1"
                  >
                    {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span>Confirm Delete</span>
                  </button>
                </div>
              </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-2">
              <div>
                {mode === 'edit' && existingNoteId && !showConfirmDelete && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="px-3 py-1.5 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Note</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={submitting || !title.trim() || !content.trim()}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-1.5 ${
                    saveSuccess
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                      : 'bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 shadow-cyan-500/20'
                  }`}
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : saveSuccess ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {saveSuccess
                      ? 'Saved!'
                      : mode === 'edit'
                      ? 'Save Changes'
                      : 'Save Note'}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
