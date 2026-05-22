// src/lib/pdf.js — generate a one-page printable PDF artifact describing the
// SHAPE of a protocol (no times, no execution data). The app is the today
// surface; this PDF is what someone hands to a doctor, texts a friend, or
// files in a drawer.
//
// Entry point: exportProtocolPdf({ protocol, supps, profile, schedule }) → Blob
//
// Visual identity translated from Terminal Achromatic to print:
// white surface, near-black text, JetBrains Mono + Space Grotesk, zero radius,
// hairline rules.

import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { SLOTS, IF_SLOTS } from "./notifications";

// ── Constants ──────────────────────────────────────────────────────────────

// US Letter, portrait.
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN_X = 56;
const MARGIN_TOP = 56;
const MARGIN_BOTTOM = 56;

// Three-column row layout (col1 + col2 + col3 fill the content area):
//   col1 (icon + name, flex), col2 (dose, ~80pt right-aligned),
//   col3 (metadata, 1.4× col1).
const CONTENT_W = PAGE_W - 2 * MARGIN_X; // 500
const COL2_W = 80;
// X + 80 + 1.4X = CONTENT_W → X = (CONTENT_W - 80) / 2.4
const COL1_W = (CONTENT_W - COL2_W) / 2.4;      // ≈175
const COL3_W = COL1_W * 1.4;                    // ≈245
const COL1_X = MARGIN_X;                        // 56
const COL2_X = COL1_X + COL1_W;                 // ≈231
const COL3_X = COL2_X + COL2_W;                 // ≈311
const COL2_RIGHT = COL2_X + COL2_W;             // dose right-aligns here

const ICON_SIZE = 14;
const ICON_GAP = 8; // icon → name

const ROW_LINE_HEIGHT = 13 * 1.55; // 20.15pt
const SLOT_GAP = 22; // between slot sections
const SLOT_LABEL_TO_UNDERLINE = 4;
const UNDERLINE_TO_FIRST_ROW = 10;

// Colors (Terminal Achromatic → print).
const NEAR_BLACK = rgb(13 / 255, 13 / 255, 13 / 255);     // #0D0D0D
const TEXT_MUTED = rgb(102 / 255, 102 / 255, 102 / 255);  // #666666
const TEXT_DIM   = rgb(68 / 255, 68 / 255, 68 / 255);     // #444444
const TEXT_FAINT = rgb(136 / 255, 136 / 255, 136 / 255);  // #888888
const HAIRLINE_LIGHT = rgb(229 / 255, 229 / 255, 229 / 255); // #E5E5E5

// Lucide icon SVG paths (24×24 viewBox). lucide-react@1.14.0.
// Hardcoded to avoid runtime dependency on lucide-react internals.
const LUCIDE_PATHS = {
  Rx: [
    "m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z",
    "m8.5 8.5 7 7",
  ],
  Injectable: [
    "m18 2 4 4",
    "m17 7 3-3",
    "M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5",
    "m9 11 4 4",
    "m5 19-3 3",
    "m14 4 6 6",
  ],
  Topical: [
    "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z",
  ],
};

