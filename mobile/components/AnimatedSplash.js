import { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import InlineLoader from './InlineLoader';

// Animated boot splash — the Origin radial wave on the splash background, shown
// while the app boots (fonts + session check) and continues into data-load.
// Graphics-only (no fonts) so it can take over from the native static splash
// immediately. Background matches app.json `splash.backgroundColor` (#1A1A1A)
// so the hand-off from the native splash is seamless. Fades in for a soft start.
export default function AnimatedSplash() {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading Origin"
      style={{ flex: 1, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={{ opacity: fade }} importantForAccessibility="no-hide-descendants">
        <InlineLoader size="full" />
      </Animated.View>
    </View>
  );
}
