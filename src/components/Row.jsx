import { ChevronRight } from "lucide-react";
import { spacing, typography, touch, icon } from "../design-system";
import { useTheme } from "../lib/theme";

// Disclosure-row primitive. Captures the left-content + optional right-content
// + tap-target shape previously copy-pasted across Settings nav rows,
// SupplementRow, SlotRow, ProtocolRow, and IntentOption.
//
// When `onClick` is set the row becomes button-semantic via role="button" +
// tabIndex + keyboard handler — matching Card's pattern. We keep the outer
// element a <div> (rather than <button>) so callsites can nest interactive
// children (e.g. SupplementRow's hover-reveal edit pencil) without producing
// invalid <button>-in-<button> markup. The global :focus-visible rule in
// index.html applies automatically to the tabbable div.
//
// `rightContent` semantics:
//   undefined  →  default ChevronRight when interactive, otherwise nothing
//   null       →  no right content even when interactive
//   any node   →  use as-is

export default function Row({
  leftContent,
  rightContent,
  onClick,
  disabled = false,
  ariaLabel,
  style,
  ...rest
}) {
  const { theme } = useTheme();
  const interactive = !!onClick && !disabled;
  const useDefaultChevron = rightContent === undefined && interactive;

  const base = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    width: "100%",
    minHeight: touch.min,
    boxSizing: "border-box",
    fontFamily: typography.fontBody,
    WebkitTapHighlightColor: "transparent",
    cursor: interactive ? "pointer" : "default",
    userSelect: interactive ? "none" : "auto",
    ...(disabled ? { opacity: 0.4, pointerEvents: "none" } : {}),
  };

  const a11y = interactive ? {
    role: "button",
    tabIndex: 0,
    "aria-label": ariaLabel,
    "aria-disabled": disabled || undefined,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick(e);
      }
    },
  } : {};

  const right = useDefaultChevron
    ? <ChevronRight size={icon.sm} color={theme.text.secondary} style={{ flexShrink: 0 }} />
    : rightContent;

  return (
    <div
      onClick={interactive ? onClick : undefined}
      {...a11y}
      {...rest}
      style={{ ...base, ...style }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, flex: 1, minWidth: 0 }}>
        {leftContent}
      </div>
      {right != null && (
        <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, flexShrink: 0 }}>
          {right}
        </div>
      )}
    </div>
  );
}
