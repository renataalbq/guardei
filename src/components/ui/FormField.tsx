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
      <label htmlFor={htmlFor} className="text-sm font-semibold text-fg">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-sm text-muted">{hint}</p>}
      {error && <p className="text-sm font-medium text-red-700">{error}</p>}
    </div>
  );
}

export const textInputClassName =
  'w-full rounded-xl border border-border bg-surface px-3 py-3 text-base text-fg outline-none focus:border-ink focus:ring-2 focus:ring-ink/20';
