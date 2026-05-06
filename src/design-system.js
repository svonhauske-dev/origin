// ── Tether Design System ─────────────────────────────────────────────────────────

export const colors = {
  // Surfaces — softly warm paper feel, lifted white surfaces
  bgBase:          "#F4F6F8",   // cool off-white, subtle blue undertone
  bgGradientMid:   "#F2F4F6",   // gradient stop
  bgGradientEnd:   "#EEF1F4",   // gradient end — slightly cooler
  bgModal:         "#FFFFFF",   // pure white for modals/cards
  bgCard:          "#FFFFFF",   // slot cards
  bgCardSubtle:    "#F4F6F8",   // matches base for nested elements
  bgBackdrop:      "rgba(26,26,26,0.55)",
  bgInput:         "#FFFFFF",
  bgInputDisabled: "#F2F4F6",

  // Text — near-black ink, soft greys
  textPrimary:     "#1A1A1A",   // near-black, deep but not harsh
  textSecondary:   "#5A6168",   // cool charcoal
  textMuted:       "#8A929A",   // cool mid-grey
  textDisabled:    "#BFC4CA",
  textOnAccent:    "#FFFFFF",
  textOnDanger:    "#FFFFFF",

  // Accent — deep ink-blue, single confident color
  accent:          "#1A1A1A",   // near-black ink — action color
  accentHover:     "#000000",   // pure black on hover/press
  accentSubtle:    "#EEF1F4",   // cool pale grey for ghost-active states

  // Borders — hairline restraint
  borderSubtle:    "#E2E6EA",   // cool hairline
  borderStrong:    "#2C2C2C",   // when a border needs to assert (rare)
  borderFocus:     "#1A1A1A",   // matches accent, focus rings

  // Slot colors — all collapsed to single muted grey
  slotAnchor:       "#5C5C5C",
  slotPreBreakfast: "#5C5C5C",
  slotBreakfast:    "#5C5C5C",
  slotPreLunch:     "#5C5C5C",
  slotLunch:        "#5C5C5C",
  slotPreDinner:    "#5C5C5C",
  slotDinner:       "#5C5C5C",
  slotEvening:      "#5C5C5C",
  slotInjectable:   "#5C5C5C",
  slotTopical:      "#5C5C5C",

  // Status — restrained even in error states
  success:         "#3D6647",   // deep muted forest green
  danger:          "#8C3F3F",   // deep muted oxide red
  dangerSubtle:    "#F2E8E8",
  warning:         "#8C7240",   // deep muted ochre
  warningSubtle:   "#F2EDE5",

  // ── Backward-compat aliases — components reference these; do not remove ──────
  accentDim:              "#EEF1F4",             // → accentSubtle
  accentBorder:           "rgba(26,26,26,0.3)",  // derived from accent
  bgCardHover:            "#EEF1F4",             // subtle hover on white — cool grey
  borderBase:             "#E2E6EA",             // → borderSubtle
  textDone:               "#8A929A",             // → textMuted
  textFaint:              "rgba(26,26,26,0.3)",  // very faint (date sublabel)
  dangerBorder:           "rgba(140,63,63,0.3)", // derived from danger
  cardSubtle:             "#F4F6F8",             // → bgCardSubtle
  divider:                "#E2E6EA",             // → borderSubtle
  statusMissedBorder:     "rgba(140,114,64,0.35)",
  statusMissedBg:         "rgba(140,114,64,0.05)",
  statusMissedHover:      "rgba(140,114,64,0.08)",
  statusMissedBadgeBg:    "#F2EDE5",               // → warningSubtle
  statusMissedBadgeColor: "#8C7240",               // → warning
  statusNowBorder:        "rgba(26,26,26,0.35)",
  statusNowBg:            "rgba(26,26,26,0.04)",
  statusNowHover:         "rgba(26,26,26,0.07)",
  statusNowBadgeBg:       "rgba(26,26,26,0.14)",
  slotRx:                 "#5C5C5C",             // → slotAnchor
  slotAfterDinner:        "#5C5C5C",             // → slotEvening
};

export const spacing = {
  xxxs: 2,
  xxs:  4,
  xs:   8,
  sm:   12,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
};

export const radius = {
  xs:   2,    // badges, tags
  sm:   4,    // checkboxes, tight UI elements
  md:   12,   // cards, modals, inputs — canonical surface radius
  lg:   16,   // unused — reserved for larger surfaces
  xl:   20,   // unused — reserved for extra-large surfaces
  full: 9999, // pill buttons, avatars
};

