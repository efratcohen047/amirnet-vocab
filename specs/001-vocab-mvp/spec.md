# Feature Specification: Amirnet Vocab MVP

**Feature Branch**: `001-vocab-mvp`

**Created**: 2026-10-25

**Status**: Draft

**Input**: User description: "Amirnet Vocab MVP: word list, daily flashcard study with spaced
repetition, and a progress screen." (Full brief: word list built from NGSL + NAWL, daily
Leitner flashcard session, progress/streak/"how much is left" views, wrong-translation
flags; offline PWA, single user, Hebrew RTL. Every point of the brief is captured below.)

## Clarifications

### Session 2026-10-26

- Q: In what order are NGSL and NAWL merged into one study order? → A: Interleaved in
  proportion to list size (~2.6 NGSL words per NAWL word), each list in its own rank order.
- Q: Should new cards offer "I already know this"? → A: Yes. On a new word's first showing
  it moves the word straight to box 5 (learned), does not count toward the daily new-word
  limit, and the word is checked again at the box 5 interval (30 days).
- Q (owner, after planning): Should NAWL's narrow technical terms stay? → A: No. Field jargon
  and fragments (e.g. "ion", "par", "matrix") are excluded via an editable list.
- Q: How is content for the first 500 words produced and checked? → A: AI-drafted
  translations, parts of speech, and example sentences are released without a manual review;
  errors are caught only through the "wrong translation" flag (Story 4).
- Q: What total do progress and "how much is left" count against? → A: A fixed goal of 3,000
  words (or the number of words in the list, if that is larger). Words not loaded yet count
  as remaining; a small note shows how many words are currently loaded.
- Q: What happens when reviews pile up after missed days? → A: Cap the session at 100
  reviews, most urgent first (lowest box, then most overdue), and add no new words that day;
  the rest carry over.

## User Scenarios & Testing *(mandatory)*

The learner is one Hebrew-speaking adult preparing for the Amirnet English exam (current
score 55, target 85, stretch 140). She studies mostly on her phone, often without a reliable
connection. The owner is the person who builds the app and maintains the word list.

### User Story 1 - Daily flashcard session (Priority: P1)

She opens the app from her phone's home screen and, with one tap, starts today's session.
The session contains all words due for review today plus up to 20 new words. For each card
she sees the English word, taps to reveal the Hebrew translation and an example sentence,
and rates herself "knew it" or "didn't know". The app schedules each word's next review
using Leitner boxes. At the end she sees a short summary.

**Why this priority**: This is the core learning loop. Without it the app has no value;
with only this story and the first word batch, she can already start learning today.

**Independent Test**: Install the app on a phone, complete one session, put the phone in
airplane mode, reopen the app, and confirm the session state and box positions are intact.
Advance the device date and confirm the right words come due.

**Acceptance Scenarios**:

1. **Given** the app is open on the home screen, **When** she taps the start button,
   **Then** the first card of today's session appears with no further steps.
2. **Given** a card showing only the English word, **When** she taps the card, **Then** the
   Hebrew translation, part of speech, and example sentence are revealed along with the two
   rating buttons.
3. **Given** a word in box 2, **When** she rates it "knew it", **Then** it moves to box 3
   and is scheduled for the box 3 interval from today.
4. **Given** a word in box 4, **When** she rates it "didn't know", **Then** it returns to
   box 1 and is due again tomorrow.
5. **Given** she has rated every card in today's session, **When** the last card is rated,
   **Then** a summary shows the number of new words, number of reviews, and the percentage
   rated "knew it".
6. **Given** a new word she has never seen, **When** she taps "I already know this" on the
   front of the card, **Then** the word goes straight to box 5 (learned), is due again in
   30 days, and the next new word takes its place so she still gets her full daily count.
7. **Given** she has completed today's session, **When** she opens the app again the same
   day, **Then** the home screen shows that today is done and when the next session is due.
