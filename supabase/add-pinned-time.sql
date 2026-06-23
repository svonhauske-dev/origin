-- Pinned-time for anytime supplements (June 23, 2026)
--
-- Adds an optional absolute clock time to a supplement. Only meaningful for
-- "anytime" supps (empty `slots` array): the supp opts out of the cascade and
-- fires at this exact local HH:MM every active day, in any schedule mode —
-- e.g. birth control at 19:00. NULL = no pinned time (current behavior).
--
-- Additive and nullable, so existing rows are unaffected and no backfill is
-- needed. Run this BEFORE deploying the frontend and redeploying the
-- recompute_notifications edge function (both read/write the column).

ALTER TABLE public.supplements
  ADD COLUMN IF NOT EXISTS pinned_time text;
