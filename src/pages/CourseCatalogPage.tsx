import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCognitive } from '../context/CognitiveContext';
import { api } from '../services/api';
import { mockCourses } from '../services/mockFallback';
import { VisualRoadmap } from '../components/VisualRoadmap';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  Award,
  Search,
  Filter,
  Map,
  Grid
} from 'lucide-react';

interface CourseCatalogProps {
  onSelectTopic: (topicId: string) => void;
  onOpenPythonDashboard?: () => void;
  onOpenPythonIntermediateDashboard?: () => void;
  onOpenPythonAdvancedDashboard?: () => void;
  onOpenCDashboard?: () => void;
  onOpenCIntermediateDashboard?: () => void;
  onOpenCAdvancedDashboard?: () => void;
  onOpenCppDashboard?: () => void;
  onOpenCppOopDashboard?: () => void;
  onOpenCppAdvDashboard?: () => void;
  onOpenJavaDashboard?: () => void;
  onOpenJavaOopDashboard?: () => void;
  onOpenJavaAdvDashboard?: () => void;
}

// Read stored progress from localStorage instantly
const getStoredCourseProgress = (cId: string, totalTopics: number): number => {
  try {
    let key = '';
    if (cId === 'py-beg' || cId === 'course-py-fund') key = 'cog_python_progress';
    else if (cId === 'py-int') key = 'cog_python_int_progress';
    else if (cId === 'py-adv') key = 'cog_python_adv_progress';
    else if (cId === 'c-beg') key = 'cog_c_progress';
    else if (cId === 'c-int') key = 'cog_c_int_progress';
    else if (cId === 'c-advanced-systems') key = 'cog_c_adv_progress';
    else if (cId === 'cpp-beg' || cId === 'cpp-fundamentals') key = 'cog_cpp_progress';
    else if (cId === 'cpp-int' || cId === 'cpp-oop') key = 'cog_cpp_oop_progress';
    else if (cId === 'cpp-adv' || cId === 'cpp-advanced') key = 'cog_cpp_adv_progress';
    else if (cId === 'java-beg' || cId === 'java-basics') key = 'cog_java_progress';
    else if (cId === 'java-int' || cId === 'java-oop') key = 'cog_java_oop_progress';
    else if (cId === 'java-adv' || cId === 'java-advanced') key = 'cog_java_adv_progress';

    if (!key) return 0;
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const items = JSON.parse(raw);
    if (Array.isArray(items) && totalTopics > 0) {
      const completed = items.filter((p: any) => p.status === 'COMPLETED' || Number(p.completion_pct || 0) >= 95).length;
      return Math.min(100, Math.round((completed / totalTopics) * 100));
    }
  } catch {}
  return 0;
};

