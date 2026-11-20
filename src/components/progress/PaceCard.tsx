import { formatCalendarDate, formatMonthYear } from '../../domain/calendarDate';
import { computeDeadlinePace } from '../../domain/computeProgress';
import { formatCurrency } from '../../domain/formatCurrency';
import type { CalendarDate, Challenge } from '../../domain/types';
import { Icon } from '../ui/Icon';

interface PaceCardProps {
  challenge: Challenge;
  savedAmount: number;
  today: CalendarDate;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-2xl bg-paper px-3 py-2.5">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="font-display text-2xl font-extrabold text-fg font-numeric">{value}</p>
    </div>
  );
}

/** O ritmo em pedaços pequenos (por dia e por semana) e a projeção pelo ritmo atual. */
export function PaceCard({ challenge, savedAmount, today }: PaceCardProps) {
  const pace = computeDeadlinePace({
    goal: challenge.goal,
    savedAmount,
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    today,
  });

  if (pace.status === 'completed') return null;

  if (pace.status === 'not-started') {
    return (
      <section className="card flex items-center gap-3 p-4 text-sm">
        <Icon name="calendar" className="shrink-0 text-2xl text-ink" />
        <p>
          Começa em <strong>{formatCalendarDate(challenge.startDate)}</strong>. Se quiser adiantar, já pode riscar.
        </p>
      </section>
    );
  }

  if (pace.status === 'overdue') {
    return (
      <section className="card p-4 text-sm">
        <p className="font-bold">O prazo terminou em {formatCalendarDate(challenge.endDate!)}.</p>
        <p className="mt-1 text-muted">
          Faltaram {formatCurrency(pace.remainingAmount)}. Continue riscando no seu ritmo: cada valor conta.
        </p>
      </section>
    );
  }

  const projection = pace.projectedFinishDate ? formatMonthYear(pace.projectedFinishDate) : undefined;

  return (
    <section className="card p-4">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold">
        <Icon name="trend" className="text-ink" /> Seu ritmo
      </h2>
      {challenge.endDate && pace.dailyAmountNeeded !== undefined && pace.weeklyAmountNeeded !== undefined ? (
        <>
          <p className="mt-1 text-sm text-muted">Para chegar até {formatCalendarDate(challenge.endDate)}, guarde em média:</p>
          <div className="mt-3 flex gap-2">
            <Stat label="por dia" value={formatCurrency(pace.dailyAmountNeeded)} />
            <Stat label="por semana" value={formatCurrency(pace.weeklyAmountNeeded)} />
          </div>
        </>
      ) : (
        <p className="mt-1 text-sm text-muted">Sem prazo: você guarda no seu tempo.</p>
      )}
      {projection && (
        <p
          className={`mt-3 rounded-xl px-3 py-2 text-sm font-semibold ${
            pace.onTrack === false ? 'bg-warning-bg text-warning-fg' : 'bg-money-soft text-money-fg'
          }`}
        >
          {pace.onTrack === false
            ? `No ritmo atual você termina em ${projection}. Um pouco mais por semana e você chega no prazo.`
            : pace.onTrack
              ? `No ritmo atual você termina em ${projection}, dentro do prazo!`
              : `No ritmo atual você termina em ${projection}.`}
        </p>
      )}
    </section>
  );
}
