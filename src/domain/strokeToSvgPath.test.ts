import { describe, expect, it } from 'vitest';
import { strokeToSvgPath } from './strokeToSvgPath';

describe('strokeToSvgPath', () => {
  it('vazio sem pontos', () => {
    expect(strokeToSvgPath([], 100, 100)).toBe('');
  });

  it('ponto único vira um ponto desenhável', () => {
    expect(strokeToSvgPath([{ x: 0.5, y: 0.5 }], 100, 100)).toBe('M50 50l0 0');
  });

  it('linha reta com dois pontos', () => {
    expect(
      strokeToSvgPath(
        [
          { x: 0, y: 0.5 },
          { x: 1, y: 0.5 },
        ],
        100,
        100,
      ),
    ).toBe('M0 50 L100 50');
  });

  it('suaviza com curvas e respeita a proporção do viewBox', () => {
    expect(
      strokeToSvgPath(
        [
          { x: 0, y: 0 },
          { x: 0.5, y: 1 },
          { x: 1, y: 0 },
        ],
        100,
        75,
      ),
    ).toBe('M0 0 Q50 75 75 37.5 L100 0');
  });
});
