import { describe, expect, it } from 'vitest';
import { INTERVAL, LEARN_DAYS, rate, statusOf } from '../../src/core/leitner';
import type { Box, WordProgress } from '../../src/types';

const TODAY = '2026-10-26';

const at = (box: Box, overrides: Partial<WordProgress> = {}): WordProgress => ({
  box,
  lastRated: '2026-10-01',
  due: '2026-10-20',
  introduced: '2026-09-01',
  knownOnSight: false,
  ...overrides,
});

describe('INTERVAL', () => {
  it('is 1/2/4/7/30 days for boxes 1-5 (FR-012)', () => {
    expect(INTERVAL).toEqual({ 1: 1, 2: 2, 3: 4, 4: 7, 5: 30 });
  });
  it('gives 13 days as the shortest path from new to box 5', () => {
    expect(LEARN_DAYS).toBe(13);
  });
});

describe('rate: new words (FR-011, FR-011a)', () => {
  it('"knew it" puts a new word in box 2, due in 2 days', () => {
    expect(rate(undefined, 'knew', TODAY)).toEqual({
      box: 2,
      lastRated: TODAY,
      due: '2026-10-28',
      introduced: TODAY,
      knownOnSight: false,
    });
  });
  it('"didn\'t know" puts a new word in box 1, due tomorrow', () => {
    expect(rate(undefined, 'didnt', TODAY)).toMatchObject({ box: 1, due: '2026-10-27', introduced: TODAY });
  });
  it('"I already know this" puts a new word in box 5, due in 30 days', () => {
    expect(rate(undefined, 'known', TODAY)).toEqual({
      box: 5,
      lastRated: TODAY,
      due: '2026-11-25',
      introduced: TODAY,
      knownOnSight: true,
    });
  });
});

describe('rate: words already in a box', () => {
  it.each([
    [1, 2, '2026-10-28'],
    [2, 3, '2026-10-30'],
    [3, 4, '2026-11-02'],
    [4, 5, '2026-11-25'],
  ] as [Box, Box, string][])('"knew it" moves box %i to box %i', (from, to, due) => {
    expect(rate(at(from), 'knew', TODAY)).toMatchObject({ box: to, lastRated: TODAY, due });
  });

  it('"knew it" keeps box 5 in box 5, due in 30 days (FR-013)', () => {
    expect(rate(at(5), 'knew', TODAY)).toMatchObject({ box: 5, due: '2026-11-25' });
  });

  it.each([1, 2, 3, 4, 5] as Box[])('"didn\'t know" sends box %i back to box 1', (from) => {
    expect(rate(at(from), 'didnt', TODAY)).toMatchObject({ box: 1, lastRated: TODAY, due: '2026-10-27' });
  });

  it('keeps the original introduction date and knownOnSight flag', () => {
    const p = rate(at(5, { knownOnSight: true }), 'didnt', TODAY);
    expect(p.introduced).toBe('2026-09-01');
    expect(p.knownOnSight).toBe(true);
  });

  it('rejects "I already know this" for a word that is not new', () => {
    expect(() => rate(at(2), 'known', TODAY)).toThrow();
  });
});

describe('statusOf', () => {
  it('maps no record to new, boxes 1-4 to learning, box 5 to learned', () => {
    expect(statusOf(undefined)).toBe('new');
    for (const b of [1, 2, 3, 4] as Box[]) expect(statusOf(at(b))).toBe('learning');
    expect(statusOf(at(5))).toBe('learned');
  });
});
