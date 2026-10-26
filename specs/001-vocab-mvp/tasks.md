---

description: "Task list for Amirnet Vocab MVP"
---

# Tasks: Amirnet Vocab MVP

**Input**: Design documents from `/specs/001-vocab-mvp/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: Required for core learning logic (Constitution X, FR-030) and for the word data
contract (FR-006a). No UI tests. Core-logic tests are written first and must fail before
the implementation task that follows them.

**Organization**: Tasks are grouped by user story. Story numbers match spec.md:
US1 daily session (P1), US2 word list content (P1), US3 progress (P2), US4 flags (P3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1–US4)

## Conventions for every task

- Single project at the repo root (plan.md → Project Structure).
- All learning rules live in `src/core/` as pure functions. They take `today: LocalDate`
  (a `YYYY-MM-DD` string) as a parameter and never read the clock, storage or React.
- UI text is Hebrew. Every English word or sentence sits in an element with
  `lang="en" dir="ltr"`.
- No new dependencies beyond plan.md → Technical Context.
- Run `npm test` before each commit. Commit after each task or small group, on branch
  `001-vocab-mvp`. Merge to `main` only at the checkpoints marked **Deploy**.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Empty app scaffold, live on HTTPS through CI (Principle II: live early)

- [ ] T001 Create `package.json` by hand (no interactive generator): name `amirnet-vocab`, `"private": true`, `"type": "module"`, `"license": "MIT"`, engines node `>=22.12`; scripts `dev` (`vite`), `build` (`vite build`), `preview` (`vite preview`), `test` (`vitest run`), `typecheck` (`tsc --noEmit`), `build:ranked` (`node scripts/build-ranked-list.mjs`); dependencies react@^19.3.1, react-dom@^19.3.1; devDependencies vite@^8.3.5, @vitejs/plugin-react@^6.1.2, vite-plugin-pwa@^2.0.0, typescript@^7.0.2, vitest@^5.0.5, @types/react, @types/react-dom, @types/node. Run `npm install` to create `package-lock.json`
- [ ] T002 Create `tsconfig.json` (strict, `jsx: react-jsx`, `moduleResolution: bundler`, `resolveJsonModule: true`, `types: ["vite/client", "vite-plugin-pwa/client"]`, include `src`, `tests`, `vite.config.ts`) and `vite.config.ts`: `base: '/amirnet-vocab/'`; plugins `react()` and `VitePWA({ registerType: 'autoUpdate', manifest: { name: 'אמירנט – אוצר מילים', short_name: 'אמירנט', lang: 'he', dir: 'rtl', display: 'standalone', start_url: '/amirnet-vocab/', scope: '/amirnet-vocab/', theme_color: '#1f6feb', background_color: '#ffffff', icons: 192 and 512 PNG (512 also `purpose: 'any maskable'`) }, workbox: { globPatterns: ['**/*.{js,css,html,png,svg,json}'] } })`; import `defineConfig` from `vitest/config` (not from `vite`) so the `test` key type-checks; `test: { environment: 'node', include: ['tests/**/*.test.ts'], passWithNoTests: true }`. `passWithNoTests` is required: CI runs `npm test` at T008, before any test file exists, and Vitest otherwise exits 1, which fails the deploy
- [ ] T003 Create `index.html` (`<html lang="he" dir="rtl">`, `viewport` with `viewport-fit=cover`, `theme-color`, `apple-touch-icon` link, `apple-mobile-web-app-capable`, root div, module script `/src/main.tsx`), a placeholder `src/main.tsx` rendering `<App />`, a placeholder `src/App.tsx` showing the Hebrew title "אמירנט – אוצר מילים", and `src/styles.css` with system font stack, `body` background, and CSS logical properties only
- [ ] T004 [P] Write `scripts/make-icons.mjs`: a one-off Node script using only built-in `zlib` that writes valid PNGs `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png` (180×180). Design: solid `#1f6feb` background with a simple white open-book shape drawn from rectangles. Run it once and commit both script and PNGs
- [ ] T005 [P] Add a first `README.md` (one-paragraph description; run locally with `npm install`, `npm run dev`, `npm test`; deploy = push to `main`, GitHub Actions publishes to Pages; expanded in T036) so Principle X holds from the first deploy. Add `LICENSE` (MIT, "Copyright (c) 2026 Efrat Cohen") at the repo root and `data/LICENSE` stating that files in `data/` are adapted from NGSL 1.2 and NAWL 1.2 by Browne, Culligan & Phillips, and are licensed under CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/)
- [ ] T006 [P] Create `.github/workflows/deploy.yml`: triggers `push` to `main` and `workflow_dispatch`; permissions `contents: read`, `pages: write`, `id-token: write`; concurrency group `pages`; build job: `actions/checkout`, `actions/setup-node` (node 22, npm cache), `npm ci`, `npm test`, `npm run build`, `actions/configure-pages`, `actions/upload-pages-artifact` (path `dist`); deploy job: `actions/deploy-pages` with environment `github-pages`. Use the current major versions of each action
- [ ] T007 Create the public GitHub repo and enable Pages: `gh repo create amirnet-vocab --public --source . --remote origin` (owner account efratcohen047, already logged in), push `main` and `001-vocab-mvp`, then `gh api -X POST repos/{owner}/amirnet-vocab/pages -f build_type=workflow`
- [ ] T008 **Deploy**: run `npm test` (must exit 0 with zero test files, thanks to `passWithNoTests` from T002; if it exits 1, fix T002 before pushing) and `npm run build`; merge `001-vocab-mvp` into `main`, push, wait for the workflow, and confirm `https://efratcohen047.github.io/amirnet-vocab/` serves the placeholder over HTTPS

