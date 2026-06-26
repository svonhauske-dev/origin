// supabase/functions/delete_account/index.ts
// Permanently deletes the authenticated user's account and all their data.
// Required by App Store Review Guideline 5.1.1(v): an app that supports account
// creation must offer in-app account deletion.
//
// Auth: the user can only delete THEMSELVES. The id to delete is read from the
// verified JWT (admin.auth.getUser), never from the request body — a caller
// cannot pass someone else's id. Runs with verify_jwt=false (see config.toml)
// and validates the token internally, matching recompute_notifications so the
// CORS preflight doesn't require an apikey header.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

// User-owned tables keyed by user_id. Deleted BEFORE the auth user so a RESTRICT
// foreign key can't block the auth deletion; harmless if the FK already cascades.
const USER_ID_TABLES = [
  "daily_logs",
  "supplements",
  "protocols",
  "user_schedule",
  "user_supplement_history",
  "push_subscriptions",
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });

  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "Missing Authorization" }, 401);

  // Identify the caller from their own token. Never trust a body-supplied id.
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userData?.user) return json({ error: "Invalid token" }, 401);
  const userId = userData.user.id;

  // Best-effort wipe of user-owned rows. A per-table failure (missing table or
  // column) must not block the account deletion the user explicitly requested.
  for (const table of USER_ID_TABLES) {
    const { error } = await admin.from(table).delete().eq("user_id", userId);
    if (error) console.error(`delete ${table} failed:`, error.message);
  }
  // user_profiles is keyed by id (= auth uid), not user_id.
  {
    const { error } = await admin.from("user_profiles").delete().eq("id", userId);
    if (error) console.error("delete user_profiles failed:", error.message);
  }

  // Finally remove the auth user. This is what actually deletes the "account";
  // anything still FK-referencing it with ON DELETE CASCADE goes with it.
  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) return json({ error: "Failed to delete account", detail: delErr.message }, 500);

  return json({ ok: true });
});