8. **Given** she closes the app mid-session, **When** she reopens it the same day, **Then**
   the session resumes with the cards she has not yet rated; ratings already given are kept.
9. **Given** the phone has no network connection, **When** she opens the installed app,
   **Then** she can complete a full session exactly as when online.

---

### User Story 2 - Word list content (Priority: P1)

The app ships with a word list built from two openly licensed frequency lists: the New
General Service List (general English) and the New Academic Word List (academic English).
The most basic words she already knows are excluded. New words are introduced in frequency
order, so the most useful words come first. Each word has a part of speech, a Hebrew
translation, and an academic-style example sentence. Today's release includes the first
~500 words; later batches extend the list to ~3000 without changing the app.

**Why this priority**: The session in Story 1 needs content. The first batch is the minimum
needed to ship today; the format must already support the full list.

**Independent Test**: Inspect the data file: it contains at least 500 entries, each with
all required fields filled, ordered by rank, with no word from the excluded basic set.
Add a test entry to the file and confirm it appears in the app with no code change.

**Acceptance Scenarios**:

1. **Given** the first release, **When** the word list is loaded, **Then** at least 500
   words are available, each with English word, part of speech, Hebrew translation, example
   sentence, and frequency rank.
2. **Given** a learner with no progress, **When** new words are introduced, **Then** they
   appear in ascending rank order (most frequent first).
3. **Given** the owner adds a new batch of words to the data file and redeploys, **When**
   she next opens the app (online once), **Then** the new words become available after the
   existing ones and none of her existing progress is lost or reset.
4. **Given** the owner corrects a translation in the data file and redeploys, **When** she
   next sees that word, **Then** the corrected translation is shown and the word keeps its
   box and schedule.
5. **Given** the project README, **When** anyone reads it, **Then** it states the license
   of each source list and includes the attribution those licenses require.

---

### User Story 3 - Progress, streak, and "how much is left" (Priority: P2)

From the home screen she can see how far she has come: how many words are new, learning,
and learned out of the whole list, her current daily streak, and how many words are left
with an estimated finish date at her current pace.

**Why this priority**: Keeping up a daily habit for months is what learns 3000 words
(Principle XII). Valuable, but the app is still useful without it on day one.

**Independent Test**: With a known set of progress data (some words in each box, a history
of completed days), open the progress screen and verify each number by hand.

**Acceptance Scenarios**:

1. **Given** some studied words, **When** she opens the progress screen, **Then** she sees
   counts of new (never studied, including words not loaded yet), learning (boxes 1–4), and
   learned (box 5) words; the three counts add up to the goal total (3,000, or the full list size if larger), and a note shows
   how many words are currently loaded.
2. **Given** she completed the daily session on each of the last 4 days including today,
   **When** she views her streak, **Then** it shows 4.
3. **Given** a streak of 4 and she did not complete a session yesterday, **When** she opens
   the app today, **Then** the streak shows 0 until she completes today's session, after
   which it shows 1.
4. **Given** she has studied for at least 7 days, **When** she views "how much is left",
   **Then** she sees the number of words not yet learned out of the goal total (3,000, or the full list size if larger) and an
   estimated finish date based on her actual recent pace, even if only 500 words are loaded.
5. **Given** she has fewer than 7 days of history, **When** she views "how much is left",
   **Then** the estimate uses the daily new-word target as the pace.

---

### User Story 4 - Flag a wrong translation (Priority: P3)

While studying, she notices a translation that looks wrong. She taps "wrong translation" on
the card and can optionally write what she thinks is correct. Later, the owner exports all
flags from the app and uses them to fix the data file.

**Why this priority**: Translation accuracy matters (Principle VII), but the flag flow is a
maintenance aid, not part of the daily loop.

**Independent Test**: Flag three words, export flags, and confirm the export lists all
three with the word, the shown translation, her note, and the date.

**Acceptance Scenarios**:

