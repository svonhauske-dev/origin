import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, useWindowDimensions } from 'react-native';
import { theme } from '../theme';

// Full-screen overlay that slides in from the right on enter and back out on
// exit (iOS push feel), matching the web's page transitions. The host keeps it
// in the tree always and flips `visible`; SlideScreen owns the mount/unmount so
// the EXIT animates (RN conditional renders otherwise unmount instantly).
//
// `children` are captured while visible so the screen keeps rendering its last
// content during the slide-out even after the host clears the backing state
// (e.g. detailProtocol → null).
export default function SlideScreen({ visible, children, zIndex = 500 }) {
  const { width } = useWindowDimensions();
  const x = useRef(new Animated.Value(width)).current;
  const [rendered, setRendered] = useState(visible);
  const [kept, setKept] = useState(children);

  useEffect(() => {
    if (visible) {
      setKept(children);
      setRendered(true);
      x.setValue(width);
      Animated.timing(x, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    } else if (rendered) {
      Animated.timing(x, { toValue: width, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: true })
        .start(({ finished }) => { if (finished) setRendered(false); });
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the captured content fresh while the screen is open (its own state may change).
  useEffect(() => { if (visible) setKept(children); }, [visible, children]);

  if (!rendered) return null;
  return (
    <Animated.View
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: theme.surface.canvas,
        transform: [{ translateX: x }],
        zIndex,
      }}
    >
      {kept}
    </Animated.View>
  );
}
