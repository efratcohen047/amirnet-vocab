<!--
Sync Impact Report
- Version change: 1.1.0 → 1.1.1 (PATCH: wording clarification)
- Modified principles:
  V. Learning Effectiveness First — "Frequency-first" now ranks words by general and
  academic English frequency from the source word lists, as a proxy for Amirnet exam
  frequency (no public Amirnet word-frequency data exists)
- Added sections: none
- Removed sections: none
- Templates:
  ✅ .specify/templates/plan-template.md — no change needed
  ✅ .specify/templates/spec-template.md — no change needed
  ✅ .specify/templates/tasks-template.md — no change needed
  ✅ .claude/skills/speckit-* — no references to frequency ordering
  ⚠ README.md — does not exist yet; MUST be created during first feature (Principle X)
- Deferred TODOs: none
-->

# Amirnet Vocab Constitution

A small, compact web app for one learner preparing for the Israeli Amirnet English exam.
Goal: learn ~3000 English words to raise her score from 55 to at least 85 (stretch goal: 140).
Built non-profit by a CS-graduate product manager as a hands-on full-stack learning exercise.

## Core Principles

### I. Fast & Dirty, Ship Today

- Speed beats perfection. Build the smallest thing that works.
- YAGNI: no feature, layer, or abstraction is added before a real need exists.
- Dependencies MUST be minimal; every new dependency needs a one-line justification.
- One simple deployable app — no microservices, no monorepo tooling.
- Polish is added later only when it measurably helps learning.

**Rationale**: The app must be useful today; time spent on perfection is time not studying.

### II. Full Web App, Usable Today

- By end of day one the app MUST be a complete, working web app reachable via a public
  HTTPS URL from the learner's phone browser.
- Every increment MUST leave `main` in a usable, deployed state. Broken deploys are fixed
  or reverted immediately.

**Rationale**: A half-built app teaches nothing; a small working one teaches every day.

### III. Security Is Non-Negotiable

- HTTPS only.
- No secrets in git: credentials live in `.env` files (gitignored) or the host's secret store.
- All user input MUST be validated and output escaped.
- Dependencies kept minimal and up to date.
- If accounts exist: passwords MUST be hashed (bcrypt/argon2 or a managed auth provider),
  sessions/tokens secure (HttpOnly, Secure, SameSite cookies).
- The owner's laptop MUST NOT be exposed directly to the internet (no port-forwarding or
  self-hosting of a home machine). The laptop is for development only.

**Rationale**: Small apps are still real attack surface, and a home machine is the worst
thing to leak.

### IV. Offline-First & Always Available

- The learner MUST be able to study when the network or backend is unavailable.
- The app is a PWA: app shell and word list are cached on the device; study progress is
  stored locally first.
- Any backend sync is optional and MUST tolerate being offline (queue and retry later).
- Hosting uses a free managed platform with high availability, never the owner's laptop.

**Rationale**: Studying happens on buses and in breaks; availability must not depend on
anyone's laptop being on.

### V. Learning Effectiveness First

- Features exist to raise the score. A feature that does not support learning is out of scope.
- Review uses spaced repetition (Leitner boxes or SM-2).
- Progress toward 3000 words MUST be visible: new / learning / learned counts.
- The core loop is a short daily session (5–15 minutes) startable in one tap.
- Frequency-first: new words are introduced in order of general and academic English
  frequency (from the source word lists), as the best available proxy for Amirnet exam
  frequency, so the highest-value words are learned first.
- Exam-style practice: beyond word↔translation flashcards, the app MUST offer exercises in
  Amirnet formats — sentence completion and restatement (rephrasing).

**Rationale**: The success metric is the exam score, not the app. Frequent words give the
most points per word, and practicing the exam's own formats transfers directly to the test.

### VI. Mobile-First, Hebrew-Friendly UX

- Designed for a phone screen first; desktop is a bonus.
- UI text in Hebrew (RTL); English words and sentences rendered LTR.
- Large tap targets, one-hand use, minimal steps from opening the app to studying.

**Rationale**: The learner is a Hebrew speaker who will study mostly on her phone.

### VII. Content as Data

- The vocabulary list lives in a versioned data file (JSON or CSV) in the repo, separate
  from code.
- Each entry: English word, Hebrew translation, example sentence, and a frequency rank
  (required, drives Principle V ordering); optional difficulty field.
- Words can be added or corrected without code changes. Translations MUST be accurate;
  known errors are fixed with priority.

**Rationale**: Content quality drives learning; content changes must be cheap.

### VIII. Privacy & Minimal Data

- Collect only what learning needs (study progress).
- No analytics, tracking, ads, or third-party data sharing.

**Rationale**: The learner is a real person; her data stays hers.

### IX. Zero Cost

- Free tiers only. No paid service may be required to build, host, or run the app.

**Rationale**: Non-profit, personal project.

### X. Readable & Learnable Code

- Code is simple, conventional, and favors clarity over cleverness.
- A `README.md` MUST explain how to run locally and how to deploy.
- Tests are pragmatic: unit tests are REQUIRED for core logic (spaced-repetition scheduling,
  progress calculation). UI tests are not required.

**Rationale**: This is a learning project for the owner; the code is part of the lesson.

### XI. Measurable Outcomes

- Default daily target: 20 new words per day (configurable). At this pace, 3000 words take
  ~150 days.
- A practice test (Amirnet-style mini exam) is taken every two weeks; results are recorded
  and shown as a trend over time.
- Product decisions are evaluated against these numbers: words learned, retention, and
  practice-test score.

**Rationale**: Without a clear daily target and a periodic checkpoint, there is no way to
know whether the app is moving her from 55 toward 85.

### XII. Motivation & Momentum

- A daily streak is shown and kept alive by completing the daily session.
- A "how much is left" view shows remaining words and an estimated finish date at the
  current pace.
- Motivation features MUST stay lightweight and never block or slow down studying.

**Rationale**: Consistency over months is what learns 3000 words; visible progress keeps
her coming back.

## Technical Constraints

- Single web app, hostable on a free static/managed platform with HTTPS (e.g., GitHub Pages,
  Cloudflare Pages, Vercel, Netlify).
- MVP is single-user with no sign-up or login: one learner, progress stored on her device.
  Accounts/authentication are added only when a spec justifies them (e.g., cross-device
  sync), and then follow Principle III.
- Client-side storage (localStorage/IndexedDB) is the primary store for progress; a backend
  is added only if a spec justifies it (e.g., cross-device sync).
- Must work on current mobile Safari and Chrome.

## Development Workflow

- Spec-driven: `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
- Work happens on feature branches; merge to `main` only when the app still works.
- Every merge to `main` is deployed and smoke-checked on a phone.
- Commits are small and descriptive.

## Governance

- This constitution supersedes other practices for this project.
- The owner (product manager) is the final decision maker.
- Amendments are made by editing this file with a version bump:
  MAJOR = removing or redefining a principle; MINOR = adding a principle or section or
  materially expanding guidance; PATCH = wording and clarifications.
- Every spec and plan MUST include a Constitution Check against these principles; any
  violation MUST be justified in the plan's Complexity Tracking table.
- When principles conflict, priority order is:
  III Security > II Usable Today > V Learning Effectiveness > I Fast & Dirty > all others.

**Version**: 1.1.1 | **Ratified**: 2026-10-21 | **Last Amended**: 2026-10-25
