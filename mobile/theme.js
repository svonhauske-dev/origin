// Origin mobile theme — adapts the shared web design tokens for React Native,
// now multi-theme with a runtime picker (see lib/theme-context.jsx).
//
// THEMES:
//   retro            — Terminal Achromatic (the shipped identity, = shared
//                      themes.achromatic, byte-identical). The default.
//   futuristic-dark  — "Futuristic" × Liquid Glass, dark appearance.
//   futuristic-light — "Futuristic" × Liquid Glass, light appearance.
//
// All three share the SAME token SHAPE, so every component that reads `theme.*`
// works unchanged. `theme` is a live binding reassigned by applyThemeKey(); a
// root re-render (ThemeController) makes the whole tree pick up the new tokens.
// Fonts, sizes, spacing, radii-keys and component structure are identical across
// themes — only colors, corner radii VALUES, and the glass material change.

import {
  spacing,
  radius,
  icon,
  typography as webTypography,
  touch,
  layout,
  themes,
} from 'shared/design-system';

export { spacing, radius, icon, touch, layout };

// ── Retro = the shared Achromatic theme, plus glass:null / ambient:null so the
//    Surface component falls back to a plain opaque View. Untouched otherwise.
const RETRO = { ...themes.achromatic, glass: null, ambient: null };

// ── Futuristic shared bits ──────────────────────────────────────────────────
const FUT_RADIUS = { surface: 16, surfaceInner: 10, pill: 999, badge: 8, button: 14, iconButton: 999, toggle: 8 };
const FUT_BORDERW = { subtle: 1, default: 1, accent: 2 };
const FUT_TYPO = {
  fontBody: '"JetBrains Mono", monospace',
  fontHeading: '"JetBrains Mono", monospace',
  fontData: '"JetBrains Mono", monospace',
};

// ── Futuristic — DARK ───────────────────────────────────────────────────────
const FUT_DARK = {
  surface: {
    canvas: '#04060a', gradientMid: '#070b12', gradientEnd: '#04060a',
    modal: '#0e1219', card: '#161a20', cardSubtle: '#12161c',
    backdrop: 'rgba(2,4,8,0.62)', input: '#141821', inputDisabled: '#0f1318',
    cardHover: '#1b212a', hover: '#1b212a', knob: '#f4f7f5', toggleOff: '#2a313b',
  },
  text: {
    primary: '#f4f7f5', secondary: '#8c9690', tertiary: '#6a736e',
    disabled: '#5a635e', onAccent: '#061024', onDanger: '#04060a',
  },
  accent: {
    default: '#6f9cff', hover: 'rgba(111,156,255,0.85)', subtle: 'rgba(45,115,255,0.16)',
    border: 'rgba(120,160,255,0.40)', onSubtle: '#9fbcff', track: 'rgba(45,115,255,0.14)',
  },
  border: { subtle: 'rgba(255,255,255,0.14)', strong: 'rgba(255,255,255,0.28)', focus: '#6f9cff' },
  slot: { default: '#aeb6bf' },
  status: {
    success: '#5fe090', successSubtle: 'rgba(95,224,144,0.14)', successBorder: 'rgba(95,224,144,0.28)',
    danger: '#ff6b6b', dangerSubtle: 'rgba(255,107,107,0.14)', dangerBorder: 'rgba(255,107,107,0.32)',
    warning: '#ffc24d', warningSubtle: 'rgba(255,194,77,0.16)', warningBorder: 'rgba(255,194,77,0.32)',
    missedBorder: 'rgba(255,255,255,0.22)', missedBg: 'rgba(255,255,255,0.03)', missedHover: 'rgba(255,255,255,0.06)',
    missedBadgeBg: 'rgba(255,255,255,0.10)', missedBadgeColor: '#8c9690',
    nowBorder: 'rgba(111,156,255,0.50)', nowBg: 'rgba(45,115,255,0.08)', nowHover: 'rgba(45,115,255,0.14)',
    nowBadgeBg: 'rgba(45,115,255,0.22)', nowBadgeText: '#cfe0ff',
  },
  gradients: { bg: '#04060a' },
  radius: FUT_RADIUS, borderWidth: FUT_BORDERW, typography: FUT_TYPO,
  // Glass material for the Surface component (chrome only).
  glass: {
    blurTint: 'dark', intensity: 26,
    tint: 'rgba(20,24,30,0.45)', accentTint: 'rgba(20,28,52,0.42)',
    sheen: 'rgba(255,255,255,0.10)', border: 'rgba(255,255,255,0.12)', accentBorder: 'rgba(120,160,255,0.30)',
  },
  // Ambient glow blobs behind the content (no grid).
  ambient: { a: 'rgba(45,115,255,0.26)', b: 'rgba(111,156,255,0.14)' },
};

