# WCAG Color Contrast Audit — Achromatic Theme
**Date:** May 12, 2026  
**Scope:** All meaningful foreground/background pairs in the production Achromatic theme  
**Method:** WCAG 2.1 relative luminance formula (L = 0.2126·R_lin + 0.7152·G_lin + 0.0722·B_lin)  
**Mode:** AUDIT ONLY — no color token changes were made

---

## WCAG Thresholds Reference

| Level | Normal text (< 18pt / < 14pt bold) | Large text (≥ 18pt OR ≥ 14pt bold) |
|---|---|---|
| AA | 4.5:1 | 3:1 |
| AAA | 7:1 | 4.5:1 |

**App typography sizes (from design-system.js):**
| Token | px | Qualifies as large text? |
|---|---|---|
| caption2 | 10px | No — needs 4.5:1 |
| label | 12px | No — needs 4.5:1 |
| caption | 14px | No — needs 4.5:1 |
| body | 16px | No — needs 4.5:1 |
| title | 18px | No (18px < 18.67px = 14pt) — needs 4.5:1 |
| heading | 22px semibold | Yes (22px > 18.67px, weight ≥ 600) — needs 3:1 |

---

## Achromatic Color Values

| Token | Hex / Value | Luminance |
|---|---|---|
| surface.canvas | #0D0D0D | 0.0040 |
| surface.cardSubtle | #161616 | 0.0080 |
| surface.card / modal / input | #1A1A1A | 0.0103 |
| surface.cardHover / hover | #222222 | 0.0160 |
| border.subtle | #2A2A2A | 0.0263 |
| border.strong | #404040 | 0.0513 |
| text.disabled | #444444 | 0.0579 |
| text.muted | #666666 | 0.1328 |
| text.secondary | #A0A0A0 | 0.3515 |
| text.primary | #FFFFFF | 1.0000 |
| accent.default | #FFFFFF | 1.0000 |
| text.onAccent | #0D0D0D | 0.0040 |
| status.success | #5FE090 | 0.5773 |
| status.danger | #FF6060 | 0.3046 |
| status.warning | #FFC040 | 0.5932 |

