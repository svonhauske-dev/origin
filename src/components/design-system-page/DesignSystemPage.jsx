import { useState, useEffect } from 'react';
import { useTheme, THEME_NAMES } from '../../lib/theme';
import { themes, typography, spacing, shadows as globalShadows, breakpoints } from '../../design-system';
import Button from '../Button';
import Input from '../Input';
import AdherenceRing from '../AdherenceRing';
import { componentRegistry } from './registry';

// ── Utilities ─────────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  if (!hex?.startsWith('#')) return null;
  const m = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}` : null;
}

function isColor(v) {
  return typeof v === 'string' && (v.startsWith('#') || v.startsWith('rgb'));
}

// ── Layout atoms ──────────────────────────────────────────────────────────────

function SectionBlock({ id, title, description, children, theme }) {
  return (
    <div id={id} style={{ marginBottom: spacing.xxl + spacing.xl, scrollMarginTop: spacing.xl }}>
      <div style={{ borderBottom: `1px solid ${theme.border.subtle}`, paddingBottom: spacing.sm, marginBottom: spacing.xl }}>
        <h2 style={{ fontFamily: typography.fontHeading, fontSize: typography.heading, fontWeight: typography.semibold, color: theme.text.primary, margin: 0, letterSpacing: '-0.01em' }}>
          {title}
        </h2>
        {description && (
          <p style={{ margin: `${spacing.xs}px 0 0`, fontSize: typography.caption, color: theme.text.secondary, fontFamily: typography.fontBody, lineHeight: 1.5 }}>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function SubHead({ label, theme }) {
  return (
    <div style={{ fontSize: typography.label, fontWeight: typography.semibold, color: theme.text.tertiary, letterSpacing: typography.labelSpacingWide, textTransform: 'uppercase', fontFamily: typography.fontBody, marginBottom: spacing.sm, marginTop: spacing.lg }}>
      {label}
    </div>
  );
}

// ── Foundation: Palette ───────────────────────────────────────────────────────

const PALETTE_CATS = ['surface', 'text', 'accent', 'border', 'slot', 'status'];

function ColorSwatch({ token, value, theme }) {
  const rgb = hexToRgb(value);
  return (
    <div style={{ width: 110, flexShrink: 0 }}>
      <div style={{ width: '100%', height: 56, background: value, border: `1px solid ${theme.border.subtle}`, marginBottom: spacing.xxs }} />
      <div style={{ fontSize: 10, fontFamily: typography.fontBody, color: theme.text.secondary, marginBottom: 1, lineHeight: 1.4, wordBreak: 'break-word' }}>{token}</div>
      <div style={{ fontSize: 9, fontFamily: typography.fontBody, color: theme.text.tertiary, lineHeight: 1.3 }}>{value}</div>
      {rgb && <div style={{ fontSize: 9, fontFamily: typography.fontBody, color: theme.text.tertiary, lineHeight: 1.3 }}>rgb({rgb})</div>}
    </div>
  );
}

function ThemePaletteBlock({ name, tokens, isActive, theme }) {
  const [open, setOpen] = useState(isActive);

  return (
    <div style={{ border: `1px solid ${theme.border.subtle}`, marginBottom: spacing.xs }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${spacing.sm}px ${spacing.md}px`, background: open ? theme.surface.card : 'transparent', border: 'none', cursor: 'pointer', fontFamily: typography.fontBody, color: theme.text.primary, textAlign: 'left' }}
      >
        <span style={{ fontSize: typography.caption, fontWeight: typography.semibold, fontFamily: typography.fontHeading, display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          {name}
          {isActive && <span style={{ fontSize: typography.label, color: theme.accent.default, fontFamily: typography.fontBody, letterSpacing: typography.labelSpacing, fontWeight: typography.semibold }}>ACTIVE</span>}
        </span>
        <span style={{ fontSize: typography.caption, color: theme.text.tertiary, display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>⌃</span>
      </button>
      {open && (
        <div style={{ padding: `${spacing.md}px ${spacing.md}px ${spacing.lg}px` }}>
          {PALETTE_CATS.map(cat => {
            const catTokens = tokens[cat];
            if (!catTokens || typeof catTokens !== 'object') return null;
            const entries = Object.entries(catTokens).filter(([, v]) => isColor(v));
            if (!entries.length) return null;
            return (
              <div key={cat} style={{ marginBottom: spacing.lg }}>
                <div style={{ fontSize: typography.label, fontWeight: typography.semibold, color: theme.text.tertiary, letterSpacing: typography.labelSpacingWide, textTransform: 'uppercase', fontFamily: typography.fontBody, marginBottom: spacing.sm }}>
                  {cat}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
                  {entries.map(([k, v]) => (
                    <ColorSwatch key={k} token={`${cat}.${k}`} value={v} theme={theme} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PaletteSection({ theme, themeName }) {
  return (
    <SectionBlock id="palette" title="Palette" description="All theme color tokens. Expand each theme to inspect per-category swatches. Active theme is the production-rendered one." theme={theme}>
      {THEME_NAMES.map(name => (
        <ThemePaletteBlock key={name} name={name} tokens={themes[name]} isActive={name === themeName} theme={theme} />
      ))}
    </SectionBlock>
  );
}

// ── Foundation: Typography ────────────────────────────────────────────────────

const TYPE_SCALE = [
  { key: 'display',  px: 32 },
  { key: 'heading',  px: 22 },
  { key: 'title',    px: 18 },
  { key: 'body',     px: 16 },
  { key: 'caption',  px: 14 },
  { key: 'label',    px: 12 },
  { key: 'caption2', px: 10 },
];

const FONT_ROLES = [
  { key: 'fontBody',    label: 'fontBody — JetBrains Mono (body, labels, supplement names)' },
  { key: 'fontHeading', label: 'fontHeading — Space Grotesk (headings, greetings)' },
  { key: 'fontData',    label: 'fontData — JetBrains Mono (numbers, times, percentages)' },
];

function TypographySection({ theme }) {
  return (
    <SectionBlock id="typography" title="Typography" description="Type scale × font family. Sample text at every size for each role." theme={theme}>
      {FONT_ROLES.map(role => (
        <div key={role.key} style={{ marginBottom: spacing.xl }}>
          <SubHead label={role.label} theme={theme} />
          <div style={{ border: `1px solid ${theme.border.subtle}` }}>
            {TYPE_SCALE.map(({ key, px }, idx) => (
              <div
                key={key}
                style={{ display: 'flex', alignItems: 'baseline', gap: spacing.xl, padding: `${spacing.md}px ${spacing.lg}px`, borderBottom: idx < TYPE_SCALE.length - 1 ? `1px solid ${theme.border.subtle}` : 'none' }}
              >
                <div style={{ width: 76, flexShrink: 0 }}>
                  <div style={{ fontSize: typography.label, color: theme.text.tertiary, fontFamily: typography.fontBody, letterSpacing: typography.labelSpacing, textTransform: 'uppercase' }}>{key}</div>
                  <div style={{ fontSize: typography.label, color: theme.text.tertiary, fontFamily: typography.fontBody }}>{px}px</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: px, fontFamily: typography[role.key], color: theme.text.primary, lineHeight: px >= 22 ? 1.25 : 1.5 }}>
                    The quick brown fox
                  </div>
                  <div style={{ fontSize: px, fontFamily: typography[role.key], color: theme.text.secondary, lineHeight: px >= 22 ? 1.25 : 1.5 }}>
                    0123456789 — 12:45
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </SectionBlock>
  );
}

// ── Foundation: Spacing ───────────────────────────────────────────────────────

const SPACING_TOKENS = [
  { key: 'xxxs', px: 2 }, { key: 'xxs',  px: 4 },  { key: 'xs2', px: 6 },
  { key: 'xs',   px: 8 }, { key: 'sm',   px: 12 }, { key: 'md',  px: 16 },
  { key: 'lg',   px: 24 },{ key: 'xl',   px: 32 }, { key: 'xxl', px: 48 },
];

function SpacingSection({ theme }) {
  return (
    <SectionBlock id="spacing" title="Spacing" description="4px base unit. All layout spacing is multiples of 4." theme={theme}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        {SPACING_TOKENS.map(({ key, px }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <div style={{ width: 84, flexShrink: 0 }}>
              <span style={{ fontSize: typography.caption, fontFamily: typography.fontBody, color: theme.text.primary, fontWeight: typography.semibold }}>spacing.{key}</span>
            </div>
            <div style={{ background: theme.accent.default, height: 20, width: px, flexShrink: 0, minWidth: 2 }} />
            <span style={{ fontSize: typography.label, fontFamily: typography.fontBody, color: theme.text.tertiary }}>{px}px</span>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

// ── Foundation: Radius ────────────────────────────────────────────────────────

const RADIUS_TOKENS = [
  { key: 'surface',      desc: 'cards, modals, inputs' },
  { key: 'surfaceInner', desc: 'nested inner surfaces' },
  { key: 'pill',         desc: 'pill buttons — usually full' },
  { key: 'badge',        desc: 'badges' },
  { key: 'button',       desc: 'buttons — UI shapes' },
  { key: 'iconButton',   desc: 'icon buttons' },
  { key: 'toggle',       desc: 'toggles' },
];

function RadiusSection({ theme }) {
  return (
    <SectionBlock id="radius" title="Radius" description="Zero-radius across all UI shapes under Achromatic. radius.full (9999) reserved for genuinely circular elements: adherence rings, avatars, status dots." theme={theme}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xl }}>
        {/* Item width bumped 96 → 110, label drops the `radius.` prefix.
            With the prefix included `radius.surfaceInner` rendered ~143px
            wide in mono and bled into the next item, reading as
            `radius.surfaceInnerradius.pill`. Section title already says
            Radius, so the key alone is unambiguous. */}
        {RADIUS_TOKENS.map(({ key, desc }) => {
          const val = theme.radius[key];
          if (val === undefined) return null;
          return (
            <div key={key} style={{ textAlign: 'center', width: 110 }}>
              <div style={{ width: 80, height: 80, background: theme.surface.card, border: `1px solid ${theme.border.strong}`, borderRadius: Math.min(val, 40), margin: '0 auto', marginBottom: spacing.xs }} />
              <div style={{ fontSize: typography.label, fontFamily: typography.fontBody, color: theme.text.secondary, fontWeight: typography.semibold, wordBreak: 'break-word' }}>{key}</div>
              <div style={{ fontSize: 10, fontFamily: typography.fontBody, color: theme.text.tertiary }}>{val === 9999 ? '9999 (full)' : `${val}px`}</div>
              <div style={{ fontSize: 9, fontFamily: typography.fontBody, color: theme.text.tertiary, marginTop: 2, lineHeight: 1.3 }}>{desc}</div>
            </div>
          );
        })}
      </div>
    </SectionBlock>
  );
}

// ── Foundation: Shadows ───────────────────────────────────────────────────────

const SHADOW_KEYS = ['card', 'modal', 'popover', 'toast', 'focus'];

function ShadowsSection({ theme }) {
  return (
    <SectionBlock id="shadows" title="Shadows" description="Global shadow tokens (light-origin). Under Achromatic, depth is tonal — shadows are minimal by design." theme={theme}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xl }}>
        {SHADOW_KEYS.map(key => (
          <div key={key} style={{ textAlign: 'center' }}>
            <div style={{ width: 120, height: 72, background: theme.surface.modal, boxShadow: globalShadows[key], margin: '0 auto', marginBottom: spacing.sm }} />
            <div style={{ fontSize: typography.label, fontFamily: typography.fontBody, color: theme.text.secondary, fontWeight: typography.semibold }}>{key}</div>
            <div style={{ fontSize: 9, fontFamily: typography.fontBody, color: theme.text.tertiary, maxWidth: 120, wordBreak: 'break-all', marginTop: 2, lineHeight: 1.3 }}>{globalShadows[key]}</div>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

// ── Primitive sections ────────────────────────────────────────────────────────

function VariantGrid({ variants, Comp, theme }) {
  // alignItems: 'flex-start' so every variant's caption sits at the same top
  // y. With flex-end (the previous default) component bottoms shared a
  // baseline, but the captions above them scattered to different vertical
  // positions whenever component heights varied — most visibly in the
  // Heading section where display=32px and label=12px put captions 20px
  // apart on the same row. Top-aligning keeps the captions in a clean
  // header line; components hang below at their natural heights.
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.lg, alignItems: 'flex-start' }}>
      {variants.map(v => (
        <div key={v.name}>
          <div style={{ fontSize: 10, fontFamily: typography.fontBody, color: theme.text.tertiary, marginBottom: spacing.xxs, whiteSpace: 'nowrap' }}>{v.name}</div>
          <Comp {...v.props} />
        </div>
      ))}
    </div>
  );
}

// ── Button playground ─────────────────────────────────────────────────────────

function ButtonPlayground({ theme }) {
  const [variant, setVariant] = useState('primary');
  const [size,    setSize]    = useState('default');
  const [disabled, setDisabled] = useState(false);
  const [active,   setActive]   = useState(false);
  const [label,    setLabel]    = useState('Button label');

  const ctrl = { display: 'flex', flexDirection: 'column', gap: spacing.xxs, fontSize: typography.label, fontFamily: typography.fontBody, color: theme.text.secondary };
  const sel  = { background: theme.surface.input, color: theme.text.primary, border: `1px solid ${theme.border.subtle}`, fontFamily: typography.fontBody, fontSize: typography.label, padding: `${spacing.xxs}px ${spacing.xs}px` };

  return (
    <div>
      <div style={{ minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.surface.cardSubtle, border: `1px solid ${theme.border.subtle}`, padding: spacing.lg, marginBottom: spacing.md }}>
        <Button variant={variant} size={size} disabled={disabled} active={active}>
          {variant === 'icon' ? '⚙' : label}
        </Button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.lg, alignItems: 'flex-start' }}>
        <div style={ctrl}>
          <span>variant</span>
          <select value={variant} onChange={e => setVariant(e.target.value)} style={sel}>
            {['primary','secondary','tertiary','destructive','icon','pill','circle','startDay'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div style={ctrl}>
          <span>size</span>
          <select value={size} onChange={e => setSize(e.target.value)} style={sel}>
            {['default','compact'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div style={ctrl}>
          <span>label</span>
          <input value={label} onChange={e => setLabel(e.target.value)} style={{ ...sel, width: 140 }} />
        </div>
        <label style={{ ...ctrl, flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
          <input type="checkbox" checked={disabled} onChange={e => setDisabled(e.target.checked)} />
          disabled
        </label>
        <label style={{ ...ctrl, flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
          active
        </label>
      </div>
    </div>
  );
}

// ── Input playground ──────────────────────────────────────────────────────────

function InputPlayground({ theme }) {
  const [variant,     setVariant]     = useState('text');
  const [placeholder, setPlaceholder] = useState('Supplement name');
  const [disabled,    setDisabled]    = useState(false);
  const [value,       setValue]       = useState('');

  const ctrl = { display: 'flex', flexDirection: 'column', gap: spacing.xxs, fontSize: typography.label, fontFamily: typography.fontBody, color: theme.text.secondary };
  const sel  = { background: theme.surface.input, color: theme.text.primary, border: `1px solid ${theme.border.subtle}`, fontFamily: typography.fontBody, fontSize: typography.label, padding: `${spacing.xxs}px ${spacing.xs}px` };

  return (
    <div>
      <div style={{ minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.surface.cardSubtle, border: `1px solid ${theme.border.subtle}`, padding: spacing.lg, marginBottom: spacing.md }}>
        <div style={{ width: 280 }}>
          <Input variant={variant} placeholder={placeholder} disabled={disabled} value={value} onChange={e => setValue(e.target.value)} width={variant === 'number' ? 80 : undefined} />
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.lg, alignItems: 'flex-start' }}>
        <div style={ctrl}>
          <span>variant</span>
          <select value={variant} onChange={e => { setVariant(e.target.value); setValue(''); }} style={sel}>
            {['text','time','number'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div style={ctrl}>
          <span>placeholder</span>
          <input value={placeholder} onChange={e => setPlaceholder(e.target.value)} style={{ ...sel, width: 160 }} />
        </div>
        <label style={{ ...ctrl, flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
          <input type="checkbox" checked={disabled} onChange={e => setDisabled(e.target.checked)} />
          disabled
        </label>
      </div>
    </div>
  );
}

// ── AdherenceRing playground ──────────────────────────────────────────────────

function AdherenceRingPlayground({ theme }) {
  const [pct,  setPct]  = useState(65);
  const [size, setSize] = useState(56);

  const lbl = { fontSize: typography.label, fontFamily: typography.fontBody, color: theme.text.secondary, display: 'flex', flexDirection: 'column', gap: spacing.xxs };

  return (
    <div>
      <div style={{ minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.surface.cardSubtle, border: `1px solid ${theme.border.subtle}`, padding: spacing.lg, marginBottom: spacing.md }}>
        <AdherenceRing percentage={pct} size={size} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xl }}>
        <label style={lbl}>
          percentage: {pct}%
          <input type="range" min={0} max={100} value={pct} onChange={e => setPct(Number(e.target.value))} style={{ width: 160 }} />
        </label>
        <label style={lbl}>
          size: {size}px
          <input type="range" min={40} max={120} value={size} onChange={e => setSize(Number(e.target.value))} style={{ width: 160 }} />
        </label>
      </div>
    </div>
  );
}

const PLAYGROUNDS = { Button: ButtonPlayground, Input: InputPlayground, AdherenceRing: AdherenceRingPlayground };

function PrimitiveSection({ name, def, theme }) {
  const Comp      = def.component;
  const Playground = PLAYGROUNDS[name];

  return (
    <SectionBlock id={`comp-${name.toLowerCase()}`} title={name} description={def.description} theme={theme}>
      <SubHead label="Variants" theme={theme} />
      <div style={{ background: theme.surface.cardSubtle, border: `1px solid ${theme.border.subtle}`, padding: spacing.lg }}>
        <VariantGrid variants={def.variants} Comp={Comp} theme={theme} />
      </div>
      {Playground && (
        <>
          <SubHead label="Playground" theme={theme} />
          <Playground theme={theme} />
        </>
      )}
    </SectionBlock>
  );
}

// ── Composed sections ─────────────────────────────────────────────────────────

function ComposedSection({ name, def, theme }) {
  const Comp = def.component;

  return (
    <SectionBlock id={`composed-${name.toLowerCase()}`} title={name} description={def.description} theme={theme}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
        {def.examples.map(ex => (
          <div key={ex.name}>
            <div style={{ fontSize: typography.label, fontFamily: typography.fontBody, color: theme.text.tertiary, marginBottom: spacing.xs, letterSpacing: typography.labelSpacing, textTransform: 'uppercase' }}>
              {ex.name}
            </div>
            {/* Composed components (Hero, WeekStrip, SlotCard, etc.) are
                authored against the 440px mobile column. Capping the example
                wrapper at 480 keeps them in realistic context on wide
                desktop viewports — otherwise they stretch into surfaces they
                were never sized for. */}
            <div style={{ border: `1px solid ${theme.border.subtle}`, padding: spacing.md, background: theme.surface.canvas, maxWidth: 480 }}>
              <Comp {...ex.props} />
            </div>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

const NAV = [
  {
    group: 'Foundation',
    items: [
      { id: 'palette',    label: 'Palette' },
      { id: 'typography', label: 'Typography' },
      { id: 'spacing',    label: 'Spacing' },
      { id: 'radius',     label: 'Radius' },
      { id: 'shadows',    label: 'Shadows' },
    ],
  },
  {
    group: 'Components',
    items: Object.keys(componentRegistry.primitives).map(n => ({ id: `comp-${n.toLowerCase()}`, label: n })),
  },
  {
    group: 'Composed',
    items: Object.keys(componentRegistry.composed).map(n => ({ id: `composed-${n.toLowerCase()}`, label: n })),
  },
];

function DSSidebar({ theme }) {
  const scroll = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ width: 220, flexShrink: 0, borderRight: `1px solid ${theme.border.subtle}`, overflowY: 'auto', padding: `${spacing.lg}px ${spacing.md}px`, background: theme.surface.canvas }}>
      <div style={{ fontSize: typography.caption, fontWeight: typography.bold, fontFamily: typography.fontHeading, color: theme.text.primary, letterSpacing: '-0.01em', marginBottom: spacing.xl }}>
        Design System
      </div>
      {NAV.map(section => (
        <div key={section.group} style={{ marginBottom: spacing.lg }}>
          <div style={{ fontSize: typography.label, fontWeight: typography.semibold, color: theme.text.tertiary, letterSpacing: typography.labelSpacingWide, textTransform: 'uppercase', fontFamily: typography.fontBody, marginBottom: spacing.xs, paddingLeft: spacing.xs }}>
            {section.group}
          </div>
          {section.items.map(item => (
            <NavItem key={item.id} id={item.id} label={item.label} theme={theme} onScroll={scroll} />
          ))}
        </div>
      ))}
    </div>
  );
}

function NavItem({ id, label, theme, onScroll }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={() => onScroll(id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: 'block', width: '100%', textAlign: 'left', background: hov ? theme.surface.hover : 'transparent', border: 'none', cursor: 'pointer', padding: `${spacing.xxs}px ${spacing.xs}px`, fontSize: typography.caption, fontFamily: typography.fontBody, color: hov ? theme.text.primary : theme.text.secondary, transition: 'background 100ms, color 100ms' }}
    >
      {label}
    </button>
  );
}

// ── Intro header (full-width band above sidebar+content) ─────────────────────

// Layout constants — kept inline so IntroHeader and the main content column
// can share the same horizontal alignment math. Sidebar is 220px (DSSidebar);
// main column has spacing.xxl padding inset on desktop; content caps at
// CONTENT_MAX so long-line paragraphs stay legible at 1920px+ viewports.
const SIDEBAR_W   = 220;
const CONTENT_MAX = 1100;

function IntroHeader({ theme, isDesktop }) {
  // On desktop, indent the inner content so the h1 left-aligns with the
  // section h2s below (which sit inside main, offset by sidebar width +
  // main padding). Without this the h1 anchors to the viewport edge and
  // the section titles anchor 268px in — visually disconnected.
  const innerPadL = isDesktop ? SIDEBAR_W + spacing.xxl : spacing.xl;
  return (
    <div style={{ background: theme.surface.card, borderBottom: `1px solid ${theme.border.subtle}`, padding: `${spacing.xl}px ${spacing.xl}px ${spacing.xl}px ${innerPadL}px`, flexShrink: 0 }}>
      <div style={{ maxWidth: CONTENT_MAX }}>
        <h1 style={{ fontFamily: typography.fontHeading, fontSize: typography.display, fontWeight: typography.bold, color: theme.text.primary, margin: `0 0 ${spacing.sm}px`, letterSpacing: '-0.02em' }}>
          Origin Design System
        </h1>
        <p style={{ margin: `0 0 ${spacing.md}px`, fontSize: typography.body, fontFamily: typography.fontBody, color: theme.text.secondary, lineHeight: 1.6, maxWidth: 600 }}>
          The live system behind Origin. Tokens, primitives, and composed components — auto-generated from the codebase. Achromatic is the production identity; the other theme palettes are directional explorations that didn't ship.
        </p>
        <a href="https://origin-protocol.vercel.app/" style={{ fontSize: typography.label, fontFamily: typography.fontBody, color: theme.text.secondary, textDecoration: 'none', letterSpacing: typography.labelSpacing }}>
          ← Back to Origin
        </a>
      </div>
    </div>
  );
}

// ── Mobile nav (horizontal scroll strip, shown below 1024px) ─────────────────

function MobileNav({ theme }) {
  const scroll = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 10, background: theme.surface.canvas, borderBottom: `1px solid ${theme.border.subtle}`, overflowX: 'auto', WebkitOverflowScrolling: 'touch', flexShrink: 0 }}>
      <div style={{ display: 'flex', minWidth: 'max-content', padding: `${spacing.xxs}px ${spacing.sm}px`, gap: spacing.xxs }}>
        {NAV.map(section => (
          <div key={section.group} style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: theme.text.tertiary, fontFamily: typography.fontBody, padding: `${spacing.xs}px ${spacing.xxs}px`, letterSpacing: typography.labelSpacingWide, textTransform: 'uppercase', flexShrink: 0 }}>{section.group}</span>
            {section.items.map(item => (
              <button key={item.id} onClick={() => scroll(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: `${spacing.xs}px ${spacing.sm}px`, fontSize: typography.caption, fontFamily: typography.fontBody, color: theme.text.secondary, whiteSpace: 'nowrap' }}>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  const { theme, themeName } = useTheme();
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= breakpoints.desktop);

  useEffect(() => {
    document.title = 'Design System — Origin';
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex';
    return () => { meta.remove(); };
  }, []);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= breakpoints.desktop);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', background: theme.surface.canvas, color: theme.text.primary, fontFamily: typography.fontBody, WebkitFontSmoothing: 'antialiased' }}>
      <IntroHeader theme={theme} isDesktop={isDesktop} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {isDesktop && <DSSidebar theme={theme} />}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {!isDesktop && <MobileNav theme={theme} />}
          <div style={{ padding: `${spacing.xl}px ${isDesktop ? spacing.xxl : spacing.md}px`, maxWidth: CONTENT_MAX }}>
            {/* Foundation */}
            <PaletteSection    theme={theme} themeName={themeName} />
            <TypographySection theme={theme} />
            <SpacingSection    theme={theme} />
            <RadiusSection     theme={theme} />
            <ShadowsSection    theme={theme} />

            {/* Primitives */}
            {Object.entries(componentRegistry.primitives).map(([name, def]) => (
              <PrimitiveSection key={name} name={name} def={def} theme={theme} />
            ))}

            {/* Composed */}
            {Object.entries(componentRegistry.composed).map(([name, def]) => (
              <ComposedSection key={name} name={name} def={def} theme={theme} />
            ))}

            <div style={{ height: spacing.xxl * 2 }} />
          </div>
        </main>
      </div>
    </div>
  );
}