export const typography = {
  // Sizes — all multiples of 2
  caption2: 10,
  label:    12,
  caption:  14,
  body:     16,
  title:    18,
  heading:  22,
  display:  32,

  // Weights
  regular:  400,
  medium:   500,
  semibold: 600,
  bold:     700,

  // Letter spacing
  labelSpacingTight:    "0.04em",
  labelSpacing:         "0.08em",
  labelSpacingWide:     "0.1em",
  headingLetterSpacing: "-0.02em",
  displayLetterSpacing: "-0.04em",

  // Font families — single Geist system
  fontBody:    '"Geist", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
  fontHeading: '"Geist", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
};

export const touch = {
  min: 44, // single-line touch target — buttons, icon buttons
  row: 52, // multi-line touch target — supplement rows with name + dose
};

export const layout = {
  closeButton:      44,
  modeButtonHeight: 64,
  segHeight:        40,
  maxContentWidth:  480,
  signInWidth:      360,
  toastMaxWidth:    448,
  labelColumn:      60, // fixed-width label column in meal schedule rows
};

export const gradients = {
  bg: `linear-gradient(180deg,${colors.bgBase} 0%,${colors.bgGradientMid} 50%,${colors.bgGradientEnd} 100%)`,
};

export const shadows = {
  card:    "0 1px 2px rgba(26,26,26,0.04)",
  modal:   "0 8px 32px rgba(26,26,26,0.08), 0 2px 8px rgba(26,26,26,0.04)",
  popover: "0 4px 16px rgba(26,26,26,0.06)",
  toast:   "0 4px 16px rgba(26,26,26,0.10)",
  focus:   "0 0 0 3px rgba(26,26,26,0.15)",
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

export const segBtnStyle = (on) => ({
  flex: 1,
  padding: `${spacing.sm}px`,
  borderRadius: radius.full,
  cursor: "pointer",
  fontSize: typography.caption,
  fontFamily: typography.fontBody,
  background: on ? colors.accentSubtle : "transparent",
  color: on ? colors.accent : colors.textSecondary,
  border: `1px solid ${on ? colors.accent : colors.borderSubtle}`,
  fontWeight: on ? typography.semibold : typography.regular,
  minHeight: layout.segHeight,
});

// ── Theme tokens ───────────────────────────────────────────────────────────────

const SLOTS_LIGHT   = { anchor:"#5C5C5C", preBreakfast:"#5C5C5C", breakfast:"#5C5C5C", preLunch:"#5C5C5C", lunch:"#5C5C5C", preDinner:"#5C5C5C", dinner:"#5C5C5C", evening:"#5C5C5C", injectable:"#5C5C5C", topical:"#5C5C5C" };
const SLOTS_DARK    = { anchor:"#A8A8AE", preBreakfast:"#A8A8AE", breakfast:"#A8A8AE", preLunch:"#A8A8AE", lunch:"#A8A8AE", preDinner:"#A8A8AE", dinner:"#A8A8AE", evening:"#A8A8AE", injectable:"#A8A8AE", topical:"#A8A8AE" };
const SLOTS_MUTED   = { anchor:"#7A7E98", preBreakfast:"#7A7E98", breakfast:"#7A7E98", preLunch:"#7A7E98", lunch:"#7A7E98", preDinner:"#7A7E98", dinner:"#7A7E98", evening:"#7A7E98", injectable:"#7A7E98", topical:"#7A7E98" };
const SLOTS_WARM    = { anchor:"#7A6E64", preBreakfast:"#7A6E64", breakfast:"#7A6E64", preLunch:"#7A6E64", lunch:"#7A6E64", preDinner:"#7A6E64", dinner:"#7A6E64", evening:"#7A6E64", injectable:"#7A6E64", topical:"#7A6E64" };
const SLOTS_PURPLE  = { anchor:"#7874A0", preBreakfast:"#7874A0", breakfast:"#7874A0", preLunch:"#7874A0", lunch:"#7874A0", preDinner:"#7874A0", dinner:"#7874A0", evening:"#7874A0", injectable:"#7874A0", topical:"#7874A0" };

export const themes = {
  light: {
    surface: {
      canvas:        "#F4F6F8",
      gradientMid:   "#F2F4F6",
      gradientEnd:   "#EEF1F4",
      modal:         "#FFFFFF",
      card:          "#FFFFFF",
      cardSubtle:    "#F4F6F8",
      backdrop:      "rgba(26,26,26,0.55)",
      input:         "#FFFFFF",
      inputDisabled: "#F2F4F6",
      cardHover:     "#EEF1F4",
      knob:          "#FFFFFF",
    },
    text: {
      primary:   "#1A1A1A",
      secondary: "#5A6168",
      muted:     "#8A929A",
      disabled:  "#BFC4CA",
      onAccent:  "#FFFFFF",
      onDanger:  "#FFFFFF",
      faint:     "rgba(26,26,26,0.3)",
    },
    accent: {
      default: "#1A1A1A",
      hover:   "#000000",
      subtle:  "#EEF1F4",
      border:  "rgba(26,26,26,0.3)",
    },
    border: {
      subtle: "#E2E6EA",
      strong: "#2C2C2C",
      focus:  "#1A1A1A",
    },
    slot: SLOTS_LIGHT,
    status: {
      success:          "#3D6647",
      danger:           "#8C3F3F",
      dangerSubtle:     "#F2E8E8",
      dangerBorder:     "rgba(140,63,63,0.3)",
      warning:          "#8C7240",
      warningSubtle:    "#F2EDE5",
      missedBorder:     "rgba(140,114,64,0.35)",
      missedBg:         "rgba(140,114,64,0.05)",
      missedHover:      "rgba(140,114,64,0.08)",
      missedBadgeBg:    "#F2EDE5",
      missedBadgeColor: "#8C7240",
      nowBorder:        "rgba(26,26,26,0.35)",
      nowBg:            "rgba(26,26,26,0.04)",
      nowHover:         "rgba(26,26,26,0.07)",
      nowBadgeBg:       "rgba(26,26,26,0.14)",
    },
    gradients: {
      bg: "linear-gradient(180deg,#F4F6F8 0%,#F2F4F6 50%,#EEF1F4 100%)",
    },
  },

  dark: {
    surface: {
      canvas:        "#0D0D0F",
      gradientMid:   "#0D0D0F",
      gradientEnd:   "#0D0D0F",
      modal:         "#1A1A1F",
      card:          "#16161A",
      cardSubtle:    "#111114",
      backdrop:      "rgba(0,0,0,0.7)",
      input:         "#16161A",
      inputDisabled: "#111114",
      cardHover:     "#1E1E24",
      knob:          "#F5F5F7",
    },
    text: {
      primary:   "#F5F5F7",
      secondary: "#A8A8AE",
      muted:     "#6E6E74",
      disabled:  "#3E3E44",
      onAccent:  "#0D0D0F",
      onDanger:  "#FFFFFF",
      faint:     "rgba(245,245,247,0.3)",
    },
    accent: {
      default: "#F5F5F7",
      hover:   "rgba(255,255,255,0.92)",
      subtle:  "rgba(255,255,255,0.08)",
      border:  "#F5F5F7",
    },
    border: {
      subtle: "rgba(255,255,255,0.06)",
      strong: "rgba(255,255,255,0.12)",
      focus:  "#F5F5F7",
    },
    slot: SLOTS_DARK,
    status: {
      success:          "#7FB89A",
      danger:           "#D49494",
      dangerSubtle:     "rgba(212,148,148,0.08)",
      dangerBorder:     "rgba(212,148,148,0.3)",
      warning:          "#C4A569",
      warningSubtle:    "rgba(196,165,105,0.08)",
      missedBorder:     "rgba(196,165,105,0.35)",
      missedBg:         "rgba(196,165,105,0.06)",
      missedHover:      "rgba(196,165,105,0.10)",
      missedBadgeBg:    "rgba(196,165,105,0.12)",
      missedBadgeColor: "#C4A569",
      nowBorder:        "rgba(245,245,247,0.14)",
      nowBg:            "rgba(245,245,247,0.04)",
      nowHover:         "rgba(245,245,247,0.08)",
      nowBadgeBg:       "rgba(245,245,247,0.14)",
    },
    gradients: {
      bg: "#0D0D0F",
    },
  },

  cosmic: {
    surface: {
      canvas:        "#0A0A0F",
      gradientMid:   "#0D0D14",
      gradientEnd:   "#0F0F18",
      modal:         "#141420",
      card:          "#141420",
      cardSubtle:    "#111118",
      backdrop:      "rgba(0,0,8,0.70)",
      input:         "#1A1A28",
      inputDisabled: "#111118",
      cardHover:     "#1E1E2E",
      knob:          "#E8E9EC",
    },
    text: {
      primary:   "#E8E9EC",
      secondary: "#8A8EA8",
      muted:     "#5C607A",
      disabled:  "#3C4060",
      onAccent:  "#0A0A0F",
      onDanger:  "#FFFFFF",
      faint:     "rgba(232,233,236,0.3)",
    },
    accent: {
      default: "#E8E9EC",
      hover:   "#FFFFFF",
      subtle:  "#1A1A28",
      border:  "rgba(232,233,236,0.2)",
    },
    border: {
      subtle: "rgba(255,255,255,0.08)",
      strong: "#B8BAC8",
      focus:  "#E8E9EC",
    },
    slot: SLOTS_MUTED,
    status: {
      success:          "#4A8A5C",
      danger:           "#B04848",
      dangerSubtle:     "#1A0E18",
      dangerBorder:     "rgba(176,72,72,0.3)",
      warning:          "#A08040",
      warningSubtle:    "#181408",
      missedBorder:     "rgba(160,128,64,0.35)",
      missedBg:         "rgba(160,128,64,0.08)",
      missedHover:      "rgba(160,128,64,0.12)",
      missedBadgeBg:    "#181408",
      missedBadgeColor: "#A08040",
      nowBorder:        "rgba(232,233,236,0.35)",
      nowBg:            "rgba(232,233,236,0.05)",
      nowHover:         "rgba(232,233,236,0.09)",
      nowBadgeBg:       "rgba(232,233,236,0.12)",
    },
    gradients: {
      bg: "linear-gradient(180deg,#0A0A0F 0%,#0D0D14 50%,#0F0F18 100%)",
    },
  },

  warmGrey: {
    surface: {
      canvas:        "#F4F1ED",
      gradientMid:   "#F1EDE8",
      gradientEnd:   "#EDE9E3",
      modal:         "#FAF8F5",
      card:          "#FAF8F5",
      cardSubtle:    "#F4F1ED",
      backdrop:      "rgba(31,26,20,0.55)",
      input:         "#FAF8F5",
      inputDisabled: "#F1EDE8",
      cardHover:     "#EDE9E3",
      knob:          "#FFFFFF",
    },
    text: {
      primary:   "#1F1A14",
      secondary: "#6B5E50",
      muted:     "#9A8878",
      disabled:  "#C4B8AC",
      onAccent:  "#FAF8F5",
      onDanger:  "#FFFFFF",
      faint:     "rgba(31,26,20,0.3)",
    },
    accent: {
      default: "#1F1A14",
      hover:   "#000000",
      subtle:  "#EDE9E3",
      border:  "rgba(31,26,20,0.3)",
    },
    border: {
      subtle: "#DDD7CF",
      strong: "#1F1A14",
      focus:  "#1F1A14",
    },
    slot: SLOTS_WARM,
    status: {
      success:          "#3D6647",
      danger:           "#8C3F3F",
      dangerSubtle:     "#F4E8E4",
      dangerBorder:     "rgba(140,63,63,0.3)",
      warning:          "#8C6840",
      warningSubtle:    "#F4ECE0",
      missedBorder:     "rgba(140,104,64,0.35)",
      missedBg:         "rgba(140,104,64,0.05)",
      missedHover:      "rgba(140,104,64,0.08)",
      missedBadgeBg:    "#F4ECE0",
      missedBadgeColor: "#8C6840",
      nowBorder:        "rgba(31,26,20,0.35)",
      nowBg:            "rgba(31,26,20,0.04)",
      nowHover:         "rgba(31,26,20,0.07)",
      nowBadgeBg:       "rgba(31,26,20,0.14)",
    },
    gradients: {
      bg: "linear-gradient(180deg,#F4F1ED 0%,#F1EDE8 50%,#EDE9E3 100%)",
    },
  },

  linear: {
    surface: {
      canvas:        "#08070D",
      gradientMid:   "#0B0A12",
      gradientEnd:   "#0E0C16",
      modal:         "#16141F",
      card:          "#16141F",
      cardSubtle:    "#120F1A",
      backdrop:      "rgba(0,0,5,0.70)",
      input:         "#1C1926",
      inputDisabled: "#120F1A",
      cardHover:     "#1E1B2A",
      knob:          "#E2E0EC",
    },
    text: {
      primary:   "#E2E0EC",
      secondary: "#8882A8",
      muted:     "#5C587A",
      disabled:  "#3C3860",
      onAccent:  "#FFFFFF",
      onDanger:  "#FFFFFF",
      faint:     "rgba(226,224,236,0.3)",
    },
    accent: {
      default: "#5E6AD2",
      hover:   "#7880E0",
      subtle:  "#1A1830",
      border:  "rgba(94,106,210,0.4)",
    },
    border: {
      subtle: "rgba(255,255,255,0.06)",
      strong: "#A8A4C8",
      focus:  "#5E6AD2",
    },
    slot: SLOTS_PURPLE,
    status: {
      success:          "#3D7A5A",
      danger:           "#C05050",
      dangerSubtle:     "#200E18",
      dangerBorder:     "rgba(192,80,80,0.3)",
      warning:          "#B09040",
      warningSubtle:    "#1E1808",
      missedBorder:     "rgba(176,144,64,0.35)",
      missedBg:         "rgba(176,144,64,0.08)",
      missedHover:      "rgba(176,144,64,0.12)",
      missedBadgeBg:    "#1E1808",
      missedBadgeColor: "#B09040",
      nowBorder:        "rgba(94,106,210,0.5)",
      nowBg:            "rgba(94,106,210,0.08)",
      nowHover:         "rgba(94,106,210,0.12)",
      nowBadgeBg:       "rgba(94,106,210,0.20)",
    },
    gradients: {
      bg: "linear-gradient(180deg,#08070D 0%,#0B0A12 50%,#0E0C16 100%)",
    },
  },
};
