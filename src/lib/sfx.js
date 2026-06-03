// =====================================================================
// Sound FX — synthesized via Web Audio. Mute state persists to localStorage.
// =====================================================================
let ctx = null;
const ensure = () => {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { return null; }
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

const isMuted = () => localStorage.getItem("ezthai-mute") === "1";
const setMuted = (m) => {
  localStorage.setItem("ezthai-mute", m ? "1" : "0");
  window.dispatchEvent(new CustomEvent("ezthai-mute-change", { detail: m }));
};

// Generic envelope-shaped tone
const beep = (freq, dur = 0.12, type = "sine", vol = 0.18, when = 0) => {
  if (isMuted()) return;
  const a = ensure(); if (!a) return;
  const t0 = a.currentTime + when;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
};

// Multi-point pitch contour — frequencies as fractions of base, played as one note.
const contour = (points, dur = 0.85, type = "sine", vol = 0.24) => {
  if (isMuted()) return;
  const a = ensure(); if (!a) return;
  const t0 = a.currentTime;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  // Schedule each point in sequence
  points.forEach((freq, i) => {
    const at = t0 + (i / (points.length - 1)) * dur;
    if (i === 0) osc.frequency.setValueAtTime(freq, at);
    else osc.frequency.exponentialRampToValueAtTime(Math.max(freq, 40), at);
  });
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.04);
  gain.gain.setValueAtTime(vol, t0 + dur - 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
};

const SFX = {
  // Soft UI click
  click: () => beep(880, 0.05, "square", 0.06),

  // Cheerful arpeggio for correct answers
  reward: () => {
    [523.25, 659.25, 783.99].forEach((f, i) => beep(f, 0.18, "triangle", 0.18, i * 0.08));
  },

  // Gentle descending pair for wrong answers (not harsh)
  wrong: () => {
    beep(330, 0.16, "sine", 0.18, 0);
    beep(247, 0.22, "sine", 0.18, 0.12);
  },

  // Triumphant chord for quiz completion / good score
  complete: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      beep(f, 0.5, "triangle", 0.16, i * 0.06));
  },

  // Soft ping when a flashcard flips, etc.
  flip: () => beep(660, 0.06, "sine", 0.08),

  // Synthesize a tone contour to match the on-screen shape.
  // mid     = flat line          → flat pitch
  // low     = diagonal down 45°  → start high, drop
  // falling = up then down       → low, peak high, then dip low (mountain)
  // high    = diagonal up 45°    → start low, rise
  // rising  = down then up       → high, dip low, then rise high (valley)
  tone: (type) => {
    const b = 220; // ~A3
    const shapes = {
      mid:     [b * 1.00, b * 1.00],
      low:     [b * 1.10, b * 0.75],
      falling: [b * 0.90, b * 1.55, b * 0.70],
      high:    [b * 0.85, b * 1.45],
      rising:  [b * 1.20, b * 0.75, b * 1.55]
    };
    contour(shapes[type] || shapes.mid, 0.95);
  },

  isMuted, setMuted, toggleMute: () => setMuted(!isMuted())
};

export { SFX };
export default SFX;
