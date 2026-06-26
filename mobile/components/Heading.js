import { Text } from 'react-native';
import { theme, typography, fonts, letterSpacing as LS } from '../theme';

// Heading primitive (RN port of src/components/Heading.jsx).
// `level` is kept for semantics (maps to accessibilityRole="header"); `visual`
// drives size — decoupling document role from styling, like the web version.
// In RN the weight is encoded in the font family (fonts.<face>.<weight>).

const VISUAL_TO_SIZE = {
  display: typography.display,
  heading: typography.heading,
  title: typography.title,
  body: typography.body,
  caption: typography.caption,
  label: typography.label,
};

const LEVEL_DEFAULT_VISUAL = { 1: 'display', 2: 'heading', 3: 'title', 4: 'body', 5: 'body', 6: 'body' };

export default function Heading({ level = 2, visual, weight = 'semibold', font, children, style, ...rest }) {
  const v = visual || LEVEL_DEFAULT_VISUAL[level] || 'body';
  const fontSize = VISUAL_TO_SIZE[v] ?? typography.body;
  const isLabelVisual = v === 'label';

  // Family: explicit `font` prop wins; label-visual uses mono; else Space Grotesk.
  const face = font === 'body' ? 'mono' : font === 'heading' ? 'grotesk' : isLabelVisual ? 'mono' : 'grotesk';
  const fontFamily = fonts[face][weight] || fonts[face].semibold;

  const ls =
    v === 'display' ? LS.display :
    v === 'heading' || v === 'title' ? LS.heading :
    isLabelVisual ? LS.label :
    0;

  return (
    <Text
      accessibilityRole="header"
      allowFontScaling
      maxFontSizeMultiplier={1.4}
      style={[
        {
          fontFamily,
          fontSize,
          color: isLabelVisual ? theme.text.secondary : theme.text.primary,
          letterSpacing: ls,
          lineHeight: isLabelVisual ? fontSize : Math.round(fontSize * 1.25),
          textTransform: isLabelVisual ? 'uppercase' : 'none',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
