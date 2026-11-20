import { describe, expect, it } from 'vitest';
import { clipSegmentToRect, computeHorizontalCoverage, findScratchedCells, normalizeStrokeToRect } from './strokeCoverage';

const cell = { left: 100, top: 0, width: 50, height: 50 };

describe('clipSegmentToRect', () => {
  it('recorta um segmento que atravessa o retângulo', () => {
    expect(
      clipSegmentToRect(
        [
          { x: 0, y: 25 },
          { x: 300, y: 25 },
        ],
        cell,
      ),
    ).toEqual([
      { x: 100, y: 25 },
      { x: 150, y: 25 },
    ]);
  });

  it('undefined quando passa fora', () => {
    expect(
      clipSegmentToRect(
        [
          { x: 0, y: 80 },
          { x: 300, y: 80 },
        ],
        cell,
      ),
    ).toBeUndefined();
  });
});

describe('computeHorizontalCoverage', () => {
  it('traço atravessando a célula inteira = 1', () => {
    expect(
      computeHorizontalCoverage(
        [
          { x: 80, y: 20 },
          { x: 170, y: 30 },
        ],
        cell,
      ),
    ).toBe(1);
  });

  it('traço cobrindo metade', () => {
    expect(
      computeHorizontalCoverage(
        [
          { x: 125, y: 25 },
          { x: 200, y: 25 },
        ],
        cell,
      ),
    ).toBe(0.5);
  });

  it('vai e volta não conta em dobro', () => {
    const points = [
      { x: 110, y: 25 },
      { x: 140, y: 25 },
      { x: 115, y: 26 },
      { x: 135, y: 27 },
    ];
    expect(computeHorizontalCoverage(points, cell)).toBeCloseTo(0.6);
  });

  it('trechos separados somam', () => {
    const points = [
      { x: 100, y: 25 },
      { x: 115, y: 25 },
      { x: 115, y: 80 },
      { x: 135, y: 80 },
      { x: 135, y: 25 },
      { x: 150, y: 25 },
    ];
    expect(computeHorizontalCoverage(points, cell)).toBeCloseTo(0.6);
  });

  it('traço que sai pela borda de cima conta só a parte de dentro', () => {
    // desce de y=-25 até y=25 entre x=100 e x=150: só a metade final está dentro
    expect(
      computeHorizontalCoverage(
        [
          { x: 100, y: -25 },
          { x: 150, y: 25 },
        ],
        cell,
      ),
    ).toBeCloseTo(0.5);
  });

  it('ponto único não cobre nada', () => {
    expect(computeHorizontalCoverage([{ x: 120, y: 25 }], cell)).toBe(0);
  });
});

describe('findScratchedCells', () => {
  const row = [0, 1, 2, 3].map((index) => ({ cellId: `c${index}`, rect: { left: index * 50, top: 0, width: 50, height: 50 } }));

  it('um traço risca várias células da mesma linha, respeitando os 60%', () => {
    // de x=20 (c0 coberto 60%) até x=170 (c3 coberto 40%)
    const scratched = findScratchedCells(
      [
        { x: 20, y: 25 },
        { x: 170, y: 25 },
      ],
      row,
    );
    expect(scratched.map((cell) => cell.cellId)).toEqual(['c0', 'c1', 'c2']);
  });

  it('não risca células de outra linha', () => {
    const otherRow = [{ cellId: 'below', rect: { left: 0, top: 50, width: 50, height: 50 } }];
    expect(
      findScratchedCells(
        [
          { x: 0, y: 25 },
          { x: 50, y: 25 },
        ],
        otherRow,
      ),
    ).toEqual([]);
  });
});

describe('normalizeStrokeToRect', () => {
  it('normaliza o trecho dentro da célula para 0–1', () => {
    expect(
      normalizeStrokeToRect(
        [
          { x: 80, y: 10 },
          { x: 125, y: 25 },
          { x: 170, y: 40 },
        ],
        cell,
      ),
    ).toEqual([
      { x: 0, y: 0.333 },
      { x: 0.5, y: 0.5 },
      { x: 1, y: 0.667 },
    ]);
  });
});
