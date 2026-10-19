import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  children: React.ReactNode;
  id?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  optional = false,
  error,
  helperText,
  className = '',
  children,
  id: customId,
}) => {
  const generatedId = useId();
  const fieldId = customId || generatedId;

  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={fieldId}
          className="block text-xs font-mono font-medium text-[var(--ink)]"
        >
          <span>{label}</span>
          {required && <span className="text-[var(--accent)] ml-1">*</span>}
        </label>
        {optional && (
          <span className="text-[11px] font-mono text-[var(--muted)]">Optional</span>
        )}
      </div>

      <div className="relative">{children}</div>

      {error ? (
        <p className="text-xs text-rose-500 flex items-center gap-1 font-mono pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-[var(--muted)] font-mono leading-relaxed pt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
