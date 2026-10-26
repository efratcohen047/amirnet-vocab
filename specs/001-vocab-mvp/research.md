# Research: Amirnet Vocab MVP

**Date**: 2026-10-26 | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

Each item: Decision / Rationale / Alternatives considered.

## R1. Source list licensing (FR-001)

- **Decision**: Both lists may be used. NGSL 1.2 and NAWL 1.2 are licensed under
  **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**, licensors
  Browne, C., Culligan, B., and Phillips, J. (verified 2026-10-26 on
  newgeneralservicelist.com, NGSL and NAWL pages).
- **Consequences**:
  - The README MUST credit both lists with the citation the authors request and link the
    license:
    - Browne, C., Culligan, B., & Phillips, J. (2013). *The New General Service List*.
      Retrieved from https://www.newgeneralservicelist.com
    - Browne, C., Culligan, B., & Phillips, J. (2013). *The New Academic Word List*.
      Retrieved from https://www.newgeneralservicelist.com
  - ShareAlike: `data/words.json` and the derived ranked list are adaptations, so they MUST
    be released under CC BY-SA 4.0 as well. The README states this, and `data/LICENSE`
    holds the data license notice. App code is MIT-licensed (owner decision).
  - The data has to be publicly shareable under that license. A public GitHub repository
    fulfils this.
- **Alternatives considered**: Oxford 3000/5000 or COCA lists (not openly licensed);
  AWL/Coxhead (older, superseded by NAWL, unclear license).

## R2. Source files and ranks

- **Decision**:
  - NGSL: `NGSL_12_stats.csv` (2,809 lemmas; columns `Lemma, SFI Rank, SFI, Adjusted
    Frequency per Million (U)`). Rank = `SFI Rank`.
  - NAWL: the official site's "NAWL 1.2 list with basic statistics" link
    (linguaeruditio.com/Glossary/NAWL/NAWL_gloss.html) is the only NAWL source with ranks:
    957 words, ranks 1–957, each with a part of speech. Rank and word are extracted from it
    once into `data/sources/nawl_12_ranked.csv`. The alphabetical official CSVs carry no rank.
  - The supplementary NGSL list (days, months, numbers; no ranks) is not used.
  - Source copies are committed under `data/sources/` with their license notice, so the
    build is reproducible offline.
- **Checked**: no word appears in both lists (0 overlap), so the English word is unique
  across the merged list.
- **Technical-term exclusion (owner decision, 2026-10-26)**: NAWL ranks reflect
  academic-corpus frequency, so narrow field jargon ranks high (e.g. "ion", "par", "matrix" in
  the top 15). These terms are unlikely in Amirnet's general-audience reading passages, so
  81 NAWL items are excluded. The list lives in `data/sources/nawl_excluded.txt` (one word per
  line), and the build script applies it. The owner can edit the list and rebuild.
  - Fragments/abbreviations (17): anti, circa, ex, micro, mid, multi, neo, non, par, pi, pre,
    semi, sin, sub, super, tech, trans
  - Math/statistics (27): algebra, amplitude, axiom, calculus, coefficient, congruent,
    convergence, cyclic, denominator, discrete, factorial, gradient, integral, locus,
    matrix, node, nonlinear, notation, null, oscillation, parenthesis, partition,
    regression, residual, theorem, variance, vector
  - Linguistics (6): descriptor, lexical, morphological, morphology, phonological, syntactic
  - Science/medicine (31): aerosol, amino, antibody, capillary, chemotherapy, chloride,
    conduction, coronary, cortex, deflection, dissection, elasticity, epidemiology, fetal,
    helix, hepatitis, ion, marrow, oxidize, phosphate, primer, proton, receptor, secrete,
    solute, solvent, soluble, splice, sperm, substrate, urine
  - Kept on purpose: words common in popular-science and social-science texts (e.g.
    cognitive, correlation, empirical, molecule, neuron, velocity, exponential, enzyme).

## R3. Exclusion and merge (FR-002, FR-004)

- **Decision**:
  - Drop NGSL ranks 1–500. That leaves 2,309 NGSL words; with 876 NAWL words (957 minus 81 excluded, R2) the merged
    list has **3,185** words, so the goal total is 3,185 (FR-017: max of 3,000 and list size).
  - Interleave by fractional position: NGSL word *i* (0-based) gets key `(i + 0.5) / 2309`,
    NAWL word *j* gets key `(j + 0.5) / 876`. Sort by key (ties → NGSL first). The resulting
    1-based position is the `rank` field. This gives ~2.6 NGSL : 1 NAWL in every stretch of
    the list, and is deterministic.
  - The build script (`scripts/build-ranked-list.mjs`) writes `data/ranked.csv`
    (`rank,id,word,source,sourceRank`) as the skeleton for content drafting.
- **Alternatives considered**: merging by frequency-per-million across both lists (the two
  corpora are not comparable); weighted random shuffle (not reproducible).

## R4. Content drafting (Clarification Q3)

- **Decision**: Entries are drafted in batches of 100 ranks, AI-drafted (Hebrew translation
  of up to three short meanings, part of speech, one original academic-style sentence),
  appended to `data/words.json`. No manual review. Release 1 = ranks 1–500.
- **Safety net (FR-006a)**: a Vitest test `tests/data/words.test.ts` validates every entry
  (fields present and non-empty, Hebrew script in `he`, sentence contains the word or an
  inflected form, unique `id` and `rank`, `rank` matches `data/ranked.csv`). CI runs it
  before every deploy, so a malformed file cannot ship.
