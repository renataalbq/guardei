import type { ReactNode } from 'react';

interface ChoiceChipProps {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}

export function ChoiceChip({ selected, onSelect, children }: ChoiceChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-all active:scale-95 ${
        selected ? 'bg-ink text-white shadow-[var(--shadow-brand)]' : 'bg-surface text-fg ring-1 ring-border'
      }`}
    >
      {children}
    </button>
  );
}
