import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { spacing, typography } from '../design-system';
import { useTheme } from '../lib/theme';

const STORAGE_PREFIX = 'origin.tip.';

// One-time inline tip. Powers the Day-1 "how anchors work" explainer and the
// take-all hint that ships in a later session. Dismissal is persisted in
// localStorage by `id` so the same tip never re-appears for a given user.
export default function InlineTip({ id, label, children }) {
  const { theme } = useTheme();
  const storageKey = `${STORAGE_PREFIX}${id}`;
  const [dismissed, setDismissed] = useState(true); // hide until we've read localStorage

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(storageKey) === 'dismissed');
    } catch {
      setDismissed(false);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    try { localStorage.setItem(storageKey, 'dismissed'); } catch { /* ignore */ }
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: spacing.sm,
      padding: `${spacing.sm}px ${spacing.md}px`,
      background: theme.surface.cardSubtle,
      borderLeft: `2px solid ${theme.accent.default}`,
      textAlign: 'left',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {label && (
          <div style={{
            fontSize: typography.label,
            fontWeight: typography.semibold,
            color: theme.text.primary,
            letterSpacing: typography.labelSpacingWide,
            textTransform: 'uppercase',
            marginBottom: spacing.xxs,
            fontFamily: typography.fontBody,
          }}>
            {label}
          </div>
        )}
        <div style={{
          fontSize: typography.caption,
          color: theme.text.secondary,
          lineHeight: 1.5,
        }}>
          {children}
        </div>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss tip"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: spacing.xxs,
          margin: -spacing.xxs,
          color: theme.text.tertiary,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
