import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CLASS_STYLES } from '@/data/consonants';
import { STROKES } from '@/data/strokes';
import { SFX } from '@/lib/sfx';
import { playClip } from '@/lib/audio';

// =====================================================================
// Tracing Practice — two-phase: DEMO (watch stroke order) → TRACE.
//
// Behavior depends on whether stroke data exists for the current letter
// (STROKES — see strokes.js):
//
//   - WITH stroke data: demo auto-plays on open, drawing each stroke in
//     correct order with brand colors:
//        * current stroke = orange (#ffbd59) with subtle glow
//        * completed strokes = blue (#7cc9f5), persistent
//        * pending strokes = light gray guide outline
//     Each stroke shows a numbered badge at its start and a small arrow
//     at its end indicating direction. After the demo, students can hit
//     "Start tracing" to switch to the canvas.
//
//   - WITHOUT stroke data: we never fake an order. A "Stroke order
//     coming soon" notice appears and students can still free-trace.
//
// All consonants support free-tracing — coverage is scored against the
// rendered letter shape (works without stroke data).
// =====================================================================
const SPEED = {
  normal: { stroke: 1100, pause: 280, label: "Normal" },
  slow:   { stroke: 1900, pause: 450, label: "Slow"   }
};
const COLOR_CURRENT   = "#ffbd59";
const COLOR_COMPLETED = "#7cc9f5";
const COLOR_GUIDE     = "var(--trace-guide)";

