import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmação em folha inferior, confortável para o polegar. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onCancel();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <div className="absolute inset-0 animate-[fade-in_150ms_ease-out] bg-black/40" onClick={onCancel} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? 'confirm-description' : undefined}
        className="relative w-full max-w-md animate-[sheet-up_200ms_ease-out] rounded-t-[2rem] bg-surface p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-3xl"
      >
        <h2 id="confirm-title" className="font-display text-2xl font-bold text-fg">
          {title}
        </h2>
        {description && (
          <p id="confirm-description" className="mt-1 text-sm text-muted">
            {description}
          </p>
        )}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" onClick={onCancel} className="rounded-2xl bg-ink-soft py-3.5 font-bold text-ink active:scale-[0.97]">
            {cancelLabel}
          </button>
          <button ref={confirmRef} type="button" onClick={onConfirm} className="btn-primary py-3.5">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
