import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Animated, Easing } from 'react-native';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react-native';
import Text from './Text';
import { successHaptic, errorHaptic } from '../lib/haptics';
import { theme, spacing, typography, icon as iconScale, shadow } from '../theme';

// RN port of src/components/Toast.jsx + ToastContext.jsx. Bottom-anchored,
// auto-dismissing toasts. useToast().show(message, { tone, duration }).
const ToastContext = createContext(null);
export function useToast() {
  return useContext(ToastContext) || { show: () => {} };
}

const TONE_ICON = { success: CheckCircle2, error: AlertCircle, warning: AlertTriangle, info: Info };
const toneColor = (tone) => ({ success: theme.status.success, error: theme.status.danger, warning: theme.status.warning, info: theme.text.secondary }[tone] ?? theme.text.secondary);

function ToastItem({ toast }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: toast.leaving ? 0 : 1,
      duration: toast.leaving ? 200 : 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [toast.leaving]); // eslint-disable-line react-hooks/exhaustive-deps

  const Icon = toast.tone ? TONE_ICON[toast.tone] : null;
  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: theme.surface.canvas,
        borderWidth: theme.borderWidth.default,
        borderColor: theme.border.strong,
        borderRadius: theme.radius.surface,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        ...shadow.elevated,
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }) }],
      }}
    >
      {Icon ? <Icon size={iconScale.xs} strokeWidth={2.25} color={toneColor(toast.tone)} /> : null}
      <Text style={{ flex: 1, fontSize: typography.body, color: theme.text.primary }}>{toast.message}</Text>
    </Animated.View>
  );
}

let nextId = 0;
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const show = useCallback((message, options = {}) => {
    if (options.tone === 'success') successHaptic();
    else if (options.tone === 'error') errorHaptic();
    const dur = options.duration ?? 3000;
    const id = ++nextId;
    setToasts((ts) => [...ts, { id, message, tone: options.tone, leaving: false }]);
    const leaveTimer = setTimeout(() => setToasts((ts) => ts.map((x) => (x.id === id ? { ...x, leaving: true } : x))), Math.max(0, dur - 250));
    const removeTimer = setTimeout(() => { setToasts((ts) => ts.filter((x) => x.id !== id)); delete timersRef.current[id]; }, dur);
    timersRef.current[id] = { leaveTimer, removeTimer };
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      <View style={{ flex: 1 }}>
        {children}
        {toasts.length ? (
          <View pointerEvents="none" style={{ position: 'absolute', left: spacing.md, right: spacing.md, bottom: 50, zIndex: 2000, gap: spacing.xs }}>
            {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
          </View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}
