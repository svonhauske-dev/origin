# Origin — Apple-Bar Screen Audit

**Verdict: 6.5/10** — Strong design system foundations, but screens feel flat and information-dense rather than confidently composed. The gap to Apple is restraint in hierarchy and spatial rhythm.

---

## Executive Summary

Origin's design system is real and enforced — contrast passes, tokens are consistent, primitives exist, accessibility is mechanical. The gap to Apple isn't in the *system* but in the *application*. The single biggest pattern holding the product back: **screens lack a clear focal point because the typography scale is used too narrowly.** Nearly every screen renders content between `typography.caption` (14px) and `typography.body` (16px), a 2px range that makes everything read at the same visual weight. Apple uses dramatic jumps between hierarchy levels — iOS Reminders puts the list title at ~28pt and items at ~17pt, creating an instant visual anchor.

**Closest to the bar:** Auth (clear focal point via display title, restrained form, good vertical rhythm), Hero card (defined zones — eyebrow/status/submeta — that read in a clear 1-2-3 order).

**Furthest from the bar:** App Home top-bar (flat, no focal point, many equally-weighted elements), Onboarding Step 2 (dense form with no spatial breathing, every section reads at the same weight), Settings main view (list of rows with no visual differentiation between sections).

---

## Per-Screen Audits

### 1. App Home (highest traffic)

**Apple analogue:** iOS Health app daily summary, Reminders app grouped lists.

#### Focal point and scan order
The greeting "Hello, Sofia" (`typography.heading` = 22px) is the largest text on screen, but it's not the thing the user needs. The *actionable information* is the slot cards below, which render at `typography.body` (16px) — the same size as everything else. The eye lands on the greeting, then has to scan past the WeekStrip to find today's tasks. Apple's Health app solves this by making the summary card (today's data) visually dominant and pushing the greeting into an eyebrow.

**Scan order today:** Greeting (22px) → WeekStrip (competes for attention with 7 cells) → Hero card → Slot cards. Three elements fight before the user reaches their task list.

#### Typography hierarchy
- `App.jsx:2073`: Greeting at `typography.heading` (22px) — correct for h1, but it's not the most important information.
- `Hero.jsx:299`: Eyebrow at `typography.label` (12px), status at `typography.title` (18px) or `typography.display` (32px for time mode). Good internal hierarchy.
- `SlotCard.jsx:100` (now fixed): Slot labels at `typography.title` (18px). Items at `typography.body` (16px). The recent fix closes this gap.
- `WeekStrip.jsx:89`: Day abbreviations at `typography.caption2` (10px) in compact mode — appropriate metadata sizing.

**Issue:** The 22px greeting and the 18px slot headings are only 4px apart, making the greeting feel like another section heading rather than a page-level anchor. If the greeting were smaller (eyebrow treatment) or the slot labels were smaller, the hierarchy would have more dynamic range.

#### Spacing and rhythm
- `App.jsx:2133`: WeekStrip wrapper has `marginBottom: spacing.md` (16px) before the Hero.
- `App.jsx:2207`: Slot content card has `padding: spacing.md` (16px) and `marginBottom: spacing.md` (16px).
- `SlotCard.jsx:113`: Expanded content has `padding: spacing.sm (12px) / spacing.md (16px)`, gap `spacing.sm` (12px) between items.

**Issue:** The gap between WeekStrip and Hero (16px) is the same as the gap between Hero and slot-card container (16px), which is the same as padding *inside* cards. Everything is 16px. Apple uses 24–32px between major sections and 8–12px within them — the *difference* between inner and outer gaps tells you what's grouped and what's separate.

#### Icons and visual elements
- `SlotCard.jsx:74`: Slot icons (emoji) at 20px width, adequate for their role.
- `SlotCard.jsx:128`: Checkbox at 24px — good touch target.
- `SupplementRow.jsx:85`: Edit pencil at 14px — appropriately recessive.
- `AdherenceRing`: 72px in Hero, 28px in compact WeekStrip cells — good contextual scaling.

