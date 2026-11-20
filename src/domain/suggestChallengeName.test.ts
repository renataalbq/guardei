import { describe, expect, it } from 'vitest';
import { suggestChallengeName } from './suggestChallengeName';

describe('suggestChallengeName', () => {
  it('meta redonda em milhares com prazo', () => {
    expect(suggestChallengeName(20_000, '2027-12-31')).toBe('20 mil em 2027');
    expect(suggestChallengeName(1_500_000, '2030-06-30')).toBe('1.500 mil em 2030');
  });

  it('meta quebrada usa o valor em reais', () => {
    expect(suggestChallengeName(12_345, '2028-12-31')).toBe('R$\u00a012.345 em 2028');
  });

  it('sem prazo', () => {
    expect(suggestChallengeName(30_000, undefined)).toBe('Juntar 30 mil');
  });

  it('sem meta', () => {
    expect(suggestChallengeName(undefined, '2027-12-31')).toBe('Meu desafio');
  });
});
