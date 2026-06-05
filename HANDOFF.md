# EZ Thai — Project Handoff Brief

_Paste this into a new chat to continue work. Updated after the single-codebase consolidation._

EZ Thai with Khruu Nui is a friendly Thai-alphabet learning web app for total beginners (44 consonants, quizzes, tones, writing & speaking practice). Brand voice: warm, playful, pastel (sky-blue `#7cc9f5` + orange `#ffbd59`). Fonts: Sarabun (UI) + Mali (Thai handwriting). Content & voice recordings © Khruu Nui.

---

## 1. Current production website
- **Live URL:** `[FILL IN — your Vercel domain]`
- **GitHub repo:** `[FILL IN]`
- **Vercel project:** `[FILL IN]`
- **Deploy config:** zero-config. Flat Vite app at the repo root — Vercel auto-detects framework=Vite, install `npm install`, build `npm run build`, output `dist`. No `vercel.json` and no Root Directory change needed.

## 2. Architecture — ONE codebase (flat)
✅ **The entire app is a flat Vite + React + Tailwind project at the repository root. This is the only codebase.**
- Entry: `index.html` → `src/main.jsx` → `src/App.jsx`.
- Components: `src/components/{Flashcard,Quiz,ToneQuiz,WritingPractice,SpeakingPractice}.jsx`
- Data: `src/data/consonants.js` (44 letters + `CLASS_STYLES`), `src/data/strokes.js`
- Lib: `src/lib/sfx.js` (Web-Audio SFX + mute persistence)
- Styles: `src/styles/index.css` (Tailwind layers + flip-card 3D + full dark-mode pass)
- Asset: `public/khruu-nui.png` (served at `/khruu-nui.png`)
- `@` path alias → `src/` (see `vite.config.js`)

⛔ **Retired (deleted):** the old root static-HTML preview (`EZ Thai.html`, the old root `*.jsx`/`audio.js` files), the `v1`–`v8` archives, `EZ Thai V1–V8.html`, `.vercelignore`, and the earlier nested `ez-thai/` wrapper + its `vercel.json`. Do not bring these back. Everything is a flat Vite build now.

### Consolidation notes (what was migrated from the old preview)
The retired root preview was slightly ahead of `ez-thai/` and its approved changes were merged in:
- Mobile-responsive nav (compact bar), responsive class filter, and the flashcard mobile reorder (search + intro move below the cards so a card is visible immediately).
- Full **dark-mode accessibility pass** in `index.css` (`om-soft`, `om-warm`, `roman-pill`, `trace-surface`/`trace-ghost`/`trace-cross`, `fc-image`, `sentences-hero`, `--trace-guide`) so light pastel surfaces become dark cards.
- Bigger romanization display in the Tone quiz; Practice tab defaults to **Speak** first.
- Cleaned up `sfx.js` (was mangled during the earlier port).

