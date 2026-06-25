import { useEffect, useRef, useState } from 'react';
import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, Animated, Easing, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { PickerGroupContext } from './pickerGroup';
import Text from './Text';
import { theme, spacing, typography, radius, icon, touch, fonts } from '../theme';

// Bottom-sheet modal — rendered as an in-app ABSOLUTE OVERLAY rather than RN's
// native <Modal>. The native Modal (transparent) glitches on iOS: it flashes a
// blank frame when a TextInput elsewhere focuses, and can leave a lingering
// touch-capturing overlay on dismiss. An overlay View has none of those issues,
// and a translateY animation gives the slide-up. Returns null when closed, so
// nothing is mounted (and nothing can intercept touches) while hidden.
export default function Modal({ open, onClose, title, children, footer }) {
  const slide = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const prevContentH = useRef(0);
  const [openPickerId, setOpenPickerId] = useState(null);
  const { height: winH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // RN ScrollViews don't size their frame to their content, so the sheet can't
  // know how tall to be — measure the content and set the scroll area to
  // min(content, cap). The sheet then grows to fit and only scrolls past the cap.
  const [contentH, setContentH] = useState(0);
  // Cap the scroll area at the sheet's max (90%) minus the fixed chrome
  // (handle + header + footer ≈ 190) so the footer is never pushed off-screen.
  const scrollCap = winH * 0.9 - 220;
  // Bottom clearance for the home indicator + breathing room.
  const SAFE_BOTTOM = insets.bottom + spacing.sm;

  useEffect(() => {
    if (open) {
      prevContentH.current = 0; // reset so the first measure on open doesn't auto-scroll
      slide.setValue(0);
      Animated.timing(slide, { toValue: 1, duration: 240, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, justifyContent: 'flex-end' }}>
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: slide }}>
        <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: theme.surface.backdrop }} />
      </Animated.View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View
          style={{
            maxHeight: winH * 0.9,
            backgroundColor: theme.surface.modal,
            borderTopLeftRadius: radius.modal,
            borderTopRightRadius: radius.modal,
            overflow: 'hidden',
            transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }) }],
          }}
        >
          {/* Drag handle */}
          <View style={{ paddingTop: 16, paddingBottom: 12, alignItems: 'center' }}>
            <View style={{ width: 36, height: 5, borderRadius: theme.radius.pill, backgroundColor: theme.border.subtle, opacity: 0.7 }} />
          </View>

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: spacing.md,
              paddingTop: spacing.xs,
              paddingBottom: spacing.sm,
              borderBottomWidth: theme.borderWidth.default,
              borderBottomColor: theme.border.subtle,
            }}
          >
            <Text style={{ fontSize: typography.title, color: theme.text.primary, fontFamily: fonts.grotesk.semibold }}>{title}</Text>
            <Pressable
              onPress={onClose}
              accessibilityLabel="Close"
              style={{ width: touch.min, height: touch.min, borderWidth: theme.borderWidth.default, borderColor: theme.border.subtle, borderRadius: theme.radius.button, alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={icon.sm} color={theme.text.secondary} />
            </Pressable>
          </View>

          {/* Scrollable body — maxHeight lets the sheet grow to fit content and
              only scroll once the content actually exceeds the cap. Without a
              cap, a ScrollView in an auto-height parent gets a constrained
              height and clips instead of growing. */}
          <ScrollView
            ref={scrollRef}
            style={{ height: contentH ? Math.min(contentH, scrollCap) : undefined }}
            // When content GROWS past the cap AFTER open (e.g. a date/time picker
            // opens mid-form), scroll to reveal it. Guard on prev>0 + growth so it
            // never auto-scrolls on the initial mount of a tall form.
            onContentSizeChange={(w, h) => {
              setContentH(h);
              if (h > scrollCap && prevContentH.current > 0 && h > prevContentH.current) scrollRef.current?.scrollToEnd({ animated: true });
              prevContentH.current = h;
            }}
            contentContainerStyle={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: footer ? spacing.sm : SAFE_BOTTOM }}
            keyboardShouldPersistTaps="handled"
          >
            <PickerGroupContext.Provider value={{ openId: openPickerId, setOpenId: setOpenPickerId }}>
              {children}
            </PickerGroupContext.Provider>
          </ScrollView>

          {/* Sticky footer */}
          {footer ? (
            <View style={{ paddingTop: spacing.sm, paddingBottom: SAFE_BOTTOM, paddingHorizontal: spacing.md, borderTopWidth: theme.borderWidth.default, borderTopColor: theme.border.subtle }}>
              {footer}
            </View>
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}
