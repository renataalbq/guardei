import { describe, expect, it } from 'vitest';
import {
  InvalidGoalError,
  MIN_WEEKS52_GOAL,
  effectiveGoal,
  generateCellValues,
  generateSequentialValues,
  generateWeeks52Values,
  roundGoalUpToStep,
} from './generateCells';

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

describe('generateSequentialValues', () => {
  it('meta 20.000 com step 1 → 199 células, sem o 100, somando 20.000', () => {
    const values = generateSequentialValues(20_000, 1);
    expect(values).toHaveLength(199);
    expect(values).not.toContain(100);
    expect(values[0]).toBe(1);
    expect(values.at(-1)).toBe(200);
    expect(sum(values)).toBe(20_000);
  });

  it('meta que é número triangular exato não remove nenhuma célula', () => {
    const values = generateSequentialValues(20_100, 1);
    expect(values).toHaveLength(200);
    expect(sum(values)).toBe(20_100);
  });

  it('arredonda a meta para o múltiplo de step acima', () => {
    expect(roundGoalUpToStep(1_003, 5)).toBe(1_005);
    expect(sum(generateSequentialValues(1_003, 5))).toBe(1_005);
    expect(effectiveGoal({ type: 'sequential', goal: 1_003, step: 5 })).toBe(1_005);
  });

  it('todos os valores são múltiplos de step, únicos e crescentes', () => {
    const values = generateSequentialValues(30_000, 10);
    values.forEach((value, index) => {
      expect(value % 10).toBe(0);
      if (index > 0) expect(value).toBeGreaterThan(values[index - 1]!);
    });
  });

  it('metas muito pequenas', () => {
    expect(generateSequentialValues(1, 1)).toEqual([1]);
    expect(generateSequentialValues(2, 1)).toEqual([2]);
    expect(generateSequentialValues(1, 10)).toEqual([10]);
    expect(generateSequentialValues(4, 1)).toEqual([1, 3]);
  });

  it.each([1, 2, 5, 10])('a soma é sempre a meta (step %i) em várias metas', (step) => {
    const goals = [1, 7, 99, 100, 101, 999, 1_234, 5_000, 12_345, 20_000, 30_000, 50_001, 100_000, 1_000_000];
    for (const goal of goals) {
      const values = generateSequentialValues(goal, step);
      expect(sum(values)).toBe(roundGoalUpToStep(goal, step));
      expect(new Set(values).size).toBe(values.length);
      expect(values.every((value) => value > 0)).toBe(true);
    }
  });

  it('a soma bate para todas as metas de 1 a 3.000', () => {
    for (let goal = 1; goal <= 3_000; goal++) {
      expect(sum(generateSequentialValues(goal, 1))).toBe(goal);
    }
  });

  it('rejeita metas inválidas', () => {
    expect(() => generateSequentialValues(0, 1)).toThrow(InvalidGoalError);
    expect(() => generateSequentialValues(-10, 1)).toThrow(InvalidGoalError);
    expect(() => generateSequentialValues(10.5, 1)).toThrow(InvalidGoalError);
  });
});

describe('generateWeeks52Values', () => {
  it('gera 52 semanas somando exatamente a meta', () => {
    const goals = [MIN_WEEKS52_GOAL, 1_379, 2_000, 5_000, 10_000, 12_345, 20_000, 30_000, 99_999];
    for (const goal of goals) {
      const values = generateWeeks52Values(goal);
      expect(values).toHaveLength(52);
      expect(sum(values)).toBe(goal);
      expect(values.every((value) => Number.isInteger(value) && value > 0)).toBe(true);
    }
  });

  it('meta 13.780 → semana k vale 10 × k', () => {
    const values = generateWeeks52Values(13_780);
    expect(values[0]).toBe(10);
    expect(values[51]).toBe(520);
  });

  it('rejeita metas abaixo do mínimo', () => {
    expect(() => generateWeeks52Values(MIN_WEEKS52_GOAL - 1)).toThrow(InvalidGoalError);
  });
});

describe('generateCellValues', () => {
  it('escolhe o gerador pelo tipo', () => {
    expect(generateCellValues({ type: 'sequential', goal: 20_000, step: 1 })).toHaveLength(199);
    expect(generateCellValues({ type: 'weeks52', goal: 20_000, step: 1 })).toHaveLength(52);
  });
});
