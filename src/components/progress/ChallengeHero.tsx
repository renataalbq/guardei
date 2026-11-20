import type { ChallengeProgress } from '../../domain/computeProgress';
import { formatCurrency } from '../../domain/formatCurrency';
import { computeMilestones } from '../../domain/milestones';
import { Icon } from '../ui/Icon';
import { ProgressBar } from '../ui/ProgressBar';
import { ProgressRing } from '../ui/ProgressRing';

/**
 * Cartão principal: o total guardado e, principalmente, o próximo marco —
 * um objetivo perto o bastante para parecer possível.
 */
export function ChallengeHero({ progress }: { progress: ChallengeProgress }) {
  const { milestones, next, remainingToNext, percentOfCurrentStretch } = computeMilestones(progress.goal, progress.savedAmount);

  return (
    <section aria-label="Progresso" className="hero-gradient relative overflow-hidden rounded-[2rem] p-5 shadow-[var(--shadow-brand)]">
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white/75">Você já guardou</p>
          <p className="font-display text-[2.6rem] leading-[1.05] font-extrabold font-numeric">{formatCurrency(progress.savedAmount)}</p>
          <p className="mt-0.5 text-sm text-white/75">de {formatCurrency(progress.goal)}</p>
        </div>
        <ProgressRing percent={progress.percent} size={84} thickness={8} tone="light" label="Porcentagem da meta" />
      </div>

      <div className="relative mt-5 rounded-2xl bg-white/12 p-3.5 backdrop-blur-sm">
        {next ? (
          <>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <p className="flex items-center gap-1.5 font-bold">
                <Icon name="flag" className="text-base" /> Próximo marco: {next.percent}%
              </p>
              <p className="font-numeric text-white/80">{formatCurrency(next.amount)}</p>
            </div>
            <div className="mt-2">
              <ProgressBar percent={percentOfCurrentStretch} tone="light" label={`Caminho até ${next.percent}%`} />
            </div>
            <p className="mt-2 text-sm text-white/90">
              Faltam só <strong className="font-numeric">{formatCurrency(remainingToNext)}</strong> para chegar lá.
            </p>
          </>
        ) : (
          <p className="text-center font-display text-lg font-bold">Meta batida! Você conseguiu.</p>
        )}
      </div>

      <ol className="relative mt-4 flex items-center justify-between" aria-label="Marcos da meta">
        <div aria-hidden="true" className="absolute inset-x-3 top-3 h-0.5 bg-white/25" />
        {milestones.map((milestone) => (
          <li key={milestone.percent} className="relative flex flex-col items-center gap-1">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                milestone.reached ? 'bg-white text-ink' : milestone === next ? 'bg-white/30 ring-2 ring-white' : 'bg-white/20'
              }`}
            >
              {milestone.reached && <Icon name="check" />}
            </span>
            <span className={`text-[0.7rem] font-bold ${milestone.reached ? 'text-white' : 'text-white/65'}`}>{milestone.percent}%</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
