import React from 'react';

interface FloatingTechBadgesProps {
  mousePos: { x: number; y: number };
}

export const FloatingTechBadges: React.FC<FloatingTechBadgesProps> = ({ mousePos }) => {
  // Moderate mouse offset factors for multi-plane parallax safely contained in container
  const mx = (mousePos.x - 0.5) * 14;
  const my = (mousePos.y - 0.5) * 12;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {/* 1. PYTHON BADGE (Top-Left of Robot) */}
      <div
        className="absolute top-[4%] left-[2%] sm:left-[4%] z-20 animate-float-slow transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${mx * -1}px, ${my * -1}px)`
        }}
      >
        <div className="flex items-center justify-center p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#06142B]/90 border border-cyan-400/40 backdrop-blur-xl shadow-[0_0_20px_rgba(0,212,232,0.3)] hover:border-cyan-300 transition-all">
          <svg viewBox="0 0 48 48" className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-[0_0_8px_rgba(0,212,232,0.6)]" fill="none">
            {/* Python Snake 1 (Top Cyan) */}
            <path
              d="M24 4C14.06 4 14.7 8.31 14.7 8.31L14.72 12.8H24.3V14.16H10.82C6.98 14.16 4 16.92 4 21.66C4 26.4 6.54 26.96 6.54 26.96L10.02 26.96L10.02 22.04C10.02 18.06 13.56 18.06 13.56 18.06L23.16 18.06C26.78 18.06 29.84 14.94 29.84 11.36C29.84 7.78 26.8 4 24 4Z"
              fill="url(#pyCyanGrad)"
            />
            {/* Python Snake 2 (Bottom Electric Blue) */}
            <path
              d="M24 44C33.94 44 33.3 39.69 33.3 39.69L33.28 35.2H23.7V33.84H37.18C41.02 33.84 44 31.08 44 26.34C44 21.6 41.46 21.04 41.46 21.04L37.98 21.04L37.98 25.96C37.98 29.94 34.44 29.94 34.44 29.94L24.84 29.94C21.22 29.94 18.16 33.06 18.16 36.64C18.16 40.22 21.2 44 24 44Z"
              fill="url(#pyBlueGrad)"
            />
            <circle cx="18.5" cy="8.5" r="1.5" fill="#020B1F" />
            <circle cx="29.5" cy="39.5" r="1.5" fill="#020B1F" />
            <defs>
              <linearGradient id="pyCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00D4E8" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
              <linearGradient id="pyBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* 2. C BADGE (Top-Right of Robot) */}
      <div
        className="absolute top-[2%] right-[4%] sm:right-[6%] z-20 animate-float-medium transition-transform duration-300 ease-out"
        style={{
          animationDelay: '-1.8s',
          transform: `translate(${mx * 0.8}px, ${my * -0.8}px)`
        }}
      >
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#06142B]/90 border border-blue-500/40 backdrop-blur-xl shadow-[0_0_20px_rgba(37,99,235,0.35)] hover:border-cyan-400 transition-all">
          <span className="font-extrabold text-lg sm:text-xl bg-gradient-to-br from-cyan-300 via-blue-400 to-indigo-500 bg-clip-text text-transparent font-mono drop-shadow-[0_0_8px_rgba(0,212,232,0.7)]">
            C
          </span>
        </div>
      </div>

      {/* 3. C++ BADGE (Mid-Right of Robot, kept within column bounds) */}
      <div
        className="absolute top-[32%] right-[1%] sm:right-[3%] z-20 animate-float-fast transition-transform duration-300 ease-out"
        style={{
          animationDelay: '-0.9s',
          transform: `translate(${mx * 0.7}px, ${my * 0.7}px)`
        }}
      >
        <div className="flex items-center justify-center px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl bg-[#06142B]/90 border border-cyan-400/40 backdrop-blur-xl shadow-[0_0_20px_rgba(0,212,232,0.3)] hover:border-cyan-300 transition-all">
          <span className="font-extrabold text-xs sm:text-sm bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono drop-shadow-[0_0_8px_rgba(0,212,232,0.7)]">
            C++
          </span>
        </div>
      </div>

      {/* 4. JAVA BADGE (Lower-Right of Robot) */}
      <div
        className="absolute bottom-[4%] right-[3%] sm:right-[5%] z-20 animate-float-slow transition-transform duration-300 ease-out"
        style={{
          animationDelay: '-3.2s',
          transform: `translate(${mx * 0.6}px, ${my * 0.9}px)`
        }}
      >
        <div className="flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#06142B]/90 border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_20px_rgba(0,212,232,0.3)] hover:border-cyan-300 transition-all">
          {/* Java Steaming Coffee Cup Vector */}
          <svg viewBox="0 0 32 32" className="w-5 h-5 sm:w-5.5 sm:h-5.5 drop-shadow-[0_0_6px_rgba(0,212,232,0.7)]" fill="none">
            <path d="M12 4C14 7, 10 9, 12 12" stroke="#00D4E8" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M16 3C18 6, 14 8, 16 11" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M20 4C22 7, 18 9, 20 12" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M6 14 H24 V21 C24 24.5, 20.5 27, 15 27 C9.5 27, 6 24.5, 6 21 Z" fill="rgba(0, 212, 232, 0.2)" stroke="#00D4E8" strokeWidth="1.6" />
            <path d="M24 16 H27 C28.5 16, 28.5 21, 24 21" stroke="#00D4E8" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M4 28 H28" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="text-[9px] sm:text-[10px] font-bold text-cyan-300 font-mono tracking-wide -mt-0.5">
            Java
          </span>
        </div>
      </div>

      {/* AMBIENT TECH SPARK NODE */}
      <div
        className="absolute bottom-[10%] left-[4%] sm:left-[6%] z-10 animate-float-medium transition-transform duration-300"
        style={{
          transform: `translate(${mx * -0.5}px, ${my * 0.7}px)`
        }}
      >
        <div className="w-7 h-7 rounded-lg bg-purple-900/40 border border-purple-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.3)]">
          <span className="text-[11px] font-mono text-purple-300">&#123;&nbsp;&#125;</span>
        </div>
      </div>
    </div>
  );
};

