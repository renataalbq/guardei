import type { ChallengeType } from './types';

/** Soma de 1 a 52. */
export const WEEKS_IN_CHALLENGE = 52;
export const WEEKS52_SUM_OF_MULTIPLIERS = (WEEKS_IN_CHALLENGE * (WEEKS_IN_CHALLENGE + 1)) / 2; // 1378

/** Meta mínima do 52 semanas: garante que a semana 1 valha pelo menos R$ 1. */
export const MIN_WEEKS52_GOAL = WEEKS52_SUM_OF_MULTIPLIERS;

export interface CellValuesInput {
  type: ChallengeType;
  goal: number;
  step: number;
}

export class InvalidGoalError extends Error {}

/** Arredonda a meta para cima até o múltiplo de `step` mais próximo. */
export function roundGoalUpToStep(goal: number, step: number): number {
  return Math.ceil(goal / step) * step;
}

/** Meta que efetivamente será usada no desafio (no sequencial, múltiplo do step). */
export function effectiveGoal({ type, goal, step }: CellValuesInput): number {
  return type === 'sequential' ? roundGoalUpToStep(goal, step) : goal;
}

function triangular(n: number): number {
  return (n * (n + 1)) / 2;
}

/** Menor n tal que n(n+1)/2 ≥ target. */
function smallestTriangularIndexReaching(target: number): number {
  let n = Math.max(1, Math.ceil((Math.sqrt(1 + 8 * target) - 1) / 2) - 1);
  while (triangular(n) < target) n++;
  return n;
}

/**
 * Sequencial: valores step×1, step×2, …, step×n, removendo a célula igual ao excesso
 * para que a soma seja exatamente a meta (arredondada ao múltiplo de step).
 */
export function generateSequentialValues(goal: number, step: number): number[] {
  if (!Number.isInteger(step) || step <= 0) throw new InvalidGoalError('O step precisa ser um inteiro positivo.');
  if (!Number.isInteger(goal) || goal <= 0) throw new InvalidGoalError('A meta precisa ser um valor inteiro positivo.');

  const goalInSteps = roundGoalUpToStep(goal, step) / step;
  const n = smallestTriangularIndexReaching(goalInSteps);
  const excessInSteps = triangular(n) - goalInSteps; // sempre entre 0 e n−1

  const values: number[] = [];
  for (let k = 1; k <= n; k++) {
    if (k === excessInSteps) continue;
    values.push(k * step);
  }
  return values;
}

/**
 * 52 semanas: semana k guarda base × k (base = meta / 1378), arredondado;
 * a última semana absorve a diferença para a soma bater com a meta.
 */
export function generateWeeks52Values(goal: number): number[] {
  if (!Number.isInteger(goal) || goal < MIN_WEEKS52_GOAL) {
    throw new InvalidGoalError(`No desafio de 52 semanas a meta mínima é R$ ${MIN_WEEKS52_GOAL}.`);
  }
  const base = goal / WEEKS52_SUM_OF_MULTIPLIERS;
  const values: number[] = [];
  for (let week = 1; week < WEEKS_IN_CHALLENGE; week++) values.push(Math.round(base * week));
  const sumUntilLastWeek = values.reduce((sum, value) => sum + value, 0);
  values.push(goal - sumUntilLastWeek);
  return values;
}

export function generateCellValues(input: CellValuesInput): number[] {
  return input.type === 'sequential'
    ? generateSequentialValues(input.goal, input.step)
    : generateWeeks52Values(input.goal);
}
