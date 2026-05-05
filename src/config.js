// ── App-level constants shared across components ──────────────────────────────
// Product config (schedule defaults, slot definitions, copy) lives here.
// Design tokens (colors, spacing, etc.) live in design-system.js.

export const DEFAULT_CONFIG = {
  pre_meal_window: 30, breakfast: 60, lunch: 300, dinner: 540, after_dinner: 660,
  window_start: 0, window_length: 480, meals_per_day: 2,
  fixed_times: {
    pre_breakfast: "07:30", breakfast: "08:00", pre_lunch: "11:30", lunch: "12:00",
    pre_dinner: "17:30", dinner: "18:00", after_dinner: "20:00", injectable: null, topical: null,
  },
};

export const FIXED_SLOTS = [
  { key: "pre_breakfast", label: "Before Breakfast" },
  { key: "breakfast",     label: "Breakfast" },
  { key: "pre_lunch",     label: "Before Lunch" },
  { key: "lunch",         label: "Lunch" },
  { key: "pre_dinner",    label: "Before Dinner" },
  { key: "dinner",        label: "Dinner" },
  { key: "after_dinner",  label: "Evening" },
  { key: "injectable",    label: "Injectables" },
  { key: "topical",       label: "Topicals" },
];

export const ANCHOR_NOTES = {
  medication: "Your anchor is when you take your medication each morning.",
  fasting:    "Your anchor is when your eating window opens.",
  wakeup:     "Your anchor is when you wake up each morning.",
};

export const toHrMin = (totalMins) => {
  if (!totalMins && totalMins !== 0) return { h: 0, m: 0 };
  return { h: Math.floor(totalMins / 60), m: totalMins % 60 };
};

export const fromHrMin = (h, m) => (parseInt(h) || 0) * 60 + (parseInt(m) || 0);

export const MODES = [
  { id: "none",       title: "No Schedule",          desc: "Just a checklist — no times, no notifications" },
  { id: "medication", title: "Medication Anchor",    desc: "Your day cascades from when you take your medication" },
  { id: "wakeup",     title: "Wake Up Anchor",       desc: "Your day cascades from when you wake up" },
  { id: "fasting",    title: "Intermittent Fasting", desc: "Built around your eating window" },
  { id: "fixed",      title: "Fixed Times",          desc: "Same schedule every day, no anchor" },
];

export function deriveOffsets(mode, cfg) {
  if (mode === "none" || mode === "fixed") return null;
  if (mode === "fasting") {
    const winStart = cfg.window_start ?? 0;
    const winLen   = cfg.window_length ?? 480;
    const meals    = cfg.meals_per_day ?? 2;
    const interval = Math.floor(winLen / (meals + 1));
    const pmw      = cfg.pre_meal_window ?? 30;
    return {
      pre_breakfast: winStart + interval - pmw,
      breakfast:     winStart + interval,
      pre_lunch:     meals >= 2 ? winStart + (interval * 2) - pmw : null,
      lunch:         meals >= 2 ? winStart + (interval * 2) : null,
      pre_dinner:    meals >= 3 ? winStart + (interval * 3) - pmw : null,
      dinner:        meals >= 3 ? winStart + (interval * 3) : null,
      after_dinner:  winStart + winLen + 30,
      injectable:    null,
      topical:       null,
    };
  }
  const pmw       = cfg.pre_meal_window ?? 30;
  const pre_bfast = (cfg.breakfast ?? 60) - pmw;
  return {
    pre_breakfast: pre_bfast,
    breakfast:     cfg.breakfast ?? 60,
    pre_lunch:     (cfg.lunch ?? 300) - pmw,
    lunch:         cfg.lunch ?? 300,
    pre_dinner:    (cfg.dinner ?? 540) - pmw,
    dinner:        cfg.dinner ?? 540,
    after_dinner:  cfg.after_dinner ?? 660,
    injectable:    null,
    topical:       null,
  };
}
