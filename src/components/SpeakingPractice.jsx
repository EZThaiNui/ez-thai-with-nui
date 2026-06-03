import React, { useEffect, useRef, useState } from 'react';
import { CLASS_STYLES } from '@/data/consonants';
import { SFX } from '@/lib/sfx';

// =====================================================================
// Pronunciation Practice — record your voice, play it back, get a
// placeholder score. Scoring API can be wired later in `scorePronunciation`.
// =====================================================================
// --- PLACEHOLDER SCORING ----------------------------------------------
// Replace this with a real API call later. It should take a Blob of audio
// and the target consonant, and return { score: 0-100, feedback: string }.
async function scorePronunciation({ audioBlob, consonant }) {
  // Naive heuristic: louder + longer-than-zero recording = higher score.
  // This is intentionally simple — swap in a real model later.
  try {
    const arrayBuf = await audioBlob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const decoded = await audioCtx.decodeAudioData(arrayBuf.slice(0));
    const data = decoded.getChannelData(0);
    let energy = 0;
    for (let i = 0; i < data.length; i += 100) energy += Math.abs(data[i]);
    energy = energy / (data.length / 100);
    audioCtx.close();
    // Map ~0–0.3 energy to a 50–95 score with random jitter
    const base = Math.min(95, 50 + energy * 200);
    const jitter = (Math.random() - 0.5) * 8;
    const score = Math.max(20, Math.min(99, Math.round(base + jitter)));
    return { score, durationSec: decoded.duration };
  } catch (e) {
    return { score: 70 + Math.floor(Math.random() * 20), durationSec: 1 };
  }
}

function feedbackFor(score) {
  if (score >= 90) return { th: "ยอดเยี่ยม!",          en: "Native-like!",      emoji: "🏆", color: "#16a34a" };
  if (score >= 75) return { th: "เก่งมาก!",            en: "Great pronunciation!", emoji: "🌟", color: "#7cc9f5" };
  if (score >= 60) return { th: "ดีมาก!",              en: "Getting there!",    emoji: "💪", color: "#ffbd59" };
  return                    { th: "ไม่เป็นไร ลองใหม่นะ!", en: "Try once more!",   emoji: "🌱", color: "#94a3b8" };
}

