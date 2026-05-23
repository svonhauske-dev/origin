import { Check } from "lucide-react";
import { icon, motion } from "../design-system";
import { useTheme } from "../lib/theme";

// Reusable checked indicator — fills background, draws a checkmark inside,
// inverts border on checked state. Consolidates three previously hand-rolled
// patterns (SlotCard supplement check, SupplementRow check, password-rule
// indicator). The Auth/SettingsScreen password-rule case uses `shape="pill"`
// for a circular indicator; the row-checkbox case uses default `shape="square"`.

export default function Checkbox({
  checked,
  size = icon.sm,           // default 18px — matches SupplementRow
  shape = "square",         // "square" | "pill"
  ariaLabel,
  style,
  ...rest
}) {
  const { theme } = useTheme();
  const checkSize = Math.floor(size * 0.6);

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      style={{
        width: size,
        height: size,
        borderRadius: shape === "pill" ? theme.radius.pill : theme.radius.surfaceInner,
        background: checked ? theme.accent.default : "transparent",
        border: `${theme.borderWidth.default}px solid ${checked ? theme.accent.default : theme.border.strong}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: `background ${motion.state}ms, border-color ${motion.state}ms`,
        ...style,
      }}
      {...rest}
    >
      {checked && (
        <Check size={checkSize} color={theme.text.onAccent} strokeWidth={3} />
      )}
    </div>
  );
}
