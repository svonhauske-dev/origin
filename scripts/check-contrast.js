// Phase 3 enforcement layer — WCAG contrast check.
//
// Loads themes.achromatic from src/design-system.js, computes WCAG 2.x
// relative-luminance contrast ratios for every text/surface and
// UI-component/surface pair that matters, and fails the build if any
// pair drops below its required floor. This is the check that would
// have caught the May 23 audit's CI-1 + CI-2 (disabled text at 1.71:1,
// border at 1.26:1) on the day the values were authored.
//
// Wired into `npm run build` via the `prebuild` script so a deploy
// can't ship invisible UI. Run manually any time with
// `npm run check:contrast`.

import { themes } from "../src/design-system.js";

const PASS = "PASS";
const FAIL = "FAIL";
const INFO = "info";

// WCAG 2.x relative luminance.
function relativeLuminance(hex) {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) throw new Error(`Bad hex: ${hex}`);
  const [r, g, b] = m.map((h) => parseInt(h, 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(fg, bg) {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const [light, dark] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (light + 0.05) / (dark + 0.05);
}

function get(obj, path) {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

// Pairs to check. `min` is the WCAG floor for the pair's role:
//   4.5 — body text (WCAG 1.4.3)
//   3.0 — large text (≥18px) and UI components/borders (WCAG 1.4.11)
//   info — recorded for visibility, not enforced
const PAIRS = [
  // Text on canvas
  { name: "text.primary on canvas",   fg: "text.primary",   bg: "surface.canvas", min: 4.5 },
  { name: "text.secondary on canvas", fg: "text.secondary", bg: "surface.canvas", min: 4.5 },
  { name: "text.muted on canvas",     fg: "text.muted",     bg: "surface.canvas", min: 3.0 },
  { name: "text.disabled on canvas",  fg: "text.disabled",  bg: "surface.canvas", min: 3.0 },
  // Text on cards
  { name: "text.primary on card",     fg: "text.primary",   bg: "surface.card",   min: 4.5 },
  { name: "text.secondary on card",   fg: "text.secondary", bg: "surface.card",   min: 4.5 },
  // UI components / borders on canvas
  { name: "border.subtle on canvas",  fg: "border.subtle",  bg: "surface.canvas", min: 3.0 },
  { name: "border.strong on canvas",  fg: "border.strong",  bg: "surface.canvas", min: 3.0 },
  // Status colors on canvas
  { name: "status.success on canvas", fg: "status.success", bg: "surface.canvas", min: 3.0 },
  { name: "status.danger on canvas",  fg: "status.danger",  bg: "surface.canvas", min: 3.0 },
  { name: "status.warning on canvas", fg: "status.warning", bg: "surface.canvas", min: 3.0 },
  // Surface separation (informational — depth tonal contrast)
  { name: "card on canvas",           fg: "surface.card",   bg: "surface.canvas", min: null, info: true },
];

const theme = themes.achromatic;
let failures = 0;

const NAME_W = 36;
const RATIO_W = 8;
const MIN_W = 8;

console.log("");
console.log("WCAG contrast check — themes.achromatic");
console.log("");
console.log(
  "Pair".padEnd(NAME_W) +
    "Ratio".padEnd(RATIO_W) +
    "Floor".padEnd(MIN_W) +
    "Status"
);
console.log("-".repeat(NAME_W + RATIO_W + MIN_W + 8));

for (const pair of PAIRS) {
  const fg = get(theme, pair.fg);
  const bg = get(theme, pair.bg);
  if (typeof fg !== "string" || typeof bg !== "string") {
    console.log(`(skip) ${pair.name} — missing token ${pair.fg} or ${pair.bg}`);
    continue;
  }
  const ratio = contrastRatio(fg, bg);
  const status = pair.info
    ? INFO
    : ratio >= pair.min
    ? PASS
    : FAIL;
  if (status === FAIL) failures++;
  console.log(
    pair.name.padEnd(NAME_W) +
      `${ratio.toFixed(2)}:1`.padEnd(RATIO_W) +
      (pair.min ?? "-").toString().padEnd(MIN_W) +
      status
  );
}

console.log("-".repeat(NAME_W + RATIO_W + MIN_W + 8));

if (failures > 0) {
  console.log("");
  console.log(`${failures} contrast failure(s). Bump token values until they clear the floor.`);
  console.log("");
  process.exit(1);
}

console.log("");
console.log("All pairs clear their WCAG floor.");
console.log("");