**Checkpoint**: Placeholder app live on HTTPS, deployed by CI

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Word data pipeline, first 100 words, shared types, date helpers, storage, app shell

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 [P] Fetch sources into `data/sources/` (see research R2): download `https://www.newgeneralservicelist.com/s/NGSL_12_stats.csv` as `data/sources/NGSL_12_stats.csv`; write `scripts/extract-nawl.mjs`, which reads a saved copy of `https://www.linguaeruditio.com/Glossary/NAWL/NAWL_gloss.html` (pass the path as an argument; keep the HTML out of the repo) and writes `data/sources/nawl_12_ranked.csv` with header `rank,word,pos` (957 rows, ranks 1–957, parsed from `<tr><td>RANK</td> <td><a …>WORD</td> … <td>POS</td>`); create `data/sources/README.md` listing each file, its source URL, the retrieval date, and the CC BY-SA 4.0 license
- [ ] T010 [P] Create `data/sources/nawl_excluded.txt` with a one-line `#` comment header and the exact 81 words from research R2, one per line, alphabetical
- [ ] T011 Write `scripts/build-ranked-list.mjs` (depends on T009, T010): read NGSL (rank = `SFI Rank`, drop ranks 1–500) and NAWL (drop words in `nawl_excluded.txt`, keep rank order); interleave by fractional key `(i + 0.5) / nNgsl` vs `(j + 0.5) / nNawl`, with ties going to NGSL (research R3); write `data/ranked.csv` with header `rank,id,word,source,sourceRank` (`id` = lowercase word); fail with a non-zero exit if the row count is not 3,185 or any `id` repeats. Run it and commit `data/ranked.csv`
- [ ] T012 [P] Create `src/types.ts` with the types from data-model.md: `LocalDate`, `Pos`, `Word`, `WordData` (`version`, `plannedTotal`, `words`), `Box` (1–5), `WordProgress`, `ProgressMap`, `Rating` (`'knew' | 'didnt' | 'known'`), `SessionCard`, `Session`, `StudyDay`, `History`, `Settings`, `TranslationFlag`, `FlagMap`
- [ ] T013 [P] Write `tests/core/dates.test.ts`: `addDays` across month and year ends and DST changes, `diffDays` (positive, negative, zero), `toLocalDate(new Date(...))` uses local (not UTC) parts, comparisons via string order
- [ ] T014 Implement `src/core/dates.ts` (depends on T012, T013): `toLocalDate(d: Date)`, `addDays(day, n)`, `diffDays(a, b)` (computed through `Date.UTC` from parsed parts, so DST cannot shift results), `isOnOrBefore(a, b)`. Add `src/today.ts` exporting `getToday()`: returns `toLocalDate(new Date())`, but when `import.meta.env.DEV` is true and the URL has `?today=YYYY-MM-DD`, returns that value instead (quickstart → Simulating days)
- [ ] T015 Write `tests/data/words.test.ts` implementing every rule in [contracts/word-data.md](contracts/word-data.md) against `data/words.json` and `data/ranked.csv` (read with `node:fs`; parse the CSV with a small inline parser that handles quotes): version, `plannedTotal` = ranked row count, required non-empty fields, `id`/`word`/`source` match ranked row at `rank`, unique sorted contiguous ranks from 1, allowed `pos`, Hebrew letter in `he` and ≤ 3 meanings, `example` contains the word or an inflected form (research R4 rule plus an `IRREGULAR` allowlist map in the test), ends with `.`, `?` or `!`, and is ≤ 160 chars; at least 100 entries
- [ ] T016 Draft `data/words.json` ranks 1–100 (depends on T011, T015): `{ "version": 1, "plannedTotal": 3185, "words": [...] }`, taking `id`, `word`, `rank` and `source` from `data/ranked.csv`. For each word, write `pos` (most exam-relevant), `he` (1–3 short Hebrew meanings, most common academic sense first, separated by `, `), and `example` (one original academic/exam-style English sentence, ≤ 160 chars, using the word in that sense). Run `npm test` until `tests/data/words.test.ts` passes
- [ ] T017 [P] Create `src/words.ts`: import `data/words.json`, cast to `WordData`, export `words` (sorted by rank), `wordById: Map<string, Word>`, `plannedTotal`
- [ ] T018 [P] Create `src/storage.ts` (research R6): generic `load<T>(key, fallback)` / `save<T>(key, value)` that store `{ version: 1, data }` under `amirnet:v1:<key>`. On a missing value, unparsable JSON, a wrong version or a throwing `localStorage`, return `fallback`, so the app never crashes on bad storage. Export typed helpers for `progress`, `session`, `history`, `settings` (default `{ newPerDay: 20 }`), `flags`, plus `requestPersistence()` calling `navigator.storage?.persist?.()` and ignoring errors
- [ ] T019 Build the app shell in `src/App.tsx` and `src/main.tsx` (depends on T017, T018): `main.tsx` imports `styles.css`, calls `registerSW({ immediate: true })` from `virtual:pwa-register` and `requestPersistence()`, then renders `App`. `App` holds `view: 'home' | 'session' | 'progress' | 'settings'`, loads progress/session/history/settings/flags from storage once into state, and exposes setters that save to storage on every change. Add a bottom navigation bar (בית, התקדמות, הגדרות) with placeholder screens `src/screens/Home.tsx`, `src/screens/Progress.tsx`, `src/screens/Settings.tsx`

