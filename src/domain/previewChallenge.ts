import { daysBetween, daysInPeriodInclusive, isValidCalendarDate } from './calendarDate';
import { MIN_WEEKS52_GOAL, effectiveGoal, generateCellValues } from './generateCells';
import { formatCurrency } from './formatCurrency';
import { planForMonthlyLimit, type MonthlyLimitPlan } from './monthlyLimitPlan';
import type { CalendarDate, ChallengeType } from './types';

export interface ChallengeDraft {
  name: string;
  goal: number;
  type: ChallengeType;
  step: number;
  startDate: CalendarDate;
  endDate?: CalendarDate;
  monthlyLimit?: number;
}

export interface ChallengePreview {
  effectiveGoal: number;
  goalWasRounded: boolean;
  cellCount: number;
  largestValue: number;
  smallestValue: number;
  /** Dias do período (contando início e fim), se houver prazo. */
  periodDays?: number;
  /** Média por dia necessária para cumprir o prazo. */
  dailyAverageNeeded?: number;
  monthlyLimitPlan?: MonthlyLimitPlan;
}

export type ChallengeDraftEvaluation =
  | { isValid: true; preview: ChallengePreview; nameProblem?: string }
  | { isValid: false; problems: string[]; nameProblem?: string };

/** Valida o rascunho do desafio e calcula a pré-visualização mostrada antes de confirmar. */
export function evaluateChallengeDraft(draft: ChallengeDraft): ChallengeDraftEvaluation {
  const problems: string[] = [];
  const nameProblem = draft.name.trim() === '' ? 'Dê um nome para o seu desafio.' : undefined;

  if (!Number.isInteger(draft.goal) || draft.goal <= 0) problems.push('Informe a meta em reais.');
  else if (draft.type === 'weeks52' && draft.goal < MIN_WEEKS52_GOAL) {
    problems.push(`No desafio de 52 semanas a meta mínima é ${formatCurrency(MIN_WEEKS52_GOAL)}.`);
  }

  if (!isValidCalendarDate(draft.startDate)) problems.push('Informe a data de início.');
  if (draft.endDate !== undefined) {
    if (!isValidCalendarDate(draft.endDate)) problems.push('Data do prazo inválida.');
    else if (isValidCalendarDate(draft.startDate) && daysBetween(draft.startDate, draft.endDate) <= 0) {
      problems.push('O prazo precisa ser depois da data de início.');
    }
  }

  if (problems.length > 0) return { isValid: false, problems, nameProblem };

  const goal = effectiveGoal(draft);
  const values = generateCellValues(draft);
  const periodDays = draft.endDate ? daysInPeriodInclusive(draft.startDate, draft.endDate) : undefined;

  return {
    isValid: true,
    nameProblem,
    preview: {
      effectiveGoal: goal,
      goalWasRounded: goal !== draft.goal,
      cellCount: values.length,
      largestValue: Math.max(...values),
      smallestValue: Math.min(...values),
      periodDays,
      dailyAverageNeeded: periodDays ? Math.ceil(goal / periodDays) : undefined,
      monthlyLimitPlan: draft.monthlyLimit
        ? planForMonthlyLimit({ goal, startDate: draft.startDate, endDate: draft.endDate, monthlyLimit: draft.monthlyLimit })
        : undefined,
    },
  };
}
