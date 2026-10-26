# Contract: Word Data File (`data/words.json`)

The owner edits this file and the app reads it. Changing it MUST never require a code change
(FR-005). License: CC BY-SA 4.0 (derived from NGSL/NAWL, see research R1).

## Shape

```json
{
  "version": 1,
  "plannedTotal": 3185,
  "words": [
    {
      "id": "amount",
      "word": "amount",
      "pos": "noun",
      "he": "כמות, סכום",
      "example": "The study measured the amount of water each plant received.",
      "rank": 3,
      "source": "ngsl"
    }
  ]
}
```

(The entry is illustrative; its rank is not real.)

## Rules (checked by `tests/data/words.test.ts`; CI blocks deploy on failure)

1. `version` is `1`. `plannedTotal` equals the row count of `data/ranked.csv`.
2. Every field in every entry is present and non-empty after trimming.
3. `id` is unique and equals the `ranked.csv` id at that `rank`. `word` and `source` match
   that row too.
4. `rank` is unique. Entries are sorted by `rank` ascending. Batches are contiguous: if rank
   *k* is present, all ranks 1..*k*−1 are present.
5. `pos` is one of `noun, verb, adj, adv, prep, conj, pron, det, other`.
6. `he` contains at least one Hebrew letter (U+05D0–U+05EA) and at most three meanings
   separated by `, `.
7. `example` contains the word or an inflected form (research R4), ends with `.`, `?` or
   `!`, and is at most 160 characters (fits a phone card).

## Change rules

- **Add a batch**: append the next contiguous ranks.
- **Fix content**: edit `word`, `pos`, `he` or `example` in place. Never change `id`.
- **Remove a word**: delete its entry and its row in `ranked.csv`, then rebuild ranks with
  the script. `id`s stay the same, so progress for other words is unaffected.
