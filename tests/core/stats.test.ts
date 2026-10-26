import { describe, expect, it } from 'vitest';
import { accuracy, counts, goalTotal, streak } from '../../src/core/stats';
import type { Box, History, ProgressMap, StudyDay, Word, WordProgress } from '../../src/types';

const TODAY = '2026-10-26';

const words: Word[] = Array.from({ length: 10 }, (_, i) => ({
  id: `w${i + 1}`,
  word: `w${i + 1}`,
  pos: 'noun',
  he: 'מילה',
  example: 'x.',
  rank: i + 1,
  source: 'ngsl',
}));

const prog = (box: Box): WordProgress => ({
  box,
  lastRated: TODAY,
  due: TODAY,
  introduced: TODAY,
  knownOnSight: false,
});

const day = (over: Partial<StudyDay> = {}): StudyDay => ({
  completed: false,
  rest: false,
  newCount: 0,
  knownCount: 0,
  reviewCount: 0,
  knewCount: 0,
  ...over,
});

const done = (n = 20, known = 0) => day({ completed: true, newCount: n, knownCount: known });

describe('goalTotal (FR-017)', () => {
  it('is 3,000 or the planned list size, whichever is larger', () => {
    expect(goalTotal(3185)).toBe(3185);
    expect(goalTotal(2500)).toBe(3000);
  });
});

describe('counts (FR-017, FR-019)', () => {
  it('splits the goal into new / learning / learned and reports loaded words', () => {
    const progress: ProgressMap = { w1: prog(1), w2: prog(4), w3: prog(5), w4: prog(5) };
    const c = counts(words, progress, 3185);
    expect(c).toEqual({
      goal: 3185,
      loaded: 10,
      learning: 2,
      learned: 2,
      new: 3181,
      notLearned: 3183,
    });
    expect(c.new + c.learning + c.learned).toBe(c.goal);
  });

  it('ignores progress for words that are not in the list', () => {
    const c = counts(words, { gone: prog(5), w1: prog(5) }, 3185);
    expect(c.learned).toBe(1);
  });
});

describe('streak (FR-018)', () => {
  it('counts consecutive completed days ending today', () => {
    const h: History = {
      '2026-10-23': done(),
      '2026-10-24': done(),
      '2026-10-25': done(),
      '2026-10-26': done(),
    };
    expect(streak(h, TODAY)).toBe(4);
  });

  it('counts up to yesterday while today is not done yet', () => {
    const h: History = { '2026-10-24': done(), '2026-10-25': done(), '2026-10-26': day({ newCount: 3 }) };
    expect(streak(h, TODAY)).toBe(2);
  });

  it('resets after a missed day', () => {
    const h: History = { '2026-10-22': done(), '2026-10-23': done(), '2026-10-25': done(), '2026-10-26': done() };
    expect(streak(h, TODAY)).toBe(2);
    expect(streak({ '2026-10-24': done() }, TODAY)).toBe(0);
  });

  it('counts recorded rest days, but a day with no record breaks the streak', () => {
    const h: History = { '2026-10-24': done(), '2026-10-25': day({ rest: true }), '2026-10-26': done() };
    expect(streak(h, TODAY)).toBe(3);
    // 10-25 has no record (app not opened), even if nothing was due that day.
    expect(streak({ '2026-10-24': done(), '2026-10-26': done() }, TODAY)).toBe(1);
  });

  it('credits a session finished after midnight to the day it started', () => {
    // answer() records completion under session.date, so the start day is the completed one.
    const h: History = { '2026-10-25': done(), '2026-10-26': done() };
    expect(streak(h, '2026-10-27')).toBe(2);
  });

  it('is 0 with no history', () => {
    expect(streak({}, TODAY)).toBe(0);
  });
});

describe('accuracy (FR-015)', () => {
  it('is knew / (new + review), or null when nothing was rated', () => {
    expect(accuracy({ newCount: 15, reviewCount: 5, knewCount: 15 })).toBe(0.75);
    expect(accuracy({ newCount: 0, reviewCount: 0, knewCount: 0 })).toBeNull();
  });
});
