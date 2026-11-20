import { describe, expect, it } from 'vitest';
import { findCellsAffordableToday, findLargestAffordableCell, pickRandomAffordableCell } from './findCellsAffordableToday';

const cells = [
  { id: 'a', value: 50, position: 4 },
  { id: 'b', value: 10, position: 0 },
  { id: 'c', value: 30, position: 2, savedAt: '2027-01-01T10:00:00.000Z' },
  { id: 'd', value: 30, position: 1 },
  { id: 'e', value: 80, position: 3 },
];

describe('findCellsAffordableToday', () => {
  it('retorna as não riscadas com valor ≤ ao informado, na ordem da grade', () => {
    expect(findCellsAffordableToday(cells, 50).map((cell) => cell.id)).toEqual(['b', 'd', 'a']);
  });

  it('inclui valor exatamente igual', () => {
    expect(findCellsAffordableToday(cells, 10).map((cell) => cell.id)).toEqual(['b']);
  });

  it('vazio quando nada cabe ou o valor é inválido', () => {
    expect(findCellsAffordableToday(cells, 5)).toEqual([]);
    expect(findCellsAffordableToday(cells, 0)).toEqual([]);
    expect(findCellsAffordableToday(cells, Number.NaN)).toEqual([]);
  });

  it('não altera a lista original', () => {
    const copy = structuredClone(cells);
    findCellsAffordableToday(cells, 100);
    expect(cells).toEqual(copy);
  });
});

describe('findLargestAffordableCell', () => {
  it('escolhe o maior valor que cabe', () => {
    expect(findLargestAffordableCell(cells, 79)?.id).toBe('a');
    expect(findLargestAffordableCell(cells, 1_000)?.id).toBe('e');
  });

  it('ignora células já riscadas e desempata pela posição', () => {
    expect(findLargestAffordableCell(cells, 30)?.id).toBe('d');
  });

  it('undefined quando nada cabe', () => {
    expect(findLargestAffordableCell(cells, 1)).toBeUndefined();
  });
});

describe('pickRandomAffordableCell', () => {
  it('usa o sorteio para escolher entre as que cabem', () => {
    expect(pickRandomAffordableCell(cells, 50, () => 0)?.id).toBe('b');
    expect(pickRandomAffordableCell(cells, 50, () => 0.5)?.id).toBe('d');
    expect(pickRandomAffordableCell(cells, 50, () => 0.9999)?.id).toBe('a');
  });

  it('undefined quando nada cabe', () => {
    expect(pickRandomAffordableCell(cells, 1, () => 0)).toBeUndefined();
  });
});
