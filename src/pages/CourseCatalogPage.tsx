import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCognitive } from '../context/CognitiveContext';
import { api } from '../services/api';
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
}

export const CourseCatalogPage: React.FC<CourseCatalogProps> = ({ onSelectTopic, onOpenPythonDashboard }) => {
  const { preferences, updateLanguage } = useAuth();
  const { currentLoad } = useCognitive();
  const [courses, setCourses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'explorer' | 'roadmap'>('explorer');

  // Filters (Section 45)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(preferences.selected_language || 'python');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getCourses(selectedLanguage)
      .then(async list => {
        if (Array.isArray(list)) {
          // Fetch full structure for each course to calculate topics count and progress
          const detailed = await Promise.all(
            list.map(async c => {
              try {
                const struct = await api.getCourseStructure(c.id);
                const topics = (struct.modules || []).flatMap((m: any) => m.topics || []);
                return {
                  ...c,
                  topics_count: topics.length || 3,
                  duration_hours: c.level === 'beginner' ? 6 : c.level === 'intermediate' ? 10 : 14,
                  difficulty: c.level === 'beginner' ? 'Beginner' : c.level === 'intermediate' ? 'Intermediate' : 'Advanced',
                  progress: c.level === 'beginner' ? 65 : 20,
                  first_topic_id: topics[0]?.id || 'top-py-loops'
                };
              } catch {
                return {
                  ...c,
                  topics_count: 4,
                  duration_hours: 8,
                  difficulty: 'Beginner',
                  progress: 30,
                  first_topic_id: 'top-py-loops'
                };
              }
            })
          );
          setCourses(detailed);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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
            onClick={() => {
              setSelectedLanguage(lang.id);
              updateLanguage(lang.id);
            }}
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
            <div className="py-16 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
              No courses found matching your filter criteria.
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
                      const isPyFund =
                        course.id === 'py-beg' ||
                        course.id === 'course-py-fund' ||
                        course.title.toLowerCase().includes('fundamentals') ||
                        (course.language === 'python' && course.level === 'beginner');

                      if (isPyFund && onOpenPythonDashboard) {
                        onOpenPythonDashboard();
                      } else {
                        onSelectTopic(course.first_topic_id || 'top-py-loops');
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <span>Start Lesson</span>
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
