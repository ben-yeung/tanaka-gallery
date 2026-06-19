# Tanaka Gallery — Gallery Grid & Motion Design Spec (Follow-up)

**Date:** 2026-06-18
**Status:** Approved (brainstorming)
**Type:** Frontend feature — follow-up to the initial mockup spec
**Parent spec:** `docs/superpowers/specs/2026-06-18-tanaka-gallery-design.md`
**Parent plan:** `docs/superpowers/plans/2026-06-18-tanaka-gallery.md` (Task 6 — Works grid)

## Summary

A follow-up design that evolves the `/works` gallery grid from a static, fixed-cell
contact sheet into a **responsive, fluidly-scaling, sortable, motion-driven** gallery.
It refines and extends Task 6 (Works grid) of the parent plan; it does not change the
data model, the signature grid→detail morph, or the checkout flow.

Three pillars:

1. **Fluid scaling** — cells *and* columns grow together from mobile to 4K; artworks
   are emphasized as visuals rather than capped small. Caption type scales in step.
2. **Sortable, with a slim control** — Artist and Year sort keys (multi-key), plus an
   "Available only" de-emphasis toggle, expressed as a minimal control on the hairline.
3. **Motion** — a deliberate "ceremonial" entrance choreography on first paint, a calm
   FLIP reflow when the sort changes, and a strict reduced-motion fallback.

## Goals

- Make the grid feel intentional and high-craft at every viewport, **up to 4K**, with
  deliberate cell-size and font-size scaling.
- Add interactive sorting (Artist, Year) and an availability emphasis toggle, with a
  control that is slim, minimal, and intuitive — never visually heavy.
- Integrate motion that reads as clean and disciplined: an expressive first-paint
  entrance, quiet reflow afterward, and full respect for `prefers-reduced-motion`.

## Non-Goals

- No change to the data model, selectors, or placeholder imagery (parent Task 3/4).
- No change to the signature grid→detail morph mechanism (parent Task 7) — this spec
  only ensures the grid coexists with it.
