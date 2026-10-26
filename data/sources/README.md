# Word list sources

Retrieved 2026-10-26. Licensed under CC BY-SA 4.0 by Browne, C., Culligan, B., & Phillips, J.
(https://creativecommons.org/licenses/by-sa/4.0/).

| File | Source | Notes |
|---|---|---|
| `NGSL_12_stats.csv` | https://www.newgeneralservicelist.com/s/NGSL_12_stats.csv | NGSL 1.2, 2,809 lemmas with `SFI Rank` |
| `nawl_12_ranked.csv` | https://www.linguaeruditio.com/Glossary/NAWL/NAWL_gloss.html (linked from https://www.newgeneralservicelist.com/new-academic-word-list as "NAWL 1.2 list with basic statistics") | NAWL 1.2, 957 words with rank and part of speech, extracted by `scripts/extract-nawl.mjs` |
| `nawl_excluded.txt` | this project | 81 technical NAWL terms left out of the study list |

`scripts/build-ranked-list.mjs` combines these into `data/ranked.csv`.
