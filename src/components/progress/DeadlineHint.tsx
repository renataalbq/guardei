import { formatCalendarDate, formatMonthYear } from '../../domain/calendarDate';
import { computeDeadlinePace } from '../../domain/computeProgress';
import { formatCurrency } from '../../domain/formatCurrency';
import type { CalendarDate, Challenge } from '../../domain/types';

interface DeadlineHintProps {
  challenge: Challenge;
  savedAmount: number;
  today: CalendarDate;
}

/** Quanto guardar por dia até o prazo e projeção pelo ritmo atual. */
export function DeadlineHint({ challenge, savedAmount, today }: DeadlineHintProps) {
  const pace = computeDeadlinePace({
    goal: challenge.goal,
    savedAmount,
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    today,
  });

  let main: string;
  let detail: string | undefined;

  switch (pace.status) {
    case 'completed':
      main = 'Meta batida! Todos os valores foram riscados.';
      break;
    case 'not-started':
      main = `O desafio começa em ${formatCalendarDate(challenge.startDate)}.`;
      detail = 'Mas se quiser já ir guardando, pode riscar.';
      break;
    case 'overdue':
      main = `O prazo terminou em ${formatCalendarDate(challenge.endDate!)}.`;
      detail = `Faltaram ${formatCurrency(pace.remainingAmount)}. Dá para continuar riscando no seu ritmo.`;
      break;
    case 'active':
      if (challenge.endDate && pace.dailyAmountNeeded !== undefined) {
        main = `Para chegar até ${formatCalendarDate(challenge.endDate)} você precisa guardar ~${formatCurrency(pace.dailyAmountNeeded)} por dia.`;
      } else {
        main = 'Sem prazo: guarde no seu ritmo.';
      }
      if (pace.projectedFinishDate) {
        const when = formatMonthYear(pace.projectedFinishDate);
        detail =
          pace.onTrack === false
            ? `No ritmo atual você termina em ${when}, depois do prazo.`
            : pace.onTrack
              ? `No ritmo atual você termina em ${when}, dentro do prazo.`
              : `No ritmo atual você termina em ${when}.`;
      }
      break;
  }

  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm">
      <p className="text-fg">{main}</p>
      {detail && <p className={`mt-0.5 ${pace.status === 'active' && pace.onTrack === false ? 'text-warning-fg' : 'text-muted'}`}>{detail}</p>}
    </div>
  );
}
