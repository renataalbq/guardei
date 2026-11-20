import { describe, expect, it } from 'vitest';
import { computeTodayBudgetStatus } from './todayBudget';

const budget = { amount: 50, setAt: '2027-03-10T12:00:00.000Z' };
const cells = [
  { id: 'a', value: 5, position: 0 },
  { id: 'b', value: 12, position: 1 },
  { id: 'c', value: 37, position: 2 },
  { id: 'd', value: 60, position: 3 },
  { id: 'e', value: 20, position: 4, savedAt: '2027-03-09T10:00:00.000Z' },
];

describe('computeTodayBudgetStatus', () => {
  it('logo após informar o valor, tudo que cabe nele fica destacado', () => {
    const status = computeTodayBudgetStatus(cells, budget);
    expect(status).toMatchObject({ spent: 0, remaining: 50, smallestOpenValue: 5 });
    expect(status.affordable.map((cell) => cell.id)).toEqual(['a', 'b', 'c']);
  });

  it('o que foi riscado depois sai do orçamento; o que foi riscado antes não conta', () => {
    const afterSaving37 = cells.map((cell) => (cell.id === 'c' ? { ...cell, savedAt: '2027-03-10T12:05:00.000Z' } : cell));
    const status = computeTodayBudgetStatus(afterSaving37, budget);
    expect(status).toMatchObject({ spent: 37, remaining: 13 });
    expect(status.affordable.map((cell) => cell.id)).toEqual(['a', 'b']);
  });

  it('desfazer devolve o valor ao orçamento', () => {
    expect(computeTodayBudgetStatus(cells, budget).remaining).toBe(50);
  });

  it('não fica negativo se riscar mais do que o informado', () => {
    const overspent = cells.map((cell) => (cell.id === 'd' ? { ...cell, savedAt: '2027-03-10T13:00:00.000Z' } : cell));
    const status = computeTodayBudgetStatus(overspent, budget);
    expect(status).toMatchObject({ spent: 60, remaining: 0, affordable: [] });
  });

  it('informa o menor valor aberto quando nada cabe', () => {
    const status = computeTodayBudgetStatus(cells, { ...budget, amount: 3 });
    expect(status.affordable).toEqual([]);
    expect(status.smallestOpenValue).toBe(5);
  });
});
