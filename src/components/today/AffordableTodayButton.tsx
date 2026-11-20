import { formatCurrency } from '../../domain/formatCurrency';
import { Icon } from '../ui/Icon';

/** Chamada para o "Quanto posso guardar hoje?", logo acima da tabela. */
export function AffordableTodayButton({ activeAmount, onClick }: { activeAmount?: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card flex w-full items-center gap-3 p-4 text-left ring-2 ring-accent/30 transition-transform active:scale-[0.98]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-xl text-white">
        <Icon name="sparkles" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg leading-tight font-extrabold">Quanto posso guardar hoje?</span>
        <span className="block text-sm text-muted">
          {activeAmount !== undefined
            ? `Hoje: ${formatCurrency(activeAmount)} · toque para mudar`
            : 'Veja quais valores cabem no seu bolso agora'}
        </span>
      </span>
      <Icon name="back" className="shrink-0 rotate-180 text-lg text-muted" />
    </button>
  );
}
