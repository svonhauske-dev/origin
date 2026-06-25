import { View, Pressable } from 'react-native';
import Text from './Text';
import { theme, spacing, touch, fonts } from '../theme';

// RN port of src/components/TabBar.jsx — underline tab bar.
export default function TabBar({ tabs, active, onChange, style }) {
  return (
    <View style={[{ flexDirection: 'row', borderBottomWidth: theme.borderWidth.default, borderBottomColor: theme.border.subtle }, style]}>
      {tabs.map(({ value, label }) => {
        const on = active === value;
        return (
          <Pressable
            key={value}
            onPress={() => onChange(value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={label}
            style={{
              flex: 1,
              alignItems: 'center',
              minHeight: touch.min,
              paddingTop: spacing.xs,
              paddingBottom: spacing.sm,
              marginBottom: -1,
              borderBottomWidth: 2,
              borderBottomColor: on ? theme.accent.default : 'transparent',
            }}
          >
            <Text size="body" style={{ color: on ? theme.text.primary : theme.text.secondary, fontFamily: on ? fonts.mono.semibold : fonts.mono.regular }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
