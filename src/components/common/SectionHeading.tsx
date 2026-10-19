import React from 'react';

export interface SectionHeadingProps {
  eyebrow?: string;
  eyebrowIcon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: 'left' | 'center' | 'between';
  className?: string;
  id?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  action,
  align = 'left',
  className = '',
  id,
}) => {
  if (align === 'center') {
    return (
      <div id={id} className={`text-center space-y-3 max-w-3xl mx-auto ${className}`}>
        {eyebrow && (
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
            {eyebrowIcon && <span className="shrink-0">{eyebrowIcon}</span>}
            <span>{eyebrow}</span>
          </div>
        )}
        <h2 className="section-title text-[var(--ink)]">{title}</h2>
        {description && (
          <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed font-sans max-w-[65ch] mx-auto">
            {description}
          </p>
        )}
        {action && <div className="pt-2">{action}</div>}
      </div>
    );
  }

  if (align === 'between') {
    return (
      <div
        id={id}
        className={`flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--line)] pb-5 ${className}`}
      >
        <div className="space-y-3 max-w-3xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
              {eyebrowIcon && <span className="shrink-0">{eyebrowIcon}</span>}
              <span>{eyebrow}</span>
            </div>
          )}
          <h2 className="section-title text-[var(--ink)]">{title}</h2>
          {description && (
            <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed font-sans max-w-[65ch]">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  }

  // align === 'left'
  return (
    <div id={id} className={`space-y-3 max-w-3xl ${className}`}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
          {eyebrowIcon && <span className="shrink-0">{eyebrowIcon}</span>}
          <span>{eyebrow}</span>
        </div>
      )}
      <h2 className="section-title text-[var(--ink)]">{title}</h2>
      {description && (
        <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed font-sans max-w-[65ch]">
          {description}
        </p>
      )}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
