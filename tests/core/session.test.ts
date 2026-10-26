import { describe, expect, it } from 'vitest';
import {
  answer,
  buildSession,
  currentCard,
  isComplete,
  isRestDay,
  nextDue,
  shouldResume,
  skip,
  summarize,
  type StudyState,
} from '../../src/core/session';
import type { Box, ProgressMap, Session, Word, WordProgress } from '../../src/types';

const TODAY = '2026-10-26';
const NOW = '2026-10-26T09:00:00.000Z';

const makeWords = (n: number): Word[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `w${i + 1}`,
    word: `w${i + 1}`,
    pos: 'noun',
    he: 'מילה',
    example: `w${i + 1}.`,
    rank: i + 1,
    source: 'ngsl',
  }));

const prog = (box: Box, due: string): WordProgress => ({
  box,
  lastRated: '2026-10-01',
  due,
  introduced: '2026-10-01',
  knownOnSight: false,
});

const settings = { newPerDay: 3 };
const ctx = (words: Word[]) => ({ words, today: TODAY, now: NOW });

const start = (words: Word[], progress: ProgressMap = {}): StudyState => ({
  session: buildSession(words, progress, settings, TODAY, NOW),
  progress,
  history: {},
});

const ids = (s: Session) => s.cards.map((c) => `${c.kind}:${c.id}`);

describe('buildSession (FR-009, FR-016)', () => {
  it('puts due reviews first (lowest box, then most overdue), then N new words by rank', () => {
    const words = makeWords(10);
    const progress: ProgressMap = {
      w1: prog(3, '2026-10-20'),
      w2: prog(1, '2026-10-25'),
      w3: prog(1, '2026-10-22'),
      w4: prog(2, '2026-10-30'), // not due yet
    };
    const s = buildSession(words, progress, settings, TODAY, NOW);
    expect(ids(s)).toEqual(['review:w3', 'review:w2', 'review:w1', 'new:w5', 'new:w6', 'new:w7']);
    expect(s).toMatchObject({ date: TODAY, position: 0, results: {}, lastActivity: NOW, completed: false });
  });

  it('counts a word due today as due', () => {
    const s = buildSession(makeWords(1), { w1: prog(2, TODAY) }, settings, TODAY, NOW);
    expect(ids(s)).toEqual(['review:w1']);
  });

  it('caps reviews at 100 and adds no new words when more than 100 are due', () => {
    const words = makeWords(130);
    const progress: ProgressMap = {};
    for (let i = 1; i <= 120; i++) progress[`w${i}`] = prog(i <= 60 ? 2 : 1, '2026-10-20');
    const s = buildSession(words, progress, settings, TODAY, NOW);
    expect(s.cards).toHaveLength(100);
    expect(s.cards.every((c) => c.kind === 'review')).toBe(true);
    // All 60 box-1 words come before any box-2 word.
    expect(s.cards.slice(0, 60).every((c) => progress[c.id].box === 1)).toBe(true);
  });

  it('adds new words as normal when exactly 100 are due', () => {
    const words = makeWords(110);
    const progress: ProgressMap = {};
    for (let i = 1; i <= 100; i++) progress[`w${i}`] = prog(1, '2026-10-20');
    const s = buildSession(words, progress, settings, TODAY, NOW);
    expect(s.cards).toHaveLength(103);
  });

  it('ignores progress for words that are no longer in the list', () => {
    const s = buildSession(makeWords(2), { gone: prog(1, '2026-10-01') }, settings, TODAY, NOW);
    expect(ids(s)).toEqual(['new:w1', 'new:w2']);
  });

  it('uses the newPerDay setting', () => {
    const s = buildSession(makeWords(30), {}, { newPerDay: 20 }, TODAY, NOW);
    expect(s.cards).toHaveLength(20);
  });
});

