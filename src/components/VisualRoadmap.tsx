import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  CheckCircle2,
  Lock,
  PlayCircle,
  AlertTriangle,
  ArrowDown,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface RoadmapNode {
  topic_id: string;
  title: string;
  module_title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'COMPLETED' | 'CURRENT' | 'LOCKED' | 'RECOMMENDED' | 'REVISION_REQUIRED';
  order_index: number;
  prerequisite_id?: string;
}

interface VisualRoadmapProps {
  language: string;
  onSelectTopic: (topicId: string) => void;
}

export const VisualRoadmap: React.FC<VisualRoadmapProps> = ({
  language,
  onSelectTopic
}) => {
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getLanguageRoadmap(language)
      .then(data => {
        if (Array.isArray(data)) setNodes(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [language]);

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
        Loading {language.toUpperCase()} visual roadmap...
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 text-xs">
        No roadmap nodes mapped for {language}.
      </div>
    );
  }

  const getStatusBadge = (status: RoadmapNode['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'CURRENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 animate-pulse">
            <PlayCircle className="w-3.5 h-3.5" /> Current
          </span>
        );
      case 'RECOMMENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Recommended Next
          </span>
        );
      case 'REVISION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/60 text-rose-400 border border-rose-500/40 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" /> Revision Required
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-500 border border-slate-800">
            <Lock className="w-3 h-3" /> Locked
          </span>
        );
    }
  };

  return (
    <div className="py-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">
          {language} Visual Roadmap
        </h3>
        <p className="text-xs text-slate-400">
          Personalized progression track based on topic completion and active retention.
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4 relative">
        {nodes.map((node, idx) => {
          const isClickable = node.status !== 'LOCKED';

          return (
            <React.Fragment key={node.topic_id}>
              <div
                onClick={() => isClickable && onSelectTopic(node.topic_id)}
                className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  node.status === 'CURRENT'
                    ? 'border-cyan-500/50 bg-gradient-to-r from-cyan-950/30 to-slate-900/80 shadow-lg shadow-cyan-500/10 cursor-pointer hover:border-cyan-400'
                    : node.status === 'REVISION_REQUIRED'
                    ? 'border-rose-500/50 bg-gradient-to-r from-rose-950/30 to-slate-900/80 cursor-pointer hover:border-rose-400'
                    : node.status === 'COMPLETED'
                    ? 'border-slate-800 bg-slate-900/60 cursor-pointer hover:border-emerald-500/40'
                    : node.status === 'RECOMMENDED'
                    ? 'border-amber-500/40 bg-slate-900/80 cursor-pointer hover:border-amber-400'
                    : 'border-slate-800/60 bg-slate-950/40 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    node.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                    node.status === 'CURRENT' ? 'bg-cyan-500 text-slate-950' :
                    node.status === 'REVISION_REQUIRED' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight mb-0.5">
                      {node.title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {node.module_title} • <span className="capitalize">{node.level}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(node.status)}
                  {isClickable && (
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                  )}
                </div>
              </div>

              {idx < nodes.length - 1 && (
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-4 bg-slate-800" />
                  <ArrowDown className="w-3.5 h-3.5 text-slate-600 -my-1" />
                  <div className="w-0.5 h-4 bg-slate-800" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
