import { describe, expect, it } from 'vitest';
import { planForMonthlyLimit } from './monthlyLimitPlan';

describe('planForMonthlyLimit', () => {
  it('cabe no limite: 20 mil em 2027 com 2.000/mês', () => {
    expect(planForMonthlyLimit({ goal: 20_000, startDate: '2027-01-01', endDate: '2027-12-31', monthlyLimit: 2_000 })).toEqual({
      monthsNeeded: 10,
      estimatedEndDate: '2027-10-31',
      requiredPerMonth: 1_667,
      fitsDeadline: true,
    });
  });

  it('não cabe: sugere aumentar o prazo', () => {
    expect(planForMonthlyLimit({ goal: 20_000, startDate: '2027-01-01', endDate: '2027-12-31', monthlyLimit: 1_000 })).toEqual({
      monthsNeeded: 20,
      estimatedEndDate: '2028-08-31',
      requiredPerMonth: 1_667,
      fitsDeadline: false,
    });
  });

  it('limite exatamente igual ao necessário cabe', () => {
    expect(planForMonthlyLimit({ goal: 12_000, startDate: '2027-01-01', endDate: '2027-12-31', monthlyLimit: 1_000 })?.fitsDeadline).toBe(true);
  });

  it('sem prazo: só estima a data', () => {
    expect(planForMonthlyLimit({ goal: 30_000, startDate: '2026-11-20', monthlyLimit: 1_400 })).toEqual({
      monthsNeeded: 22,
      estimatedEndDate: '2028-09-19',
    });
  });

  it('ignora limite inválido', () => {
    expect(planForMonthlyLimit({ goal: 1_000, startDate: '2027-01-01', monthlyLimit: 0 })).toBeUndefined();
  });
});