**Checkpoint**: `npm test` passes (dates + data contract). The app shell runs with 100 words loaded

---

## Phase 3: User Story 1 - Daily flashcard session (Priority: P1) 🎯 MVP

**Goal**: One tap from the home screen to a Leitner session of due reviews + up to N new
words, with reveal, "knew it" / "didn't know" / "I already know this", per-answer saving,
resume, and an end summary. Works offline.

**Independent Test**: Install on a phone, finish a session, go offline, restart the phone,
reopen: state intact. Advance the date (`?today=` in dev) and check the right words come due
(quickstart steps 1–7).

### Tests for User Story 1 ⚠️ write first, must fail

- [ ] T020 [P] [US1] Write `tests/core/leitner.test.ts` covering every row of the transition table in data-model.md (new → box 2/1/5; box b → b+1; box 5 stays at 5; any → 1 on "didn't know"), `due = lastRated + INTERVAL[box]` with INTERVAL 1/2/4/7/30, `introduced` set only on first rating, `knownOnSight` set only by "known", status helper (new/learning/learned)
- [ ] T021 [P] [US1] Write `tests/core/session.test.ts`. `buildSession`: due sorted by box then oldest `due`; >100 due → first 100 and no new; ≤100 → all due then next N unseen words by rank; progress for unknown ids ignored; N from settings. `answer`: first-showing "didn't know" appends one `retry` card; a retry answer changes neither progress nor results; "known" on a new card sets box 5 and appends the next unseen new word; "known" is rejected on review cards. Also: `results` and the StudyDay counters (`newCount`, `knownCount`, `reviewCount`, `knewCount`) update correctly; the session is complete when `position === cards.length`, with `completed` set in the session and `history[session.date]`; `shouldResume` is true when started today or last activity < 3 h ago, false otherwise; `isRestDay` is true only when nothing is due and no unseen words remain

### Implementation for User Story 1

