import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { spacing, typography, shadows } from '../design-system';
import { useTheme } from '../lib/theme';
import { SUPPLEMENTS_DATABASE } from '../data/supplements-database';
import Input from './Input';
import Button from './Button';

export default function SupplementNameAutocomplete({ value, onChange, history = [], onBlur, ...rest }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef(null);
  const blurTimerRef = useRef(null);

  // Top-4 recents from history. History is already de-duped at write time.
  const recents = useMemo(() => history.slice(0, 4), [history]);
  const showRecents = focused && !value && recents.length > 0;

  const computeSuggestions = useCallback((text) => {
    if (!text || text.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const lower = text.toLowerCase();
    const seen = new Set();
    const results = [];

    for (const name of history) {
      if (name.toLowerCase().includes(lower) && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        results.push(name);
        if (results.length >= 5) break;
      }
    }

    for (const name of SUPPLEMENTS_DATABASE) {
      if (results.length >= 5) break;
      if (name.toLowerCase().includes(lower) && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        results.push(name);
      }
    }

    setSuggestions(results);
    setOpen(results.length > 0);
  }, [history]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => computeSuggestions(value), 200);
    return () => clearTimeout(debounceRef.current);
  }, [value, computeSuggestions]);

  const handleSelect = (name) => {
    onChange({ target: { value: name } });
    setOpen(false);
    setSuggestions([]);
  };

  const handleFocus = () => {
    clearTimeout(blurTimerRef.current);
    setFocused(true);
    if (suggestions.length > 0) setOpen(true);
  };

  const handleBlur = (e) => {
    blurTimerRef.current = setTimeout(() => { setOpen(false); setFocused(false); }, 200);
    onBlur?.(e);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <Input
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...rest}
      />
      {showRecents && (
        <div style={{ marginTop: spacing.sm }}>
          <div style={{
            fontSize: typography.label,
            color: theme.text.muted,
            letterSpacing: typography.labelSpacingWide,
            textTransform: 'uppercase',
            fontWeight: typography.semibold,
            marginBottom: spacing.xs,
          }}>
            Recent
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
            {recents.map((name) => (
              <Button
                key={name}
                variant="selector"
                onPointerDown={(e) => { e.preventDefault(); handleSelect(name); }}
              >
                {name}
              </Button>
            ))}
          </div>
        </div>
      )}
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: theme.surface.modal,
          border: `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
          borderRadius: theme.radius.surface,
          boxShadow: shadows.popover,
          zIndex: 10,
          overflow: 'hidden',
          maxHeight: 300,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {suggestions.map((name, i) => (
            <div
              key={name}
              onPointerDown={(e) => { e.preventDefault(); handleSelect(name); }}
              style={{
                padding: `${spacing.sm}px ${spacing.md}px`,
                fontSize: typography.body,
                color: theme.text.primary,
                borderBottom: i < suggestions.length - 1
                  ? `${theme.borderWidth.subtle}px solid ${theme.border.subtle}`
                  : 'none',
                cursor: 'pointer',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
