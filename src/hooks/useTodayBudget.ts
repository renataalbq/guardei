import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { findCellsAffordableToday, findLargestAffordableCell, pickRandomAffordableCell } from '../domain/findCellsAffordableToday';
import { computeTodayBudgetStatus, type TodayBudget } from '../domain/todayBudget';
import type { Cell } from '../domain/types';

const SPOTLIGHT_MS = 2_600;

function scrollCellIntoView(cellId: string) {
  const element = document.querySelector<HTMLElement>(`[data-cell-id="${cellId}"]`);
  if (!element) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  element.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
}

/**
 * "Quanto posso guardar hoje?": guarda o valor informado, destaca o que cabe no que sobra,
 * e sorteia ou escolhe o maior valor, rolando a grade até ele.
 */
export function useTodayBudget(cells: Cell[]) {
  const [budget, setBudget] = useState<TodayBudget | undefined>();
  const [spotlightCellId, setSpotlightCellId] = useState<string | undefined>();
  const spotlightTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(spotlightTimer.current), []);

  const status = useMemo(() => (budget ? computeTodayBudgetStatus(cells, budget) : undefined), [cells, budget]);
  const affordableCellIds = useMemo(() => (status ? new Set(status.affordable.map((cell) => cell.id)) : undefined), [status]);

  const spotlight = useCallback((cell: Cell | undefined) => {
    if (!cell) return;
    clearTimeout(spotlightTimer.current);
    setSpotlightCellId(cell.id);
    scrollCellIntoView(cell.id);
    spotlightTimer.current = setTimeout(() => setSpotlightCellId(undefined), SPOTLIGHT_MS);
  }, []);

  /** Valor disponível: o recém-informado (e passa a valer como orçamento) ou o que sobra do atual. */
  const resolveAvailable = useCallback(
    (newAmount?: number) => {
      if (newAmount !== undefined) {
        setBudget({ amount: newAmount, setAt: new Date().toISOString() });
        return newAmount;
      }
      return status?.remaining ?? 0;
    },
    [status],
  );

  const highlight = useCallback((amount: number) => void resolveAvailable(amount), [resolveAvailable]);

  const pickRandom = useCallback(
    (newAmount?: number) => {
      const cell = pickRandomAffordableCell(cells, resolveAvailable(newAmount));
      spotlight(cell);
      return cell;
    },
    [cells, resolveAvailable, spotlight],
  );

  const pickLargest = useCallback(
    (newAmount?: number) => {
      const cell = findLargestAffordableCell(cells, resolveAvailable(newAmount));
      spotlight(cell);
      return cell;
    },
    [cells, resolveAvailable, spotlight],
  );

  const clear = useCallback(() => {
    setBudget(undefined);
    setSpotlightCellId(undefined);
  }, []);

  /** Quantos valores cabem num valor ainda não confirmado (pré-visualização no campo). */
  const countAffordable = useCallback((amount: number) => findCellsAffordableToday(cells, amount).length, [cells]);

  return { budget, status, affordableCellIds, spotlightCellId, highlight, pickRandom, pickLargest, clear, countAffordable };
}

export type TodayBudgetController = ReturnType<typeof useTodayBudget>;