describe('answer', () => {
  it('rates a new word, records the result and advances', () => {
    const words = makeWords(5);
    const next = answer(start(words), 'knew', ctx(words));
    expect(next.progress.w1).toMatchObject({ box: 2 });
    expect(next.session.results).toEqual({ w1: 'knew' });
    expect(next.session.position).toBe(1);
    expect(next.history[TODAY]).toMatchObject({ newCount: 1, knewCount: 1, reviewCount: 0, knownCount: 0 });
  });

  it('appends one retry card after a first-showing "didn\'t know"', () => {
    const words = makeWords(5);
    const next = answer(start(words), 'didnt', ctx(words));
    expect(ids(next.session)).toEqual(['new:w1', 'new:w2', 'new:w3', 'retry:w1']);
    expect(next.progress.w1.box).toBe(1);
  });

  it('a retry card changes neither progress, results nor counters', () => {
    const words = makeWords(1);
    let st = answer(start(words), 'didnt', ctx(words));
    const before = st;
    st = answer(st, 'knew', ctx(words));
    expect(st.progress).toEqual(before.progress);
    expect(st.session.results).toEqual({ w1: 'didnt' });
    // Counters unchanged; only completion is recorded because this was the last card.
    expect(st.history[TODAY]).toEqual({ ...before.history[TODAY], completed: true });
    expect(st.session.cards).toHaveLength(2); // no second retry
    expect(isComplete(st.session)).toBe(true);
  });

  it('"I already know this" sets box 5 and adds the next unseen new word', () => {
    const words = makeWords(5);
    const next = answer(start(words), 'known', ctx(words));
    expect(next.progress.w1).toMatchObject({ box: 5, knownOnSight: true });
    expect(ids(next.session)).toEqual(['new:w1', 'new:w2', 'new:w3', 'new:w4']);
    expect(next.history[TODAY]).toMatchObject({ knownCount: 1, newCount: 0, knewCount: 0 });
  });

  it('"I already know this" adds nothing when no unseen words remain', () => {
    const words = makeWords(3);
    const next = answer(start(words), 'known', ctx(words));
    expect(next.session.cards).toHaveLength(3);
  });

  it('rejects "I already know this" on a review card', () => {
    const words = makeWords(2);
    const st = start(words, { w1: prog(2, '2026-10-20') });
    expect(() => answer(st, 'known', ctx(words))).toThrow();
  });

  it('counts reviews and marks the session and day complete at the end', () => {
    const words = makeWords(2);
    let st = start(words, { w1: prog(2, '2026-10-20'), w2: prog(1, '2026-10-25') });
    st = answer(st, 'knew', ctx(words));
    expect(isComplete(st.session)).toBe(false);
    st = answer(st, 'knew', ctx(words));
    expect(isComplete(st.session)).toBe(true);
    expect(st.session.completed).toBe(true);
    expect(st.history[TODAY]).toMatchObject({ reviewCount: 2, knewCount: 2, completed: true });
    expect(currentCard(st.session)).toBeNull();
  });

  it('credits the day the session started, even after midnight', () => {
    const words = makeWords(1);
    const st = answer(start(words), 'knew', { words, today: '2026-10-27', now: '2026-10-26T22:30:00.000Z' });
    expect(st.history[TODAY]).toMatchObject({ completed: true, newCount: 1 });
    expect(st.history['2026-10-27']).toBeUndefined();
    // Scheduling uses the actual rating date.
    expect(st.progress.w1.lastRated).toBe('2026-10-27');
  });

  it('does not mutate its input', () => {
    const words = makeWords(3);
    const st = start(words);
    const copy = structuredClone(st);
    answer(st, 'didnt', ctx(words));
    expect(st).toEqual(copy);
  });
});

describe('skip', () => {
  it('advances without scheduling and completes the day on the last card', () => {
    const words = makeWords(2);
    let st = start(words);
    st = skip(st, NOW);
    expect(st.progress).toEqual({});
    expect(st.session.position).toBe(1);
    expect(st.history[TODAY]).toBeUndefined();
    st = skip(st, NOW);
    expect(st.session.completed).toBe(true);
    expect(st.history[TODAY]?.completed).toBe(true);
  });
});

describe('summarize (FR-015)', () => {
  it('counts first showings by kind and ignores retries', () => {
    const words = makeWords(5);
    let st = start(words, { w5: prog(1, '2026-10-20') });
    st = answer(st, 'knew', ctx(words)); // review w5
    st = answer(st, 'didnt', ctx(words)); // new w1
    st = answer(st, 'known', ctx(words)); // new w2 → refill w4
    st = answer(st, 'knew', ctx(words)); // new w3
    st = answer(st, 'knew', ctx(words)); // retry w1 (ignored)
    st = answer(st, 'knew', ctx(words)); // new w4
    expect(summarize(st.session)).toEqual({ newCount: 3, knownCount: 1, reviewCount: 1, knewCount: 3 });
  });
});

describe('shouldResume', () => {
  const base = buildSession(makeWords(3), {}, settings, TODAY, NOW);
  it('resumes an unfinished session started today', () => {
    expect(shouldResume(base, TODAY, '2026-10-26T20:00:00.000Z')).toBe(true);
  });
  it('resumes yesterday\'s session if the last answer was under 3 hours ago', () => {
    const s = { ...base, lastActivity: '2026-10-26T23:00:00.000Z' };
    expect(shouldResume(s, '2026-10-27', '2026-10-27T01:30:00.000Z')).toBe(true);
    expect(shouldResume(s, '2026-10-27', '2026-10-27T02:30:00.000Z')).toBe(false);
  });
  it('never resumes a completed or missing session', () => {
    expect(shouldResume({ ...base, completed: true }, TODAY, NOW)).toBe(false);
    expect(shouldResume(null, TODAY, NOW)).toBe(false);
  });
});

describe('isRestDay and nextDue', () => {
  it('is a rest day only when nothing is due and no unseen words remain', () => {
    const words = makeWords(2);
    expect(isRestDay(words, { w1: prog(2, '2026-10-30') }, TODAY)).toBe(false); // w2 unseen
    expect(isRestDay(words, { w1: prog(2, '2026-10-30'), w2: prog(1, TODAY) }, TODAY)).toBe(false); // w2 due
    expect(isRestDay(words, { w1: prog(2, '2026-10-30'), w2: prog(1, '2026-10-28') }, TODAY)).toBe(true);
  });
  it('nextDue returns the earliest due date after today among loaded words', () => {
    const words = makeWords(2);
    expect(nextDue(words, { w1: prog(2, '2026-10-30'), w2: prog(1, '2026-10-28'), gone: prog(1, '2026-10-27') }, TODAY)).toBe(
      '2026-10-28',
    );
    expect(nextDue(words, {}, TODAY)).toBeNull();
  });
});
