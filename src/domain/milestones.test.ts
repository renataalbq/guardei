import { describe, expect, it } from 'vitest';
import { computeMilestones, findMilestoneCrossed } from './milestones';

describe('computeMilestones', () => {
  it('no começo, o próximo marco é 10%', () => {
    const progress = computeMilestones(20_000, 0);
    expect(progress.next).toEqual({ percent: 10, amount: 2_000, reached: false });
    expect(progress.remainingToNext).toBe(2_000);
    expect(progress.percentOfCurrentStretch).toBe(0);
  });

  it('mede o trecho entre o marco anterior e o próximo', () => {
    // entre 10% (2.000) e 25% (5.000): 3.500 percorre 1.500 de 3.000
    const progress = computeMilestones(20_000, 3_500);
    expect(progress.next?.percent).toBe(25);
    expect(progress.remainingToNext).toBe(1_500);
    expect(progress.percentOfCurrentStretch).toBe(50);
    expect(progress.milestones.filter((milestone) => milestone.reached).map((milestone) => milestone.percent)).toEqual([10]);
  });

  it('valor exato do marco conta como alcançado', () => {
    expect(computeMilestones(20_000, 10_000).next?.percent).toBe(75);
  });

  it('meta batida não tem próximo marco', () => {
    const progress = computeMilestones(20_000, 20_000);
    expect(progress.next).toBeUndefined();
    expect(progress.remainingToNext).toBe(0);
    expect(progress.percentOfCurrentStretch).toBe(100);
  });
});

describe('findMilestoneCrossed', () => {
  it('detecta o marco ultrapassado', () => {
    expect(findMilestoneCrossed(20_000, 1_990, 2_010)).toBe(10);
  });

  it('se pulou vários, devolve o maior', () => {
    expect(findMilestoneCrossed(1_000, 0, 600)).toBe(50);
  });

  it('nada quando não cruzou ou quando diminuiu', () => {
    expect(findMilestoneCrossed(20_000, 2_100, 2_500)).toBeUndefined();
    expect(findMilestoneCrossed(20_000, 2_010, 1_990)).toBeUndefined();
  });
});
