import { useEffect } from "react";
import {
  colors, spacing, radius, typography, touch,
} from "../design-system";
import Button from "./Button";

export default function SettingsModal({ open, onClose, notifStatus, onEnableNotifications, onSignOut }) {
  useEffect(function() {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return function() {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: colors.bgBackdrop, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: spacing.md }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 440, background: colors.bgModal, borderRadius: radius.xl, padding: spacing.lg, maxHeight: "86vh", overflowY: "auto", boxSizing: "border-box", border: `1px solid ${colors.borderBase}` }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg }}>
          <span style={{ fontSize: typography.title, fontWeight: typography.bold, color: colors.textPrimary, fontFamily: typography.fontHeading }}>Settings</span>
          <Button variant="icon" aria-label="Close" onClick={onClose}>✕</Button>
        </div>

        <div style={{ fontSize: typography.label, color: colors.textSecondary, fontWeight: typography.semibold, letterSpacing: typography.labelSpacing, textTransform: "uppercase", marginBottom: spacing.sm }}>Notifications</div>
        {notifStatus === "default" && (
          <Button variant="secondary" secondaryStyle="solid" fullWidth onClick={onEnableNotifications}>Enable reminders</Button>
        )}
        {notifStatus === "granted" && (
          <div style={{ fontSize: typography.body, color: colors.accent, fontWeight: typography.medium }}>Reminders are on</div>
        )}
        {notifStatus === "denied" && (
          <div style={{ fontSize: typography.caption, color: colors.danger }}>Reminders are blocked — enable them in your device settings</div>
        )}
        {notifStatus === "unsupported" && (
          <div style={{ fontSize: typography.caption, color: colors.textMuted }}>Add Protocol to your home screen to enable reminders</div>
        )}

        <div style={{ borderTop: `1px solid ${colors.borderSubtle}`, margin: `${spacing.lg}px 0` }} />

        <Button variant="destructive" fullWidth onClick={() => { onSignOut(); onClose(); }}>Sign out</Button>
      </div>
    </div>
  );
}