- **Inflection check**: the sentence passes if it contains, case-insensitive, the word
  itself or the word stem (word minus a trailing `e`/`y`) followed by letters. Known
  irregulars (e.g. "be"-type forms) can be listed in an allowlist in the test. That is
  enough to catch a sentence written for the wrong word.

## R5. Stack

- **Decision**: TypeScript + React 19 + Vite 8, `vite-plugin-pwa` 2 (Workbox) for the
  service worker and manifest, Vitest 5 for unit tests. No router, no state library, no CSS
  framework, no date library.
- **Rationale**:
  - **Familiar and fast**: React + Vite is the most common setup with the most examples,
    which suits a learning project (Principle X). Vite builds a static site that any free
    host serves (Principle IX).
  - **Offline in little code**: vite-plugin-pwa produces the manifest and a precaching
    service worker with a few lines of config (Principle IV).
  - **Small surface**: four screens (home, session, progress, settings) are handled with a
    single `view` state, so a router isn't needed. Date maths uses local `YYYY-MM-DD` strings
    and a small helper.
- **Versions checked 2026-10-26**: react/react-dom 19.3.1, vite 8.3.5, @vitejs/plugin-react
  6.1.2, vite-plugin-pwa 2.0.0, typescript 7.0.2, vitest 5.0.5. Peer dependencies are
  compatible (all accept vite 8). Node 26 locally; Vite needs ≥ 22.12.
- **Alternatives considered**: vanilla TS + Vite (one fewer dependency, but hand-written UI
  updates cost more time than React saves); Svelte (less familiar); Next.js (server
  features not needed, heavier).

## R6. Storage (FR-014, FR-022, FR-025)

- **Decision**: `localStorage`, one JSON value per store under keys prefixed
  `amirnet:v1:` (progress, session, history, settings, flags), each with a schema
  `version`. Every rating writes immediately. On startup, the app calls
  `navigator.storage.persist()` (best effort).
- **Rationale**: the full dataset is small (≈3,300 progress records × ~80 bytes ≈ 260 KB,
  well under the ~5 MB limit). The synchronous API keeps the code simple and makes "saved on
  every rating" trivial. Home-screen PWAs on iOS are not subject to Safari's 7-day eviction
  of script-writable storage.
- **Alternatives considered**: IndexedDB (async and more code, same eviction rules, not
  needed at this size); a backend (out of scope, violates the MVP constraint).

## R7. Hosting and deploy (FR-029)

- **Decision**: **GitHub Pages**, deployed by a GitHub Actions workflow on push to `main`:
  install → test → build → deploy. Vite `base` = `/amirnet-vocab/`. The `gh` CLI is already
  logged in on the dev machine.
- **Requirement**: free GitHub Pages needs a **public** repository; the owner confirmed it is public. This also fits R1
  (ShareAlike data). The repo contains no personal data about the learner beyond the
  constitution's description of goals.
- **Alternative**: Cloudflare Pages (free, works with a private repo, needs a separate
  account). It's a drop-in switch if the owner wants the repo private: same build output,
  `base` = `/`.

## R8. Flag export (FR-023)

- **Decision**: The export produces a CSV text (header
  `id,word,shown_translation,note,flagged_at`). On phones it uses the Web Share API
  (`navigator.share({ text })`), so she can send it by WhatsApp or email in one tap.
  Fallback: copy to clipboard and also download `amirnet-flags-YYYY-MM-DD.csv`. Contract:
  [contracts/flag-export.md](contracts/flag-export.md).
- **Alternatives considered**: sending flags to a server (no backend; violates
  Principle VIII); share as a file attachment (uneven support on iOS share targets).

## R9. Day boundaries, session resume, streak

- **Decision**:
  - **Today**: the device's local date (`YYYY-MM-DD`).
  - **Resume**: an unfinished session is resumed if it was started today, or if its last
    rating was less than 3 hours ago (this covers studying across midnight). Its
    completion counts for the date it was started. Otherwise it's abandoned and a new
    session is built.
  - **Rest days**: a day counts as a "rest day" when the app is opened, there are no due
    reviews, and no new words are available. Rest days are recorded in history and don't
    break the streak. Days on which the app was never opened are not rest days. This can
    only matter once all loaded words are introduced, so this simplification is accepted.
  - **Streak**: count back from today (if completed or rest) or else from yesterday, over
    consecutive days that are completed or rest days.
- **Rationale**: correct for normal daily use, and simple to unit-test with pure
  functions that take "today" as a parameter.

## R10. Updates and content changes (FR-007, Story 2)

- **Decision**: `data/words.json` is imported at build time, so it ends up in the
  precached bundle. A new deploy produces a new service worker. With `registerType:
  'autoUpdate'`, the next online app start fetches it, and the start after that runs the
  new version. Progress is keyed by word `id`, so content changes never touch progress.
  Progress for an `id` that's no longer in the data file is ignored in every count.
- **Alternatives considered**: fetching `words.json` at runtime from `public/` (an extra
  cache rule, and no type checking for the same result).

## R11. Hebrew RTL / mixed direction (FR-026)

- **Decision**: `<html lang="he" dir="rtl">`. Every English word or sentence is wrapped in
  an element with `lang="en" dir="ltr"`. Layout uses CSS logical properties
  (`margin-inline-start`, etc.). System fonts (no web font; works offline, zero cost).
- **Rationale**: the standard, lowest-effort way to get correct bidi rendering on iOS
  Safari and Android Chrome.
