import { Link } from 'react-router';
import type { ChallengeProgress } from '../../domain/computeProgress';
import { formatCurrency } from '../../domain/formatCurrency';
import { Icon } from '../ui/Icon';
import { ProgressBar } from '../ui/ProgressBar';

interface ProgressHeaderProps {
  name: string;
  progress: ChallengeProgress;
}

/** Topo fixo da tela do desafio: total guardado, % da meta e quanto falta. */
export function ProgressHeader({ name, progress }: ProgressHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-paper/95 px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-3 backdrop-blur">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-1">
          <Link to="/" aria-label="Voltar" className="-ml-2 shrink-0 rounded-full p-2 text-2xl text-ink active:bg-ink-soft">
            <Icon name="back" />
          </Link>
          <h1 className="truncate pr-2 font-hand text-3xl font-bold text-ink">{name}</h1>
        </div>
        <div className="mt-1 flex items-end justify-between gap-3" aria-live="polite">
          <p className="text-sm text-muted">
            <strong className="mr-1 font-hand text-3xl leading-none font-bold text-fg">{formatCurrency(progress.savedAmount)}</strong> de{' '}
            {formatCurrency(progress.goal)}
          </p>
          <p className="shrink-0 text-right text-sm">
            <strong className="text-fg">{Math.floor(progress.percent)}%</strong>
            <span className="block text-xs text-muted">
              {progress.remainingAmount > 0 ? `faltam ${formatCurrency(progress.remainingAmount)}` : 'meta batida!'}
            </span>
          </p>
        </div>
        <div className="mt-2">
          <ProgressBar percent={progress.percent} label="Progresso da meta" />
        </div>
      </div>
    </header>
  );
}
