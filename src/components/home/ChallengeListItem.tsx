import { Link } from 'react-router';
import { formatCalendarDate } from '../../domain/calendarDate';
import { computeDeadlinePace } from '../../domain/computeProgress';
import { formatCurrency } from '../../domain/formatCurrency';
import { computeMilestones } from '../../domain/milestones';
import type { CalendarDate } from '../../domain/types';
import type { ChallengeSummary } from '../../hooks/useChallengeSummaries';
import { Icon } from '../ui/Icon';
import { ProgressRing } from '../ui/ProgressRing';

function describePace({ challenge, progress }: ChallengeSummary, today: CalendarDate): string | undefined {
  const pace = computeDeadlinePace({
    goal: challenge.goal,
    savedAmount: progress.savedAmount,
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    today,
  });
  switch (pace.status) {
    case 'completed':
      return undefined;
    case 'not-started':
      return `Começa em ${formatCalendarDate(challenge.startDate)}`;
    case 'overdue':
      return 'Prazo encerrado';
    case 'active':
      return challenge.endDate && pace.weeklyAmountNeeded !== undefined
        ? `~${formatCurrency(pace.weeklyAmountNeeded)}/semana até ${formatCalendarDate(challenge.endDate)}`
        : 'Sem prazo';
  }
}

export function ChallengeListItem({ summary, today }: { summary: ChallengeSummary; today: CalendarDate }) {
  const { challenge, progress } = summary;
  const { next, remainingToNext } = computeMilestones(progress.goal, progress.savedAmount);
  const pace = describePace(summary, today);

  return (
    <Link to={`/desafio/${challenge.id}`} className="card block p-4 transition-transform active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <ProgressRing percent={progress.percent} size={68} label={`Progresso de ${challenge.name}`} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-xl font-extrabold">{challenge.name}</h2>
          <p className="text-sm font-numeric">
            <strong className="font-display text-base font-extrabold">{formatCurrency(progress.savedAmount)}</strong>
            <span className="text-muted"> de {formatCurrency(progress.goal)}</span>
          </p>
          {pace && <p className="mt-0.5 truncate text-xs text-muted">{pace}</p>}
        </div>
        <Icon name="back" className="shrink-0 rotate-180 text-xl text-muted" />
      </div>
      <p
        className={`mt-3 flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold ${
          next ? 'bg-accent-soft text-[#b0144d]' : 'bg-money-soft text-emerald-800'
        }`}
      >
        <Icon name={next ? 'flag' : 'check'} className="shrink-0" />
        {next ? `Faltam ${formatCurrency(remainingToNext)} para ${next.percent}%` : 'Meta batida!'}
      </p>
    </Link>
  );
}
