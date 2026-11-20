import { addDays, addMonths, monthsInPeriod } from './calendarDate';
import type { CalendarDate } from './types';

export interface MonthlyLimitInput {
  goal: number;
  startDate: CalendarDate;
  endDate?: CalendarDate;
  /** Máximo que a pessoa consegue guardar por mês. */
  monthlyLimit: number;
}

export interface MonthlyLimitPlan {
  /** Meses necessários guardando o limite mensal. */
  monthsNeeded: number;
  /** Prazo estimado guardando o limite mensal (último dia do último mês). */
  estimatedEndDate: CalendarDate;
  /** Quanto seria preciso guardar por mês para cumprir o prazo informado. */
  requiredPerMonth?: number;
  /** Se o limite mensal é suficiente para o prazo informado. */
  fitsDeadline?: boolean;
}

/**
 * Compara a meta com o limite mensal. Se o prazo informado exigir mais do que o limite,
 * `fitsDeadline` é false e `estimatedEndDate` sugere o novo prazo.
 */
export function planForMonthlyLimit({ goal, startDate, endDate, monthlyLimit }: MonthlyLimitInput): MonthlyLimitPlan | undefined {
  if (!(monthlyLimit > 0) || !(goal > 0)) return undefined;

  const monthsNeeded = Math.ceil(goal / monthlyLimit);
  const estimatedEndDate = addDays(addMonths(startDate, monthsNeeded), -1);

  if (!endDate) return { monthsNeeded, estimatedEndDate };

  const months = monthsInPeriod(startDate, endDate);
  if (months <= 0) return { monthsNeeded, estimatedEndDate, fitsDeadline: false };

  const exactPerMonth = goal / months;
  return {
    monthsNeeded,
    estimatedEndDate,
    requiredPerMonth: Math.ceil(exactPerMonth),
    fitsDeadline: exactPerMonth <= monthlyLimit,
  };
}
