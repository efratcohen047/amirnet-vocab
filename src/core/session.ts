import type {
  History,
  LocalDate,
  ProgressMap,
  Rating,
  Session,
  SessionCard,
  Settings,
  StudyDay,
  Timestamp,
  Word,
} from '../types';
import { rate } from './leitner';

/** More due reviews than this means a catch-up day: no new words (FR-016). */
export const REVIEW_CAP = 100;

/** An unfinished session from an earlier date is resumed within this window (research R9). */
const RESUME_WINDOW_MS = 3 * 60 * 60 * 1000;

export interface StudyState {
  session: Session;
  progress: ProgressMap;
  history: History;
}

export interface AnswerContext {
  words: Word[];
  today: LocalDate;
  now: Timestamp;
}

export const emptyDay = (): StudyDay => ({
  completed: false,
  rest: false,
  newCount: 0,
  knownCount: 0,
  reviewCount: 0,
  knewCount: 0,
});

/** Loaded words due on or before `today`, most urgent first (lowest box, then most overdue). */
function dueWords(words: Word[], progress: ProgressMap, today: LocalDate): Word[] {
  return words
    .filter((w) => progress[w.id] && progress[w.id].due <= today)
    .sort((a, b) => {
      const pa = progress[a.id];
      const pb = progress[b.id];
      return pa.box - pb.box || pa.due.localeCompare(pb.due) || a.rank - b.rank;
    });
}

export function buildSession(
  words: Word[],
  progress: ProgressMap,
  settings: Settings,
  today: LocalDate,
  now: Timestamp,
): Session {
  const due = dueWords(words, progress, today);
  const cards: SessionCard[] =
    due.length > REVIEW_CAP
      ? due.slice(0, REVIEW_CAP).map((w) => ({ id: w.id, kind: 'review' }))
      : [
          ...due.map((w): SessionCard => ({ id: w.id, kind: 'review' })),
          ...words
            .filter((w) => !progress[w.id])
            .slice(0, settings.newPerDay)
            .map((w): SessionCard => ({ id: w.id, kind: 'new' })),
        ];
  return { date: today, cards, position: 0, results: {}, lastActivity: now, completed: false };
}

export function currentCard(session: Session): SessionCard | null {
  return session.cards[session.position] ?? null;
}

export function isComplete(session: Session): boolean {
  return session.position >= session.cards.length;
}

/** Applies one answer to the current card and returns the new state; the input is not changed. */
export function answer(state: StudyState, rating: Rating, ctx: AnswerContext): StudyState {
  const { session } = state;
  const card = currentCard(session);
  if (!card) throw new Error('Session is already complete');

  let progress = state.progress;
  let results = session.results;
  const cards = [...session.cards];
  const day: StudyDay = { ...(state.history[session.date] ?? emptyDay()) };

  // A retry is practice only: it changes neither scheduling nor the summary.
  if (card.kind !== 'retry') {
    if (rating === 'known' && card.kind !== 'new') throw new Error('"I already know this" is only for new cards');

    progress = { ...progress, [card.id]: rate(progress[card.id], rating, ctx.today) };
    results = { ...results, [card.id]: rating };

    if (card.kind === 'review') day.reviewCount++;
    else if (rating === 'known') day.knownCount++;
    else day.newCount++;
    if (rating === 'knew') day.knewCount++;

    if (rating === 'didnt') cards.push({ id: card.id, kind: 'retry' });
    if (rating === 'known') {
      // Keep her daily count of words to actually study (FR-011a).
      const inSession = new Set(cards.map((c) => c.id));
      const next = ctx.words.find((w) => !progress[w.id] && !inSession.has(w.id));
      if (next) cards.push({ id: next.id, kind: 'new' });
    }
  }

  const position = session.position + 1;
  const completed = position >= cards.length;
  if (completed) day.completed = true;

  return {
    session: { ...session, cards, position, results, lastActivity: ctx.now, completed },
    progress,
    history: { ...state.history, [session.date]: day },
  };
}

/** Moves past the current card without scheduling it (its word was removed from the data file). */
export function skip(state: StudyState, now: Timestamp): StudyState {
  const { session } = state;
  const position = session.position + 1;
  const completed = position >= session.cards.length;
  const day = state.history[session.date] ?? emptyDay();
  return {
    ...state,
    session: { ...session, position, lastActivity: now, completed },
    history: completed ? { ...state.history, [session.date]: { ...day, completed: true } } : state.history,
  };
}

/** Counts for the end-of-session summary (FR-015), from first showings only. */
export function summarize(session: Session): Omit<StudyDay, 'completed' | 'rest'> {
  const kindOf = new Map(session.cards.filter((c) => c.kind !== 'retry').map((c) => [c.id, c.kind]));
  const sum = { newCount: 0, knownCount: 0, reviewCount: 0, knewCount: 0 };
  for (const [id, rating] of Object.entries(session.results)) {
    if (kindOf.get(id) === 'review') sum.reviewCount++;
    else if (rating === 'known') sum.knownCount++;
    else sum.newCount++;
    if (rating === 'knew') sum.knewCount++;
  }
  return sum;
}

export function shouldResume(session: Session | null, today: LocalDate, now: Timestamp): boolean {
  if (!session || session.completed || isComplete(session)) return false;
  if (session.date === today) return true;
  return Date.parse(now) - Date.parse(session.lastActivity) < RESUME_WINDOW_MS;
}

/** Nothing due and no unseen words left: opening the app records a rest day (FR-018). */
export function isRestDay(words: Word[], progress: ProgressMap, today: LocalDate): boolean {
  return dueWords(words, progress, today).length === 0 && words.every((w) => progress[w.id]);
}

/** Earliest due date after `today` among loaded words, or null if none. */
export function nextDue(words: Word[], progress: ProgressMap, today: LocalDate): LocalDate | null {
  let min: LocalDate | null = null;
  for (const w of words) {
    const due = progress[w.id]?.due;
    if (due && due > today && (min === null || due < min)) min = due;
  }
  return min;
}
