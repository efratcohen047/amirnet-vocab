import { toLocalDate } from './core/dates';
import type { LocalDate } from './types';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Today's local date. In `npm run dev` only, `?today=YYYY-MM-DD` overrides it so multi-day
 * behaviour can be checked by hand (quickstart → Simulating days).
 */
export function getToday(): LocalDate {
  if (import.meta.env.DEV) {
    const override = new URLSearchParams(window.location.search).get('today');
    if (override && DATE_RE.test(override)) return override;
  }
  return toLocalDate(new Date());
}
