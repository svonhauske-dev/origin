import { Text } from 'react-native';
import { theme, typography, spacing, fonts, letterSpacing as LS } from '../theme';

// Uppercase, letter-spaced section label (RN port of src/components/Label.jsx).
export default function Label({ style, children, ...rest }) {
  return (
    <Text
      style={[
        {
          fontFamily: fonts.mono.semibold,
          fontSize: typography.label,
          color: theme.text.secondary,
          marginBottom: spacing.xs,
          letterSpacing: LS.label,
          textTransform: 'uppercase',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
