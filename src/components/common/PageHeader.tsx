import React from 'react';

export interface PageHeaderProps {
  eyebrow?: string;
  eyebrowIcon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  stats?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  actions,
  stats,
  className = '',
}) => {
  return (
    <section className={`gallery-container space-y-6 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[var(--line)] pb-8">
        <div className="space-y-4 max-w-3xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold tracking-wider uppercase flex-wrap">
              {eyebrowIcon && <span className="shrink-0">{eyebrowIcon}</span>}
              <span>{eyebrow}</span>
            </div>
          )}

          <h1 className="page-title text-[var(--ink)]">{title}</h1>

          {description && (
            <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed max-w-[68ch] font-sans">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="shrink-0 flex items-center gap-3 flex-wrap">{actions}</div>}
      </div>

      {stats && <div className="pt-2">{stats}</div>}
    </section>
  );
};
