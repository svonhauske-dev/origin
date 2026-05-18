import { spacing, typography, touch, effects } from '../design-system';
import { useTheme } from '../lib/theme';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import AdherenceRing from './AdherenceRing';

// ── Hero state computation ──────────────────────────────────────────────────
// Single source of truth for what the Hero shows in each combination of
// (mode, isPast/isFuture, anchor state, completion).
//
// Returns:
//   eyebrow: { text, suffix?, suffixTone? }  — uppercase label row, always rendered
//   status:  string                          — main display row
//   submeta: string | null                   — optional caption below
//   statusKind: 'time' | 'text'              — sizing for status
//   showSetAnchor: boolean                   — render inline "+ Set anchor" pill
//
// Past day rendered with the same shape as today — only the eyebrow content
// differs ("VIEWING X · read-only" vs. "AFTER 07:50 ANCHOR"), so the card stays
// the same size between states.
function getHeroState({
  scheduleMode, isToday, isPast, isFuture, isReadOnly, viewDate,
  pillTime, anchorBehavior, consistentTime, eatingWindowStart,
  nextFixedSlot, pct, coreTotal, coreDone,
}) {
  const isAnchor      = scheduleMode === "medication" || scheduleMode === "wakeup";
  const isConsistent  = anchorBehavior === "consistent";
  const effectivePill = pillTime || (isConsistent ? consistentTime : null);
  const allDone       = pct === 100 && coreTotal > 0;
  const completionText= coreTotal > 0 ? `${coreDone} of ${coreTotal} done` : null;
  // Shared date string — used in every eyebrow so today / past / future have
  // the same visual shape (the only thing that varies is the prefix word and
  // any suffix after the dot separator).
  const dateStr = viewDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // ── Future day ──
  if (isFuture) {
    return {
      eyebrow: { text: `Viewing ${dateStr}` },
      status: viewDate.toLocaleDateString("en-US", { weekday: "long" }),
      submeta: null,
      statusKind: "text",
    };
  }

  // ── Past day ──
  // Rule: success green always lives on the status row (primary celebration
  // moment) — never on submeta. For past anchor days, that means swap when
  // all-done: "Completed" becomes primary, "Anchor at X" drops to submeta.
  if (isPast) {
    const pastEyebrow = {
      text: `Viewing ${dateStr}`,
      suffix: isReadOnly ? "read-only" : "editing",
      suffixTone: isReadOnly ? "muted" : "accent",
    };
    const completionLine = coreTotal === 0
      ? "No items logged"
      : (allDone ? "Completed" : completionText);

    if (isAnchor && effectivePill) {
      // All-done: celebrate on status; anchor drops to submeta.
      if (allDone) {
        return {
          eyebrow: pastEyebrow,
          status: "Completed",
          statusIsDone: true,
          submeta: `Anchor at ${effectivePill}`,
          statusKind: "text",
        };
      }
      // Partial or empty: anchor stays as primary, completion in submeta (no green).
      return {
        eyebrow: pastEyebrow,
        status: `Anchor at ${effectivePill}`,
        submeta: completionLine,
        statusKind: "text",
      };
    }
    if (isAnchor) {
      // Anchor mode but no anchor was set on this day — neutral primary line.
      // On all-done, swap to celebrate on status.
      if (allDone) {
        return {
          eyebrow: pastEyebrow,
          status: "Completed",
          statusIsDone: true,
          submeta: "No anchor recorded",
          statusKind: "text",
        };
      }
      return {
        eyebrow: pastEyebrow,
        status: "No anchor recorded",
        submeta: coreTotal === 0 ? null : completionLine,
        statusKind: "text",
      };
    }
    // Non-anchor modes (fixed / fasting / none) — completion as primary.
    return {
      eyebrow: pastEyebrow,
      status: completionLine,
      statusIsDone: allDone,
      submeta: null,
      statusKind: "text",
    };
  }

  // ── Today ──
  // Eyebrow is "Viewing Today, [date]" — same shape as past/future, signaling
  // the current date explicitly. Anchor info, when set, becomes a suffix
  // (matching the read-only/editing suffix shape on past days).
  const todayEyebrowText = `Viewing Today, ${dateStr}`;

  if (scheduleMode === "none") {
    return {
      eyebrow: { text: todayEyebrowText },
      status: viewDate.toLocaleDateString("en-US", { weekday: "long" }),
      submeta: allDone ? "Protocol complete" : completionText,
      statusKind: "text",
    };
  }

  if (scheduleMode === "fixed") {
    if (allDone) {
      return { eyebrow: { text: todayEyebrowText }, status: "Done for today", submeta: null, statusKind: "text" };
    }
    if (nextFixedSlot) {
      return {
        eyebrow: { text: todayEyebrowText },
        status: nextFixedSlot.time,
        submeta: `Next · ${nextFixedSlot.label}`,
        statusKind: "time",
      };
    }
    return {
      eyebrow: { text: todayEyebrowText },
      status: completionText || "Fixed schedule",
      submeta: null,
      statusKind: "text",
    };
  }

  if (scheduleMode === "fasting") {
    if (allDone) {
      return { eyebrow: { text: todayEyebrowText }, status: "Done for today", submeta: null, statusKind: "text" };
    }
    return {
      eyebrow: { text: todayEyebrowText },
      status: eatingWindowStart || "--:--",
      submeta: "Eating window opens",
      statusKind: "time",
    };
  }

  // Anchor (medication / wakeup)
  if (!effectivePill) {
    // D1: No anchor set. Logging still works — slot times read "--:--".
    return {
      eyebrow: { text: todayEyebrowText },
      status: "Not started yet",
      submeta: scheduleMode === "wakeup"
        ? "Set your wake time to schedule the day"
        : "Set your meds time to schedule the day",
      statusKind: "text",
      showSetAnchor: true,
    };
  }

  // Anchor set — anchor info ("Started at HH:MM") is the primary status line
  // for an in-progress day (it's the concrete, actionable data). Completion
  // count rolls in the submeta. On all-done, the celebratory "Done for today"
  // takes the primary spot and anchor info drops to submeta.
  //
  // anchorPrefix + anchorTime are exposed separately (in addition to the
  // joined string) so the renderer can swap just the time portion with an
  // input during edit, keeping the prefix visible for continuity.
  const anchorPrefix = "Started at";
  const anchorTime   = effectivePill;
  const anchorLine   = `${anchorPrefix} ${anchorTime}`;
  if (allDone) {
    return {
      eyebrow: { text: todayEyebrowText },
      status: "Done for today",
      statusIsDone: true,
      submeta: anchorLine,
      anchorPrefix, anchorTime,
      editAnchorOn: "submeta",
      statusKind: "text",
    };
  }
  if (!completionText) {
    return {
      eyebrow: { text: todayEyebrowText },
      status: anchorLine,
      submeta: "Add items to start tracking",
      anchorPrefix, anchorTime,
      editAnchorOn: "status",
      statusKind: "text",
    };
  }
  return {
    eyebrow: { text: todayEyebrowText },
    status: anchorLine,
    submeta: completionText,
    anchorPrefix, anchorTime,
    editAnchorOn: "status",
    statusKind: "text",
  };
}

