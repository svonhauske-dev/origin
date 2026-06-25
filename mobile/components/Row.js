import { Pressable, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { theme, spacing, touch, icon } from '../theme';

// Disclosure row (RN port of src/components/Row.jsx).
//   rightContent: undefined → default chevron when interactive; null → none; node → as-is.
export default function Row({ leftContent, rightContent, onPress, disabled = false, accessibilityLabel, style }) {
  const interactive = !!onPress && !disabled;
  const useDefaultChevron = rightContent === undefined && interactive;
  const right = useDefaultChevron ? (
    <ChevronRight size={icon.sm} color={theme.text.secondary} />
  ) : (
    rightContent
  );

  const base = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    width: '100%',
    minHeight: touch.min,
    opacity: disabled ? 0.4 : 1,
  };

  const inner = (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, minWidth: 0 }}>
        {leftContent}
      </View>
      {right != null ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>{right}</View>
      ) : null}
    </>
  );

  if (interactive) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [base, pressed && { opacity: 0.7 }, style]}
      >
        {inner}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{inner}</View>;
}
