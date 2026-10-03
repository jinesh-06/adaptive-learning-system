import React, { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  mousePos: { x: number; y: number };
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ mousePos }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Star definitions for soft ambient twinkle
    interface Star {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speed: number;
      growing: boolean;
      color: string;
    }

    const stars: Star[] = [];
    const starCount = Math.min(Math.floor((width * height) / 18000), 55);
    const starColors = ['#F8FAFC', '#00D4E8', '#93C5FD', '#A78BFA'];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.7,
        radius: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.012 + 0.004,
        growing: Math.random() > 0.5,
        color: starColors[Math.floor(Math.random() * starColors.length)]
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Soft ambient twinkling stars
      for (const star of stars) {
        if (star.growing) {
          star.alpha += star.speed;
          if (star.alpha >= 0.9) star.growing = false;
        } else {
          star.alpha -= star.speed;
          if (star.alpha <= 0.15) star.growing = true;
        }

        ctx.save();
        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = star.color;
        ctx.shadowBlur = star.radius * 3.5;
        ctx.shadowColor = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Main 16:9 Futuristic Artwork Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/login-bg.png')`
        }}
      />

      {/* 2. Ambient Twinkling Stars Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
    </div>
  );
};
