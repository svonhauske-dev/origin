// src/lib/notifications.js — Web Push notifications client API

import { supa, getSession } from "./api";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// ── Slot definitions — used by SlotCard / App.jsx for slot rendering ──────────

export const SLOTS = [
  { id: "rx",            label: "Anchor Medication", sublabel: "Empty stomach · first thing", icon: "★" },
  { id: "pre_breakfast", label: "Before Breakfast",  sublabel: "30 min before eating",        icon: "◎" },
  { id: "breakfast",     label: "With Breakfast",    sublabel: "With food",                   icon: "●" },
  { id: "pre_lunch",     label: "Before Lunch",      sublabel: "30 min before eating",        icon: "◎" },
  { id: "lunch",         label: "With Lunch",        sublabel: "With food",                   icon: "●" },
  { id: "pre_dinner",    label: "Before Dinner",     sublabel: "30 min before eating",        icon: "◎" },
  { id: "dinner",        label: "With Dinner",       sublabel: "With food",                   icon: "●" },
  { id: "after_dinner",  label: "Evening",           sublabel: "Before bed",                  icon: "◑" },
];

// Slot definitions for Intermittent Fasting mode (v2 fixed-schedule model).
// These IDs are entirely separate from SLOTS — they never appear in non-IF contexts.
export const IF_SLOTS = [
  { id: "fasted",     label: "Fasted",     sublabel: "Before eating window", icon: "◎" },
  { id: "meal_1",     label: "Meal 1",     sublabel: "Window opens",         icon: "●" },
  { id: "pre_meal_2", label: "Pre-Meal 2", sublabel: "Before second meal",   icon: "◎" },
  { id: "meal_2",     label: "Meal 2",     sublabel: "With food",            icon: "●" },
  { id: "pre_meal_3", label: "Pre-Meal 3", sublabel: "Before third meal",    icon: "◎" },
  { id: "meal_3",     label: "Meal 3",     sublabel: "With food",            icon: "●" },
  { id: "evening",    label: "Evening",    sublabel: "Before bed",           icon: "◑" },
];

// ── Service worker registration ───────────────────────────────────────────────

let swRegistrationPromise = null;

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers not supported in this browser");
  }
  if (!swRegistrationPromise) {
    swRegistrationPromise = navigator.serviceWorker.register("/sw.js", { scope: "/" });
  }
  return swRegistrationPromise;
}

// ── Browser support detection ─────────────────────────────────────────────────

export function isPushSupported() {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isIOSPWA() {
  return isIOS() && window.navigator.standalone === true;
}

export function needsHomeScreenInstall() {
  return isIOS() && !isIOSPWA();
}

// ── Permission ────────────────────────────────────────────────────────────────

export function getNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

// ── Subscribe / unsubscribe ───────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0));
}

export async function subscribeToPush() {
  if (!isPushSupported()) {
    throw new Error("Push notifications not supported in this browser");
  }
  if (needsHomeScreenInstall()) {
    throw new Error("PWA install required on iOS — please add Origin to your home screen first");
  }
  if (!VAPID_PUBLIC_KEY) {
    throw new Error("VAPID public key missing — check VITE_VAPID_PUBLIC_KEY env var");
  }

  const user = await getSession();
  if (!user) throw new Error("Not signed in");
  const tok = localStorage.getItem("sb_token") || "";

  const reg = await registerServiceWorker();
  await navigator.serviceWorker.ready;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission denied");
  }

  // Wipe any pre-existing SW subscription before creating a fresh one. The
  // service worker's push state is per-device, not per-user — if a different
  // account was previously signed into this device and enabled notifications,
  // its endpoint would still be bound to the SW and would otherwise end up
  // shared across two users in the DB. Subscribing fresh produces a new
  // endpoint that maps unambiguously to the current user. The previous
  // endpoint, now invalid at the push service, gets auto-cleaned the next
  // time the edge function tries to push to it (404/410 cleanup is already
  // in place in process_notifications_queue + notify_protocol_sent). We also
  // clear the current user's row at the old endpoint here so a same-user
  // re-enable doesn't leave a transient dead row.
  const existing = await reg.pushManager.getSubscription();
  if (existing) {
    const oldEndpoint = existing.endpoint;
    await existing.unsubscribe();
    try {
      await supa(
        "DELETE",
        `/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(oldEndpoint)}`,
        null,
        tok,
      );
    } catch {/* RLS may filter when the old row belongs to another user; harmless */}
  }

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  const subJSON = subscription.toJSON();
  await supa("POST", "/rest/v1/push_subscriptions", {
    user_id: user.id,
    endpoint: subJSON.endpoint,
    p256dh: subJSON.keys.p256dh,
    auth: subJSON.keys.auth,
    user_agent: navigator.userAgent,
  }, tok);

  return subscription;
}

export async function unsubscribeFromPush() {
  if (!isPushSupported()) return;

  const reg = await registerServiceWorker();
  const subscription = await reg.pushManager.getSubscription();

  if (subscription) {
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();

    const tok = localStorage.getItem("sb_token") || "";
    await supa(
      "DELETE",
      `/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`,
      null,
      tok
    );
  }
}

// ── Status check ──────────────────────────────────────────────────────────────

export async function getCurrentSubscription() {
  if (!isPushSupported()) return null;
  try {
    const reg = await registerServiceWorker();
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}
