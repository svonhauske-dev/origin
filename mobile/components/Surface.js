import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { theme } from '../theme';

// True only when the expo-blur native module is actually in the running binary.
// Checks the Expo module registry (arch-agnostic — works on old + new arch),
// NOT the RN UIManager. When false — e.g. the new JS is running on an older dev
// binary that predates expo-blur — glass degrades to a translucent tinted
// surface instead of rendering an "Unimplemented component" red box.
const BLUR_AVAILABLE = !!requireOptionalNativeModule('ExpoBlurView');

// Theme-aware surface for CHROME (cards, header buttons, day cells, summary).
//
// • Retro (theme.glass == null): a plain opaque <View style={style}> —
//   BYTE-IDENTICAL to the previous container, so the shipped look is unchanged.
// • Futuristic + blur available: frosted Liquid Glass (BlurView + tint + border).
// • Futuristic + blur missing: translucent tint + border (graceful fallback).
//
// Replace `<View style={cardStyle}>…</View>` with `<Surface style={cardStyle}>…`.
// Pass `accent` for the accent-tinted variant (selected day, summary card).
export default function Surface({ accent = false, style, children, ...rest }) {
  const g = theme.glass;

  // Retro / any non-glass theme — unchanged opaque surface.
  if (!g) {
    return <View style={style} {...rest}>{children}</View>;
  }

  // Futuristic glass — keep layout from `style`, drop its opaque fill/border.
  const flat = StyleSheet.flatten(style) || {};
  const { backgroundColor, borderColor, borderWidth, ...layout } = flat;
  const border = { borderWidth: borderWidth ?? theme.borderWidth.default, borderColor: accent ? g.accentBorder : g.border };
  const tint = accent ? g.accentTint : g.tint;
  const sheen = <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: g.sheen }} />;

  // Fallback: translucent tinted surface (no native blur).
  if (!BLUR_AVAILABLE) {
    return (
      <View style={[layout, { overflow: 'hidden', backgroundColor: tint }, border]} {...rest}>
        {sheen}
        {children}
      </View>
    );
  }

  // Real frosted glass.
  return (
    <View style={[layout, { overflow: 'hidden' }, border]} {...rest}>
      <BlurView intensity={g.intensity} tint={g.blurTint} pointerEvents="none" style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} />
      {sheen}
      {children}
    </View>
  );
}
