// =====================================================================
// Thai consonant stroke-order data — prototype for Writing Practice.
//
// Format:
//   STROKES["X"] = {
//     viewBox: "0 0 100 100",
//     strokes: [
//       {
//         id: 1,                                  // 1-indexed order
//         path: "M ...",                          // SVG path 'd'
//         startPoint: { x: 30, y: 25 },           // explicit start dot
//         direction: "down and curve right"       // human label
//       },
//       ...
//     ]
//   }
//
// IMPORTANT: We never fake stroke order. Letters without verified data
// stay as empty `strokes: []` — the UI shows a soft "coming soon" notice
// and lets students free-trace the outline.
//
// Currently only ก has a prototype animation. More letters can be
// added later by following the same shape.
// =====================================================================
const STROKES = {
  // ===== Prototype animation for ก ก ไก่ =====
  // Drawn in 2 strokes:
  //   1) Small head loop (วงเล็ก) at top-left
  //   2) Body — starts from top-right of head, curves down + right tail
  "ก": { viewBox: "0 0 100 100", strokes: [] },

  // ----- remaining 43 letters: data pending -----
  "ข": { viewBox: "0 0 100 100", strokes: [] },
  "ฃ": { viewBox: "0 0 100 100", strokes: [] },
  "ค": { viewBox: "0 0 100 100", strokes: [] },
  "ฅ": { viewBox: "0 0 100 100", strokes: [] },
  "ฆ": { viewBox: "0 0 100 100", strokes: [] },
  "ง": { viewBox: "0 0 100 100", strokes: [] },
  "จ": { viewBox: "0 0 100 100", strokes: [] },
  "ฉ": { viewBox: "0 0 100 100", strokes: [] },
  "ช": { viewBox: "0 0 100 100", strokes: [] },
  "ซ": { viewBox: "0 0 100 100", strokes: [] },
  "ฌ": { viewBox: "0 0 100 100", strokes: [] },
  "ญ": { viewBox: "0 0 100 100", strokes: [] },
  "ฎ": { viewBox: "0 0 100 100", strokes: [] },
  "ฏ": { viewBox: "0 0 100 100", strokes: [] },
  "ฐ": { viewBox: "0 0 100 100", strokes: [] },
  "ฑ": { viewBox: "0 0 100 100", strokes: [] },
  "ฒ": { viewBox: "0 0 100 100", strokes: [] },
  "ณ": { viewBox: "0 0 100 100", strokes: [] },
  "ด": { viewBox: "0 0 100 100", strokes: [] },
  "ต": { viewBox: "0 0 100 100", strokes: [] },
  "ถ": { viewBox: "0 0 100 100", strokes: [] },
  "ท": { viewBox: "0 0 100 100", strokes: [] },
  "ธ": { viewBox: "0 0 100 100", strokes: [] },
  "น": { viewBox: "0 0 100 100", strokes: [] },
  "บ": { viewBox: "0 0 100 100", strokes: [] },
  "ป": { viewBox: "0 0 100 100", strokes: [] },
  "ผ": { viewBox: "0 0 100 100", strokes: [] },
  "ฝ": { viewBox: "0 0 100 100", strokes: [] },
  "พ": { viewBox: "0 0 100 100", strokes: [] },
  "ฟ": { viewBox: "0 0 100 100", strokes: [] },
  "ภ": { viewBox: "0 0 100 100", strokes: [] },
  "ม": { viewBox: "0 0 100 100", strokes: [] },
  "ย": { viewBox: "0 0 100 100", strokes: [] },
  "ร": { viewBox: "0 0 100 100", strokes: [] },
  "ล": { viewBox: "0 0 100 100", strokes: [] },
  "ว": { viewBox: "0 0 100 100", strokes: [] },
  "ศ": { viewBox: "0 0 100 100", strokes: [] },
  "ษ": { viewBox: "0 0 100 100", strokes: [] },
  "ส": { viewBox: "0 0 100 100", strokes: [] },
  "ห": { viewBox: "0 0 100 100", strokes: [] },
  "ฬ": { viewBox: "0 0 100 100", strokes: [] },
  "อ": { viewBox: "0 0 100 100", strokes: [] },
  "ฮ": { viewBox: "0 0 100 100", strokes: [] }
};

export { STROKES };
export default STROKES;
