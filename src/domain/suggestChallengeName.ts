import { yearOf } from './calendarDate';
import { formatCurrency } from './formatCurrency';
import type { CalendarDate } from './types';

function describeGoal(goal: number): string {
  if (goal >= 1_000 && goal % 1_000 === 0) return `${new Intl.NumberFormat('pt-BR').format(goal / 1_000)} mil`;
  return formatCurrency(goal);
}

/** Sugestão de nome mostrada como exemplo no campo: "20 mil em 2027". */
export function suggestChallengeName(goal: number | undefined, endDate: CalendarDate | undefined): string {
  if (!goal || goal <= 0) return 'Meu desafio';
  const amount = describeGoal(goal);
  return endDate ? `${amount} em ${yearOf(endDate)}` : `Juntar ${amount}`;
}
