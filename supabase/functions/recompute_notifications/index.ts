// supabase/functions/recompute_notifications/index.ts
//
// Two-mode endpoint:
//
//   1. JWT mode — frontend calls with `Authorization: Bearer <user_jwt>` and
//      a JSON body `{ timezone }`. Recomputes the next 48h of notifications
//      for that user only. Also writes the supplied timezone to
//      user_schedule.timezone so the cron loop knows what TZ to use for
//      this user when it runs.
//
//   2. Cron mode — pg_cron (or any caller with the CRON_SECRET) sends
//      `X-Cron-Secret: <secret>` and an empty body. The function loops over
//      every user with notifications_enabled=true and refills each user's
//      48h window using their stored timezone (defaulting to UTC if none).
//      This is what prevents the notifications_queue from running dry when
//      a user doesn't open the app for a few days.
//
// Both modes call the same `recomputeForUser` helper in _shared.

import { createClient } from "npm:@supabase/supabase-js@2";
import { recomputeForUser, type RecomputeResult } from "../_shared/recompute_user_logic.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Cron-Secret",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey     = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Admin client for all DB writes (bypasses RLS). Used in both modes.
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // ── Cron mode ───────────────────────────────────────────────────────────────
  // pg_cron passes X-Cron-Secret as a shared-secret bearer. If present and
  // valid, run the all-users refill loop. We check this BEFORE JWT parsing so
  // a caller doesn't need both credentials.
  const cronSecret    = req.headers.get("X-Cron-Secret") ?? "";
  const expectedCron  = Deno.env.get("CRON_SECRET") ?? "";

  if (cronSecret && expectedCron && cronSecret === expectedCron) {
    const { data: enabledRows, error: enabledErr } = await admin
      .from("user_schedule")
      .select("user_id, timezone, schedule_type")
      .eq("notifications_enabled", true)
      .neq("schedule_type", "none");

    if (enabledErr) {
      return jsonResponse({ error: "Failed to load enabled users", detail: enabledErr.message }, 500);
    }

    const results: Array<{ user_id: string; tz: string; result?: RecomputeResult; error?: string }> = [];
    for (const row of enabledRows ?? []) {
      const userTz = row.timezone || "UTC";
      try {
        const result = await recomputeForUser(admin, row.user_id, userTz);
        results.push({ user_id: row.user_id, tz: userTz, result });
      } catch (err) {
        results.push({ user_id: row.user_id, tz: userTz, error: String(err) });
      }
    }

    const totalQueued = results.reduce((sum, r) => sum + (r.result?.queued ?? 0), 0);
    const errorCount  = results.filter((r) => r.error).length;
    return jsonResponse({
      mode:        "cron",
      users:       results.length,
      total_queued: totalQueued,
      errors:      errorCount,
      results,
    });
  }

  // ── JWT mode (frontend single-user call) ────────────────────────────────────
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
  }
  const jwt = authHeader.slice(7);

  let tz = "UTC";
  try {
    const body = await req.json();
    if (typeof body?.timezone === "string" && body.timezone.length > 0) {
      tz = body.timezone;
    }
  } catch { /* empty body or non-JSON — fall back to UTC */ }

  // Verify the user JWT
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const { data: { user }, error: authErr } = await userClient.auth.getUser();
  if (authErr || !user) {
    return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
  }
  const userId = user.id;

  // Persist the user's IANA timezone on user_schedule so the cron loop can
  // pick it up when the user isn't around to call this function with a fresh
  // tz from the browser. Best-effort — if the row doesn't exist (no schedule
  // saved yet) this UPDATE silently affects 0 rows and that's fine.
  await admin
    .from("user_schedule")
    .update({ timezone: tz })
    .eq("user_id", userId);

  try {
    const result = await recomputeForUser(admin, userId, tz);
    return jsonResponse({ ...result, tz });
  } catch (err) {
    console.error("recomputeForUser failed:", err);
    return jsonResponse({ error: "Recompute failed", detail: String(err) }, 500);
  }
});
