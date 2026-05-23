// Phase 3 enforcement layer — token-discipline audit.
//
// Scans src/**/*.jsx (and App.jsx) for raw values that should come from
// design-system.js: off-palette hex literals in JSX `style={}`, raw
// `fontSize: N` values outside the typography scale, and `outline:
// "none"` suppressions of the global :focus-visible rule.
//
// Reports counts + file:line for each violation. Exits with code 0 by
// default — informational, not blocking — so accidental false positives
// don't stop a deploy. Pass `--fail` to exit non-zero (e.g. in CI).
//
// Run manually: `npm run check:tokens` or `npm run check:tokens -- --fail`

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "src");
const FAIL_ON_VIOLATIONS = process.argv.includes("--fail");

// Allowed hex literals — every color in themes.achromatic + shadow tints.
// Kept in sync with src/design-system.js manually; if the theme adds a
// color, add it here too. Hex comparison is case-insensitive via toUpperCase.
const ALLOWED_HEXES = new Set([
  "#0D0D0D", "#1A1A1A", "#161616", "#222222", "#3A3A3A",
  "#FFFFFF",
  "#A0A0A0", "#666666", "#6B6B6B", "#444444",
  "#2A2A2A", "#404040", "#606060", "#808080",
  "#5FE090", "#FF6060", "#FFC040",
  "#F4F6F8",        // brand glyph OG color (icon.svg)
  "#E5E5E5",        // email template hairline
  "#0D0D0D",        // (already in)
]);

// Typography scale from design-system.js
const ALLOWED_FONT_SIZES = new Set([10, 12, 14, 16, 18, 22, 32]);

const violations = {
  hex: [],
  fontSize: [],
  outlineSuppression: [],
};

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith(".jsx") || entry.name === "App.jsx") {
      audit(full);
    }
  }
}

function audit(filepath) {
  const filename = path.basename(filepath);
  // Skip the design system source + the brand-mark SVG component
  // (which legitimately encodes the icon.svg brand-asset constants).
  if (filename === "design-system.js") return;
  if (filename === "OriginGlyph.jsx") return;
  // Skip the design-system-page directory (registry stub data).
  if (filepath.includes("design-system-page")) return;

  const content = fs.readFileSync(filepath, "utf8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    const lineNum = i + 1;

    // Skip single-line comments outright. (Multi-line block comments fall
    // through; acceptable false-positive risk for the audit.)
    if (line.startsWith("//") || line.startsWith("*")) continue;

    // Hex literals (#XXX / #XXXXXX / #XXXXXXXX)
    const hexes = raw.matchAll(/#[A-Fa-f0-9]{3}(?:[A-Fa-f0-9]{3})?(?:[A-Fa-f0-9]{2})?\b/g);
    for (const m of hexes) {
      let hex = m[0].toUpperCase();
      // Normalize 3-digit shorthand (#FFF → #FFFFFF) for the allowlist check.
      if (hex.length === 4) {
        hex = "#" + hex.slice(1).split("").map((c) => c + c).join("");
      }
      if (!ALLOWED_HEXES.has(hex)) {
        violations.hex.push({ file: filepath, line: lineNum, value: m[0] });
      }
    }

    // fontSize: NUMBER
    const fs1 = raw.matchAll(/fontSize:\s*(\d+)\b/g);
    for (const m of fs1) {
      const size = parseInt(m[1], 10);
      if (!ALLOWED_FONT_SIZES.has(size)) {
        violations.fontSize.push({ file: filepath, line: lineNum, value: size });
      }
    }

    // outline: "none" / outline: 'none' / outline: 0 — suppresses focus
    if (/outline:\s*(['"]none['"]|0\b)/.test(raw)) {
      violations.outlineSuppression.push({ file: filepath, line: lineNum, snippet: line });
    }
  }
}

walk(SRC);

const cwd = process.cwd();
function rel(f) { return path.relative(cwd, f); }

function section(title, items, formatter) {
  if (items.length === 0) {
    console.log(`[ok]   ${title}: 0`);
    return;
  }
  console.log(`[!]    ${title}: ${items.length}`);
  for (const v of items.slice(0, 25)) {
    console.log(`         ${formatter(v)}`);
  }
  if (items.length > 25) {
    console.log(`         ... and ${items.length - 25} more`);
  }
}

console.log("");
console.log("Token-discipline audit");
console.log("-".repeat(64));
section("Off-palette hex literals", violations.hex,
  (v) => `${rel(v.file)}:${v.line}  ${v.value}`);
section("Off-scale fontSize values", violations.fontSize,
  (v) => `${rel(v.file)}:${v.line}  fontSize: ${v.value}`);
section("outline: 'none' suppressions", violations.outlineSuppression,
  (v) => `${rel(v.file)}:${v.line}  ${v.snippet.slice(0, 80)}`);
console.log("-".repeat(64));

const total = violations.hex.length + violations.fontSize.length + violations.outlineSuppression.length;
console.log(`Total violations: ${total}`);
console.log("");

if (FAIL_ON_VIOLATIONS && total > 0) {
  process.exit(1);
}
