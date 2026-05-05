// ── Tether Design System ─────────────────────────────────────────────────────────

export const colors = {
  // Accent
  accent:        "#384361",   // deep slate blue
  accentHover:   "#2D3650",   // deeper on press/hover
  accentDim:     "#E5E8F0",   // pale slate tint — ghost active, selected backgrounds
  accentSubtle:  "#E5E8F0",   // alias for accentDim
  accentBorder:  "rgba(56,67,97,0.3)",

  // Backgrounds
  bgBase:        "#F5F6F8",   // main app background — cool light grey
  bgGradientMid: "#F2F3F5",   // near-imperceptible gradient stop
  bgGradientEnd: "#EEF0F3",   // gradient end — slightly cooler
  bgModal:       "#FFFFFF",   // modal / card surfaces — pure white
  bgCard:        "#FFFFFF",   // slot cards, supplement rows
  bgCardHover:   "#F0F2F5",   // subtle hover on white surfaces
  bgCardSubtle:  "#FAFBFC",   // nested / inset surfaces
  bgBackdrop:    "rgba(28,30,33,0.4)", // modal backdrop — cool ink
  bgInput:       "#FFFFFF",   // input field background
  bgInputDisabled: "#F2F3F5", // disabled input

  // Text
  textPrimary:   "#1C1E21",   // deep cool ink
  textSecondary: "#4A5159",   // cool charcoal
  textMuted:     "#7A8189",   // cool mid-grey
  textDone:      "#7A8189",   // completed / struck-through items
  textFaint:     "rgba(28,30,33,0.3)", // very faint (date sublabel)
  textDisabled:  "#B5BBC2",
  textOnAccent:  "#FFFFFF",   // white on slate blue
  textOnDanger:  "#FFFFFF",   // white on danger

  // Borders
  borderStrong:  "#C7CCD2",   // prominent dividers, drag handles
  borderBase:    "#DDE0E5",   // standard borders
  borderSubtle:  "#E5E9EE",   // barely-there divisions
  borderFocus:   "#384361",   // focused inputs — matches accent

  // Semantic
  danger:        "#9B5757",   // desaturated cool clay-red
  dangerBorder:  "rgba(155,87,87,0.3)",
  dangerSubtle:  "#F5E8E8",   // pale red tint
  success:       "#5A7C5C",   // muted cool sage
  warning:       "#9B8557",   // muted cool olive
  warningSubtle: "#F5EFE5",

  // Surfaces
  cardSubtle: "#F8F9FA",      // very slightly off-white card variant
  divider:    "#ECEEF1",      // ultra-light row divider

  // Slot status — clay-red for missed, accent for now
  statusMissedBorder:     "rgba(155,87,87,0.35)",
  statusMissedBg:         "rgba(155,87,87,0.05)",
  statusMissedHover:      "rgba(155,87,87,0.08)",
  statusMissedBadgeBg:    "rgba(155,87,87,0.12)",
  statusMissedBadgeColor: "#9B5757",
  statusNowBorder:        "rgba(56,67,97,0.35)",
  statusNowBg:            "rgba(56,67,97,0.04)",
  statusNowHover:         "rgba(56,67,97,0.07)",
  statusNowBadgeBg:       "rgba(56,67,97,0.14)",

  // Slot colors — desaturated cool tones, walking cool spectrum
  slotRx:          "#5C6F7A",   // cool slate (anchor/rx)
  slotPreBreakfast:"#647A82",   // cool steel
  slotBreakfast:   "#6E8595",   // dusty cool blue
  slotPreLunch:    "#6F8388",   // cool teal-grey
  slotLunch:       "#73867E",   // muted sage-grey
  slotPreDinner:   "#6B7C7E",   // cool stone
  slotDinner:      "#5A6B72",   // deep cool slate
  slotAfterDinner: "#4D5862",   // charcoal blue-grey (evening)
  slotInjectable:  "#6F7888",   // neutral cool grey
  slotTopical:     "#7A8088",   // slightly lighter cool grey
};

export const spacing = {
  xxxs: 2,   // tighter than xxs, for 2px margins
  xxs:  4,
  xs:   8,
  sm:   12,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
};

export const radius = {
  xs:   4,    // badges, tags
  sm:   8,    // inputs, small buttons
  md:   12,   // inner cards, rows
  lg:   16,   // buttons, cards
  xl:   24,   // modals, large cards
  full: 9999, // pill buttons, avatars
};

export const typography = {
  // Sizes — all multiples of 2
  caption2: 10,   // very compact sublabels (unchanged)
  label:    12,
  caption:  14,
  body:     16,
  title:    18,
  heading:  22,   // new — section/modal headings
  display:  32,   // new — large display numbers (anchor time)
  hero:     28,   // preserved — app title, empty-state emoji

  // Weights
  regular:  400,
  medium:   500,
  semibold: 600,
  bold:     700,

  // Letter spacing
  labelSpacingTight:    "0.04em",
  labelSpacing:         "0.08em",
  labelSpacingWide:     "0.1em",
  headingLetterSpacing: "-0.02em", // headings and display dates
  displayLetterSpacing: "-0.04em", // large anchor time display

  // Font families
  fontBody:    "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  fontHeading: "'Ubuntu', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
};

export const touch = {
  min: 44,
};

export const layout = {
  closeButton:      32,  // close button (✕) width/height
  modeButtonHeight: 64,  // schedule mode grid button height
  segHeight:        40,  // segmented control height (intentionally below touch.min)
  maxContentWidth:  480, // maximum width for page/modal content
  signInWidth:      360, // sign-in form max width
  toastMaxWidth:    448, // toast container max width (maxContentWidth - md*2)
};

export const gradients = {
  bg: `linear-gradient(165deg,${colors.bgBase} 0%,${colors.bgGradientMid} 50%,${colors.bgGradientEnd} 100%)`,
};

export const shadows = {
  card:    "0 1px 3px rgba(28,30,33,0.04), 0 1px 2px rgba(28,30,33,0.06)",
  modal:   "0 12px 40px rgba(28,30,33,0.10), 0 4px 12px rgba(28,30,33,0.06)",
  popover: "0 8px 24px rgba(28,30,33,0.08), 0 2px 6px rgba(28,30,33,0.05)",
  toast:   "0 8px 24px rgba(28,30,33,0.12)",
  focus:   "0 0 0 3px rgba(56,67,97,0.15)",
};

export const zIndex = {
  backdrop: 199,
  modal:    200,
  toast:    400,
};

export const effects = {
  backdropBlur: "blur(8px) saturate(1.2)",
};

// ── Reusable style objects ──────────────────────────────────────────────────────

export const ghostButtonStyle = {
  background: "transparent",
  border: `1px solid ${colors.borderStrong}`,
  borderRadius: radius.lg,
  color: colors.textSecondary,
  cursor: "pointer",
  fontSize: typography.caption,
  fontWeight: typography.medium,
  minHeight: touch.min,
  padding: `${spacing.xs}px ${spacing.md}px`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  WebkitTapHighlightColor: "transparent",
};

export const segBtnStyle = (on) => ({
  flex: 1,
  padding: `${spacing.sm}px`,
  borderRadius: radius.md,
  cursor: "pointer",
  fontSize: typography.caption,
  fontFamily: typography.fontBody,
  background: on ? colors.accentDim : "transparent",
  color: on ? colors.accent : colors.textSecondary,
  border: `1px solid ${on ? colors.accentBorder : colors.borderStrong}`,
  fontWeight: on ? typography.semibold : typography.regular,
  minHeight: layout.segHeight,
});
