import type { Cell } from './types';

type CellLike = Pick<Cell, 'id' | 'value' | 'position' | 'savedAt'>;

function isStillOpen(cell: CellLike): boolean {
  return cell.savedAt === undefined;
}

/** Células ainda não riscadas com valor ≤ ao que a pessoa consegue guardar hoje, na ordem da grade. */
export function findCellsAffordableToday<T extends CellLike>(cells: readonly T[], amountAvailableToday: number): T[] {
  if (!(amountAvailableToday > 0)) return [];
  return cells
    .filter((cell) => isStillOpen(cell) && cell.value <= amountAvailableToday)
    .sort((a, b) => a.position - b.position);
}

/** Maior valor que cabe hoje (em empate, o que vem primeiro na grade). */
export function findLargestAffordableCell<T extends CellLike>(cells: readonly T[], amountAvailableToday: number): T | undefined {
  let largest: T | undefined;
  for (const cell of findCellsAffordableToday(cells, amountAvailableToday)) {
    if (!largest || cell.value > largest.value) largest = cell;
  }
  return largest;
}

/** Sorteia uma célula entre as que cabem hoje. `random` deve retornar um número em [0, 1). */
export function pickRandomAffordableCell<T extends CellLike>(
  cells: readonly T[],
  amountAvailableToday: number,
  random: () => number = Math.random,
): T | undefined {
  const affordable = findCellsAffordableToday(cells, amountAvailableToday);
  if (affordable.length === 0) return undefined;
  const index = Math.min(affordable.length - 1, Math.floor(random() * affordable.length));
  return affordable[index];
}