- No price sorting (deliberately excluded — keeps the gallery's restraint about price).
- No drag-to-reorder, no infinite scroll, no pagination.

## 1. Responsive Scaling — "let the work breathe"

The grid uses **fluid scaling**: as the viewport grows, both the cell size and the
column count increase, so large screens show *larger* artworks (not just more, smaller
ones). Caption type scales in tandem so the typographic ratio holds at every size.

**Target column counts** (a feel target, achieved by tuning the clamp, not hard-coded
breakpoints):

| Viewport | Columns | Cell feel |
|---|---|---|
| Phone (≤480px) | 1 | full-width, large |
| Large phone / small tablet | 2 | comfortable |
| Mid desktop (~1366–1920) | 3–4 | gallery |
| 4K (~3840) | 5–7 | notably larger cells |

**Grid CSS (starting values, tunable at the manual checkpoint):**

```css
.grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(min(100%, clamp(220px, 14vw + 40px, 560px)), 1fr)
  );
  gap: clamp(14px, 1.8vw, 28px);
  padding: clamp(28px, 3vw, 56px) var(--gutter) 96px;
}
.frame { aspect-ratio: 4 / 3; overflow: hidden; background: var(--stone); }
.frame img { width: 100%; height: 100%; object-fit: cover; }
.caption { font-size: clamp(12px, 0.4vw + 11px, 16px); margin-top: 10px; }
```

- `min(100%, …)` guards against horizontal overflow on the narrowest screens.
- The `vw` term in the `clamp()` lets the minimum cell track grow sub-linearly with the
  viewport — the mechanism that produces "both cells and columns grow."
- The header "Works" title already scales via the parent plan; this spec only adds the
  caption scaling above.

`TODO(grid-scaling): tune the clamp() track and caption clamp by eye at the manual
checkpoint across 1366 / 1920 / 2560 / 3840 widths and at 375px (phone). Targets are the
column-count table in spec §1. Anchor site: this spec §1. Sibling site:
components/motion/grid.module.css.`

## 2. Sort & Filter Control

A slim segmented control sits on the hairline beneath the **Works** header (the parent
plan's `.head`/`.subhead` region). It is grotesk, small, and chrome-light — keys read as
bare words with a matcha underline when active.

### 2.1 Sort keys (Artist, Year)

- **Two keys, each a 3-state toggle:** `off → natural → reverse → off`.
  - **Artist** natural direction = **A→Z** (ascending); reverse = Z→A.
  - **Year** natural direction = **newest-first** (descending); reverse = oldest-first.
  - The active direction is shown with a small arrow (↑/↓) in `--matcha`.
- **Multi-key precedence:** when both are active, **Artist is primary** (groups works by
  artist) and **Year is secondary** (orders within each artist). When only one key is
  active, it is the sole sort. All remaining ties fall back to **curated order** (the
  original index in `data/works.ts`).
- **Price is intentionally not a sort key.**

### 2.2 Availability ("Available only" pill)

- A separate pill toggle, **not** a sort key. It does **not** remove or reorder works.
- When **on**, sold works are **darkened + faded in place** (de-emphasized) so the eye
  is drawn to available works; the grid layout is unchanged.
- When **off**, all works render normally.
- Sold works **always** carry "· sold" in their caption, regardless of the pill.

### 2.3 Default state

- **Curated order**, all sort toggles off, availability pill off.
- Everything is shown; sold works marked in the caption but not dimmed.

### 2.4 State persistence (URL search params)

Sort/filter state is encoded in the URL query string, e.g.
`?sort=artist-asc,year-desc&dim=1`.

- **Why:** it survives the grid→detail→back morph round-trip (so returning to `/works`
  preserves the chosen order), and it makes a sorted view shareable/bookmarkable.
- The grid reads state from `useSearchParams()` and writes via
  `router.replace(url, { scroll: false })` so toggling never adds history entries or
  jumps scroll.
- Unknown/malformed params degrade gracefully to the default state.

## 3. Motion

Three distinct motion states, all honoring `prefers-reduced-motion`.

### 3.1 Entrance — "vertical snake," ceremonial (first paint)

The signature first-impression flourish. Each **tile animates as one unit (image +
label together)**.

- **Choreography:** vertical slide-fade, alternating by row. **Even rows enter from the
  top** (slide down into place); **odd rows enter from the bottom** (slide up). The
  within-row stagger order **snakes** (left→right on one row, right→left on the next) so
  the fill reads as one continuous serpentine path; rows visually breathe toward each
  other as the grid fills.
- **Per-tile motion:** `opacity 0→1`, `filter: blur(12px) brightness(1.25) → none`,
  `transform: translateY(±80px) → none`. **No scale, no bounce.**
- **Timing:** 1250ms per tile, ~190ms stagger along the snake path,
  ease `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Row computation:** rows are derived from the tiles' live `getBoundingClientRect()`
  tops (tolerance ~8px), so the choreography adapts to whatever column count the fluid
  grid produces, and re-derives on resize.

### 3.2 Reflow — "calm" FLIP (on sort change)

When the active sort changes and tiles must move to new positions:

- A **FLIP** transition glides each tile from its old position to its new one.
- **Timing:** ~500ms, ease `cubic-bezier(0.22, 1, 0.36, 1)`, soft stagger.
- This is deliberately quieter than the entrance — routine interaction stays calm.

### 3.3 Availability toggle

- Toggling "Available only" **cross-fades the darken overlay** on sold tiles
  (~300ms). No layout movement, no FLIP (positions don't change).

### 3.4 Hover

- Subtle frame brightness lift (`filter: brightness(1.04)`) + caption → `--matcha`.

### 3.5 Reduced motion (`prefers-reduced-motion: reduce`)

- **Entrance:** opacity-only fade — **no translate, no blur, no scale.** ~600ms,
  ~60ms stagger, simple top-down (reading) order. (Strictest accessibility reading of
  the preference; chosen over the spatial "Prospect 1" alternative.)
- **Reflow:** instant (no FLIP).
- **Availability toggle:** instant.

## 4. Architecture

Builds on the parent plan's `components/motion/` island structure. The grid becomes a
client island; pure logic is extracted for testing.

### 4.1 Components & modules

- **`lib/gallery.ts`** (new, pure, testable):
  - `type SortDir = "asc" | "desc"`
  - `type SortState = { artist?: SortDir; year?: SortDir; dim: boolean }`
  - `sortWorks(works: Work[], state: SortState): Work[]` — applies Artist-primary /
    Year-secondary precedence with curated-order tiebreak. Pure; no DOM.
  - `parseGalleryParams(searchParams): SortState` / `serializeGalleryParams(state): string`
    — URL ↔ state, degrading malformed input to default.
- **`components/motion/GallerySortBar.tsx`** (new, client): the slim control — Artist /
  Year 3-state toggles + "Available only" pill. Emits state changes up to `WorkGrid`.
- **`components/motion/WorkGrid.tsx`** (extends parent Task 6): client island that
  - reads/writes `SortState` via URL search params,
  - renders `GallerySortBar` + the sorted tile units,
  - runs the entrance (3.1) and reflow (3.2) motion,
  - applies the sold-dim class when `dim` is on,
  - still captures each tile's rect on click for the signature morph (unchanged).
- **`components/motion/grid.module.css`** (extends parent Task 6): fluid columns (§1),
  caption scaling, sold-dim styles, tile-as-unit wrapper.

A small hook (e.g. `useGallerySort`) may encapsulate the URL↔state sync if it keeps
`WorkGrid` readable; this is an implementation detail, not a requirement.

### 4.2 Motion implementation

- **Reflow FLIP** uses Framer Motion's `layout` animation on the tile wrappers (the
  parent project already depends on Framer Motion), with `initial={false}` so tiles do
  not layout-animate on first mount.
- **Entrance** is a custom effect (the direction depends on the *computed* row index, so
  it can't be expressed as static variants): on mount, compute rows from
  `getBoundingClientRect()`, then drive the per-tile slide-fade via Framer Motion's
  imperative `animate`/`useAnimate` (or the Web Animations API). It is separate from the
  `layout` reflow.

### 4.3 Coexistence with the signature morph

- **Entrance runs once per fresh visit and is skipped when returning from a detail
  morph**, so the reverse morph (detail → grid tile) reads cleanly against tiles that are
  already in place rather than fighting a re-entrance. The return is detected via the
  existing morph-origin signal (parent `morphStore`) / a session flag.
- The FLIP reflow and the morph are independent; sort order does not affect the morph's
  rect capture (the clicked tile's current on-screen rect is what's captured).

`TODO(grid-entrance-skip): implement "skip entrance when returning from detail morph"
using the morphStore signal or a sessionStorage flag set on tile click. Without it, the
reverse morph competes with a re-running entrance. Anchor site: this spec §4.3. Sibling
sites: components/motion/WorkGrid.tsx, components/motion/morphStore.ts.`

## 5. Error & Edge Handling

- **Empty result is impossible** (availability is a dim, not a filter; sort never
  removes works), so there is no empty-grid state to design here.
- **Malformed URL params** → default `SortState` (§2.4).
- **Reduced motion** is a first-class state, not an error (§3.5).
- **Resize during/after entrance** → row computation re-derives; in-flight entrance
  animations are allowed to finish (no re-trigger mid-animation).

## 6. Testing

- **Unit (`lib/gallery.ts`):**
  - `sortWorks`: Artist-primary + Year-secondary ordering; single-key sorts; ascending
    vs descending per key; ties fall back to curated order; `dim` does not change order.
  - `parseGalleryParams` / `serializeGalleryParams`: round-trip; malformed input →
    default.
- **Component:**
  - `GallerySortBar`: each key cycles off → natural → reverse → off with correct arrows;
    "Available only" pill toggles; emitted state matches clicks.
  - `WorkGrid`: applies the sold-dim class when `dim` is on; reflects URL state on mount.
- **Manual / interaction:**
  - Entrance plays on a fresh visit; is skipped when returning via the morph.
  - Reduced-motion: opacity-only entrance, instant reflow.
  - FLIP reflow on sort change.
  - 4K scaling pass at 1366 / 1920 / 2560 / 3840 and at 375px (the §1 checkpoint).

## 7. Relationship to the Parent Plan

This spec supersedes the visual/interaction details of **parent plan Task 6** and adds
testable sort logic. When the implementation plan is written, expect:

- A new pure-logic task (`lib/gallery.ts` + tests) before the grid work.
- An expanded `WorkGrid` / new `GallerySortBar` task (replacing the static Task 6 grid).
- `grid.module.css` updated for fluid scaling and sold-dim.
- The signature morph task (parent Task 7) unchanged except for the §4.3 entrance-skip.

## Decision Log (brainstorming)

- **Scaling:** chose fluid "both grow" (Option C) over fixed-cell contact sheet (A) or
  capped-column editorial (B) — to emphasize artworks as visuals at 4K.
- **Sort control:** chose segmented keys on the hairline + availability pill (Option C)
  over inline text toggles (A) or a single dropdown (B).
- **Availability:** refined from a hard filter (remove/reorder) to an in-place
  darken/fade de-emphasis.
- **Reflow motion:** "Calm" over "Crisp" / "Spring."
- **Entrance:** explored unified rise (Prospect 1), per-tile directional cycling, and a
  diagonal variant (scrapped); landed on **vertical-by-row snake slide-fade**, ceremonial
  pace, whole-tile unit, no grow.
- **Reduced motion:** opacity-only fade (slightly slower), chosen over re-using the
  spatial Prospect 1.
