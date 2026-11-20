import { formatCurrency } from '../../domain/formatCurrency';
import { computeSavingActivity } from '../../domain/savingActivity';
import type { CalendarDate, Cell } from '../../domain/types';
import { Icon } from '../ui/Icon';

const WEEKDAY_INITIALS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function weekdayInitial(date: CalendarDate): string {
  return WEEKDAY_INITIALS[new Date(`${date}T12:00:00Z`).getUTCDay()] ?? '';
}

/** Constância: quanto guardou hoje, os últimos 7 dias e a sequência de dias seguidos. */
export function ActivityStrip({ cells, today }: { cells: Cell[]; today: CalendarDate }) {
  const { savedTodayAmount, lastDays, streakDays } = computeSavingActivity(cells, today);
  const maxAmount = Math.max(1, ...lastDays.map((day) => day.amount));

  return (
    <section className="card flex items-center gap-4 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-muted">Hoje</p>
        <p className="font-display text-2xl font-extrabold font-numeric">{formatCurrency(savedTodayAmount)}</p>
        <p className={`mt-0.5 flex items-center gap-1 text-sm font-bold ${streakDays > 0 ? 'text-accent' : 'text-muted'}`}>
          {streakDays > 0 ? (
            <>
              <Icon name="flame" className="animate-[flame_1.2s_ease-in-out_infinite] text-base" />
              {streakDays === 1 ? '1 dia seguido' : `${streakDays} dias seguidos`}
            </>
          ) : (
            'Risque um valor hoje!'
          )}
        </p>
      </div>
      <ol className="flex h-16 items-end gap-1.5" aria-label="Valores guardados nos últimos 7 dias">
        {lastDays.map((day) => (
          <li key={day.date} className="flex flex-col items-center gap-1" aria-label={`${day.date}: ${formatCurrency(day.amount)}`}>
            <span className="flex h-11 w-4 items-end overflow-hidden rounded-full bg-ink-soft">
              <span
                className={`w-full rounded-full ${day.date === today ? 'bg-accent' : 'bg-ink'}`}
                style={{
                  height: day.amount > 0 ? `${Math.max(18, (day.amount / maxAmount) * 100)}%` : 0,
                }}
              />
            </span>
            <span className={`text-[0.65rem] font-bold ${day.date === today ? 'text-accent' : 'text-muted'}`}>
              {weekdayInitial(day.date)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
