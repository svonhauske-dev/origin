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
  xs2:  6,
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
  fontBody:    'var(--font-body)',
  fontHeading: 'var(--font-heading)',
  fontData:    'var(--font-data)',
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

const SLOTS_LIGHT        = { default: "#5C5C5C" };
const SLOTS_DARK         = { default: "#9A9AA0" };

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
      hover:         "#EEF1F4",
      knob:          "#FFFFFF",
      toggleOff:     "rgba(0,0,0,0.15)",
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
      default:   "#1A1A1A",
      hover:     "#000000",
      subtle:    "#EEF1F4",
      border:    "rgba(26,26,26,0.3)",
      onSubtle:  "#1A1A1A",
      track:     "rgba(26,26,26,0.1)",
    },
    border: {
      subtle: "#E2E6EA",
      strong: "#2C2C2C",
      focus:  "#1A1A1A",
    },
    slot: SLOTS_LIGHT,
    status: {
      success:          "#6FA88F",
      successSubtle:    "rgba(111,168,143,0.15)",
      successBorder:    "rgba(111,168,143,0.30)",
      danger:           "#A07076",
      dangerSubtle:     "rgba(160,112,118,0.10)",
      dangerBorder:     "rgba(160,112,118,0.3)",
      warning:          "#4D9090",
      warningSubtle:    "rgba(77,144,144,0.15)",
      warningBorder:    "rgba(77,144,144,0.30)",
      missedBorder:     "rgba(90,110,133,0.35)",
      missedBg:         "rgba(90,110,133,0.05)",
      missedHover:      "rgba(90,110,133,0.08)",
      missedBadgeBg:    "rgba(122,143,168,0.15)",
      missedBadgeColor: "#5A6E85",
      nowBorder:        "rgba(122,149,181,0.45)",
      nowBg:            "rgba(122,149,181,0.05)",
      nowHover:         "rgba(122,149,181,0.10)",
      nowBadgeBg:       "rgba(122,149,181,0.20)",
      nowBadgeText:     "#3D5266",
    },
    gradients: {
      bg: "linear-gradient(180deg,#F4F6F8 0%,#F2F4F6 50%,#EEF1F4 100%)",
    },
    radius: { surface: 12, surfaceInner: 4, pill: 999, badge: 999, button: 12, iconButton: 999, toggle: 13 },
    borderWidth: { subtle: 0.5, default: 1, accent: 1.5 },
    typography: {
      fontBody:    '"Geist", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontHeading: '"Geist", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontData:    '"Geist", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
  },

  dark: {
    surface: {
      canvas:        "#04060A",
      gradientMid:   "#04060A",
      gradientEnd:   "#04060A",
      modal:         "#04060A",
      card:          "#06080D",
      cardSubtle:    "#030507",
      backdrop:      "rgba(180,180,180,0.30)",
      input:         "#06080D",
      inputDisabled: "#030507",
      cardHover:     "#0C0F16",
      hover:         "#0C0F16",
      knob:          "#F5F5F7",
      toggleOff:     "#6E6E74",
    },
    text: {
      primary:   "#F5F5F7",
      secondary: "#A8A8AE",
      muted:     "#6E6E74",
      disabled:  "#3E3E44",
      onAccent:  "#04060A",
      onDanger:  "#FFFFFF",
      faint:     "rgba(245,245,247,0.3)",
    },
    accent: {
      default:  "#F5F5F7",
      hover:    "rgba(255,255,255,0.92)",
      subtle:   "rgba(255,255,255,0.08)",
      border:   "#FFFAF5",
      onSubtle: "#F5F5F7",
      track:    "rgba(245,245,247,0.1)",
    },
    border: {
      subtle: "rgba(255,250,245,0.10)",
      strong: "rgba(255,250,245,0.18)",
      focus:  "#FFFAF5",
    },
    slot: SLOTS_DARK,
    status: {
      success:          "#8FC2AC",
      successSubtle:    "rgba(143,194,172,0.15)",
      successBorder:    "rgba(143,194,172,0.30)",
      danger:           "#C49297",
      dangerSubtle:     "rgba(196,146,151,0.12)",
      dangerBorder:     "rgba(196,146,151,0.3)",
      warning:          "#6BAFAF",
      warningSubtle:    "rgba(107,175,175,0.15)",
      warningBorder:    "rgba(107,175,175,0.30)",
      missedBorder:     "rgba(164,181,200,0.35)",
      missedBg:         "rgba(164,181,200,0.06)",
      missedHover:      "rgba(164,181,200,0.10)",
      missedBadgeBg:    "rgba(164,181,200,0.15)",
      missedBadgeColor: "#A4B5C8",
      nowBorder:        "rgba(157,181,208,0.50)",
      nowBg:            "rgba(157,181,208,0.07)",
      nowHover:         "rgba(157,181,208,0.12)",
      nowBadgeBg:       "rgba(157,181,208,0.22)",
      nowBadgeText:     "#C2D2E5",
    },
    gradients: {
      bg: "#04060A",
    },
    radius: { surface: 12, surfaceInner: 4, pill: 999, badge: 999, button: 12, iconButton: 999, toggle: 13 },
    borderWidth: { subtle: 0.5, default: 1, accent: 1.5 },
    typography: {
      fontBody:    '"Geist", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontHeading: '"Geist", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontData:    '"Geist", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
  },

  clinicalInstrument: {
    surface: {
      canvas:        '#F5F7F9',
      gradientMid:   '#F3F5F7',
      gradientEnd:   '#EFF2F5',
      modal:         '#FFFFFF',
      card:          '#FFFFFF',
      cardSubtle:    '#F5F7F9',
      backdrop:      'rgba(26,40,56,0.60)',
      input:         '#FFFFFF',
      inputDisabled: '#F0F3F6',
      cardHover:     '#E5E9ED',
      hover:         '#E5E9ED',
      knob:          '#FFFFFF',
      toggleOff:     'rgba(94,123,139,0.25)',
    },
    text: {
      primary:   '#1A2530',
      secondary: '#4A5664',
      muted:     '#7C8896',
      disabled:  '#B0BAC4',
      onAccent:  '#FFFFFF',
      onDanger:  '#FFFFFF',
      faint:     'rgba(26,37,48,0.3)',
    },
    accent: {
      default:  '#5E7B8B',
      hover:    '#4A6473',
      subtle:   'rgba(94,123,139,0.10)',
      border:   'rgba(94,123,139,0.30)',
      onSubtle: '#5E7B8B',
      track:    'rgba(94,123,139,0.10)',
    },
    border: {
      subtle: '#D8DEE3',
      strong: '#C0C8D0',
      focus:  '#5E7B8B',
    },
    slot: { default: '#5E7B8B' },
    status: {
      success:          '#5E9E82',
      successSubtle:    'rgba(94,158,130,0.15)',
      successBorder:    'rgba(94,158,130,0.30)',
      danger:           '#A07678',
      dangerSubtle:     'rgba(160,118,120,0.10)',
      dangerBorder:     'rgba(160,118,120,0.3)',
      warning:          '#A89070',
      warningSubtle:    'rgba(168,144,112,0.15)',
      warningBorder:    'rgba(168,144,112,0.30)',
      missedBorder:     'rgba(150,130,100,0.35)',
      missedBg:         'rgba(150,130,100,0.05)',
      missedHover:      'rgba(150,130,100,0.08)',
      missedBadgeBg:    'rgba(150,130,100,0.15)',
      missedBadgeColor: '#8C7050',
      nowBorder:        'rgba(94,123,139,0.50)',
      nowBg:            'rgba(94,123,139,0.06)',
      nowHover:         'rgba(94,123,139,0.12)',
      nowBadgeBg:       'rgba(94,123,139,0.22)',
      nowBadgeText:     '#2C4555',
    },
    gradients: {
      bg: 'linear-gradient(180deg,#F5F7F9 0%,#F3F5F7 50%,#EFF2F5 100%)',
    },
    radius: { surface: 6, surfaceInner: 2, pill: 999, badge: 999, button: 6, iconButton: 999, toggle: 10 },
    borderWidth: { subtle: 0.5, default: 1, accent: 1.5 },
    typography: {
      fontBody:    '"IBM Plex Sans", -apple-system, sans-serif',
      fontHeading: '"IBM Plex Sans", -apple-system, sans-serif',
      fontData:    '"IBM Plex Mono", "Courier New", monospace',
    },
  },

  editorialMaterial: {
    surface: {
      canvas:        '#F8F5F0',
      gradientMid:   '#F5F2EC',
      gradientEnd:   '#F0EDE7',
      modal:         '#FFFEF9',
      card:          '#FFFEF9',
      cardSubtle:    '#F5F2EC',
      backdrop:      'rgba(26,24,21,0.65)',
      input:         '#FFFEF9',
      inputDisabled: '#EDE9E3',
      cardHover:     '#E8E4DC',
      hover:         '#E8E4DC',
      knob:          '#FFFEF9',
      toggleOff:     'rgba(44,41,38,0.20)',
    },
    text: {
      primary:   '#1A1815',
      secondary: '#4A4540',
      muted:     '#8A8278',
      disabled:  '#BDB5AA',
      onAccent:  '#FFFEF9',
      onDanger:  '#FFFEF9',
      faint:     'rgba(26,24,21,0.3)',
    },
    accent: {
      default:  '#2C2926',
      hover:    '#1A1815',
      subtle:   'rgba(44,41,38,0.08)',
      border:   'rgba(44,41,38,0.30)',
      onSubtle: '#2C2926',
      track:    'rgba(44,41,38,0.10)',
    },
    border: {
      subtle: '#D9D4CC',
      strong: '#BFB8AD',
      focus:  '#2C2926',
    },
    slot: { default: '#6A5E52' },
    status: {
      success:          '#A07650',
      successSubtle:    'rgba(160,118,80,0.15)',
      successBorder:    'rgba(160,118,80,0.30)',
      danger:           '#8C4F45',
      dangerSubtle:     'rgba(140,79,69,0.10)',
      dangerBorder:     'rgba(140,79,69,0.3)',
      warning:          '#9C7A3D',
      warningSubtle:    'rgba(156,122,61,0.15)',
      warningBorder:    'rgba(156,122,61,0.30)',
      missedBorder:     'rgba(120,100,70,0.35)',
      missedBg:         'rgba(120,100,70,0.05)',
      missedHover:      'rgba(120,100,70,0.08)',
      missedBadgeBg:    'rgba(120,100,70,0.15)',
      missedBadgeColor: '#7A6445',
      nowBorder:        'rgba(60,80,100,0.45)',
      nowBg:            'rgba(60,80,100,0.05)',
      nowHover:         'rgba(60,80,100,0.10)',
      nowBadgeBg:       'rgba(60,80,100,0.18)',
      nowBadgeText:     '#324252',
    },
    gradients: {
      bg: 'linear-gradient(180deg,#F8F5F0 0%,#F5F2EC 50%,#F0EDE7 100%)',
    },
    radius: { surface: 2, surfaceInner: 0, pill: 999, badge: 0, button: 2, iconButton: 999, toggle: 10 },
    borderWidth: { subtle: 0.5, default: 1, accent: 2 },
    typography: {
      fontBody:    '"Inter", -apple-system, sans-serif',
      fontHeading: '"Crimson Pro", Georgia, serif',
      fontData:    '"Inter", -apple-system, sans-serif',
    },
  },

  softFuturism: {
    surface: {
      canvas:        '#0A0E1A',
      gradientMid:   '#0A0E1A',
      gradientEnd:   '#0A0E1A',
      modal:         '#141826',
      card:          '#1A1F30',
      cardSubtle:    '#10141F',
      backdrop:      'rgba(0,0,0,0.65)',
      input:         '#141826',
      inputDisabled: '#10141F',
      cardHover:     '#1F2538',
      hover:         '#1F2538',
      knob:          '#E8EBF0',
      toggleOff:     'rgba(168,176,189,0.30)',
    },
    text: {
      primary:   '#E8EBF0',
      secondary: '#A8B0BD',
      muted:     '#6B7385',
      disabled:  '#3E4558',
      onAccent:  '#0A0E1A',
      onDanger:  '#0A0E1A',
      faint:     'rgba(232,235,240,0.3)',
    },
    accent: {
      default:  '#7FB8E8',
      hover:    '#99C8F0',
      subtle:   'rgba(127,184,232,0.12)',
      border:   'rgba(127,184,232,0.35)',
      onSubtle: '#7FB8E8',
      track:    'rgba(127,184,232,0.12)',
    },
    border: {
      subtle: 'rgba(168,176,189,0.12)',
      strong: 'rgba(168,176,189,0.25)',
      focus:  '#7FB8E8',
    },
    slot: { default: '#7FB8E8' },
    status: {
      success:          '#7FE0B0',
      successSubtle:    'rgba(127,224,176,0.15)',
      successBorder:    'rgba(127,224,176,0.30)',
      danger:           '#E89090',
      dangerSubtle:     'rgba(232,144,144,0.12)',
      dangerBorder:     'rgba(232,144,144,0.3)',
      warning:          '#E8C870',
      warningSubtle:    'rgba(232,200,112,0.15)',
      warningBorder:    'rgba(232,200,112,0.30)',
      missedBorder:     'rgba(168,176,189,0.35)',
      missedBg:         'rgba(168,176,189,0.06)',
      missedHover:      'rgba(168,176,189,0.10)',
      missedBadgeBg:    'rgba(168,176,189,0.15)',
      missedBadgeColor: '#A8B0BD',
      nowBorder:        'rgba(127,184,232,0.50)',
      nowBg:            'rgba(127,184,232,0.08)',
      nowHover:         'rgba(127,184,232,0.15)',
      nowBadgeBg:       'rgba(127,184,232,0.25)',
      nowBadgeText:     '#7FB8E8',
    },
    gradients: {
      bg: '#0A0E1A',
    },
    radius: { surface: 16, surfaceInner: 8, pill: 999, badge: 999, button: 16, iconButton: 999, toggle: 16 },
    borderWidth: { subtle: 0.5, default: 1, accent: 1.5 },
    typography: {
      fontBody:    '"Inter", -apple-system, sans-serif',
      fontHeading: '"Inter", -apple-system, sans-serif',
      fontData:    '"Inter", -apple-system, sans-serif',
    },
  },

  terminalPrecision: {
    surface: {
      canvas:        '#0D0D0D',
      gradientMid:   '#0D0D0D',
      gradientEnd:   '#0D0D0D',
      modal:         '#1A1A1A',
      card:          '#1A1A1A',
      cardSubtle:    '#161616',
      backdrop:      'rgba(0,0,0,0.75)',
      input:         '#1A1A1A',
      inputDisabled: '#161616',
      cardHover:     '#222222',
      hover:         '#222222',
      knob:          '#E8E2D6',
      toggleOff:     '#3A3A3A',
    },
    text: {
      primary:   '#E8E2D6',
      secondary: '#A89E8A',
      muted:     '#6B6356',
      disabled:  '#3A3530',
      onAccent:  '#0D0D0D',
      onDanger:  '#0D0D0D',
      faint:     'rgba(232,226,214,0.3)',
    },
    accent: {
      default:  '#FFB000',
      hover:    '#FFC230',
      subtle:   'rgba(255,176,0,0.10)',
      border:   'rgba(255,176,0,0.35)',
      onSubtle: '#FFB000',
      track:    'rgba(255,176,0,0.10)',
    },
    border: {
      subtle: '#2A2A2A',
      strong: '#404040',
      focus:  '#FFB000',
    },
    slot: { default: '#FFB000' },
    status: {
      success:          '#3DD68C',
      successSubtle:    'rgba(61,214,140,0.15)',
      successBorder:    'rgba(61,214,140,0.30)',
      danger:           '#E84F4F',
      dangerSubtle:     'rgba(232,79,79,0.12)',
      dangerBorder:     'rgba(232,79,79,0.3)',
      warning:          '#FFB000',
      warningSubtle:    'rgba(255,176,0,0.15)',
      warningBorder:    'rgba(255,176,0,0.30)',
      missedBorder:     'rgba(255,176,0,0.35)',
      missedBg:         'rgba(255,176,0,0.05)',
      missedHover:      'rgba(255,176,0,0.10)',
      missedBadgeBg:    'rgba(255,176,0,0.15)',
      missedBadgeColor: '#C88800',
      nowBorder:        'rgba(0,184,217,0.50)',
      nowBg:            'rgba(0,184,217,0.06)',
      nowHover:         'rgba(0,184,217,0.12)',
      nowBadgeBg:       'rgba(0,184,217,0.20)',
      nowBadgeText:     '#00B8D9',
    },
    gradients: {
      bg: '#0D0D0D',
    },
    radius: { surface: 0, surfaceInner: 0, pill: 999, badge: 0, button: 0, iconButton: 999, toggle: 0 },
    borderWidth: { subtle: 1, default: 1, accent: 2 },
    typography: {
      fontBody:    '"JetBrains Mono", "Courier New", monospace',
      fontHeading: '"Space Grotesk", "Helvetica Neue", sans-serif',
      fontData:    '"JetBrains Mono", "Courier New", monospace',
    },
  },
};

export const breakpoints = {
  desktop: 1024,
};
