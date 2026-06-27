import { View, Text } from 'react-native';
import { theme, typography, spacing, fonts, letterSpacing as LS } from '../theme';

// Small status/category badge (RN port of src/components/Badge.jsx).
export default function Badge({ variant = 'neutral', style, children }) {
  // Computed in render (not module scope) so it tracks the active theme.
  const VARIANTS = {
    now: { bg: theme.status.nowBadgeBg, color: theme.accent.default },
    missed: { bg: theme.status.warningSubtle, color: theme.status.warning },
    category: { bg: theme.accent.subtle, color: theme.accent.onSubtle },
    neutral: { bg: theme.surface.cardHover, color: theme.text.secondary },
  };
  const v = VARIANTS[variant] ?? VARIANTS.neutral;
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          backgroundColor: v.bg,
          borderRadius: theme.radius.badge,
          paddingVertical: spacing.xxxs,
          paddingHorizontal: spacing.xs,
        },
        style,
      ]}
    >
      <Text allowFontScaling={false}
        style={{
          color: v.color,
          fontFamily: fonts.mono.semibold,
          fontSize: typography.label,
          letterSpacing: LS.label,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
