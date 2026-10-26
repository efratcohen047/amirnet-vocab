import type { Box, LocalDate, Rating, WordProgress } from '../types';
import { addDays } from './dates';

/** Days until the next review, per Leitner box (FR-012). */
export const INTERVAL: Record<Box, number> = { 1: 1, 2: 2, 3: 4, 4: 7, 5: 30 };

/** Shortest path from a new word to box 5: new → 2 → 3 → 4 → 5. */
export const LEARN_DAYS = INTERVAL[2] + INTERVAL[3] + INTERVAL[4];

/** Applies one scheduling rating (FR-011, FR-011a, FR-013). `prev` is undefined for a new word. */
export function rate(prev: WordProgress | undefined, rating: Rating, today: LocalDate): WordProgress {
  if (rating === 'known' && prev) throw new Error('"I already know this" is only for new words');

  let box: Box;
  if (rating === 'known') box = 5;
  else if (rating === 'didnt') box = 1;
  else box = prev ? (Math.min(prev.box + 1, 5) as Box) : 2;

  return {
    box,
    lastRated: today,
    due: addDays(today, INTERVAL[box]),
    introduced: prev?.introduced ?? today,
    knownOnSight: prev?.knownOnSight ?? rating === 'known',
  };
}

export function statusOf(p: WordProgress | undefined): 'new' | 'learning' | 'learned' {
  if (!p) return 'new';
  return p.box === 5 ? 'learned' : 'learning';
}
