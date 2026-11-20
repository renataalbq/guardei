import type { ChallengeType } from '../../domain/types';

const OPTIONS: Array<{
  type: ChallengeType;
  title: string;
  description: string;
}> = [
  {
    type: 'sequential',
    title: 'Números em sequência',
    description: 'Valores de 1 até N. Você risca na ordem que quiser.',
  },
  {
    type: 'weeks52',
    title: '52 semanas',
    description: 'Um valor por semana, crescendo a cada semana.',
  },
];

interface ChallengeTypePickerProps {
  value: ChallengeType;
  onChange: (type: ChallengeType) => void;
}

export function ChallengeTypePicker({ value, onChange }: ChallengeTypePickerProps) {
  return (
    <div role="radiogroup" aria-label="Tipo de desafio" className="grid grid-cols-2 gap-2">
      {OPTIONS.map((option) => {
        const selected = option.type === value;
        return (
          <button
            key={option.type}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.type)}
            className={`flex flex-col gap-1 rounded-2xl p-3.5 text-left transition-all active:scale-[0.98] ${
              selected ? 'bg-ink-soft ring-2 ring-ink' : 'bg-paper ring-1 ring-border'
            }`}
          >
            <span className="font-display font-bold text-fg">{option.title}</span>
            <span className="text-xs leading-snug text-muted">{option.description}</span>
          </button>
        );
      })}
    </div>
  );
}
