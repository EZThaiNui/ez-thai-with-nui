import React, { useState } from 'react';
import { CLASS_STYLES } from '@/data/consonants';
import { SFX } from '@/lib/sfx';
import { playClip } from '@/lib/audio';

// =====================================================================
// Flashcard — click to flip. Shows letter on front,
// full details + audio + image on back.
// =====================================================================
function Flashcard({ consonant, size = "normal" }) {
  const [flipped, setFlipped] = useState(false);
  const [audioState, setAudioState] = useState("idle"); // idle | playing | error
  const style = CLASS_STYLES[consonant.class];

  const toggle = () => { setFlipped(f => !f); if (SFX) SFX.flip(); };

  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  const playAudio = (e) => {
    e.stopPropagation();
    if (SFX) SFX.click();
    const url = consonant.audio;
    // Graceful fallback when URL is still a placeholder
    if (!url || url.includes("PASTE_")) {
      // Use Web Speech as a stand-in until real audio is wired up
      if ("speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(consonant.letter);
        u.lang = "th-TH";
        u.rate = 0.85;
        setAudioState("playing");
        u.onend = () => setAudioState("idle");
        u.onerror = () => setAudioState("error");
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
      }
      return;
    }
    // Normalized playback so every letter sounds as loud as the tones.
    setAudioState("playing");
    playClip(url, { onended: () => setAudioState("idle") })
      .catch(() => setAudioState("error"));
  };

  const isPlaceholderImg = !consonant.image || consonant.image.includes("PASTE_");
  // Letter dominates the card (~40% of card height). Enlarged ~55-65% vs the
  // previous sizing so the character is readable at arm's length on a phone.
  const letterSize = size === "large" ? "text-[12rem] sm:text-[14rem]" : "text-[7.5rem] sm:text-[9rem] lg:text-[10rem]";
  const cardHeight = size === "large" ? "h-[420px] sm:h-[480px]" : "h-[400px] sm:h-[460px]";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={toggle}
      onKeyDown={handleKey}
      className={`flashcard-wrap ${cardHeight} cursor-pointer select-none outline-none focus-visible:ring-4`}
      style={{ "--ring": style.ring }}
    >
      <div className={`flashcard-inner ${flipped ? "is-flipped" : ""}`}>
        {/* ============ FRONT ============ */}
        <div
          className="flashcard-face flashcard-front"
          style={{ background: style.bgFront, boxShadow: `0 10px 30px -12px ${style.ring}` }}
        >
          {/* class corner badge */}
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide"
            style={{ background: style.badgeBg, color: style.badgeText }}
          >
            {style.label}
          </div>

          {/* tap hint */}
          <div className="absolute top-3 right-3 text-[10px] uppercase tracking-[0.18em] text-slate-400 font-medium">
            tap to flip
          </div>

          {/* big letter */}
          <div className="flex-1 grid place-items-center w-full">
            <span
              className={`${letterSize} font-thai leading-none`}
              style={{ color: style.accent, textShadow: `0 6px 0 ${style.bg}` }}
            >
              {consonant.letter}
            </span>
          </div>

          {/* bottom hint dots */}
          <div className="pb-4 flex gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            <span className="h-1.5 w-6 rounded-full" style={{ background: style.accent }} />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          </div>
        </div>

        {/* ============ BACK ============ */}
        <div
          className="flashcard-face flashcard-back p-4 sm:p-5"
          style={{ background: style.bg, boxShadow: `0 10px 30px -12px ${style.ring}` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide"
              style={{ background: style.badgeBg, color: style.badgeText }}
            >
              {style.label}
            </span>
            <span className="text-3xl font-thai leading-none" style={{ color: style.accent }}>
              {consonant.letter}
            </span>
          </div>

          {/* image slot — its OWN large square/rounded area with a guaranteed
              minimum height so the picture is obvious on mobile (≥150px on
              iPhone) and still grows to fill any extra space. */}
          <div
            className="fc-image w-full flex-1 min-h-[150px] sm:min-h-[170px] rounded-2xl overflow-hidden mb-2.5 flex items-center justify-center p-2"
            style={{ background: "rgba(255,255,255,0.7)" }}
          >
            {isPlaceholderImg ? (
              <div className="flex flex-col items-center gap-1 text-slate-500">
                <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <circle cx="9" cy="11" r="1.5" />
                  <path d="M21 17l-5-5-9 9" />
                </svg>
                <span className="text-[10px] font-mono uppercase tracking-wider">
                  image of {consonant.meaning}
                </span>
              </div>
            ) : (
              <img
                src={consonant.image}
                alt={consonant.meaning}
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}
          </div>

          {/* info rows — compact so the image gets the room */}
          <div className="space-y-0.5 text-left">
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Name</div>
              <div className="text-base font-thai font-semibold text-slate-800 leading-tight truncate">{consonant.name}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-baseline gap-1.5">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Rom.</div>
                <div className="text-sm font-semibold text-slate-800 italic truncate">{consonant.roman}</div>
              </div>
              <div className="flex items-baseline gap-1.5 justify-end">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Sound</div>
                <div className="text-sm font-semibold text-slate-800 truncate">/{consonant.sound}/</div>
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold whitespace-nowrap">Meaning</div>
              <div className="text-sm font-semibold text-slate-800 capitalize truncate">{consonant.meaning}</div>
            </div>
          </div>

          {/* play audio */}
          <button
            type="button"
            onClick={playAudio}
            className="mt-2.5 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-semibold text-sm transition-transform active:scale-[0.97]"
            style={{ background: style.accent, color: "#1e293b" }}
          >
            {audioState === "playing" ? (
              <>
                <svg viewBox="0 0 24 24" className="w-4 h-4 animate-pulse" fill="currentColor">
                  <rect x="6" y="6" width="4" height="12" rx="1" />
                  <rect x="14" y="6" width="4" height="12" rx="1" />
                </svg>
                Playing…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {audioState === "error" ? "Try again" : "Play sound"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export { Flashcard };
