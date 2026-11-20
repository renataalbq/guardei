import { Link } from 'react-router';
import type { ChallengeProgress } from '../../domain/computeProgress';
import { formatCurrency } from '../../domain/formatCurrency';
import { Icon } from '../ui/Icon';
import { ProgressBar } from '../ui/ProgressBar';

interface ProgressHeaderProps {
  name: string;
  progress: ChallengeProgress;
}

/** Topo fixo e compacto: total guardado, % da meta e quanto falta sempre à vista enquanto rola a grade. */
export function ProgressHeader({ name, progress }: ProgressHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-paper/85 px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2.5 backdrop-blur-xl">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2">
          <Link to="/" aria-label="Voltar" className="-ml-2 shrink-0 rounded-full p-2 text-xl text-fg active:bg-ink-soft">
            <Icon name="back" />
          </Link>
          <h1 className="min-w-0 flex-1 truncate font-display text-lg font-bold">{name}</h1>
          <p className="shrink-0 text-right text-sm font-numeric" aria-live="polite">
            <strong className="font-display text-base font-extrabold">{formatCurrency(progress.savedAmount)}</strong>
            <span className="text-muted"> · {Math.floor(progress.percent)}%</span>
          </p>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <ProgressBar percent={progress.percent} size="sm" label="Progresso da meta" />
          <span className="shrink-0 text-xs font-semibold text-muted font-numeric">
            {progress.remainingAmount > 0 ? `faltam ${formatCurrency(progress.remainingAmount)}` : 'meta batida!'}
          </span>
        </div>
      </div>
    </header>
  );
}
