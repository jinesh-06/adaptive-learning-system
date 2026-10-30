import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Star,
  MessageSquare,
  Trash2,
  Edit2,
  AlertTriangle,
  BookOpen,
  Filter,
  Check,
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  api,
  LearningOutcomesData,
  TopicLearningOutcome,
  StudentFeedbackItem
} from '../../services/api';
import { AssessmentModal } from './AssessmentModal';

interface LearningOutcomesSectionProps {
  onSelectTopic: (topicId: string) => void;
}

export const LearningOutcomesSection: React.FC<LearningOutcomesSectionProps> = ({ onSelectTopic }) => {
  const [data, setData] = useState<LearningOutcomesData | null>(null);
  const [feedbackList, setFeedbackList] = useState<StudentFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Assessment Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState('top-py-fundamentals');
  const [activeTopicTitle, setActiveTopicTitle] = useState('Python Fundamentals');
  const [activeAssessmentType, setActiveAssessmentType] = useState<'pre' | 'post'>('pre');

  // Feedback Form State
  const [feedbackTopicId, setFeedbackTopicId] = useState('top-py-fundamentals');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState<'lesson' | 'quiz' | 'recommendation' | 'general'>('lesson');
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Feedback Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [editCategory, setEditCategory] = useState<string>('lesson');
  const [savingEdit, setSavingEdit] = useState(false);

  // Filter State for Topics
  const [filterLang, setFilterLang] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [outcomesRes, feedbackRes] = await Promise.all([
        api.getLearningOutcomes(),
        api.getStudentFeedbackList()
      ]);

      if (outcomesRes) {
        setData(outcomesRes);
      } else {
        setError('Failed to load learning outcomes metrics.');
      }

      if (feedbackRes && feedbackRes.feedback) {
        setFeedbackList(feedbackRes.feedback);
      }
    } catch (err: any) {
      console.error('Error loading outcomes or feedback:', err);
      setError('Failed to connect to outcomes service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAssessment = (topicId: string, title: string, type: 'pre' | 'post') => {
    setActiveTopicId(topicId);
    setActiveTopicTitle(title);
    setActiveAssessmentType(type);
    setModalOpen(true);
  };

  const handleAssessmentCompleted = () => {
    fetchData();
  };

  // Submit Feedback Handler
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setFeedbackError('Please enter comments before submitting feedback.');
      return;
    }

    setSubmittingFeedback(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);

    try {
      const res = await api.submitStudentFeedback({
        topic_id: feedbackTopicId,
        rating,
        comments: comment.trim(),
        feedback_type: category
      });

      if (res && res.success) {
        setFeedbackSuccess('Thank you! Your feedback was submitted successfully.');
        setComment('');
        fetchData();
        setTimeout(() => setFeedbackSuccess(null), 4000);
      } else {
        setFeedbackError(res?.message || 'Failed to submit feedback.');
      }
    } catch (err: any) {
      setFeedbackError(err?.message || 'Error communicating with feedback service.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Edit Feedback Handler
  const handleStartEdit = (item: StudentFeedbackItem) => {
    setEditingId(item.id);
    setEditRating(item.rating);
    setEditComment(item.comments);
    setEditCategory(item.feedback_type || 'lesson');
  };

  const handleSaveEdit = async (feedbackId: string) => {
    if (!editComment.trim()) return;
    setSavingEdit(true);
    try {
      const res = await api.updateStudentFeedback(feedbackId, {
        rating: editRating,
        comments: editComment.trim(),
        feedback_type: editCategory
      });
      if (res && res.success) {
        setEditingId(null);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update feedback:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Feedback Handler
  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      const res = await api.deleteStudentFeedback(feedbackId);
      if (res && res.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete feedback:', err);
    }
  };

  // Available topics for feedback selector
  const availableTopics = data?.topic_outcomes && data.topic_outcomes.length > 0
    ? data.topic_outcomes.map(t => ({ id: t.topic_id, title: t.topic_title }))
    : [
        { id: 'top-py-fundamentals', title: 'Python Fundamentals' },
        { id: 'top-py-variables-datatypes', title: 'Python Variables & Data Types' },
        { id: 'top-py-loops', title: 'Python Loops & Iteration' },
        { id: 'top-c-intro', title: 'C Language Foundations' },
        { id: 'top-c-pointers-intro', title: 'C Pointers & Memory Architecture' },
        { id: 'top-cpp-intro', title: 'Modern C++ Foundations' },
        { id: 'top-java-intro', title: 'Java Architecture & Foundations' }
      ];

  const filteredTopics = (data?.topic_outcomes || []).filter(t => {
    if (filterLang === 'all') return true;
    return t.language.toLowerCase() === filterLang.toLowerCase();
  });

  return (
    <div className="space-y-8">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Learning Outcomes & Feedback
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Learning Progress & Student Feedback
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track diagnostic pre-assessments, follow-up mastery gains, and share continuous feedback.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Refresh Data
        </button>
      </div>

      {/* ERROR STATE */}
      {error && !data && (
        <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-center">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">Outcomes Telemetry Unavailable</h3>
          <p className="text-xs text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Connection
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && !data && (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Computing pre/post assessment learning outcomes & improvements...</p>
        </div>
      )}

      {/* DATA CONTENT */}
      {data && (
        <>
          {/* 1. OUTCOMES KPI SUMMARY BANNER (Feature 3) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Completed Assessments */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg relative overflow-hidden">
              <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
                <span>Completed Assessments</span>
                <Award className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {data.summary.number_of_completed_assessments}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Assigned: {data.summary.number_of_assigned_assessments}
              </div>
            </div>

            {/* Assessment Completion Rate */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg relative overflow-hidden">
              <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
                <span>Completion Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {data.summary.assessment_completion_rate}%
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, data.summary.assessment_completion_rate)}%` }}
                />
              </div>
            </div>

            {/* Overall Accuracy */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg relative overflow-hidden">
              <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
                <span>Overall Accuracy</span>
                <Check className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">
                {data.summary.accuracy_percentage}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Verified question checks
              </div>
            </div>

            {/* Average Score Improvement (Distinguished from Percentage-Point Improvement) */}
            <div className="p-4 sm:p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-slate-900/60 shadow-lg relative overflow-hidden">
              <div className="text-xs text-cyan-400 font-semibold mb-1 flex items-center justify-between">
                <span>Score Improvement</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono flex items-baseline gap-1">
                <span>{data.summary.average_score_improvement > 0 ? '+' : ''}{data.summary.average_score_improvement}</span>
                <span className="text-xs text-slate-400 font-sans font-normal">marks</span>
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 font-mono font-medium">
                {data.summary.average_percentage_point_improvement > 0 ? '+' : ''}{data.summary.average_percentage_point_improvement}% pts gain
              </div>
            </div>
          </div>

          {/* 2. TOPIC-WISE LEARNING OUTCOMES & ACTIONS (Feature 1, 2, 3, 5) */}
          <div className="p-5 sm:p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Topic-Wise Assessment & Improvement Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-assessment baseline vs post-assessment follow-up outcomes per curriculum topic.
                </p>
              </div>

              {/* Language Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 p-1 rounded-xl text-xs">
                {['all', 'python', 'c', 'cpp', 'java'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setFilterLang(lang)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      filterLang === lang
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* EMPTY STATE */}
            {filteredTopics.length === 0 && (
              <div className="py-12 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl p-6">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">No Assessments Completed Yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  Take an initial pre-assessment before studying a topic to measure your baseline, then complete the post-assessment to record learning improvement.
                </p>
                <button
                  onClick={() => handleOpenAssessment('top-py-fundamentals', 'Python Fundamentals', 'pre')}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Start Python Pre-Assessment
                </button>
              </div>
            )}

            {/* TOPICS TABLE / LIST */}
            {filteredTopics.length > 0 && (
              <div className="space-y-3">
                {filteredTopics.map(topic => (
                  <div
                    key={topic.topic_id}
                    className="p-4 rounded-2xl border border-slate-800 bg-slate-950/40 hover:border-slate-700/80 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Topic Title & Status */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                          {topic.language}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {topic.topic_title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>Status:</span>
                        <span className={`font-semibold ${
                          topic.status === 'COMPLETED'
                            ? 'text-emerald-400'
                            : topic.status === 'PRE_ASSESSED_ONLY'
                            ? 'text-blue-400'
                            : topic.status === 'POST_ASSESSED_ONLY'
                            ? 'text-amber-400'
                            : 'text-slate-500'
                        }`}>
                          {topic.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Pre vs Post Comparison Pills */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Pre Score */}
                      <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Pre-Assessment</span>
                        {topic.has_pre_assessment && topic.pre_assessment ? (
                          <span className="font-mono font-bold text-white">
                            {topic.pre_assessment.score}/{topic.pre_assessment.total_marks} ({topic.pre_assessment.accuracy}%)
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Not taken</span>
                        )}
                      </div>

                      {/* Post Score */}
                      <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Post-Assessment</span>
                        {topic.has_post_assessment && topic.post_assessment ? (
                          <span className="font-mono font-bold text-white">
                            {topic.post_assessment.score}/{topic.post_assessment.total_marks} ({topic.post_assessment.accuracy}%)
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Not taken</span>
                        )}
                      </div>

                      {/* Score Improvement Badge */}
                      <div className={`px-3 py-1.5 rounded-xl border text-xs min-w-[140px] ${
                        topic.score_improvement !== null
                          ? topic.score_improvement >= 0
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                            : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}>
                        <span className="text-[10px] uppercase font-bold block">Score Improvement</span>
                        {topic.score_improvement !== null ? (
                          <div className="font-mono font-bold">
                            {topic.score_improvement > 0 ? '+' : ''}{topic.score_improvement} marks
                            <span className="text-[10px] font-normal ml-1">
                              ({topic.percentage_point_improvement! > 0 ? '+' : ''}{topic.percentage_point_improvement}% pts)
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] italic">Requires both</span>
                        )}
                      </div>
                    </div>

                    {/* Actions: Take Pre or Post */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenAssessment(topic.topic_id, topic.topic_title, 'pre')}
                        className="px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold transition-all"
                      >
                        {topic.has_pre_assessment ? 'Retake Pre' : 'Take Pre-Test'}
                      </button>
                      <button
                        onClick={() => handleOpenAssessment(topic.topic_id, topic.topic_title, 'post')}
                        className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-all"
                      >
                        {topic.has_post_assessment ? 'Retake Post' : 'Take Post-Test'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. STUDENT FEEDBACK MODULE (Feature 4, 5) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Feedback Submission Form (5 cols) */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  Submit Learning Feedback
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Rate lesson clarity, quiz challenges, or AI suggestions to refine your learning curve.
                </p>
              </div>

              {feedbackSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feedbackSuccess}</span>
                </div>
              )}

              {feedbackError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{feedbackError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                {/* Topic Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Topic / Activity
                  </label>
                  <select
                    value={feedbackTopicId}
                    onChange={e => setFeedbackTopicId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    {availableTopics.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                {/* Feedback Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(['lesson', 'quiz', 'recommendation', 'general'] as const).map(cat => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`py-1.5 px-3 rounded-xl border capitalize font-semibold transition-all ${
                          category === cat
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating 1 to 5 Stars */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono font-bold text-amber-400 ml-2">
                      {rating} / 5
                    </span>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Your Comments & Suggestions
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Share specific insights about difficulty, clarity, pacing, or recommendations..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-cyan-500/20"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </div>

            {/* Right: Previously Submitted Feedback (7 cols) */}
            <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  Your Submitted Feedback History ({feedbackList.length})
                </h3>
                <span className="text-[11px] text-slate-500">Private & Student Isolated</span>
              </div>

              {feedbackList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl p-6">
                  <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 font-medium">No feedback submitted yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                    Your ratings and suggestions on lessons and recommendations will be preserved here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1">
                  {feedbackList.map(item => {
                    const isEditing = editingId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border border-slate-800 bg-slate-950/40 text-xs space-y-2 transition-all hover:border-slate-700/80"
                      >
                        {isEditing ? (
                          /* Inline Edit Mode */
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white">Edit Feedback</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <button key={s} type="button" onClick={() => setEditRating(s)}>
                                    <Star className={`w-4 h-4 ${s <= editRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea
                              rows={2}
                              value={editComment}
                              onChange={e => setEditComment(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 rounded-lg border border-slate-700 text-slate-300 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                disabled={savingEdit}
                                onClick={() => handleSaveEdit(item.id)}
                                className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold"
                              >
                                {savingEdit ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Normal View Mode */
                          <>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="font-bold text-white block">
                                  {item.topic_title || item.topic_id}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                      <Star
                                        key={s}
                                        className={`w-3.5 h-3.5 ${
                                          s <= item.rating
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-slate-700'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                                    {item.feedback_type}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                                  </span>
                                </div>
                              </div>

                              {/* Edit & Delete Actions */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleStartEdit(item)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                                  title="Edit Feedback"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFeedback(item.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                                  title="Delete Feedback"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-slate-300 leading-relaxed pl-1 border-l-2 border-cyan-500/40">
                              {item.comments}
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* MODAL: PRE & POST ASSESSMENT RUNNER */}
      <AssessmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        topicId={activeTopicId}
        topicTitle={activeTopicTitle}
        assessmentType={activeAssessmentType}
        onCompleted={handleAssessmentCompleted}
      />
    </div>
  );
};
