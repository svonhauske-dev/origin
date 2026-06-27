import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../theme';

// Theme-aware surface for CHROME (cards, header buttons, day cells, summary).
//
// • Retro (theme.glass == null): renders a plain opaque <View style={style}> —
//   BYTE-IDENTICAL to the previous container, so the shipped look is unchanged.
// • Futuristic (theme.glass set): renders frosted Liquid Glass — a BlurView +
//   tint + hairline border — reusing the caller's layout (radius, padding,
//   size) but swapping the opaque fill/border for the glass material.
//
// Usage: replace `<View style={cardStyle}>…</View>` with
//        `<Surface style={cardStyle}>…</Surface>`. Pass `accent` for the
//        accent-tinted variant (selected day, summary card).
export default function Surface({ accent = false, style, children, ...rest }) {
  const g = theme.glass;

  // Retro / any non-glass theme — unchanged opaque surface.
  if (!g) {
    return <View style={style} {...rest}>{children}</View>;
  }

  // Futuristic glass — keep layout from `style`, drop its opaque fill/border.
  const flat = StyleSheet.flatten(style) || {};
  const { backgroundColor, borderColor, borderWidth, ...layout } = flat;
  return (
    <View
      style={[layout, { overflow: 'hidden', borderWidth: borderWidth ?? theme.borderWidth.default, borderColor: accent ? g.accentBorder : g.border }]}
      {...rest}
    >
      <BlurView intensity={g.intensity} tint={g.blurTint} pointerEvents="none" style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: accent ? g.accentTint : g.tint }]} />
      {/* top-edge sheen — the bright specular line that reads as glass catching light */}
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: g.sheen }} />
      {children}
    </View>
  );
}