1. **Given** a card with the translation revealed, **When** she taps "wrong translation",
   **Then** the flag is saved on the device and the card shows it is flagged; studying
   continues without interruption.
2. **Given** a flagged word, **When** she taps the flag again, **Then** she can remove it.
3. **Given** several flags, **When** the export action is used, **Then** the result is a
   readable list of every open flag (English word, word identifier, translation shown,
   optional note, date flagged) that can be saved or shared off the phone.
4. **Given** the app is offline, **When** she flags a word, **Then** the flag is saved and
   is included in the next export.
5. **Given** a flagged word whose translation the owner has since corrected and deployed,
   **When** she next opens the app online, **Then** the flag is closed automatically and no
   longer appears in exports.

---

### Edge Cases

- **Missed days / review backlog**: If she skips several days, all overdue reviews become
  due, and the cap in FR-016 keeps a session within ~15 minutes.
- **Failed cards within a session**: A card rated "didn't know" is shown once more at the end
  of the same session. The second showing does not change its box or the accuracy summary.
- **All loaded words introduced**: When every word currently in the list has been introduced,
  sessions contain only due reviews, and the home screen says no new words remain until the
  next batch. Progress and the finish date still count against the goal total (3,000, or the full list size if larger).
- **Nothing due**: If no reviews are due and no new words remain, the home screen says so and
  shows the next due date; opening the app on such a day records a rest day, which does not
  break the streak (FR-018).
- **Day boundary**: "Today" follows the phone's local date. A session started before midnight
  and finished after midnight counts for the day it was started.
- **Changed daily target**: Changing the new-words-per-day setting takes effect from the next
  session; a session already in progress is not changed.
- **Word removed from the data file**: Progress for a word that no longer exists is ignored
  and does not count in any total.
- **Device storage cleared**: If the phone's browser data is cleared, progress is lost. The
  app cannot prevent this; installing to the home screen reduces the risk of automatic
  eviction (see Assumptions).
- **First launch with no network**: The app must have been opened online once to install;
  after that it works fully offline.

## Requirements *(mandatory)*

### Functional Requirements

**Word list**

- **FR-001**: The word list MUST be built only from the New General Service List (NGSL) and
  the New Academic Word List (NAWL). The license of each MUST be checked before use, and the
  README MUST contain the attribution each license requires.
- **FR-002**: The ~500 highest-frequency NGSL words MUST be excluded as already known.
  Narrow technical NAWL terms (field jargon and word fragments such as "ion", "par",
  "matrix") MUST also be excluded, using an owner-editable exclusion list.
- **FR-003**: Every entry MUST have: a stable identifier, English word, part of speech, Hebrew
  translation, one example sentence in an academic/exam style, and a frequency rank.
- **FR-004**: The two source lists MUST be merged into a single rank order by interleaving
  them in proportion to their sizes (~2.6 NGSL words per NAWL word), each list kept in its
  own rank order, so every batch of 100 contains both general and academic words in roughly
  that ratio.
- **FR-005**: The word list MUST be a data file in the repository, separate from app code.
  Adding, correcting, or removing words MUST require no code change.
- **FR-006**: The first release MUST contain at least the 500 top-ranked entries (after
  exclusion), all fields filled. The format MUST hold the full ~3000-word list.
- **FR-006a**: Every entry MUST be complete and well-formed before release: no empty field, a
  Hebrew translation in Hebrew script, an English example sentence that contains the word (or
  an inflected form of it), and a unique identifier and rank. These checks are automated.
- **FR-007**: Updating the data file (new batch, corrections) MUST NOT reset or lose any
  existing progress. Progress is linked to each word's stable identifier.

**Daily session**

- **FR-008**: The home screen MUST allow starting (or resuming) today's session in one tap.
- **FR-009**: A daily session MUST contain all reviews due today plus up to N new words,
  where N defaults to 20 and can be changed in settings (range 5–50). Due reviews come first,
  then new words in rank order.
