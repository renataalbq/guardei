import { addDays, daysBetween, daysInPeriodInclusive } from './calendarDate';
import type { CalendarDate, Cell } from './types';

export interface ChallengeProgress {
  goal: number;
  savedAmount: number;
  remainingAmount: number;
  /** 0 a 100. */
  percent: number;
  savedCount: number;
  totalCount: number;
  isCompleted: boolean;
}

export function computeProgress(goal: number, cells: readonly Pick<Cell, 'value' | 'savedAt'>[]): ChallengeProgress {
  let savedAmount = 0;
  let savedCount = 0;
  for (const cell of cells) {
    if (cell.savedAt === undefined) continue;
    savedAmount += cell.value;
    savedCount++;
  }
  const remainingAmount = Math.max(0, goal - savedAmount);
  return {
    goal,
    savedAmount,
    remainingAmount,
    percent: goal > 0 ? Math.min(100, (savedAmount / goal) * 100) : 0,
    savedCount,
    totalCount: cells.length,
    isCompleted: cells.length > 0 && savedCount === cells.length,
  };
}

/** Com poucos dias de histórico a projeção pelo ritmo engana; só projeta a partir daqui. */
export const MIN_DAYS_FOR_PROJECTION = 7;

export interface PaceInput {
  goal: number;
  savedAmount: number;
  startDate: CalendarDate;
  endDate?: CalendarDate;
  today: CalendarDate;
}

export type DeadlinePace =
  | { status: 'completed' }
  | { status: 'not-started'; startsInDays: number }
  | { status: 'overdue'; remainingAmount: number }
  | {
      status: 'active';
      remainingAmount: number;
      /** Dias restantes até o prazo, contando hoje. */
      daysLeft?: number;
      /** Quanto guardar por dia (arredondado para cima) para chegar ao prazo. */
      dailyAmountNeeded?: number;
      /** Data estimada de conclusão mantendo o ritmo atual; ausente se nada foi guardado ou se o desafio tem menos de 7 dias. */
      projectedFinishDate?: CalendarDate;
      /** Se o ritmo atual chega até o prazo. */
      onTrack?: boolean;
    };

/** Ritmo do desafio: quanto falta por dia até o prazo e projeção pelo ritmo atual. */
export function computeDeadlinePace({ goal, savedAmount, startDate, endDate, today }: PaceInput): DeadlinePace {
  const remainingAmount = Math.max(0, goal - savedAmount);
  if (remainingAmount === 0) return { status: 'completed' };

  const startsInDays = daysBetween(today, startDate);
  if (startsInDays > 0 && savedAmount === 0) return { status: 'not-started', startsInDays };

  if (endDate && daysBetween(today, endDate) < 0) return { status: 'overdue', remainingAmount };

  const daysLeft = endDate ? daysInPeriodInclusive(today, endDate) : undefined;
  const dailyAmountNeeded = daysLeft ? Math.ceil(remainingAmount / daysLeft) : undefined;

  let projectedFinishDate: CalendarDate | undefined;
  const daysElapsed = daysInPeriodInclusive(startDate, today);
  if (savedAmount > 0 && daysElapsed >= MIN_DAYS_FOR_PROJECTION) {
    const amountPerDay = savedAmount / daysElapsed;
    projectedFinishDate = addDays(today, Math.ceil(remainingAmount / amountPerDay));
  }

  const onTrack = endDate && projectedFinishDate ? projectedFinishDate <= endDate : undefined;

  return { status: 'active', remainingAmount, daysLeft, dailyAmountNeeded, projectedFinishDate, onTrack };
}