function WritingPractice({ consonants }) {
  const [filter, setFilter] = useState("all");
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("trace");        // "demo" | "trace"
  const [speed, setSpeed] = useState("normal");
  const [demoKey, setDemoKey] = useState(0);
  const [audioError, setAudioError] = useState(null);
  const audioRef = useRef(null);

  const list = filter === "all" ? consonants : consonants.filter(c => c.class === filter);
  const consonant = list[idx % list.length] || consonants[0];
  const style = CLASS_STYLES[consonant.class];

  const rawStrokes = (STROKES && STROKES[consonant.letter]) || { strokes: [] };
  const strokes = useMemo(
    () => [...(rawStrokes.strokes || [])].sort((a, b) => (a.id || a.order || 0) - (b.id || b.order || 0)),
    [rawStrokes]
  );
  const viewBox = rawStrokes.viewBox || "0 0 100 100";
  const hasStrokes = strokes.length > 0;

  // Tracing canvas state
  const [coverage, setCoverage] = useState(0);
  const [celebrated, setCelebrated] = useState(false);

  // Reset when letter changes
  useEffect(() => {
    setPhase("trace");
    setCoverage(0);
    setCelebrated(false);
    setDemoKey(k => k + 1);
    setAudioError(null);
  }, [consonant.letter]);

  const playSound = () => {
    if (SFX) SFX.click();
    setAudioError(null);
    const url = consonant.audio;
    if (!url || url.includes("PASTE_")) {
      setAudioError("Audio not available");
      return;
    }
    // Normalized playback so it matches tone + speaking loudness.
    playClip(url).catch(() => setAudioError("Couldn't play"));
  };

  const next = () => { if (SFX) SFX.click(); setIdx(i => (i + 1) % list.length); };
  const prev = () => { if (SFX) SFX.click(); setIdx(i => (i - 1 + list.length) % list.length); };
  const replayDemo = () => { setPhase("demo"); setDemoKey(k => k + 1); };
  const startTracing = () => { if (SFX) SFX.click(); setPhase("trace"); };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
      {/* Compact hero */}
      <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-sm mb-1">
            <span>✍️</span> Writing Practice
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
            {phase === "demo" ? "Watch each stroke." : "Write the letter."}
          </h1>
        </div>
        {/* Class filter — inline on the right */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all",    label: "All" },
            { id: "Middle", label: "Mid" },
            { id: "High",   label: "High" },
            { id: "Low",    label: "Low" }
          ].map(o => (
            <button
              key={o.id}
              onClick={() => { setFilter(o.id); setIdx(0); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === o.id ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600 hover:text-slate-900"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-3 sm:p-4"
           style={{ boxShadow: `0 20px 50px -25px ${style.ring}` }}>
        {/* STICKY nav bar — Prev | letter | Next + Hear Sound. Stays pinned
            below the app header so you never scroll back up to change letters. */}
        <div className="trace-stickybar sticky top-[92px] sm:top-[68px] z-20 -mx-3 sm:-mx-4 px-3 sm:px-4 pt-1 pb-2 mb-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-t-[24px]">
          <div className="flex items-center gap-2">
            <button onClick={prev} aria-label="Previous letter"
              className="shrink-0 w-11 h-11 grid place-items-center rounded-full bg-white border-2 border-slate-200 dark:bg-slate-700 dark:border-slate-600 text-lg font-bold text-slate-700 dark:text-slate-100 active:scale-95 transition-transform">
              ←
            </button>

            <div className="flex-1 min-w-0 flex items-center justify-center gap-2">
              <div className="om-soft w-11 h-11 rounded-2xl grid place-items-center font-mali text-2xl shrink-0"
                   style={{ background: style.bg, color: style.accent }}>
                {consonant.letter}
              </div>
              <div className="min-w-0 text-center">
                <div className="font-mali font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-tight truncate">{consonant.name}</div>
                <span
                  className="roman-pill inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full font-bold italic text-base sm:text-lg text-slate-900"
                  style={{ background: "#FFEFD6" }}>
                  {consonant.roman}
                </span>
              </div>
              <span
                className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                style={{ background: style.badgeBg, color: style.badgeText }}>
                {style.label}
              </span>
            </div>

            <button onClick={next} aria-label="Next letter"
              className="shrink-0 w-11 h-11 grid place-items-center rounded-full text-lg font-bold text-slate-900 shadow-md active:scale-95 transition-transform"
              style={{ background: "#ffbd59" }}>
              →
            </button>
          </div>

          <div className="mt-2 flex items-center justify-center gap-2">
            <button onClick={playSound}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm text-slate-900 shadow active:scale-95 transition-all min-h-[44px]"
              style={{ background: style.accent }}>
              🔊 Hear Sound
            </button>
            {hasStrokes && (
              <button onClick={replayDemo}
                className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#E6F4FE] text-[#0c4a6e] dark:bg-slate-700 dark:text-slate-100 font-bold text-sm active:scale-95 transition-all min-h-[44px]">
                ▶ {phase === "demo" ? "Replay" : "Demo"}
              </button>
            )}
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold ml-1">{(idx % list.length) + 1}/{list.length}</span>
          </div>
        </div>

        {/* Phase switcher pills (only when strokes exist) */}
        {hasStrokes && (
          <div className="flex items-center gap-1.5 mb-2 p-1 rounded-full bg-slate-100 dark:bg-slate-700 w-max mx-auto">
            <button
              onClick={() => { setPhase("trace"); }}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                phase === "trace" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow" : "text-slate-600 dark:text-slate-300"
              }`}>
              ✍️ Write
            </button>
            <button
              onClick={() => { setPhase("demo"); setDemoKey(k => k + 1); }}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                phase === "demo" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow" : "text-slate-600 dark:text-slate-300"
              }`}>
              👁 Watch demo
            </button>
          </div>
        )}

        {/* DEMO phase */}
        {hasStrokes && phase === "demo" && (
          <StrokeOrderDemo
            key={`demo-${consonant.letter}-${demoKey}-${speed}`}
            strokes={strokes}
            viewBox={viewBox}
            timing={SPEED[speed]}
            bg={style.bgFront}
            onFinished={() => { if (SFX) SFX.complete && SFX.complete(); }}
          />
        )}

        {/* No-data notice — secondary, lighter, moved to bottom of card below */}

        {/* TRACE phase (or always-on when no strokes) */}
        {(phase === "trace" || !hasStrokes) && (
          <TraceCanvas
            consonant={consonant}
            style={style}
            coverage={coverage}
            setCoverage={setCoverage}
            celebrated={celebrated}
            setCelebrated={setCelebrated}
          />
        )}

        {/* Bottom control — playback speed (demo mode only). Prev/Next now
            live in the sticky bar above the canvas. */}
        {hasStrokes && phase === "demo" && (
          <div className="mt-3 flex items-center justify-center gap-1 p-1 rounded-full bg-slate-100 dark:bg-slate-700 w-max mx-auto">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 px-2">Speed:</span>
            {Object.entries(SPEED).map(([k, s]) => (
              <button key={k} onClick={() => { setSpeed(k); setDemoKey(d => d + 1); }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  speed === k ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow" : "text-slate-600 dark:text-slate-300"
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        )}
        {audioError && (
          <div className="mt-2 text-xs text-rose-500 font-semibold">{audioError}</div>
        )}

        {/* Stroke order coming soon — soft footnote at bottom */}
        {!hasStrokes && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-center text-[11px] text-slate-400 dark:text-slate-500 italic">
            Stroke order for this letter coming soon ·
            <span className="font-thai ml-1">ลำดับการลากเส้นจะเพิ่มเร็ว ๆ นี้</span>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// StrokeOrderDemo — animates each path in order:
//   * current stroke = orange + glow
//   * completed = blue, persistent
//   * pending = light gray guide outline
// =====================================================================
function StrokeOrderDemo({ strokes, viewBox, timing, bg, onFinished }) {
  const [active, setActive] = useState(-1); // index of currently-drawing
  const [completed, setCompleted] = useState(new Set());
  const refs = useRef([]);
  refs.current = [];

  useEffect(() => {
    let cancelled = false;
    const drawIndex = (i) => {
      if (cancelled) return;
      if (i >= strokes.length) {
        setActive(-1);
        if (onFinished) onFinished();
        return;
      }
      setActive(i);
      const el = refs.current[i];
      if (el) {
        el.style.transition = "none";
        const len = el.getTotalLength ? el.getTotalLength() : 1000;
        el.style.strokeDasharray = len;
        el.style.strokeDashoffset = len;
        // force layout flush
        // eslint-disable-next-line no-unused-expressions
        el.getBoundingClientRect();
        el.style.transition = `stroke-dashoffset ${timing.stroke}ms cubic-bezier(0.5, 0.1, 0.3, 1)`;
        el.style.strokeDashoffset = 0;
      }
      setTimeout(() => {
        if (cancelled) return;
        setCompleted(prev => {
          const n = new Set(prev); n.add(i); return n;
        });
        setTimeout(() => drawIndex(i + 1), timing.pause);
      }, timing.stroke);
    };
    // Reset
    setActive(-1);
    setCompleted(new Set());
    const t = setTimeout(() => drawIndex(0), 350);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line
  }, [strokes, timing]);

  return (
    <div className="om-soft relative mb-3 rounded-3xl p-4 sm:p-6 grid place-items-center"
         style={{ background: bg }}>
      <div className="absolute top-3 left-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
        Stroke order
      </div>
      <div className="absolute top-3 right-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
        {active >= 0 ? `${active + 1} / ${strokes.length}` : `${strokes.length} strokes`}
      </div>

      <svg viewBox={viewBox} className="w-44 h-44 sm:w-56 sm:h-56" fill="none">
        <defs>
          <filter id="stroke-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.8" />
          </filter>
        </defs>

        {/* Guide outlines for all strokes — light gray */}
        {strokes.map((s, i) => (
          <path key={`g-${i}`} d={s.path} stroke={COLOR_GUIDE}
                strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* Active/completed paths */}
        {strokes.map((s, i) => {
          const isCompleted = completed.has(i) && i !== active;
          const isCurrent = i === active;
          if (!isCurrent && !isCompleted) return null;
          return (
            <g key={`a-${i}`}>
              {isCurrent && (
                <path d={s.path}
                      stroke={COLOR_CURRENT} strokeWidth="8"
                      strokeLinecap="round" strokeLinejoin="round"
                      opacity="0.45"
                      filter="url(#stroke-glow)"
                      ref={el => { if (el) refs.current[`glow-${i}`] = el; }} />
              )}
              <path d={s.path}
                    ref={el => {
                      if (el && isCurrent) refs.current[i] = el;
                    }}
                    stroke={isCurrent ? COLOR_CURRENT : COLOR_COMPLETED}
                    strokeWidth="7"
                    strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}

        {/* Stroke numbers + direction arrows */}
        {strokes.map((s, i) => {
          const isActive = i === active;
          const isDone = completed.has(i) && !isActive;
          const isPending = !isActive && !isDone;
          const isNext = isPending && (active === -1 ? i === 0 : i === active + 1 && active < strokes.length - 1);
          return (
            <StrokeNumber
              key={`n-${i}`}
              stroke={s}
              index={i + 1}
              state={isActive ? "active" : isDone ? "done" : isNext ? "next" : "pending"}
            />
          );
        })}
        {active >= 0 && (
          <DirectionArrow d={strokes[active].path} color={COLOR_CURRENT} />
        )}
      </svg>
    </div>
  );
}

// Starting-point marker at the beginning of each stroke. Filled,
// high-contrast, with a pulse on whichever stroke is next to draw.
function StrokeNumber({ stroke, index, state }) {
  // Prefer explicit startPoint; fall back to parsing first M from path.
  let x, y;
  if (stroke.startPoint) {
    x = stroke.startPoint.x; y = stroke.startPoint.y;
  } else {
    const m = (stroke.path || "").match(/M\s*(-?[\d.]+)[ ,]\s*(-?[\d.]+)/);
    if (!m) return null;
    x = parseFloat(m[1]); y = parseFloat(m[2]);
  }

  let fill, textFill, ring;
  if (state === "active")      { fill = COLOR_CURRENT;   textFill = "#1e293b"; ring = COLOR_CURRENT; }
  else if (state === "next")   { fill = COLOR_CURRENT;   textFill = "#1e293b"; ring = COLOR_CURRENT; }
  else if (state === "done")   { fill = COLOR_COMPLETED; textFill = "#ffffff"; ring = COLOR_COMPLETED; }
  else                          { fill = "#cbd5e1";       textFill = "#475569"; ring = "#cbd5e1"; }

  const pulsing = state === "active" || state === "next";

  return (
    <g transform={`translate(${x}, ${y})`}>
      {pulsing && (
        <circle r="4.5" fill="none" stroke={ring} strokeWidth="1" opacity="0.7">
          <animate attributeName="r" from="4.5" to="9" dur="1.3s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.7" to="0" dur="1.3s" repeatCount="indefinite" />
        </circle>
      )}
      <circle r="4.5" fill={fill} stroke="white" strokeWidth="1.4" />
      <text x="0" y="0.5" textAnchor="middle" dominantBaseline="middle"
            fontSize="4.5" fill={textFill} fontWeight="900">{index}</text>
    </g>
  );
}

// Direction arrow at the end of the active stroke
function DirectionArrow({ d, color }) {
  const [arrow, setArrow] = useState(null);

  useEffect(() => {
    // Render path into hidden SVG to measure endpoint and tangent
    const svgNS = "http://www.w3.org/2000/svg";
    const tmpSvg = document.createElementNS(svgNS, "svg");
    const tmpPath = document.createElementNS(svgNS, "path");
    tmpPath.setAttribute("d", d);
    tmpSvg.appendChild(tmpPath);
    document.body.appendChild(tmpSvg);
    const len = tmpPath.getTotalLength();
    if (len > 1) {
      const p = tmpPath.getPointAtLength(len);
      const pPrev = tmpPath.getPointAtLength(Math.max(0, len - 2));
      const angle = Math.atan2(p.y - pPrev.y, p.x - pPrev.x) * (180 / Math.PI);
      setArrow({ x: p.x, y: p.y, angle });
    }
    document.body.removeChild(tmpSvg);
  }, [d]);

  if (!arrow) return null;
  return (
    <g transform={`translate(${arrow.x}, ${arrow.y}) rotate(${arrow.angle})`}>
      <polygon points="0,0 -5.5,-3.5 -5.5,3.5" fill={color} stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
    </g>
  );
}

// =====================================================================
// TraceCanvas — finger / mouse / stylus tracing with coverage scoring
// =====================================================================
function TraceCanvas({ consonant, style, coverage, setCoverage, celebrated, setCelebrated }) {  const drawRef = useRef(null);
  const targetRef = useRef(null);
  const drawing = useRef(false);
  const lastPt = useRef(null);
  const gestureRef = useRef("idle");   // idle | pending | draw | scroll
  const startPtRef = useRef(null);
  const targetPixelsRef = useRef(0);
  const dprRef = useRef(1);

  const buildTarget = () => {
    const dc = drawRef.current, tc = targetRef.current;
    if (!dc || !tc) return;
    const rect = dc.getBoundingClientRect();
    if (rect.width === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;
    [dc, tc].forEach(c => { c.width = rect.width * dpr; c.height = rect.height * dpr; });
    const dctx = dc.getContext("2d");
    dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dctx.lineCap = "round"; dctx.lineJoin = "round";

    const tctx = tc.getContext("2d");
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tctx.clearRect(0, 0, rect.width, rect.height);
    // Use alphabetic baseline so descenders (ฎ ฏ ญ etc) fit inside the canvas.
    // Place baseline in the lower half so the descender has vertical room.
    const size = Math.min(rect.width, rect.height) * 0.68;
    tctx.fillStyle = "#000";
    tctx.font = `${size}px Mali, Sarabun, "Noto Sans Thai", sans-serif`;
    tctx.textAlign = "center";
    tctx.textBaseline = "alphabetic";
    const baselineY = rect.height * 0.72;
    tctx.fillText(consonant.letter, rect.width / 2, baselineY);
    [[-6,0],[6,0],[0,-6],[0,6],[-4,-4],[4,-4],[-4,4],[4,4]]
      .forEach(([dx,dy]) => tctx.fillText(consonant.letter, rect.width/2 + dx, baselineY + dy));

    const img = tctx.getImageData(0, 0, tc.width, tc.height);
    let on = 0;
    for (let i = 3; i < img.data.length; i += 4) if (img.data[i] > 30) on++;
    targetPixelsRef.current = on;
  };

  useEffect(() => {
    const dc = drawRef.current;
    if (!dc) return;
    const ro = new ResizeObserver(() => {
      setCoverage(0);
      setCelebrated(false);
      buildTarget();
    });
    ro.observe(dc);
    return () => ro.disconnect();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setCoverage(0);
    setCelebrated(false);
    requestAnimationFrame(buildTarget);
    // eslint-disable-next-line
  }, [consonant.letter]);

  const computeCoverage = () => {
    const dc = drawRef.current, tc = targetRef.current;
    if (!dc || !tc || targetPixelsRef.current === 0) return 0;
    const dImg = dc.getContext("2d").getImageData(0, 0, dc.width, dc.height).data;
    const tImg = tc.getContext("2d").getImageData(0, 0, tc.width, tc.height).data;
    let overlap = 0;
    for (let i = 3; i < dImg.length; i += 4) {
      if (dImg[i] > 30 && tImg[i] > 30) overlap++;
    }
    return Math.round(Math.min(1, overlap / targetPixelsRef.current) * 100);
  };

  const getPos = (e) => {
    const rect = drawRef.current.getBoundingClientRect();
    const isTouch = e.touches && e.touches.length > 0;
    const pt = isTouch ? e.touches[0] : e;
    return { x: pt.clientX - rect.left, y: pt.clientY - rect.top };
  };

  const drawSegment = (pt) => {
    const ctx = drawRef.current.getContext("2d");
    ctx.strokeStyle = style.accent;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(lastPt.current.x, lastPt.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPt.current = pt;
  };

  const finishStroke = () => {
    if (!drawing.current) return;
    drawing.current = false;
    lastPt.current = null;
    const c = computeCoverage();
    setCoverage(c);
    if (c >= 80 && !celebrated) {
      setCelebrated(true);
      if (SFX) SFX.reward();
    }
  };

  // ---- Mouse: draw immediately (desktop has no scroll conflict) ----
  const mouseDown = (e) => {
    e.preventDefault();
    drawing.current = true;
    lastPt.current = getPos(e);
    if (SFX) SFX.click();
  };
  const mouseMove = (e) => {
    if (!drawing.current) return;
    drawSegment(getPos(e));
  };
  const mouseUp = () => finishStroke();

  // ---- Touch: discriminate scroll vs draw so the PAGE can still scroll ----
  // We don't start drawing on touchstart. On the first meaningful move we
  // decide: a mostly-vertical swipe is a SCROLL (we let the browser handle
  // it — touch-action: pan-y), anything else is a DRAW. If the browser has
  // already claimed the gesture for scrolling, its moves arrive
  // non-cancelable, which we treat as a scroll too.
  const touchStart = (e) => {
    const pt = getPos(e);
    startPtRef.current = pt;
    lastPt.current = pt;
    gestureRef.current = "pending";
  };
  const touchMove = (e) => {
    if (gestureRef.current === "scroll") return;
    if (e.cancelable === false) { gestureRef.current = "scroll"; return; }
    const pt = getPos(e);
    if (gestureRef.current === "pending") {
      const dx = pt.x - startPtRef.current.x;
      const dy = pt.y - startPtRef.current.y;
      if (Math.hypot(dx, dy) < 8) return;          // wait for clear intent
      if (Math.abs(dy) > Math.abs(dx) * 1.4) {     // mostly vertical → scroll
        gestureRef.current = "scroll";
        return;
      }
      gestureRef.current = "draw";
      drawing.current = true;
      if (SFX) SFX.click();
      lastPt.current = startPtRef.current;
    }
    if (gestureRef.current === "draw") {
      e.preventDefault();
      drawSegment(pt);
    }
  };
  const touchEnd = () => {
    if (gestureRef.current === "draw") finishStroke();
    gestureRef.current = "idle";
    drawing.current = false;
    lastPt.current = null;
  };

  const clear = () => {
    const dc = drawRef.current;
    if (!dc) return;
    const ctx = dc.getContext("2d");
    const dpr = dprRef.current || 1;
    ctx.clearRect(0, 0, dc.width / dpr, dc.height / dpr);
    setCoverage(0);
    setCelebrated(false);
  };

  let tier = null;
  if (coverage >= 90) tier = { msg: "ยอดเยี่ยม! Perfect tracing!", color: "#16a34a", emoji: "🏆" };
  else if (coverage >= 70) tier = { msg: "เก่งมาก! Great trace!", color: "#7cc9f5", emoji: "🌟" };
  else if (coverage >= 40) tier = { msg: "ดีมาก! Keep going!", color: "#ffbd59", emoji: "💪" };
  else if (coverage > 0)   tier = { msg: "Trace inside the letter outline", color: "#94a3b8", emoji: "✍️" };

  return (
    <>
      <div
        className="trace-surface trace-canvas-box relative w-full rounded-3xl overflow-hidden"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(15,23,42,0.04) 0 1px, transparent 1px 32px), " +
            "repeating-linear-gradient(90deg, rgba(15,23,42,0.04) 0 1px, transparent 1px 32px), " +
            style.bgFront
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="trace-cross absolute left-1/2 top-0 bottom-0 -translate-x-px w-px" style={{ background: "rgba(15,23,42,0.07)" }} />
          <div className="trace-cross absolute top-1/2 left-0 right-0 -translate-y-px h-px" style={{ background: "rgba(15,23,42,0.07)" }} />
        </div>
        <div className="absolute inset-0 grid place-items-center pointer-events-none select-none">
          <span className="trace-ghost font-mali"
                style={{
                  fontSize: "min(58vw, 17rem)",
                  lineHeight: "1.3",
                  color: "rgba(15,23,42,0.12)",
                  paddingBottom: "0.15em"
                }}>
            {consonant.letter}
          </span>
        </div>
        <canvas ref={targetRef} className="absolute inset-0 w-full h-full opacity-0 pointer-events-none" />
        <canvas
          ref={drawRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          style={{ touchAction: "pan-y" }}
          onMouseDown={mouseDown} onMouseMove={mouseMove} onMouseUp={mouseUp} onMouseLeave={mouseUp}
          onTouchStart={touchStart} onTouchMove={touchMove} onTouchEnd={touchEnd} onTouchCancel={touchEnd}
        />
        {celebrated && (
          <div className="absolute inset-0 pointer-events-none grid place-items-center">
            <span className="text-7xl float-up">{tier?.emoji || "🎉"}</span>
          </div>
        )}
      </div>

      {/* Coverage meter (compact) */}
      <div className="mt-2 flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
               style={{ width: `${coverage}%`, background: "linear-gradient(90deg, #7cc9f5, #ffbd59)" }} />
        </div>
        <div className="text-[11px] font-bold whitespace-nowrap" style={{ color: tier?.color || "#94a3b8" }}>
          {coverage}% {tier ? tier.emoji : ""}
        </div>
        <button onClick={clear}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100 font-bold text-xs hover:bg-slate-200 active:scale-95 transition-all min-h-[36px]">
          ↺ Clear
        </button>
      </div>
      {tier && (
        <div className="mt-1 text-xs font-semibold" style={{ color: tier.color }}>
          {tier.msg}
        </div>
      )}
      {/* Mobile hint: how touch is interpreted, so scrolling feels natural */}
      <div className="sm:hidden mt-1 text-[11px] text-slate-400 dark:text-slate-500 text-center">
        Drag to trace · swipe up/down to scroll
      </div>
    </>
  );
}

export { WritingPractice };
