import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface CursorPaintProps {
  containerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  palette?: string[];
}

export const CursorPaint: React.FC<CursorPaintProps> = ({
  containerRef,
  className = '',
  palette,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const defaultColors =
      theme === 'dark'
        ? ['#7E88FF', '#F2EEE5', '#A09B8F', '#4A55A2', '#C69749']
        : ['#2F3CFF', '#15130F', '#B87333', '#C2593F', '#4E6E5D'];

    const activePalette = palette || defaultColors;

    const resizeCanvas = () => {
      const container = containerRef?.current || canvas.parentElement || document.body;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const addParticle = (x: number, y: number) => {
      const count = 2;
      for (let i = 0; i < count; i++) {
        const color = activePalette[Math.floor(Math.random() * activePalette.length)];
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 12 + 4,
          color,
          alpha: Math.random() * 0.4 + 0.25,
          decay: Math.random() * 0.008 + 0.004,
        });
      }

      if (particles.length > 120) {
        particles.splice(0, particles.length - 120);
      }
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      const rect = canvasEl.getBoundingClientRect();

      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        addParticle(x, y);
      }
    };

    const targetElement = containerRef?.current || window;
    targetElement.addEventListener('mousemove', handlePointerMove as EventListener);
    targetElement.addEventListener('touchmove', handlePointerMove as EventListener, { passive: true });

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      targetElement.removeEventListener('mousemove', handlePointerMove as EventListener);
      targetElement.removeEventListener('touchmove', handlePointerMove as EventListener);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, containerRef, palette]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
};
