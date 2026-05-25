import { useState } from 'react';
import { Pencil, Pill, Syringe, Droplet, Clock } from 'lucide-react';
import { spacing, typography, touch, motion, icon } from '../design-system';
import { useTheme } from '../lib/theme';
import Badge from './Badge';
import Button from './Button';
import Checkbox from './Checkbox';
import Heading from './Heading';

function CategoryIcon({ category, color }) {
  if (category === "Rx")         return <Pill     size={14} color={color} style={{ flexShrink: 0 }} />;
  if (category === "Injectable") return <Syringe  size={14} color={color} style={{ flexShrink: 0 }} />;
  if (category === "Topical")    return <Droplet  size={14} color={color} style={{ flexShrink: 0 }} />;
  return null;
}

export default function SlotCard({ slot, slotSupps, status, timeLabel, hasOffset, pillTime, isFuture, isChecked, checkedAtTime, toggleCheck, takeAllInSlot, openEdit, openLogAt, noSchedule, isReadOnly, isPast }) {
  const { theme } = useTheme();
  const allDone = slotSupps.every(s => isChecked(slot.id, s.id));
  // Auto-expand only the actionable slots on mount (now + late). Everything else
  // starts collapsed so a busy day doesn't render every incomplete slot fully open.
  // After mount the user toggles freely — no forced re-expansion when a check flips.
  const [expanded, setExpanded] = useState(status === 'now' || status === 'missed');

  const SC = {
    done:   { border: theme.border.subtle,          bg: theme.surface.cardSubtle,        hbg: "transparent",                badge: null },
    missed: { border: theme.border.subtle,           bg: theme.surface.cardSubtle,        hbg: "transparent",                badge: { label: "late",   bg: theme.status.warningSubtle,          color: theme.status.warning } },
    now:    { border: theme.status.nowBorder,       bg: theme.status.nowBg,       hbg: theme.status.nowHover,        badge: { label: "now",    bg: theme.status.nowBadgeBg,     color: theme.status.nowBadgeText } },
    future: { border: theme.border.subtle,          bg: theme.surface.cardSubtle,        hbg: "transparent",                badge: null },
  };
  const sc = SC[status];

  // Grey only when the slot's fire time is genuinely unknown — i.e. when the
  // timeLabel is the placeholder "--:--" (anchor-relative slot waiting on the
  // user's anchor) or "variable" (no offset registered). For modes where the
  // slot has an absolute time independent of any anchor (IF v2, Fixed, the
  // medication/wakeup after_dinner-with-evening_mode bucket), timeLabel is a
  // concrete HH:MM and the slot should render at full opacity even if pillTime
  // is null — Bego's IF v2 evening slot was getting greyed because the old
  // check was `!pillTime`, which is always true for IF v2 users.
  const timeUnknown = timeLabel === "--:--" || timeLabel === "variable";
  return (
    <div style={{ borderRadius: theme.radius.surface, border: `${theme.borderWidth.default}px solid ${sc.border}`, background: sc.bg, overflow: "hidden", opacity: !noSchedule && status === "future" && timeUnknown ? 0.38 : 1 }}>
      {/* Header — split into TWO buttons so each has a distinct tap target:
          (1) slot icon = take-all (bulk-complete all supps in this slot) per D3,
          (2) rest of the row = expand/collapse toggle. Nested buttons would be
          invalid HTML, so they sit side-by-side under a flex container. */}
      <div style={{ display: "flex", alignItems: "stretch", background: sc.hbg, WebkitTapHighlightColor: "transparent" }}>
        {/* Take-all icon button — only interactive when there's something to do.
            Disabled (visually inert) when read-only, future, or already all done. */}
        <button
          type="button"
          onClick={(e) => {
            if (isReadOnly || isFuture || allDone || !takeAllInSlot) return;
            e.stopPropagation();
            takeAllInSlot(slot.id, slotSupps);
          }}
          aria-label={allDone ? `${slot.label} all done` : `Take all in ${slot.label}`}
          aria-pressed={allDone}
          disabled={isReadOnly || isFuture || allDone}
          style={{
            background: "none",
            border: "none",
            padding: `${spacing.md}px ${spacing.xs}px ${spacing.md}px ${spacing.md}px`,
            cursor: (isReadOnly || isFuture || allDone) ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            WebkitTapHighlightColor: "transparent",
            color: "inherit",
          }}
        >
          {allDone
            ? <div style={{ width: 20, height: 20, borderRadius: theme.radius.surfaceInner, background: theme.accent.default, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ color: theme.text.onAccent, fontSize: typography.label, fontWeight: typography.bold }}>✓</span></div>
            : <span style={{ color: theme.slot.default, fontSize: typography.caption, flexShrink: 0, width: 20, textAlign: "center" }}>{slot.icon}</span>
          }
        </button>
        {/* Expand button — covers the rest of the header. */}
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          style={{
            flex: 1,
            padding: `${spacing.md}px ${spacing.md}px ${spacing.md}px ${spacing.xs}px`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            userSelect: "none",
            WebkitTapHighlightColor: "transparent",
            fontFamily: "inherit",
            color: "inherit",
            textAlign: "left",
            minWidth: 0,
          }}
        >
          <div style={{ minWidth: 0, textAlign: "left", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
              <Heading level={2} visual="title" weight="medium" style={{ color: theme.text.secondary }}>
                {slot.label}
              </Heading>
              {sc.badge && <Badge variant={sc.badge.label === "now" ? "now" : (isReadOnly ? "neutral" : "missed")}>{sc.badge.label}</Badge>}
            </div>
            <div style={{ fontSize: typography.label, color: theme.text.secondary, marginTop: spacing.xxxs, minHeight: 16 }}>{allDone && !expanded ? `${slotSupps.length} item${slotSupps.length !== 1 ? "s" : ""} done` : slot.sublabel}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, flexShrink: 0 }}>
            {!noSchedule && <span style={{ fontSize: typography.caption, color: theme.text.secondary, fontVariantNumeric: "tabular-nums", fontWeight: typography.semibold }}>{timeLabel}</span>}
            <span style={{ fontSize: typography.caption, color: theme.text.secondary, display: "inline-block", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: `transform ${motion.chevronRotate}ms ease-out` }}>⌃</span>
          </div>
        </button>
      </div>
      {expanded && (
        <div style={{ padding: `${spacing.sm}px ${spacing.md}px`, borderTop: `${theme.borderWidth.default}px solid ${sc.border}`, display: "flex", flexDirection: "column", gap: spacing.sm }}>
          {slotSupps.map((supp, i) => {
            const done = isChecked(slot.id, supp.id);
            const atTime = checkedAtTime ? checkedAtTime(slot.id, supp.id) : null;
            // Show "Log at…" pill for missed slot rows where the supp isn't
            // checked yet. Lets the user log at the actual time it was taken
            // (preserves honest adherence data per Session 5 / D5).
            const showLogAt = !done && !isReadOnly && !isFuture && status === "missed" && typeof openLogAt === "function";
            // Expand 24pt visual checkbox to touch.min hit area without inflating the row.
            // Padding adds tappable area; negative margin pulls the layout box back to 24pt.
            const VISUAL_SIZE = 24;
            const expand = (touch.min - VISUAL_SIZE) / 2;
            return (
              <div key={supp.id} style={{ display: "flex", alignItems: "center", gap: spacing.xs, minHeight: touch.row }}>
                <button type="button" onClick={() => { if (!isFuture && !isReadOnly) toggleCheck(slot.id, supp.id); }} aria-label={done ? `Uncheck ${supp.name}` : `Check ${supp.name}`} aria-pressed={done} style={{ background: "none", border: "none", padding: expand, margin: -expand, cursor: (isFuture || isReadOnly) ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}>
                  <Checkbox checked={done} size={24} shape="square" weight="accent" />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: typography.body, color: done ? theme.text.secondary : theme.text.primary, textDecoration: done ? "line-through" : "none", fontWeight: done ? typography.regular : typography.medium, display: "flex", alignItems: "center", gap: spacing.xs2 }}>
                    {supp.name}
                    <CategoryIcon category={supp.category} color={theme.text.secondary} />
                  </div>
                  <div style={{ fontSize: typography.label, color: theme.text.secondary, marginTop: spacing.xxxs, minHeight: 14, display: "flex", alignItems: "center", gap: spacing.xs }}>
                    <span>{supp.dose}{supp.notes ? " · " + supp.notes : ""}</span>
                    {done && atTime && (
                      <span style={{ color: theme.text.muted, display: "inline-flex", alignItems: "center", gap: 2 }}>
                        <Clock size={10} />
                        at {atTime}
                      </span>
                    )}
                  </div>
                </div>
                {showLogAt && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openLogAt(slot.id, supp, slot.label); }}
                    aria-label={`Log ${supp.name} at a specific time`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: `${spacing.xxs}px ${spacing.xs}px`,
                      border: `${theme.borderWidth.default}px solid ${theme.status.warning}`,
                      background: "transparent",
                      color: theme.status.warning,
                      fontSize: typography.label,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      flexShrink: 0,
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <Clock size={10} />
                    log at…
                  </button>
                )}
                {!isReadOnly && !isPast && <Button variant="icon" aria-label={`Edit ${supp.name}`} onClick={e => { e.stopPropagation(); openEdit(supp); }} style={{ border: "none" }}><Pencil size={16} /></Button>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
