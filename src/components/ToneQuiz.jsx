import React, { useEffect, useState } from 'react';
import { SFX } from '@/lib/sfx';
import { playClip } from '@/lib/audio';
import { Confetti } from '@/components/Quiz';

// =====================================================================
// Tone Quiz — listen to a synthesized tone contour, pick the tone.
// 5 Thai tones: mid, low, falling, high, rising.
// =====================================================================
const TONES = [
  // Each tone is taught as a minimal pair on the same vowel (อา) so
  // students hear only the TONE change, not different words.
  // `audio` is a Cloudinary URL of Khruu Nui's recording; when empty,
  // we fall back to a synthesized contour so the app still works.
  // `audioSlow` is optional — paste a slower take for the slow button.
  { id: "mid",     en: "Mid",     th: "เสียงสามัญ",
    example: "อา",  roman: "aa",
    desc: "Flat, middle pitch",
    thShape: "เส้นตรงนอน",
    path: "M6 16 L58 16",
    audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1779503444/%E0%B8%AD%E0%B8%B2_gwyvkl.m4a", audioSlow: "" },

  { id: "low",     en: "Low",     th: "เสียงเอก",
    example: "อ่า", roman: "àa",
    desc: "Diagonal line going down at ~45°",
    thShape: "เส้นลากลง 45 องศา",
    path: "M8 6 L56 28",
    audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1779503447/%E0%B8%AD%E0%B9%88%E0%B8%B2_zc05eb.m4a", audioSlow: "" },

  { id: "falling", en: "Falling", th: "เสียงโท",
    example: "อ้า", roman: "âa",
    desc: "Up ~45° then down ~45° (mountain peak)",
    thShape: "เส้นลากขึ้น 45 องศา ต่อด้วยลากลง 45 องศา",
    path: "M6 28 L32 4 L58 28",
    audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1779503451/%E0%B8%AD%E0%B9%89%E0%B8%B2_bk0b8r.m4a", audioSlow: "" },

  { id: "high",    en: "High",    th: "เสียงตรี",
    example: "อ๊า", roman: "áa",
    desc: "Diagonal line going up at ~45°",
    thShape: "เส้นลากขึ้น 45 องศา",
    path: "M8 28 L56 6",
    audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1779503454/%E0%B8%AD%E0%B9%8A%E0%B8%B2_m2ajrf.m4a", audioSlow: "" },

  { id: "rising",  en: "Rising",  th: "เสียงจัตวา",
    example: "อ๋า", roman: "ǎa",
    desc: "Down ~45° then up ~45° (valley)",
    thShape: "เส้นลากลงก่อน 45 องศาและลากขึ้น 45 องศา",
    path: "M6 4 L32 28 L58 4",
    audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1779503458/%E0%B8%AD%E0%B9%8B%E0%B8%B2_vh0n7s.m4a", audioSlow: "" }
];

// Plays a tone — uses Cloudinary audio when present, falls back to synth.
// Routes through the normalized player so tone loudness matches the rest
// of the app (tones are our reference level, so they stay ~unchanged).
function playTone(tone, slow = false) {
  const url = slow ? (tone.audioSlow || tone.audio) : tone.audio;
  if (url) {
    const rate = slow && !tone.audioSlow ? 0.7 : 1.0;
    playClip(url, { rate }).catch(() => { if (SFX) SFX.tone(tone.id); });
    return;
  }
  if (SFX) SFX.tone(tone.id);
}

function ToneContour({ tone, color = "#7cc9f5", animated = false }) {
  return (
    <svg viewBox="0 0 64 32" className="w-full h-full">
      {/* baseline */}
      <line x1="2" y1="30" x2="62" y2="30" stroke="rgba(15,23,42,0.08)" strokeWidth="1" />
      <line x1="2" y1="2"  x2="62" y2="2"  stroke="rgba(15,23,42,0.06)" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="2" y1="16" x2="62" y2="16" stroke="rgba(15,23,42,0.06)" strokeWidth="1" strokeDasharray="2 2" />
      <path d={tone.path} stroke={color} strokeWidth="3" fill="none"
            strokeLinecap="round" strokeLinejoin="round"
            className={animated ? "tone-draw" : ""} />
    </svg>
  );
}

function buildToneQuestion() {
  const correct = TONES[Math.floor(Math.random() * TONES.length)];
  const others = TONES.filter(t => t.id !== correct.id);
  // shuffle and take 3
  const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
  const choices = [correct, ...shuffled].sort(() => Math.random() - 0.5);
  return { correct, choices };
}

function ToneQuiz({ totalQuestions = 10, onExit }) {
  const [questions, setQuestions] = useState(
    () => Array.from({ length: totalQuestions }, buildToneQuestion)
  );
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState([]);
  const [perfectCorrect, setPerfectCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [done, setDone] = useState(false);

  const q = questions[idx];
  const progress = ((idx + (perfectCorrect ? 1 : 0)) / totalQuestions) * 100;
  const isCorrectPicked = picks.some(p => p.id === q.correct.id);

  // Auto-play on each new question
  useEffect(() => {
    if (q) {
      const t = setTimeout(() => playTone(q.correct), 250);
      return () => clearTimeout(t);
    }
  }, [idx, q]);

  const replay = () => { playTone(q.correct); };
  const replaySlow = () => { playTone(q.correct, true); };

  const handlePick = (tone) => {
    if (isCorrectPicked) return;
    if (picks.find(p => p.id === tone.id)) return;
    const newPicks = [...picks, tone];
    setPicks(newPicks);
    const right = tone.id === q.correct.id;
    if (right) {
      if (SFX) SFX.reward();
      if (newPicks.length === 1) {
        setScore(s => s + 1);
        setPerfectCorrect(true);
      } else {
        setWrong(w => [...w, { ...q, picks: newPicks }]);
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
    setQuestions(Array.from({ length: totalQuestions }, buildToneQuestion));
    setIdx(0); setPicks([]); setPerfectCorrect(false);
    setScore(0); setWrong([]); setDone(false);
  };

  if (done) {
    return <ToneQuizResults
      score={score} total={totalQuestions} wrong={wrong}
      onRestart={restart} onExit={onExit}
    />;
  }

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
        <span>Tone {idx + 1} of {totalQuestions}</span>
        <span className="text-[#ffbd59]">★ {score}</span>
      </div>

      <div className="h-2 w-full rounded-full bg-white dark:bg-slate-800 overflow-hidden mb-3 shadow-inner">
        <div className="h-full rounded-full transition-all duration-500"
             style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7cc9f5, #ffbd59)" }} />
      </div>

      <div className={`relative rounded-[28px] bg-white p-4 sm:p-5 mb-3 transition-all duration-300 ${
        isCorrectPicked ? "ring-4 ring-emerald-300 shadow-[0_0_40px_rgba(16,185,129,0.35)]" :
        picks.length > 0 ? "ring-4 ring-rose-200" :
                           "shadow-[0_18px_40px_-20px_rgba(124,201,245,0.55)]"
      }`}>
        <div className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500 font-semibold mb-2 text-center">
          Which tone did you hear?
        </div>

        {/* Audio buttons */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-center">
          <button
            onClick={replay}
            className="om-soft flex items-center justify-center gap-3 px-5 py-3 rounded-2xl transition-transform active:scale-95"
            style={{ background: "linear-gradient(135deg, #E6F4FE 0%, #FFEFD6 100%)" }}
          >
            <span className="w-12 h-12 rounded-full grid place-items-center shadow-md shrink-0"
                  style={{ background: "#7cc9f5" }}>
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="text-base font-bold text-slate-700">Play tone</span>
          </button>
          <button onClick={replaySlow}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-slate-700 bg-white border-2 border-slate-200 active:scale-95 transition-transform">
            🐢 Play slower
          </button>
        </div>

        {isCorrectPicked && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="text-5xl float-up">🎉</span>
          </div>
        )}
      </div>

      {/* Choices: each shows contour + label */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3">
        {q.choices.map((tone, i) => {
          const wasPicked = picks.find(p => p.id === tone.id);
          const isCorrectChoice = tone.id === q.correct.id;
          let cls = "bg-white hover:bg-[#fff8ec] border-slate-200";
          if (wasPicked && isCorrectChoice)            cls = "bg-emerald-50 border-emerald-400";
          else if (wasPicked && !isCorrectChoice)      cls = "bg-rose-50 border-rose-400 opacity-70";
          else if (isCorrectPicked)                    cls = "bg-white border-slate-200 opacity-50";

          return (
            <button
              key={tone.id}
              onClick={() => handlePick(tone)}
              disabled={isCorrectPicked || !!wasPicked}
              className={`relative p-2 sm:p-3 rounded-2xl border-2 transition-all active:scale-[0.97] disabled:cursor-default min-h-[100px] ${cls}`}
            >
              <div className="h-9 sm:h-10 mb-1">
                <ToneContour tone={tone}
                  color={wasPicked && isCorrectChoice ? "#16a34a" : (wasPicked && !isCorrectChoice ? "#e11d48" : "#7cc9f5")} />
              </div>
              <div className="font-thai text-xl leading-none mb-0.5 text-slate-900 dark:text-slate-100">{tone.example}</div>
              <div className="text-2xl sm:text-3xl font-semibold leading-none text-slate-800 dark:text-slate-100 mb-1">{tone.roman}</div>
              <div className="font-bold text-slate-800 text-sm sm:text-base">{tone.en}</div>
              <div className="font-thai text-[11px] text-slate-500">{tone.th}</div>
            </button>
          );
        })}
      </div>

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
          <div className="rounded-3xl p-3 sm:p-4 animate-fade-in border-2 border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300 min-w-0">
              <span className="w-7 h-7 rounded-full bg-emerald-500 grid place-items-center text-white text-sm shrink-0">✓</span>
              <span>เก่งมาก! That's <strong>{q.correct.en}</strong> — <span className="font-thai">{q.correct.example}</span> <span className="text-2xl sm:text-3xl font-bold align-middle text-emerald-800 dark:text-emerald-200">{q.correct.roman}</span></span>
            </div>
            <button
              onClick={goNext}
              className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2 rounded-full font-bold text-sm text-slate-900 shadow-md active:scale-95 transition-transform"
              style={{ background: "#ffbd59" }}>
              {idx + 1 >= totalQuestions ? "Finish →" : "Next question →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ToneQuizResults({ score, total, wrong, onRestart, onExit }) {
  const pct = (score / total) * 100;
  const perfect = score === total;
  let reward;
  if (perfect)        reward = { th: "ยอดเยี่ยม!",          en: "Perfect ear!",         emoji: "🏆", tone: "#ffbd59" };
  else if (pct >= 80) reward = { th: "เก่งมาก!",            en: "Great listening!",     emoji: "🌟", tone: "#7cc9f5" };
  else if (pct >= 50) reward = { th: "ดีมาก!",              en: "Keep practicing!",     emoji: "💪", tone: "#7cc9f5" };
  else                reward = { th: "ไม่เป็นไร ลองใหม่นะ!", en: "Try again!",          emoji: "🌱", tone: "#ffbd59" };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 relative">
      {perfect && Confetti && <Confetti />}
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
          <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full" style={{ background: "#ffbd59" }} />
            Review ({wrong.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {wrong.map((w, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border-2 border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Correct</div>
                    <div className="font-bold text-slate-800">{w.correct.en}</div>
                    <div className="text-3xl sm:text-4xl font-bold leading-none text-slate-800 dark:text-slate-100 my-1">{w.correct.roman}</div>
                    <div className="font-thai text-xs text-slate-500">{w.correct.th}</div>
                  </div>
                  <button onClick={() => playTone(w.correct)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: "#7cc9f5", color: "white" }}>
                    ▶ Play
                  </button>
                </div>
                <div className="h-12"><ToneContour tone={w.correct} color="#7cc9f5" /></div>
                <div className="mt-2 text-xs text-slate-500">
                  You picked:{" "}
                  <span className="font-semibold text-rose-500">
                    {(w.picks || []).filter(p => p.id !== w.correct.id).map(p => p.en).join(", ") || "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ToneQuizLanding({ onStart }) {
  const [length, setLength] = useState(10);
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-7 text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <span className="text-5xl sm:text-6xl">🎵</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100">Tone training</h1>
      </div>
      <p className="text-slate-600 dark:text-slate-300 mb-1 max-w-xl mx-auto text-sm sm:text-base">
        Thai has five tones. Each example below is the same vowel <span className="font-thai font-bold">อา</span>{" "}
        with a different tone — listen for the contour, not the word.
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Tap any tone to hear it</p>

      {/* Reference */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 mb-3 grid grid-cols-5 gap-2">
        {TONES.map(t => (
          <button key={t.id} onClick={() => playTone(t)}
            className="flex flex-col items-center gap-0.5 rounded-2xl p-2 hover:bg-slate-50 active:scale-95 transition-transform">
            <div className="w-full h-9"><ToneContour tone={t} color="#7cc9f5" /></div>
            <div className="font-thai text-base sm:text-lg leading-none text-slate-800">{t.example}</div>
            <div className="text-3xl sm:text-4xl font-bold leading-none text-slate-800 dark:text-slate-100 my-0.5">{t.roman}</div>
            <div className="text-[10px] sm:text-xs font-bold text-slate-700">{t.en}</div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_18px_40px_-20px_rgba(124,201,245,0.6)]">
        <div className="flex items-center justify-center gap-3 mb-3 flex-wrap">
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-300">Questions:</div>
          <div className="flex gap-2">
            {[5, 10, 20].map(n => (
              <button key={n} onClick={() => setLength(n)}
                className={`px-5 py-2 rounded-2xl font-bold text-base transition-all border-2 ${
                  length === n ? "border-[#7cc9f5] bg-[#E6F4FE] text-slate-900 scale-[1.04]"
                               : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                }`}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => onStart(length)}
          className="w-full py-3.5 rounded-full font-extrabold text-lg text-slate-900 shadow-lg shadow-orange-200 active:scale-[0.98] transition-transform"
          style={{ background: "#ffbd59" }}>
          Start Tone Quiz →
        </button>
      </div>
    </div>
  );
}


export { ToneQuiz, ToneQuizLanding, ToneContour };
