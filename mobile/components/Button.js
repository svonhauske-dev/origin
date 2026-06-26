import { Pressable, Text } from 'react-native';
import { theme, typography, spacing, touch, fonts } from '../theme';

// Button (RN port of src/components/Button.jsx). Variants:
//   primary | secondary | tertiary | destructive | selector | icon | circle | startDay
// String children render in the variant's text style; node children render as-is.
export default function Button({
  variant = 'primary',
  size = 'default',
  active = false,
  solidActive = false,
  isFuture = false,
  fullWidth = false,
  disabled = false,
  onPress,
  style,
  textStyle,
  children,
  accessibilityLabel,
  ...rest
}) {
  const bw = theme.borderWidth.default;
  const abw = theme.borderWidth.accent;
  let c = {}; // container
  let t = {}; // text

  if (variant === 'primary') {
    c = { backgroundColor: theme.accent.default, minHeight: touch.min, paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
    t = { color: theme.text.onAccent, fontFamily: fonts.mono.semibold, fontSize: typography.body };
  } else if (variant === 'startDay') {
    c = { backgroundColor: isFuture ? theme.surface.cardHover : theme.accent.default, minHeight: spacing.xxl, paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
    t = { color: isFuture ? theme.text.secondary : theme.text.onAccent, fontFamily: fonts.mono.semibold, fontSize: typography.body };
  } else if (variant === 'secondary') {
    c = { backgroundColor: 'transparent', borderWidth: bw, borderColor: theme.border.subtle, minHeight: touch.min, paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
    t = { color: theme.text.primary, fontFamily: fonts.mono.medium, fontSize: typography.caption };
  } else if (variant === 'tertiary') {
    c = { backgroundColor: 'transparent', borderWidth: bw, borderColor: theme.border.strong, minHeight: touch.min, paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
    t = { color: theme.text.secondary, fontFamily: fonts.mono.semibold, fontSize: typography.caption };
  } else if (variant === 'destructive') {
    c = { backgroundColor: 'transparent', borderWidth: bw, borderColor: theme.status.dangerBorder, minHeight: touch.min, paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
    t = { color: theme.status.danger, fontFamily: fonts.mono.medium, fontSize: typography.body };
  } else if (variant === 'selector') {
    const sel = { minHeight: touch.min, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderWidth: bw };
    if (active && solidActive) {
      c = { ...sel, backgroundColor: theme.accent.default, borderColor: theme.accent.default };
      t = { color: theme.text.onAccent, fontFamily: fonts.mono.semibold, fontSize: typography.caption };
    } else if (active) {
      c = { ...sel, backgroundColor: theme.accent.subtle, borderColor: theme.accent.default };
      t = { color: theme.accent.onSubtle, fontFamily: fonts.mono.semibold, fontSize: typography.caption };
    } else {
      c = { ...sel, backgroundColor: 'transparent', borderColor: theme.border.subtle };
      t = { color: theme.text.secondary, fontFamily: fonts.mono.regular, fontSize: typography.caption };
    }
  } else if (variant === 'icon') {
    c = { width: touch.min, height: touch.min, backgroundColor: 'transparent', borderWidth: bw, borderColor: theme.border.subtle };
    t = { color: theme.text.secondary, fontSize: typography.caption };
  } else if (variant === 'circle') {
    // "circle" is a misnomer — the web uses radius.button (0 in achromatic) → square.
    const circle = { width: 36, height: 36, borderRadius: theme.radius.button };
    if (active) {
      c = { ...circle, backgroundColor: theme.accent.subtle, borderWidth: abw, borderColor: theme.accent.default };
      t = { color: theme.accent.onSubtle, fontFamily: fonts.mono.semibold, fontSize: typography.label };
    } else {
      c = { ...circle, backgroundColor: 'transparent', borderWidth: bw, borderColor: theme.border.subtle };
      t = { color: theme.text.primary, fontFamily: fonts.mono.regular, fontSize: typography.label };
    }
  }

  if (size === 'compact') {
    c = { ...c, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm };
    t = { ...t, fontSize: typography.caption };
  }

  const container = {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: c.borderRadius ?? theme.radius.button,
    opacity: disabled ? 0.4 : 1,
    ...(fullWidth ? { alignSelf: 'stretch' } : {}),
    ...c,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [container, pressed && !disabled && { opacity: 0.85 }, style]}
      {...rest}
    >
      {typeof children === 'string' ? <Text allowFontScaling maxFontSizeMultiplier={1.4} numberOfLines={1} style={[t, textStyle]}>{children}</Text> : children}
    </Pressable>
  );
}
