import { dateKey, startOfDay, TODAY, isActiveSupp, isSupplementActiveOn } from './time';

const CORE_SLOTS = ["rx", "pre_breakfast", "breakfast", "pre_lunch", "lunch", "pre_dinner", "dinner", "after_dinner"];

export function calculateAdherenceForDate(date, supplements, log) {
  if (!log) return 0;
  const dk = dateKey(date);
  const dayOfWeek = date.getDay();
  const checked = log.checked || {};

  const activeSupps = supplements.filter(s => isActiveSupp(s) && isSupplementActiveOn(s, date));

  let total = 0;
  let done = 0;

  // Anytime supplements (no slots assigned)
  activeSupps
    .filter(s => s.slots.length === 0 && s.days.includes(dayOfWeek))
    .forEach(s => {
      total++;
      if (checked[`${dk}_anytime_${s.id}`]) done++;
    });

  // Slotted supplements
  CORE_SLOTS.forEach(sid => {
    activeSupps
      .filter(s => s.slots.includes(sid) && s.days.includes(dayOfWeek))
      .forEach(s => {
        total++;
        if (checked[`${dk}_${sid}_${s.id}`]) done++;
      });
  });

  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function calculateCurrentStreak(supplements, checked, scheduleMode, anchorBehavior, pillTimes) {
  function isDayComplete(d, ddk) {
    const pt = pillTimes[ddk];
    if (!pt && scheduleMode !== 'fixed' && scheduleMode !== 'none' && anchorBehavior !== 'consistent') return false;
    const day = d.getDay();
    const daySupps = supplements.filter(s =>
      isActiveSupp(s) && isSupplementActiveOn(s, d) && s.days.includes(day)
    );
    if (daySupps.length === 0) return false;
    const slottedDone = CORE_SLOTS.every(sid =>
      daySupps.filter(x => x.slots.includes(sid)).every(x => !!checked[`${ddk}_${sid}_${x.id}`])
    );
    const anytimeDone = daySupps
      .filter(x => x.slots.length === 0)
      .every(x => !!checked[`${ddk}_anytime_${x.id}`]);
    return slottedDone && anytimeDone;
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
