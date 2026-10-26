import raw from '../data/words.json';
import type { Word, WordData } from './types';

const data = raw as WordData;

/** All loaded words, in rank order (most useful first). */
export const words: Word[] = [...data.words].sort((a, b) => a.rank - b.rank);

export const wordById: Map<string, Word> = new Map(words.map((w) => [w.id, w]));

/** Size of the full planned list (all batches), used for the goal total. */
export const plannedTotal: number = data.plannedTotal;
