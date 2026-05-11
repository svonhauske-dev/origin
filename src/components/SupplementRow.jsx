import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { spacing, typography } from '../design-system';
import { useTheme } from '../lib/theme';

export default function SupplementRow({ supplement, checked, isReadOnly, onToggle, onEdit }) {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => !isReadOnly && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={!isReadOnly ? onToggle : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        padding: `${spacing.sm}px ${spacing.md}px`,
        background: hovered ? theme.surface.hover : 'transparent',
        borderRadius: theme.radius.surfaceInner,
        cursor: isReadOnly ? 'default' : 'pointer',
        transition: 'background 150ms ease',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Inline checkbox */}
      <div style={{
        width: 18,
        height: 18,
        borderRadius: theme.radius.surfaceInner,
        border: `${theme.borderWidth.default}px solid ${checked ? theme.accent.default : theme.border.subtle}`,
        background: checked ? theme.accent.default : 'transparent',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 150ms ease, border-color 150ms ease',
      }}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke={theme.text.onAccent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Name + dose */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: spacing.xs, minWidth: 0 }}>
        <span style={{
          fontSize: typography.body,
          color: checked ? theme.text.muted : theme.text.primary,
          fontFamily: typography.fontBody,
          textDecoration: checked ? 'line-through' : 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {supplement.name}
        </span>
        {supplement.dose && (
          <span style={{
            fontSize: typography.caption,
            color: theme.text.muted,
            fontFamily: typography.fontBody,
            flexShrink: 0,
          }}>
            {supplement.dose}
          </span>
        )}
      </div>

      {/* Edit pencil — revealed on hover */}
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: theme.text.muted,
            padding: `${spacing.xxs}px`,
            display: 'flex',
            alignItems: 'center',
            borderRadius: theme.radius.surfaceInner,
            flexShrink: 0,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Pencil size={14} />
        </button>
      )}
    </div>
  );
}