- [ ] T022 [US1] Implement `src/core/leitner.ts` (depends on T020): `INTERVAL`, `rate(prev: WordProgress | undefined, rating: Rating, today): WordProgress`, `statusOf(p?: WordProgress): 'new' | 'learning' | 'learned'`. Make T020 pass
- [ ] T023 [US1] Implement `src/core/session.ts` (depends on T021, T022): `buildSession(words, progress, settings, today, now)`, `answer(state: { session, progress, history }, rating, now, today)` returning new immutable state, `currentCard(session)`, `isComplete(session)`, `shouldResume(session, today, now)`, `isRestDay(words, progress, today)`. Session completion credits `session.date` (research R9). Make T021 pass
- [ ] T024 [P] [US1] Implement `src/screens/Home.tsx`: one large primary button "התחל" (or "המשך" when `shouldResume`) that builds or resumes today's session and switches to the session view; when today's session is complete, show "סיימת להיום 🎉" and the next due date; when `isRestDay`, record `history[today].rest = true` and show "אין מה ללמוד היום" with the next due date; when all loaded words are introduced, show a note that new words will arrive in the next batch
- [ ] T025 [P] [US1] Implement `src/screens/Session.tsx`: progress line (card i of n); the front shows the English word large (`lang="en" dir="ltr"`) plus, on a new card's first showing, a secondary button "אני כבר יודעת"; tapping the card reveals the Hebrew part-of-speech label (map `pos` to שם עצם / פועל / שם תואר / תואר הפועל / מילת יחס / מילת חיבור / כינוי גוף / מילת יידוע / אחר), `he`, and `example` (LTR), plus two large buttons "ידעתי" / "לא ידעתי". Every answer calls the App setter immediately (FR-014). At the end, show a summary: new words, "already know" count, reviews, accuracy % (or "—"), and a button back to home
- [ ] T026 [P] [US1] Implement `src/screens/Settings.tsx` (new-words section): a numeric stepper for `newPerDay` (5–50, default 20) with the Hebrew label "מילים חדשות ביום", saved immediately; the note "ייכנס לתוקף מהסשן הבא" (FR-009, edge case: changed target)
- [ ] T027 [US1] Style the study flow in `src/styles.css`: mobile-first single column, tap targets ≥ 48px, the card fills the available height, buttons in the thumb zone at the bottom, `env(safe-area-inset-*)` padding, `prefers-color-scheme: dark` colors, logical properties only, no web fonts
- [ ] T028 [US1] Wire everything in `src/App.tsx` (depends on T023–T027): starting a session builds or resumes it via `shouldResume`, otherwise builds a new one; each answer runs `answer()` and saves session, progress and history; after completion, show the summary, then home. Check by hand in `npm run dev` with `?today=` on several dates
- [ ] T029 [US1] **Deploy**: `npm test && npm run build && npm run preview`; check offline in the browser (DevTools → offline → reload works); merge into `main`, push, wait for deploy; run quickstart manual steps 1–7 on the phone

**Checkpoint**: MVP usable on her phone today with 100 words

---

## Phase 4: User Story 2 - Word list content (Priority: P1)

**Goal**: First release of 500 words, README with attribution and licences, content updates
that never touch progress.

**Independent Test**: `npm test` passes with ≥ 500 entries; a test entry added to the file
appears in the app without code changes; a changed translation keeps the word's box
(quickstart step 10).

- [ ] T030 [US2] Draft ranks 101–200 into `data/words.json` (same rules as T016); `npm test` passes
- [ ] T031 [US2] Draft ranks 201–300 into `data/words.json`; `npm test` passes
- [ ] T032 [US2] Draft ranks 301–400 into `data/words.json`; `npm test` passes
- [ ] T033 [US2] Draft ranks 401–500 into `data/words.json`; `npm test` passes
- [ ] T034 [US2] Raise the minimum entry count in `tests/data/words.test.ts` from 100 to 500 (SC-005)
- [ ] T035 [P] [US2] Add FR-007 cases to `tests/core/session.test.ts`: a progress record whose id is missing from `words` is ignored by `buildSession`; words appended at higher ranks are introduced after existing ones; editing a word's `he` does not change its progress
- [ ] T036 [P] [US2] Expand `README.md` (started in T005): what the app is and who it's for; run locally (`npm install`, `npm run dev`, `npm test`); deploy (push to `main` → GitHub Actions → Pages; URL); content workflow (add a batch, fix a translation from a flag export, edit `data/sources/nawl_excluded.txt` and run `npm run build:ranked`, never change an `id`); attribution with both citations from research R1 and a link to CC BY-SA 4.0; licences (code MIT in `LICENSE`, data CC BY-SA 4.0 in `data/LICENSE`)
- [ ] T037 [US2] **Deploy**: merge into `main`, push, then check on the phone that 500 words are loaded and existing progress is intact

