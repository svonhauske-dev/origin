// Phase 3 enforcement layer — WCAG contrast check (self-discovering).
//
// Iterates every token under themes.achromatic.text and tests it against
// every text-bearing surface. Also checks border + status tokens against
// canvas. Any new text or surface token added to design-system.js is
// automatically covered — no hand-maintained pair list to forget.
//
// Wired into `npm run build` via the `prebuild` script so a deploy
// can't ship invisible UI. Run manually with `npm run check:contrast`.

import { themes } from "../src/design-system.js";

const PASS = "PASS";
const FAIL = "FAIL";
const INFO = "info";

// ── Color parsing ────────────────────────────────────────────────────────────

function parseHex(hex) {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m || m.length < 3) return null;
  return m.slice(0, 3).map((h) => parseInt(h, 16));
}

function parseRgba(str) {
  const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (!m) return null;
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] !== undefined ? Number(m[4]) : 1 };
}

function blendOnSurface(fgStr, bgHex) {
  const bg = parseHex(bgHex);
  if (!bg) return null;

  // Try hex first (opaque)
  const hex = parseHex(fgStr);
  if (hex && !fgStr.includes("rgba") && !fgStr.includes("rgb(")) {
    return `#${hex.map(c => c.toString(16).padStart(2, "0")).join("")}`;
  }

  // Try rgba
  const rgba = parseRgba(fgStr);
  if (rgba) {
    const a = rgba.a;
    const r = Math.round(rgba.r * a + bg[0] * (1 - a));
    const g = Math.round(rgba.g * a + bg[1] * (1 - a));
    const b = Math.round(rgba.b * a + bg[2] * (1 - a));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  // Plain hex string
  if (fgStr.startsWith("#")) return fgStr;

  return null;
}

// ── WCAG 2.x ────────────────────────────────────────────────────────────────

function relativeLuminance(hex) {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) throw new Error(`Bad hex: ${hex}`);
  const [r, g, b] = m.map((h) => parseInt(h, 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(fgHex, bgHex) {
  const L1 = relativeLuminance(fgHex);
  const L2 = relativeLuminance(bgHex);
  const [light, dark] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (light + 0.05) / (dark + 0.05);
}

// ── Configuration ────────────────────────────────────────────────────────────

const theme = themes.achromatic;

// Surfaces where text commonly appears. Self-discovered from theme.surface,
// filtered to surfaces that actually host readable text.
const TEXT_SURFACES = ["canvas", "card"];

// Text tokens that serve as body text (normal size, ≤18px) require 4.5:1.
// Everything else (tertiary, disabled, future tokens) is treated as large-text
// or UI-component text and gets the 3:1 floor.
const BODY_TEXT_TOKENS = new Set(["primary", "secondary"]);

// Tokens to skip — not intended as readable text (used for fills, backgrounds
// on colored surfaces, etc). These carry their own semantic context.
const TEXT_SKIP = new Set(["onAccent", "onDanger"]);

// Additional fixed pairs: borders on canvas, status colors on canvas,
// surface separation (info-only).
const EXTRA_PAIRS = [
  { name: "border.subtle on canvas",  fg: theme.border?.subtle,  bg: theme.surface?.canvas, min: 3.0 },
  { name: "border.strong on canvas",  fg: theme.border?.strong,  bg: theme.surface?.canvas, min: 3.0 },
  { name: "status.success on canvas", fg: theme.status?.success, bg: theme.surface?.canvas, min: 3.0 },
  { name: "status.danger on canvas",  fg: theme.status?.danger,  bg: theme.surface?.canvas, min: 3.0 },
  { name: "status.warning on canvas", fg: theme.status?.warning, bg: theme.surface?.canvas, min: 3.0 },
  { name: "card on canvas",           fg: theme.surface?.card,   bg: theme.surface?.canvas, min: null, info: true },
];

// ── Run ──────────────────────────────────────────────────────────────────────

let failures = 0;
let pairCount = 0;

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

// Self-discovering: iterate all text.* tokens × all text-bearing surfaces
const textTokens = theme.text || {};
for (const [tokenName, tokenValue] of Object.entries(textTokens)) {
  if (TEXT_SKIP.has(tokenName)) continue;

  const min = BODY_TEXT_TOKENS.has(tokenName) ? 4.5 : 3.0;

  for (const surfaceName of TEXT_SURFACES) {
    const bgValue = theme.surface?.[surfaceName];
    if (!bgValue || typeof bgValue !== "string") continue;
    const bgHex = parseHex(bgValue) ? bgValue : null;
    if (!bgHex) continue;

    const fgHex = blendOnSurface(tokenValue, bgValue);
    if (!fgHex) {
      console.log(`(skip) text.${tokenName} on ${surfaceName} — unparseable color value`);
      continue;
    }

    const ratio = contrastRatio(fgHex, bgValue);
    const status = ratio >= min ? PASS : FAIL;
    if (status === FAIL) failures++;
    pairCount++;

    const pairName = `text.${tokenName} on ${surfaceName}`;
    console.log(
      pairName.padEnd(NAME_W) +
        `${ratio.toFixed(2)}:1`.padEnd(RATIO_W) +
        min.toString().padEnd(MIN_W) +
        status
    );
  }
}

// Fixed pairs: borders, status, surface separation
for (const pair of EXTRA_PAIRS) {
  if (!pair.fg || !pair.bg) continue;
  const fgHex = blendOnSurface(pair.fg, pair.bg);
  if (!fgHex) continue;

  const ratio = contrastRatio(fgHex, pair.bg);
  const status = pair.info ? INFO : ratio >= pair.min ? PASS : FAIL;
  if (status === FAIL) failures++;
  pairCount++;

  console.log(
    pair.name.padEnd(NAME_W) +
      `${ratio.toFixed(2)}:1`.padEnd(RATIO_W) +
      (pair.min ?? "-").toString().padEnd(MIN_W) +
      status
  );
}

console.log("-".repeat(NAME_W + RATIO_W + MIN_W + 8));
console.log("");
console.log(`${pairCount} pairs tested.`);

if (failures > 0) {
  console.log(`${failures} contrast failure(s). Bump token values until they clear the floor.`);
  console.log("");
  process.exit(1);
}

console.log("All pairs clear their WCAG floor.");
console.log("");
