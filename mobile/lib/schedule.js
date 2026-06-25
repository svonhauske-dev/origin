// Slot-time + status resolver — ported from src/App.jsx getSlotTime / slotStatus.
// Pure functions over a `ctx` so the Today screen and (later) notifications can
// share them. Adaptive timing (medication/wakeup re-flow) is intentionally NOT
// included yet — it lands with the notification work in Phase 5; until then
// anchor slots use their fixed offsets.
//
// ctx = { scheduleMode, scheduleConfig, effectivePillTime, slotOffsets,
//         isToday, isFuture, dk, eatingWindowOpens }

import { addMins, parseHHMM } from 'shared/lib/time';
import { computeIFSlotTimes } from 'shared/config';

function eveningTime(cfg) {
  const em = cfg.evening_mode;
  if (em === 'fixed' && cfg.evening_time) return parseHHMM(cfg.evening_time);
  if (em === 'before_sleep' && cfg.sleep_time) {
    const offsetMins = (cfg.evening_offset_hours ?? 1) * 60 + (cfg.evening_offset_minutes ?? 0);
    return addMins(parseHHMM(cfg.sleep_time), -offsetMins);
  }
  return null;
}

export function getSlotTime(sid, ctx) {
  const { scheduleMode, scheduleConfig: cfg, effectivePillTime, slotOffsets, isToday, dk, eatingWindowOpens, adaptiveInfo } = ctx;

  if (scheduleMode === 'fixed') {
    if (sid === 'pre_breakfast' || sid === 'pre_lunch' || sid === 'pre_dinner') {
      const mealId = sid.replace('pre_', '');
      const mealTime = cfg.fixed_times?.[mealId];
      if (!mealTime) return null;
      return addMins(parseHHMM(mealTime), -(cfg.pre_meal_window ?? 0));
    }
    const ft = cfg.fixed_times?.[sid];
    return ft ? parseHHMM(ft) : null;
  }

  if (scheduleMode === 'fasting') {
    if (sid === 'evening') return eveningTime(cfg);
    const effectiveWs = cfg.eating_window_flexible && isToday ? eatingWindowOpens?.[dk] || null : null;
    const ifTimes = computeIFSlotTimes(cfg, effectiveWs);
    const t = ifTimes[sid];
    return t ? parseHHMM(t) : null;
  }

  // Anchor modes (medication / wakeup). Evening bucket is absolute when configured.
  if (sid === 'after_dinner' && (scheduleMode === 'medication' || scheduleMode === 'wakeup') && cfg.evening_mode !== undefined) {
    return eveningTime(cfg);
  }
  if (!effectivePillTime) return null;
  if (sid === 'rx') return parseHHMM(effectivePillTime);
  const offset = slotOffsets?.[sid];
  if (offset === null || offset === undefined) return null;
  const base = parseHHMM(effectivePillTime);
  // Adaptive timing: re-flow downstream slots off the user's actual log times.
  if (adaptiveInfo) {
    const [ah, am] = effectivePillTime.split(':').map(Number);
    const anchorMin = ah * 60 + am;
    if (adaptiveInfo.actuals[sid] != null) return addMins(base, adaptiveInfo.actuals[sid] - anchorMin); // logged slot → its actual time
    const shifted = adaptiveInfo.sStarOffset != null && offset > adaptiveInfo.sStarOffset; // downstream of the latest log
    const eff = shifted ? offset + adaptiveInfo.delta : offset;
    if (anchorMin + eff < 0 || anchorMin + eff >= 1440) return addMins(base, offset); // midnight fallback
    return addMins(base, eff);
  }
  return addMins(base, offset);
}

export function slotStatus(sid, ctx, slotSupps, isChecked) {
  if (ctx.isFuture) return 'future';
  const t = getSlotTime(sid, ctx);
  if (!t) return 'future';
  if (slotSupps.length > 0 && slotSupps.every((s) => isChecked(sid, s.id))) return 'done';
  if (!ctx.isToday) return 'missed';
  const diff = (Date.now() - t.getTime()) / 60000;
  if (diff > 15) return 'missed';
  if (diff > -5) return 'now';
  return 'future';
}