**Checkpoint**: Release 1 content complete (500 words)

---

## Phase 5: User Story 3 - Progress, streak, "how much is left" (Priority: P2)

**Goal**: Progress counts against the goal total, a daily streak, and a finish-date estimate.

**Independent Test**: With seeded progress and history, every number on the screen matches a
hand calculation (quickstart step 8, SC-006).

### Tests for User Story 3 ⚠️ write first, must fail

- [ ] T038 [P] [US3] Write `tests/core/stats.test.ts`. `goalTotal = max(3000, plannedTotal)`; `counts()` returns new/learning/learned summing to goalTotal, ignores unknown ids, and reports `loaded`. `streak()`: from today when today is completed or rest, else from yesterday; a gap resets it; recorded rest days count, but a day with no history record breaks the streak even if nothing was due (FR-018); the midnight case credits the start date. `pace()`: < 7 days since the first study day → `newPerDay`; otherwise (newCount + knownCount) over the last ≤ 14 calendar days ÷ days in the window. `finishDate()`: `today + ceil(toIntroduce / pace) + LEARN_DAYS`, where `LEARN_DAYS = INTERVAL[2] + INTERVAL[3] + INTERVAL[4]` (13, derived from leitner.ts, not hard-coded); `null` when pace is 0. `accuracy()`: `null` when the denominator is 0

### Implementation for User Story 3

- [ ] T039 [US3] Implement `src/core/stats.ts` with `goalTotal`, `counts`, `streak`, `pace`, `finishDate`, `accuracy` per data-model.md → Progress counts and StudyDay (depends on T038). Make T038 pass, and use `accuracy` in the Session summary in place of any inline calculation
- [ ] T040 [P] [US3] Implement `src/screens/Progress.tsx`: three count tiles (חדשות / בלמידה / נלמדו) out of the goal total, a progress bar, the note "נטענו X מילים מתוך Y"; a "כמה נשאר" section with words not yet learned and the estimated finish date, labelled "כל המילים יילמדו בערך עד" and formatted with `Intl.DateTimeFormat('he-IL', { dateStyle: 'long' })` (or "—"), plus a note when the target pace is used
- [ ] T041 [US3] Show the streak on `src/screens/Home.tsx` ("🔥 X ימים ברצף") under the start button, computed from history without delaying the button (FR-020)
- [ ] T042 [US3] **Deploy**: merge into `main`, push; check quickstart step 8 on the phone

**Checkpoint**: US1–US3 work together and independently

---

## Phase 6: User Story 4 - Flag a wrong translation (Priority: P3)

**Goal**: Flag or unflag a translation with an optional note; export all flags as CSV.

**Independent Test**: Flag 3 words (one note containing a comma), export, and the CSV has
3 correct rows (quickstart step 9, SC-007).

### Tests for User Story 4 ⚠️ write first, must fail

- [ ] T043 [P] [US4] Write `tests/core/flags.test.ts` per [contracts/flag-export.md](contracts/flag-export.md): header and column order; RFC 4180 quoting of `,`, `"` and newlines; rows ordered oldest first; `addFlag` stores `shownTranslation` at flag time; `removeFlag` deletes it; `pruneResolved(flags, wordById)` drops a flag when its word is no longer in the data file or the word's current `he` differs from `shownTranslation`, and keeps it when `he` is unchanged

### Implementation for User Story 4

- [ ] T044 [US4] Implement `src/core/flags.ts`: `addFlag(flags, word, note, now)`, `removeFlag(flags, id)`, `pruneResolved(flags, wordById)`, `flagsToCsv(flags, wordById)` (depends on T043). Make T043 pass. In `src/App.tsx`, run `pruneResolved` once on load and save the result, so a fixed translation closes its flag automatically (FR-022a)
- [ ] T045 [P] [US4] In `src/screens/Session.tsx`, add a small "תרגום שגוי" button on the revealed card. It opens an inline optional note field with save/cancel; once flagged, it shows "דווח ✓" and tapping removes the flag. Studying is never blocked, and the flag is saved immediately through the App setter
- [ ] T046 [P] [US4] In `src/screens/Settings.tsx`, add a "דיווחי תרגום" section: the count of open flags and an export button that runs `navigator.share({ title: 'Amirnet flags YYYY-MM-DD', text: csv })` when available, otherwise copies to the clipboard and downloads `amirnet-flags-YYYY-MM-DD.csv` via a Blob link. With no flags, the button is disabled and shows "אין דיווחים"
- [ ] T047 [US4] **Deploy**: merge into `main`, push; check quickstart step 9 on the phone

