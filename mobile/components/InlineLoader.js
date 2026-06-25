import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { theme } from '../theme';

// RN port of src/components/InlineLoader.jsx + Loader.jsx — the Origin wave
// loader: N expanding/fading rings (staggered) around a softly-pulsing dot.
//
// Implemented with Animated Views (border = ring) using transform scale +
// opacity, which run on the NATIVE thread (useNativeDriver: true) — this matches
// the web keyframes (scale(1)→scale(4)) and, crucially, keeps the animation off
// the JS thread so it can't lock up the UI during load. (An earlier SVG version
// animated `r`/`strokeWidth`, which forces useNativeDriver:false and froze boot.)
export const LOADER_CONFIGS = {
  sm:   { size: 20,  dotR: 2,   waveR: 3,  waveEnd: 9,  waves: 2, cycle: 1600, stagger: 550, sw: 1 },
  md:   { size: 32,  dotR: 2.5, waveR: 5,  waveEnd: 14, waves: 3, cycle: 2000, stagger: 550, sw: 1.2 },
  full: { size: 120, dotR: 3.5, waveR: 14, waveEnd: 56, waves: 4, cycle: 3000, stagger: 600, sw: 1.2 },
};

export default function InlineLoader({ size = 'md', color = theme.text.primary }) {
  const cfg = LOADER_CONFIGS[size] ?? LOADER_CONFIGS.md;
  const waveAnims = useRef(Array.from({ length: cfg.waves }, () => new Animated.Value(0))).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops = waveAnims.map((v) =>
      Animated.loop(Animated.timing(v, { toValue: 1, duration: cfg.cycle, easing: Easing.out(Easing.ease), useNativeDriver: true }))
    );
    const timers = waveAnims.map((_, i) => setTimeout(() => loops[i].start(), i * cfg.stagger));
    const dotLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: cfg.cycle / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: cfg.cycle / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    dotLoop.start();
    return () => {
      timers.forEach(clearTimeout);
      loops.forEach((l) => l.stop());
      dotLoop.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const scaleEnd = cfg.waveEnd / cfg.waveR;
  const ring = cfg.waveR * 2;

  return (
    <View style={{ width: cfg.size, height: cfg.size, alignItems: 'center', justifyContent: 'center' }}>
      {waveAnims.map((v, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: ring,
            height: ring,
            borderRadius: cfg.waveR,
            borderWidth: cfg.sw,
            borderColor: color,
            opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, scaleEnd] }) }],
          }}
        />
      ))}
      <Animated.View
        style={{
          position: 'absolute',
          width: cfg.dotR * 2,
          height: cfg.dotR * 2,
          borderRadius: cfg.dotR,
          backgroundColor: color,
          opacity: dotAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }),
        }}
      />
    </View>
  );
}