const START_LABELS = {
  medication: "Set anchor",
  wakeup:     "Set anchor",
};

// Status row reserves enough height for the time input + Save button so the
// Hero card doesn't reflow when the user taps edit on their anchor time.
const STATUS_ROW_MIN_HEIGHT = 44;

export default function Hero({
  scheduleMode, isToday, viewDate, shortDate, pct, coreTotal, coreDone,
  pillTime, anchorBehavior, consistentTime, eatingWindowStart,
  editPillTime, setEditPillTime, tmpTime, setTmpTime, setPillForDay,
  isFuture, flashGreen, startDay, viewDay,
  isPast, isReadOnly,
  nextFixedSlot,
}) {
  const { theme } = useTheme();

  const state = getHeroState({
    scheduleMode, isToday, isPast, isFuture, isReadOnly, viewDate,
    pillTime, anchorBehavior, consistentTime, eatingWindowStart,
    nextFixedSlot, pct, coreTotal, coreDone,
  });

  const isAnchor    = scheduleMode === "medication" || scheduleMode === "wakeup";
  const isConsistent= anchorBehavior === "consistent";
  const hasAnchor   = pillTime != null || isConsistent;

  // Inline editor for an already-set anchor time. Always show the eyebrow
  // unchanged while editing — the editor swaps in for the status row only.
  const isEditingPill = editPillTime && pillTime && !isReadOnly;

  const statusColor = state.statusIsDone ? theme.status.success : theme.text.primary;

  // Reusable "edit" affordance for the anchor time. Renders next to either
  // the status line or submeta depending on state.editAnchorOn.
  const editAnchorAffordanceVisible = isAnchor && hasAnchor && !isPast && !isReadOnly && !isEditingPill;
  const editAnchorButton = editAnchorAffordanceVisible ? (
    <button
      onClick={() => { setTmpTime(pillTime || ""); setEditPillTime(true); }}
      style={{
        fontSize: typography.label,
        color: theme.text.muted,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: `0 ${spacing.xxs}px`,
        minHeight: 24,
        fontFamily: "inherit",
        letterSpacing: typography.labelSpacing,
        flexShrink: 0,
      }}
      aria-label="Edit anchor time"
    >
      edit
    </button>
  ) : null;

  return (
    <Card style={{
      border: `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
      backdropFilter: effects.backdropBlur,
      WebkitBackdropFilter: effects.backdropBlur,
      padding: `${spacing.sm}px ${spacing.md}px`,
      marginBottom: spacing.md,
      background: flashGreen ? theme.status.successSubtle : theme.surface.card,
      transition: "background 0.4s ease",
      // Single minHeight covering all states (past · today · future · all modes ·
      // editing). Card is itself a flex column with justifyContent: center so
      // shorter content sits in the middle of the card, not hugging the top.
      // Result: a state with 2 text lines reads as the same shape as a state
      // with 3 lines + a pill — content always centered, card always 132+ tall.
      minHeight: 132,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}>

      <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Eyebrow — one consistent slot for both past and today. Always
              just the date (plus suffix for read-only/editing on past). */}
          <div style={{
            fontSize: typography.label,
            color: theme.text.secondary,
            fontWeight: typography.semibold,
            letterSpacing: typography.labelSpacingWide,
            textTransform: "uppercase",
            fontFamily: typography.fontHeading,
            marginBottom: spacing.xxs,
            minHeight: 16,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {state.eyebrow.text}
            {state.eyebrow.suffix && (
              <span style={{
                marginLeft: spacing.xxs,
                color: state.eyebrow.suffixTone === "accent" ? theme.accent.default : theme.text.muted,
              }}>
                · {state.eyebrow.suffix}
              </span>
            )}
          </div>

          {/* Status row — reserved height keeps the card from reflowing
              when the time editor swaps in for just the time portion of the
              status text. The "Started at" prefix stays visible during edit
              with identical typography so it doesn't shift between states. */}
          {(() => {
            // Pre-compute the title-text style so the prefix during edit and
            // the full status text in display render with identical metrics
            // (font, size, weight, line-height) — no vertical jump on swap.
            const statusTextStyle = {
              fontSize: state.statusKind === "time" ? typography.display : typography.title,
              fontWeight: typography.bold,
              fontFamily: typography.fontHeading,
              letterSpacing: state.statusKind === "time" ? typography.displayLetterSpacing : typography.headingLetterSpacing,
              lineHeight: 1.2,
            };
            return (
              <div style={{ minHeight: STATUS_ROW_MIN_HEIGHT, display: "flex", alignItems: "center", gap: spacing.xs, width: "100%", minWidth: 0 }}>
                {(isEditingPill && state.editAnchorOn === "status") ? (
                  <>
                    {state.anchorPrefix && (
                      <span style={{ ...statusTextStyle, color: theme.text.primary, flexShrink: 0 }}>
                        {state.anchorPrefix}
                      </span>
                    )}
                    <Input variant="time" value={tmpTime} onChange={e => setTmpTime(e.target.value)} style={{ flex: 1, minWidth: 0, padding: `${spacing.xxs}px ${spacing.xs}px`, fontSize: typography.body }} />
                    <Button variant="secondary" size="compact" onClick={() => { setPillForDay(tmpTime); setEditPillTime(false); }}>Save</Button>
                  </>
                ) : (
                  <>
                    <div style={{
                      ...statusTextStyle,
                      color: statusColor,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {state.status}
                    </div>
                    {state.editAnchorOn === "status" && editAnchorButton}
                  </>
                )}
              </div>
            );
          })()}

          {/* Submeta — stays visible during edit so the card height doesn't
              shift. When the edit affordance lives on the submeta row (today
              all-done state), the time input swaps in here instead. */}
          {state.submeta && (
            <div style={{
              fontSize: typography.caption,
              color: theme.text.secondary,
              marginTop: spacing.xxxs,
              display: "flex",
              alignItems: "center",
              gap: spacing.xs,
            }}>
              {(isEditingPill && state.editAnchorOn === "submeta") ? (
                <>
                  {state.anchorPrefix && (
                    <span style={{ flexShrink: 0 }}>{state.anchorPrefix}</span>
                  )}
                  <Input variant="time" value={tmpTime} onChange={e => setTmpTime(e.target.value)} style={{ flex: 1, minWidth: 0, padding: `${spacing.xxs}px ${spacing.xs}px`, fontSize: typography.body }} />
                  <Button variant="secondary" size="compact" onClick={() => { setPillForDay(tmpTime); setEditPillTime(false); }}>Save</Button>
                </>
              ) : (
                <>
                  <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {state.submeta}
                  </span>
                  {state.editAnchorOn === "submeta" && editAnchorButton}
                </>
              )}
            </div>
          )}

          {/* Inline anchor-setting pill — replaces the old Start-my-day CTA.
              Tappable, not required. D1: logging works without it. */}
          {state.showSetAnchor && !isReadOnly && !isEditingPill && (
            <button
              onClick={startDay}
              style={{
                marginTop: spacing.sm,
                display: "inline-flex",
                alignItems: "center",
                gap: spacing.xxs,
                padding: `${spacing.xxs}px ${spacing.xs}px`,
                border: `${theme.borderWidth.default}px solid ${theme.border.strong}`,
                background: "transparent",
                color: theme.text.primary,
                fontSize: typography.caption,
                fontFamily: "inherit",
                cursor: "pointer",
                minHeight: touch.min,
                boxSizing: "border-box",
                WebkitTapHighlightColor: "transparent",
              }}
              aria-label={`Set ${scheduleMode === "wakeup" ? "wake" : "meds"} anchor to now`}
            >
              <span style={{ color: theme.text.secondary }}>+</span>
              <span>{START_LABELS[scheduleMode] || "Set anchor"}</span>
            </button>
          )}
        </div>
        <AdherenceRing percentage={pct} size={72} />
      </div>
    </Card>
  );
}
