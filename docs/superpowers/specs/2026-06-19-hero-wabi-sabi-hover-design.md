# Hero Wabi-sabi Hover Effect — Design Spec

**Date:** 2026-06-19
**Status:** Approved (brainstorming)
**Type:** Frontend feature — interactive hero enhancement

## Summary

On hover (desktop) or tap (touch), the hero's `侘び寂び。` kanji section transforms into the
English "wabi-sabi." with a per-letter blur+fade reveal, a color depth gradient that follows
the cursor, and "San Francisco." sliding right to accommodate the wider Latin text. On exit,
"wabi-sabi." dissolves letter by letter in reverse, and the kanji fades back in after the
Latin text has fully cleared.

The effect uses the site's established motion vocabulary (blur+fade, `EASE_OUT`, Framer Motion)
and integrates cleanly with the existing splash intro — the `SplashItem` wrapper and `.jp`
class are untouched.

## Goals

- Give the wabi-sabi concept a tactile, interactive moment in the hero without competing with
  the splash intro sequence.
- Follow the site's established motion language (blur+fade, `EASE_OUT`).
- Work on both desktop (hover) and touch (tap toggle).
- Respect `prefers-reduced-motion` as a first-class state.

## Non-Goals

- No change to the splash intro choreography or `SplashItem`.
- No change to the furigana (わ / さ) — they exit with the kanji as a unit.
- No keyboard interaction (the effect is presentational, not functional).

## 1. Component Structure

A new `WabiSabiToggle` client component wraps the kanji JSX tree inside the existing
`SplashItem`. An `inline-grid` container stacks both text layers in the same cell so neither
drives layout independently — the container is always the width of the wider layer.

```
SplashItem[motion.span, className=styles.jp]     ← existing, unchanged
  └── WabiSabiToggle                             ← new "use client" component
        └── span [inline-grid, hover/tap listener]
              ├── span [kanji layer]             ← existing JSX tree, moved in
              │     ├── span.ruby (侘 + rt わ)
              │     ├── び
              │     ├── span.ruby (寂 + rt さ)
              │     ├── び
              │     └── span.maru (。)
              └── span [english layer, aria-hidden]
                    per-letter spans: w a b i - s a b i .
```

The "wabi-sabi." layer is `aria-hidden` — the kanji provides semantic content, matching the
Typewriter pattern.

## 2. Interaction Model

**Desktop (hover-capable pointer):** `onPointerEnter`/`onPointerLeave` filtered by
`e.pointerType === 'mouse'` drives the toggle state. The color gradient additionally tracks
`onMouseMove`.

**Touch:** `onClick` toggles `showEnglish`. `pointerType` distinguishes touch from mouse to
avoid double-firing.

## 3. Animation Choreography

All timings are in seconds. `EASE_OUT = cubic-bezier(0.22, 1, 0.36, 1)` from `timing.ts`.

### 3.1 Hover-in (kanji → wabi-sabi.)

| Element | Animation | Duration | Delay |
|---|---|---|---|
| Kanji layer | `opacity 1→0`, `blur 0→6px` | 0.22s | 0 |
| Letter `i` (index 0–9) | `opacity 0→1`, `blur 10px→0` | 0.28s | `0.04s + i × 38ms` |
| "San Francisco." | `translateX(0 → 0.18em)` | 0.48s | 0.04s |

The last letter (index 9) finishes at `0.04 + 9×0.038 + 0.28 = 0.662s`.

### 3.2 Hover-out (wabi-sabi. → kanji)

| Element | Animation | Duration | Delay |
|---|---|---|---|
| Letter `i` (index 0–9) | `opacity 1→0`, `blur 0→10px` | 0.18s | `(9 - i) × 22ms` |
| "San Francisco." | `translateX(0.18em → 0)` | 0.38s | 0 (synced with exit start) |
| Kanji layer | `opacity 0→1`, `blur 6px→0` | 0.28s | 0.38s (after last letter exits) |

Last letter (index 0) exits at `9×0.022 + 0.18 = 0.378s`, so the kanji delay of `0.38s`
lands cleanly after it.

### 3.3 Color depth gradient (mousemove only — no motion)

Per-letter color interpolation based on cursor X proximity. Applied in both normal and reduced
motion modes (it is purely visual, not motion).

| Mode | Base color | Cursor accent | Effect |
|---|---|---|---|
| Light | `#7c8a6b` (matcha) | `#465236` (deeper) | Ink richness near cursor |
| Dark | `#8c9b7a` (dark matcha) | `#d2e6c0` (pale glow) | Surface highlight near cursor |

Falloff radius: 38% of the element's rendered width. Color is interpolated linearly
(`t = max(0, 1 - dist / radius)`).

On `mouseleave`: letter colors reset to the inherited `--matcha` CSS variable (no inline
style).

### 3.4 Layout — "San Francisco." spacing

"wabi-sabi." is wider than `侘び寂び。` due to the `.maru` (`margin-right: -0.34em`)
correction that tightens the kanji state. On reveal, "San Francisco." gently slides right
`0.18em` to maintain visual balance. This is by design — the English translation takes its
own breathing room. No compensating margin hack is applied.

## 4. Reduced Motion

`useReducedMotion()` is checked once at mount. Under reduced motion:

- **No blur** on any transition.
- **Letters:** all fade in/out as a unit (`opacity 0→1`, `0.15s`), no per-letter stagger.
- **Kanji:** fades out immediately on hover-in, fades back in after letters exit.
- **SF slide:** retained — it is a layout shift, not a motion effect.
- **Color gradient:** retained — purely visual, no animation involved.

## 5. Accessibility

- The "wabi-sabi." layer is `aria-hidden="true"`.
- The kanji layer is the semantic content for screen readers (as today).
- The touch toggle has no `role="button"` — the interaction is a progressive enhancement on
  the existing text. Screen readers are unaffected.

## 6. Files Touched

| File | Change |
|---|---|
| `components/home/WabiSabiToggle.tsx` | New client component |
| `app/page.tsx` | Wrap kanji JSX with `<WabiSabiToggle>` |
| `app/home.module.css` | Add `.wabiToggle` class (`display: inline-grid`) |

`SplashItem`, `variants.ts`, `timing.ts`, and all other motion infrastructure are unchanged.

## 7. Key Constants (tunable)

| Constant | Value | Location |
|---|---|---|
| Letter reveal duration | `0.28s` | `WabiSabiToggle.tsx` |
| Letter stagger | `38ms` | `WabiSabiToggle.tsx` |
| Letter exit duration | `0.18s` | `WabiSabiToggle.tsx` |
| Letter exit stagger | `22ms` | `WabiSabiToggle.tsx` |
| Kanji exit blur | `6px` | `WabiSabiToggle.tsx` |
| SF slide amount | `0.18em` | `home.module.css` / component |
| Gradient radius | `38%` of element width | `WabiSabiToggle.tsx` |
| Light accent color | `#465236` | `WabiSabiToggle.tsx` |
| Dark accent color | `#d2e6c0` | `WabiSabiToggle.tsx` |
| Kanji return delay | `0.38s` | `WabiSabiToggle.tsx` |
