import { describe, expect, it } from 'vitest';
import { buildShareFileName, buildShareText, computeStoryGridLayout } from './storyLayout';

describe('computeStoryGridLayout', () => {
  it('199 células numa área quase quadrada', () => {
    const layout = computeStoryGridLayout(199, 900, 1000);
    expect(layout.columns * layout.rows).toBeGreaterThanOrEqual(199);
    expect(layout.columns * layout.cellWidth).toBeLessThanOrEqual(900);
    expect(layout.rows * layout.cellHeight).toBeLessThanOrEqual(1000);
    expect(layout.cellWidth).toBeGreaterThanOrEqual(60);
  });

  it('respeita o espaço entre células', () => {
    const layout = computeStoryGridLayout(199, 900, 1000, 1, 2);
    expect(layout.columns * layout.cellWidth + (layout.columns - 1) * 2).toBeLessThanOrEqual(900);
    expect(layout.rows * layout.cellHeight + (layout.rows - 1) * 2).toBeLessThanOrEqual(1000);
  });

  it('células retangulares do 52 semanas', () => {
    const layout = computeStoryGridLayout(52, 900, 1000, 4 / 3);
    expect(layout.columns * layout.rows).toBeGreaterThanOrEqual(52);
    expect(layout.rows * layout.cellHeight).toBeLessThanOrEqual(1000);
    expect(layout.cellWidth / layout.cellHeight).toBeCloseTo(4 / 3, 1);
  });

  it('muitas células ainda cabem', () => {
    const layout = computeStoryGridLayout(447, 900, 1000);
    expect(layout.columns * layout.rows).toBeGreaterThanOrEqual(447);
    expect(layout.cellWidth).toBeGreaterThan(30);
  });
});

describe('buildShareText', () => {
  it('progresso, começo e meta batida', () => {
    expect(buildShareText(3_250, 20_000)).toBe('Já guardei R$ 3.250 de R$ 20.000 no meu desafio do Guardei!');
    expect(buildShareText(0, 20_000)).toBe('Comecei meu desafio de R$ 20.000 no Guardei!');
    expect(buildShareText(20_000, 20_000)).toBe('Bati minha meta de R$ 20.000! Risquei todos os números no Guardei.');
  });
});

describe('buildShareFileName', () => {
  it('gera um nome de arquivo seguro', () => {
    expect(buildShareFileName('20 mil em 2027')).toBe('guardei-20-mil-em-2027.png');
    expect(buildShareFileName('Viagem pra João Pessoa ✈️')).toBe('guardei-viagem-pra-joao-pessoa.png');
    expect(buildShareFileName('🎉')).toBe('guardei.png');
  });
});
