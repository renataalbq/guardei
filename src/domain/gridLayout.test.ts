import { describe, expect, it } from 'vitest';
import { computeGridColumns } from './gridLayout';

describe('computeGridColumns', () => {
  it('celular comum (~343px úteis) → 6 colunas no sequencial e 3 no 52 semanas', () => {
    expect(computeGridColumns(343, 'sequential')).toBe(6);
    expect(computeGridColumns(343, 'weeks52')).toBe(3);
  });

  it('respeita mínimo e máximo', () => {
    expect(computeGridColumns(150, 'sequential')).toBe(4);
    expect(computeGridColumns(1_200, 'sequential')).toBe(10);
    expect(computeGridColumns(1_200, 'weeks52')).toBe(4);
  });

  it('considera o espaço entre células', () => {
    expect(computeGridColumns(343, 'sequential', 4)).toBe(6);
    expect(computeGridColumns(300, 'sequential', 4)).toBe(5);
  });
});
