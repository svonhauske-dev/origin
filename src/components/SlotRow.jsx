import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { spacing, typography } from '../design-system';
import { useTheme } from '../lib/theme';
import SupplementRow from './SupplementRow';

export default function SlotRow({
  slotName, slotTime,
  supplements, loggedSupps,
  isExpanded, onToggleExpand,
  isReadOnly,
  onToggleSupplement,
  onEditSupplement,
}) {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);

  const totalCount = supplements.length;
  const doneCount = supplements.filter(s => loggedSupps[s.id]).length;
  const allDone = doneCount === totalCount && totalCount > 0;
  const statusLabel = allDone ? '✓' : `${doneCount}/${totalCount}`;

  return (
    <div style={{
      borderRadius: theme.radius.surface,
      border: `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
      overflow: 'hidden',
    }}>
      <button
        onClick={onToggleExpand}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${spacing.md}px ${spacing.lg}px`,
          width: '100%',
          background: hovered ? theme.surface.hover : theme.surface.card,
          border: 'none',
          cursor: 'pointer',
          transition: 'background 150ms ease',
          WebkitTapHighlightColor: 'transparent',
          boxSizing: 'border-box',
          fontFamily: typography.fontBody,
        }}
      >
        <span style={{
          fontSize: typography.body,
          fontWeight: typography.medium,
          color: theme.text.primary,
        }}>
          {slotName}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          {slotTime && slotTime !== '--:--' && (
            <span style={{
              fontSize: typography.caption,
              color: theme.text.muted,
              fontFamily: typography.fontBody,
            }}>
              {slotTime}
            </span>
          )}
          <span style={{
            fontSize: typography.body,
            color: allDone ? theme.status.success : theme.text.secondary,
            fontWeight: allDone ? typography.semibold : typography.regular,
            fontFamily: typography.fontBody,
            minWidth: 32,
            textAlign: 'right',
          }}>
            {statusLabel}
          </span>
          <ChevronDown
            size={16}
            color={hovered ? theme.text.primary : theme.text.muted}
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 150ms ease',
              flexShrink: 0,
            }}
          />
        </div>
      </button>

      {isExpanded && (
        <div style={{
          borderTop: `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
          background: theme.surface.card,
          padding: `${spacing.xs}px ${spacing.sm}px`,
        }}>
          {supplements.map(supp => (
            <SupplementRow
              key={supp.id}
              supplement={supp}
              checked={loggedSupps[supp.id]}
              isReadOnly={isReadOnly}
              onToggle={() => onToggleSupplement(supp.id)}
              onEdit={() => onEditSupplement(supp.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
