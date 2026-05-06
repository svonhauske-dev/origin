import { spacing, typography } from '../design-system';
import { useTheme } from '../lib/theme';

const WAVES = [0, 0.6, 1.2, 1.8];

export default function Loader({ text }) {
  const { theme } = useTheme();
  return (
    <div style={{
      background: theme.gradients.bg,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.md,
      fontFamily: typography.fontBody,
    }}>
      <style>{`
        @keyframes originWave {
          0%   { r: 14; opacity: 1;   stroke-width: 1.2; }
          100% { r: 56; opacity: 0;   stroke-width: 0.3; }
        }
        @keyframes originDot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.7; }
        }
      `}</style>
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {WAVES.map((delay, i) => (
          <circle
            key={i}
            cx="60"
            cy="60"
            r="14"
            stroke={theme.text.primary}
            fill="none"
            style={{
              animation: `originWave 3s ${delay}s ease-out infinite`,
              opacity: 0,
            }}
          />
        ))}
        <circle
          cx="60"
          cy="60"
          r="3.5"
          fill={theme.text.primary}
          style={{ animation: "originDot 3s ease-in-out infinite" }}
        />
      </svg>
      {text && (
        <div style={{
          fontSize: typography.caption,
          color: theme.text.muted,
          fontFamily: typography.fontBody,
          letterSpacing: typography.labelSpacingTight,
        }}>
          {text}
        </div>
      )}
    </div>
  );
}
