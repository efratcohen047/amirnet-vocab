// Builds data/ranked.csv: the full ranked study list (research R3).
// - NGSL: drop SFI ranks 1..500 (words she already knows).
// - NAWL: drop words listed in data/sources/nawl_excluded.txt (technical jargon).
// - Interleave both lists by fractional position so every stretch has ~2.6 NGSL : 1 NAWL.
// Run: npm run build:ranked
import { readFileSync, writeFileSync } from 'node:fs';

const NGSL_KNOWN = 500;
const EXPECTED_ROWS = 3185;

const read = (path) => readFileSync(new URL(`../data/${path}`, import.meta.url), 'utf8');
const csvRows = (text) =>
  text
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(','));

const ngsl = csvRows(read('sources/NGSL_12_stats.csv'))
  .map(([lemma, rank]) => ({ word: lemma.trim(), sourceRank: Number(rank) }))
  .filter((w) => w.sourceRank > NGSL_KNOWN)
  .sort((a, b) => a.sourceRank - b.sourceRank)
  .map((w) => ({ ...w, source: 'ngsl' }));

const excluded = new Set(
  read('sources/nawl_excluded.txt')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#')),
);

const nawl = csvRows(read('sources/nawl_12_ranked.csv'))
  .map(([rank, word]) => ({ word: word.trim(), sourceRank: Number(rank) }))
  .filter((w) => !excluded.has(w.word))
  .sort((a, b) => a.sourceRank - b.sourceRank)
  .map((w) => ({ ...w, source: 'nawl' }));

const keyed = [
  ...ngsl.map((w, i) => ({ ...w, key: (i + 0.5) / ngsl.length, tie: 0 })),
  ...nawl.map((w, j) => ({ ...w, key: (j + 0.5) / nawl.length, tie: 1 })),
];
keyed.sort((a, b) => a.key - b.key || a.tie - b.tie);

const rows = keyed.map((w, i) => ({
  rank: i + 1,
  id: w.word.toLowerCase(),
  word: w.word,
  source: w.source,
  sourceRank: w.sourceRank,
}));

const ids = new Set(rows.map((r) => r.id));
if (rows.length !== EXPECTED_ROWS || ids.size !== rows.length) {
  console.error(`expected ${EXPECTED_ROWS} unique rows, got ${rows.length} rows / ${ids.size} ids`);
  process.exit(1);
}

const out =
  ['rank,id,word,source,sourceRank', ...rows.map((r) => `${r.rank},${r.id},${r.word},${r.source},${r.sourceRank}`)].join(
    '\n',
  ) + '\n';
writeFileSync(new URL('../data/ranked.csv', import.meta.url), out);
console.log(`wrote data/ranked.csv (${rows.length} rows: ${ngsl.length} NGSL + ${nawl.length} NAWL)`);