// Helper to map raw course items to UI model with topic count and progress
const mapCourseWithProgress = (c: any, progressMap: Record<string, any> = {}) => {
  const isPyAdv = c.language === 'python' && (c.id === 'py-adv' || c.title?.toLowerCase().includes('advanced') || c.level === 'advanced');
  const isPyInt = c.language === 'python' && (c.id === 'py-int' || c.title?.toLowerCase().includes('intermediate') || c.level === 'intermediate');
  const isPyFund = c.language === 'python' && (c.id === 'py-beg' || c.id === 'course-py-fund' || c.title?.toLowerCase().includes('fundamentals') || c.level === 'beginner');
  const isCFund = c.language === 'c' && (c.id === 'c-beg' || c.title?.toLowerCase().includes('foundations') || c.level === 'beginner');
  const isCInt = c.language === 'c' && (c.id === 'c-int' || c.title?.toLowerCase().includes('pointer') || c.title?.toLowerCase().includes('memory') || c.level === 'intermediate');
  const isCAdv = c.language === 'c' && (c.id === 'c-advanced-systems' || c.title?.toLowerCase().includes('advanced') || c.level === 'advanced');
  const isCppFund = c.language === 'cpp' && (c.id === 'cpp-beg' || c.id === 'cpp-fundamentals' || c.id === 'course-cpp-fund' || c.title?.toLowerCase().includes('modern') || c.title?.toLowerCase().includes('fundamentals') || c.level === 'beginner');
  const isCppOop = c.language === 'cpp' && (c.id === 'cpp-int' || c.id === 'cpp-oop' || c.title?.toLowerCase().includes('object-oriented') || c.level === 'intermediate');
  const isCppAdv = c.language === 'cpp' && (c.id === 'cpp-adv' || c.id === 'cpp-advanced' || c.title?.toLowerCase().includes('stl') || c.level === 'advanced');
  const isJavaFund = c.language === 'java' && (c.id === 'java-beg' || c.id === 'java-basics' || c.id === 'course-java-fund' || c.title?.toLowerCase().includes('architecture') || c.title?.toLowerCase().includes('core') || c.level === 'beginner');
  const isJavaOop = c.language === 'java' && (c.id === 'java-int' || c.id === 'java-oop' || c.title?.toLowerCase().includes('object-oriented') || c.title?.toLowerCase().includes('design') || c.level === 'intermediate');
  const isJavaAdv = c.language === 'java' && (c.id === 'java-adv' || c.id === 'java-advanced' || c.title?.toLowerCase().includes('collections') || c.level === 'advanced');

  let topics_count = c.topics_count || 16;
  let duration_hours = c.duration_hours || 6;
  let progress = c.progress || 0;
  let first_topic_id = c.first_topic_id || 'top-py-intro';

  if (isPyFund) {
    const d = progressMap.pyFund;
    topics_count = d?.total_topics || 16;
    duration_hours = 6;
    progress = d?.overall_progress !== undefined ? Number(d.overall_progress) : (progress || getStoredCourseProgress(c.id, 16));
    first_topic_id = d?.current_topic_id || 'top-py-intro';
  } else if (isPyInt) {
    const d = progressMap.pyInt;
    topics_count = d?.total_topics || 26;
    duration_hours = 10;
    progress = d?.overall_progress !== undefined ? Number(d.overall_progress) : (progress || getStoredCourseProgress(c.id, 26));
    first_topic_id = d?.current_topic_id || 'top-py-int-comprehensions';
  } else if (isPyAdv) {
    const d = progressMap.pyAdv;
    topics_count = d?.total_topics || 53;
    duration_hours = 14;
    progress = d?.overall_progress !== undefined ? Number(d.overall_progress) : (progress || getStoredCourseProgress(c.id, 53));
    first_topic_id = d?.current_topic_id || 'top-py-adv-args-kwargs';
  } else if (isCFund) {
    const d = progressMap.cFund;
    topics_count = d?.total_topics || 16;
    duration_hours = 8.5;
    progress = d?.overall_progress !== undefined ? Number(d.overall_progress) : (progress || getStoredCourseProgress(c.id, 16));
    first_topic_id = d?.current_topic_id || 'top-c-intro';
  } else if (isCInt) {
    const d = progressMap.cInt;
    topics_count = d?.total_topics || 16;
    duration_hours = 10;
    progress = d?.overall_progress !== undefined ? Number(d.overall_progress) : (progress || getStoredCourseProgress(c.id, 16));
    first_topic_id = d?.current_topic_id || 'top-c-pointers-intro';
  } else if (isCAdv) {
    const d = progressMap.cAdv;
    topics_count = d?.total_topics || 16;
    duration_hours = 14;
    progress = d?.overall_progress !== undefined ? Number(d.overall_progress) : (progress || getStoredCourseProgress(c.id, 16));
    first_topic_id = d?.current_topic_id || 'top-c-advanced-structures';
  } else if (isCppFund) {
    const d = progressMap.cppFund;
    topics_count = d?.total_topics || 24;
    duration_hours = 8;
    progress = d?.overall_progress !== undefined ? Number(d.overall_progress) : (progress || getStoredCourseProgress(c.id, 24));
    first_topic_id = d?.current_topic_id || 'top-cpp-intro';
  } else if (isCppOop) {
    const d = progressMap.cppOop;
    topics_count = d?.total_topics || 16;
    duration_hours = 10;
    progress = d?.overall_progress !== undefined ? Number(d.overall_progress) : (progress || getStoredCourseProgress(c.id, 16));
    first_topic_id = d?.current_topic_id || 'top-cpp-oop-intro';
  } else if (isCppAdv) {
    const d = progressMap.cppAdv;
    topics_count = d?.total_topics || 33;
    duration_hours = 14;
    progress = d?.overall_progress !== undefined ? Number(d.overall_progress) : (progress || getStoredCourseProgress(c.id, 33));
    first_topic_id = d?.current_topic_id || 'top-cpp-adv-generic-programming-intro';
  } else if (isJavaFund) {
    const d = progressMap.javaFund;
    topics_count = d?.total_topics || 28;
    duration_hours = 8;
    progress = d?.overall_progress !== undefined ? Number(d.overall_progress) : (progress || getStoredCourseProgress(c.id, 28));
    first_topic_id = d?.current_topic_id || 'top-java-intro';
  } else if (isJavaOop) {
    const d = progressMap.javaOop;
    topics_count = d?.total_topics || 37;
    duration_hours = 10;
    progress = d?.overall_progress !== undefined ? Number(d.overall_progress) : (progress || getStoredCourseProgress(c.id, 37));
    first_topic_id = d?.current_topic_id || 'top-java-oop-intro';
  } else if (isJavaAdv) {
    const d = progressMap.javaAdv;
    topics_count = d?.total_topics || 28;
    duration_hours = 14;
    progress = d?.overall_progress !== undefined ? Number(d.overall_progress) : (progress || getStoredCourseProgress(c.id, 28));
    first_topic_id = d?.current_topic_id || 'top-java-adv-01-collections-intro';
  } else {
    topics_count = c.topics_count || (c.id === 'c-int' ? 12 : c.id === 'c-advanced-systems' ? 16 : 6);
    duration_hours = c.duration_hours || (c.level === 'intermediate' ? 10 : c.level === 'advanced' ? 14 : 8);
    progress = progress || getStoredCourseProgress(c.id, topics_count);
    first_topic_id = c.first_topic_id || (c.language === 'c' ? 'top-c-intro' : c.language === 'java' ? 'top-java-intro' : 'top-py-intro');
  }

  return {
    ...c,
    topics_count,
    duration_hours,
    difficulty: c.level === 'beginner' ? 'Beginner' : c.level === 'intermediate' ? 'Intermediate' : 'Advanced',
    progress,
    first_topic_id
  };
};

