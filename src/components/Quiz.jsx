import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CLASS_STYLES } from '@/data/consonants';
import { SFX } from '@/lib/sfx';
import { Flashcard } from '@/components/Flashcard';

// =====================================================================
// Consonant Quiz — multiple-choice with retry-until-correct behavior.
//
//   • Wrong choice: marked red, plays wrong sound, student keeps trying.
//   • Correct choice: marked green, reward sound, then advance.
//   • Score counts ONLY first-try correct answers.
//   • Tracks wrongAttempts per question for review.
//   • Perfect score: confetti / graffiti celebration at the end.
// =====================================================================
// ---- Single question shape (consonant quiz: "How do you say this letter?")
function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildConsonantQuestion(pool) {
  const consonant = pool[Math.floor(Math.random() * pool.length)];
  const correct = consonant.roman;
  const others = pool.filter(c => c.roman !== correct);
  const distractors = shuffle(others).slice(0, 3).map(c => c.roman);
  while (distractors.length < 3) {
    const cand = shuffle(pool)[0].roman;
    if (cand !== correct && !distractors.includes(cand)) distractors.push(cand);
  }
  const choices = shuffle([correct, ...distractors]);
  return { consonant, correct, choices, kind: "consonant" };
}

function buildClassQuestion(pool) {
  const consonant = pool[Math.floor(Math.random() * pool.length)];
  const correct = consonant.class;
  // Always all three classes — students learn the trio
  const choices = ["Middle", "High", "Low"];
  return { consonant, correct, choices, kind: "class" };
}

