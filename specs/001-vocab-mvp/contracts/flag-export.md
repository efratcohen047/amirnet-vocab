# Contract: Translation Flag Export

Produced on the phone (FR-023) and read by the owner to fix `data/words.json`.

## Format

UTF-8 CSV with a header row, RFC 4180 quoting (fields containing `,`, `"` or a newline are
wrapped in `"`; inner `"` doubled). One row per open flag, oldest first.

```csv
id,word,shown_translation,note,flagged_at
amount,amount,"כמות, סכום",should also mean total,2026-10-27T08:14:03.000Z
```

| Column | Source |
|---|---|
| id | `TranslationFlag.id` |
| word | current `word` for that id (always present: flags for removed words are closed) |
| shown_translation | `TranslationFlag.shownTranslation` |
| note | `TranslationFlag.note` (may be empty) |
| flagged_at | `TranslationFlag.flaggedAt` (ISO 8601) |

## Delivery

1. If `navigator.share` exists: share the CSV text, with title
   `Amirnet flags YYYY-MM-DD`.
2. Otherwise: copy the CSV to the clipboard and download it as
   `amirnet-flags-YYYY-MM-DD.csv`.
3. If there are no flags, the export button is disabled and shows "אין דיווחים".

## Flag lifecycle (FR-022a)

- **Open**: created by "תרגום שגוי" on a card.
- **Closed by the learner**: she taps the flag again on the card.
- **Closed automatically**: on app load, a flag is deleted when its word is no longer in
  `data/words.json`, or the word's current `he` differs from `shownTranslation`. Fixing the
  translation and deploying is enough; nobody has to clear flags on the phone.

Exporting does not delete flags. A flag that is still open shows up in every export until
the translation is changed. If the owner decides the translation was correct after all,
she removes the flag from the card.
