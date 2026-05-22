import { useId } from "react";
import { useTheme } from "../lib/theme";

// Origin brand mark — 5 concentric rings with a glowing center dot.
// Mirrors /public/icon.svg minus the dark square background, so it overlays
// any theme surface. Ring radii + stroke widths are brand-asset constants
// kept inline here; call sites pass `size` and the achromatic theme color
// flows through naturally.
const RINGS = [
  { r: 439, strokeWidth: 2.56, opacity: 0.25 },
  { r: 347, strokeWidth: 2.82, opacity: 0.40 },
  { r: 256, strokeWidth: 3.58, opacity: 0.60 },
  { r: 165, strokeWidth: 4.35, opacity: 0.85 },
  { r:  91, strokeWidth: 5.12, opacity: 1.00 },
];

export default function OriginGlyph({ size = 56, ...rest }) {
  const { theme } = useTheme();
  const reactId = useId();
  const glowId = `originGlow-${reactId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      role="img"
      aria-label="Origin"
      {...rest}
    >
      <defs>
        <filter id={glowId} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="11" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {RINGS.map(({ r, strokeWidth, opacity }) => (
        <circle
          key={r}
          cx="512" cy="512" r={r}
          fill="none"
          stroke={theme.text.primary}
          strokeWidth={strokeWidth}
          opacity={opacity}
        />
      ))}
      <circle cx="512" cy="512" r="26" fill={theme.text.primary} filter={`url(#${glowId})`} />
    </svg>
  );
}
