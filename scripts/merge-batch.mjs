// Appends a drafted batch to data/words.json.
// Input: a tab-separated file, one line per word, in rank order, continuing from the last rank
// already in words.json:  word<TAB>pos<TAB>he<TAB>example
// id, rank and source are taken from data/ranked.csv, so they can never be mistyped.
// Usage: node scripts/merge-batch.mjs <batch.tsv>
// Then run `npm test` (tests/data/words.test.ts checks every entry).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const batchPath = process.argv[2];
if (!batchPath) {
  console.error('usage: node scripts/merge-batch.mjs <batch.tsv>');
  process.exit(1);
}

const dataUrl = new URL('../data/words.json', import.meta.url);
const ranked = readFileSync(new URL('../data/ranked.csv', import.meta.url), 'utf8')
  .trim()
  .split('\n')
  .slice(1)
  .map((line) => {
    const [rank, id, word, source] = line.split(',');
    return { rank: Number(rank), id, word, source };
  });

const data = existsSync(dataUrl)
  ? JSON.parse(readFileSync(dataUrl, 'utf8'))
  : { version: 1, plannedTotal: ranked.length, words: [] };

const lines = readFileSync(batchPath, 'utf8')
  .split(/\r?\n/)
  .filter((l) => l.trim());

let next = data.words.length + 1;
for (const line of lines) {
  const [word, pos, he, example] = line.split('\t').map((s) => s?.trim());
  const row = ranked[next - 1];
  if (!row || row.word !== word) {
    console.error(`rank ${next}: expected "${row?.word}", got "${word}"`);
    process.exit(1);
  }
  data.words.push({ id: row.id, word: row.word, pos, he, example, rank: row.rank, source: row.source });
  next++;
}

data.plannedTotal = ranked.length;
writeFileSync(dataUrl, JSON.stringify(data, null, 2) + '\n');
console.log(`added ${lines.length} words; words.json now has ${data.words.length} entries`);
