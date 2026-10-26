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
| word | current `word` for that id (empty if the word was removed) |
| shown_translation | `TranslationFlag.shownTranslation` |
| note | `TranslationFlag.note` (may be empty) |
| flagged_at | `TranslationFlag.flaggedAt` (ISO 8601) |

## Delivery

1. If `navigator.share` exists: share the CSV text, with title
   `Amirnet flags YYYY-MM-DD`.
2. Otherwise: copy the CSV to the clipboard and download it as
   `amirnet-flags-YYYY-MM-DD.csv`.
3. If there are no flags, the export button is disabled and shows "אין דיווחים".

Exporting does not delete flags. She removes a flag from its card once it is fixed.
