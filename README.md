# Amirnet Vocab

A small offline-first web app (PWA) for learning the ~3,000 English words that matter most for
the Israeli Amirnet English exam. It was built for one learner who studies mostly on her
phone. Each day's session mixes due reviews with up to 20 new words (spaced repetition with
Leitner boxes). Progress, the daily streak and an estimated finish date are shown along the
way. The UI is in Hebrew.

**Live app:** https://efratcohen047.github.io/amirnet-vocab/ (open it on a phone and use
"Add to Home Screen"; after the first visit it works offline)

Everything stays on the device: no accounts, no server, no analytics.

## Run locally

Requires Node 22.12 or newer.

```sh
npm install
npm run dev       # http://localhost:5173/amirnet-vocab/
npm test          # unit tests and word-data checks
npm run typecheck
npm run build && npm run preview   # production build with the service worker
```

In `npm run dev` only, add `?today=YYYY-MM-DD` to the URL to simulate another day.

## Deploy

Push to `main`. The GitHub Actions workflow in `.github/workflows/deploy.yml` runs the tests,
builds the app and publishes `dist/` to GitHub Pages. A failing test blocks the deploy.

## Project layout

- `src/core/`: learning rules as pure functions (Leitner boxes, session building, stats),
  covered by unit tests in `tests/core/`
- `src/screens/`: the React screens
- `data/words.json`: the word list the app loads
- `data/ranked.csv`: the full ranked list of 3,185 words, generated from `data/sources/`
- `specs/001-vocab-mvp/`: spec, plan and tasks for this feature

## Updating the word list

The word list is data, so changing it never requires a code change.

- **Add a batch:** write a tab-separated file with one line per word, continuing from the
  last rank in `data/words.json`. Each line is `word<TAB>pos<TAB>hebrew<TAB>example`. Then
  run `node scripts/merge-batch.mjs batch.tsv` followed by `npm test`. The script copies `id`,
  `rank` and `source` from `data/ranked.csv`.
- **Fix a translation:** edit `he` (or `pos` / `example`) in `data/words.json` and deploy.
  Open "wrong translation" flags for that word close themselves on the next app start.
- **Never change an `id`.** Learner progress is stored by `id`.
- **Change the list itself:** edit `data/sources/nawl_excluded.txt` (technical terms left out)
  or the NGSL cut-off in `scripts/build-ranked-list.mjs`, then run `npm run build:ranked`.

`tests/data/words.test.ts` checks every entry before each deploy: required fields, Hebrew
script, at most three meanings, the example uses the word, ranks match `data/ranked.csv`.

## Attribution

The word list is based on:

- Browne, C., Culligan, B., & Phillips, J. (2013). *The New General Service List*. Retrieved
  from https://www.newgeneralservicelist.com
- Browne, C., Culligan, B., & Phillips, J. (2013). *The New Academic Word List*. Retrieved
  from https://www.newgeneralservicelist.com

Both lists are licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). This project removed the
500 most frequent NGSL words and 81 technical NAWL terms, merged the two lists into one
ranked list, and added Hebrew translations, parts of speech and example sentences.

## Licenses

- App code: MIT, see [LICENSE](LICENSE).
- Word data in `data/`: CC BY-SA 4.0, see [data/LICENSE](data/LICENSE), as the source lists
  require.