// ── Futuristic — LIGHT ──────────────────────────────────────────────────────
const FUT_LIGHT = {
  surface: {
    canvas: '#e7ebf0', gradientMid: '#eef1f5', gradientEnd: '#e7ebf0',
    modal: '#f4f7fa', card: '#f4f7fa', cardSubtle: '#eef1f5',
    backdrop: 'rgba(20,30,50,0.28)', input: '#ffffff', inputDisabled: '#eef1f5',
    cardHover: '#e9edf2', hover: '#e9edf2', knob: '#ffffff', toggleOff: '#c4ccd2',
  },
  text: {
    primary: '#0d1117', secondary: '#5a635e', tertiary: '#7c857f',
    disabled: '#9aa29c', onAccent: '#ffffff', onDanger: '#ffffff',
  },
  accent: {
    default: '#1f53d8', hover: 'rgba(31,83,216,0.85)', subtle: 'rgba(45,115,255,0.12)',
    border: 'rgba(45,115,255,0.40)', onSubtle: '#1f53d8', track: 'rgba(45,115,255,0.14)',
  },
  border: { subtle: 'rgba(20,35,60,0.12)', strong: 'rgba(20,35,60,0.24)', focus: '#1f53d8' },
  slot: { default: '#5a635e' },
  status: {
    success: '#1f9d57', successSubtle: 'rgba(31,157,87,0.12)', successBorder: 'rgba(31,157,87,0.30)',
    danger: '#d83a3a', dangerSubtle: 'rgba(216,58,58,0.10)', dangerBorder: 'rgba(216,58,58,0.30)',
    warning: '#b7791f', warningSubtle: 'rgba(255,194,77,0.18)', warningBorder: 'rgba(183,121,31,0.35)',
    missedBorder: 'rgba(20,35,60,0.18)', missedBg: 'rgba(20,35,60,0.02)', missedHover: 'rgba(20,35,60,0.05)',
    missedBadgeBg: 'rgba(20,35,60,0.08)', missedBadgeColor: '#5a635e',
    nowBorder: 'rgba(31,83,216,0.45)', nowBg: 'rgba(45,115,255,0.07)', nowHover: 'rgba(45,115,255,0.12)',
    nowBadgeBg: 'rgba(45,115,255,0.16)', nowBadgeText: '#1f53d8',
  },
  gradients: { bg: '#e7ebf0' },
  radius: FUT_RADIUS, borderWidth: FUT_BORDERW, typography: FUT_TYPO,
  glass: {
    blurTint: 'light', intensity: 40,
    tint: 'rgba(255,255,255,0.55)', accentTint: 'rgba(255,255,255,0.50)',
    sheen: 'rgba(255,255,255,0.70)', border: 'rgba(255,255,255,0.85)', accentBorder: 'rgba(120,160,255,0.45)',
  },
  ambient: { a: 'rgba(45,115,255,0.12)', b: 'rgba(45,115,255,0.07)' },
};

// ── Theme registry + live active theme ──────────────────────────────────────
export const THEMES = { 'retro': RETRO, 'futuristic-dark': FUT_DARK, 'futuristic-light': FUT_LIGHT };

// Live binding — reassigned by applyThemeKey(); importers read it fresh each render.
export let theme = RETRO;

export function applyThemeKey(key) {
  theme = THEMES[key] || RETRO;
  return theme;
}

// (name: 'retro'|'futuristic', appearance: 'auto'|'dark'|'light', system: 'light'|'dark'|null)
export function resolveThemeKey(name, appearance, system) {
  if (name !== 'futuristic') return 'retro';
  const mode = appearance === 'auto' ? (system === 'light' ? 'light' : 'dark') : appearance;
  return mode === 'light' ? 'futuristic-light' : 'futuristic-dark';
}

// ── Persistence (synchronous kv-store via the localStorage shim) ─────────────
const THEME_KEY = 'origin_theme_v1';
export function loadThemeChoice() {
  try {
    const raw = global.localStorage.getItem(THEME_KEY);
    if (raw) { const c = JSON.parse(raw); if (c && c.name) return { name: c.name, appearance: c.appearance || 'auto' }; }
  } catch {}
  return { name: 'retro', appearance: 'auto' };
}
export function saveThemeChoice(choice) {
  try { global.localStorage.setItem(THEME_KEY, JSON.stringify(choice)); } catch {}
}

// ── Typography (sizes port as-is; families are the expo-font names) ──────────
export const typography = {
  caption2: webTypography.caption2,
  label: webTypography.label,
  caption: webTypography.caption,
  body: webTypography.body,
  title: webTypography.title,
  heading: webTypography.heading,
  display: webTypography.display,
  fontBody: 'JetBrainsMono_400Regular',
  fontBodyMedium: 'JetBrainsMono_500Medium',
  fontHeading: 'SpaceGrotesk_600SemiBold',
  fontData: 'JetBrainsMono_400Regular',
};

export const weight = { regular: '400', medium: '500', semibold: '600', bold: '700' };

export const fonts = {
  mono: {
    regular: 'JetBrainsMono_400Regular',
    medium: 'JetBrainsMono_500Medium',
    semibold: 'JetBrainsMono_600SemiBold',
    bold: 'JetBrainsMono_700Bold',
  },
  grotesk: {
    regular: 'SpaceGrotesk_500Medium',
    medium: 'SpaceGrotesk_500Medium',
    semibold: 'SpaceGrotesk_600SemiBold',
    bold: 'SpaceGrotesk_700Bold',
  },
};

export const letterSpacing = {
  display: -1.3,
  heading: -0.4,
  label: 1.0,
  labelWide: 1.2,
};

export const shadow = {
  card: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  elevated: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  modal: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.10, shadowRadius: 32, elevation: 12 },
};
