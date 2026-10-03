import React from 'react';
import { Brain, Code2, TrendingUp, Star } from 'lucide-react';

interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: Brain,
    title: 'Adaptive Learning',
    description: 'Learns your pace and adjusts'
  },
  {
    icon: Code2,
    title: 'Hands-on Practice',
    description: 'Real code, real skills'
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'See your improvement'
  },
  {
    icon: Star,
    title: 'Multiple Languages',
    description: 'Python, C, C++, Java and more'
  }
];

export const FeatureHighlights: React.FC = () => {
  return (
    <div className="space-y-2 sm:space-y-2.5 lg:space-y-2 xl:space-y-3 max-w-sm sm:max-w-md">
      {FEATURES.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div
            key={item.title}
            className="group flex items-center gap-3 p-1.5 sm:p-2 rounded-xl transition-all duration-300 hover:translate-x-1"
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            {/* Glowing Rounded Square Icon Container */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-8 lg:h-8 xl:w-10 xl:h-10 rounded-xl bg-[#06142B]/90 border border-cyan-400/50 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,212,232,0.2)] group-hover:border-cyan-300 group-hover:shadow-[0_0_18px_rgba(0,212,232,0.4)] group-hover:scale-105 transition-all">
              <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-[#00D4E8] group-hover:text-white transition-colors" />
            </div>

            {/* Feature Text */}
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm lg:text-xs xl:text-sm font-bold text-white tracking-tight group-hover:text-cyan-200 transition-colors">
                {item.title}
              </h3>
              <p className="text-[11px] sm:text-xs lg:text-[11px] xl:text-xs text-[#A5B4CC] leading-snug">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
