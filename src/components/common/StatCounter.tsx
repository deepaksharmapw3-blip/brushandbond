import React, { useState, useEffect, useRef } from 'react';

export interface StatCounterProps {
  value: number | string;
  suffix?: string;
  prefix?: string;
  label: string;
  description?: string;
  accent?: boolean;
  duration?: number;
  className?: string;
}

export const StatCounter: React.FC<StatCounterProps> = ({
  value,
  suffix = '',
  prefix = '',
  label,
  description,
  accent = false,
  duration = 1600,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number | string>(
    typeof value === 'number' ? 0 : value
  );
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const startTime = performance.now();
          const startVal = 0;
          const endVal = value;

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quart
            const easeOutProgress = 1 - Math.pow(1 - progress, 4);

            const current = Math.floor(startVal + (endVal - startVal) * easeOutProgress);
            setDisplayValue(current);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayValue(endVal);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    const currentEl = elementRef.current;
    if (currentEl) observer.observe(currentEl);

    return () => {
      if (currentEl) observer.unobserve(currentEl);
    };
  }, [value, duration, hasAnimated]);

  return (
    <div ref={elementRef} className={`space-y-1 ${className}`}>
      <div
        className={`font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${
          accent ? 'text-[var(--accent)]' : 'text-[var(--ink)]'
        }`}
      >
        <span>{prefix}</span>
        <span>{displayValue}</span>
        <span>{suffix}</span>
      </div>
      <div className="font-sans font-semibold text-sm sm:text-base text-[var(--ink)]">
        {label}
      </div>
      {description && (
        <p className="text-xs font-mono text-[var(--muted)] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
