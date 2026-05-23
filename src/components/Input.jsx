import { useState } from "react";
import { spacing, typography } from "../design-system";
import { useTheme } from "../lib/theme";

export default function Input({ variant = "text", width, style, type, onFocus, onBlur, ...rest }) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const resolvedType = type ?? (variant === "time" ? "time" : variant === "number" ? "number" : "text");

  const base = {
    background: theme.surface.input,
    color: theme.text.primary,
    border: focused ? `${theme.borderWidth.accent}px solid ${theme.accent.default}` : `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
    borderRadius: theme.radius.surface,
    fontSize: typography.body,
    fontFamily: typography.fontBody,
    // Don't strip outline — let the global :focus-visible rule fire for
    // keyboard focus. Modern browsers suppress the default outline on
    // mouse focus when :focus-visible is defined, so this stays clean
    // for mouse users while exposing the keyboard-focus indicator.
    WebkitAppearance: "none",
    boxSizing: "border-box",
    transition: "border-color 150ms ease",
    // Tell the browser to render native form-control UI (time picker icon,
    // calendar dropdown, etc.) with dark-theme styling so the clock glyph
    // doesn't render as dark-on-dark on Origin's Achromatic surface.
    colorScheme: "dark",
  };

  const v = variant === "number"
    ? { width: width ?? 52, textAlign: "right", padding: `${spacing.xs}px ${spacing.sm}px` }
    : { width: width ?? "100%", padding: `${spacing.sm}px ${spacing.md}px`, display: "block" };

  return (
    <input
      type={resolvedType}
      style={{ ...base, ...v, ...style }}
      onFocus={(e) => { setFocused(true); onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); onBlur?.(e); }}
      {...rest}
    />
  );
}