// ── Date / metadata formatters ─────────────────────────────────────────────

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_NAMES_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function parseLocalDate(s) {
  if (!s) return null;
  // Accept YYYY-MM-DD or ISO timestamps; treat as local-date for display.
  const datePart = String(s).slice(0, 10);
  const [y, m, d] = datePart.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function fmtLong(date) {
  if (!date) return "";
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function fmtShort(date) {
  if (!date) return "";
  return `${MONTH_NAMES_SHORT[date.getMonth()]} ${date.getDate()}`;
}

function formatStartedDate(protocol) {
  const d = parseLocalDate(protocol?.starts_at) || parseLocalDate(protocol?.created_at);
  return d ? fmtLong(d) : "";
}

function formatTreatmentMode(protocol) {
  if (!protocol) return "Indefinite";
  const endsAt = parseLocalDate(protocol.ends_at);
  if (endsAt) return `Through ${fmtLong(endsAt)}`;
  const startsAt = parseLocalDate(protocol.starts_at);
  if (protocol.treatment_mode === "scheduled" && startsAt && !endsAt) return "Scheduled";
  return "Indefinite";
}

function formatGeneratedDate() {
  return fmtLong(new Date());
}

function getDisplayName(profile) {
  if (profile?.display_name?.trim()) return profile.display_name.trim();
  if (profile?.email) return String(profile.email).split("@")[0];
  return "Owner";
}

function isAllSevenDays(days) {
  if (!Array.isArray(days)) return true;
  if (days.length === 7) return true;
  return false;
}

function formatDayRestriction(days) {
  if (!Array.isArray(days) || days.length === 0 || isAllSevenDays(days)) return "";
  return [...days].sort((a, b) => a - b).map(d => DAY_NAMES_SHORT[d]).join(", ");
}

function formatMetadata(supp) {
  // Precedence:
  //   1. Cycle pattern (cycled supps)
  //   2. Scheduled end date (scheduled supps with ends_at)
  //   3. Day restriction (days != all 7)
  //   4. Notes (truncated)
  if (supp.treatment_mode === "cycled" && supp.cycle_on_value && supp.cycle_off_value) {
    const onUnit = supp.cycle_on_value === 1 ? trimS(supp.cycle_on_unit) : supp.cycle_on_unit;
    const offUnit = supp.cycle_off_value === 1 ? trimS(supp.cycle_off_unit) : supp.cycle_off_unit;
    return `${supp.cycle_on_value} ${onUnit || "days"} on, ${supp.cycle_off_value} ${offUnit || "days"} off`;
  }
  if (supp.treatment_mode === "scheduled" && supp.ends_at) {
    const d = parseLocalDate(supp.ends_at);
    if (d) return `Through ${fmtShort(d)}`;
  }
  const dayRestriction = formatDayRestriction(supp.days);
  if (dayRestriction) return dayRestriction;
  if (supp.notes?.trim()) {
    const n = supp.notes.trim();
    return n.length > 30 ? `${n.slice(0, 29)}…` : n;
  }
  return "";
}

function trimS(s) {
  if (!s) return s;
  return s.endsWith("s") ? s.slice(0, -1) : s;
}

// ── Grouping ───────────────────────────────────────────────────────────────

function groupBySlot(supps, scheduleMode) {
  // Active supps only — paused or soft-deleted shouldn't appear in the artifact.
  const active = supps.filter(s => {
    if (s.deleted_at) return false;
    if (s.status === "paused") return false;
    if (!s.status && s.paused) return false;
    return true;
  });

  const slotDefs = scheduleMode === "fasting" ? IF_SLOTS : SLOTS;

  // Determine each supp's primary slot (first slot in supp.slots, or null for anytime).
  // Group by primary slot only — don't duplicate a supp across multiple slots
  // even if `supp.slots` has more than one entry. The PDF describes structure;
  // the app handles multi-slot display.
  const buckets = new Map();
  for (const supp of active) {
    const primary = Array.isArray(supp.slots) && supp.slots.length > 0 ? supp.slots[0] : null;
    if (!buckets.has(primary)) buckets.set(primary, []);
    buckets.get(primary).push(supp);
  }

  const groups = [];
  for (const slot of slotDefs) {
    const bucket = buckets.get(slot.id);
    if (bucket && bucket.length) {
      groups.push({
        slotId: slot.id,
        label: slot.label,
        supps: bucket.slice().sort((a, b) => a.name.localeCompare(b.name)),
      });
    }
  }
  // Anytime bucket (supps with no slot) — render last.
  const anytime = buckets.get(null);
  if (anytime && anytime.length) {
    groups.push({
      slotId: null,
      label: "Anytime",
      supps: anytime.slice().sort((a, b) => a.name.localeCompare(b.name)),
    });
  }
  return groups;
}

// ── Text helpers ───────────────────────────────────────────────────────────

function truncateToWidth(text, font, size, maxWidth) {
  if (!text) return "";
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  const ellipsis = "…";
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    const candidate = text.slice(0, mid) + ellipsis;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return lo > 0 ? text.slice(0, lo) + ellipsis : ellipsis;
}

function drawSpaced(page, text, x, y, opts) {
  // Render uppercase text with manual letter-spacing (pdf-lib doesn't expose
  // tracking on drawText, so we draw glyph-by-glyph for the wordmark + slot
  // labels). letterSpacing is in PDF points (not em).
  const { font, size, color, letterSpacing = 0 } = opts;
  let cursor = x;
  for (const ch of text) {
    page.drawText(ch, { x: cursor, y, font, size, color });
    cursor += font.widthOfTextAtSize(ch, size) + letterSpacing;
  }
  return cursor - x; // total drawn width
}

function widthOfSpaced(text, font, size, letterSpacing) {
  if (!text) return 0;
  let total = 0;
  for (let i = 0; i < text.length; i++) {
    total += font.widthOfTextAtSize(text[i], size);
    if (i < text.length - 1) total += letterSpacing;
  }
  return total;
}

// ── Icon rendering ─────────────────────────────────────────────────────────

function drawCategoryIcon(page, category, x, y) {
  // Lucide icons live in a 24×24 viewBox. pdf-lib's drawSvgPath flips the SVG
  // Y axis internally, so passing y here means the visual top of the icon
  // sits at PDF y (above which the icon extends nothing). The path renders
  // downward from there.
  const paths = LUCIDE_PATHS[category];
  if (!paths) return; // Oral or unknown → reserve column space, draw nothing.
  const scale = ICON_SIZE / 24;
  for (const d of paths) {
    page.drawSvgPath(d, {
      x,
      y,
      scale,
      borderColor: NEAR_BLACK,
      borderWidth: 1,
    });
  }
}

// ── Page chrome ────────────────────────────────────────────────────────────

function drawHeader(page, { protocol, fonts }) {
  // Header bar — protocol name (Space Grotesk 18pt Medium) on left,
  // ORIGIN wordmark (JetBrains Mono 11pt uppercase, 0.08em letter-spacing)
  // on right. 18pt top/bottom padding. 0.5pt hairline below.
  const headerTopY = PAGE_H - MARGIN_TOP;
  const titleSize = 18;
  const wordmarkSize = 11;
  const wordmarkLetterSpacing = wordmarkSize * 0.08;

  // Baseline math: drawText y is the baseline. ascender ≈ size * 0.75.
  // For visual top alignment between the two strings, drop the baseline
  // by (top padding + title ascent).
  const titleBaselineY = headerTopY - 18 - titleSize * 0.75;
  const wordmarkBaselineY = headerTopY - 18 - wordmarkSize * 0.75 - (titleSize - wordmarkSize) * 0.4;

  // Left: protocol name (truncated to leave breathing room for wordmark).
  const wordmarkW = widthOfSpaced("ORIGIN", fonts.jbMono, wordmarkSize, wordmarkLetterSpacing);
  const titleMaxW = CONTENT_W - wordmarkW - 24;
  const titleText = truncateToWidth(protocol?.name || "Untitled protocol", fonts.sgMed, titleSize, titleMaxW);
  page.drawText(titleText, {
    x: MARGIN_X,
    y: titleBaselineY,
    font: fonts.sgMed,
    size: titleSize,
    color: NEAR_BLACK,
  });

  // Right: ORIGIN wordmark.
  const wordmarkX = MARGIN_X + CONTENT_W - wordmarkW;
  drawSpaced(page, "ORIGIN", wordmarkX, wordmarkBaselineY, {
    font: fonts.jbMono,
    size: wordmarkSize,
    color: NEAR_BLACK,
    letterSpacing: wordmarkLetterSpacing,
  });

  // Bottom of header (after 18pt bottom padding from title baseline + descent).
  const headerBottomY = headerTopY - 18 - titleSize - 18;
  page.drawLine({
    start: { x: MARGIN_X, y: headerBottomY },
    end: { x: MARGIN_X + CONTENT_W, y: headerBottomY },
    thickness: 0.5,
    color: NEAR_BLACK,
  });

  return headerBottomY;
}

function drawStatusRow(page, { protocol, profile, fonts, startY }) {
  // "For: [name]  ·  Active  ·  Started [date]  ·  [treatment mode]"
  // Space Grotesk 13pt sentence case, color #666666.
  // 18pt top padding, 16pt bottom padding. Light grey hairline below.
  const size = 13;
  const text = [
    `For: ${getDisplayName(profile)}`,
    "Active",
    `Started ${formatStartedDate(protocol)}`,
    formatTreatmentMode(protocol),
  ].filter(Boolean).join("  ·  ");

  const truncated = truncateToWidth(text, fonts.sg, size, CONTENT_W);
  const baselineY = startY - 18 - size * 0.75;
  page.drawText(truncated, {
    x: MARGIN_X,
    y: baselineY,
    font: fonts.sg,
    size,
    color: TEXT_MUTED,
  });

  const bottomY = startY - 18 - size - 16;
  page.drawLine({
    start: { x: MARGIN_X, y: bottomY },
    end: { x: MARGIN_X + CONTENT_W, y: bottomY },
    thickness: 0.5,
    color: HAIRLINE_LIGHT,
  });
  return bottomY;
}

function drawFooter(page, { fonts }) {
  // 0.5pt hairline above, Space Grotesk 10pt #888888.
  // Left: "Generated by Origin · [today]". Right: disclaimer.
  // 22pt bottom padding.
  const size = 10;
  const footerBaselineY = MARGIN_BOTTOM - 22 + size * 0.25; // baseline above bottom margin
  const hairlineY = footerBaselineY + size + 12;

  page.drawLine({
    start: { x: MARGIN_X, y: hairlineY },
    end: { x: MARGIN_X + CONTENT_W, y: hairlineY },
    thickness: 0.5,
    color: HAIRLINE_LIGHT,
  });

  const left = `Generated by Origin · ${formatGeneratedDate()}`;
  const right = "Personal wellness tracking · Not medical advice";
  page.drawText(left, {
    x: MARGIN_X,
    y: footerBaselineY,
    font: fonts.sg,
    size,
    color: TEXT_FAINT,
  });
  const rightW = fonts.sg.widthOfTextAtSize(right, size);
  page.drawText(right, {
    x: MARGIN_X + CONTENT_W - rightW,
    y: footerBaselineY,
    font: fonts.sg,
    size,
    color: TEXT_FAINT,
  });
  return hairlineY;
}

// ── Slot drawing ───────────────────────────────────────────────────────────

function drawSlotLabel(page, label, y, fonts) {
  // JetBrains Mono 11pt uppercase, 0.08em letter-spacing, #0D0D0D.
  // Underline 4pt below baseline-descent line.
  const size = 11;
  const letterSpacing = size * 0.08;
  const text = label.toUpperCase();
  const labelBaselineY = y - size * 0.75;
  drawSpaced(page, text, MARGIN_X, labelBaselineY, {
    font: fonts.jbMono,
    size,
    color: NEAR_BLACK,
    letterSpacing,
  });
  const underlineY = labelBaselineY - SLOT_LABEL_TO_UNDERLINE;
  page.drawLine({
    start: { x: MARGIN_X, y: underlineY },
    end: { x: MARGIN_X + CONTENT_W, y: underlineY },
    thickness: 0.5,
    color: NEAR_BLACK,
  });
  return underlineY - UNDERLINE_TO_FIRST_ROW;
}

function drawSuppRow(page, supp, y, fonts) {
  // Row: icon (col1) | dose (col2 right-aligned) | metadata (col3).
  // Line-height 1.55 × 13pt = 20.15pt.
  // Returns Y for the next row.
  const size = 13;
  const baselineY = y - size * 0.75;

  // Icon — top-aligned with cap height of name text. Visual top of the 14pt
  // icon sits at roughly the cap height above baseline. SVG y-flip means we
  // pass the PDF y where SVG y=0 sits — that's the icon's visual top.
  const iconTopY = baselineY + size * 0.78;
  drawCategoryIcon(page, supp.category, COL1_X, iconTopY);

  // Name — col1, after icon + gap. Truncate to fit col1 width.
  const nameX = COL1_X + ICON_SIZE + ICON_GAP;
  const nameMaxW = COL1_W - ICON_SIZE - ICON_GAP - 4;
  const nameText = truncateToWidth(supp.name || "", fonts.jbMono, size, nameMaxW);
  page.drawText(nameText, {
    x: nameX,
    y: baselineY,
    font: fonts.jbMono,
    size,
    color: NEAR_BLACK,
  });

  // Dose — col2, right-aligned at COL2_RIGHT, truncated to col2 width.
  const doseText = truncateToWidth(supp.dose || "", fonts.jbMono, size, COL2_W - 8);
  if (doseText) {
    const doseW = fonts.jbMono.widthOfTextAtSize(doseText, size);
    page.drawText(doseText, {
      x: COL2_RIGHT - doseW,
      y: baselineY,
      font: fonts.jbMono,
      size,
      color: TEXT_DIM,
    });
  }

  // Metadata — col3, left-aligned, truncated to col3 width.
  const metaText = truncateToWidth(formatMetadata(supp), fonts.jbMono, size, COL3_W - 8);
  if (metaText) {
    page.drawText(metaText, {
      x: COL3_X,
      y: baselineY,
      font: fonts.jbMono,
      size,
      color: TEXT_MUTED,
    });
  }

  return y - ROW_LINE_HEIGHT;
}

// ── Main builder ───────────────────────────────────────────────────────────

async function loadFonts(pdfDoc) {
  pdfDoc.registerFontkit(fontkit);
  const [jbMonoReg, jbMonoMed, sgReg, sgMed] = await Promise.all([
    fetch("/fonts/JetBrainsMono-Regular.ttf").then(r => r.arrayBuffer()),
    fetch("/fonts/JetBrainsMono-Medium.ttf").then(r => r.arrayBuffer()),
    fetch("/fonts/SpaceGrotesk-Regular.ttf").then(r => r.arrayBuffer()),
    fetch("/fonts/SpaceGrotesk-Medium.ttf").then(r => r.arrayBuffer()),
  ]);
  return {
    jbMono: await pdfDoc.embedFont(jbMonoReg),
    jbMonoMed: await pdfDoc.embedFont(jbMonoMed),
    sg: await pdfDoc.embedFont(sgReg),
    sgMed: await pdfDoc.embedFont(sgMed),
  };
}

function startPage(pdfDoc, { protocol, profile, fonts }) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  page.drawRectangle({
    x: 0, y: 0, width: PAGE_W, height: PAGE_H,
    color: rgb(1, 1, 1),
  });
  const headerBottom = drawHeader(page, { protocol, fonts });
  const statusBottom = drawStatusRow(page, { protocol, profile, fonts, startY: headerBottom });
  const footerTop = drawFooter(page, { fonts });
  return { page, contentTopY: statusBottom, contentBottomY: footerTop };
}

export async function exportProtocolPdf({ protocol, supps, profile, schedule }) {
  const pdfDoc = await PDFDocument.create();
  const fonts = await loadFonts(pdfDoc);

  // Filter to this protocol's supps (caller may pass the full visible set).
  const protocolSupps = (supps || []).filter(s => s.protocol_id === protocol?.id);

  const scheduleMode = schedule?.schedule_type || "none";
  const groups = groupBySlot(protocolSupps, scheduleMode);

  let { page, contentTopY: y, contentBottomY } = startPage(pdfDoc, { protocol, profile, fonts });
  // Top breathing room before the first slot label.
  y -= SLOT_GAP;

  if (groups.length === 0) {
    // Empty-state message — JetBrains Mono 13pt #666666, centered.
    const msg = "No active items in this protocol.";
    const size = 13;
    const w = fonts.jbMono.widthOfTextAtSize(msg, size);
    page.drawText(msg, {
      x: MARGIN_X + (CONTENT_W - w) / 2,
      y: y - size,
      font: fonts.jbMono,
      size,
      color: TEXT_MUTED,
    });
  } else {
    for (let gi = 0; gi < groups.length; gi++) {
      const group = groups[gi];

      // Reserve space for slot label + underline + at least one row before
      // committing the section to this page.
      const slotHeaderHeight = 11 + SLOT_LABEL_TO_UNDERLINE + UNDERLINE_TO_FIRST_ROW;
      if (y - slotHeaderHeight - ROW_LINE_HEIGHT < contentBottomY) {
        // Doesn't fit — new page.
        ({ page, contentTopY: y, contentBottomY } = startPage(pdfDoc, { protocol, profile, fonts }));
        y -= SLOT_GAP;
      }

      y = drawSlotLabel(page, group.label, y, fonts);

      for (const supp of group.supps) {
        // Don't split a single row across pages.
        if (y - ROW_LINE_HEIGHT < contentBottomY) {
          ({ page, contentTopY: y, contentBottomY } = startPage(pdfDoc, { protocol, profile, fonts }));
          y -= SLOT_GAP;
          y = drawSlotLabel(page, `${group.label} (cont.)`, y, fonts);
        }
        y = drawSuppRow(page, supp, y, fonts);
      }

      if (gi < groups.length - 1) y -= SLOT_GAP - (ROW_LINE_HEIGHT - 13);
    }
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: "application/pdf" });
}
