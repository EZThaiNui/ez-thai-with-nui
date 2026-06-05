// =====================================================================
// Voice-clip playback with loudness normalization.
//
// Problem: Khruu Nui's consonant recordings, the tone recordings, and the
// user's own mic recordings were each played with a bare `new Audio(url)`,
// so they came out at wildly different perceived loudness — users had to
// ride the device volume between sections.
//
// Fix: route EVERY voice clip through the Web Audio API. Each clip is
// decoded once, its RMS (perceived loudness) measured, and played back
// through a GainNode that brings it to a single TARGET loudness — tuned to
// match the Practice-Tone level, which is our reference. A peak limiter
// keeps the boosted signal from clipping. If Web Audio or decoding is
// unavailable (older browser, CORS), we fall back to a plain <audio>
// element so playback still works (just un-normalized).
//
// One clip plays at a time (a new play stops the previous), preventing
// overlap when users tap quickly.
// =====================================================================

const TARGET_RMS = 0.10;  // reference perceived loudness (~Practice-Tone level)
const MAX_GAIN   = 8;     // never amplify a quiet/near-silent clip more than this
const PEAK_LIMIT = 0.97;  // after gain, keep the peak below clipping

let ctx = null;
function ensureCtx() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { return null; }
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

const clipCache = new Map();  // url -> { buffer, gain }
let currentSource = null;     // currently-playing AudioBufferSourceNode

async function loadClip(url) {
  if (clipCache.has(url)) return clipCache.get(url);
  const ac = ensureCtx();
  if (!ac) throw new Error("no-audio-context");
  const res = await fetch(url, { mode: "cors" });
  const arr = await res.arrayBuffer();
  const buffer = await ac.decodeAudioData(arr);

  // Measure RMS + peak across a sub-sampled mono mix (every 16th frame is
  // plenty and keeps this fast even for multi-second clips).
  let sumSq = 0, peak = 0, count = 0;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i += 16) {
      const v = data[i];
      sumSq += v * v;
      const a = v < 0 ? -v : v;
      if (a > peak) peak = a;
      count++;
    }
  }
  const rms = Math.sqrt(sumSq / Math.max(1, count)) || TARGET_RMS;
  let gain = Math.min(TARGET_RMS / rms, MAX_GAIN);
  if (peak * gain > PEAK_LIMIT) gain = PEAK_LIMIT / Math.max(peak, 1e-4);

  const entry = { buffer, gain };
  clipCache.set(url, entry);
  return entry;
}

function stopCurrent() {
  if (currentSource) {
    try { currentSource.stop(); } catch { /* already stopped */ }
    currentSource = null;
  }
}

// Plain-element fallback (no normalization, but it plays).
function playFallback(url, rate, onended) {
  return new Promise((resolve, reject) => {
    try {
      const a = new Audio(url);
      a.playbackRate = rate;
      if (onended) a.onended = onended;
      a.play()
        .then(() => resolve({ stop: () => { try { a.pause(); } catch {} } }))
        .catch(reject);
    } catch (e) { reject(e); }
  });
}

// Play a normalized voice clip.
//   url       — audio source (Cloudinary URL or a blob: URL)
//   rate      — playback rate (1 = normal; <1 = slower/lower for tones)
//   onended   — called when playback finishes
// Resolves once playback STARTS; rejects only if nothing could play.
async function playClip(url, { rate = 1, onended } = {}) {
  const ac = ensureCtx();
  if (ac) {
    try {
      const { buffer, gain } = await loadClip(url);
      stopCurrent();
      const src = ac.createBufferSource();
      src.buffer = buffer;
      src.playbackRate.value = rate;
      const g = ac.createGain();
      g.gain.value = gain;
      src.connect(g).connect(ac.destination);
      src.onended = () => {
        if (currentSource === src) currentSource = null;
        if (onended) onended();
      };
      currentSource = src;
      src.start();
      return { stop: () => { try { src.stop(); } catch {} } };
    } catch {
      // fall through to element fallback (e.g. CORS-blocked decode)
    }
  }
  return playFallback(url, rate, onended);
}

export { playClip, stopCurrent, loadClip };
