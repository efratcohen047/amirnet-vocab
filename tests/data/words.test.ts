// Contract test for data/words.json (contracts/word-data.md, FR-006a).
// CI runs it before every deploy, so a malformed word file cannot ship.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Word, WordData } from '../../src/types';

const MIN_ENTRIES = 500; // SC-005: release 1 ships at least 500 words
const MAX_EXAMPLE_LENGTH = 160;
const POS = new Set(['noun', 'verb', 'adj', 'adv', 'prep', 'conj', 'pron', 'det', 'other']);
const HEBREW_LETTER = /[א-ת]/;

/** Inflected forms the stem rule cannot find (word → accepted forms). */
const IRREGULAR: Record<string, string[]> = {
  bear: ['bore', 'borne'],
  bind: ['bound'],
  breed: ['bred'],
  cling: ['clung'],
  dig: ['dug'],
  feed: ['fed'],
  flee: ['fled'],
  forbid: ['forbade'],
  freeze: ['froze', 'frozen'],
  hang: ['hung'],
  lay: ['laid'],
  lead: ['led'],
  lie: ['lay', 'lain', 'lying'],
  mislead: ['misled'],
  seek: ['sought'],
  shoot: ['shot'],
  sink: ['sank', 'sunk'],
  slide: ['slid'],
  spin: ['spun'],
  spring: ['sprang', 'sprung'],
  steal: ['stole', 'stolen'],
  stick: ['stuck'],
  strike: ['struck'],
  swear: ['swore', 'sworn'],
  swing: ['swung'],
  tear: ['tore', 'torn'],
  undergo: ['underwent', 'undergone'],
  wake: ['woke', 'woken'],
  weave: ['wove', 'woven'],
  withdraw: ['withdrew', 'withdrawn'],
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.trim().split(/\r?\n/)) {
    const cells: string[] = [];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else if (ch === '"') quoted = false;
        else cell += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') {
        cells.push(cell);
        cell = '';
      } else cell += ch;
    }
    cells.push(cell);
    rows.push(cells);
  }
  return rows;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The sentence contains the word, the word plus an ending, or its stem plus an ending. */
function containsWordForm(sentence: string, word: string): boolean {
  const w = word.toLowerCase();
  const stem = w.replace(/(e|y)$/, '');
  const forms = [`${escapeRe(w)}[a-z]*`];
  if (stem !== w && stem.length >= 2) forms.push(`${escapeRe(stem)}[a-z]+`);
  for (const f of IRREGULAR[w] ?? []) forms.push(escapeRe(f));
  return new RegExp(`\\b(${forms.join('|')})\\b`, 'i').test(sentence);
}

const data = JSON.parse(readFileSync(new URL('../../data/words.json', import.meta.url), 'utf8')) as WordData;
const ranked = parseCsv(readFileSync(new URL('../../data/ranked.csv', import.meta.url), 'utf8'))
  .slice(1)
  .map(([rank, id, word, source]) => ({ rank: Number(rank), id, word, source }));
const rankedByRank = new Map(ranked.map((r) => [r.rank, r]));

describe('data/words.json contract', () => {
  it('has version 1 and plannedTotal equal to the ranked list size', () => {
    expect(data.version).toBe(1);
    expect(data.plannedTotal).toBe(ranked.length);
  });

  it(`has at least ${MIN_ENTRIES} entries`, () => {
    expect(data.words.length).toBeGreaterThanOrEqual(MIN_ENTRIES);
  });

  it('has contiguous ranks from 1, sorted ascending', () => {
    data.words.forEach((w, i) => expect(w.rank, `entry ${i}`).toBe(i + 1));
  });

  it('has unique ids', () => {
    expect(new Set(data.words.map((w) => w.id)).size).toBe(data.words.length);
  });

  describe.each(data.words.map((w) => [`${w.rank} ${w.word}`, w] as [string, Word]))('%s', (_, w) => {
    it('has every field present and non-empty', () => {
      for (const key of ['id', 'word', 'pos', 'he', 'example', 'rank', 'source'] as const) {
        expect(String(w[key] ?? '').trim(), key).not.toBe('');
      }
    });

    it('matches data/ranked.csv at its rank', () => {
      const row = rankedByRank.get(w.rank);
      expect(row).toBeDefined();
      expect(w.id).toBe(row!.id);
      expect(w.word).toBe(row!.word);
      expect(w.source).toBe(row!.source);
    });

    it('has an allowed part of speech', () => {
      expect(POS.has(w.pos), w.pos).toBe(true);
    });

    it('has a Hebrew translation with at most three meanings', () => {
      expect(HEBREW_LETTER.test(w.he)).toBe(true);
      expect(w.he.split(', ').length).toBeLessThanOrEqual(3);
    });

    it('has a short example sentence that uses the word', () => {
      expect(containsWordForm(w.example, w.word), w.example).toBe(true);
      expect(w.example).toMatch(/[.?!]$/);
      expect(w.example.length).toBeLessThanOrEqual(MAX_EXAMPLE_LENGTH);
    });
  });
});
