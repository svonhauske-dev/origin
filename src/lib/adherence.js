import { dateKey, isActiveSupp, isSupplementActiveOn } from './time';

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
