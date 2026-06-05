import React, { useEffect, useMemo, useState } from 'react';
import { CONSONANTS, CLASS_STYLES } from '@/data/consonants';
import { SFX } from '@/lib/sfx';
import { Flashcard } from '@/components/Flashcard';
import { WritingPractice } from '@/components/WritingPractice';
import { SpeakingPractice } from '@/components/SpeakingPractice';
import { Quiz, QuizResults, Confetti } from '@/components/Quiz';
import { ToneQuiz, ToneQuizLanding, ToneContour } from '@/components/ToneQuiz';

// =====================================================================
// Main App — navigation, sub-mode tabs, mute toggle, view routing.
// =====================================================================
// ---------------- shared sub-tab component ----------------
function SubTabs({ value, onChange, options }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      <div className="inline-flex p-1 rounded-full bg-white shadow-sm border border-slate-100">
        {options.map(o => (
          <button
            key={o.id}
            onClick={() => { onChange(o.id); SFX && SFX.click(); }}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              value === o.id ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="mr-1">{o.icon}</span>{o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MuteToggle() {
  const [muted, setMuted] = useState(SFX ? SFX.isMuted() : false);
  useEffect(() => {
    const h = (e) => setMuted(e.detail);
    window.addEventListener("ezthai-mute-change", h);
    return () => window.removeEventListener("ezthai-mute-change", h);
  }, []);
  return (
    <button
      onClick={() => SFX && SFX.toggleMute()}
      className="w-10 h-10 rounded-full bg-white shadow-sm grid place-items-center hover:bg-slate-50 active:scale-95 transition-all"
      title={muted ? "Unmute sounds" : "Mute sounds"}
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
    >
      {muted ? (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9"  x2="17" y2="15" />
          <line x1="17" y1="9"  x2="23" y2="15" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M15.5 8.5a5 5 0 010 7" />
          <path d="M18.5 5.5a9 9 0 010 13" />
        </svg>
      )}
    </button>
  );
}

function DarkModeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const apply = (d) => {
    if (d) document.documentElement.classList.add("dark");
    else   document.documentElement.classList.remove("dark");
    try { localStorage.setItem("ezthai-theme", d ? "dark" : "light"); } catch (e) {}
    setDark(d);
  };
  return (
    <button
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => { apply(!dark); if (SFX) SFX.click(); }}
      className="relative inline-flex items-center w-[72px] sm:w-[80px] h-9 sm:h-10 rounded-full shadow-inner ring-2 ring-white/60 dark:ring-slate-900/40 transition-colors duration-300 active:scale-95"
      style={{ background: dark ? "#0f172a" : "#7cc9f5" }}
    >
      {/* Track icons */}
      <span className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 text-base sm:text-lg select-none"
            style={{ opacity: dark ? 0.4 : 1 }}>
        ☀️
      </span>
      <span className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 text-base sm:text-lg select-none"
            style={{ opacity: dark ? 1 : 0.4 }}>
        🌕
      </span>
      {/* Sliding knob */}
      <span
        className="absolute top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-md transition-all duration-300"
        style={{
          left: dark ? "calc(100% - 32px - 4px)" : "4px",
          background: dark ? "#ffbd59" : "#ffffff"
        }}
      />
    </button>
  );
}

function Navigation({ view, setView }) {
  const tabs = [
    { id: "flashcards", label: "Flashcards", icon: "📇" },
    { id: "practice",   label: "Practice",   icon: "✍️" },
    { id: "quiz",       label: "Quiz",       icon: "🎯" },
    { id: "tones",      label: "Tones",      icon: "🎵" },
    { id: "sentences",  label: "Sentences",  icon: "💬" },
    { id: "about",      label: "About",      icon: "👩‍🏫" }
  ];

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/85 border-b border-white/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <button
          onClick={() => { setView("flashcards"); SFX && SFX.click(); }}
          className="flex items-center gap-2.5 group"
        >
          <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-2xl overflow-hidden shadow-md ring-2 ring-white"
               style={{ background: "#FFEFD6" }}>
            <img src="/khruu-nui.png" alt="Khruu Nui"
                 className="w-full h-full object-cover object-center scale-105" />
          </div>
          <div className="leading-tight text-left">
            <div className="font-extrabold text-slate-800 text-[15px] sm:text-base">EZ Thai</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 -mt-0.5">with Khruu Nui</div>
          </div>
        </button>

        {/* Desktop tabs */}
        <nav className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-slate-100/80">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setView(t.id); SFX && SFX.click(); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                view === t.id ? "bg-white shadow text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="mr-1.5">{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <MuteToggle />
        </div>
      </div>

      {/* Mobile bottom-ish tabs */}
      <nav className="sm:hidden flex items-center justify-around px-2 pb-1.5 gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setView(t.id); SFX && SFX.click(); }}
            className={`flex-1 min-w-[54px] py-1.5 rounded-xl text-[11px] font-semibold transition-all min-h-[44px] ${
              view === t.id ? "bg-slate-900 text-white shadow" : "bg-slate-100 text-slate-600"
            }`}
          >
            <div className="text-sm leading-none mb-0.5">{t.icon}</div>{t.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

// ---------------- Flashcards ----------------
function ClassFilter({ value, onChange, counts }) {
  const opts = [
    { id: "all",    label: "All",    color: "#1e293b", bg: "#ffffff" },
    { id: "Middle", label: "Middle", color: "#0c4a6e", bg: "#E6F4FE" },
    { id: "High",   label: "High",   color: "#14532d", bg: "#E3F6E8" },
    { id: "Low",    label: "Low",    color: "#7c2d12", bg: "#FFEFD6" }
  ];
  return (
    <div className="flex gap-1.5 sm:flex-wrap sm:gap-2 items-center w-full sm:w-auto">
      {opts.map(o => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => { onChange(o.id); SFX && SFX.click(); }}
            className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border-2 min-h-[42px] sm:min-h-[44px] ${
              active ? "shadow-md scale-[1.02]" : "border-transparent opacity-80 hover:opacity-100"
            }`}
            style={{
              background: active ? o.bg : "rgba(255,255,255,0.85)",
              color: o.color,
              borderColor: active ? o.color + "22" : "transparent"
            }}
          >
            {o.label}
            <span className="ml-1 sm:ml-1.5 text-[10px] sm:text-xs opacity-60">({counts[o.id] ?? 0})</span>
          </button>
        );
      })}
    </div>
  );
}

function FlashcardsView() {
  const consonants = CONSONANTS;
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => ({
    all: consonants.length,
    Middle: consonants.filter(c => c.class === "Middle").length,
    High:   consonants.filter(c => c.class === "High").length,
    Low:    consonants.filter(c => c.class === "Low").length
  }), [consonants]);

  const filtered = useMemo(() => {
    let list = consonants;
    if (filter !== "all") list = list.filter(c => c.class === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c =>
        c.letter.includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.roman.toLowerCase().includes(q) ||
        c.sound.toLowerCase().includes(q) ||
        c.meaning.toLowerCase().includes(q)
      );
    }
    return list;
  }, [consonants, filter, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-10">
      <div className="mb-3 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-xs font-semibold text-slate-600 shadow-sm mb-2 sm:mb-3">
          <span className="w-2 h-2 rounded-full" style={{ background: "#ffbd59" }} />
          44 Thai consonants
        </div>
        <h1 className="text-xl sm:text-5xl font-extrabold text-slate-800 leading-tight">
          Learn the Thai alphabet, one card at a time.
        </h1>
        {/* Description shows in the hero on desktop only; on mobile it moves below the cards */}
        <p className="hidden sm:block mt-2 text-slate-600 max-w-xl">
          Tap any card to flip it open and hear the sound. Filter by class to focus your practice.
        </p>
      </div>

      <div className="bg-white/60 backdrop-blur rounded-2xl sm:rounded-3xl p-2 sm:p-5 mb-3 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between shadow-sm">
        <ClassFilter value={filter} onChange={setFilter} counts={counts} />
        {/* Search lives in the bar on desktop; on mobile it moves below the cards */}
        <div className="relative hidden sm:block">
          <svg viewBox="0 0 24 24" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search letters, sounds, meaning…"
            className="w-full sm:w-72 pl-9 pr-3 py-3 rounded-full bg-white border-2 border-transparent focus:border-[#7cc9f5] outline-none text-sm font-medium placeholder:text-slate-400" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-5xl mb-2">🔍</div>
          No consonants match — try another search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map(c => <Flashcard key={c.letter + c.name} consonant={c} />)}
        </div>
      )}

      {/* Mobile-only: search + intro sit below the cards so a flashcard is visible immediately */}
      <div className="sm:hidden mt-5 space-y-3">
        <div className="relative">
          <svg viewBox="0 0 24 24" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search letters, sounds, meaning…"
            className="w-full pl-9 pr-3 py-3 rounded-full bg-white border-2 border-transparent focus:border-[#7cc9f5] outline-none text-sm font-medium placeholder:text-slate-400" />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Tap any card to flip it open and hear the sound. Filter by class to focus your practice.
        </p>
      </div>
    </div>
  );
}

// ---------------- Practice container ----------------
function PracticeView() {
  const [mode, setMode] = useState("record");
  return (
    <>
      <SubTabs value={mode} onChange={setMode} options={[
        { id: "record",  label: "Speak",   icon: "🎙️" },
        { id: "writing", label: "Writing", icon: "✍️" }
      ]} />
      {mode === "record"  && <SpeakingPractice consonants={CONSONANTS} />}
      {mode === "writing" && <WritingPractice consonants={CONSONANTS} />}
    </>
  );
}

// ---------------- Quiz container ----------------
function QuizLanding({ onStart, kind = "consonant" }) {
  const [length, setLength] = useState(10);
  const isClass = kind === "class";
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center">
      <div className="inline-block text-7xl sm:text-8xl mb-4 bounce-pop">{isClass ? "🔑" : "🎯"}</div>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">
        {isClass ? "Consonant Class Quiz" : "Consonant Quiz"}
      </h1>
      <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
        {isClass
          ? "We'll show a Thai consonant — you pick Middle, High, or Low class. Keep trying until you get it right."
          : "We'll show a Thai consonant — you pick the correct romanization. Keep trying until you get it right."}
      </p>
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_18px_40px_-20px_rgba(124,201,245,0.6)]">
        <div className="text-sm font-semibold text-slate-500 dark:text-slate-300 mb-3">How many questions?</div>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { n: 5,  label: "5",  hint: "Quick"    },
            { n: 10, label: "10", hint: "Standard" },
            { n: 20, label: "20", hint: "Long"     },
            { n: 44, label: "44", hint: "All cons."}
          ].map(opt => (
            <button key={opt.n} onClick={() => { setLength(opt.n); SFX && SFX.click(); }}
              className={`py-3 rounded-2xl font-bold transition-all border-2 min-h-[56px] ${
                length === opt.n ? "border-[#7cc9f5] bg-[#E6F4FE] text-slate-900 scale-[1.04]"
                                 : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300"
              }`}>
              <div className="text-lg leading-none">{opt.label}</div>
              <div className="text-[10px] font-semibold opacity-70 mt-0.5">{opt.hint}</div>
            </button>
          ))}
        </div>
        <button onClick={() => { onStart(length); SFX && SFX.click(); }}
          className="w-full py-4 rounded-full font-extrabold text-lg text-slate-900 shadow-lg shadow-orange-200 active:scale-[0.98] transition-transform"
          style={{ background: "#ffbd59" }}>
          Start {isClass ? "Class " : ""}Quiz →
        </button>
      </div>
    </div>
  );
}

function QuizView() {
  const [mode, setMode] = useState("consonants");
  const [active, setActive] = useState(null);
  useEffect(() => { setActive(null); }, [mode]);
  return (
    <>
      <SubTabs value={mode} onChange={setMode} options={[
        { id: "consonants", label: "Consonants", icon: "🎯" },
        { id: "classes",    label: "Classes",    icon: "🔑" },
        { id: "tones",      label: "Tones",      icon: "🎵" }
      ]} />
      {mode === "consonants" && (
        active && active.kind === "consonants"
          ? <Quiz consonants={CONSONANTS} totalQuestions={active.length} kind="consonant" onExit={() => setActive(null)} />
          : <QuizLanding kind="consonant" onStart={(n) => setActive({ kind: "consonants", length: n })} />
      )}
      {mode === "classes" && (
        active && active.kind === "classes"
          ? <Quiz consonants={CONSONANTS} totalQuestions={active.length} kind="class" onExit={() => setActive(null)} />
          : <QuizLanding kind="class" onStart={(n) => setActive({ kind: "classes", length: n })} />
      )}
      {mode === "tones" && (
        active && active.kind === "tones"
          ? <ToneQuiz totalQuestions={active.length} onExit={() => setActive(null)} />
          : <ToneQuizLanding onStart={(n) => setActive({ kind: "tones", length: n })} />
      )}
    </>
  );
}

// ---------------- Standalone top-level Tones view ----------------
function TonesView() {
  const [active, setActive] = useState(null);
  return active
    ? <ToneQuiz totalQuestions={active.length} onExit={() => setActive(null)} />
    : <ToneQuizLanding onStart={(n) => setActive({ length: n })} />;
}

// ---------------- About ----------------
function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="bg-white rounded-[32px] p-8 sm:p-12 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shrink-0 ring-4 ring-white shadow-md"
               style={{ background: "#FFEFD6" }}>
            <img src="/khruu-nui.png" alt="Khruu Nui" className="w-full h-full object-cover object-top" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-1">Sawasdee! I'm Khruu Nui.</h1>
            <p className="text-slate-600">
              EZ Thai is a friendly classroom for total beginners. Start with the 44 consonants,
              then build up to reading whole words. Take your time — short, daily practice works
              better than cramming.
            </p>
          </div>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {[
            { t: "Flip flashcards", d: "Learn each letter — name, sound, class.",       c: "#7cc9f5", icon: "📇" },
            { t: "Hear & speak",    d: "Compare with a reference and record yourself.", c: "#6bcf8a", icon: "🎙️" },
            { t: "Trace & draw",    d: "Build muscle memory with guided practice.",    c: "#ffbd59", icon: "✍️" },
            { t: "Quiz & tones",    d: "Test consonants and the five Thai tones.",      c: "#7cc9f5", icon: "🎯" }
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-4 border-2 border-slate-100 flex gap-3">
              <div className="w-10 h-10 rounded-2xl grid place-items-center text-xl shrink-0"
                   style={{ background: s.c + "22" }}>{s.icon}</div>
              <div>
                <div className="font-bold text-slate-800 mb-0.5">{s.t}</div>
                <div className="text-sm text-slate-600">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- Simple Sentences (Coming Soon) ----------------
function SimpleSentences() {
  const upcoming = [
    { icon: "👂", title: "Listening",      desc: "Hear short Thai sentences spoken at natural speed." },
    { icon: "🗣️", title: "Speaking",        desc: "Record yourself reading sentences and get feedback." },
    { icon: "🌐", title: "Translation",     desc: "Translate beginner sentences — EN ↔ TH." },
    { icon: "💬", title: "Conversation",    desc: "Short dialogues you can practice as either speaker." }
  ];
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="sentences-hero relative rounded-[32px] p-8 sm:p-12 overflow-hidden"
           style={{
             background: "linear-gradient(135deg, #E6F4FE 0%, #FFEFD6 100%)",
             boxShadow: "0 30px 60px -30px rgba(124,201,245,0.45)"
           }}>
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-30" style={{ background: "#ffbd59" }} />
        <div className="absolute -bottom-12 -left-8 w-56 h-56 rounded-full opacity-25" style={{ background: "#7cc9f5" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur text-xs font-bold text-slate-700 shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#ffbd59" }} />
            COMING SOON
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-800 leading-tight">
            Simple <span style={{ color: "#7cc9f5" }}>Sentences</span>
          </h1>
          <p className="mt-3 text-slate-700 max-w-xl text-base sm:text-lg">
            Once you've mastered the consonants, take the next step: listen, read,
            speak, and translate beginner Thai sentences with Khruu Nui.
          </p>
          <p className="mt-1 font-thai text-slate-600">
            เรียนประโยคง่าย ๆ ไปพร้อมกัน!
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            {upcoming.map((u, i) => (
              <div key={i} className="flex gap-3 items-start bg-white/70 backdrop-blur rounded-2xl p-4 border border-white">
                <div className="w-10 h-10 rounded-2xl grid place-items-center text-xl shrink-0"
                     style={{ background: i % 2 ? "#FFEFD6" : "#E6F4FE" }}>
                  {u.icon}
                </div>
                <div>
                  <div className="font-bold text-slate-800">{u.title}</div>
                  <div className="text-sm text-slate-600">{u.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3 items-center">
            <button
              onClick={() => SFX && SFX.click()}
              className="px-6 py-3 rounded-full font-bold text-slate-900 shadow-md active:scale-95 transition-transform"
              style={{ background: "#ffbd59" }}>
              🔔 Notify me when it's ready
            </button>
            <div className="text-xs text-slate-500">
              In the meantime, build your foundation with consonants →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Social + Footer ----------------
function SocialFooter({ onNav }) {
  return (
    <>
      {/* Follow section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-4 sm:mt-8">
        <div className="rounded-[32px] overflow-hidden relative"
             style={{
               background: "linear-gradient(135deg, #7cc9f5 0%, #ffbd59 100%)",
               boxShadow: "0 30px 60px -30px rgba(124,201,245,0.55)"
             }}>
          <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-white/15 pointer-events-none" />
          <div className="absolute -bottom-16 -right-8 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />

          <div className="relative grid md:grid-cols-[auto,1fr] gap-6 sm:gap-8 p-6 sm:p-10 items-center">
            {/* Avatar */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl mx-auto md:mx-0"
                 style={{ background: "#FFEFD6" }}>
              <img src="/khruu-nui.png" alt="Khruu Nui"
                   className="w-full h-full object-cover object-top" />
            </div>

            <div className="text-white text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/25 backdrop-blur text-[11px] font-bold mb-3">
                <span>✨</span> JOIN THE COMMUNITY
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-2 text-white drop-shadow-sm">
                Follow Khruu Nui
              </h2>
              <p className="text-white/95 max-w-xl text-sm sm:text-base mb-5">
                Follow Khruu Nui for more Thai learning tips, lessons,
                pronunciation practice, and daily Thai content!
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start relative z-10">
                <a href="https://instagram.com/khruu_nui" target="_blank" rel="noopener noreferrer"
                   onClick={() => SFX && SFX.click()}
                   className="social-glow social-glow-ig group inline-flex items-center justify-center gap-2.5 px-5 py-3.5 min-h-[56px] rounded-full bg-white text-slate-900 font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all">
                  <span className="w-9 h-9 rounded-full grid place-items-center text-white"
                        style={{ background: "linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)" }}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Instagram</span>
                    <span>@khruu_nui</span>
                  </span>
                </a>
                <a href="https://youtube.com/@EZThaiWithNui" target="_blank" rel="noopener noreferrer"
                   onClick={() => SFX && SFX.click()}
                   className="social-glow social-glow-yt group inline-flex items-center justify-center gap-2.5 px-5 py-3.5 min-h-[56px] rounded-full bg-white text-slate-900 font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all">
                  <span className="w-9 h-9 rounded-full grid place-items-center text-white bg-[#FF0000]">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <path d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5 3-5 3z" />
                    </svg>
                  </span>
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">YouTube</span>
                    <span>@EZThaiWithNui</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 mt-10 mb-6">
        <div className="grid sm:grid-cols-3 gap-6 pt-8 border-t border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-white shadow-sm"
                   style={{ background: "#FFEFD6" }}>
                <img src="/khruu-nui.png" alt="" className="w-full h-full object-cover object-top" />
              </div>
              <div className="leading-tight">
                <div className="font-extrabold text-slate-800">EZ Thai</div>
                <div className="text-[11px] text-slate-500">with Khruu Nui</div>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Friendly Thai lessons for total beginners. Start with the alphabet,
              build to whole conversations.
            </p>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-3">Quick links</div>
            <ul className="space-y-1.5">
              {[
                { id: "flashcards", label: "Flashcards" },
                { id: "practice",   label: "Practice"   },
                { id: "quiz",       label: "Quiz"       },
                { id: "tones",      label: "Tones"      },
                { id: "sentences",  label: "Simple Sentences" },
                { id: "about",      label: "About"      }
              ].map(l => (
                <li key={l.id}>
                  <button
                    onClick={() => { onNav(l.id); SFX && SFX.click(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="text-sm text-slate-600 hover:text-[#7cc9f5] font-semibold transition-colors">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-3">Connect</div>
            <div className="flex gap-2">
              <a href="https://instagram.com/khruu_nui" target="_blank" rel="noopener noreferrer"
                 className="social-glow-ig w-10 h-10 rounded-full grid place-items-center text-white shadow hover:scale-110 transition-transform"
                 style={{ background: "linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)" }}
                 aria-label="Instagram">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </a>
              <a href="https://youtube.com/@EZThaiWithNui" target="_blank" rel="noopener noreferrer"
                 className="social-glow-yt w-10 h-10 rounded-full grid place-items-center text-white shadow hover:scale-110 transition-transform bg-[#FF0000]"
                 aria-label="YouTube">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5 3-5 3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-between items-center text-xs text-slate-500">
          <div>© {new Date().getFullYear()} EZ Thai · All rights reserved.</div>
          <div>Made with <span style={{ color: "#ef4444" }}>❤️</span> by Khruu Nui</div>
        </div>
      </footer>
    </>
  );
}

// ---------------- Root ----------------
function App() {
  const [view, setView] = useState("flashcards");
  return (
    <div className="min-h-screen">
      <Navigation view={view} setView={setView} />
      <main>
        {view === "flashcards" && <FlashcardsView />}
        {view === "practice"   && <PracticeView />}
        {view === "quiz"       && <QuizView />}
        {view === "tones"      && <TonesView />}
        {view === "sentences"  && <SimpleSentences />}
        {view === "about"      && <About />}
      </main>
      <SocialFooter onNav={setView} />
    </div>
  );
}

export default App;
