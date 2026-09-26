import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Search,
  ArrowRight,
  X,
  Compass,
  GraduationCap
} from 'lucide-react';
import { api } from '../../services/api';
import { mockCourses } from '../../services/mockFallback';

export interface CurriculumTopic {
  id: string;
  title: string;
  level?: string;
  status?: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED' | 'UPCOMING';
  duration?: string;
}

export interface CurriculumModule {
  id: string;
  title: string;
  order: number;
  topics: CurriculumTopic[];
}

export interface CourseCurriculumSidebarProps {
  courseTitle?: string;
  currentTopicId: string;
  onSelectTopic: (topicId: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  language?: string;
}

export const CourseCurriculumSidebar: React.FC<CourseCurriculumSidebarProps> = ({
  courseTitle = 'Python Programming Masterclass',
  currentTopicId,
  onSelectTopic,
  isOpen = true,
  onClose,
  language = 'python'
}) => {
  const [modules, setModules] = useState<CurriculumModule[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCurriculum = async () => {
      setLoading(true);
      try {
        // Try getting course structure from API
        const courseData = await api.getCourses(language);
        if (isMounted && courseData && courseData.length > 0) {
          const targetCourse = courseData.find((c: any) => c.language === language) || courseData[0];
          if (targetCourse && targetCourse.modules) {
            setModules(targetCourse.modules);
            initializeExpanded(targetCourse.modules);
            return;
          }
        }
      } catch (e) {
        console.warn('API course load failed, falling back to mock curriculum:', e);
      }

      // Fallback to mockCourses
      const mockC = mockCourses.find((c: any) => c.language === language) || mockCourses[0];
      if (isMounted && mockC && mockC.modules) {
        setModules(mockC.modules);
        initializeExpanded(mockC.modules);
      }
      setLoading(false);
    };

    const initializeExpanded = (mods: CurriculumModule[]) => {
      const initial: Record<string, boolean> = {};
      mods.forEach(m => {
        // Automatically expand the module containing the current topic
        const hasCurrent = m.topics.some(t => t.id === currentTopicId);
        initial[m.id] = hasCurrent || m.order === 1;
      });
      setExpandedModules(initial);
      setLoading(false);
    };

    loadCurriculum();

    return () => {
      isMounted = false;
    };
  }, [language, currentTopicId]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Determine completed topics from localStorage
  const getTopicStatus = (topicId: string, idx: number, modIdx: number): 'COMPLETED' | 'CURRENT' | 'UPCOMING' => {
    if (topicId === currentTopicId) return 'CURRENT';
    const isCompleted = localStorage.getItem(`topic_completed_${topicId}`) === 'true';
    if (isCompleted) return 'COMPLETED';
    // If not recorded, earlier topics in earlier modules count as completed for UX baseline
    if (modIdx === 0 && idx === 0 && topicId !== currentTopicId) return 'COMPLETED';
    return 'UPCOMING';
  };

  // Calculate overall course progress
  const allTopics = modules.flatMap(m => m.topics);
  const totalTopics = allTopics.length || 1;
  const currentTopicIndex = allTopics.findIndex(t => t.id === currentTopicId);
  const completedCount = allTopics.filter((t, idx) => {
    return localStorage.getItem(`topic_completed_${t.id}`) === 'true' || idx < currentTopicIndex;
  }).length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalTopics) * 100));

  // Filter modules/topics by search query
  const filteredModules = modules.map(m => {
    if (!searchQuery.trim()) return m;
    const q = searchQuery.toLowerCase();
    const matchingTopics = m.topics.filter(t => t.title.toLowerCase().includes(q));
    const moduleMatches = m.title.toLowerCase().includes(q);
    return {
      ...m,
      topics: moduleMatches ? m.topics : matchingTopics
    };
  }).filter(m => m.topics.length > 0);

  return (
    <aside
      className={`flex flex-col h-full bg-slate-900/90 dark:bg-slate-950/90 light-theme:bg-white border-r border-slate-800 light-theme:border-slate-200 transition-all duration-300 w-full select-none`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 light-theme:border-slate-200">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-cyan-400 light-theme:text-blue-600 font-bold text-xs uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Curriculum</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 light-theme:hover:bg-slate-100 text-slate-400"
              aria-label="Close curriculum sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <h3 className="font-extrabold text-sm text-slate-100 light-theme:text-slate-900 truncate" title={courseTitle}>
          {courseTitle}
        </h3>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 light-theme:text-slate-600 mb-1">
            <span>Course Progress</span>
            <span className="font-mono font-semibold text-cyan-400 light-theme:text-blue-600">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 light-theme:bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Search within curriculum */}
        <div className="relative mt-3">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-950/60 light-theme:bg-slate-100 border border-slate-800 light-theme:border-slate-300 text-slate-200 light-theme:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Modules and Topics list */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-2 custom-scrollbar">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 rounded-lg bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">
            No lessons match "{searchQuery}"
          </div>
        ) : (
          filteredModules.map((module, modIdx) => {
            const isExpanded = !!expandedModules[module.id];
            const hasCurrentTopic = module.topics.some(t => t.id === currentTopicId);

            return (
              <div
                key={module.id}
                className="rounded-xl border border-slate-800/60 light-theme:border-slate-200 overflow-hidden bg-slate-950/40 light-theme:bg-slate-50"
              >
                {/* Module Header Button */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className={`w-full flex items-center justify-between p-2.5 text-left text-xs font-semibold transition-colors ${
                    hasCurrentTopic
                      ? 'text-cyan-400 light-theme:text-blue-600 bg-cyan-950/20 light-theme:bg-blue-50'
                      : 'text-slate-300 light-theme:text-slate-700 hover:text-white hover:bg-slate-800/50 light-theme:hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-mono text-[10px] text-slate-500 light-theme:text-slate-400">
                      {String(modIdx + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate">{module.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  )}
                </button>

                {/* Topics in Module */}
                {isExpanded && (
                  <div className="px-1.5 pb-2 pt-1 space-y-0.5 border-t border-slate-800/40 light-theme:border-slate-200">
                    {module.topics.map((topic, topicIdx) => {
                      const status = getTopicStatus(topic.id, topicIdx, modIdx);
                      const isCurrent = status === 'CURRENT';
                      const isCompleted = status === 'COMPLETED';

                      return (
                        <button
                          key={topic.id}
                          onClick={() => onSelectTopic(topic.id)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-all ${
                            isCurrent
                              ? 'bg-cyan-500/15 light-theme:bg-blue-100 text-cyan-300 light-theme:text-blue-700 font-bold border border-cyan-500/40 shadow-sm'
                              : isCompleted
                              ? 'text-slate-300 light-theme:text-slate-700 hover:bg-slate-800/40 light-theme:hover:bg-slate-100'
                              : 'text-slate-400 light-theme:text-slate-500 hover:text-slate-200 hover:bg-slate-800/30'
                          }`}
                        >
                          {/* Indicator: ✓ completed, → current, ○ upcoming */}
                          <span className="shrink-0 flex items-center justify-center">
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : isCurrent ? (
                              <span className="text-cyan-400 light-theme:text-blue-600 font-bold font-mono">→</span>
                            ) : (
                              <Circle className="w-2.5 h-2.5 text-slate-600 light-theme:text-slate-400" />
                            )}
                          </span>

                          <span className="truncate flex-1">{topic.title}</span>

                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-cyan-400/20 text-cyan-300 light-theme:bg-blue-200 light-theme:text-blue-800">
                              Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
