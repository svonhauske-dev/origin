import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { spacing, typography, icon } from '../design-system';
import { useTheme } from '../lib/theme';
import Heading from './Heading';
import Row from './Row';
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
      <Row
        onClick={onToggleExpand}
        ariaLabel={`${slotName} — ${statusLabel}`}
        aria-expanded={isExpanded}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        leftContent={
          <Heading level={2} visual="title" weight="medium" style={{ color: theme.text.tertiary }}>
            {slotName}
          </Heading>
        }
        rightContent={
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            {slotTime && slotTime !== '--:--' && (
              <span style={{
                fontSize: typography.caption,
                color: theme.text.secondary,
                fontFamily: typography.fontData,
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
              size={icon.xs}
              color={hovered ? theme.text.primary : theme.text.secondary}
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 150ms ease',
                flexShrink: 0,
              }}
            />
          </div>
        }
        style={{
          padding: `${spacing.md}px ${spacing.lg}px`,
          background: hovered ? theme.surface.hover : theme.surface.card,
          transition: 'background 150ms ease',
        }}
      />

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
