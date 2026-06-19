# Home "About" section — editorial redesign

**Date:** 2026-06-19
**Status:** Approved (design), pending implementation plan
**Supersedes the layout of:** `2026-06-19-home-about-section-design.md` (that spec's
copy and placement stand; this one replaces the single-column layout and adds animation).

## Goal

Reformat the home `#about` section so it no longer reads as a single 52ch wall of
text. Use the full section width with an editorial **wide-lead + three-column**
layout, and add purposeful animated emphasis (one drawn underline, three
highlight wipes) that rides on the existing staggered rise-in reveal. The
existing splash (rise + deblur + fade) is unchanged — we are layering emphasis on
top of it, not replacing it.

"More details" here means richer **presentation** (layout, layering, emphasis),
not more body copy. The narrative is the same five sentences, lightly re-flowed.

## Layout (replaces the current `.about` single column)

Full-width section. No 52ch measure cap on the block; columns set their own width.

```
About                                   ← small uppercase label (kicker)

Ren Tanaka left Osaka at nineteen with a duffel bag and an     ← serif lead, ~75% width
admission letter from SFAI he wasn't sure he deserved.           (underline on opening clause)

┌─ col 1 ──────────┐ ┌─ col 2 ──────────┐ ┌─ col 3 ──────────┐  ← 3 equal columns, grotesk body
│ …Japanese        │ │ …falling in love │ │ …flower shop…    │
│ artists…         │ │ …is more.        │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

- **Label:** the `<h2>` "About" is kept for semantics but restyled as a small
  uppercase grotesk kicker (`var(--font-grotesk)`, `~10px`, letter-spacing
  `~0.12em`, `color: var(--stone)`), not the former serif heading. It still
  satisfies `getByRole("heading", { name: /^about$/i })`.
- **Lead:** serif (`var(--font-serif)`), large (`clamp(20px, ~2.8vw, 31px)`),
  `color: var(--ink)`, `width: 75%` on desktop (full width on mobile). Holds the
  underline emphasis on its opening clause.
- **Body:** CSS grid, `grid-template-columns: 1fr 1fr 1fr`, `gap: clamp(28px, 3vw, 36px)`,
  one paragraph per column, `var(--font-grotesk)`, `~17px`/`line-height ~1.6`,
  `color: var(--ink)`.

**Responsive:** three columns on desktop; collapse to **one column** at the
existing `max-width: 600px` breakpoint, with the lead going full width. A 2-column
tablet step is optional and tunable, not required.

## Copy (final — re-flowed from the original five sentences)

- **Lead:** Ren Tanaka left Osaka at nineteen with a duffel bag and an admission
  letter from SFAI he wasn't sure he deserved.
- **Col 1:** He spent his twenties absorbing San Francisco: the Japantown shops,
  the Mission murals, and the quiet rigor of Japanese artists he discovered in
  back rooms of galleries that no longer exist.
- **Col 2:** He started buying work before he could afford to, falling in love
  with pieces by obscure artists trying to make a living — artists who had reached
  the same conclusion: that less, done carefully, is more.
- **Col 3:** Tanaka's Gallery debuted in 2001 in a small San Francisco storefront
  that still smelled like the flower shop it once was.

Re-flow notes vs. the original copy: the philosophy clause moved up to close
Col 2 (joined to the "obscure artists" sentence with an em-dash); "from different
directions" was cut; the closing phrase changed from "is enough" to **"is more."**
The 2001 debut sentence stands alone as Col 3.

## Emphasis treatments

Two distinct marks, both in matcha (`var(--matcha)`):

1. **Underline (lead only)** — a 2px matcha bar under the opening clause
   **"Ren Tanaka left Osaka at nineteen"**. Implemented as a bar (e.g. a pseudo-
   element or inline-block) that animates `transform: scaleX(0 → 1)` from
   `transform-origin: left`, so it **draws left → right**. (A CSS `border-bottom`
   can't animate its own width cleanly; the scaleX bar is the mechanism.)

2. **Highlight (one per body column)** — a soft, slightly tall, lighter wash
   behind: **"Japanese artists"** (Col 1), **"falling in love"** (Col 2),
   **"flower shop"** (Col 3). Built as a vertical-band gradient
   `linear-gradient(transparent ~30%, rgba(124,138,107,~0.24) 0)` with
   `background-repeat: no-repeat`, animating `background-size: 0% 100% → 100% 100%`
   so it **wipes left → right**. The `30%` start and `~0.24` alpha are the
   "taller + lighter" values landed during review.

**Principle:** emphasis always *follows* its text — the underline/highlights begin
only after their paragraph has settled, so they read as a deliberate second pass,
never as part of the type appearing.

## Choreography

All values in **seconds**, measured from the moment the section enters view (the
same trigger the existing `ScrollReveal` uses). Splash beats reuse the existing
`ITEM_DUR`/`EASE_OUT`/stagger from `components/motion/splash/timing.ts`.

| Element            | Animation                         | Delay  | Duration | Ease                         |
|--------------------|-----------------------------------|--------|----------|------------------------------|
| Label "About"      | rise + deblur + fade (splash)     | 0.00   | 0.80     | EASE_OUT `[.22,1,.36,1]`     |
| Lead               | rise + deblur + fade (splash)     | 0.22   | 0.80     | EASE_OUT                     |
| Col 1 paragraph    | rise + deblur + fade (splash)     | 0.66   | 0.80     | EASE_OUT                     |
| Col 2 paragraph    | rise + deblur + fade (splash)     | 0.88   | 0.80     | EASE_OUT                     |
| Col 3 paragraph    | rise + deblur + fade (splash)     | 1.10   | 0.80     | EASE_OUT                     |
| Underline (lead)   | draw scaleX 0→1, left origin      | 1.00   | 0.70     | EASE_OUT                     |
| Highlight Col 1    | wipe bg-size 0%→100%, left origin | 1.80   | 1.05     | `cubic-bezier(.4,0,.2,1)`    |
| Highlight Col 2    | wipe                              | 2.45   | 1.05     | `cubic-bezier(.4,0,.2,1)`    |
| Highlight Col 3    | wipe                              | 3.10   | 1.05     | `cubic-bezier(.4,0,.2,1)`    |

The settled feel: splash lands quickly (label → lead → columns L→R); the underline
draws once the lead has settled; then the **three highlights are a slower, separate
storytelling pass** — wipe ~1.05s each, staggered **~0.65s** apart (1.80 / 2.45 /
3.10). The wipe *speed* and the ~0.65s *stagger* are the two values the user tuned
and approved; treat them as the contract, with small nudges allowed at the manual
checkpoint.

**Reduced motion (`prefers-reduced-motion`):** no rise translate/blur, no underline
draw, no highlight wipe. Everything fades in (opacity-only, `REDUCED_DUR`) and the
underline and highlights render **already drawn / fully washed**. This matches the
site's existing reduced-motion convention (see `ScrollReveal` / `variants.ts`).

## Implementation notes

- **`app/page.tsx`** — restructure the `#about` markup: keep `<ScrollReveal as="section">`
  and `<ScrollRevealItem>` for the label, lead, and three column paragraphs (the
  splash). Wrap the emphasized phrases in a new emphasis component (below). Update
  the body copy strings to the final re-flowed copy.
