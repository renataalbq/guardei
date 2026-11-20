import { describe, expect, it } from 'vitest';
import { computeSavingActivity } from './savingActivity';

const utcDate = (iso: string) => iso.slice(0, 10);
const saved = (value: number, date: string) => ({ value, savedAt: `${date}T12:00:00.000Z` });

describe('computeSavingActivity', () => {
  it('soma o que foi guardado hoje e monta os últimos 7 dias', () => {
    const activity = computeSavingActivity(
      [saved(10, '2027-03-10'), saved(5, '2027-03-10'), saved(20, '2027-03-08'), saved(99, '2027-02-01'), { value: 7 }],
      '2027-03-10',
      utcDate,
    );
    expect(activity.savedTodayAmount).toBe(15);
    expect(activity.lastDays).toEqual([
      { date: '2027-03-04', amount: 0 },
      { date: '2027-03-05', amount: 0 },
      { date: '2027-03-06', amount: 0 },
      { date: '2027-03-07', amount: 0 },
      { date: '2027-03-08', amount: 20 },
      { date: '2027-03-09', amount: 0 },
      { date: '2027-03-10', amount: 15 },
    ]);
  });

  it('conta dias seguidos até hoje', () => {
    const cells = [saved(1, '2027-03-08'), saved(1, '2027-03-09'), saved(1, '2027-03-10')];
    expect(computeSavingActivity(cells, '2027-03-10', utcDate).streakDays).toBe(3);
  });

  it('se hoje ainda não guardou, a sequência vale até ontem', () => {
    const cells = [saved(1, '2027-03-08'), saved(1, '2027-03-09')];
    expect(computeSavingActivity(cells, '2027-03-10', utcDate).streakDays).toBe(2);
  });

  it('um dia sem guardar zera a sequência', () => {
    const cells = [saved(1, '2027-03-07'), saved(1, '2027-03-09')];
    expect(computeSavingActivity(cells, '2027-03-11', utcDate).streakDays).toBe(0);
  });
});
