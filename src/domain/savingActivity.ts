import { addDays, todayCalendarDate } from './calendarDate';
import type { CalendarDate, Cell } from './types';

export const ACTIVITY_WINDOW_DAYS = 7;

export interface DayActivity {
  date: CalendarDate;
  amount: number;
}

export interface SavingActivity {
  savedTodayAmount: number;
  /** Últimos 7 dias, do mais antigo para hoje. */
  lastDays: DayActivity[];
  /** Dias seguidos guardando algo, terminando hoje (ou ontem, se hoje ainda não guardou). */
  streakDays: number;
}

/** Converte o instante (ISO) em data do calendário local do aparelho. */
const toLocalCalendarDate = (iso: string): CalendarDate => todayCalendarDate(new Date(iso));

/** Constância: quanto guardou hoje, nos últimos dias e há quantos dias seguidos. */
export function computeSavingActivity(
  cells: readonly Pick<Cell, 'value' | 'savedAt'>[],
  today: CalendarDate,
  toCalendarDate: (iso: string) => CalendarDate = toLocalCalendarDate,
): SavingActivity {
  const amountByDate = new Map<CalendarDate, number>();
  for (const cell of cells) {
    if (!cell.savedAt) continue;
    const date = toCalendarDate(cell.savedAt);
    amountByDate.set(date, (amountByDate.get(date) ?? 0) + cell.value);
  }

  const lastDays: DayActivity[] = [];
  for (let offset = ACTIVITY_WINDOW_DAYS - 1; offset >= 0; offset--) {
    const date = addDays(today, -offset);
    lastDays.push({ date, amount: amountByDate.get(date) ?? 0 });
  }

  let day = amountByDate.has(today) ? today : addDays(today, -1);
  let streakDays = 0;
  while (amountByDate.has(day)) {
    streakDays++;
    day = addDays(day, -1);
  }

  return { savedTodayAmount: amountByDate.get(today) ?? 0, lastDays, streakDays };
}
