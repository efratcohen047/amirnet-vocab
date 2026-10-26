import type { FlagMap, Timestamp, Word } from '../types';

const HEADER = ['id', 'word', 'shown_translation', 'note', 'flagged_at'];

export function addFlag(flags: FlagMap, word: Word, note: string, now: Timestamp): FlagMap {
  return { ...flags, [word.id]: { id: word.id, shownTranslation: word.he, note: note.trim(), flaggedAt: now } };
}

export function removeFlag(flags: FlagMap, id: string): FlagMap {
  const { [id]: _removed, ...rest } = flags;
  return rest;
}

/**
 * Closes flags the owner has dealt with (FR-022a): the word's translation in the data file
 * no longer matches the one she flagged, or the word was removed.
 */
export function pruneResolved(flags: FlagMap, wordById: Map<string, Word>): FlagMap {
  return Object.fromEntries(
    Object.entries(flags).filter(([id, f]) => wordById.get(id)?.he === f.shownTranslation),
  );
}

// RFC 4180: quote a field containing a comma, quote or newline; double inner quotes.
const csvField = (s: string) => (/[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

/** All open flags as CSV, oldest first (contracts/flag-export.md). */
export function flagsToCsv(flags: FlagMap, wordById: Map<string, Word>): string {
  const rows = Object.values(flags)
    .sort((a, b) => a.flaggedAt.localeCompare(b.flaggedAt))
    .map((f) => [f.id, wordById.get(f.id)?.word ?? '', f.shownTranslation, f.note, f.flaggedAt]);
  return [HEADER, ...rows].map((r) => r.map(csvField).join(',')).join('\n') + '\n';
}
