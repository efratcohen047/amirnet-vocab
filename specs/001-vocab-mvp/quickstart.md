# Quickstart & Validation: Amirnet Vocab MVP

How to run the app and prove the feature works end to end. Details of the data live in
[data-model.md](data-model.md) and [contracts/](contracts/).

## Prerequisites

- Node ≥ 22.12 (dev machine has 26), npm
- A phone (iOS Safari or Android Chrome) for the device checks
- For deploy: the GitHub repo is public and Pages is set to "GitHub Actions"

## Run locally

```sh
npm install
npm test              # unit tests + word data checks (FR-006a, FR-030)
npm run dev           # http://localhost:5173/amirnet-vocab/
npm run build && npm run preview   # production build with the service worker
```

Rebuild the ranked skeleton (only when sources or the exclusion rule change):

```sh
node scripts/build-ranked-list.mjs   # writes data/ranked.csv (expect 3,185 rows)
```

## Automated checks (must pass before deploy)

| Check | Covers |
|---|---|
| `tests/data/words.test.ts` | contract rules in [word-data.md](contracts/word-data.md); ≥ 500 entries (SC-005) |
| `tests/core/leitner.test.ts` | every transition in the data-model table (FR-011–FR-013) |
| `tests/core/session.test.ts` | session building: due order, N new, 100-review cap, "already know" refill, retry once |
| `tests/core/stats.test.ts` | progress counts, streak (incl. rest days, midnight), accuracy |
| `tests/core/flags.test.ts` | CSV export quoting and column order; flags auto-close when the translation changes (FR-022a) |

## Manual validation (on a phone, against the deployed URL)

1. **Install** (SC-001): open the URL → Share → "Add to Home Screen". Time from opening the
   URL to the first card is under 2 minutes.
2. **One tap** (SC-003): tap the icon → tap "התחל" → a card appears within 3 seconds.
3. **Card flow** (Story 1): tap the card → Hebrew translation, part of speech and sentence
   appear; English reads left-to-right inside the RTL page. Rate a few cards both ways.
4. **Already know** (FR-011a): on a new card, tap "אני כבר יודעת" → the next new word is
   added; the summary counts it under "already know".
5. **Resume** (FR-014): close the app mid-session, reopen → it continues at the next unrated
   card.
6. **Offline** (SC-002, FR-024): enable airplane mode, restart the phone, open the app →
   finish a full session (20 new + reviews) in under 15 minutes.
7. **Persistence** (SC-004): after the restart, progress, streak and flags are unchanged.
8. **Progress** (Story 3, SC-006): counts add up to 3,185; "loaded" shows 500; "how much is
   left" shows a word count and no date.
9. **Flags** (Story 4, SC-007): flag 3 words (one with a note containing a comma), export →
   the shared text has 3 rows that parse as CSV.
10. **Content update** (FR-007): deploy a change to one translation → open the app online
    twice → the new text shows, and the word keeps its box.
11. **No tracking** (SC-008): with the browser network inspector, studying makes no
    requests other than loading the app's own files.

## Simulating days

Core logic takes `today` as a parameter, so tests cover multi-day behaviour without clocks.
For a manual check, change the phone's date (or the dev-only `?today=YYYY-MM-DD` query
override, which only works in `npm run dev`).
