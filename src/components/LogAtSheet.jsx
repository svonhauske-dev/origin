import { useState, useEffect } from "react";
import { spacing, typography } from "../design-system";
import { useTheme } from "../lib/theme";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";

// LogAtSheet — bottom sheet on mobile / centered modal on desktop (per Modal
// primitive) that lets the user log a missed supplement at a specific time.
// Captures the actual log time so adherence data preserves what really
// happened, not just the slot's scheduled time. See Session 5 / D5.
export default function LogAtSheet({ open, onClose, target, onConfirm }) {
  const { theme } = useTheme();
  // Default the picker to the current time when the sheet opens.
  const [tmpTime, setTmpTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });

  useEffect(() => {
    if (open) {
      const d = new Date();
      setTmpTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    }
  }, [open, target?.name]);

  if (!target) {
    // Modal handles the close animation when target clears — render an empty
    // Modal in that case so the exit animation can play out cleanly.
    return <Modal open={false} onClose={onClose} title="" />;
  }

  const handleConfirm = () => {
    onConfirm(tmpTime);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Log ${target.name} at…`}
      footer={
        <div style={{ display: "flex", gap: spacing.xs }}>
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button variant="primary" fullWidth onClick={handleConfirm}>
            Log at {tmpTime}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: spacing.md, paddingTop: spacing.xs }}>
        {target.dueTime && (
          <div style={{ fontSize: typography.caption, color: theme.text.secondary }}>
            Originally due at <strong style={{ color: theme.text.primary, fontWeight: typography.semibold }}>{target.dueTime}</strong>
            {target.slotLabel ? <span> · {target.slotLabel} slot</span> : null}
          </div>
        )}
        <div>
          <div style={{ fontSize: typography.label, color: theme.text.secondary, fontWeight: typography.semibold, letterSpacing: typography.labelSpacingWide, textTransform: "uppercase", marginBottom: spacing.xs, fontFamily: typography.fontBody }}>
            Time taken
          </div>
          <Input
            variant="time"
            value={tmpTime}
            onChange={(e) => setTmpTime(e.target.value)}
          />
        </div>
        <div style={{ fontSize: typography.caption, color: theme.text.muted, lineHeight: 1.5 }}>
          Origin records what actually happened, not just the slot's scheduled time. Your adherence data stays honest.
        </div>
      </div>
    </Modal>
  );
}
