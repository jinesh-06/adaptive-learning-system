import React from 'react';
import { Brain, Sparkles, Terminal } from 'lucide-react';

interface AILearningRobotProps {
  mousePos: { x: number; y: number };
}

export const AILearningRobot: React.FC<AILearningRobotProps> = ({ mousePos }) => {
  // Controlled subtle tilt and translation so it never clips or drifts into neighbor columns
  const tiltX = (mousePos.y - 0.5) * -8;
  const tiltY = (mousePos.x - 0.5) * 10;
  const shiftX = (mousePos.x - 0.5) * 8;
  const shiftY = (mousePos.y - 0.5) * 8;

  return (
    <div
      className="relative flex items-center justify-center select-none w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[300px] xl:max-w-[360px] mx-auto"
      style={{
        transform: `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(${shiftX}px, ${shiftY}px, 0)`,
        transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.4, 1)'
      }}
    >
      {/* Soft Cyan & Blue Aura Glow Underneath */}
      <div className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-cyan-500/25 via-blue-600/20 to-purple-600/20 blur-3xl pointer-events-none animate-aura-glow" />

      {/* Floating Robot Main Container */}
      <div className="relative animate-robot-hover z-10 flex flex-col items-center">
        
        {/* SVG Robot Character Replicating the Futuristic Learning AI */}
        <svg
          viewBox="0 0 340 360"
          className="w-44 sm:w-52 md:w-56 lg:w-48 xl:w-60 h-auto drop-shadow-[0_12px_28px_rgba(0,212,232,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Robot Head Helmet Gradient */}
            <linearGradient id="robotHelmetGrad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#E0F2FE" />
              <stop offset="70%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            {/* Dark Visor Gradient */}
            <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#030A1C" />
              <stop offset="60%" stopColor="#061A3D" />
              <stop offset="100%" stopColor="#0B2754" />
            </linearGradient>

            {/* Cyan Eye & Glow Gradient */}
            <linearGradient id="cyanEyeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D4E8" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            {/* Laptop Base Gradient */}
            <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0E2347" />
              <stop offset="50%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            {/* Body Armor Gradient */}
            <linearGradient id="armorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F0F9FF" />
              <stop offset="50%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            {/* Headphone Ring Neon Glow */}
            <filter id="neonHeadphoneGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Eye Intense Glow Filter */}
            <filter id="eyeGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* HEADPHONE / EARS - Left and Right */}
          {/* Left Headphone */}
          <g>
            <rect x="52" y="112" width="22" height="48" rx="10" fill="#0A1E42" stroke="#00D4E8" strokeWidth="2.5" />
            <circle cx="63" cy="136" r="14" fill="#06142E" stroke="#00D4E8" strokeWidth="2.5" filter="url(#neonHeadphoneGlow)" />
            <circle cx="63" cy="136" r="6" fill="#00D4E8" className="animate-pulse" />
          </g>

          {/* Right Headphone */}
          <g>
            <rect x="266" y="112" width="22" height="48" rx="10" fill="#0A1E42" stroke="#00D4E8" strokeWidth="2.5" />
            <circle cx="277" cy="136" r="14" fill="#06142E" stroke="#00D4E8" strokeWidth="2.5" filter="url(#neonHeadphoneGlow)" />
            <circle cx="277" cy="136" r="6" fill="#00D4E8" className="animate-pulse" />
          </g>

          {/* Headphone Connecting Arc Band Over Helmet */}
          <path
            d="M 68 120 C 68 50, 272 50, 272 120"
            stroke="url(#robotHelmetGrad)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 80 115 C 80 58, 260 58, 260 115"
            stroke="#00D4E8"
            strokeWidth="2.5"
            strokeDasharray="10 8"
          />

          {/* ROBOT HEAD HELMET (Glossy White/Cyan Curvature) */}
          <rect
            x="70"
            y="65"
            width="200"
            height="145"
            rx="72"
            fill="url(#robotHelmetGrad)"
            stroke="#BAE6FD"
            strokeWidth="2.5"
          />

          {/* Helmet Top Specular Reflection Highlight */}
          <path
            d="M 105 82 C 135 72, 205 72, 235 82"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* DARK GLOSSY VISOR */}
          <rect
            x="88"
            y="94"
            width="164"
            height="98"
            rx="46"
            fill="url(#visorGrad)"
            stroke="#0284C7"
            strokeWidth="2"
          />

          {/* Visor Specular Glass Arc Highlight */}
          <path
            d="M 108 108 C 135 100, 205 100, 232 108"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* EXPRESSIVE ILLUMINATED CYAN EYES (Curved Happy / Friendly Arcs with Blink Animation) */}
          <g className="animate-eye-blink" filter="url(#eyeGlowFilter)">
            {/* Left Eye: Expressive smiling curved arc */}
            <path
              d="M 120 144 C 124 130, 144 130, 148 144"
              stroke="#00D4E8"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right Eye: Expressive smiling curved arc */}
            <path
              d="M 192 144 C 196 130, 216 130, 220 144"
              stroke="#00D4E8"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Cheerful Soft Blue Blush Cheeks */}
          <circle cx="112" cy="156" r="6" fill="#00D4E8" opacity="0.35" filter="url(#neonHeadphoneGlow)" />
          <circle cx="228" cy="156" r="6" fill="#00D4E8" opacity="0.35" filter="url(#neonHeadphoneGlow)" />

          {/* ROBOT NECK / JOINT */}
          <rect x="146" y="206" width="48" height="14" rx="6" fill="#082F49" stroke="#0284C7" strokeWidth="1.5" />
          <line x1="154" y1="213" x2="186" y2="213" stroke="#00D4E8" strokeWidth="1.5" />

          {/* ROBOT TORSO & BODY */}
          <path
            d="M 105 218 L 235 218 C 248 218, 256 230, 252 248 L 244 290 C 242 302, 232 310, 220 310 L 120 310 C 108 310, 98 302, 96 290 L 88 248 C 84 230, 92 218, 105 218 Z"
            fill="url(#armorGrad)"
            stroke="#BAE6FD"
            strokeWidth="2.5"
          />

          {/* Torso Center Glowing Chest Emblem */}
          <circle cx="170" cy="248" r="13" fill="#061A3D" stroke="#00D4E8" strokeWidth="2" />
          <circle cx="170" cy="248" r="6" fill="#00D4E8" filter="url(#neonHeadphoneGlow)" className="animate-pulse" />

          {/* ROBOT ARMS HOLDING LAPTOP */}
          {/* Left Arm & Hand */}
          <path
            d="M 94 236 C 80 255, 88 285, 126 288"
            stroke="url(#robotHelmetGrad)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Right Arm & Hand */}
          <path
            d="M 246 236 C 260 255, 252 285, 214 288"
            stroke="url(#robotHelmetGrad)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* LAPTOP (HELD IN FRONT OF ROBOT) */}
          {/* Laptop Base */}
          <path
            d="M 108 285 L 232 285 L 246 304 L 94 304 Z"
            fill="url(#laptopGrad)"
            stroke="#00D4E8"
            strokeWidth="1.8"
          />
          {/* Illuminated Keyboard Bed */}
          <path
            d="M 114 288 L 226 288 L 236 300 L 104 300 Z"
            fill="#05122B"
          />
          <line x1="120" y1="294" x2="220" y2="294" stroke="#00D4E8" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />

          {/* Laptop Lid / Screen Angled Forward Displaying CognitiveLoad Brain Logo */}
          <g>
            <path
              d="M 124 234 L 216 234 L 226 284 L 114 284 Z"
              fill="url(#laptopGrad)"
              stroke="#00D4E8"
              strokeWidth="2"
            />
            {/* Glowing Screen Outer Shadow */}
            <path
              d="M 130 238 L 210 238 L 220 280 L 120 280 Z"
              fill="#061736"
            />

            {/* Glowing Brain Emblem on Laptop Screen */}
            <g transform="translate(155, 246) scale(0.65)" filter="url(#eyeGlowFilter)">
              <path
                d="M12 2a5 5 0 0 1 5 5v1a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4v1a5 5 0 0 1-10 0v-1a4 4 0 0 1-4-4v-1a4 4 0 0 1 4-4V7a5 5 0 0 1 5-5z"
                stroke="#00D4E8"
                strokeWidth="2.5"
                fill="rgba(0, 212, 232, 0.3)"
              />
              <path d="M12 2v20" stroke="#00D4E8" strokeWidth="1.5" />
            </g>

            {/* Light Cone Projecting Upward onto Visor */}
            <polygon
              points="130,238 210,238 230,195 110,195"
              fill="url(#cyanEyeGrad)"
              opacity="0.12"
            />
          </g>

          {/* Robot Hands Clamping Laptop */}
          <ellipse cx="120" cy="286" rx="9" ry="7" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
          <ellipse cx="220" cy="286" rx="9" ry="7" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
        </svg>

        {/* Floating Holographic Code Window on the Robot's Right Side (safely positioned within bounds) */}
        <div
          className="absolute right-[-4px] sm:right-[-2px] bottom-3 sm:bottom-4 w-36 sm:w-44 p-2 sm:p-2.5 rounded-xl bg-[#06142B]/95 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_20px_rgba(0,212,232,0.25)] animate-float-medium pointer-events-none z-20"
          style={{ animationDelay: '-1.5s' }}
        >
          {/* Code Window Header */}
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-cyan-500/20">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500/80" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-1 text-[9px] text-cyan-400 font-mono">
              <Terminal className="w-2.5 h-2.5" />
              <span>adaptive.py</span>
            </div>
          </div>

          {/* Syntax Code Snippet */}
          <div className="font-mono text-[8px] sm:text-[9px] leading-snug text-slate-300 space-y-0.5">
            <div>
              <span className="text-purple-400">def</span>{' '}
              <span className="text-cyan-400">adapt_learning</span>():
            </div>
            <div className="pl-2.5 text-slate-400">
              load = <span className="text-blue-400">eval_pace</span>()
            </div>
            <div className="pl-2.5 text-emerald-400">
              # Calibrate model
            </div>
            <div className="pl-2.5">
              <span className="text-purple-400">return</span>{' '}
              <span className="text-amber-300">optimize</span>(load)
            </div>
          </div>

          {/* Glowing bottom indicator */}
          <div className="mt-1.5 pt-1 flex items-center justify-between text-[7px] sm:text-[8px] text-cyan-300/80 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Live Synthesis
            </span>
            <span>100% Calibrated</span>
          </div>
        </div>

      </div>
    </div>
  );
};
