import { describe, expect, it } from 'vitest';
import { generateHandDrawnStroke } from './generateHandDrawnStroke';
import { computeHorizontalCoverage, SCRATCH_COVERAGE_THRESHOLD } from './strokeCoverage';

describe('generateHandDrawnStroke', () => {
  it('é determinístico pela semente', () => {
    expect(generateHandDrawnStroke('cell-1')).toEqual(generateHandDrawnStroke('cell-1'));
    expect(generateHandDrawnStroke('cell-1')).not.toEqual(generateHandDrawnStroke('cell-2'));
  });

  it('fica dentro da célula e cobre o suficiente para contar como riscado', () => {
    for (let i = 0; i < 200; i++) {
      const stroke = generateHandDrawnStroke(`seed-${i}`);
      for (const point of stroke) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(1);
        expect(point.y).toBeGreaterThan(0.2);
        expect(point.y).toBeLessThan(0.8);
      }
      expect(computeHorizontalCoverage(stroke, { left: 0, top: 0, width: 1, height: 1 })).toBeGreaterThanOrEqual(SCRATCH_COVERAGE_THRESHOLD);
    }
  });
});
