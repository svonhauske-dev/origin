import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// True when the user has iOS Settings → Accessibility → Motion → Reduce Motion
// ON. Animations should fall back to a cross-fade or a static state for these
// users; everyone else keeps the normal transitions. Updates live if the user
// toggles the setting while the app is open.
export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (alive) setReduce(!!v); });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => setReduce(!!v));
    return () => { alive = false; sub?.remove?.(); };
  }, []);
  return reduce;
}