- **FR-010**: Each card MUST first show only the English word. A tap reveals the Hebrew
  translation, part of speech, and example sentence, plus "knew it" and "didn't know".
- **FR-011**: Scheduling MUST use five Leitner boxes. A new word rated "knew it" enters
  box 2; rated "didn't know" it enters box 1. "Knew it" moves a word up one box (box 5 stays
  in box 5); "didn't know" moves it to box 1 from any box.
- **FR-012**: Review intervals per box MUST be: box 1 = 1 day, box 2 = 2 days, box 3 = 4
  days, box 4 = 7 days, box 5 = 30 days. Intervals are counted from the day of the rating.
- **FR-013**: A word in box 5 MUST count as learned. Learned words still come up for review
  at the box 5 interval, and a "didn't know" returns them to box 1 (and to "learning").
- **FR-014**: Every rating MUST be saved on the device immediately, so closing the app at any
  point loses nothing.
- **FR-011a**: The front of a new word's card (first showing only) MUST also offer "I already
  know this". It moves the word straight to box 5 with a 30-day due date and does not count
  toward the daily new-word limit N; the next new word in rank order is added instead. Review
  cards do not show this option.
- **FR-015**: When the last card is rated, the app MUST show a summary: new words studied,
  words marked "already know", reviews done, and the percentage rated "knew it" (first
  showing of each card only; "already know" words are not included in the percentage).
- **FR-016**: If more than 100 reviews are due, the session MUST contain only the 100 most
  urgent (lowest box first, then most days overdue) and no new words; the remaining reviews
  stay due for the next day. When 100 or fewer are due, FR-009 applies as normal.

**Progress and motivation**

- **FR-017**: A progress screen MUST show new / learning / learned counts out of the goal
  total, plus the number of words currently loaded. The goal total is 3,000 or the number of
  words in the list, whichever is larger. "New" includes words not loaded yet.
- **FR-018**: The app MUST show a daily streak: consecutive calendar days, ending today or
  yesterday, on which the daily session was completed. A "rest day" also does not break the
  streak: a day on which she opened the app and there was nothing to study (no reviews due,
  no new words left). A day on which the app was not opened breaks the streak unless the
  session was completed.
- **FR-019**: A "how much is left" view MUST show words not yet learned (goal total minus
  learned) and an estimated date by which all goal-total words will be learned. The date is
  computed as: today + (words not yet introduced ÷ pace) days + 13 days, where 13 days is the
  shortest path from a new word to box 5 (2 + 4 + 7 days). Pace is the average number of new
  words introduced per calendar day (including words marked "already know") over the last
  14 days, or the daily target if fewer than 7 days of history exist.
- **FR-020**: Streak and progress displays MUST NOT block or slow down starting a session.

**Content quality**

- **FR-021**: On any revealed card, she MUST be able to flag "wrong translation", with an
  optional free-text note, and to remove the flag.
- **FR-022**: Flags MUST be stored on the device and survive app restarts.
- **FR-022a**: A flag MUST close automatically when the word's translation in the data file
  no longer matches the translation she flagged, or the word was removed. Exports therefore
  contain only flags the owner has not dealt with yet.
- **FR-023**: The app MUST offer an export of all open flags in a readable format that can be
  saved or shared off the phone (fields as in Story 4, scenario 3).

**Platform and constraints**

- **FR-024**: The app MUST be installable to the phone's home screen and, once installed,
  MUST work fully offline: word list, sessions, progress, streak, and flagging.
- **FR-025**: All study data (progress, streak, settings, flags) MUST be stored on the device
  only. No account, sign-up, or login.
- **FR-026**: The interface MUST be in Hebrew, right-to-left. English words and example
  sentences MUST be shown left-to-right.
- **FR-027**: The layout MUST be designed for a phone screen and usable with one hand
  (large tap targets for reveal and rating).
