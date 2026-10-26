import type { LocalDate } from '../types';

const DAY_MS = 86_400_000;

const pad = (n: number) => String(n).padStart(2, '0');

/** The local calendar date of `d` (device time zone). */
export function toLocalDate(d: Date): LocalDate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Calendar maths goes through UTC midnight so daylight-saving changes cannot shift a day.
function toUtcMs(day: LocalDate): number {
  const [y, m, d] = day.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtcMs(ms: number): LocalDate {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function addDays(day: LocalDate, n: number): LocalDate {
  return fromUtcMs(toUtcMs(day) + n * DAY_MS);
}

/** Whole days from `a` to `b` (positive when `b` is later). */
export function diffDays(a: LocalDate, b: LocalDate): number {
  return Math.round((toUtcMs(b) - toUtcMs(a)) / DAY_MS);
}

/** `YYYY-MM-DD` strings sort in calendar order. */
export function isOnOrBefore(a: LocalDate, b: LocalDate): boolean {
  return a <= b;
}
