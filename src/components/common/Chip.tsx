import React from 'react';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  count?: number | string;
  active?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Chip: React.FC<ChipProps> = ({
  label,
  count,
  active = false,
  icon,
  size = 'md',
  className = '',
  onClick,
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-xs px-3 py-1 min-h-[32px] gap-1.5',
    md: 'text-sm px-4 sm:px-5 py-2 min-h-[40px] gap-2',
  }[size];

  const stateStyles = active
    ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] shadow-xs'
    : 'bg-transparent text-[var(--ink)] border-[var(--line)] hover:border-[var(--ink)] hover:-translate-y-0.5';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center justify-center rounded-full border font-sans font-medium whitespace-nowrap cursor-pointer transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${sizeStyles} ${stateStyles} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`font-mono text-[11px] ml-0.5 ${
            active ? 'opacity-80 text-[var(--paper)]' : 'text-[var(--muted)]'
          }`}
        >
          ({count})
        </span>
      )}
    </button>
  );
};
