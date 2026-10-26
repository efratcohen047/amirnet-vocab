import type { History, LocalDate, ProgressMap, StudyDay, Word } from '../types';
import { addDays } from './dates';

const GOAL_MIN = 3000;

/** 3,000 words, or the full planned list if it is larger (FR-017). */
export function goalTotal(plannedTotal: number): number {
  return Math.max(GOAL_MIN, plannedTotal);
}

export interface Counts {
  goal: number;
  loaded: number;
  learning: number;
  learned: number;
  /** Never studied, including words not loaded yet. */
  new: number;
  notLearned: number;
}

export function counts(words: Word[], progress: ProgressMap, plannedTotal: number): Counts {
  const goal = goalTotal(plannedTotal);
  let learning = 0;
  let learned = 0;
  for (const w of words) {
    const p = progress[w.id];
    if (!p) continue;
    if (p.box === 5) learned++;
    else learning++;
  }
  const fresh = goal - learning - learned;
  return { goal, loaded: words.length, learning, learned, new: fresh, notLearned: goal - learned };
}

const counted = (d: StudyDay | undefined) => !!d && (d.completed || d.rest);

/** Consecutive completed or rest days, ending today if today counts, else yesterday (FR-018). */
export function streak(history: History, today: LocalDate): number {
  let day = counted(history[today]) ? today : addDays(today, -1);
  let n = 0;
  while (counted(history[day])) {
    n++;
    day = addDays(day, -1);
  }
  return n;
}

/** Share of first-showing ratings that were "knew it"; null when nothing was rated (FR-015). */
export function accuracy(s: Pick<StudyDay, 'newCount' | 'reviewCount' | 'knewCount'>): number | null {
  const rated = s.newCount + s.reviewCount;
  return rated ? s.knewCount / rated : null;
}
