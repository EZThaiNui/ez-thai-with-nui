# EZ Thai with Khruu Nui

Friendly Thai-alphabet learning app for total beginners — flashcards for all 44
consonants, quizzes, tone training, plus writing and speaking practice.

Built with **Vite + React + Tailwind**. Single, flat codebase — everything lives at
the repository root (standard Vite layout). The old static-HTML preview has been retired.

## Project layout

```
.
├─ index.html              ← Vite entry; pre-paint dark-mode bootstrap
├─ package.json
├─ vite.config.js          ← React plugin + "@" → ./src alias
├─ tailwind.config.js
├─ postcss.config.js
├─ public/
│  └─ khruu-nui.png         ← brand asset (served at /khruu-nui.png)
└─ src/
   ├─ main.jsx             ← React root
   ├─ App.jsx              ← nav, view routing, dark-mode + mute toggles, footer
   ├─ components/
   │  ├─ Flashcard.jsx          ← flip cards (44 consonants)
   │  ├─ Quiz.jsx               ← consonant + class quiz, results, confetti
   │  ├─ ToneQuiz.jsx           ← 5-tone training + quiz
   │  ├─ WritingPractice.jsx    ← stroke-order demo + free-trace canvas
   │  └─ SpeakingPractice.jsx   ← mic record / playback / score
   ├─ data/
   │  ├─ consonants.js     ← 44-consonant dataset (Cloudinary image + audio)
   │  └─ strokes.js        ← per-letter stroke paths (empty until verified)
   ├─ lib/
   │  └─ sfx.js            ← Web-Audio sound effects + mute persistence
   └─ styles/
      └─ index.css         ← Tailwind layers + flip-card / dark-mode CSS
```

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

Build / preview production:

```bash
npm run build    # → dist/
npm run preview
```

Microphone features (Speaking Practice) require `http://localhost` or `https://`.

## Deploy (Vercel)

Zero-config. Import the GitHub repo in Vercel and deploy — it auto-detects Vite:

| Setting          | Value (auto-detected) |
|------------------|-----------------------|
| Framework        | Vite                  |
| Install command  | `npm install`         |
| Build command    | `npm run build`       |
| Output directory | `dist`                |
| Root directory   | repository root       |

No `vercel.json` is needed.

## Editing content

- **Romanization / image / audio URLs** — `src/data/consonants.js`
  (each row: `{ letter, name, roman, sound, class, meaning, image, audio }`; all
  44 Cloudinary URLs are wired).
- **Stroke order** — add per-letter paths to `src/data/strokes.js`. Empty by default
  so no fake order is ever shown; Writing Practice falls back to a "coming soon"
  note and free-tracing until data exists.
- **Tone recordings** — `src/components/ToneQuiz.jsx` (`TONES` array).

## License & credits

Voice recordings and illustrations © Khruu Nui. Built with React, Vite, Tailwind
CSS, and the Web Audio API.