### June 2026 — Mobile UX + audio pass
- **Audio loudness normalization** — new `src/lib/audio.js` (`playClip`) routes every voice clip (flashcards, tones, speaking reference, and the user's own recording) through the Web Audio API, decoding once, measuring RMS, and applying a gain (with a peak limiter) to a single target loudness — tuned to the Practice-Tone level. Falls back to a plain `<audio>` element if decode/CORS fails. One clip plays at a time. All four components now call it instead of bare `new Audio()`.
- **Flashcards** — front Thai letter enlarged (~7.5–10rem) to ~40% of card height; card tightened (h-300/360) so the character dominates and whitespace is reduced.
- **Writing Practice** — controls reorganized for mobile: a **sticky bar** (Prev | letter+roman | Next, then Hear Sound + count) pins below the app header so you never scroll up to change letters; tracing canvas height cut ~30% on phones (`.trace-canvas-box`); **scroll-safe touch** — canvas uses `touch-action: pan-y` and a gesture discriminator so a mostly-vertical swipe scrolls the page while drags/curves draw (mouse still draws immediately).
- **Tone review crash fixed** — results "You picked" now reads `w.picks` (was the undefined `w.picked`).

## 3. Completed features
- **Flashcards** — all 44 consonants, flip animation, class filter, live search, hear-sound. Cloudinary images + audio wired.
- **Quiz** — Consonant, Class, and Tone quizzes; length 5/10/20/44; retry-until-correct; scoring; perfect-score confetti; sound FX.
- **Tones** — 5 tones with visual contours + Khruu Nui audio (all 5 wired), synth fallback, slow playback.
- **Speaking Practice** — mic record (≤4s), playback "yours" vs reference, attempt history, iOS-Safari-safe mime handling.
- **Writing Practice** — free-trace canvas with coverage scoring, celebration tiers, hear-sound; stroke-order demo engine ready (awaiting data).
- **Dark mode** — full theme, pre-paint flash prevention, persisted; comprehensive surface overrides.
- **Sound FX** — synthesized Web Audio, global mute toggle.
- **Responsive** — desktop + mobile tab bars, 44px+ hit targets, mobile-optimized flashcards.
- **About + Social footer** — Instagram (@khruu_nui) + YouTube (@EZThaiWithNui).

## 4. Known bugs / gaps
- **Stroke-order demo never plays** — `src/data/strokes.js` has `strokes: []` for all 44 letters. The demo engine + UI exist; just needs path data per letter.
- **Speaking score is placeholder** — `scorePronunciation()` in `SpeakingPractice.jsx` is a loudness heuristic + random jitter, not real assessment.
- **"Notify me" button** on Simple Sentences does nothing (no email capture).

## 5. Pending improvements
- Add real **stroke-order data** to `strokes.js` (unlocks the guided demo — high value, no new engineering).
- Replace placeholder **pronunciation scoring** with a real API/model (or relabel as practice-only).
- Build out **Simple Sentences** (currently a "coming soon" placeholder).
- Wire the **"Notify me"** email capture.
- Add **progress / mastery tracking** across sessions (only theme + mute persist today).

## 6. Mobile UX — still needed
Have: mobile tab bar, 44px targets, flashcard reorder. Consider: safe-area-aware bottom nav, larger trace canvas on small screens, real-device record testing (iOS/Android), smoother tab overflow.

## 7. Dark mode — still needed
The dark theme works via a large block of `!important` overrides in `index.css` targeting Tailwind utilities + inline-styled pastel surfaces. It's comprehensive but brittle — any new inline-styled surface needs a matching override (use the `om-soft`/`om-warm`/`roman-pill`/`trace-*` hook-class pattern). Longer term, consider migrating to CSS variables / `dark:` utilities.

## 8. Audio system status
✅ Complete. SFX synthesized in `lib/sfx.js` (mute persists). All 44 consonant audio + all 5 tone audio wired to Cloudinary `.m4a`. Playback guards for missing/`PASTE_` URLs.

## 9. Quiz system status
✅ Complete: Consonant, Class, Tone quizzes; length selection; retry-until-correct; scoring; celebration; SFX. No persistence of past scores (possible future add).

## 10. Speaking Practice status
⚠️ Functional but **scoring is placeholder**. Record, playback, reference compare, history, cross-browser mime all work. Needs a real scoring backend to be meaningful.

## 11. Writing Practice status
⚠️ Free-trace + coverage scoring work for all letters. **Stroke-order demo blocked by missing data** in `strokes.js`. Add data to unlock the guided demo.

## 12. Technical debt / cleanup
- Dark-mode `!important` overrides are comprehensive but unmaintainable long-term — consider a refactor to tokens/`dark:` utilities.
- Populate `strokes.js`; replace fake pronunciation scoring; fix the `w.picked` typo in `ToneQuiz` review.
- No tests / linting config yet — consider adding ESLint + a basic CI check.

## 13. Recommended next priorities
1. **Add stroke-order data** to unlock the already-built Writing demo.
2. **Real pronunciation scoring** (or relabel Speaking as practice-only).
3. **Build Simple Sentences** — the next learning module after consonants.
4. **Progress tracking** so learners see mastery over time.
5. **Lint/CI** to keep the now-single codebase healthy.

---
### Quick start for the next session
```bash
npm install && npm run dev    # http://localhost:5173
npm run build                 # → dist/
```
- All work happens at the **repository root** — there is no other codebase and no subfolder.
- Data: `src/data/consonants.js` (letters/audio/images), `src/data/strokes.js` (stroke paths), `src/components/ToneQuiz.jsx` (`TONES`).
- Mic features need `localhost`/`https`.