#### Color usage
Color is doing structural work well. `theme.status.success` (#5FE090) marks completion, `theme.status.warning` marks missed slots. The muted/secondary/primary hierarchy is correctly applied in most places.

**One issue:** `SlotCard.jsx:107` — the time label uses `theme.slot.default` (#FFFFFF) at `typography.semibold` when the slot has an offset. This makes a metadata element (the time) fight the slot label for attention. Time should be secondary.

#### The Apple test
Would not ship at Apple. The home screen reads as a dense information dashboard rather than a focused task surface. Apple's Reminders presents one obvious action ("what do I need to do next?") with everything else receding. Origin presents greeting + calendar + stats ring + multiple expandable cards simultaneously.

**One change:** Demote the greeting to an eyebrow (`typography.label`, uppercase, secondary color) and let the Hero card's status line be the visual focal point of the screen.

---

### 2. Hero Card

**Apple analogue:** iOS Health daily summary card, Activity rings.

#### Focal point and scan order
The Hero has the best internal hierarchy in the app. Eyebrow (12px, uppercase, secondary) → Status (18px bold, primary) → Submeta (14px, secondary). This is a clean 1-2-3 scan. The AdherenceRing on the right provides a glanceable data point without competing for reading order.

#### Typography hierarchy
Well-structured:
- `Hero.jsx:299`: Eyebrow at `typography.label` with `labelSpacingWide` + uppercase — clear metadata treatment.
- `Hero.jsx:332`: Status at `typography.title` or `typography.display` depending on `statusKind` — appropriate escalation.
- `Hero.jsx:376`: Submeta at `typography.caption` (14px) — correctly subordinate.

**Minor issue:** `Hero.jsx:256–258` — the "edit" affordance for anchor time uses `typography.label` (12px) at `text.muted`. This is very small and very faint. It's borderline discoverable — Apple would either make the edit affordance more visible (underlined time text) or hide it behind a tap on the time value itself.

#### Spacing and rhythm
Card padding is `spacing.sm (12px) × spacing.md (16px)` — tight but proportional for a glanceable card. The `minHeight: 132` constraint creates consistent vertical rhythm across all Hero states. Good.

#### The Apple test
Closest to shipping at Apple. The eyebrow/status/submeta pattern is structurally sound. The one gap is the "Start my day" CTA in the no-anchor state — it's styled as a bare `<button>` with accent background and no border-radius (Origin's zero-radius design). Apple would give this CTA more visual presence (likely larger padding, or make the entire Hero card tappable with the CTA text as a label).

---

### 3. SlotCard (task cards on home screen)

**Apple analogue:** Reminders grouped list.

#### Focal point and scan order
Post-fix, the slot label (18px, Space Grotesk, muted) now reads before the items (16px, JetBrains Mono, primary). The header row has a clear left-to-right scan: icon → label → badge → time → chevron.

#### Typography hierarchy
- Slot label: `typography.title` (18px), `weight.medium`, `text.muted` via `<Heading level={2}>`.
- Sublabel: `typography.label` (12px), `text.secondary`.
- Item names: `typography.body` (16px), `weight.medium`.
- Item doses: `typography.label` (12px), `text.secondary`.

This is well-structured. Four distinct levels with appropriate differentiation.

#### Spacing
- Header padding: `spacing.md` (16px) horizontal, `spacing.md` vertical.
- Expanded items area: `spacing.sm (12px) / spacing.md (16px)` padding, `spacing.sm` (12px) gap between items.

**Issue:** The gap between slot cards is `spacing.xs2` (6px) — set in `App.jsx:1639` via the `slotCardsContent` wrapper. This is very tight for the visual weight of each card (bordered, padded). Apple uses ~12–16px between grouped list sections. 6px makes adjacent cards feel like one undifferentiated block.

#### The Apple test
Close but not there. The hierarchy is correct post-fix. The density between cards is the main issue — Apple would give each slot group more air.

---

### 4. WeekStrip

**Apple analogue:** Calendar app's week view header, Activity app's weekly rings.

#### Focal point and scan order
The selected day cell has visual lift (scale 1.02, `shadows.elevated`, accent border). This correctly pulls focus. The "TODAY" badge in the selected cell provides additional anchoring.

#### Typography hierarchy
- Nav header: `typography.label` (12px), uppercase, `labelSpacingWide` — appropriate metadata.
- Day abbreviation: `typography.caption2` (10px) in compact — very small, reads as decoration.
- Date number: `typography.caption` (14px) in compact.
- TODAY badge: 8px in compact — extremely small (barely readable on retina).

**Issue:** `WeekStrip.jsx:73` — the TODAY badge at fontSize `8` in compact mode is below readable threshold. Apple's Calendar week view uses 11pt minimum for labels. Even at 10px (`caption2`) this would be more legible.

#### The Apple test
Functional but not at the bar. The compact mode makes good use of limited space, but the 8px TODAY badge and 10px day names approach illegibility. Apple's equivalent (Calendar week strip) uses consistent 11–13pt sizing with weight/color differentiation instead of shrinking below readable thresholds.

---

### 5. Auth

**Apple analogue:** iOS sign-in sheet, Apple ID login.

#### Focal point and scan order
Clear vertical composition: Glyph → Wordmark → Title (display 32px) → Subtitle → Form → CTA. The display title is the obvious focal point. The eye travels straight down. Good.

#### Typography hierarchy
- `Auth.jsx:136–143`: Wordmark at `typography.heading` (22px), uppercase, letter-spaced — brand accent.
- `Auth.jsx:144`: Title at `typography.display` (32px) — correct hero treatment.
- `Auth.jsx:147`: Subtitle at `typography.caption` (14px), `text.secondary` — correctly subordinate.
- Form labels via `<Label>` component — standard.

**Issue:** `Auth.jsx:260` — "Forgot password?" at `typography.label` (12px) with text-decoration underline. This is functional but very small. Apple typically renders tertiary actions at 13–15pt. Similarly, the mode-switch link at `typography.caption` (14px) at line 292 is more appropriate.

#### Spacing and rhythm
- Glyph → wordmark: `spacing.md` (16px).
- Wordmark → title: `spacing.lg` (24px).
- Title → subtitle: `spacing.xs` (8px).
- Subtitle → form: `spacing.xl` (32px).
- Form fields: `spacing.md` (16px) between groups.

This is well-tuned. The largest gaps separate major zones (brand → form), and within the form fields are tightly grouped. Good rhythm.

#### The Apple test
Close to the bar. The vertical composition, focal hierarchy, and spacing are all solid. Would ship with minor polish: bump the "Forgot password?" to 14px, and add slightly more air above the mode-switch link.

---

### 6. Onboarding Step 1

**Apple analogue:** iOS Setup Assistant, Health app "Set Up" flow.

#### Focal point and scan order
Title (22px) → 2×2 card grid → Continue button. Clear.

#### Typography hierarchy
- `Onboarding.jsx:194`: h1 at `typography.heading` (22px), `fontHeading`.
- `Onboarding.jsx:197–198`: Subtitle at `typography.caption` (14px), `text.secondary`.
- Card titles: `typography.body` (16px), `semibold`.
- Card descriptions: `typography.caption` (14px), `text.secondary`.

Good. The heading-to-body jump is 22→16, a clear step.

#### Spacing
- `ProgressDots` → heading: `spacing.lg` (24px — via dots' `marginBottom: spacing.lg`).
- Heading section → cards: `spacing.xl` (32px, via `marginBottom: spacing.xl`).
- Cards gap: `spacing.md` (16px) — appropriate for a selection grid.

Well-structured. Major sections get `xl` gaps; related elements get `md`.

#### The Apple test
Would pass with minor notes. The 2×2 card grid is a clear selection pattern. Apple's equivalents (choose a watch face, pick a focus mode) use larger cards with more padding, but Origin's density is appropriate for 4 choices on a phone screen.

---

### 7. Onboarding Step 2

**Apple analogue:** iOS Settings detail screens, Health app measurement configuration.

#### Focal point and scan order
Title → Dense form → Live preview → Footer buttons. The form is long and sections blur together.

#### Typography hierarchy
All section headings use `<Heading level={2} visual="label">` — 12px, uppercase, letter-spaced. Content within sections is `typography.caption` (14px). The gap between section heading (12px) and section content (14px) is inverted — content is larger than its label.

**Issue:** This is the same pattern that caused the slot-label problem. Section headings at 12px label are *smaller* than their content at 14px caption. The `visual="label"` treatment relies on uppercase + letter-spacing to differentiate, but the actual size hierarchy is flipped. Apple's Settings uses 13pt secondary-colored headings above 17pt content — the heading is larger or equal, never smaller.

#### Spacing
- Section gaps: `spacing.md` (16px) between fields and `spacing.lg` (24px) before major sections.
- Segment button groups: `spacing.xs` (8px) gap between buttons.
- Preview card internal padding: `spacing.sm (12px) × spacing.md (16px)`.

**Issue:** Nearly every section uses `marginBottom: spacing.md` (16px). The "Meal schedule" section, "Pre-meal window" section, and "Evening" section all start with the same 12px heading + 16px gap pattern. Without variance in spacing between them, the eye can't distinguish section boundaries from field boundaries.

#### The Apple test
Would not ship. Too information-dense with no visual breathing between configuration groups. Apple's approach: fewer options visible at once (progressive disclosure), or larger gaps between groups with subtle dividers. The live "Your day will look like" preview card at the bottom is strong — it provides the "show, don't tell" feedback that Apple favors.

---

### 8. NotificationPrompt

**Apple analogue:** iOS notification permission prompt.

#### Focal point and scan order
Glyph → Heading → Body → CTA(s). Clear vertical composition, identical structure to Auth.

#### Typography hierarchy
- Heading: `typography.heading` (22px), `semibold` — good.
- Body: `typography.caption` (14px), `text.secondary`, `lineHeight: 1.5` — good.
- Install instructions list: `typography.body` (16px) — appropriate for readable steps.

Well-structured. No issues.

#### The Apple test
Clean and restrained. Would ship. The two-CTA variant (Enable / Maybe later) follows Apple's pattern exactly. The iOS-install-instructions variant is necessarily more complex but handles it with a clear ordered list.

---

### 9. PromptName

**Apple analogue:** iOS "What's your name?" onboarding sheet.

#### Focal point and scan order
Emoji (40px) → Title (32px) → Subtitle → Input → CTA. Clear.

**Issue:** `PromptName.jsx:22` — The 👋 emoji at `fontSize: 40` is the only emoji in the production app and breaks the achromatic terminal aesthetic. It's also an off-scale fontSize (flagged by check-tokens). The OriginGlyph would be more appropriate here (it's already used on Auth and NotificationPrompt).

#### The Apple test
Would ship with one change: replace the 👋 emoji with the OriginGlyph (consistent with other pre-auth screens) or remove it entirely.

---

### 10. Settings (main view)

**Apple analogue:** iOS Settings app.

#### Focal point and scan order
Header (centered "Settings") → Section list. The eye hits the header then scans identical-looking rows.

#### Typography hierarchy
- Header title: `typography.body` (16px) — correct for iOS-style centered nav title.
- Section headings: `<Heading level={2} visual="label">` (12px uppercase).
- Row text: `typography.body` (16px), `text.secondary`.

**Issue:** Section heading (12px) is smaller than row text (16px). Same inversion as Onboarding Step 2. But here it's more defensible — iOS Settings uses the same pattern (small gray section headers above larger row text). The issue is that there are only 3 nav rows visible (Schedule, Account, Notifications) with big dividers between them — the screen is sparse and each section feels like one item rather than a section.

#### Spacing
- Section heading → row: `spacing.xs` (8px).
- Divider margins: `spacing.lg` (24px) top and bottom.

**Issue:** `SettingsScreen.jsx:194` — The divider has `margin: ${spacing.lg}px 0` (24px top + 24px bottom = 48px total between sections). This is too much air for a settings list with only 3–4 sections. The screen feels sparse and scrollable when it shouldn't need to scroll.

#### The Apple test
Would not ship in current form. iOS Settings uses grouped insets (white cards on gray background) that create natural section boundaries without needing 48px dividers. Origin's flat surface + heavy divider approach makes 3 rows feel like they're in an otherwise empty room.

---

### 11. Settings → Account sub-view

**Apple analogue:** iOS Settings → Apple ID account detail.

#### Focal point and scan order
Full name field → Email field (with current shown) → Password fields. Top-to-bottom, clear.

#### Typography hierarchy
- Labels: `typography.caption` (14px), `text.secondary` — applied via `<Label>`.
- Inputs: standard (16px).
- Password rules: `typography.label` (12px) via PasswordRule component.

Good internal hierarchy.

#### Spacing
Fields separated by `spacing.md` (16px). The three form groups (name, email, password) aren't visually distinguished from each other beyond sequential order.

**Issue:** There's no divider or extra spacing between the "name" field, the "email" section (label + current + new input + button), and the "password" section. They all run together as one continuous form. Apple separates these into distinct grouped cards.

---

### 12. ProtocolLibrary

**Apple analogue:** iOS Reminders lists view, Files app.

#### Focal point and scan order
Header → TabBar (Active/Saved) → Protocol rows. Clear.

#### Typography hierarchy
- `ProtocolLibrary.jsx:291`: Header title at `typography.body` (16px), `semibold` — correct nav title.
- `ProtocolLibrary.jsx:68–69`: Protocol name at `typography.body` (16px), `weight.medium`. Metadata at `typography.caption` (14px), `text.secondary`.
- TabBar: `typography.body` (16px), active = `semibold`, inactive = `regular`.

Solid. Protocol rows have a clear name → metadata hierarchy.

#### Spacing
Protocol rows: `padding: spacing.sm (12px) 0` with bottom borders.

**Issue:** `ProtocolLibrary.jsx:81` — rows have top/bottom padding of 12px (spacing.sm). At `touch.min` (44px) minimum height, the visual rhythm is correct but the rows are tight. Apple's equivalent list rows use ~50–56pt height for two-line cells. This is close but slightly compressed.

#### Empty states
Well-handled. `ProtocolLibrary.jsx:375–388` (Active empty) and `406–415` (Archived empty) both use the ◯ glyph + title + subtitle + CTA pattern. Consistent with the rest of the app.

#### The Apple test
Close to the bar. The list structure, empty states, and tab interaction are all well-considered. The row density is slightly tighter than Apple's equivalents. Would pass with slightly more vertical padding in rows.

---

### 13. ProtocolDetailScreen

**Apple analogue:** Reminders list detail, Notes app document.

#### Focal point and scan order
Header with editable protocol name → TabBar → Supplement list. The tap-to-edit name is a nice interaction pattern.

#### Typography hierarchy
- Protocol name: `<Heading level={1} visual="body">` (16px) — correct for a nav title.
- Tab labels: `typography.body` (16px).
- Supplement names: `typography.body` (16px), `weight.medium`.
- Supplement metadata (dose + notes): `typography.label` (12px), `text.secondary`.

**Issue:** The supplement name (16px) and tab labels (16px) and protocol name (16px) are all the same size. Three different hierarchy levels rendered identically. Apple's Notes app differentiates the document title (bold, larger) from content headers (medium) from body text (regular).

#### The Apple test
Functional but flat. The header grid layout is well-engineered (auto-centering title). The overflow menu via Popover is correctly implemented. Would need the supplement list to have more visual differentiation from the header/tab area — currently reads as one continuous block.

---

### 14. IFMigrationScreen

**Apple analogue:** iOS "What's New" / feature migration sheet.

#### Focal point and scan order
Title ("Intermittent fasting updated") → Explanation → Form fields → Confirm CTA. Clear vertical flow.

#### Typography hierarchy
- `IFMigrationScreen.jsx:66`: Title at `<Heading level={1} visual="title">` (18px, bold). This is smaller than Auth/Onboarding h1s (22px / 32px).
- Body explanation: `typography.body` (16px).
- Form labels via `<Label>`.

**Issue:** The h1 title is only 18px (`visual="title"`). This screen uses a different heading size than every other full-screen flow (Auth = 32px, Onboarding = 22px, NotificationPrompt = 22px). The visual inconsistency makes the migration feel less important than onboarding, when it's actually a critical one-time configuration step.

#### The Apple test
Functional. Would pass if the title matched the weight of other full-screen flows (use `visual="heading"` at 22px to match Onboarding, since this IS onboarding — for a schedule change).

---

### 15. EditForm (SidePanel content)

**Apple analogue:** iOS Reminders "Add New" sheet.

#### Focal point and scan order
Form flows top-to-bottom: Name → Dose → Notes → Category → Treatment → Slots → Days. Dense but each section starts with a `<Label>`.

#### Typography hierarchy
- Labels via `<Label>` component (likely 12px uppercase).
- Inputs at `typography.body` (16px).
- Category/Slot/Day selectors at `typography.caption` (14px) inside selector buttons.

Appropriate for a dense form. Labels small, content larger.

#### The Apple test
Dense but organized. Apple's Reminders edit sheet is similarly dense. The selector buttons for Category/Treatment modes are well-implemented. Would pass with current structure.

---

### 16. LogAtSheet

**Apple analogue:** iOS Date picker in a modal sheet.

Minimal, focused. One heading, one time input, one explainer line, two buttons. Perfect restraint. Would ship.

---

## Cross-Cutting Patterns

### 1. The "16px everything" problem
`typography.body` (16px) is used for: slot labels (now fixed), supplement names, protocol names, nav header titles, row text, form inputs, modal body copy, settings rows, tab labels, empty-state titles. When 75% of readable text on any screen is the same size, there's no scan hierarchy — the user has to read everything to find what matters.

**Where it matters most:** ProtocolDetailScreen (title = tabs = items = 16px), Settings rows (heading text = row text), App home greeting vs slot cards (greeting 22px is only 6px larger than items).

### 2. Section heading inversion (the Label pattern)
`<Heading level={2} visual="label">` renders at 12px uppercase. Content below it renders at 14–16px. The heading is *smaller* than what it labels. This works in iOS Settings (convention is established by Apple) but feels off in Origin because Origin uses it inconsistently — some screens have 18px headings (slot labels post-fix), others have 12px headings (Settings sections, Onboarding fields). The user encounters both patterns and neither feels definitive.

### 3. Uniform spacing between sections
The gap between "Meal schedule" and "Pre-meal window" in Onboarding Step 2 is the same 16px as the gap between a label and its input within a section. Section boundaries and field boundaries are visually identical. Apple solves this with either grouped cards (distinct containers) or 2× larger gaps between sections than within them.

### 4. Slide-in screens share identical timing but different origins
SettingsScreen, ProtocolLibrary, and ProtocolDetailScreen all use `transform: translateX(100vw)` → `translateX(-50%)` at `motion.screenSlide` (300ms). This is consistent. The stacking z-index order (100 → 101 → 102) creates proper layering. This is well-done — no issues.

### 5. Header pattern consistency
All slide-in screens share: centered title (16px semibold), left chevron, optional right action button, sticky top + border-bottom. This is iOS-standard navigation bar pattern. Correct and consistent.

### 6. Empty states are consistent
Every list surface (ProtocolLibrary Active, Archived, ProtocolDetailScreen Active, Paused, App home) uses the same ◯ glyph + title + subtitle + optional CTA pattern. Font choices are identical across all empty states. This is strong — Apple-level consistency in an often-neglected pattern.

---

## The Apple Gap

### What separates Origin from Apple today:

1. **Dynamic range in typography.** Apple's Reminders uses 28pt for list titles, 17pt for items, 13pt for metadata — a 15pt range across three levels. Origin uses 22pt for h1, 16pt for most content, 12pt for metadata — a 10pt range but most content clusters at 16pt. The midrange is undifferentiated.

2. **Section grouping via containers, not dividers.** Apple uses inset grouped cards (slightly elevated surfaces) to create visual sections. Each settings group is its own card. Origin uses full-width divider lines with large margins — this creates dead space rather than visual structure.

3. **Predictable heading treatment.** Apple's Settings uses one heading style throughout (13pt gray uppercase). Origin switches between 12px uppercase label headings (Settings, Onboarding) and 18px title headings (slot cards). The inconsistency means neither pattern becomes automatic for the user's eye.

4. **Information density on the home screen.** Apple's Health app shows one hero summary + one scrollable list of metrics. Each metric gets a card. The user processes one card at a time. Origin shows greeting + 7-day calendar + hero stats + N expandable slot cards + anytime section simultaneously. The cognitive load is higher because nothing is hidden.

5. **Progressive disclosure.** Apple aggressively hides secondary information behind taps. Origin shows everything upfront (Onboarding Step 2 exposes all config fields at once, Settings shows all sections, slot cards show sublabels + times + badges all in the header row).

---

## Roadmap

### Quick wins (under 30 min each)

| Fix | File:Line | Impact | Est. |
|-----|-----------|--------|------|
| Demote home greeting to eyebrow treatment (12px uppercase, text.secondary) | `App.jsx:2073` | Focal point shifts to Hero | 10 min |
| Increase slot card gap from `spacing.xs2` (6px) to `spacing.sm` (12px) | `App.jsx:1639` | Cards breathe as distinct groups | 5 min |
| Replace PromptName 👋 emoji with `<OriginGlyph size={56}>` | `PromptName.jsx:22` | Visual consistency with Auth/NotificationPrompt | 5 min |
| Bump WeekStrip compact TODAY badge from 8px to `typography.caption2` (10px) | `WeekStrip.jsx:73` | Readable on all devices | 5 min |
| Fix IFMigrationScreen title from `visual="title"` to `visual="heading"` | `IFMigrationScreen.jsx:66` | Consistent with other full-screen flows | 5 min |
| Bump "Forgot password?" link from `typography.label` (12px) to `typography.caption` (14px) | `Auth.jsx:260` | Discoverable without dominating | 5 min |
| Reduce Settings divider margin from `spacing.lg` (24px) to `spacing.md` (16px) | `SettingsScreen.jsx:194` | Less dead space, tighter grouped feel | 5 min |

### Per-screen refinements (1–3 hours each)

| Screen | Change | Est. |
|--------|--------|------|
| **Settings main** | Replace flat dividers with grouped card sections (each section in its own bordered card). Nav rows become cells within section cards. | 2h |
| **Onboarding Step 2** | Add `spacing.xl` (32px) between top-level config groups (timing, meal schedule, pre-meal, evening). Keep `spacing.md` within groups. This alone creates section boundaries. | 1h |
| **App Home** | Restructure header: avatar left + eyebrow greeting → right-aligned icon buttons. Let Hero card be the visual anchor. Consider collapsing WeekStrip behind a "Week" tap target to reduce competing information. | 2h |
| **ProtocolDetailScreen** | Bump supplement list internal row height, add subtle section breaks between active items. Consider showing item count badge in tab labels. | 1.5h |
| **Settings → Account** | Add dividers or grouped cards between the three form sections (name, email, password). | 1h |

### Cross-cutting work (variable)

| Pattern | Change | Impact | Est. |
|---------|--------|--------|------|
| **Establish a "section heading" treatment that sits above body** | Create `<Heading visual="section">` at 14px medium, text.secondary (sits between label at 12px and body at 16px). Use it for Settings sections, Onboarding groups — anywhere a heading needs to be *above* body content but not dominant. | Fixes the size-inversion pattern across 4+ screens | 2h |
| **Section grouping primitive** | A `<SectionGroup>` component that wraps related rows in a bordered card (like iOS grouped inset style). Apply to Settings and Onboarding. | Eliminates need for divider-based section separation | 3h |
| **Home screen information hierarchy** | Design-level decision: should the WeekStrip be visible by default or revealed on tap? Should the greeting be eyebrow or removed? This is a product decision that affects the home screen's focal point. | Largest single impact on perceived polish | Decision + 2h implementation |
| **Spacing audit: section gaps vs field gaps** | Establish a rule: section boundaries get `spacing.xl` (32px), field boundaries get `spacing.md` (16px), tight groups get `spacing.xs` (8px). Sweep all form screens. | Consistent spatial rhythm across all configuration screens | 3h |

---

*Audit completed 2026-05-25. Covers all 16 screen-level components identified in the codebase.*
