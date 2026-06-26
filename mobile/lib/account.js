// Account deletion client helper. Calls the delete_account Edge Function, which
// removes the user's data + auth account server-side (the anon key can't delete
// an auth user — that needs the service role, which only the function holds).
//
// SUPA_URL / SUPA_KEY are the PUBLIC project URL + anon key. They're hard-coded
// in the shared web api.js too, but that file doesn't export them and is
// read-only ("never touch the web app"), so we keep our own copy here.
import { refreshSession } from 'shared/lib/api';

const SUPA_URL = 'https://yahimlivfieuknagusxp.supabase.co';

// Permanently delete the signed-in user's account + data. Throws on failure so
// the caller can keep the user on the screen and surface an error.
export async function deleteAccount() {
  const call = (jwt) =>
    fetch(`${SUPA_URL}/functions/v1/delete_account`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    });

  let jwt = global.localStorage.getItem('sb_token') || '';
  let res = await call(jwt);
  // One retry after a token refresh, mirroring supa()/recomputeNotifications.
  if (res.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed) res = await call(refreshed);
  }
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json())?.detail || ''; } catch {}
    throw new Error(`Delete failed: ${res.status}${detail ? ` — ${detail}` : ''}`);
  }
  return true;
}
