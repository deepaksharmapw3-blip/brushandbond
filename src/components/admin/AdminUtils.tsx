import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, X, Trash2, Edit, Plus } from 'lucide-react';

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
export interface AdminToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const AdminToast: React.FC<AdminToastProps> = ({ message, type, onClose }) => {
  const bgColor = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };

  const textColor = {
    success: 'text-green-700 dark:text-green-300',
    error: 'text-red-700 dark:text-red-300',
    info: 'text-blue-700 dark:text-blue-300',
  };

  const iconClass = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -10, x: 20 }}
      className={`fixed top-6 right-6 p-4 rounded-lg border flex items-start gap-3 max-w-sm z-50 ${bgColor[type]}`}
    >
      {type === 'success' && <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconClass[type]}`} />}
      {type === 'error' && <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconClass[type]}`} />}
      {type === 'info' && <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconClass[type]}`} />}
      <p className={`text-sm ${textColor[type]}`}>{message}</p>
      <button onClick={onClose} className={`ml-auto ${textColor[type]} hover:opacity-70`}>
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

/* ============================================================
   CONFIRM DIALOG
   ============================================================ */
export interface ConfirmDialogProps {
  title: string;
  description?: string;
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  description,
  isOpen,
  isLoading = false,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/20 z-40"
          />
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg shadow-lg max-w-sm w-full">
              <div className="p-6">
                <h2 className="text-lg font-bold text-[var(--ink)] mb-2">{title}</h2>
                {description && <p className="text-sm text-[var(--muted)]">{description}</p>}
              </div>
              <div className="flex gap-3 justify-end p-6 border-t border-[var(--line)]">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper)] rounded-lg transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm font-medium text-[var(--on-accent)] rounded-lg transition-colors disabled:opacity-50 ${
                    isDangerous
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-[var(--accent)] hover:opacity-90'
                  }`}
                >
                  {isLoading ? 'Loading...' : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ============================================================
   EMPTY STATE
   ============================================================ */
export interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const AdminEmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--paper)] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[var(--muted)]" />
      </div>
      <h3 className="text-sm font-medium text-[var(--ink)] mb-1">{title}</h3>
      {description && <p className="text-xs text-[var(--muted)] mb-4 max-w-xs">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--on-accent)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

/* ============================================================
   LOADING SKELETON
   ============================================================ */
export interface SkeletonProps {
  count?: number;
  variant?: 'card' | 'row' | 'text';
  className?: string;
}

export const AdminSkeleton: React.FC<SkeletonProps> = ({
  count = 1,
  variant = 'card',
  className = '',
}) => {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`bg-[var(--paper)] rounded-lg ${className} ${
            variant === 'card' ? 'h-24 mb-4' : variant === 'row' ? 'h-12 mb-2' : 'h-4 mb-2'
          }`}
        />
      ))}
    </>
  );
};

/* ============================================================
   ADMIN TABLE ACTIONS
   ============================================================ */
export interface TableAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  isDangerous?: boolean;
}

export interface AdminTableActionsProps {
  actions: TableAction[];
}

export const AdminTableActions: React.FC<AdminTableActionsProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-1">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            title={action.label}
            className={`p-1.5 rounded-md transition-colors ${
              action.isDangerous
                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)]'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
};

/* ============================================================
   BADGE
   ============================================================ */
export interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

export const AdminBadge: React.FC<BadgeProps> = ({ variant, children }) => {
  const styles = {
    success: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  };

  return <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${styles[variant]}`}>{children}</span>;
};
