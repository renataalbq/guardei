import type { CalendarDate } from './types';

const MS_PER_DAY = 86_400_000;
export const AVERAGE_DAYS_PER_MONTH = 365.25 / 12;

function toUtcMs(date: CalendarDate): number {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) throw new Error(`Data inválida: ${date}`);
  return Date.UTC(year, month - 1, day);
}

function fromUtcMs(ms: number): CalendarDate {
  return new Date(ms).toISOString().slice(0, 10);
}

export function isValidCalendarDate(value: string): value is CalendarDate {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return fromUtcMs(toUtcMs(value)) === value;
}

/** Data de hoje no fuso local do aparelho. */
export function todayCalendarDate(now: Date = new Date()): CalendarDate {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Dias de `from` até `to` (positivo se `to` for depois). */
export function daysBetween(from: CalendarDate, to: CalendarDate): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY);
}

/** Quantidade de dias do período, contando o primeiro e o último. */
export function daysInPeriodInclusive(start: CalendarDate, end: CalendarDate): number {
  return daysBetween(start, end) + 1;
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  return fromUtcMs(toUtcMs(date) + days * MS_PER_DAY);
}

/** Soma meses mantendo o dia; se o dia não existir no mês de destino, usa o último dia do mês. */
export function addMonths(date: CalendarDate, months: number): CalendarDate {
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  const targetMonthIndex = month - 1 + months;
  const lastDayOfTarget = new Date(Date.UTC(year, targetMonthIndex + 1, 0)).getUTCDate();
  return fromUtcMs(Date.UTC(year, targetMonthIndex, Math.min(day, lastDayOfTarget)));
}

/**
 * Duração do período em meses (com fração). Jan/01 a Dez/31 do mesmo ano = 12.
 */
export function monthsInPeriod(start: CalendarDate, end: CalendarDate): number {
  if (daysBetween(start, end) < 0) return 0;
  let fullMonths = 0;
  while (addDays(addMonths(start, fullMonths + 1), -1) <= end) fullMonths++;
  const remainderStart = addMonths(start, fullMonths);
  const remainderDays = daysInPeriodInclusive(remainderStart, end);
  return fullMonths + Math.max(0, remainderDays) / AVERAGE_DAYS_PER_MONTH;
}

export function lastDayOfYear(year: number): CalendarDate {
  return `${year}-12-31`;
}

export function firstDayOfYear(year: number): CalendarDate {
  return `${year}-01-01`;
}

export function yearOf(date: CalendarDate): number {
  return Number(date.slice(0, 4));
}

const longDateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
const monthYearFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** "31/12/2027" */
export function formatCalendarDate(date: CalendarDate): string {
  return longDateFormatter.format(new Date(toUtcMs(date)));
}

/** "ago. de 2028" → "ago/2028" */
export function formatMonthYear(date: CalendarDate): string {
  const parts = monthYearFormatter.formatToParts(new Date(toUtcMs(date)));
  const month = parts.find((part) => part.type === 'month')?.value.replace('.', '') ?? '';
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  return `${month}/${year}`;
}
