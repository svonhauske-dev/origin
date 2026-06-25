import * as Notifications from 'expo-notifications';

// Local-notification reminders for the day's slots. No remote push/APNs — these
// are device-scheduled daily-repeating local notifications fired at each slot
// time. (The web app uses web-push; mobile uses local scheduling instead.)

// Foreground presentation: show the banner even when the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function getNotificationPermission() {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

export async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  if (!current.canAskAgain) return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// slots: [{ label, time: 'HH:MM' }] — cancel everything and schedule one daily
// repeating reminder per slot. Safe to call on every schedule/supplement change.
export async function rescheduleSlotReminders(slots) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const seen = new Set();
  for (const slot of slots || []) {
    if (!slot?.time) continue;
    const [hour, minute] = slot.time.split(':').map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) continue;
    const key = `${hour}:${minute}`;
    if (seen.has(key)) continue; // collapse same-time slots into one reminder
    seen.add(key);
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Origin', body: `Time for ${slot.label}`, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
  }
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
