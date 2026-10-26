# Implementation Plan: Amirnet Vocab MVP

**Branch**: `001-vocab-mvp` | **Date**: 2026-10-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-vocab-mvp/spec.md`

## Summary

A phone-first, offline-capable flashcard PWA for one Hebrew-speaking learner. Words come
from NGSL + NAWL (CC BY-SA 4.0): the top 500 NGSL words are dropped, and the rest are
interleaved ~2.6:1 into a 3,185-word ranked list. Content is AI-drafted in batches of 100,
starting with ranks 1–500. Daily sessions use 5 Leitner boxes (1/2/4/7/30 days) with
"I already know this", a 100-review backlog cap, progress and streak views (no finish date), and
CSV export of wrong-translation flags.

**Technical approach**: a static React + TypeScript app built with Vite, made installable
and offline by `vite-plugin-pwa`. State lives in `localStorage`. All learning rules are pure
TypeScript functions with Vitest tests. The app deploys to GitHub Pages through GitHub
Actions, which runs the tests first.

## Technical Context

**Language/Version**: TypeScript 7 (React 19 JSX), Node ≥ 22.12 for tooling

**Primary Dependencies**: react, react-dom, vite, @vitejs/plugin-react, vite-plugin-pwa
(dev: typescript, vitest). Each one's reason is in research R5.

**Storage**: browser `localStorage` (versioned JSON per store, research R6). Content is in
repo files `data/words.json` and `data/ranked.csv`.

**Testing**: Vitest. Unit tests for `src/core/*` and a data-contract test for
`data/words.json`. No UI tests (Principle X).

**Target Platform**: current iOS Safari and Android Chrome, installed to the home screen as
a PWA. Desktop browsers work as a bonus.

**Project Type**: single static web app (PWA), no backend

**Performance Goals**: first card within 3 s of tapping the icon (SC-003); card reveal and
rating feel instant (< 100 ms)

**Constraints**: fully offline after first load; HTTPS; zero cost; no analytics; RTL Hebrew
UI with LTR English; bundle including the 3,185-word data file under ~1 MB uncompressed

**Scale/Scope**: 1 user, 4 screens (home, session, progress incl. "how much is left",
settings incl. flag export), ≤ 3,185 words

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| I. Fast & Dirty | 5 runtime/build deps, each justified (R5); no router, state library, CSS framework or date library | ✅ |
| II. Usable Today | Static site deployed by CI on every merge to `main`; release 1 ships with 500 words | ✅ |
| III. Security | HTTPS (GitHub Pages); no secrets (no backend, no keys); flag notes and all content rendered as React text (auto-escaped); no accounts; nothing hosted on the laptop | ✅ |
| IV. Offline-First | Precaching service worker; word list bundled; all state local (R6, R10) | ✅ |
| V. Learning Effectiveness | Leitner SRS, rank-ordered new words from general + academic frequency lists, short daily session, visible progress | ✅ (exam-style exercises **deferred**, see below) |
| VI. Mobile-First, Hebrew | `dir="rtl"`, English in `dir="ltr"` elements, large tap targets (R11) | ✅ |
| VII. Content as Data | `data/words.json` with rank (required), editable without code; contract + CI validation | ✅ |
| VIII. Privacy | No network calls besides the app's own files; flags leave the device only when she shares them | ✅ |
| IX. Zero Cost | GitHub Pages + Actions free tier | ✅ |
| X. Readable Code | README (run, deploy, attribution, data license); unit tests for all core logic | ✅ |
| XI. Measurable Outcomes | 20/day default (configurable) | ✅ (biweekly practice test **deferred**, see below) |
| XII. Motivation | Streak + "how much is left" as a word count, with no finish date (constitution v1.2.0); neither blocks starting a session | ✅ |
| Tech constraints | Single user, no login; client-side storage; mobile Safari/Chrome | ✅ |

**Result**: passes for this feature. No violations, so Complexity Tracking stays empty.

**Deferred constitution obligations** (app-level MUSTs that this MVP doesn't deliver; each
needs its own feature through `/speckit-specify`):

| Principle | Obligation | Planned feature |
|---|---|---|
| V | Exercises in Amirnet formats: sentence completion and restatement | `002-exam-exercises`, the next feature after this MVP |
| XI | Practice test every two weeks, results shown as a trend | `003-practice-test`, after 002 |

The constitution isn't fully met until both ship. Until then, every plan's Constitution
Check must list them here as deferred.

**Post-design re-check (after Phase 1)**: passes. The design adds no dependencies, services
or storage beyond the above. One new obligation came out of research: ShareAlike (R1)
requires the derived data to be CC BY-SA 4.0 and publicly shareable. This is satisfied by a
public repo plus `data/LICENSE` and the README attribution.

## Project Structure

### Documentation (this feature)

```text
specs/001-vocab-mvp/
├── plan.md              # This file
├── research.md          # Phase 0: decisions R1–R11
├── data-model.md        # Phase 1: entities, transitions, derived values
├── quickstart.md        # Phase 1: run + validation guide
├── contracts/
│   ├── word-data.md     # data/words.json format and rules
│   └── flag-export.md   # flag CSV export format
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
data/
├── sources/                 # NGSL_12_stats.csv, nawl_12_ranked.csv, nawl_excluded.txt, LICENSE notice
├── ranked.csv               # generated: full ranked skeleton (3,185 rows)
├── words.json               # app word list (release 1: ranks 1–500)
└── LICENSE                  # CC BY-SA 4.0 notice for the derived data

scripts/
└── build-ranked-list.mjs    # exclusion + interleave → data/ranked.csv (R3)

src/
├── core/                    # pure logic, no React, no storage, `today` passed in
│   ├── dates.ts             # LocalDate helpers (addDays, diffDays, today)
│   ├── leitner.ts           # box transitions, intervals (FR-011–013)
│   ├── session.ts           # build session, apply rating, refill, retry (FR-009, 011a, 016)
│   ├── stats.ts             # counts, streak, accuracy (FR-015, FR-017–019)
│   └── flags.ts             # CSV export (FR-023)
├── storage.ts               # versioned localStorage load/save (R6)
├── words.ts                 # imports data/words.json, exposes typed list
├── screens/
│   ├── Home.tsx             # start/resume button, streak, done-for-today
│   ├── Session.tsx          # card, reveal, rate, already-know, flag, summary
│   ├── Progress.tsx         # counts + "how much is left"
│   └── Settings.tsx         # newPerDay, flag export
├── App.tsx                  # view state, loads/saves state
├── main.tsx                 # entry, service worker registration, storage.persist()
└── styles.css               # mobile-first, logical properties

tests/
├── core/                    # leitner, session, stats, flags tests
└── data/words.test.ts       # word-data contract (FR-006a)

public/                      # icons (192, 512, apple-touch-icon)
.github/workflows/deploy.yml # test → build → deploy to Pages
index.html                   # <html lang="he" dir="rtl">
vite.config.ts               # base '/amirnet-vocab/', PWA manifest + precache
README.md                    # run, deploy, attribution, licenses
LICENSE                      # MIT (app code)
```

**Structure Decision**: a single project at the repo root (no frontend/backend split, since
there is no backend). Learning rules live in `src/core/` as pure functions so they can be
fully unit-tested (Principle X). Screens stay thin.

## Delivery order (for /speckit-tasks)

1. Scaffold + deploy pipeline with a placeholder page, live on HTTPS (Principle II: live
   early).
2. Ranked list script + first 100 drafted words + data test.
3. Core logic + tests.
4. Session screen (P1) → release. Then words 101–500.
5. Progress / streak / "how much is left" (P2).
6. Flags + export (P3). README.

## Owner decisions (2026-10-26)

- **Public repo**: yes. The GitHub repo is public (it doubles as a portfolio piece) and is
  served by GitHub Pages (R7).
- **Licenses**: app code under MIT (`LICENSE` at the repo root). Word data under
  CC BY-SA 4.0 (`data/LICENSE`), as the source lists require (R1).
- **Technical NAWL terms**: 81 jargon terms and fragments are excluded through
  `data/sources/nawl_excluded.txt` (R2). The list is now 3,185 words.

## Complexity Tracking

No constitution violations. Nothing to justify.
