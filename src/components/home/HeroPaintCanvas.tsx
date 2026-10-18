import React, { useEffect, useRef } from 'react';

interface StrokeSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  alpha: number;
  decay: number;
}

interface HeroPaintCanvasProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

export const HeroPaintCanvas: React.FC<HeroPaintCanvasProps> = ({ containerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let segments: StrokeSegment[] = [];
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let isDrawing = false;
    let animFrameId: number;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const getAccentRgb = (): [number, number, number] => {
      const style = getComputedStyle(document.documentElement);
      const accent = style.getPropertyValue('--accent').trim();
      if (accent.startsWith('#')) {
        const hex = accent.replace('#', '');
        if (hex.length === 6) {
          return [
            parseInt(hex.slice(0, 2), 16),
            parseInt(hex.slice(2, 4), 16),
            parseInt(hex.slice(4, 6), 16),
          ];
        }
      }
      return [47, 60, 255]; // fallback light accent #2F3CFF
    };

    const addSegment = (currentX: number, currentY: number) => {
      const now = performance.now();
      if (lastTime > 0) {
        const dt = Math.max(now - lastTime, 1);
        const dist = Math.hypot(currentX - lastX, currentY - lastY);
        const speed = dist / dt; // pixels per ms

        // Stroke width varies with speed (faster = broader gestural brush)
        const width = Math.min(32, Math.max(6, 8 + speed * 10));

        segments.push({
          x1: lastX,
          y1: lastY,
          x2: currentX,
          y2: currentY,
          width,
          alpha: 0.85,
          decay: 0.008, // fades out smoothly over ~2-3 seconds
        });
      }
      lastX = currentX;
      lastY = currentY;
      lastTime = now;
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (!isDrawing) {
        isDrawing = true;
        lastX = x;
        lastY = y;
        lastTime = performance.now();
      } else {
        addSegment(x, y);
      }
    };

    const handlePointerLeave = () => {
      isDrawing = false;
      lastTime = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      if (!isDrawing) {
        isDrawing = true;
        lastX = x;
        lastY = y;
        lastTime = performance.now();
      } else {
        addSegment(x, y);
      }
    };

    const handleTouchEnd = () => {
      isDrawing = false;
      lastTime = 0;
    };

    container.addEventListener('mousemove', handlePointerMove, { passive: true });
    container.addEventListener('mouseleave', handlePointerLeave);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    // Render loop
    const render = () => {
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (segments.length > 0) {
        const [r, g, b] = getAccentRgb();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw and decay segments
        for (let i = 0; i < segments.length; i++) {
          const s = segments[i];
          s.alpha -= s.decay;

          if (s.alpha > 0) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${s.alpha.toFixed(3)})`;
            ctx.lineWidth = s.width;
            ctx.moveTo(s.x1, s.y1);
            ctx.lineTo(s.x2, s.y2);
            ctx.stroke();
          }
        }

        // Clean up decayed segments
        segments = segments.filter((s) => s.alpha > 0);
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      ro.disconnect();
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mouseleave', handlePointerLeave);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