// =====================================================================
// Main Quiz component — supports both "consonant" and "class" quiz kinds.
// =====================================================================
function Quiz({ consonants, totalQuestions = 10, kind = "consonant", onExit }) {
  const pool = useMemo(
    () => consonants.filter(c => !["ฃ", "ฅ"].includes(c.letter)),
    [consonants]
  );
  const buildQ = kind === "class" ? buildClassQuestion : buildConsonantQuestion;

  const [questions, setQuestions] = useState(
    () => Array.from({ length: totalQuestions }, () => buildQ(pool))
  );
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState([]);        // choices picked so far on this question
  const [perfectCorrect, setPerfectCorrect] = useState(false); // got it right WITHOUT errors
  const [score, setScore] = useState(0);
  const [wrongList, setWrongList] = useState([]); // questions answered wrong at least once
  const [done, setDone] = useState(false);

  const q = questions[idx];
  const progress = ((idx + (perfectCorrect ? 1 : 0)) / totalQuestions) * 100;
  const isCorrectPicked = picks.some(p => p === q.correct);

  const handleChoice = (choice) => {
    if (isCorrectPicked) return;     // locked after correct
    if (picks.includes(choice)) return;

    const isRight = choice === q.correct;
    const newPicks = [...picks, choice];
    setPicks(newPicks);

    if (isRight) {
      if (SFX) SFX.reward();
      const firstTry = newPicks.length === 1;
      if (firstTry) {
        setScore(s => s + 1);
        setPerfectCorrect(true);
      } else {
        // Save for review since they got it wrong at least once
        setWrongList(w => [...w, { ...q, picks: newPicks }]);
      }
    } else {
      if (SFX) SFX.wrong();
    }
  };

  const goNext = () => {
    if (SFX) SFX.click();
    if (idx + 1 >= totalQuestions) {
      setDone(true);
      if (SFX) SFX.complete();
    } else {
      setIdx(i => i + 1);
      setPicks([]);
      setPerfectCorrect(false);
    }
  };

  const restart = () => {
    setQuestions(Array.from({ length: totalQuestions }, () => buildQ(pool)));
    setIdx(0); setPicks([]); setPerfectCorrect(false);
    setScore(0); setWrongList([]); setDone(false);
  };

  if (done) {
    return <QuizResults
      score={score} total={totalQuestions} wrong={wrongList}
      kind={kind}
      onRestart={restart} onExit={onExit}
    />;
  }

  const style = CLASS_STYLES[q.consonant.class];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
        <button onClick={onExit} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-300">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Exit
        </button>
        <span>Question {idx + 1} of {totalQuestions}</span>
        <span className="text-[#ffbd59]">★ {score}</span>
      </div>

      <div className="h-2 w-full rounded-full bg-white/70 dark:bg-slate-800 overflow-hidden mb-3 shadow-inner">
        <div className="h-full rounded-full transition-all duration-500"
             style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7cc9f5, #ffbd59)" }} />
      </div>

      {/* Question card */}
      <div className={`relative rounded-[28px] bg-white p-4 sm:p-5 mb-3 transition-all duration-300 ${
        isCorrectPicked ? "ring-4 ring-emerald-300 shadow-[0_0_40px_rgba(16,185,129,0.35)]" :
        picks.length > 0 ? "ring-4 ring-rose-200 shadow-[0_0_30px_rgba(244,63,94,0.20)]" :
                           "shadow-[0_18px_40px_-20px_rgba(124,201,245,0.55)]"
      }`}>
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400 font-semibold mb-2">
            {kind === "class" ? "Which class is this consonant?" : "How do you say this letter?"}
          </div>
          <div className="om-soft mx-auto w-32 h-32 sm:w-40 sm:h-40 rounded-3xl grid place-items-center"
               style={{ background: style.bgFront, boxShadow: `inset 0 0 0 6px ${style.bg}` }}>
            <span className={`font-thai text-[6rem] sm:text-[8rem] leading-none ${isCorrectPicked ? "bounce-pop" : ""}`}
                  style={{ color: style.accent }}>
              {q.consonant.letter}
            </span>
          </div>
          {isCorrectPicked && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="text-5xl float-up">🎉</span>
            </div>
          )}
        </div>
      </div>

      {/* Choices */}
      <div className={`grid gap-3 ${kind === "class" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
        {q.choices.map((choice, i) => {
          const wasPicked = picks.includes(choice);
          const isCorrectChoice = choice === q.correct;
          const styleChoice = kind === "class" ? CLASS_STYLES[choice] : null;

          let cls = "bg-white hover:bg-[#fff8ec] dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700";
          if (wasPicked && isCorrectChoice)       cls = "bg-emerald-50 border-emerald-400 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-500";
          else if (wasPicked && !isCorrectChoice) cls = "bg-rose-50 border-rose-400 text-rose-900 dark:bg-rose-900/25 dark:border-rose-500 opacity-70";
          else if (isCorrectPicked)               cls = "bg-white border-slate-200 dark:border-slate-700 opacity-50";

          // Class quiz: use class colors for choice background
          const classQuizBg = (kind === "class" && !wasPicked && !isCorrectPicked)
            ? { background: styleChoice.bg, borderColor: styleChoice.accent + "44" }
            : undefined;

          return (
            <button
              key={i}
              onClick={() => handleChoice(choice)}
              disabled={isCorrectPicked || wasPicked}
              style={classQuizBg}
              className={`group relative text-left px-5 py-4 rounded-2xl border-2 font-semibold text-base sm:text-lg transition-all active:scale-[0.98] disabled:cursor-default min-h-[60px] ${cls}`}
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-sm mr-3">
                {String.fromCharCode(65 + i)}
              </span>
              <span className={
                kind === "class" ? "font-bold" :
                "italic"
              }
              style={kind === "class" && !wasPicked ? { color: styleChoice.badgeText } : undefined}>
                {kind === "class" ? `${choice} Class` : choice}
              </span>
              {wasPicked && isCorrectChoice && (
                <svg viewBox="0 0 24 24" className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 12l4 4L19 6" />
                </svg>
              )}
              {wasPicked && !isCorrectChoice && (
                <svg viewBox="0 0 24 24" className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Reveal panel */}
      <div className="mt-3">
        {picks.length === 0 ? (
          <div className="h-8 text-center text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-semibold">
            Tap an answer
          </div>
        ) : !isCorrectPicked ? (
          <div className="rounded-3xl p-3 sm:p-4 animate-fade-in border-2 border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-700">
            <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
              <span className="w-7 h-7 rounded-full bg-rose-500 grid place-items-center text-white text-sm">✕</span>
              <span>ลองอีกครั้ง — try again!</span>
              <span className="ml-auto text-xs font-semibold text-rose-500 dark:text-rose-300">
                {picks.length} wrong {picks.length === 1 ? "try" : "tries"}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl p-3 sm:p-4 animate-fade-in border-2 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700">
            <div className="flex items-center justify-between gap-2 mb-2 font-bold">
              <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 min-w-0">
                <span className="w-6 h-6 rounded-full bg-emerald-500 grid place-items-center text-white text-xs shrink-0">✓</span>
                <span className="truncate">{picks.length === 1 ? "เก่งมาก! First try!" : "เก่งมาก! Got it!"}</span>
              </span>
              <button
                onClick={goNext}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm text-slate-900 shadow-md active:scale-95 transition-transform"
                style={{ background: "#ffbd59" }}>
                {idx + 1 >= totalQuestions ? "Finish →" : "Next →"}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="om-soft w-16 h-16 sm:w-20 sm:h-20 rounded-2xl grid place-items-center shrink-0"
                   style={{ background: style.bgFront, boxShadow: `inset 0 0 0 4px ${style.bg}` }}>
                <span className="font-thai text-4xl sm:text-5xl leading-none" style={{ color: style.accent }}>
                  {q.consonant.letter}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 flex-1 min-w-0">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">Name</div>
                  <div className="font-thai font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-tight truncate">{q.consonant.name}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">Romanization</div>
                  <div className="italic font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate">{q.consonant.roman}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">English meaning</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm capitalize truncate">{q.consonant.meaning}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">Class</div>
                  <div className="inline-flex">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                          style={{ background: style.badgeBg, color: style.badgeText }}>
                      {style.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <button
                onClick={() => {
                  if (SFX) SFX.click();
                  if (q.consonant.audio && !q.consonant.audio.includes("PASTE_")) {
                    try { new Audio(q.consonant.audio).play(); } catch {}
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm active:scale-95 transition-transform"
                style={{ background: style.accent, color: "#1e293b" }}>
                ▶ Hear it
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// Results screen — perfect-score confetti + wrong-card review
// =====================================================================
function QuizResults({ score, total, wrong, kind, onRestart, onExit }) {
  const pct = (score / total) * 100;
  const perfect = score === total;
  let reward;
  if (perfect)         reward = { th: "ยอดเยี่ยม!",          en: "Perfect!",         emoji: "🏆", tone: "#ffbd59" };
  else if (pct >= 80)  reward = { th: "เก่งมาก!",            en: "Great job!",       emoji: "🌟", tone: "#7cc9f5" };
  else if (pct >= 50)  reward = { th: "ดีมาก!",              en: "Keep practicing!", emoji: "💪", tone: "#7cc9f5" };
  else                 reward = { th: "ไม่เป็นไร ลองใหม่นะ!", en: "Try again!",      emoji: "🌱", tone: "#ffbd59" };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 relative">
      {perfect && <Confetti />}

      <div className="om-warm relative rounded-[32px] p-8 sm:p-10 text-center mb-6 overflow-hidden"
           style={{ background: "linear-gradient(135deg, #fff8ec 0%, #e6f4fe 100%)", boxShadow: "0 30px 60px -30px rgba(124,201,245,0.45)" }}>
        <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full opacity-30" style={{ background: "#ffbd59" }} />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-25" style={{ background: "#7cc9f5" }} />
        <div className="relative">
          {perfect && (
            <div className="mb-4">
              <div className="graffiti graffiti-th">ยอดเยี่ยม!</div>
              <div className="graffiti graffiti-en">Thai Star!</div>
            </div>
          )}
          <div className="text-7xl sm:text-8xl mb-3 inline-block bounce-pop">{reward.emoji}</div>
          <h2 className="font-thai text-4xl sm:text-5xl font-bold text-slate-800 mb-1">{reward.th}</h2>
          <p className="text-lg sm:text-xl text-slate-600 mb-6">{reward.en}</p>
          <div className="inline-flex items-baseline gap-2 px-6 py-3 rounded-full bg-white shadow-sm">
            <span className="text-5xl font-extrabold" style={{ color: reward.tone }}>{score}</span>
            <span className="text-2xl text-slate-400 font-semibold">/ {total}</span>
          </div>
          <div className="mt-6 text-sm font-semibold text-slate-600">
            {score} first-try correct · {wrong.length} needed retry
          </div>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={onRestart}
              className="px-7 py-3.5 rounded-full font-bold text-slate-900 shadow-lg shadow-orange-200 active:scale-[0.98] transition-transform"
              style={{ background: "#ffbd59" }}>
              ↻ New Quiz
            </button>
            <button onClick={onExit}
              className="px-7 py-3.5 rounded-full font-bold text-slate-700 bg-white border-2 border-slate-200 active:scale-[0.98] transition-transform">
              Back
            </button>
          </div>
        </div>
      </div>

      {wrong.length > 0 && (
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full" style={{ background: "#ffbd59" }} />
            Review these ({wrong.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wrong.map((w, i) => (
              <Flashcard key={i} consonant={w.consonant} />
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">Tap any card to flip and review.</p>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Confetti — fixed-position canvas overlay, fires once for ~3 seconds
// =====================================================================
function Confetti() {
  const ref = React.useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const colors = ["#7cc9f5", "#ffbd59", "#6bcf8a", "#f472b6", "#a78bfa", "#fb7185"];
    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random() * W,
      y: -20 - Math.random() * H * 0.4,
      vx: (Math.random() - 0.5) * 2,
      vy: 3 + Math.random() * 4,
      a: Math.random() * Math.PI,
      va: (Math.random() - 0.5) * 0.2,
      s: 6 + Math.random() * 7,
      c: colors[Math.floor(Math.random() * colors.length)]
    }));
    let raf;
    const start = Date.now();
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.a += p.va;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s/2, -p.s/3, p.s, p.s * 0.55);
        ctx.restore();
      });
      if (Date.now() - start < 4500) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-50" />;
}

export { Quiz, QuizResults, Confetti };
