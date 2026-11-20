import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, hint, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-bold text-fg">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-sm text-muted">{hint}</p>}
      {error && <p className="text-sm font-semibold text-danger">{error}</p>}
    </div>
  );
}

export const textInputClassName =
  'w-full rounded-2xl border border-border bg-surface px-4 py-3 text-base text-fg outline-none transition focus:border-ink focus:ring-4 focus:ring-ink/15';