- **Emphasis components (new, `components/motion/`)** — add a small client
  component pair, e.g. `<Underline>` and `<Highlight>`, each a `motion.span` with
  hidden/visible variants for the draw / wipe. They must animate off the **same
  in-view trigger** as the section (so timing is measured from one moment, not
  per-span scroll position). Recommended: drive them via Framer variant
  propagation from the existing `ScrollReveal` container (parent flips to
  `"visible"`; these spans carry their own explicit `delay`), rather than giving
  each span its own independent `whileInView`.
  `TODO(about-emphasis): if variant propagation through the staggering container
  proves awkward, fall back to a single useInView on the section passing an
  in-view boolean down to the emphasis spans — anchor: this spec §Implementation.`
- **`components/motion/splash/timing.ts`** — add the new constants:
  underline draw (`ABOUT_UNDERLINE_DELAY` 1.0, `ABOUT_UNDERLINE_DUR` 0.7),
  highlight (`ABOUT_HL_DELAY` 1.8 start, `ABOUT_HL_STAGGER` 0.65, `ABOUT_HL_DUR` 1.05,
  and the `cubic-bezier(.4,0,.2,1)` ease). Keep them alongside the other splash
  timing so all motion timing has one source of truth.
- **`app/home.module.css`** — replace the `.aboutHead` / `.aboutLead` / `.aboutBody`
  rules with: `.aboutLabel` (uppercase kicker), `.aboutLead` (serif, 75% width),
  `.aboutGrid` (3-col grid), `.aboutCol` (body paragraph), plus the underline/
  highlight base styles if not owned by the motion components. Add the mobile
  collapse to the existing `@media (max-width: 600px)` block.

## Tests

- **`app/home.test.tsx`** (existing assertions still hold):
  - `getByRole("heading", { name: /^about$/i })` — label is still an `<h2>`.
  - `getByText(/debuted in 2001/i)` — still present in Col 3.
  - Add: the new closing phrase renders — `getByText(/less, done carefully, is more/i)`.
  - Add: the emphasized phrases render — e.g. `getByText(/Japanese artists/)`,
    `/falling in love/`, `/flower shop/`, and the lead underline clause
    `/Ren Tanaka left Osaka at nineteen/`. (Assert presence/structure, not animation.)
- Animation timing is not unit-tested (it's visual); it is verified at the manual
  checkpoint against this spec's choreography table.

## Out of scope (YAGNI)

- No new `/about` route, images, or portrait.
- No change to the hero, spotlight, or nav.
- No new copy beyond the re-flow above.
- No scroll-scrubbed / parallax behavior — the reveal is a one-shot on enter,
  consistent with the rest of the homepage.
