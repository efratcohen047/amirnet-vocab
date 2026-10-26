# Amirnet Vocab

A small offline-first web app (PWA) for learning the ~3,000 English words that matter most for
the Israeli Amirnet English exam, with daily spaced-repetition flashcards. Hebrew UI, built
for a phone.

## Run locally

```sh
npm install
npm run dev     # http://localhost:5173/amirnet-vocab/
npm test        # unit tests and word-data checks
```

## Deploy

Push to `main`. GitHub Actions runs the tests, builds the app and publishes it to GitHub
Pages.
