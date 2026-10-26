/** Local calendar date as `YYYY-MM-DD` (device time zone). */
export type LocalDate = string;

/** ISO 8601 timestamp. */
export type Timestamp = string;

export type Pos = 'noun' | 'verb' | 'adj' | 'adv' | 'prep' | 'conj' | 'pron' | 'det' | 'other';

export interface Word {
  id: string;
  word: string;
  pos: Pos;
  he: string;
  example: string;
  rank: number;
  source: 'ngsl' | 'nawl';
}

export interface WordData {
  version: 1;
  plannedTotal: number;
  words: Word[];
}

export type Box = 1 | 2 | 3 | 4 | 5;

export interface WordProgress {
  box: Box;
  lastRated: LocalDate;
  due: LocalDate;
  introduced: LocalDate;
  knownOnSight: boolean;
}

export type ProgressMap = Record<string, WordProgress>;

/** knew = "ידעתי", didnt = "לא ידעתי", known = "אני כבר יודעת" (new cards only). */
export type Rating = 'knew' | 'didnt' | 'known';

export interface SessionCard {
  id: string;
  kind: 'review' | 'new' | 'retry';
}

export interface Session {
  date: LocalDate;
  cards: SessionCard[];
  position: number;
  /** First-showing result per word id; drives the summary. */
  results: Record<string, Rating>;
  lastActivity: Timestamp;
  completed: boolean;
}

export interface StudyDay {
  completed: boolean;
  rest: boolean;
  newCount: number;
  knownCount: number;
  reviewCount: number;
  knewCount: number;
}

export type History = Record<LocalDate, StudyDay>;

export interface Settings {
  newPerDay: number;
}

export interface TranslationFlag {
  id: string;
  shownTranslation: string;
  note: string;
  flaggedAt: Timestamp;
}

export type FlagMap = Record<string, TranslationFlag>;
