# EZ Thai — Project Handoff Brief

_Paste this into a new chat to continue work. Updated June 12, 2026._

EZ Thai with Khruu Nui is a friendly Thai-alphabet learning web app for total beginners (44 consonants, quizzes, tones, writing & speaking practice). Brand voice: warm, playful, pastel (sky-blue `#7cc9f5` + orange `#ffbd59`). Fonts: Sarabun (UI) + Mali (Thai handwriting). Content & voice recordings © Khruu Nui.

---

## 0. Source-state verification (as of June 12, 2026)
All of the following are confirmed present in the current `src/`:
- ✅ **Larger flashcard front letter** — `Flashcard.jsx`: `text-[7.5rem] sm:text-[9rem] lg:text-[10rem]` (~40% of card height).
- ✅ **Larger flashcard back image** — `Flashcard.jsx`: dedicated image area `fc-image … flex-1 min-h-[150px] sm:min-h-[170px]` (≥150px on iPhone, uncropped).
- ✅ **Audio normalization** — `src/lib/audio.js` (`playClip`); imported + used by Flashcard, WritingPractice, SpeakingPractice, ToneQuiz.
- ✅ **3-choice consonant quiz** — `Quiz.jsx`: `shuffle(others).slice(0, 2)` → 1 correct + 2 distractors, randomized.
- ✅ **Neutral class-quiz prompt** — `Quiz.jsx`: `isClass`/`reveal` gate shows a neutral letter (black light / white dark) until a correct answer; class color reveals only after answering.
- ✅ **Writing Practice native non-passive touch fix** — `WritingPractice.jsx`: `addEventListener('touchstart/move/end/cancel', …, { passive: false })` on the canvas + `touch-action: none`, so `preventDefault()` stops iOS Safari scroll mid-stroke.

## 1. Current production website
- **Live URL:** `[FILL IN — your Vercel domain]`
- **GitHub repo:** `[FILL IN]`
- **Vercel project:** `[FILL IN]`
- **Deploy config:** zero-config. Flat Vite app at the repo root — Vercel auto-detects framework=Vite, install `npm install`, build `npm run build`, output `dist`. No `vercel.json` and no Root Directory change needed.
- **Deployment process:** edit `src/` → (optional) inspect via `Desktop Preview.html` → `npm run build` to confirm → commit to GitHub → Vercel auto-builds & deploys on push. A regenerated production ZIP can also be unzipped over the repo and committed.
- **Preview page:** `Desktop Preview.html` is a **dev-only** harness that transpiles the real `src/` in-browser (toolbar: 390 / 768 / full widths + dark toggle). It is **git-ignored** (listed in `.gitignore`) and must **never** ship — it is stripped before any production ZIP.

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

### June 12, 2026 — Mobile fixes round 2
- **Flashcard front letter** finalized at `text-[7.5rem] sm:text-[9rem] lg:text-[10rem]`; card height now `h-[400px] sm:h-[460px]` (raised from the earlier 300/360 to give the back image room — front letter font itself unchanged).
- **Flashcard back image** redesigned: its own square/rounded area with a guaranteed floor (`min-h-[150px] sm:min-h-[170px]`, `object-contain`), so the picture is clearly visible (~300×240px at 390px width) instead of collapsing under `flex-1`. Info rows compacted (label+value one line each); Name/Romanization/Sound/Meaning all still readable.
- **3-choice consonant quiz** — reduced from 4 to 3 (1 correct + 2 distractors), randomized; scoring/progress unchanged.
- **Neutral class-quiz prompt** — the Class quiz no longer colors the prompt letter by class (was leaking the answer). Neutral black/white letter + neutral box until a correct answer; class color reveals only on/after answering. Consonant quiz prompt unchanged.
- **Writing Practice touch — definitive fix.** Replaced the earlier `touch-action: pan-y` + gesture-discriminator approach (which still scrolled on iOS because React's synthetic touch listeners are passive) with **native non-passive listeners** (`{ passive: false }`) attached directly to the canvas, plus `touch-action: none`. Drawing always wins inside the canvas (vertical/horizontal/diagonal), `preventDefault()` suppresses page scroll mid-stroke, and the page still scrolls when the touch starts outside the canvas. Verified at 390px: 22/22 touch events preventDefault'd, repeated vertical strokes draw, outside-canvas touches not prevented.
- **New brand icon** — `public/khruu-nui.png` replaced with the user's Khruu Nui illustration (512×512 square crop); used for both the header avatar and the favicon; `og:image` added in `index.html`.

### June 2026 — Mobile UX + audio pass
- **Audio loudness normalization** — new `src/lib/audio.js` (`playClip`) routes every voice clip (flashcards, tones, speaking reference, and the user's own recording) through the Web Audio API, decoding once, measuring RMS, and applying a gain (with a peak limiter) to a single target loudness — tuned to the Practice-Tone level. Falls back to a plain `<audio>` element if decode/CORS fails. One clip plays at a time. All four components now call it instead of bare `new Audio()`.
- **Flashcards** — front Thai letter enlarged (~7.5–10rem) to ~40% of card height; card tightened so the character dominates and whitespace is reduced. _(Note: card height was later raised to h-400/460 in the June 12 pass to fit the larger back image; front letter font unchanged.)_
- **Writing Practice** — controls reorganized for mobile: a **sticky bar** (Prev | letter+roman | Next, then Hear Sound + count) pins below the app header so you never scroll up to change letters; tracing canvas height cut ~30% on phones (`.trace-canvas-box`). _(Note: the touch handling described here was superseded by the June 12 native non-passive fix — see above.)_
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

## 6. Mobile UX — status & still-needed
**Resolved this round:** flashcard front letter size, flashcard back image visibility, Writing Practice tracing-vs-scroll on iPhone Safari (native non-passive listeners), audio loudness consistency across sections, 3-choice quiz for easier mobile reading.
**Still worth doing:** real-device pass on iOS + Android (the touch fix is verified via synthetic events at 390px — confirm by hand on a physical iPhone), safe-area-aware bottom nav, mic record testing on real hardware, smoother horizontal tab overflow.
**Open mobile item:** none reported open as of June 12 — awaiting the next on-device test.

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
- Populate `strokes.js`; replace fake pronunciation scoring. _(The `w.picked` typo in `ToneQuiz` review was fixed → now `w.picks`.)_
- `Desktop Preview.html` is dev-only and git-ignored — keep it out of production ZIPs.
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
