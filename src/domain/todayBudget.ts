import { findCellsAffordableToday } from './findCellsAffordableToday';
import type { Cell } from './types';

type BudgetCell = Pick<Cell, 'id' | 'value' | 'position' | 'savedAt'>;

export interface TodayBudget {
  /** Quanto a pessoa disse que consegue guardar hoje. */
  amount: number;
  /** Quando ela informou o valor (ISO): o que for riscado depois disso sai do orçamento. */
  setAt: string;
}

export interface TodayBudgetStatus {
  spent: number;
  remaining: number;
  affordable: BudgetCell[];
  /** Menor valor ainda aberto na grade (para explicar quando nada cabe). */
  smallestOpenValue?: number;
}

/**
 * "Hoje consigo guardar R$ 50": quanto já foi riscado desde então, quanto sobra
 * e quais valores ainda abertos cabem no que sobra.
 */
export function computeTodayBudgetStatus<T extends BudgetCell>(
  cells: readonly T[],
  budget: TodayBudget,
): TodayBudgetStatus & { affordable: T[] } {
  const setAtMs = Date.parse(budget.setAt);
  let spent = 0;
  let smallestOpenValue: number | undefined;
  for (const cell of cells) {
    if (cell.savedAt === undefined) {
      if (smallestOpenValue === undefined || cell.value < smallestOpenValue) smallestOpenValue = cell.value;
    } else if (Date.parse(cell.savedAt) >= setAtMs) {
      spent += cell.value;
    }
  }
  const remaining = Math.max(0, budget.amount - spent);
  return { spent, remaining, affordable: findCellsAffordableToday(cells, remaining), smallestOpenValue };
}
