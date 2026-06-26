// Offline read cache — persists the last successfully-loaded dataset per user so
// a cold or offline launch shows real content instead of a blank screen, then
// refreshes from the network. Backed by the synchronous kv-store (via the
// global.localStorage shim, see storage-shim.js), the same store that holds the
// auth token, so it survives app restarts.
//
// Scope: READ. This lets people SEE their protocol offline. Offline EDITS still
// hit the network on the autosave path and are not queued — full offline sync
// (an outbox) would be a separate, larger piece of work.

const KEY = (uid) => `origin_cache_v1_${uid}`;

export function readCache(uid) {
  if (!uid) return null;
  try {
    const raw = global.localStorage.getItem(KEY(uid));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeCache(uid, snapshot) {
  if (!uid) return;
  try {
    global.localStorage.setItem(KEY(uid), JSON.stringify(snapshot));
  } catch {
    // Best-effort — a failed cache write must never break a successful load.
  }
}

export function clearCache(uid) {
  if (!uid) return;
  try {
    global.localStorage.removeItem(KEY(uid));
  } catch {
    // no-op
  }
}
