import { useState, useEffect, useContext } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { spacing, typography, touch, layout, shadows, zIndex as zIndexTokens, icon as iconScale } from "../design-system";
import { useTheme } from "../lib/theme";
import { ToastContext } from "./ToastContext";

// Map tone → default lucide icon. Callers can override by passing their own
// `icon` (e.g. Trash2 on undo-delete) — explicit icon wins over tone default.
const TONE_DEFAULT_ICON = {
  success: CheckCircle2,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
};

function ToastItem({ toast, onDismiss }) {
  const { theme } = useTheme();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const visible = entered && !toast.leaving;

  // Resolve icon color from tone. Status tokens pass WCAG against canvas.
  // Neutral (no tone) keeps the previous text.secondary so existing callers
  // that pass an icon without a tone stay visually identical.
  const toneColor = {
    success: theme.status?.success,
    error:   theme.status?.danger,
    warning: theme.status?.warning,
    info:    theme.text.secondary,
  }[toast.tone] ?? theme.text.secondary;

  // Resolve which icon to render: explicit > tone default > none.
  let resolvedIcon = toast.icon;
  if (!resolvedIcon && toast.tone && TONE_DEFAULT_ICON[toast.tone]) {
    const IconCmp = TONE_DEFAULT_ICON[toast.tone];
    resolvedIcon = <IconCmp size={iconScale.xs} strokeWidth={2.25} />;
  }

  return (
    <div
      className="toast-item"
      style={{
        fontFamily: typography.fontBody,
        display: "flex",
        alignItems: "center",
        gap: spacing.sm,
        background: theme.surface.canvas,
        border: `${theme.borderWidth.default}px solid ${theme.border.strong}`,
        borderRadius: theme.radius.surface,
        padding: `${spacing.sm}px ${spacing.md}px`,
        boxShadow: shadows.popover,
        transform: visible ? "translateY(0)" : "translateY(calc(100% + 16px))",
        opacity: visible ? 1 : 0,
        transition: "transform 250ms ease-out, opacity 200ms ease-out",
        pointerEvents: "all",
      }}
    >
      {resolvedIcon && (
        <span style={{ display: "flex", alignItems: "center", flexShrink: 0, color: toneColor }}>
          {resolvedIcon}
        </span>
      )}
      <span style={{ flex: 1, fontSize: typography.body, color: theme.text.primary }}>{toast.message}</span>
      {toast.action && (
        <button
          onClick={() => {
            toast.action.onClick();
            onDismiss(toast.id);
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: typography.body,
            fontWeight: typography.semibold,
            color: theme.accent.default,
            padding: `${spacing.xs}px ${spacing.sm}px`,
            minHeight: touch.min,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            WebkitTapHighlightColor: "transparent",
            fontFamily: typography.fontBody,
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}

export default function Toast() {
  const context = useContext(ToastContext);
  if (!context?.toasts?.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: spacing.md,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: zIndexTokens.toast,
        width: `calc(100% - ${spacing.md * 2}px)`,
        maxWidth: layout.toastMaxWidth,
        display: "flex",
        flexDirection: "column",
        gap: spacing.xs,
        pointerEvents: "none",
      }}
    >
      {context.toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={context.dismiss} />
      ))}
    </div>
  );
}
