import { describe, expect, it } from 'vitest';
import { addDays, diffDays, isOnOrBefore, toLocalDate } from '../../src/core/dates';

describe('toLocalDate', () => {
  it('uses local date parts, not UTC', () => {
    // 23:30 local time on Jan 31 stays Jan 31 whatever the time zone.
    expect(toLocalDate(new Date(2026, 0, 31, 23, 30))).toBe('2026-01-31');
    expect(toLocalDate(new Date(2026, 8, 5, 0, 5))).toBe('2026-09-05');
  });
});

describe('addDays', () => {
  it('adds within a month', () => {
    expect(addDays('2026-10-26', 1)).toBe('2026-10-27');
  });
  it('crosses month and year ends', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });
  it('is not shifted by daylight-saving changes', () => {
    // Israel and EU/US clocks change in late March and late October.
    expect(addDays('2026-03-26', 7)).toBe('2026-04-02');
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26');
  });
  it('handles long intervals', () => {
    expect(addDays('2026-10-26', 30)).toBe('2026-11-25');
  });
});

describe('diffDays', () => {
  it('returns positive, negative and zero differences', () => {
    expect(diffDays('2026-10-26', '2026-10-30')).toBe(4);
    expect(diffDays('2026-10-30', '2026-10-26')).toBe(-4);
    expect(diffDays('2026-10-26', '2026-10-26')).toBe(0);
  });
  it('spans year ends and DST changes', () => {
    expect(diffDays('2026-12-30', '2027-01-02')).toBe(3);
    expect(diffDays('2026-03-20', '2026-04-03')).toBe(14);
  });
});

describe('isOnOrBefore', () => {
  it('compares by calendar order', () => {
    expect(isOnOrBefore('2026-10-26', '2026-10-26')).toBe(true);
    expect(isOnOrBefore('2026-09-30', '2026-10-01')).toBe(true);
    expect(isOnOrBefore('2026-10-02', '2026-10-01')).toBe(false);
  });
});