function SpeakingPractice({ consonants }) {
  const [idx, setIdx] = useState(0);
  const [recording, setRecording] = useState(false);
  const [hasMic, setHasMic] = useState(true);
  const [permissionError, setPermissionError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]); // last attempts for this letter
  const [elapsed, setElapsed] = useState(0);

  const consonant = consonants[idx];
  const style = CLASS_STYLES[consonant.class];

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasMic(false);
    }
  }, []);

  // Reset state when changing letter (and revoke any old recording URL)
  useEffect(() => {
    setAudioUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setResult(null);
    setHistory([]);
  }, [idx]);

  // Revoke object URL on unmount to avoid leaks
  useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
  }, [audioUrl]);

  const startRecording = async () => {
    if (SFX) SFX.click();
    setPermissionError(null);
    setResult(null);
    setAudioUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      // Pick a mime type the browser actually supports. iOS Safari records
      // audio/mp4; Chrome/Firefox record audio/webm. Forcing webm produces
      // an unplayable blob on Safari, which was the playback bug.
      let mimeType = "";
      const candidates = ["audio/webm", "audio/mp4", "audio/ogg"];
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported) {
        mimeType = candidates.find(t => MediaRecorder.isTypeSupported(t)) || "";
      }
      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        const blobType = rec.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: blobType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setScoring(true);
        const sc = await scorePronunciation({ audioBlob: blob, consonant });
        setResult(sc);
        setScoring(false);
        setHistory(h => [sc, ...h].slice(0, 5));
        if (SFX) {
          if (sc.score >= 75) SFX.reward();
          else if (sc.score < 60) SFX.wrong();
          else SFX.flip();
        }
        stream.getTracks().forEach(t => t.stop());
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setElapsed(0);
      const MAX_SEC = 4;
      timerRef.current = setInterval(() => {
        setElapsed(e => {
          const next = e + 0.1;
          if (next >= MAX_SEC) {
            if (rec.state === "recording") rec.stop();
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
            setRecording(false);
            return MAX_SEC;
          }
          return next;
        });
      }, 100);
    } catch (e) {
      setPermissionError(e.message || "Microphone permission denied");
      setHasMic(false);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setRecording(false);
  };

  const referenceAudioRef = useRef(null);
  const [refError, setRefError] = useState(null);

  const playReference = () => {
    if (SFX) SFX.click();
    setRefError(null);
    const url = consonant.audio;
    if (!url || url.includes("PASTE_")) {
      setRefError("Reference audio not available for this letter yet.");
      return;
    }
    try {
      if (!referenceAudioRef.current || referenceAudioRef.current.dataset.url !== url) {
        const a = new Audio(url);
        a.dataset.url = url;
        referenceAudioRef.current = a;
      }
      const audio = referenceAudioRef.current;
      audio.currentTime = 0;
      audio.play().catch(() => setRefError("Couldn't play the reference audio."));
    } catch {
      setRefError("Couldn't play the reference audio.");
    }
  };

  const myAudioRef = useRef(null);
  const replayMine = () => {
    if (!audioUrl) return;
    if (SFX) SFX.click();
    try {
      if (!myAudioRef.current) myAudioRef.current = new Audio();
      const a = myAudioRef.current;
      if (a.src !== audioUrl) a.src = audioUrl;
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch { /* ignore */ }
  };

  const next = () => {
    if (SFX) SFX.click();
    setIdx(i => (i + 1) % consonants.length);
  };
  const prev = () => {
    if (SFX) SFX.click();
    setIdx(i => (i - 1 + consonants.length) % consonants.length);
  };

  const fb = result ? feedbackFor(result.score) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
      <div className="mb-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-sm mb-1">
          <span>🎙️</span> Speaking practice
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">Say it out loud.</h1>
      </div>

      <div className="rounded-[28px] bg-white p-4"
           style={{ boxShadow: `0 20px 50px -25px ${style.ring}` }}>
        {/* Letter + romanization — compact, side-by-side on ≥sm */}
        <div className="om-soft rounded-3xl p-3 sm:p-4 mb-3 flex items-center gap-4"
             style={{ background: style.bgFront }}>
          <div className="font-thai leading-none shrink-0"
               style={{ fontSize: "clamp(5rem, 16vw, 8rem)", color: style.accent, paddingBottom: "0.15em" }}>
            {consonant.letter}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 font-bold">Say this letter</div>
            <div className="font-thai text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{consonant.name}</div>
            <div className="italic font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-700 dark:text-slate-100 leading-tight">
              {consonant.roman}
            </div>
            <button onClick={playReference}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs active:scale-95 transition-transform"
              style={{ background: style.badgeBg, color: style.badgeText }}>
              ▶ Hear Khruu Nui
            </button>
            {refError && (
              <div className="mt-1 text-[11px] text-rose-500 font-semibold">{refError}</div>
            )}
          </div>
        </div>

        {/* Mic / record */}
        {!hasMic ? (
          <div className="rounded-2xl bg-rose-50 border-2 border-rose-100 dark:bg-rose-900/25 dark:border-rose-800 p-4 text-sm text-rose-700 dark:text-rose-200">
            <strong>Microphone unavailable.</strong> Allow microphone access and refresh,
            or use a browser that supports recording.
            {permissionError && <div className="mt-1 opacity-75">({permissionError})</div>}
          </div>
        ) : (
          <div className="flex items-center gap-4 justify-center">
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full grid place-items-center transition-all active:scale-95 shrink-0 ${
                recording ? "bg-rose-500" : ""
              }`}
              style={{ background: recording ? "#ef4444" : "#ffbd59", boxShadow: recording ? "0 0 0 10px rgba(239,68,68,0.18)" : "0 6px 22px -4px rgba(255,189,89,0.6)" }}
            >
              {recording && (
                <span className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: "rgba(239,68,68,0.35)" }} />
              )}
              {recording ? (
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white relative" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-900" fill="currentColor">
                  <rect x="9" y="3"  width="6" height="12" rx="3" />
                  <path d="M5 11a7 7 0 0014 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              )}
            </button>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {recording ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Recording… {Math.max(0, Math.ceil(4 - elapsed))}s
                  </span>
                ) : (audioUrl ? "Tap to record again" : "Tap to record")}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {recording ? "Tap again to stop early" : "Record up to 4 seconds."}
              </div>
              {/* Replay buttons inline with record — only when recording exists */}
              {audioUrl && !recording && (
                <div className="mt-1.5 flex gap-1.5">
                  <button onClick={replayMine}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100 font-bold text-[11px] hover:bg-slate-200 active:scale-95 transition-all">
                    ▶ Yours
                  </button>
                  <button onClick={playReference}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E6F4FE] text-[#0c4a6e] dark:bg-slate-700 dark:text-slate-100 font-bold text-[11px] active:scale-95 transition-all">
                    ▶ Reference
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Score — directly under record controls, compact */}
        {scoring && (
          <div className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400 animate-pulse">Scoring…</div>
        )}
        {result && !scoring && fb && (
          <div className="om-warm mt-3 rounded-2xl p-3 flex items-center gap-3"
               style={{ background: "linear-gradient(135deg, #fff8ec 0%, #e6f4fe 100%)" }}>
            <div className="text-4xl bounce-pop">{fb.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="font-thai font-bold text-base text-slate-800 dark:text-slate-100">{fb.th}</div>
              <div className="text-xs text-slate-600 dark:text-slate-300">{fb.en}</div>
            </div>
            <div className="inline-flex items-baseline gap-1 px-3 py-1.5 rounded-full bg-white shadow-sm shrink-0">
              <span className="text-2xl font-extrabold" style={{ color: fb.color }}>{result.score}</span>
              <span className="text-xs text-slate-400 font-semibold">/100</span>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Attempts:</span>
            {history.map((h, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: feedbackFor(h.score).color + "22", color: feedbackFor(h.score).color }}>
                {h.score}
              </span>
            ))}
          </div>
        )}

        {/* Nav */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <button onClick={prev}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-white border-2 border-slate-200 dark:bg-slate-700 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-100 active:scale-95 transition-transform">
            ← Prev
          </button>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-semibold">{idx + 1} / {consonants.length}</div>
          <button onClick={next}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-full font-bold text-slate-900 shadow-md active:scale-95 transition-transform"
            style={{ background: "#ffbd59" }}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export { SpeakingPractice };
