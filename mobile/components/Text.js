import { Text as RNText } from 'react-native';
import { theme, typography, fonts } from '../theme';

// Body / data text primitive. RN has no implicit text styling, so screens use
// this for running copy instead of raw <Text>. In Terminal Achromatic both body
// and data are JetBrains Mono, so this is mono with a tone + weight + size.
//
// tone:   primary | secondary | tertiary | disabled | onAccent | danger
// weight: regular | medium | semibold | bold
// size:   any typography size token name (body, caption, label, title, …)
export default function Text({ tone = 'primary', weight = 'regular', size = 'body', style, children, ...rest }) {
  const color =
    tone === 'secondary' ? theme.text.secondary :
    tone === 'tertiary' ? theme.text.tertiary :
    tone === 'disabled' ? theme.text.disabled :
    tone === 'onAccent' ? theme.text.onAccent :
    tone === 'danger' ? theme.status.danger :
    theme.text.primary;

  const fontSize = typography[size] ?? typography.body;

  return (
    <RNText
      allowFontScaling
      maxFontSizeMultiplier={1.4}
      style={[
        {
          color,
          fontSize,
          fontFamily: fonts.mono[weight] || fonts.mono.regular,
          lineHeight: Math.round(fontSize * 1.4),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
