import { Link } from 'react-router';
import { formatCalendarDate } from '../../domain/calendarDate';
import { computeDeadlinePace } from '../../domain/computeProgress';
import { formatCurrency } from '../../domain/formatCurrency';
import type { CalendarDate } from '../../domain/types';
import type { ChallengeSummary } from '../../hooks/useChallengeSummaries';
import { ProgressBar } from '../ui/ProgressBar';

function describePace({ challenge, progress }: ChallengeSummary, today: CalendarDate): string {
  const pace = computeDeadlinePace({
    goal: challenge.goal,
    savedAmount: progress.savedAmount,
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    today,
  });
  switch (pace.status) {
    case 'completed':
      return 'Meta concluída!';
    case 'not-started':
      return `Começa em ${formatCalendarDate(challenge.startDate)}`;
    case 'overdue':
      return `Prazo encerrado · faltam ${formatCurrency(pace.remainingAmount)}`;
    case 'active':
      return challenge.endDate && pace.dailyAmountNeeded !== undefined
        ? `Até ${formatCalendarDate(challenge.endDate)} · ~${formatCurrency(pace.dailyAmountNeeded)}/dia`
        : 'Sem prazo';
  }
}

export function ChallengeListItem({ summary, today }: { summary: ChallengeSummary; today: CalendarDate }) {
  const { challenge, progress } = summary;
  return (
    <Link
      to={`/desafio/${challenge.id}`}
      className="block rounded-2xl border border-border bg-surface p-4 shadow-sm transition-transform active:scale-[0.99]"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="truncate font-hand text-3xl font-bold text-ink">{challenge.name}</h2>
        <span className="shrink-0 text-sm font-semibold text-fg">{Math.floor(progress.percent)}%</span>
      </div>
      <p className="mt-1 text-sm text-fg">
        <strong>{formatCurrency(progress.savedAmount)}</strong> <span className="text-muted">de {formatCurrency(progress.goal)}</span>
      </p>
      <div className="mt-3">
        <ProgressBar percent={progress.percent} label={`Progresso de ${challenge.name}`} />
      </div>
      <p className="mt-2 text-xs text-muted">{describePace(summary, today)}</p>
    </Link>
  );
}
