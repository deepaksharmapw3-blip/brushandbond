import React, { useEffect, useState, useRef } from 'react';

interface StatItem {
  target: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { target: 24, suffix: '+', label: 'Events conducted' },
  { target: 150, suffix: '+', label: 'Student artists' },
  { target: 12, suffix: '+', label: 'Workshops' },
  { target: 8, suffix: '+', label: 'Collaborations' },
];

export const ClubNumbers: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const duration = 1600; // ms
          const startTime = performance.now();

          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            setCounts(
              stats.map((s) => Math.floor(s.target * easeProgress))
            );

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCounts(stats.map((s) => s.target));
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section ref={containerRef} className="gallery-container">
      {/* Heavy top rule per specification */}
      <div className="border-t-2 border-[var(--ink)] pt-10 sm:pt-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-left">
          {stats.map((stat, idx) => (
            <div key={stat.label} className="space-y-2">
              <div className="font-display font-black text-4xl sm:text-6xl text-[var(--ink)] tracking-tight">
                <span>{hasAnimated ? counts[idx] : 0}</span>
                <span className="text-[var(--accent)]">{stat.suffix}</span>
              </div>
              <p className="text-xs sm:text-sm font-mono text-[var(--muted)] font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