- **FR-028**: The app MUST NOT include analytics, tracking, ads, or third-party data sharing.
- **FR-029**: The app MUST be served over HTTPS from a free hosting platform.
- **FR-030**: Core learning logic (box movement, due-date calculation, session building,
  streak, progress counts, finish-date estimate) MUST have unit tests (Principle X).

### Key Entities

- **Word**: One vocabulary item from the data file. Stable identifier, English word, part of
  speech, Hebrew translation, example sentence, frequency rank, source list (NGSL or NAWL).
- **Word progress**: Her state for one word. Word identifier, current box (1–5), date of last
  rating, next due date, date first introduced, and whether it was marked "already know". A
  word without progress is "new".
- **Daily session**: The set of cards for one calendar day: date, the review and new words it
  contains, which cards are already rated, and whether it is completed.
- **Study day record**: One per calendar day studied: date, completed or not, new words
  introduced, words marked "already know", reviews done, number rated "knew it". Drives the
  streak, summary, and pace.
- **Settings**: New words per day (default 20).
- **Translation flag**: Word identifier, translation shown at the time, optional note, date
  flagged.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On her own phone, she can open the app's address, add it to the home screen,
  and start the first card of a session in under 2 minutes total.
- **SC-002**: A full daily session (20 new words plus a typical review load) takes under
  15 minutes, with or without an internet connection.
- **SC-003**: From tapping the home-screen icon to seeing the first card takes one tap and
  under 3 seconds.
- **SC-004**: Progress, box positions, streak, settings, and flags are 100% intact after
  closing the app, after restarting the phone, and after a data file update.
- **SC-005**: The first release contains at least 500 words, 100% of which have a Hebrew
  translation and an example sentence.
- **SC-006**: Every number on the progress and "how much is left" screens matches a manual
  calculation from the same data.
- **SC-007**: An exported flag list contains every flag she created, with no omissions.
- **SC-008**: The app sends no study data or usage data to any server.

## Assumptions

- **Source sizes**: NGSL has 2,809 words and NAWL 957. Excluding the top 500 NGSL words and
  81 technical NAWL terms leaves 3,185 words, which matches the ~3000 target. The exclusion
  cut-off (500) and the technical-term list can be tuned after the first weeks of use.
- **Licensing**: Verified 2026-10-26 (research R1): both lists are CC BY-SA 4.0, so the
  derived word list carries the same license and the README gives the required attribution.
- **Content creation**: The source lists provide words and ranks only. Hebrew translations,
  parts of speech, and example sentences are AI-drafted for this project and released
  without a manual review (owner's decision, 2026-10-26). The "wrong translation" flag
  (Story 4) is the only quality gate; flagged words are fixed with priority (Principle VII).
  Example sentences are original, not copied from copyrighted material.
- **One entry per word**: Each headword has one entry with its most exam-relevant part of
  speech; the Hebrew translation may list up to three short meanings.
- **Rank merge**: Proportional interleaving (FR-004) was confirmed by the owner. The rank is
  stored in the data file, so the owner can reorder words without code changes.
- **Leitner settings**: Five boxes with intervals 1/2/4/7/30 days are a standard default and
  are not user-configurable in this MVP.
- **Storage reliability**: Device-only storage is reliable once the app is installed to the
  home screen. Phone browsers may clear storage for sites that are not installed and not
  used for a while. A manual progress backup is out of scope for this MVP.
- **Content updates**: She gets new batches and corrections the next time she opens the
  app with a connection; no action from her is needed.
- **Owner access**: The owner exports flags using the learner's phone (or she sends the
  export). There is no admin interface.

### Out of Scope (later features)

- Amirnet-style exercises (sentence completion, restatement).
- Practice test every two weeks and score trend.
- Cross-device sync, accounts, and progress backup/restore.
- Audio pronunciation.
- Reverse cards (Hebrew → English).