const getInitialCoursesForLanguage = (language: string): any[] => {
  const norm = (language || 'python').toLowerCase();
  const matched = (mockCourses || []).filter((c: any) => c.language === norm);
  const selected = matched.length > 0 ? matched : (mockCourses || []);
  return selected.map((c: any) => mapCourseWithProgress(c));
};


export const CourseCatalogPage: React.FC<CourseCatalogProps> = ({
  onSelectTopic,
  onOpenPythonDashboard,
  onOpenPythonIntermediateDashboard,
  onOpenPythonAdvancedDashboard,
  onOpenCDashboard,
  onOpenCIntermediateDashboard,
  onOpenCAdvancedDashboard,
  onOpenCppDashboard,
  onOpenCppOopDashboard,
  onOpenCppAdvDashboard,
  onOpenJavaDashboard,
  onOpenJavaOopDashboard,
  onOpenJavaAdvDashboard
}) => {
  const { preferences, updateLanguage } = useAuth();
  const { currentLoad } = useCognitive();
  const [activeTab, setActiveTab] = useState<'explorer' | 'roadmap'>('explorer');

  // Filters (Section 45)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(preferences.selected_language || 'python');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Initialize immediately from curriculum constants for zero loading lag
  const [courses, setCourses] = useState<any[]>(() =>
    getInitialCoursesForLanguage(preferences.selected_language || 'python')
  );
  const [loading, setLoading] = useState(false);

  // Sync selectedLanguage when preferences change (e.g. from Sidebar dropdown)
  useEffect(() => {
    if (preferences.selected_language && preferences.selected_language !== selectedLanguage) {
      setSelectedLanguage(preferences.selected_language);
      setCourses(getInitialCoursesForLanguage(preferences.selected_language));
    }
  }, [preferences.selected_language]);

  const handleSelectLanguage = (langId: string) => {
    setSelectedLanguage(langId);
    updateLanguage(langId);
    setCourses(getInitialCoursesForLanguage(langId));
  };

  useEffect(() => {
    let isMounted = true;

    // Asynchronously refresh courses from backend without showing any loading spinner
    const syncCourses = async () => {
      try {
        const list = await api.getCourses(selectedLanguage);
        if (isMounted && Array.isArray(list) && list.length > 0) {
          setCourses(list.map((c: any) => mapCourseWithProgress(c)));
        }
      } catch (err) {
        console.warn('[CourseCatalog] Background course sync notice:', err);
      }
    };

    syncCourses();

    return () => {
      isMounted = false;
    };
  }, [selectedLanguage]);

  // Filter logic
  const filteredCourses = courses.filter(c => {
    const matchLevel = selectedLevel === 'all' || c.level === selectedLevel;
    const matchDiff = selectedDifficulty === 'all' || c.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    const matchSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLevel && matchDiff && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Curriculum Explorer & Roadmaps
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse modular learning tracks or follow visual prerequisite roadmaps.
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'explorer' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Course Explorer
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'roadmap' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            Visual Roadmap
          </button>
        </div>
      </div>

      {/* Language Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'python', label: 'Python' },
          { id: 'c', label: 'C Programming' },
          { id: 'cpp', label: 'C++' },
          { id: 'java', label: 'Java' }
        ].map(lang => (
          <button
            key={lang.id}
            onClick={() => handleSelectLanguage(lang.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedLanguage === lang.id
                ? 'border-cyan-500 bg-cyan-950/40 text-cyan-400 shadow-md shadow-cyan-500/10'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-white'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {activeTab === 'roadmap' ? (
        /* SECTION 46: LANGUAGE-SPECIFIC VISUAL ROADMAP */
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40">
          <VisualRoadmap language={selectedLanguage} onSelectTopic={onSelectTopic} />
        </div>
      ) : (
        /* SECTION 45: COURSE EXPLORER */
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search topics or concepts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Easy / Beginner</option>
                <option value="intermediate">Medium</option>
                <option value="advanced">Hard / Deep</option>
              </select>
            </div>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-xs animate-pulse">
              Loading courses and topic hierarchies...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-2xl space-y-3">
              <p>No courses found matching your filter criteria.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedLevel('all');
                  setSelectedDifficulty('all');
                  setSearchQuery('');
                  setLoading(true);
                  api.getCourses(selectedLanguage).then(list => {
                    if (Array.isArray(list)) setCourses(list.map(c => mapCourseWithProgress(c)));
                  }).finally(() => setLoading(false));
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
              >
                Reset Filters & Reload
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <div
                  key={course.id}
                  className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-lg shadow-black/20"
                >
                  <div>
                    {/* Card Header: Language & Difficulty Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                        {course.language} • {course.level}
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {course.difficulty}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                      {course.description}
                    </p>

                    {/* Card Metadata */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mb-6 font-mono">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{course.topics_count} Topics</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span>{course.duration_hours} Hours</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1.5">
                        <span>Completion</span>
                        <span className="text-white font-bold">{course.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card CTA */}
                  <button
                    onClick={() => {
                      const isPyAdv =
                        course.language === 'python' &&
                        (course.id === 'py-adv' ||
                          course.title.toLowerCase().includes('advanced') ||
                          course.level === 'advanced');

                      const isPyInt =
                        course.language === 'python' &&
                        (course.id === 'py-int' ||
                          course.title.toLowerCase().includes('intermediate') ||
                          course.level === 'intermediate');

                      const isPyFund =
                        course.language === 'python' &&
                        (course.id === 'py-beg' ||
                          course.id === 'course-py-fund' ||
                          course.title.toLowerCase().includes('fundamentals') ||
                          course.level === 'beginner');

                      if (isPyAdv && onOpenPythonAdvancedDashboard) {
                        onOpenPythonAdvancedDashboard();
                      } else if (isPyInt && onOpenPythonIntermediateDashboard) {
                        onOpenPythonIntermediateDashboard();
                      } else if (isPyFund && onOpenPythonDashboard) {
                        onOpenPythonDashboard();
                      } else if (course.language === 'c') {
                        const isCAdv = course.id === 'c-advanced-systems' || course.level === 'advanced' || course.title.toLowerCase().includes('advanced') || course.title.toLowerCase().includes('systems');
                        const isCInt = course.id === 'c-int' || course.title.toLowerCase().includes('pointer') || course.title.toLowerCase().includes('memory') || course.level === 'intermediate';
                        if (isCAdv && onOpenCAdvancedDashboard) {
                          onOpenCAdvancedDashboard();
                        } else if (isCInt && onOpenCIntermediateDashboard) {
                          onOpenCIntermediateDashboard();
                        } else if (onOpenCDashboard) {
                          onOpenCDashboard();
                        } else {
                          onSelectTopic(course.first_topic_id || 'top-c-intro');
                        }
                      } else if (course.language === 'cpp') {
                        const isAdv = course.id === 'cpp-adv' || course.id === 'cpp-advanced' || course.title.toLowerCase().includes('stl') || course.level === 'advanced';
                        const isOop = course.id === 'cpp-int' || course.id === 'cpp-oop' || course.title.toLowerCase().includes('object-oriented') || course.level === 'intermediate';
                        if (isAdv && onOpenCppAdvDashboard) {
                          onOpenCppAdvDashboard();
                        } else if (isOop && onOpenCppOopDashboard) {
                          onOpenCppOopDashboard();
                        } else if (onOpenCppDashboard) {
                          onOpenCppDashboard();
                        } else {
                          onSelectTopic(course.first_topic_id || (isAdv ? 'top-cpp-adv-generic-programming-intro' : 'top-cpp-oop-intro'));
                        }
                      } else if (course.language === 'java') {
                        const isAdv = course.id === 'java-adv' || course.id === 'java-advanced' || course.title.toLowerCase().includes('collections') || course.level === 'advanced';
                        const isOop = course.id === 'java-int' || course.id === 'java-oop' || course.title.toLowerCase().includes('object-oriented') || course.level === 'intermediate';
                        if (isAdv && onOpenJavaAdvDashboard) {
                          onOpenJavaAdvDashboard();
                        } else if (isOop && onOpenJavaOopDashboard) {
                          onOpenJavaOopDashboard();
                        } else if (onOpenJavaDashboard) {
                          onOpenJavaDashboard();
                        } else {
                          onSelectTopic(course.first_topic_id || (isAdv ? 'top-java-adv-01-collections-intro' : (isOop ? 'top-java-oop-intro' : 'top-java-intro')));
                        }
                      } else {
                        const defaultTopic =
                          course.language === 'c'
                            ? 'top-c-intro'
                            : course.language === 'cpp'
                            ? 'top-cpp-intro'
                            : course.language === 'java'
                            ? 'top-java-fundamentals'
                            : 'top-py-fundamentals';
                        onSelectTopic(course.first_topic_id || defaultTopic);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <span>{course.progress === 100 ? 'Review Course' : course.progress > 0 ? 'Continue Course' : 'Start Lesson'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
