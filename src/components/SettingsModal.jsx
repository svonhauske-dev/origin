import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { colors, spacing, typography, touch } from "../design-system";
import Button from "./Button";
import Label from "./Label";
import Modal from "./Modal";
import ManageAccount from "./ManageAccount";
import { useToast } from "./ToastContext";

export default function SettingsModal({ open, onClose, notifStatus, onEnableNotifications, onOpenManage, onSignOut, user, token, profile, onProfileUpdate }) {
  const { show: showToast } = useToast();
  const [view, setView] = useState("main");

  useEffect(() => { if (!open) setView("main"); }, [open]);

  const handleEnableNotifications = async () => {
    const result = await onEnableNotifications();
    if (result === "granted") showToast("Reminders on");
  };

  if (view === "account") {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Manage account"
        leftAction={
          <Button variant="icon" aria-label="Back" onClick={() => setView("main")}>
            <ChevronLeft size={18} />
          </Button>
        }
      >
        <ManageAccount
          user={user}
          token={token}
          profile={profile}
          onProfileUpdate={onProfileUpdate}
          onShowToast={showToast}
        />
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <Label style={{ marginBottom: spacing.xs }}>Account</Label>
      <div
        onClick={() => setView("account")}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: `${spacing.sm}px 0`, cursor: "pointer", userSelect: "none",
          WebkitTapHighlightColor: "transparent", minHeight: touch.min,
          marginBottom: spacing.xs,
        }}
      >
        <span style={{ fontSize: typography.body, color: colors.textPrimary }}>Manage account</span>
        <ChevronRight size={20} color={colors.textSecondary} />
      </div>

      <div style={{ borderTop: `1px solid ${colors.borderSubtle}`, margin: `${spacing.lg}px 0` }} />

      <Label style={{ marginBottom: spacing.xs }}>Protocol</Label>
      <div
        onClick={onOpenManage}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: `${spacing.sm}px 0`, cursor: "pointer", userSelect: "none",
          WebkitTapHighlightColor: "transparent", minHeight: touch.min,
          marginBottom: spacing.xs,
        }}
      >
        <span style={{ fontSize: typography.body, color: colors.textPrimary }}>Manage protocol</span>
        <ChevronRight size={20} color={colors.textSecondary} />
      </div>

      <div style={{ borderTop: `1px solid ${colors.borderSubtle}`, margin: `${spacing.lg}px 0` }} />

      <Label style={{ marginBottom: spacing.xs }}>Notifications</Label>
      {notifStatus === "default" && (
        <Button variant="secondary" fullWidth onClick={handleEnableNotifications}>Enable reminders</Button>
      )}
      {notifStatus === "granted" && (
        <div style={{ fontSize: typography.caption, color: colors.accent, fontWeight: typography.medium }}>Reminders are on</div>
      )}
      {notifStatus === "denied" && (
        <div style={{ fontSize: typography.caption, color: colors.danger }}>Reminders are blocked — enable them in your device settings</div>
      )}
      {notifStatus === "unsupported" && (
        <div style={{ fontSize: typography.caption, color: colors.textMuted }}>Add Tether to your home screen to enable reminders</div>
      )}

      <div style={{ borderTop: `1px solid ${colors.borderSubtle}`, margin: `${spacing.lg}px 0` }} />

      <Button variant="destructive" fullWidth onClick={() => { onSignOut(); onClose(); }}>Sign out</Button>
    </Modal>
  );
}
