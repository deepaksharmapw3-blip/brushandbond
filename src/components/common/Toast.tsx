import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'warning' | 'info' | 'error';

export interface ToastProps {
  id: string;
  title: string;
  message?: string;
  type?: ToastVariant;
  onDismiss: (id: string) => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  type = 'info',
  onDismiss,
  className = '',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-[var(--accent)]" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-l-emerald-500';
      case 'warning':
        return 'border-l-amber-500';
      case 'error':
        return 'border-l-rose-500';
      case 'info':
      default:
        return 'border-l-[var(--accent)]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.96 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`pointer-events-auto bg-[var(--surface)] border border-[var(--line)] border-l-4 ${getBorderColor()} p-4 shadow-xl flex items-start gap-3 rounded-[6px] relative overflow-hidden max-w-sm w-full ${className}`}
      role="alert"
    >
      <div className="shrink-0 mt-0.5">{getIcon()}</div>

      <div className="flex-1 min-w-0 pr-2 space-y-0.5">
        <p className="text-sm font-semibold text-[var(--ink)] leading-tight font-display">
          {title}
        </p>
        {message && (
          <p className="text-xs text-[var(--muted)] leading-relaxed font-sans">
            {message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors p-1 rounded hover:bg-[var(--paper)] shrink-0"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
