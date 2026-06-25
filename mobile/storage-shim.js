// Synchronous localStorage shim for React Native.
//
// The shared web api.js (../src/lib/api.js) reads/writes auth tokens via the
// browser's SYNCHRONOUS localStorage (sb_token, sb_refresh_token, …). RN has no
// localStorage. This provides a synchronous global.localStorage so the shared
// auth code runs UNCHANGED.
//
// Backed by expo-sqlite's kv-store (synchronous + PERSISTENT) so the session
// survives app restarts. This replaced react-native-mmkv during the SDK 54
// upgrade — mmkv v2 doesn't build on RN 0.81 / Xcode 26, and kv-store is
// first-party, synchronous, and architecture-agnostic (works on old + new arch).
//
// MUST be imported FIRST in index.js, before any module that touches
// localStorage (i.e. before App / shared/lib/api).

import Storage from 'expo-sqlite/kv-store';

function makeStore() {
  try {
    // Touch the store once so a missing/unlinked native module trips the catch
    // immediately rather than on first auth read.
    Storage.getItemSync('__probe__');
    return {
      getItem: (key) => Storage.getItemSync(key) ?? null,
      setItem: (key, value) => Storage.setItemSync(key, String(value)),
      removeItem: (key) => Storage.removeItemSync(key),
      clear: () => Storage.clearSync(),
      key: (i) => Storage.getAllKeysSync()[i] ?? null,
      get length() { return Storage.getAllKeysSync().length; },
    };
  } catch (e) {
    // Native module not available — in-memory fallback (login won't persist).
    const m = new Map();
    return {
      getItem: (key) => (m.has(key) ? m.get(key) : null),
      setItem: (key, value) => { m.set(key, String(value)); },
      removeItem: (key) => { m.delete(key); },
      clear: () => { m.clear(); },
      key: (i) => Array.from(m.keys())[i] ?? null,
      get length() { return m.size; },
    };
  }
}

if (typeof global.localStorage === 'undefined') {
  global.localStorage = makeStore();
}
