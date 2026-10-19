import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent-ghost';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  to,
  leftIcon,
  rightIcon,
  isLoading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-sans font-medium transition-all duration-200 cursor-pointer select-none rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const variantStyles = {
    primary:
      'bg-[var(--accent)] text-[var(--on-accent)] hover:brightness-110 hover:-translate-y-0.5 shadow-sm',
    secondary:
      'border-2 border-[var(--ink)] bg-transparent text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] hover:-translate-y-0.5',
    outline:
      'border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--ink)] hover:-translate-y-0.5',
    ghost:
      'bg-transparent text-[var(--ink)] hover:bg-[var(--surface)] hover:text-[var(--accent)]',
    'accent-ghost':
      'bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20',
  }[variant];

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-5 py-2.5 min-h-[44px] gap-2',
    lg: 'text-base px-7 py-3.5 min-h-[50px] gap-2.5',
  }[size];

  const widthStyle = fullWidth ? 'w-full' : '';

  const content = (
    <>
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </>
  );

  const combinedClasses = `${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyle} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={combinedClasses}
      {...props}
    >
      {content}
    </button>
  );
};
