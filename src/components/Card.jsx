import { spacing, typography } from "../design-system";
import { useTheme } from "../lib/theme";

export default function Card({ variant = "default", onClick, style, children }) {
  const { theme } = useTheme();

  const VARIANTS = {
    default:  { background: theme.surface.card,     border: `${theme.borderWidth.default}px solid ${theme.border.subtle}` },
    selected: { background: theme.accent.subtle,    border: `${theme.borderWidth.default}px solid ${theme.accent.default}` },
    accent:   { background: theme.accent.subtle,    border: `${theme.borderWidth.default}px solid ${theme.accent.border}` },
    subtle:   { background: theme.surface.cardSubtle, border: `${theme.borderWidth.default}px solid ${theme.border.subtle}` },
  };

  const base = {
    fontFamily: typography.fontBody,
    borderRadius: theme.radius.surface,
    padding: `${spacing.sm}px ${spacing.md}px`,
    marginBottom: spacing.xs,
    boxSizing: "border-box",
  };

  const interactive = onClick ? { cursor: "pointer", userSelect: "none" } : {};

  return (
    <div onClick={onClick} style={{ ...base, ...(VARIANTS[variant] ?? {}), ...interactive, ...style }}>
      {children}
    </div>
  );
}
