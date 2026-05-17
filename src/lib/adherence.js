import { dateKey, startOfDay, TODAY, isActiveSupp, isSupplementActiveOn } from './time';

// One "expected check" per (slot, supp) pair, plus one for each anytime supp.
// Iterating per supplement (not per fixed slot set) keeps this correct for any
// schedule mode — including IF v2, whose slot IDs are not in the legacy CORE_SLOTS.
function countExpectedChecks(supp, dk, checked) {
  if (!supp.slots || supp.slots.length === 0) {
    return { total: 1, done: checked[`${dk}_anytime_${supp.id}`] ? 1 : 0 };
  }
  let total = 0, done = 0;
  for (const sid of supp.slots) {
    total++;
    if (checked[`${dk}_${sid}_${supp.id}`]) done++;
  }
  return { total, done };
}

export function calculateAdherenceForDate(date, supplements, log) {
  if (!log) return 0;
  const dk = dateKey(date);
  const dayOfWeek = date.getDay();
  const checked = log.checked || {};

  const activeSupps = supplements.filter(s =>
    isActiveSupp(s) && isSupplementActiveOn(s, date) && s.days.includes(dayOfWeek)
  );

  let total = 0, done = 0;
  for (const supp of activeSupps) {
    const r = countExpectedChecks(supp, dk, checked);
    total += r.total;
    done  += r.done;
  }
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function calculateCurrentStreak(supplements, checked, scheduleMode, anchorBehavior, pillTimes) {
  function isDayComplete(d, ddk) {
    const pt = pillTimes[ddk];
    // Modes without a daily user-set anchor don't need pillTime to count the day.
    const needsAnchor = scheduleMode !== 'fixed' && scheduleMode !== 'fasting' && scheduleMode !== 'none' && anchorBehavior !== 'consistent';
    if (!pt && needsAnchor) return false;
    const day = d.getDay();
    const daySupps = supplements.filter(s =>
      isActiveSupp(s) && isSupplementActiveOn(s, d) && s.days.includes(day)
    );
    if (daySupps.length === 0) return false;
    return daySupps.every(supp => {
      const r = countExpectedChecks(supp, ddk, checked);
      return r.total === r.done;
    });
  }

  const d = new Date(TODAY);
  if (!isDayComplete(d, dateKey(d))) d.setDate(d.getDate() - 1);

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const ddk = dateKey(d);
    if (!isDayComplete(d, ddk)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function getUpcomingEndings(supplements, daysAhead = 14) {
  const today = startOfDay(new Date());
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + daysAhead);

  return supplements
    .filter(s => {
      if (!s.ends_at) return false;
      if (s.paused || s.status === 'stopped') return false;
      const [y, m, dd] = s.ends_at.split('-').map(Number);
      const endDate = startOfDay(new Date(y, m - 1, dd));
      return endDate >= today && endDate <= horizon;
    })
    .sort((a, b) => new Date(a.ends_at) - new Date(b.ends_at));
}
