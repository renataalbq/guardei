import { describe, expect, it } from 'vitest';
import { evaluateChallengeDraft, type ChallengeDraft } from './previewChallenge';

const draft: ChallengeDraft = {
  name: '20 mil em 2027',
  goal: 20_000,
  type: 'sequential',
  step: 1,
  startDate: '2027-01-01',
  endDate: '2027-12-31',
};

describe('evaluateChallengeDraft', () => {
  it('pré-visualiza o desafio padrão', () => {
    const result = evaluateChallengeDraft(draft);
    expect(result).toEqual({
      isValid: true,
      nameProblem: undefined,
      preview: {
        effectiveGoal: 20_000,
        goalWasRounded: false,
        cellCount: 199,
        largestValue: 200,
        smallestValue: 1,
        periodDays: 365,
        dailyAverageNeeded: 55,
        monthlyLimitPlan: undefined,
      },
    });
  });

  it('avisa quando a meta é arredondada pelo step', () => {
    const result = evaluateChallengeDraft({ ...draft, goal: 1_003, step: 5 });
    expect(result.isValid && result.preview).toMatchObject({ effectiveGoal: 1_005, goalWasRounded: true });
  });

  it('inclui o plano do limite mensal', () => {
    const result = evaluateChallengeDraft({ ...draft, monthlyLimit: 1_000 });
    expect(result.isValid && result.preview.monthlyLimitPlan).toMatchObject({ fitsDeadline: false, estimatedEndDate: '2028-08-31' });
  });

  it('sem prazo não calcula média diária', () => {
    const result = evaluateChallengeDraft({ ...draft, endDate: undefined });
    expect(result.isValid && result.preview.dailyAverageNeeded).toBeUndefined();
  });

  it('aponta problemas', () => {
    expect(evaluateChallengeDraft({ ...draft, goal: 0 })).toMatchObject({ isValid: false, problems: ['Informe a meta em reais.'] });
    expect(evaluateChallengeDraft({ ...draft, type: 'weeks52', goal: 1_000 }).isValid).toBe(false);
    expect(evaluateChallengeDraft({ ...draft, endDate: '2026-12-31' })).toMatchObject({
      isValid: false,
      problems: ['O prazo precisa ser depois da data de início.'],
    });
  });

  it('nome vazio não impede a pré-visualização, mas é sinalizado', () => {
    const result = evaluateChallengeDraft({ ...draft, name: '  ' });
    expect(result.isValid).toBe(true);
    expect(result.nameProblem).toBeDefined();
  });
});
