import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (title: string, message?: string, type?: ToastType) => void;
  showInfo: (title: string, message?: string) => void;
  showSuccess: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (title: string, message?: string, type: ToastType = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, title, message, type };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => toast(title, message, 'success'),
    [toast]
  );
  const showInfo = useCallback(
    (title: string, message?: string) => toast(title, message, 'info'),
    [toast]
  );
  const showWarning = useCallback(
    (title: string, message?: string) => toast(title, message, 'warning'),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, showInfo, showSuccess, showWarning }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto bg-[var(--surface)] border border-[var(--line)] p-4 shadow-xl flex items-start gap-3 rounded-[6px] relative overflow-hidden"
              style={{ borderLeftWidth: '4px', borderLeftColor: 'var(--accent)' }}
            >
              <div className="shrink-0 text-[var(--accent)] mt-0.5">
                {item.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                {item.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                {item.type === 'info' && <Info className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-sm font-medium text-[var(--ink)] leading-tight">
                  {item.title}
                </p>
                {item.message && (
                  <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                    {item.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors p-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components -- Keep the toast provider and its hook as one context API.
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
