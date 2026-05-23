// Phase 3.5 enforcement layer — design-system registry coverage check.
//
// Scans src/components/ for top-level component files (.jsx with a default
// export and a Capitalized filename) and verifies each one is either
// (a) registered in src/components/design-system-page/registry.js under
// `primitives` or `composed`, or (b) explicitly listed in EXCEPTIONS below
// with a stated reason.
//
// The intent is structural: the design-system page is public and
// portfolio-linked, so every shipped primitive should appear there. The
// check makes that an enforced contract rather than a habit.
//
// Output format + exit codes mirror check-contrast.js. Wired into the
// `prebuild` chain so a deploy can't ship without registry parity.
//
// Run manually any time with `npm run check:registry`.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const COMPONENTS_DIR = path.join(ROOT, "src", "components");
const REGISTRY_FILE = path.join(COMPONENTS_DIR, "design-system-page", "registry.js");

// Components that legitimately live at the top level of src/components/ but
// are NOT design-system primitives — screens, screen-level composites,
// context providers, brand assets, and clinician-only surfaces that are
// parked from the design-system page.
//
// When you add a new file here, leave a one-line reason — future-you reading
// the diff six months from now will thank present-you.
const EXCEPTIONS = {
  // Screens (full-route surfaces, not primitives)
  "Auth":                    "screen",
  "Onboarding":              "screen",
  "NotificationPrompt":      "screen",
  "PromptName":              "screen",
  "ProtocolDetailScreen":    "screen",
  "ProtocolLibrary":         "screen",
  "SettingsScreen":          "screen",
  "IFMigrationScreen":       "screen",
  "TodayPanel":              "screen-level composite",
  "TodayPanelHeader":        "screen-level composite",
  "ScheduleTab":             "sub-screen inside SettingsScreen",
  "EditForm":                "screen-level form",

  // Brand asset
  "OriginGlyph":             "brand-mark SVG, not a design-system primitive",

  // Clinician spin-off — parked from the design-system page
  "Sidebar":                 "clinician spin-off — parked",
  "PatientRoster":           "clinician spin-off — parked",
  "PatientDetailPanel":      "clinician spin-off — parked",
  "PatientAnalyticsPanel":   "clinician spin-off — parked",

  // Composite that's exposed via a sub-component
  "WeekStrip":               "exposed in registry via its DayCell sub-component",

  // Inline composite — wrapped inside a screen, no standalone surface
  "SupplementNameAutocomplete": "input-attached autocomplete; not a standalone primitive",

  // Render-environment constraints — primitives that need a preview wrapper
  // (like ModalPreview) before they can sit in the registry. Tracked for
  // follow-up.
  "Loader":                  "TODO: needs preview wrapper — fullscreen screen-takeover, doesn't fit a registry tile",
  "Toast":                   "TODO: needs preview wrapper — context-driven, requires a mock ToastProvider",
};

// Load registry source. We string-match keys rather than importing JS modules
// (the registry imports JSX components, which Node can't evaluate without a
// build step). The registry file is small and stable, so a regex over the
// `primitives:` and `composed:` blocks is plenty.
const registrySrc = fs.readFileSync(REGISTRY_FILE, "utf8");

function extractKeys(blockName) {
  // Match `blockName: {` … then capture identifiers immediately followed by `:`
  // at the indented top of object entries. Crude but reliable here because the
  // file is hand-written with consistent 2/4-space indentation.
  const blockRe = new RegExp(`${blockName}\\s*:\\s*\\{([\\s\\S]*?)\\n\\s*\\},?\\s*(?:\\n\\s*\\}|$)`);
  const blockMatch = registrySrc.match(blockRe);
  if (!blockMatch) return new Set();
  const block = blockMatch[1];
  const keyRe = /^\s{4,6}([A-Z][A-Za-z0-9]*)\s*:\s*\{/gm;
  const out = new Set();
  let m;
  while ((m = keyRe.exec(block)) !== null) out.add(m[1]);
  return out;
}

const primitiveKeys = extractKeys("primitives");
const composedKeys  = extractKeys("composed");
const registered    = new Set([...primitiveKeys, ...composedKeys]);

// Scan src/components/ — top level only. Capitalized .jsx files with a
// default export.
const detected = [];
for (const entry of fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  if (!entry.name.endsWith(".jsx")) continue;
  if (!/^[A-Z]/.test(entry.name)) continue;
  const name = entry.name.replace(/\.jsx$/, "");
  const src = fs.readFileSync(path.join(COMPONENTS_DIR, entry.name), "utf8");
  if (!/^export\s+default\s+/m.test(src)) continue;
  detected.push(name);
}

const missing = detected.filter((n) => !registered.has(n) && !(n in EXCEPTIONS));
const stale   = Object.keys(EXCEPTIONS).filter((n) => !detected.includes(n));

console.log("");
console.log("Design-system registry coverage check");
console.log("-".repeat(64));
console.log(`Detected primitives:    ${detected.length}`);
console.log(`Registered:             ${detected.filter((n) => registered.has(n)).length}`);
console.log(`Excepted:               ${detected.filter((n) => n in EXCEPTIONS).length}`);
console.log(`Missing from registry:  ${missing.length}`);
console.log(`Stale exceptions:       ${stale.length}`);
console.log("-".repeat(64));

if (missing.length > 0) {
  console.log("");
  console.log("Missing from registry (add to registry.js or to EXCEPTIONS):");
  for (const n of missing) console.log(`  - ${n}`);
}

if (stale.length > 0) {
  console.log("");
  console.log("Stale entries in EXCEPTIONS (file no longer exists — remove):");
  for (const n of stale) console.log(`  - ${n}`);
}

if (missing.length === 0 && stale.length === 0) {
  console.log("");
  console.log("All top-level components are registered or explicitly excepted.");
  console.log("");
  process.exit(0);
}

console.log("");
process.exit(1);
