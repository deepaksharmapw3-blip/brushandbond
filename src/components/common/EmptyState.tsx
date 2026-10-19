import React from 'react';
import { Sparkles } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`text-center py-16 sm:py-24 px-6 border border-dashed border-[var(--line)] rounded-[8px] bg-[var(--surface)] space-y-6 ${className}`}
    >
      <div className="w-16 h-16 mx-auto rounded-full bg-[var(--paper)] flex items-center justify-center border border-[var(--line)] text-[var(--accent)] shadow-xs">
        {icon || <Sparkles className="w-7 h-7 text-[var(--accent)]" />}
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-[var(--muted)] font-sans leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};
