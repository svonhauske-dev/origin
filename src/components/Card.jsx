import { spacing, typography } from "../design-system";
import { useTheme } from "../lib/theme";

export default function Card({ variant = "default", onClick, style, children, ariaLabel }) {
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

  // When the card is interactive, expose proper button semantics so it's
  // reachable by keyboard, announced as interactive by screen readers, and
  // activatable by Enter/Space. We keep the <div> element (rather than
  // promoting to <button>) so callsites can still nest interactive children
  // without producing invalid <button>-in-<button> markup. role="button" +
  // tabIndex + keyboard handler gives us the same a11y surface area.
  const a11y = onClick ? {
    role: "button",
    tabIndex: 0,
    "aria-label": ariaLabel,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick(e);
      }
    },
  } : {};

  return (
    <div onClick={onClick} {...a11y} style={{ ...base, ...(VARIANTS[variant] ?? {}), ...interactive, ...style }}>
      {children}
    </div>
  );
}
