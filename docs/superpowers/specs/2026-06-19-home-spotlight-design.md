# Home Spotlight — Design

**Date:** 2026-06-19
**Status:** Approved (design)

## Summary

Add a **Spotlight** to the `.index` section of the home page (`app/page.tsx`). The section
becomes a two-column layout: the existing note + "View Selected Works" link stays in the
left column; a new right column auto-cycles through the gallery's works (shuffled), showing
one work image at a time with a caption beneath it. The spotlight links each work to its
detail page.

This is a presentational enhancement only — no changes to data shape, routing, or checkout.

## Goals

- Give the home page a living, image-forward focal point without a separate "artists" view.
- Reuse existing works/artists data as-is; introduce no new data fields.
- Match the codebase's motion conventions (`framer-motion`, `useReducedMotion`).

## Non-goals

- No portrait/photo assets for artists. Artists are never shown as their own slide; the
  image is always the **work**, and artist info appears only as caption text.
- No manual carousel controls (arrows / clickable dots). Cycling is automatic, pause-on-hover.
- No new "featured" flag — the spotlight uses all works.

## Behavior

### Content & order

- Source: **all** works from `data/works.ts` (currently 12), including sold pieces.
- Order: **shuffled** once on mount so repeat visits feel fresh.
- Each slide shows the work image plus a caption with all of:
  - **Work title** (serif)
  - **Artist name** (grotesk)
  - **Work meta**: `medium · year · dimensions` (muted)
  - **Artist bio line** (the terse one-liner from `data/artists.ts`, italic)

### Cycling

- Auto-advance every **5s** via cross-fade.
- **Pause on hover** of the spotlight region (pointer enter pauses the timer; pointer leave
  resumes).
- Cross-fade implemented with `AnimatePresence` (mode swap of the active slide).

### Progress indicator

- A small **typographic counter** `NN / NN` (e.g. `03 / 12`), set in grotesk, muted.
- Non-interactive — position indicator only.

### Interaction

- The spotlight (image + caption) is a `next/link` to the active work's detail page
  (`/works/[slug]`). Hover affordance consistent with existing link hover (matcha tint).
- Clicking pauses nothing special — it simply navigates.

### Reduced motion

- When `prefers-reduced-motion: reduce` (via `useReducedMotion`):
  - No auto-advance timer.
  - No cross-fade — the active work renders statically.
  - The work is still shuffled once on mount, so a reduced-motion visitor sees one
    randomly-chosen work (not always work #0).

## Architecture

### Server → client boundary

`app/page.tsx` stays a server component. It builds a plain, serializable array of spotlight
items and passes it to the new client component:

```ts
// in app/page.tsx
const items = allWorks().map((w) => {
  const artist = getArtist(w.artistSlug);
  return {
    slug: w.slug,
    title: w.title,
    image: w.image,
    meta: `${w.medium} · ${w.year} · ${w.dimensions}`,
    artistName: artist?.name ?? "Unknown",
    artistBio: artist?.bio ?? "",
  };
});
// <Spotlight items={items} />
```

### New component: `components/home/Spotlight.tsx`

- `"use client"`.
- Props: `{ items: SpotlightItem[] }` where `SpotlightItem` is the shape above.
- State: `index` (active slide), `shuffled` order.
- On mount (`useEffect`): compute a shuffled index order (Fisher–Yates). SSR renders
  `items[0]`; the first client effect applies the shuffle. This avoids a hydration mismatch
  because the server and the initial client render are identical (work #0), and the shuffle
  is a post-mount state update.
- Auto-advance: `useEffect` with `setInterval(5000)` that advances `index`, gated on
  `!reduce` and `!paused`. Cleared on unmount / dependency change.
- Hover: `onPointerEnter`/`onPointerLeave` toggle `paused`.
- Cross-fade: `AnimatePresence` keyed on the active slug; respect `reduce` by skipping the
  motion wrapper (render the image directly).

### Styling: `components/home/Spotlight.module.css`

- Fixed aspect-ratio frame (e.g. `aspect-ratio: 4 / 3`) with `object-fit: contain` and a
  subtle stone border, so cycling between differently-sized SVGs doesn't shift layout.
- Caption block beneath the frame using existing CSS variables (`--ink`, `--stone`,
  `--matcha`, fonts via `--font-serif` / `--font-grotesk`).

### Layout changes: `app/home.module.css`

- `.index` becomes a two-column grid/flex: left text column (existing `.note` + `.indexLink`)
  and right spotlight column.
- The left column keeps its current content and styling unchanged.
- **Mobile** (`max-width: 600px`, matching the existing breakpoint): collapse to one column,
  spotlight stacks **below** the text block, full-width.

## Edge cases

- **Single item / empty:** with `items.length <= 1`, no auto-advance; counter shows `01 / 01`
  (or the spotlight column is omitted entirely if `items.length === 0`).
- **Image load:** images are local SVGs in `/public/works`; no loading state needed beyond
  the fixed frame reserving space.
- **Unmount during interval:** interval cleared in effect cleanup.

## Testing

Follow the existing component-test pattern (`components/motion/tests/*.test.tsx`, Vitest +
Testing Library):

- Renders the first item's title, artist name, meta, and bio.
- Counter reflects `index + 1` and total.
- Advancing the index (via timer with fake timers, or exposed handler) swaps the displayed
  work; hover pauses advancement.
- With reduced motion mocked, no auto-advance occurs and a single static work renders.
- Spotlight links to `/works/<slug>` for the active item.

## Out of scope / future

- TODO(home-spotlight-featured): if editorial control is later wanted, add a `featured`
  flag to `Work` and filter the spotlight set — see this spec's "Non-goals". No work now.
