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
      className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors active:scale-95 ${
        selected ? 'border-ink bg-ink text-white' : 'border-border bg-surface text-fg'
      }`}
    >
      {children}
    </button>
  );
}
