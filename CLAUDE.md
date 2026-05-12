# CLAUDE.md

Instructions for Claude Code (in Cursor) working on the Origin codebase.

---

## Required reading at start of every session

Before writing any code, reading any other file, or responding to any prompt, read these two documents in this order:

1. **`/ORIGIN-HANDOFF.md`** — current state of the project. Features shipped, bug history, codebase architecture, Supabase schema, pending queue, working notes. This is the source of truth for what exists and what doesn't.

2. **`/ORIGIN-DESIGN-RULES.md`** — HIG-informed design system reference. 15 categories covering touch targets, state systems, modals, navigation, accessibility, typography, spacing, color, animation, forms, feedback, buttons, lists, empty states, onboarding. Follow these rules for all new work.

If either file is missing, stop and tell Sofia. Don't proceed without them.

---

## Working rules

**Design rules are not optional.**
Every new component or fix follows the patterns in `ORIGIN-DESIGN-RULES.md`. If a rule conflicts with what's being asked, surface the conflict before proceeding — don't silently override the rules.

Real examples:
- New interactive element → 44pt minimum hit area on mobile, 32pt on desktop (Category 1)
- New component → implements full state coverage matrix (Category 2)
- New modal on mobile → bottom sheet unless confirmation/alert (Category 3)
- New form → real `<form>` element + proper autoComplete attributes (Category 10)

**When the rules don't cover a pattern**, flag it. Don't invent. Sofia will decide whether to add it to the rules or handle case-by-case.

**Items marked `[REVISIT ON RENDER]`** in the design rules are locked as v1 but expected to be evaluated when implemented. Flag them as you implement so visual judgment can happen with eyes on the actual output.

---

## Handoff document maintenance

`/ORIGIN-HANDOFF.md` is the source of truth. Keep it accurate.

**At the end of every working session, before signing off:**

1. Update the "Last updated" line at the top with today's date and a one-line session summary
2. Add new shipped features to "Features Shipped" section
3. Add new bug fixes to "Bug History"
4. Add new passes to "Today's Major Work"
5. Update "Pending Queue" — remove items completed in this session, add items surfaced during the session
6. Update "Known Stale / Legacy Items" if new debt was created or cleared
7. Update Supabase schema reference if columns/tables changed
8. Update component inventory if new components shipped, or any renamed/removed
9. Update API helper inventory in Codebase Health if `src/lib/api.js` changed

**Update format:** keep the document's existing structure. Match the existing voice (concise, accurate, real). Don't rewrite sections that didn't change.

**When in doubt about whether something should be in the handoff:** add it. Future sessions depend on this document.

---

## Voice and working style

Sofia is a designer using Claude Code as the build mechanism. She's not a developer.

- **Push back honestly** when a request would create a real bug, conflict with the design rules, or duplicate existing work
- **No flattery** — skip "great question" preambles
- **Bias toward action**, but verify before stacking changes
- **Diagnostic-first** when something's broken — surface current state before fixing
- **Real-use feedback beats inspection** — when in doubt, recommend "use the app, come back with friction signals"
- **Stop when tired** — long sessions end with stacked errors. Flag fatigue signals (repetitive agreement, decision drift) honestly.

---

## Hard rules

- Never reference Tether. The project is Origin.
- Never use Light or Dark themes as production. Achromatic is the only production theme.
- Never create files in `/mnt/skills/`, `/mnt/transcripts/`, `/mnt/user-data/uploads/` — these are read-only.
- Never commit without running the work locally first.
- Never assume what's in the database — query and verify.
- Never ship a destructive migration (DROP, DELETE, ALTER without backup path) without explicit confirmation from Sofia.

---

## Project quick reference

**Live:** https://origin-protocol.vercel.app
**Stack:** React + Vite, Supabase, Vercel
**Identity:** Terminal Achromatic (near-black surfaces, pure white accent, JetBrains Mono body, Space Grotesk headings, zero radius for UI shapes)
**Breakpoint:** 1024px hard switch between mobile and desktop layouts
**Test users:** Sofia (active), OVH (display name "Tulum"), Bego (IF mode), dra.orozcobp (abandoned onboarding)

For everything else, read the handoff.

---

## Design system page — public

`/design-system` is publicly accessible at `origin-protocol.vercel.app/design-system`. It is portfolio-linked. `/design` (old URL) redirects to `/design-system`.

**This page is public. Quality bar is portfolio-quality.**

Real implications:
- Stub data in registry.js examples must be generic (no personal medical info, no personal references, no real user data)
- Token or component changes that break the page visually must be caught before shipping — open `/design-system` in dev after any design-system.js change
- Page is `noindex` (not search-indexed) but portfolio-visible
- No admin/debug features, no real user data, no internal state on this page

**When adding a new component or variant:**
1. Build the component.
2. Add it to `src/components/design-system-page/registry.js` under `primitives` or `composed` with realistic, generic example props.
3. Open `/design-system` in dev to verify it renders across themes.
4. Commit both files together.

**When adding a playground** (primitives only): add a playground component to `DesignSystemPage.jsx` and register it in the `PLAYGROUNDS` map.

**When shipping a primitive inside another file** (like DayCell inside WeekStrip): add a named export so registry.js can import it directly.

Foundation sections auto-render from `design-system.js` — no registry update needed for token changes.

---

## prefers-reduced-motion exceptions

Origin preserves four animations under `prefers-reduced-motion: reduce` as HIG-compliant exceptions:
**Loader**, **Checkbox check (SupplementRow)**, **Toast appearance**, **Row hover (desktop)**.

These provide essential functional feedback. Default behavior for new animations is to honor reduced-motion (the global CSS rule in `index.html` handles it automatically — no extra code needed).

Only add to the exception list for new functional feedback animations that are small, contained, and non-repetitive. When adding an exception:
1. Add a CSS class to the animated element
2. Add the override rule inside the `@media (prefers-reduced-motion: reduce)` block in `index.html` (or the component's own `<style>` block for Loader-style inline keyframes)
3. Add a rationale comment at the override site
4. Add it to `ORIGIN-DESIGN-RULES.md` Category 9

---

*End of CLAUDE.md. Last updated: May 12, 2026.*
