import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { spacing, typography, touch, icon } from '../design-system';
import { useTheme } from '../lib/theme';
import Checkbox from './Checkbox';
import Row from './Row';

export default function SupplementRow({ supplement, checked, isReadOnly, onToggle, onEdit }) {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <Row
      // .supp-row className stays so the existing prefers-reduced-motion
      // override in index.html still matches.
      className="supp-row"
      onClick={!isReadOnly ? onToggle : undefined}
      ariaLabel={`${supplement.name}${checked ? ' — checked' : ''}`}
      onMouseEnter={() => !isReadOnly && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      leftContent={
        <>
          {/* Inline checkbox — Checkbox primitive. supp-checkbox className stays
              on a wrapper so the existing prefers-reduced-motion override in
              index.html still matches. */}
          <div className="supp-checkbox" style={{ display: "flex", flexShrink: 0 }}>
            <Checkbox checked={checked} size={icon.sm} shape="square" />
          </div>

          {/* Name + dose */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: spacing.xs, minWidth: 0 }}>
            <span style={{
              fontSize: typography.body,
              color: checked ? theme.text.secondary : theme.text.primary,
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
                color: theme.text.secondary,
                fontFamily: typography.fontBody,
                flexShrink: 0,
              }}>
                {supplement.dose}
              </span>
            )}
          </div>
        </>
      }
      rightContent={
        // Edit pencil — always in the layout, fades in on hover so the row
        // doesn't shift width when the cursor passes over. Hidden buttons
        // stay tab-skippable so keyboard nav still has a sensible Tab order.
        // Valid because Row is a div+role="button" (not a real <button>) —
        // no button-in-button HTML.
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          tabIndex={hovered ? 0 : -1}
          aria-hidden={!hovered}
          aria-label="Edit"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: theme.text.secondary,
            padding: `${spacing.xxs}px`,
            minWidth: touch.min,
            minHeight: touch.min,
            display: 'flex',
            alignItems: 'center',
            borderRadius: theme.radius.surfaceInner,
            flexShrink: 0,
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? 'auto' : 'none',
            transition: 'opacity 150ms ease',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Pencil size={14} />
        </button>
      }
      style={{
        padding: `${spacing.sm}px ${spacing.md}px`,
        background: hovered ? theme.surface.hover : 'transparent',
        borderRadius: theme.radius.surfaceInner,
        transition: 'background 150ms ease',
      }}
    />
  );
}
