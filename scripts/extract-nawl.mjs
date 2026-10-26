// One-off: extracts NAWL 1.2 ranks from a saved copy of the "NAWL 1.2 list with basic
// statistics" page (linked from the official NAWL page), which is the only NAWL source with ranks.
// Usage: node scripts/extract-nawl.mjs <path-to-NAWL_gloss.html>
import { readFileSync, writeFileSync } from 'node:fs';

const htmlPath = process.argv[2];
if (!htmlPath) {
  console.error('usage: node scripts/extract-nawl.mjs <path-to-NAWL_gloss.html>');
  process.exit(1);
}

const html = readFileSync(htmlPath, 'utf8');
const row = /<tr><td>(\d+)<\/td>\s*<td><a[^>]*>([^<]+)<\/td>\s*<td>.*?<\/td>\s*<td>([a-z.]+)<\/td>/g;
const rows = [...html.matchAll(row)].map(([, rank, word, pos]) => ({
  rank: Number(rank),
  word: word.trim(),
  pos,
}));
rows.sort((a, b) => a.rank - b.rank);

const ranks = rows.map((r) => r.rank);
if (rows.length !== 957 || new Set(ranks).size !== 957 || ranks[0] !== 1 || ranks.at(-1) !== 957) {
  console.error(`expected ranks 1..957, got ${rows.length} rows`);
  process.exit(1);
}

const out = ['rank,word,pos', ...rows.map((r) => `${r.rank},${r.word},${r.pos}`)].join('\n') + '\n';
writeFileSync(new URL('../data/sources/nawl_12_ranked.csv', import.meta.url), out);
console.log(`wrote data/sources/nawl_12_ranked.csv (${rows.length} rows)`);
