import React, { useState, useEffect } from 'react';
import { ListCollapse, ChevronDown, Bookmark, ArrowUp, AlignLeft } from 'lucide-react';

export interface TOCItem {
  id: string;
  label: string;
  badge?: string;
}

export const DEFAULT_TOC_ITEMS: TOCItem[] = [
  { id: 'section-header', label: 'Overview & Objectives' },
  { id: 'section-adaptive', label: 'Adaptive Insight' },
  { id: 'section-intro', label: 'Introduction' },
  { id: 'section-concept', label: 'Concept Explanation' },
  { id: 'section-syntax', label: 'Syntax & Usage' },
  { id: 'section-code-example', label: 'Interactive Code Example' },
  { id: 'section-visual', label: 'Visual Model' },
  { id: 'section-takeaway', label: 'Key Takeaways' },
  { id: 'section-mistakes', label: 'Common Mistakes' },
  { id: 'section-real-world', label: 'Real-World Application' },
  { id: 'section-try-yourself', label: 'Try Yourself', badge: 'Practice' },
  { id: 'section-mini-quiz', label: 'Mini Quiz', badge: 'Quiz' },
  { id: 'section-challenge', label: 'Coding Challenge', badge: 'Challenge' },
  { id: 'section-summary', label: 'Lesson Summary' }
];

interface LessonTOCProps {
  items?: TOCItem[];
  activeId?: string;
  onSelectSection?: (id: string) => void;
  isMobileDropdown?: boolean;
}

export const LessonTOC: React.FC<LessonTOCProps> = ({
  items = DEFAULT_TOC_ITEMS,
  activeId: controlledActiveId,
  onSelectSection,
  isMobileDropdown = false
}) => {
  const [activeSection, setActiveSection] = useState<string>(controlledActiveId || items[0]?.id || '');
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  useEffect(() => {
    if (controlledActiveId) {
      setActiveSection(controlledActiveId);
    }
  }, [controlledActiveId]);

  // Set up scroll spy with IntersectionObserver
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1
      }
    );

    items.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollTo = (id: string) => {
    if (onSelectSection) {
      onSelectSection(id);
    }
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -70; // offset for sticky top bars
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setActiveSection(id);
    setIsOpenMobile(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isMobileDropdown) {
    const currentItem = items.find(i => i.id === activeSection) || items[0];
    return (
      <div className="relative w-full mb-4 lg:hidden">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-800 light-theme:border-slate-300 bg-slate-900/90 light-theme:bg-white text-xs font-semibold text-slate-200 light-theme:text-slate-800 shadow-sm"
        >
          <div className="flex items-center gap-2 truncate">
            <AlignLeft className="w-3.5 h-3.5 text-cyan-400 light-theme:text-blue-600" />
            <span className="text-slate-400 light-theme:text-slate-500 font-normal">On This Page:</span>
            <span className="truncate font-bold text-white light-theme:text-slate-900">{currentItem?.label}</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpenMobile ? 'rotate-180' : ''}`} />
        </button>

        {isOpenMobile && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-slate-950 light-theme:bg-white border border-slate-800 light-theme:border-slate-300 rounded-xl shadow-2xl p-2 max-h-80 overflow-y-auto space-y-1">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                  activeSection === item.id
                    ? 'bg-cyan-500/15 light-theme:bg-blue-50 text-cyan-300 light-theme:text-blue-700 font-bold'
                    : 'text-slate-400 light-theme:text-slate-600 hover:text-white hover:bg-slate-900 light-theme:hover:bg-slate-100'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 light-theme:bg-slate-200 text-slate-400">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <nav className="sticky top-20 select-none py-2 pr-2 text-xs">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80 light-theme:border-slate-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 light-theme:text-slate-500 flex items-center gap-1.5">
          <AlignLeft className="w-3.5 h-3.5 text-cyan-400 light-theme:text-blue-600" />
          On This Page
        </span>
        <button
          onClick={scrollToTop}
          className="text-[10px] text-slate-500 hover:text-cyan-400 light-theme:hover:text-blue-600 flex items-center gap-0.5 transition-colors"
          title="Back to top"
        >
          <ArrowUp className="w-3 h-3" />
          Top
        </button>
      </div>

      <div className="space-y-1 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar pr-1">
        {items.map(item => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`w-full group flex items-center justify-between text-left py-1.5 px-2.5 rounded-lg transition-all ${
                isActive
                  ? 'text-cyan-300 light-theme:text-blue-700 font-semibold bg-cyan-950/30 light-theme:bg-blue-50 border-l-2 border-cyan-400 light-theme:border-blue-600'
                  : 'text-slate-400 light-theme:text-slate-600 hover:text-slate-200 light-theme:hover:text-slate-900 hover:bg-slate-900/40 light-theme:hover:bg-slate-100 border-l-2 border-transparent'
              }`}
            >
              <span className="truncate pr-1">{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 light-theme:bg-blue-200 light-theme:text-blue-800'
                      : 'bg-slate-800 light-theme:bg-slate-200 text-slate-500 light-theme:text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
