import type { History, LocalDate, ProgressMap, Settings, StudyDay, Word } from '../types';
import { addDays, diffDays } from './dates';
import { LEARN_DAYS } from './leitner';

const GOAL_MIN = 3000;
const PACE_WINDOW_DAYS = 14;
const MIN_HISTORY_DAYS = 7;

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
  toIntroduce: number;
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
  return { goal, loaded: words.length, learning, learned, new: fresh, notLearned: goal - learned, toIntroduce: fresh };
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

function firstStudyDay(history: History): LocalDate | null {
  const days = Object.keys(history).sort();
  return days[0] ?? null;
}

/** True while there is too little history (< 7 days) to measure her real pace. */
export function usesTargetPace(history: History, today: LocalDate): boolean {
  const first = firstStudyDay(history);
  return first === null || diffDays(first, today) < MIN_HISTORY_DAYS;
}

/** New words (incl. "already know") introduced per calendar day over the last 14 days (FR-019). */
export function pace(history: History, settings: Settings, today: LocalDate): number {
  if (usesTargetPace(history, today)) return settings.newPerDay;
  const first = firstStudyDay(history)!;
  const windowStart = addDays(today, -(PACE_WINDOW_DAYS - 1));
  const start = first > windowStart ? first : windowStart;
  const days = diffDays(start, today) + 1;
  let introduced = 0;
  for (let d = start; d <= today; d = addDays(d, 1)) {
    introduced += (history[d]?.newCount ?? 0) + (history[d]?.knownCount ?? 0);
  }
  return introduced / days;
}

/** Estimated date all words are learned: introduce the rest at `pace`, then 13 days to box 5. */
export function finishDate(toIntroduce: number, wordsPerDay: number, today: LocalDate): LocalDate | null {
  if (wordsPerDay <= 0) return null;
  return addDays(today, Math.ceil(toIntroduce / wordsPerDay) + LEARN_DAYS);
}

/** Share of first-showing ratings that were "knew it"; null when nothing was rated (FR-015). */
export function accuracy(s: Pick<StudyDay, 'newCount' | 'reviewCount' | 'knewCount'>): number | null {
  const rated = s.newCount + s.reviewCount;
  return rated ? s.knewCount / rated : null;
}
