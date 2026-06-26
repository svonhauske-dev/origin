import { Text } from 'react-native';
import { theme, typography, spacing, fonts } from '../theme';

// Section explanation text below a Label (RN port of src/components/HelperText.jsx).
export default function HelperText({ children, style, ...rest }) {
  return (
    <Text allowFontScaling={false}
      style={[
        {
          fontSize: typography.caption,
          color: theme.text.secondary,
          fontFamily: fonts.grotesk.medium,
          marginTop: spacing.xxs,
          marginBottom: spacing.md,
          lineHeight: Math.round(typography.caption * 1.5),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
