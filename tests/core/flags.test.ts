import { describe, expect, it } from 'vitest';
import { addFlag, flagsToCsv, pruneResolved, removeFlag } from '../../src/core/flags';
import type { FlagMap, Word } from '../../src/types';

const word = (id: string, he: string): Word => ({
  id,
  word: id,
  pos: 'noun',
  he,
  example: `${id}.`,
  rank: 1,
  source: 'ngsl',
});

const amount = word('amount', 'כמות, סכום');
const claim = word('claim', 'לטעון');
const byId = new Map([amount, claim].map((w) => [w.id, w]));

describe('addFlag / removeFlag', () => {
  it('stores the translation shown at flag time and a trimmed note', () => {
    const flags = addFlag({}, amount, '  should also mean total  ', '2026-10-27T08:00:00.000Z');
    expect(flags.amount).toEqual({
      id: 'amount',
      shownTranslation: 'כמות, סכום',
      note: 'should also mean total',
      flaggedAt: '2026-10-27T08:00:00.000Z',
    });
  });

  it('removes a flag without touching the others', () => {
    let flags = addFlag({}, amount, '', '2026-10-27T08:00:00.000Z');
    flags = addFlag(flags, claim, '', '2026-10-27T09:00:00.000Z');
    expect(Object.keys(removeFlag(flags, 'amount'))).toEqual(['claim']);
  });
});

describe('pruneResolved (FR-022a)', () => {
  const flags: FlagMap = {
    amount: { id: 'amount', shownTranslation: 'כמות, סכום', note: '', flaggedAt: '2026-10-27T08:00:00.000Z' },
    claim: { id: 'claim', shownTranslation: 'לתבוע', note: '', flaggedAt: '2026-10-27T09:00:00.000Z' },
    gone: { id: 'gone', shownTranslation: 'משהו', note: '', flaggedAt: '2026-10-27T10:00:00.000Z' },
  };

  it('keeps a flag whose translation is unchanged', () => {
    expect(pruneResolved(flags, byId).amount).toBeDefined();
  });
  it('closes a flag once the translation was changed in the data file', () => {
    expect(pruneResolved(flags, byId).claim).toBeUndefined();
  });
  it('closes a flag whose word was removed', () => {
    expect(pruneResolved(flags, byId).gone).toBeUndefined();
  });
});

describe('flagsToCsv (contracts/flag-export.md)', () => {
  it('writes the header and one row per flag, oldest first', () => {
    let flags = addFlag({}, claim, 'wrong sense', '2026-10-27T09:00:00.000Z');
    flags = addFlag(flags, amount, '', '2026-10-27T08:00:00.000Z');
    expect(flagsToCsv(flags, byId)).toBe(
      [
        'id,word,shown_translation,note,flagged_at',
        'amount,amount,"כמות, סכום",,2026-10-27T08:00:00.000Z',
        'claim,claim,לטעון,wrong sense,2026-10-27T09:00:00.000Z',
      ].join('\n') + '\n',
    );
  });

  it('quotes commas, quotes and newlines (RFC 4180)', () => {
    const flags = addFlag({}, claim, 'means "to say", not\nto take', '2026-10-27T09:00:00.000Z');
    expect(flagsToCsv(flags, byId).split('\n').slice(1).join('\n')).toBe(
      'claim,claim,לטעון,"means ""to say"", not\nto take",2026-10-27T09:00:00.000Z\n',
    );
  });

  it('is just the header when there are no flags', () => {
    expect(flagsToCsv({}, byId)).toBe('id,word,shown_translation,note,flagged_at\n');
  });
});
