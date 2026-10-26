# Validation: Amirnet Vocab MVP

**Date**: 2026-10-26
**Against**: [quickstart.md](../quickstart.md) → Manual validation
**Build**: https://efratcohen047.github.io/amirnet-vocab/

## How it was checked

- **Automated**: `npm test`, which covers the core-logic unit tests and the word-data
  contract for all 500 words. CI runs the same tests before every deploy.
- **Browser**: headless Chrome at phone size (390×844, touch). It ran against the local
  production build and the live site, and drove the real UI through the DevTools protocol.
- **Phone**: steps that need a physical iPhone/Android. Only the learner or owner can do
  these. They are marked ☐ until done.

## Results

| # | Step | Result | Evidence |
|---|---|---|---|
| 1 | Install (SC-001): open URL, Add to Home Screen | ☐ phone | Manifest, icons, `apple-touch-icon` and service worker are served on the live site; Chrome reports the SW controlling the page |
| 2 | One tap to first card (SC-003) | ✅ browser | Home shows one "התחל" button; one tap opens card 1. Timing on a phone ☐ |
| 3 | Card flow, RTL with LTR English (Story 1) | ✅ browser | `dir="rtl"` page; word and example `dir="ltr"`; reveal shows POS, Hebrew, example |
| 4 | Already know (FR-011a) | ✅ browser | Tapping it put the word in box 5 and added one more new word (21 words studied); summary counts it |
| 5 | Resume mid-session (FR-014) | ✅ browser | Reload at card 7 of 22 → home offers "המשך" → resumes at 7 of 22 |
| 6 | Offline full session (SC-002, FR-024) | ✅ browser / ☐ phone | Live site reloads offline from the SW cache. Airplane mode + phone restart, timed under 15 min ☐ |
| 7 | Persistence (SC-004) | ✅ browser | Progress identical after a full browser restart (5 → 5 words) |
| 8 | Progress numbers (Story 3, SC-006) | ✅ browser | 3,164 / 20 / 1 sum to 3,185; finish date 16 Apr 2027 matches the hand calculation (⌈3,164/20⌉ + 13 days); target-pace note shown |
| 9 | Flags and export (Story 4, SC-007) | ✅ browser | 4 flags → CSV with 4 rows, comma and quote in the note correctly quoted; unflag works; a changed translation closes its flag on reload (FR-022a). Real share sheet on a phone ☐ |
| 10 | Content update keeps progress (FR-007) | ✅ browser (live) | Live deploy with existing progress: new build took over, progress and boxes unchanged (5 words, boxes 1:2, 2:3) |
| 11 | No tracking (SC-008, FR-028) | ✅ browser + build | Zero requests to other origins in every run; bundle has no beacon/socket/third-party script (T048) |

## Remaining for the owner (on her phone)

1. Open the URL in Safari (iPhone) or Chrome (Android) → Share → "Add to Home Screen".
2. Turn on airplane mode, restart the phone, open the app from the icon, and finish a full
   session. Check that it takes under 15 minutes.
3. Flag one word and use "שליחת הדיווחים": the share sheet should open with the CSV text.
