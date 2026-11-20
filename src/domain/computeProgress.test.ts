import { describe, expect, it } from 'vitest';
import { computeDeadlinePace, computeProgress } from './computeProgress';

describe('computeProgress', () => {
  it('soma só as células riscadas', () => {
    const progress = computeProgress(100, [
      { value: 10, savedAt: 'x' },
      { value: 40 },
      { value: 50, savedAt: 'x' },
    ]);
    expect(progress).toMatchObject({ savedAmount: 60, remainingAmount: 40, percent: 60, savedCount: 2, totalCount: 3, isCompleted: false });
  });

  it('concluído quando todas estão riscadas', () => {
    const progress = computeProgress(30, [
      { value: 10, savedAt: 'x' },
      { value: 20, savedAt: 'x' },
    ]);
    expect(progress.isCompleted).toBe(true);
    expect(progress.percent).toBe(100);
    expect(progress.remainingAmount).toBe(0);
  });

  it('sem células', () => {
    expect(computeProgress(100, [])).toMatchObject({ savedAmount: 0, percent: 0, isCompleted: false });
  });
});

describe('computeDeadlinePace', () => {
  const base = { goal: 20_000, startDate: '2027-01-01', endDate: '2027-12-31' };

  it('concluído', () => {
    expect(computeDeadlinePace({ ...base, savedAmount: 20_000, today: '2027-05-01' })).toEqual({ status: 'completed' });
  });

  it('ainda não começou', () => {
    expect(computeDeadlinePace({ ...base, savedAmount: 0, today: '2026-12-22' })).toEqual({ status: 'not-started', startsInDays: 10 });
  });

  it('prazo vencido', () => {
    expect(computeDeadlinePace({ ...base, savedAmount: 100, today: '2028-01-01' })).toEqual({ status: 'overdue', remainingAmount: 19_900 });
  });

  it('calcula quanto guardar por dia até o prazo (contando hoje)', () => {
    const pace = computeDeadlinePace({ ...base, savedAmount: 0, today: '2027-01-01' });
    expect(pace).toMatchObject({ status: 'active', daysLeft: 365, dailyAmountNeeded: 55 });
    expect(pace.status === 'active' && pace.projectedFinishDate).toBeFalsy();
  });

  it('projeta a data de conclusão pelo ritmo atual', () => {
    // 10 dias (01 a 10/jan) guardando 1.000 → 100/dia; faltam 19.000 → 190 dias
    const pace = computeDeadlinePace({ ...base, savedAmount: 1_000, today: '2027-01-10' });
    expect(pace).toMatchObject({ status: 'active', projectedFinishDate: '2027-07-19', onTrack: true });
  });

  it('indica quando o ritmo atual não chega no prazo', () => {
    const pace = computeDeadlinePace({ ...base, savedAmount: 100, today: '2027-01-10' });
    expect(pace).toMatchObject({ status: 'active', onTrack: false });
  });

  it('não projeta com menos de 7 dias de desafio', () => {
    const pace = computeDeadlinePace({ ...base, savedAmount: 257, today: '2027-01-06' });
    expect(pace.status === 'active' && pace.projectedFinishDate).toBeUndefined();
    const paceOnDay7 = computeDeadlinePace({ ...base, savedAmount: 257, today: '2027-01-07' });
    expect(paceOnDay7.status === 'active' && paceOnDay7.projectedFinishDate).toBeDefined();
  });

  it('sem prazo: só projeção', () => {
    const pace = computeDeadlinePace({ goal: 1_000, savedAmount: 500, startDate: '2027-01-01', today: '2027-01-10' });
    expect(pace).toEqual({
      status: 'active',
      remainingAmount: 500,
      daysLeft: undefined,
      dailyAmountNeeded: undefined,
      projectedFinishDate: '2027-01-20',
      onTrack: undefined,
    });
  });

  it('se já guardou antes da data de início, considera ativo', () => {
    expect(computeDeadlinePace({ ...base, savedAmount: 10, today: '2026-12-20' }).status).toBe('active');
  });
});
