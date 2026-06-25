import * as Haptics from 'expo-haptics';

// Thin haptics wrappers — all swallow errors so a missing/unsupported engine
// never breaks the flow. tapHaptic on check-off/selection; success/error on
// save outcomes (wired centrally in the Toast provider).
export const tapHaptic = () => { Haptics.selectionAsync().catch(() => {}); };
export const successHaptic = () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); };
export const errorHaptic = () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}); };
