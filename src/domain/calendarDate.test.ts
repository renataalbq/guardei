import { describe, expect, it } from 'vitest';
import { addDays, addMonths, daysBetween, formatCalendarDate, formatMonthYear, isValidCalendarDate, monthsInPeriod, todayCalendarDate } from './calendarDate';

describe('calendarDate', () => {
  it('daysBetween e addDays atravessam anos bissextos', () => {
    expect(daysBetween('2028-02-28', '2028-03-01')).toBe(2);
    expect(addDays('2027-12-31', 1)).toBe('2028-01-01');
  });

  it('addMonths usa o último dia quando o dia não existe', () => {
    expect(addMonths('2027-01-31', 1)).toBe('2027-02-28');
    expect(addMonths('2027-01-01', 20)).toBe('2028-09-01');
  });

  it('monthsInPeriod: ano inteiro = 12 meses', () => {
    expect(monthsInPeriod('2027-01-01', '2027-12-31')).toBe(12);
    expect(monthsInPeriod('2027-01-01', '2027-06-30')).toBe(6);
    expect(monthsInPeriod('2027-01-01', '2026-12-31')).toBe(0);
    expect(monthsInPeriod('2027-01-01', '2027-01-15')).toBeCloseTo(15 / 30.4375);
  });

  it('valida datas', () => {
    expect(isValidCalendarDate('2027-02-29')).toBe(false);
    expect(isValidCalendarDate('2028-02-29')).toBe(true);
    expect(isValidCalendarDate('31/12/2027')).toBe(false);
  });

  it('hoje no fuso local', () => {
    expect(todayCalendarDate(new Date(2027, 0, 5, 23, 59))).toBe('2027-01-05');
  });

  it('formata em pt-BR', () => {
    expect(formatCalendarDate('2027-12-31')).toBe('31/12/2027');
    expect(formatMonthYear('2028-08-31')).toBe('ago/2028');
  });
});