Alpha-composited surfaces (alpha on canvas #0D0D0D):
| Token | Composed value | Luminance |
|---|---|---|
| nowBadgeBg (rgba(255,255,255,0.15) on canvas) | ~#313131 | 0.0307 |
| missedBadgeBg (rgba(255,255,255,0.10) on card) | ~#313131 | 0.0307 |
| accent.subtle (rgba(255,255,255,0.10) on canvas) | ~#252525 | 0.0185 |
| text.faint (rgba(255,255,255,0.3) on canvas) | ~#565656 | 0.0931 |

---

## Full Contrast Table

### Text on Dark Surfaces

| Foreground | Background | Ratio | AA Normal (4.5:1) | AA Large (3:1) | AAA |
|---|---|---|---|---|---|
| text.primary #FFFFFF | canvas #0D0D0D | **19.44:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| text.primary #FFFFFF | card #1A1A1A | **17.50:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| text.primary #FFFFFF | cardSubtle #161616 | **18.10:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| text.primary #FFFFFF | cardHover #222222 | **15.91:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| text.secondary #A0A0A0 | canvas #0D0D0D | **7.43:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| text.secondary #A0A0A0 | card #1A1A1A | **6.69:1** | ✅ PASS | ✅ PASS | ❌ FAIL |
| text.secondary #A0A0A0 | cardSubtle #161616 | **6.92:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| **text.muted #666666** | **canvas #0D0D0D** | **3.39:1** | ❌ FAIL | ✅ PASS | ❌ FAIL |
| **text.muted #666666** | **card #1A1A1A** | **3.05:1** | ❌ FAIL | ✅ PASS | ❌ FAIL |
| **text.muted #666666** | **cardSubtle #161616** | **3.15:1** | ❌ FAIL | ✅ PASS | ❌ FAIL |
| **text.muted #666666** | **input #1A1A1A** | **3.05:1** | ❌ FAIL | ✅ PASS | ❌ FAIL |
| text.disabled #444444 | canvas #0D0D0D | 2.00:1 | — (disabled) | — | — |
| text.disabled #444444 | card #1A1A1A | 1.80:1 | — (disabled) | — | — |
| text.faint rgba(w,0.3) | canvas #0D0D0D | ~2.65:1 | — (decorative) | — | — |

### Accent and Status Colors

| Foreground | Background | Ratio | AA Normal | AA Large | AAA |
|---|---|---|---|---|---|
| text.onAccent #0D0D0D | accent.default #FFFFFF | **19.44:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| text.primary #FFFFFF | nowBadgeBg (~#313131) | **13.00:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| text.secondary #A0A0A0 | missedBadgeBg (~#313131) | **4.97:1** | ✅ PASS | ✅ PASS | ❌ FAIL |
| text.primary #FFFFFF | accent.subtle (~#252525) | **15.33:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| status.success #5FE090 | canvas #0D0D0D | **11.62:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| status.danger #FF6060 | canvas #0D0D0D | **6.57:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| status.danger #FF6060 | card #1A1A1A | **5.91:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| status.warning #FFC040 | canvas #0D0D0D | **11.91:1** | ✅ PASS | ✅ PASS | ✅ PASS |

---

## Failures Summary

### ACTIONABLE FAILURES

**text.muted (#666666)** fails AA Normal across every surface it appears on. Since every typography size in the app is below the large-text threshold (except `heading` at 22px semibold), any use of `text.muted` for body text, labels, captions, or helper text is a WCAG AA failure.

The heading size (22px semibold) is the only size that qualifies as large text — and `text.muted` at 3.05–3.39:1 barely passes AA Large (3:1) for headings only.

**Failing usage locations (all text.muted, all sizes below 22px semibold):**

| Component | Usage | Size token | Background | Ratio | Level |
|---|---|---|---|---|---|
| SlotCard.jsx | Supplement name when checked (done state, strikethrough) | body (16px) | card #1A1A1A | 3.05:1 | ❌ AA Fail |
| WeekStrip.jsx | Day abbreviation ("Mon", "Tue" etc.) | label (12px) | card #1A1A1A | 3.05:1 | ❌ AA Fail |
| SettingsScreen.jsx | "Full name", "Email", "Password" field sub-labels | caption (14px) | canvas #0D0D0D | 3.39:1 | ❌ AA Fail |
| SettingsScreen.jsx | Section helper text | caption (14px) | canvas #0D0D0D | 3.39:1 | ❌ AA Fail |
| Various (HelperText component) | All helper text under form fields | caption (14px) | card / canvas | 3.05–3.39:1 | ❌ AA Fail |
| Input.jsx | Placeholder text (browser default) | body (16px) | input #1A1A1A | unknown† | TBD |

† Placeholder color is not explicitly set in Input.jsx — browser defaults to a dim version of the input text color. Likely below 3:1 on #1A1A1A. Should be measured and set explicitly.

### INTENTIONAL LOW CONTRAST (WCAG Exception)

| Token | Usage | Ratio | Rationale |
|---|---|---|---|
| text.disabled #444444 | Disabled button labels, unavailable options | ~1.80–2.00:1 | WCAG 1.4.3 exception: disabled controls are exempt |
| text.faint rgba(255,255,255,0.3) | Decorative sublabels (date sublabels, Hero date) | ~2.65:1 | Purely decorative, not required for comprehension |

---

## Fix Guidance (when ready to remediate)

**Do not change color tokens without verifying across all four production themes.**

The minimum fix for text.muted to pass AA Normal on the darkest surface (card #1A1A1A) is a luminance that produces a contrast ≥ 4.5:1:
- Required: (L_fg + 0.05) / (0.0103 + 0.05) ≥ 4.5 → L_fg ≥ 0.2196
- Approximate target hex: **#888888** (L ≈ 0.2159, ratio ≈ 4.22:1 on card) — borderline
- Safer target hex: **#909090** (L ≈ 0.2491, ratio ≈ 4.88:1 on card) — passes AA on all surfaces
- Note: #909090 is close to current text.secondary (#A0A0A0 = 6.69:1). Raising text.muted reduces separation between muted and secondary. Visual hierarchy decision needed before any token change.

**Alternative: eliminate text.muted at small sizes.** Replace `text.muted` with `text.secondary` for any body/label/caption usage where meaning is required. Reserve `text.muted` only for 22px+ semibold contexts (heading) where AA Large (3:1) applies and the current ratio passes.

---

*Audit complete. No token changes were made. All ratios calculated from sRGB hex values using WCAG 2.1 relative luminance.*
