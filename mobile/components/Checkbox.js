import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { theme, icon } from '../theme';

// Checked indicator (RN port of src/components/Checkbox.jsx).
// shape: "square" | "pill"; weight: "default" (1px) | "accent" (2px).
// lucide Check icon at size = floor(size*0.6), strokeWidth 3 — matches the web.
export default function Checkbox({ checked, size = icon.sm, shape = 'square', weight = 'default', style }) {
  const checkSize = Math.floor(size * 0.6);
  const borderWidth = weight === 'accent' ? theme.borderWidth.accent : theme.borderWidth.default;
  return (
    <View
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!checked }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: shape === 'pill' ? theme.radius.pill : theme.radius.surfaceInner,
          backgroundColor: checked ? theme.accent.default : 'transparent',
          borderWidth,
          borderColor: checked ? theme.accent.default : theme.border.strong,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {checked ? <Check size={checkSize} color={theme.text.onAccent} strokeWidth={3} /> : null}
    </View>
  );
}
