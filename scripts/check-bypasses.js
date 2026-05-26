// Primitive bypass lint rule — prevents future drift.
//
// Scans production JSX for hand-rolled equivalents of design-system
// primitives. Flags raw <button>, <h1>-<h6>, and position:fixed patterns
// outside an allowlist of documented exceptions. Each exception was
// individually classified during Phase A (Sessions 3-4) and is recorded
// here with a brief rationale.
//
// To add a new exception: add the file to the relevant ALLOW list below
// with a comment explaining why the bypass is correct. This comment
// surfaces in PRs via git blame so the reasoning is always discoverable.
//
// Wired into `npm run check:all` and the `prebuild` chain so a deploy
// can't regress primitive adoption.

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const SRC = "src";
const COMPONENTS = "src/components";

// ── Allowlists ───────────────────────────────────────────────────────────────

// Files allowed to contain raw <button> elements (not using <Button>).
const BUTTON_ALLOW = new Set([
  "src/components/Button.jsx",           // the primitive itself
  "src/components/TabBar.jsx",           // the TabBar primitive (buttons are its internals)
  "src/components/Popover.jsx",          // PopoverItem is a primitive internal
  "src/components/Card.jsx",             // Card primitive (no buttons, but future-proof)
  "src/components/Row.jsx",              // Row primitive
  // Canonical segment-control pattern via makeSegBtnStyle:
  "src/components/Onboarding.jsx",       // 5 segment controls
  "src/components/ScheduleTab.jsx",      // 5 segment controls
  "src/components/IFMigrationScreen.jsx",// 3 segment controls
  // Structural exceptions (Session 4 analysis):
  "src/components/SlotCard.jsx",         // split-button header, hit-expansion, log-at pill
  "src/components/WeekStrip.jsx",        // DayCell flex-column grid button, nav chevrons
  "src/components/Hero.jsx",             // edit affordance (ghost text link)
  "src/components/TodayPanelHeader.jsx", // hover-reveal anchor edit
  "src/components/SupplementRow.jsx",    // hover-reveal edit pencil (inside Row)
  // Text-link tertiary actions (documented exception — no Button chrome):
  "src/components/Auth.jsx",             // Forgot password, mode switch, back-to-signin
  "src/components/PromptName.jsx",       // Skip for now
  // Inline-edit pattern:
  "src/components/ProtocolDetailScreen.jsx", // tap-to-edit name, send-user email input
  // Protocol library received cards:
  "src/components/ProtocolLibrary.jsx",  // received-protocol tappable cards
  // Primitive internals:
  "src/components/Toast.jsx",            // action button inside toast
  "src/components/InlineTip.jsx",        // dismiss button inside tip
  // Parked clinician code:
  "src/components/Sidebar.jsx",
  "src/components/PatientRoster.jsx",
  "src/components/PatientDetailPanel.jsx",
  "src/components/PatientAnalyticsPanel.jsx",
]);

// Files allowed to contain raw <h1>-<h6> elements (not using <Heading>).
const HEADING_ALLOW = new Set([
  "src/components/Heading.jsx",          // the primitive itself
  // Parked clinician code:
  "src/components/PatientRoster.jsx",
]);

// Files allowed to contain position:fixed (not using Modal/SidePanel/Popover).
const FIXED_ALLOW = new Set([
  "src/components/Modal.jsx",
  "src/components/SidePanel.jsx",
  "src/components/Popover.jsx",
  "src/components/Toast.jsx",            // toast portal
  // Slide-in screens (intentional route-like navigation, not modal bypasses):
  "src/components/IFMigrationScreen.jsx",
  "src/components/SettingsScreen.jsx",
  "src/components/ProtocolLibrary.jsx",
  "src/components/ProtocolDetailScreen.jsx",
]);

// ── Scanner ──────────────────────────────────────────────────────────────────

function collectJsxFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "node_modules" || entry === "design-system-page") continue;
    const stat = statSync(full);
    if (stat.isDirectory()) results.push(...collectJsxFiles(full));
    else if (entry.endsWith(".jsx")) results.push(full);
  }
  return results;
}

function scanFile(filePath, pattern, allowSet) {
  const rel = relative(".", filePath);
  if (allowSet.has(rel)) return [];
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      hits.push({ file: rel, line: i + 1, text: lines[i].trim() });
    }
  }
  return hits;
}

// ── Patterns ─────────────────────────────────────────────────────────────────

const RAW_BUTTON  = /<button[\s>]/;
const RAW_HEADING = /<h[1-6][\s>]/;
const POS_FIXED   = /position:\s*['"]?fixed/;

// ── Run ──────────────────────────────────────────────────────────────────────

const files = collectJsxFiles(SRC);
const violations = [];

for (const f of files) {
  violations.push(...scanFile(f, RAW_BUTTON,  BUTTON_ALLOW).map(h => ({ ...h, kind: "raw <button>" })));
  violations.push(...scanFile(f, RAW_HEADING, HEADING_ALLOW).map(h => ({ ...h, kind: "raw heading" })));
  violations.push(...scanFile(f, POS_FIXED,   FIXED_ALLOW).map(h => ({ ...h, kind: "position: fixed" })));
}

console.log("");
console.log("Primitive bypass check");
console.log("----------------------------------------------------------------");

if (violations.length === 0) {
  console.log("No primitive bypasses found outside allowlists.");
  console.log(`Scanned ${files.length} JSX files.`);
  console.log("----------------------------------------------------------------");
  console.log("");
  process.exit(0);
}

for (const v of violations) {
  console.log(`[${v.kind}] ${v.file}:${v.line}`);
  console.log(`  ${v.text.slice(0, 120)}`);
  console.log(`  → Use the corresponding primitive, or add this file to the allowlist with a rationale.`);
  console.log("");
}

console.log("----------------------------------------------------------------");
console.log(`${violations.length} bypass violation(s). Fix or allowlist each one.`);
console.log("");
process.exit(1);
