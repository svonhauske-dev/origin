import { Pressable } from 'react-native';
import { theme, spacing } from '../theme';
import Surface from './Surface';

// Surface card (RN port of src/components/Card.jsx). Renders through Surface, so
// it's a plain opaque card in Retro and frosted glass in Futuristic.
// variant: default | selected | accent | subtle. Pass onPress to make it
// button-semantic (accessibilityRole + pressed feedback).
export default function Card({ variant = 'default', onPress, accent, style, children, accessibilityLabel }) {
  // Computed in render (not module scope) so it tracks the active theme.
  const VARIANTS = {
    default: { bg: theme.surface.card, border: theme.border.subtle },
    selected: { bg: theme.accent.subtle, border: theme.accent.default },
    accent: { bg: theme.accent.subtle, border: theme.accent.border },
    subtle: { bg: theme.surface.cardSubtle, border: theme.border.subtle },
  };
  const v = VARIANTS[variant] ?? VARIANTS.default;
  const isAccent = accent || variant === 'accent' || variant === 'selected';
  const base = {
    backgroundColor: v.bg,
    borderWidth: theme.borderWidth.default,
    borderColor: v.border,
    borderRadius: theme.radius.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  };

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
        <Surface accent={isAccent} style={[base, style]}>{children}</Surface>
      </Pressable>
    );
  }
  return <Surface accent={isAccent} style={[base, style]}>{children}</Surface>;
}
