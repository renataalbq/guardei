import { useEffect, type ReactNode } from 'react';
import { Icon } from './Icon';

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Folha que sobe de baixo, confortável para o polegar; vira um diálogo central em telas largas. */
export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <div className="absolute inset-0 animate-[fade-in_150ms_ease-out] bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bottom-sheet-title"
        className="relative max-h-[90dvh] w-full max-w-md animate-[sheet-up_220ms_ease-out] overflow-y-auto rounded-t-[2rem] bg-surface p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-[2rem]"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="bottom-sheet-title" className="font-display text-2xl leading-tight font-extrabold">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="-mt-1 -mr-2 rounded-full p-2 text-xl text-muted">
            <Icon name="close" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