**Checkpoint**: All four user stories complete

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T048 [P] Privacy check (SC-008, FR-028): after `npm run build`, `grep -rnE "sendBeacon|WebSocket|XMLHttpRequest|<script[^>]+src=\"https?://|<link[^>]+href=\"https?://" dist/` finds nothing. Plain URL strings such as React's `react.dev/errors` links are message text, not requests, so they are not a finding. Then in `npm run preview` with DevTools → Network, a full session plus a flag export makes requests only to the app's own origin. No fonts, CDNs or analytics
- [ ] T049 [P] Run `npm run typecheck` and fix every error; remove leftover placeholder code and unused exports
- [ ] T050 Run the full quickstart.md manual validation (steps 1–11) on her phone. Record pass/fail per step in `specs/001-vocab-mvp/checklists/validation.md`, and fix any failure before the final merge
- [ ] T051 Final **Deploy**: merge `001-vocab-mvp` into `main`, push, confirm the workflow is green and the live URL serves the final build

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies. T007 needs T001–T006 committed; T008 needs T007
- **Foundational (Phase 2)**: needs Setup. T011 needs T009 + T010; T016 needs T011 + T015; T019 needs T017 + T018
- **US1 (Phase 3)**: needs Foundational
- **US2 (Phase 4)**: needs Foundational (data pipeline). It can run alongside US1, but deploys after T029
- **US3 (Phase 5)**: needs Foundational and T023 (StudyDay records come from `answer`)
- **US4 (Phase 6)**: needs T025 (Session screen) and T026 (Settings screen)
- **Polish (Phase 7)**: needs all stories

### User Story Dependencies

- **US1 (P1)**: independent once Foundational is done (uses the 100 words from T016)
- **US2 (P1)**: independent (content + README); verified through the US1 UI
- **US3 (P2)**: reads history written by US1; testable alone with seeded data in T038
- **US4 (P3)**: adds controls to US1/US1-settings screens; core logic testable alone

### Within Each User Story

- Tests first (they must fail) → `src/core/` logic → screens → wiring → Deploy checkpoint
- Tasks editing the same file (`data/words.json`, `src/App.tsx`, `Session.tsx`, `Settings.tsx`) run sequentially

### Parallel Opportunities

- Setup: T004, T005, T006 together
- Foundational: T009, T010, T012, T013 together; then T017, T018 together
- US1: T020 + T021 together; then T024, T025, T026 together after T023
- US2: T035, T036 alongside the drafting tasks T030–T033
- US3: T038 alongside US2; T040 after T039
- US4: T043 anytime after Foundational; T045, T046 together after T044
- Polish: T048, T049 together

---

## Parallel Example: User Story 1

```text
# Tests together (both must fail first):
Task: "Write tests/core/leitner.test.ts covering every transition (T020)"
Task: "Write tests/core/session.test.ts for build/answer/resume/rest (T021)"

# After T022 + T023, the three screens together:
Task: "Implement src/screens/Home.tsx (T024)"
Task: "Implement src/screens/Session.tsx (T025)"
Task: "Implement src/screens/Settings.tsx new-words stepper (T026)"
```

## Parallel Example: User Story 2

```text
# While drafting words 101–500 (T030–T033, sequential, same file):
Task: "Add FR-007 cases to tests/core/session.test.ts (T035)"
Task: "Write README.md with run/deploy/content workflow/attribution (T036)"
```

---

## Implementation Strategy

### MVP First (today)

1. Phase 1: placeholder live on HTTPS (T008)
2. Phase 2: data pipeline + 100 words + shell
3. Phase 3 (US1): **stop and validate on the phone** (T029). She can start studying now
4. Phase 4 (US2): grow to 500 words, README, deploy

### Incremental Delivery

- Each **Deploy** task merges to `main`, and CI tests then publishes. `main` is always usable (Principle II)
- US3 (progress/streak) and US4 (flags) follow as separate deploys
- Later batches (ranks 501–3,185) follow the T030 pattern and need no code change

---

## Notes

- [P] = different files, no dependency on an incomplete task
- The draft-content tasks (T016, T030–T033) are AI-drafted with no manual review (spec Clarifications). The data test is the gate, and flags (US4) catch meaning errors
- Never change a word `id` once shipped. Progress is keyed by it
- Commit after each task or logical group. Stop at any checkpoint to validate
