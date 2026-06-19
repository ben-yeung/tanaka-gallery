# Tanaka Gallery — Gallery Grid & Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the `/works` gallery into a responsive, fluidly-scaling, sortable, motion-driven grid — fluid scaling to 4K, Artist/Year multi-key sort with an availability de-emphasis toggle, a vertical-snake ceremonial entrance, and a calm FLIP reflow.

**Architecture:** Pure sort/URL-state logic lives in `lib/gallery.ts`; a pure snake-sequence helper lives in `components/motion/snake.ts` — both fully unit-tested. The `/works` page renders a client `GalleryView` island that owns URL-synced sort state and renders a slim `GallerySortBar` plus a presentational `WorkGrid`. `WorkGrid` is shared with artist-detail pages and carries the motion: Framer Motion `layout` on each grid item for FLIP reflow, plus a custom Web Animations entrance on an inner element (so position-FLIP and entrance-transform never fight). Reduced-motion collapses the entrance to an opacity fade and reflow to instant. State is encoded in the URL so it survives the grid→detail morph round-trip.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5, Framer Motion 11, CSS Modules. Testing: Vitest 2 + React Testing Library 16 + jsdom.

## Global Constraints

- **Mockup only.** Static typed data (`data/works.ts`, `data/artists.ts`) is the single source of truth. No backend.
- **No color literals in components.** Read CSS custom properties only (`var(--paper)`, `var(--ink)`, `var(--matcha)`, `var(--stone)`). Theme via `prefers-color-scheme`.
- **Three type roles:** `--font-serif` (EB Garamond), `--font-grotesk` (Space Grotesk), `--font-sans` (Inter). The sort control uses grotesk; captions use sans.
- **Voice:** terse. Caption format unchanged: `Title · Artist · Year` (+ ` · sold` when unavailable).
- **Art photography is edge-to-edge.** Frames keep `aspect-ratio: 4 / 3`, `object-fit: cover`.
- **Accessibility:** all motion respects `prefers-reduced-motion: reduce` — entrance becomes an opacity-only fade (no translate/blur), reflow and the availability toggle become instant.
- **No price sorting.** Sort keys are Artist and Year only.
- **Commit after every task.** TDD for pure logic (`lib/gallery.ts`, `components/motion/snake.ts`, `entranceFlag.ts`) and for the controlled components; manual-verify checkpoints for visual/motion behavior.

### Preconditions (parent plan)

This plan assumes the parent plan `docs/superpowers/plans/2026-06-18-tanaka-gallery.md` Tasks 1–7 are complete, i.e. these already exist:

- `data/types.ts` (`Work`, `Artist`), `data/works.ts` (`allWorks`, `getWork`, `worksByArtist`, `formatMeta`), `data/artists.ts` (`getArtist`).
- `components/motion/morphStore.ts` (`setMorphOrigin`, `takeMorphOrigin`, `Rect`).
- `components/motion/WorkGrid.tsx` + `components/motion/grid.module.css` (the static grid from parent Task 6) — **this plan rewrites both.**
- `app/works/page.tsx` (renders the grid) — **this plan modifies it.**
- `app/works/[slug]/page.tsx` + `components/motion/MorphImage.tsx` (signature morph, parent Task 7) — unchanged except the entrance-skip wiring in Task 8.
- Vitest harness with `@` path alias and `test/setup.ts` importing `@testing-library/jest-dom/vitest`.

Branch for this work: `gallery-grid-motion` (already created; the spec is committed there).

## File Structure

```
lib/
  gallery.ts            # NEW — pure: SortState, sortWorks, nextSortDir, URL parse/serialize
  gallery.test.ts       # NEW
components/motion/
  snake.ts              # NEW — pure: computeSnakeOrder (row grouping + boustrophedon)
  snake.test.ts         # NEW
  entranceFlag.ts       # NEW — sessionStorage flag: skip entrance on morph return
  entranceFlag.test.ts  # NEW
  GallerySortBar.tsx    # NEW — slim sort control (client)
  GallerySortBar.test.tsx # NEW
  sortbar.module.css    # NEW
  GalleryView.tsx       # NEW — /works island: URL-synced state + sort bar + WorkGrid (client)
  GalleryView.test.tsx  # NEW
  WorkGrid.tsx          # REWRITE — presentational grid: tile units, sold-dim, FLIP + entrance
  WorkGrid.test.tsx     # NEW
  grid.module.css       # REWRITE — fluid scaling, tile unit, sold-dim, will-change
app/works/page.tsx      # MODIFY — render <Suspense><GalleryView/></Suspense>
```

---

### Task 1: Pure gallery sort + URL state (`lib/gallery.ts`)

**Files:**
- Create: `lib/gallery.ts`, `lib/gallery.test.ts`

**Interfaces:**
- Consumes: `Work` from `@/data/types`.
- Produces:
  - `type SortKey = "artist" | "year"`, `type SortDir = "asc" | "desc"`.
  - `interface SortState { artist?: SortDir; year?: SortDir; dim: boolean }`.
  - `const DEFAULT_SORT_STATE: SortState`.
  - `nextSortDir(key: SortKey, current: SortDir | undefined): SortDir | undefined` — cycles `off → natural → reverse → off`; natural is `asc` for artist, `desc` for year.
  - `sortWorks(works: Work[], state: SortState, artistNameOf: (slug: string) => string): Work[]` — Artist primary, Year secondary, ties → original index. Returns a new array.
  - `parseGalleryParams(params: { get(name: string): string | null }): SortState`.
  - `serializeGalleryParams(state: SortState): string` — query string without leading `?`; artist encoded before year.

- [ ] **Step 1: Write the failing tests**

Create `lib/gallery.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  nextSortDir,
  sortWorks,
  parseGalleryParams,
  serializeGalleryParams,
  DEFAULT_SORT_STATE,
  type SortState,
} from "./gallery";
import type { Work } from "@/data/types";

const W = (slug: string, artistSlug: string, year: number, available = true): Work => ({
  slug, title: slug, artistSlug, year, medium: "", dimensions: "",
  priceCents: 0, image: `/works/${slug}.svg`, available,
});

// artist slugs map to display names so alphabetical order is testable
const names: Record<string, string> = { ohta: "Saburo Ohta", arai: "Ken Arai", lund: "Iris Lund" };
const nameOf = (slug: string) => names[slug] ?? slug;

describe("nextSortDir", () => {
  it("cycles artist off → asc → desc → off", () => {
    expect(nextSortDir("artist", undefined)).toBe("asc");
    expect(nextSortDir("artist", "asc")).toBe("desc");
    expect(nextSortDir("artist", "desc")).toBeUndefined();
  });
  it("cycles year off → desc → asc → off (newest first natural)", () => {
    expect(nextSortDir("year", undefined)).toBe("desc");
    expect(nextSortDir("year", "desc")).toBe("asc");
    expect(nextSortDir("year", "asc")).toBeUndefined();
  });
});

describe("sortWorks", () => {
  const works = [
    W("a", "ohta", 2019), W("b", "arai", 2021), W("c", "lund", 2020), W("d", "arai", 2018),
  ];
  it("returns curated (original) order when no keys active", () => {
    expect(sortWorks(works, DEFAULT_SORT_STATE, nameOf).map((w) => w.slug)).toEqual(["a", "b", "c", "d"]);
  });
  it("sorts by artist name ascending, ties keep curated order", () => {
    const r = sortWorks(works, { artist: "asc", dim: false }, nameOf).map((w) => w.slug);
    // Iris Lund(c), Ken Arai(b,d in curated order), Saburo Ohta(a)
    expect(r).toEqual(["c", "b", "d", "a"]);
  });
  it("groups by artist (primary) then year (secondary)", () => {
    const r = sortWorks(works, { artist: "asc", year: "asc", dim: false }, nameOf).map((w) => w.slug);
    // Lund(c 2020), Arai(d 2018, b 2021), Ohta(a 2019)
    expect(r).toEqual(["c", "d", "b", "a"]);
  });
  it("sorts by year only, descending", () => {
    const r = sortWorks(works, { year: "desc", dim: false }, nameOf).map((w) => w.slug);
    expect(r).toEqual(["b", "c", "a", "d"]);
  });
  it("does not mutate the input array", () => {
    const copy = works.slice();
    sortWorks(works, { year: "asc", dim: false }, nameOf);
    expect(works).toEqual(copy);
  });
  it("dim does not affect order", () => {
    const a = sortWorks(works, { artist: "asc", dim: false }, nameOf).map((w) => w.slug);
    const b = sortWorks(works, { artist: "asc", dim: true }, nameOf).map((w) => w.slug);
    expect(a).toEqual(b);
  });
});

describe("URL params", () => {
  it("round-trips state through serialize/parse", () => {
    const state: SortState = { artist: "asc", year: "desc", dim: true };
    const qs = serializeGalleryParams(state);
    expect(parseGalleryParams(new URLSearchParams(qs))).toEqual(state);
  });
  it("encodes artist before year", () => {
    expect(serializeGalleryParams({ artist: "asc", year: "desc", dim: false }))
      .toBe("sort=artist-asc%2Cyear-desc");
  });
  it("returns default state for empty params", () => {
    expect(parseGalleryParams(new URLSearchParams(""))).toEqual(DEFAULT_SORT_STATE);
  });
  it("ignores malformed sort tokens", () => {
    expect(parseGalleryParams(new URLSearchParams("sort=bogus-up,year-sideways&dim=9")))
      .toEqual({ dim: false });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- gallery`
Expected: FAIL — cannot resolve `./gallery`.

- [ ] **Step 3: Write `lib/gallery.ts`**

```ts
import type { Work } from "@/data/types";

export type SortKey = "artist" | "year";
export type SortDir = "asc" | "desc";

export interface SortState {
  artist?: SortDir;
  year?: SortDir;
  dim: boolean;
}

export const DEFAULT_SORT_STATE: SortState = { dim: false };

// First-press direction per key: artist A→Z, year newest-first.
const NATURAL: Record<SortKey, SortDir> = { artist: "asc", year: "desc" };

export function nextSortDir(key: SortKey, current: SortDir | undefined): SortDir | undefined {
  if (current === undefined) return NATURAL[key];
  if (current === NATURAL[key]) return NATURAL[key] === "asc" ? "desc" : "asc";
  return undefined;
}

export function sortWorks(
  works: Work[],
  state: SortState,
  artistNameOf: (slug: string) => string,
): Work[] {
  const orig = new Map(works.map((w, i) => [w.slug, i]));
  return works.slice().sort((a, b) => {
    if (state.artist) {
      const c = artistNameOf(a.artistSlug).localeCompare(artistNameOf(b.artistSlug));
      if (c !== 0) return state.artist === "asc" ? c : -c;
    }
    if (state.year) {
      const c = a.year - b.year;
      if (c !== 0) return state.year === "asc" ? c : -c;
    }
    return (orig.get(a.slug) ?? 0) - (orig.get(b.slug) ?? 0);
  });
}

export function parseGalleryParams(params: { get(name: string): string | null }): SortState {
  const state: SortState = { dim: params.get("dim") === "1" };
  const raw = params.get("sort");
  if (raw) {
    for (const part of raw.split(",")) {
      const [key, dir] = part.split("-");
      if ((key === "artist" || key === "year") && (dir === "asc" || dir === "desc")) {
        state[key] = dir;
      }
    }
  }
  return state;
}

export function serializeGalleryParams(state: SortState): string {
  const sort: string[] = [];
  if (state.artist) sort.push(`artist-${state.artist}`); // artist first = primary
  if (state.year) sort.push(`year-${state.year}`);
  const sp = new URLSearchParams();
  if (sort.length) sp.set("sort", sort.join(","));
  if (state.dim) sp.set("dim", "1");
  return sp.toString();
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- gallery`
Expected: PASS — all assertions pass.

- [ ] **Step 5: Commit**

```bash
git add lib/gallery.ts lib/gallery.test.ts
git commit -m "feat: add pure gallery sort logic and URL state codec"
```

---

### Task 2: Fluid responsive scaling (`grid.module.css`)

**Files:**
- Modify: `components/motion/grid.module.css` (the parent Task 6 file)

**Interfaces:**
- Consumes: nothing.
- Produces: a `.grid` that scales cells *and* columns toward 4K, with caption type scaling in step. Class names `.grid`, `.frame`, `.caption` remain (consumed by `WorkGrid` in Task 5).

> This task only changes the scaling-related rules. Structure classes (`.cell`, `.unit`, `.dimmed`) are added in Task 5; motion `will-change` in Task 7.

- [ ] **Step 1: Replace the `.grid` / frame / caption rules**

In `components/motion/grid.module.css`, replace the existing `.grid`, `.frame`, `.frame img`, and `.caption` rules with:

```css
.grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(min(100%, clamp(220px, 14vw + 40px, 560px)), 1fr)
  );
  gap: clamp(14px, 1.8vw, 28px);
  padding: clamp(28px, 3vw, 56px) var(--gutter) 96px;
  margin: 0;
}

.frame {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--stone);
  border-radius: 2px;
}
.frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.caption {
  margin-top: 10px;
  font-size: clamp(12px, 0.4vw + 11px, 16px);
}
```

> Keep the existing `.head`, `.subhead`, `.sold`, and `.morphWrap` rules from the parent file. If a parent `.tile`/`.tile:hover` rule exists, leave it for now — Task 5 replaces it.

- [ ] **Step 2: Manual verification across breakpoints**

Run: `npm run dev` and open `http://localhost:3000/works`.
Resize / use devtools device toolbar and confirm the §1 column-count targets:
- **375px:** 1 column, large cells, no horizontal scroll.
- **~768px:** 2 columns.
- **1366–1920px:** 3–4 columns.
- **2560px / 3840px (responsive mode or a 4K display):** 5–7 columns with visibly larger cells and larger caption text than at 1080p.

`TODO(grid-scaling): if the column counts or cell sizes miss the §1 targets, tune the
clamp() track (the 14vw + 40px term and the 220px/560px bounds) and re-check. Anchor:
spec §1. This is the manual tuning checkpoint.`

- [ ] **Step 3: Commit**

```bash
git add components/motion/grid.module.css
git commit -m "feat: fluid responsive scaling for the works grid"
```

---

### Task 3: Snake entrance sequence helper (`components/motion/snake.ts`)

**Files:**
- Create: `components/motion/snake.ts`, `components/motion/snake.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface SnakeItem { key: string; top: number; left: number }`.
  - `interface SnakeStep { key: string; fromTop: boolean; index: number }`.
  - `computeSnakeOrder(items: SnakeItem[], rowTolerance?: number): SnakeStep[]` — groups items into rows by `top` (within `rowTolerance`, default 8), orders rows top→down; even rows traverse left→right and enter from the top (`fromTop: true`), odd rows traverse right→left and enter from the bottom (`fromTop: false`); `index` is the sequential position along the snake path.

- [ ] **Step 1: Write the failing tests**

Create `components/motion/snake.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { computeSnakeOrder, type SnakeItem } from "./snake";

// Two rows of three. Row 0 top≈0, row 1 top≈100. Provided out of order.
const items: SnakeItem[] = [
  { key: "r1c2", top: 102, left: 200 },
  { key: "r0c0", top: 0, left: 0 },
  { key: "r0c2", top: 3, left: 200 },
  { key: "r1c0", top: 100, left: 0 },
  { key: "r0c1", top: 1, left: 100 },
  { key: "r1c1", top: 101, left: 100 },
];

describe("computeSnakeOrder", () => {
  it("orders row 0 left→right, row 1 right→left (boustrophedon)", () => {
    const seq = computeSnakeOrder(items);
    expect(seq.map((s) => s.key)).toEqual(["r0c0", "r0c1", "r0c2", "r1c2", "r1c1", "r1c0"]);
  });
  it("even rows enter from top, odd rows from bottom", () => {
    const seq = computeSnakeOrder(items);
    const dir = Object.fromEntries(seq.map((s) => [s.key, s.fromTop]));
    expect(dir["r0c0"]).toBe(true);
    expect(dir["r0c2"]).toBe(true);
    expect(dir["r1c0"]).toBe(false);
    expect(dir["r1c2"]).toBe(false);
  });
  it("assigns sequential indices along the path", () => {
    const seq = computeSnakeOrder(items);
    expect(seq.map((s) => s.index)).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it("groups near-equal tops into one row via tolerance", () => {
    const seq = computeSnakeOrder([
      { key: "a", top: 0, left: 0 },
      { key: "b", top: 6, left: 100 }, // within default tolerance 8 → same row
    ]);
    expect(seq).toHaveLength(2);
    expect(seq.every((s) => s.fromTop)).toBe(true); // single row = row 0
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- snake`
Expected: FAIL — cannot resolve `./snake`.

- [ ] **Step 3: Write `components/motion/snake.ts`**

```ts
export interface SnakeItem {
  key: string;
  top: number;
  left: number;
}

export interface SnakeStep {
  key: string;
  fromTop: boolean;
  index: number;
}

export function computeSnakeOrder(items: SnakeItem[], rowTolerance = 8): SnakeStep[] {
  const rows: { top: number; items: SnakeItem[] }[] = [];
  for (const it of items) {
    let row = rows.find((r) => Math.abs(r.top - it.top) <= rowTolerance);
    if (!row) {
      row = { top: it.top, items: [] };
      rows.push(row);
    }
    row.items.push(it);
  }
  rows.sort((a, b) => a.top - b.top);

  const seq: SnakeStep[] = [];
  rows.forEach((row, ri) => {
    row.items.sort((a, b) => a.left - b.left);
    const fromTop = ri % 2 === 0;
    const ordered = fromTop ? row.items : row.items.slice().reverse();
    for (const it of ordered) seq.push({ key: it.key, fromTop, index: seq.length });
  });
  return seq;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- snake`
Expected: PASS — all assertions pass.

- [ ] **Step 5: Commit**

```bash
git add components/motion/snake.ts components/motion/snake.test.ts
git commit -m "feat: add snake (boustrophedon) entrance sequence helper"
```

---

### Task 4: Sort control (`GallerySortBar.tsx`)

**Files:**
- Create: `components/motion/GallerySortBar.tsx`, `components/motion/sortbar.module.css`, `components/motion/GallerySortBar.test.tsx`

**Interfaces:**
- Consumes: `SortState`, `SortKey`, `nextSortDir` from `@/lib/gallery` (Task 1).
- Produces: `GallerySortBar({ state, onChange }: { state: SortState; onChange: (next: SortState) => void })` — a controlled component. Renders an "Artist" and a "Year" 3-state toggle (using `nextSortDir`) and an "Available only" pill toggling `state.dim`. Active keys show an arrow (`↑` asc / `↓` desc) and get `aria-pressed`.

- [ ] **Step 1: Write `components/motion/sortbar.module.css`**

```css
.bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 18px;
  padding: 12px var(--gutter);
  border-top: 1px solid var(--stone);
  border-bottom: 1px solid var(--stone);
}
.label {
  font-family: var(--font-grotesk), sans-serif;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--stone);
}
.key {
  font-family: var(--font-grotesk), sans-serif;
  font-size: 13px;
  letter-spacing: 0.03em;
  color: var(--stone);
  background: none;
  border: 0;
  padding: 2px 0;
  border-bottom: 1px solid transparent;
  cursor: pointer;
}
.key.on {
  color: var(--ink);
  border-bottom-color: var(--matcha);
}
.arrow {
  color: var(--matcha);
}
.pill {
  margin-left: auto;
  font-family: var(--font-grotesk), sans-serif;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--stone);
  background: none;
  border: 1px solid var(--stone);
  border-radius: 999px;
  padding: 4px 12px;
  cursor: pointer;
}
.pill.pillOn {
  color: var(--matcha);
  border-color: var(--matcha);
}
```

- [ ] **Step 2: Write the failing test**

Create `components/motion/GallerySortBar.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GallerySortBar } from "./GallerySortBar";

describe("GallerySortBar", () => {
  it("cycles Artist off → asc on first click", () => {
    const onChange = vi.fn();
    render(<GallerySortBar state={{ dim: false }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /artist/i }));
    expect(onChange).toHaveBeenCalledWith({ dim: false, artist: "asc" });
  });
  it("cycles Year to desc (newest first) on first click", () => {
    const onChange = vi.fn();
    render(<GallerySortBar state={{ dim: false }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /year/i }));
    expect(onChange).toHaveBeenCalledWith({ dim: false, year: "desc" });
  });
  it("turns an active (desc) artist key off on the third state", () => {
    const onChange = vi.fn();
    render(<GallerySortBar state={{ dim: false, artist: "desc" }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /artist/i }));
    expect(onChange).toHaveBeenCalledWith({ dim: false, artist: undefined });
  });
  it("toggles the availability dim pill", () => {
    const onChange = vi.fn();
    render(<GallerySortBar state={{ dim: false }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /available only/i }));
    expect(onChange).toHaveBeenCalledWith({ dim: true });
  });
  it("marks an active key with aria-pressed", () => {
    render(<GallerySortBar state={{ dim: false, year: "desc" }} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /year/i })).toHaveAttribute("aria-pressed", "true");
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- GallerySortBar`
Expected: FAIL — cannot resolve `./GallerySortBar`.

- [ ] **Step 4: Write `components/motion/GallerySortBar.tsx`**

```tsx
"use client";

import { nextSortDir, type SortKey, type SortState } from "@/lib/gallery";
import styles from "./sortbar.module.css";

const ARROW = { asc: "↑", desc: "↓" } as const;

export function GallerySortBar({
  state,
  onChange,
}: {
  state: SortState;
  onChange: (next: SortState) => void;
}) {
  const toggleKey = (key: SortKey) =>
    onChange({ ...state, [key]: nextSortDir(key, state[key]) });

  return (
    <div className={styles.bar}>
      <span className={styles.label}>Sort</span>

      <button
        type="button"
        className={`${styles.key} ${state.artist ? styles.on : ""}`}
        aria-pressed={!!state.artist}
        onClick={() => toggleKey("artist")}
      >
        Artist {state.artist && <span className={styles.arrow}>{ARROW[state.artist]}</span>}
      </button>

      <button
        type="button"
        className={`${styles.key} ${state.year ? styles.on : ""}`}
        aria-pressed={!!state.year}
        onClick={() => toggleKey("year")}
      >
        Year {state.year && <span className={styles.arrow}>{ARROW[state.year]}</span>}
      </button>

      <button
        type="button"
        className={`${styles.pill} ${state.dim ? styles.pillOn : ""}`}
        aria-pressed={state.dim}
        onClick={() => onChange({ ...state, dim: !state.dim })}
      >
        Available only
      </button>
    </div>
  );
}
```

> Note: `{ ...state, artist: undefined }` keeps the `artist` key with an `undefined` value; `toEqual({ dim: false, artist: undefined })` matches this in the test. `serializeGalleryParams` (Task 1) already skips falsy directions, so the URL stays clean.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- GallerySortBar`
Expected: PASS — 5 passed.

- [ ] **Step 6: Commit**

```bash
git add components/motion/GallerySortBar.tsx components/motion/sortbar.module.css components/motion/GallerySortBar.test.tsx
git commit -m "feat: add slim gallery sort control"
```

---

### Task 5: Rewrite `WorkGrid` as a presentational tile-unit grid

**Files:**
- Rewrite: `components/motion/WorkGrid.tsx`
- Modify: `components/motion/grid.module.css` (add structure + sold-dim rules)
- Create: `components/motion/WorkGrid.test.tsx`

**Interfaces:**
- Consumes: `Work` from `@/data/types`; `formatMeta` from `@/data/works`; `setMorphOrigin` from `./morphStore`.
- Produces: `WorkGrid({ works, dim }: { works: Work[]; dim?: boolean })` — a `<ul>` of tile units. Each tile is `<li class="cell"><a class="unit">…</a></li>`; the `<a>` captures its image rect via `setMorphOrigin` on click and carries `data-morph={slug}`. When `dim` is true, sold (`!available`) units get the `dimmed` class. No motion yet (added in Task 7).

> This task replaces the parent Task 6 `WorkGrid`. Motion is intentionally deferred to Task 7 so this task is reviewable as a correct, static, sortable-ready grid.

- [ ] **Step 1: Add structure + sold-dim rules to `components/motion/grid.module.css`**

Append (and remove any parent `.tile` / `.tile:hover .caption` rules, replacing them with `.unit`):
```css
.cell {
  margin: 0;
}
.unit {
  display: block;
  color: inherit;
}
.unit:hover .frame {
  filter: brightness(1.04);
}
.unit:hover .caption {
  color: var(--matcha);
}
.dimmed .frame {
  filter: brightness(0.5);
  opacity: 0.55;
  transition: filter 300ms ease, opacity 300ms ease;
}
.dimmed .caption {
  opacity: 0.55;
}
```

- [ ] **Step 2: Write the failing test**

Create `components/motion/WorkGrid.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkGrid } from "./WorkGrid";
import type { Work } from "@/data/types";
import styles from "./grid.module.css";

const work = (slug: string, available: boolean): Work => ({
  slug, title: slug, artistSlug: "saburo-ohta", year: 2020, medium: "", dimensions: "",
  priceCents: 0, image: `/works/${slug}.svg`, available,
});

describe("WorkGrid", () => {
  it("renders one link per work to its detail route", () => {
    render(<WorkGrid works={[work("a", true), work("b", true)]} />);
    expect(screen.getByRole("link", { name: /a/i })).toHaveAttribute("href", "/works/a");
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
  it("appends ' · sold' to unavailable works", () => {
    render(<WorkGrid works={[work("gone", false)]} />);
    expect(screen.getByText(/· sold/)).toBeInTheDocument();
  });
  it("applies the dimmed class to sold works only when dim is on", () => {
    const { rerender, container } = render(<WorkGrid works={[work("gone", false)]} dim={false} />);
    expect(container.querySelector(`.${styles.dimmed}`)).toBeNull();
    rerender(<WorkGrid works={[work("gone", false)]} dim={true} />);
    expect(container.querySelector(`.${styles.dimmed}`)).not.toBeNull();
  });
  it("does not dim available works", () => {
    const { container } = render(<WorkGrid works={[work("here", true)]} dim={true} />);
    expect(container.querySelector(`.${styles.dimmed}`)).toBeNull();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- WorkGrid`
Expected: FAIL — the rewritten component / `dimmed` behavior does not exist yet.

- [ ] **Step 4: Rewrite `components/motion/WorkGrid.tsx`**

```tsx
"use client";

import Link from "next/link";
import type { Work } from "@/data/types";
import { formatMeta } from "@/data/works";
import { setMorphOrigin } from "./morphStore";
import styles from "./grid.module.css";

export function WorkGrid({ works, dim = false }: { works: Work[]; dim?: boolean }) {
  return (
    <ul className={styles.grid}>
      {works.map((work) => {
        const sold = !work.available;
        return (
          <li key={work.slug} className={styles.cell}>
            <Link
              href={`/works/${work.slug}`}
              className={`${styles.unit} ${dim && sold ? styles.dimmed : ""}`}
              onClick={(e) => {
                const img = e.currentTarget.querySelector("img");
                if (img) {
                  const r = img.getBoundingClientRect();
                  setMorphOrigin(work.slug, {
                    top: r.top, left: r.left, width: r.width, height: r.height,
                  });
                }
              }}
            >
              <div className={styles.frame}>
                <img src={work.image} alt={work.title} data-morph={work.slug} loading="lazy" />
              </div>
              <p className={`meta ${styles.caption} ${sold ? styles.sold : ""}`}>
                {formatMeta(work)}
                {sold ? " · sold" : ""}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- WorkGrid`
Expected: PASS — 4 passed.

- [ ] **Step 6: Commit**

```bash
git add components/motion/WorkGrid.tsx components/motion/grid.module.css components/motion/WorkGrid.test.tsx
git commit -m "feat: rewrite WorkGrid as presentational tile-unit grid with sold-dim"
```

---

### Task 6: `GalleryView` island + wire the `/works` page

**Files:**
- Create: `components/motion/GalleryView.tsx`, `components/motion/GalleryView.test.tsx`
- Modify: `app/works/page.tsx`

**Interfaces:**
- Consumes: `Work` from `@/data/types`; `getArtist` from `@/data/artists`; `sortWorks`, `parseGalleryParams`, `serializeGalleryParams`, `SortState` from `@/lib/gallery`; `GallerySortBar` (Task 4); `WorkGrid` (Task 5); `useRouter`, `usePathname`, `useSearchParams` from `next/navigation`.
- Produces: `GalleryView({ works }: { works: Work[] })` — reads `SortState` from the URL, renders the sort bar + a sorted `WorkGrid`, and writes state changes back to the URL via `router.replace(..., { scroll: false })`.

- [ ] **Step 1: Write the failing test**

Create `components/motion/GalleryView.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Work } from "@/data/types";

const replace = vi.fn();
let search = new URLSearchParams("");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/works",
  useSearchParams: () => search,
}));

import { GalleryView } from "./GalleryView";

const work = (slug: string, artistSlug: string, year: number): Work => ({
  slug, title: slug, artistSlug, year, medium: "", dimensions: "",
  priceCents: 0, image: `/works/${slug}.svg`, available: true,
});

// "saburo-ohta" and "ken-arai" resolve via real data/artists; pick known slugs.
const works = [work("old", "saburo-ohta", 2018), work("new", "saburo-ohta", 2023)];

describe("GalleryView", () => {
  beforeEach(() => {
    replace.mockClear();
    search = new URLSearchParams("");
  });

  it("renders works in the order dictated by the URL (year desc → newest first)", () => {
    search = new URLSearchParams("sort=year-desc");
    render(<GalleryView works={works} />);
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/works/new");
    expect(links[1]).toHaveAttribute("href", "/works/old");
  });

  it("writes serialized state to the URL when a key is toggled", () => {
    render(<GalleryView works={works} />);
    fireEvent.click(screen.getByRole("button", { name: /year/i }));
    expect(replace).toHaveBeenCalledWith("/works?sort=year-desc", { scroll: false });
  });

  it("clears the query string when state returns to default", () => {
    search = new URLSearchParams("dim=1");
    render(<GalleryView works={works} />);
    fireEvent.click(screen.getByRole("button", { name: /available only/i }));
    expect(replace).toHaveBeenCalledWith("/works", { scroll: false });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- GalleryView`
Expected: FAIL — cannot resolve `./GalleryView`.

- [ ] **Step 3: Write `components/motion/GalleryView.tsx`**

```tsx
"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Work } from "@/data/types";
import { getArtist } from "@/data/artists";
import {
  parseGalleryParams,
  serializeGalleryParams,
  sortWorks,
  type SortState,
} from "@/lib/gallery";
import { GallerySortBar } from "./GallerySortBar";
import { WorkGrid } from "./WorkGrid";

const artistNameOf = (slug: string) => getArtist(slug)?.name ?? "";

export function GalleryView({ works }: { works: Work[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const state = parseGalleryParams(useSearchParams());
  const sorted = sortWorks(works, state, artistNameOf);

  const onChange = useCallback(
    (next: SortState) => {
      const qs = serializeGalleryParams(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  return (
    <>
      <GallerySortBar state={state} onChange={onChange} />
      <WorkGrid works={sorted} dim={state.dim} />
    </>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- GalleryView`
Expected: PASS — 3 passed.

- [ ] **Step 5: Wire `app/works/page.tsx`**

`useSearchParams` must be inside a `<Suspense>` boundary (Next 15). Replace the body of `app/works/page.tsx` with:
```tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { allWorks } from "@/data/works";
import { GalleryView } from "@/components/motion/GalleryView";
import { WorkGrid } from "@/components/motion/WorkGrid";
import styles from "@/components/motion/grid.module.css";

export const metadata: Metadata = { title: "Works" };

export default function WorksPage() {
  return (
    <>
      <header className={styles.head}>
        <h1>Works</h1>
        <p className={`subhead ${styles.subhead}`}>The complete index</p>
      </header>
      <Suspense fallback={<WorkGrid works={allWorks()} />}>
        <GalleryView works={allWorks()} />
      </Suspense>
    </>
  );
}
```

- [ ] **Step 6: Verify build + manual sort behavior**

Run: `npm run build` (expect success), then `npm run dev`.
Manual at `http://localhost:3000/works`:
- Toggle **Artist** / **Year** → grid reorders (no motion yet); the URL gains `?sort=…`.
- Toggle **Available only** → sold works darken/fade in place; URL gains `dim=1`.
- Reload the page with a `?sort=…` URL → order and pill state are restored.

- [ ] **Step 7: Commit**

```bash
git add components/motion/GalleryView.tsx components/motion/GalleryView.test.tsx app/works/page.tsx
git commit -m "feat: URL-synced sortable gallery view on /works"
```

---

### Task 7: Motion — FLIP reflow + vertical-snake entrance + reduced motion

**Files:**
- Modify: `components/motion/WorkGrid.tsx`
- Modify: `components/motion/grid.module.css` (add `will-change`)

**Interfaces:**
- Consumes: `computeSnakeOrder` from `./snake` (Task 3); `LayoutGroup`, `motion`, `useReducedMotion` from `framer-motion`; `useEffect`, `useRef` from React.
- Produces: same `WorkGrid` public signature (`{ works, dim? }`). Adds: Framer Motion `layout` on each `<li>` for calm FLIP reflow; a Web-Animations vertical-snake entrance on each `<a>` unit, run once on mount; reduced-motion → opacity-only entrance and `layout` disabled (instant reflow).

> Position-FLIP animates the outer `<li>`; the entrance animates the inner `<a>` transform — they never write the same element's transform, so they don't conflict. The entrance uses the captured tile `getBoundingClientRect()` tops to derive rows, so it adapts to the live column count.

- [ ] **Step 1: Add `will-change` to the unit in `grid.module.css`**

Add to the `.unit` rule (or append a new declaration):
```css
.unit {
  display: block;
  color: inherit;
  will-change: transform, opacity, filter;
}
```

- [ ] **Step 2: Rewrite `components/motion/WorkGrid.tsx` with motion**

```tsx
"use client";

import Link from "next/link";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { Work } from "@/data/types";
import { formatMeta } from "@/data/works";
import { setMorphOrigin } from "./morphStore";
import { computeSnakeOrder, type SnakeItem } from "./snake";
import styles from "./grid.module.css";

const ENTER_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function WorkGrid({ works, dim = false }: { works: Work[]; dim?: boolean }) {
  const reduce = useReducedMotion();
  const units = useRef(new Map<string, HTMLElement>());

  // Run the entrance once on mount.
  useEffect(() => {
    const items: SnakeItem[] = [];
    units.current.forEach((el, key) => {
      const r = el.getBoundingClientRect();
      items.push({ key, top: r.top, left: r.left });
    });
    const order = computeSnakeOrder(items);

    for (const step of order) {
      const el = units.current.get(step.key);
      if (!el || typeof el.animate !== "function") continue; // jsdom guard
      if (reduce) {
        el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 600,
          delay: step.index * 60,
          easing: "ease",
          fill: "backwards",
        });
      } else {
        const dy = step.fromTop ? -80 : 80;
        el.animate(
          [
            { opacity: 0, filter: "blur(12px) brightness(1.25)", transform: `translateY(${dy}px)` },
            { opacity: 1, filter: "blur(0) brightness(1)", transform: "none" },
          ],
          { duration: 1250, delay: step.index * 190, easing: ENTER_EASE, fill: "backwards" },
        );
      }
    }
    // Mount-only: the entrance should not re-run on sort changes (reflow handles those).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LayoutGroup>
      <motion.ul className={styles.grid}>
        {works.map((work) => {
          const sold = !work.available;
          return (
            <motion.li
              key={work.slug}
              className={styles.cell}
              layout={reduce ? false : true}
              initial={false}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                ref={(el) => {
                  if (el) units.current.set(work.slug, el);
                  else units.current.delete(work.slug);
                }}
                href={`/works/${work.slug}`}
                className={`${styles.unit} ${dim && sold ? styles.dimmed : ""}`}
                onClick={(e) => {
                  const img = e.currentTarget.querySelector("img");
                  if (img) {
                    const r = img.getBoundingClientRect();
                    setMorphOrigin(work.slug, {
                      top: r.top, left: r.left, width: r.width, height: r.height,
                    });
                  }
                }}
              >
                <div className={styles.frame}>
                  <img src={work.image} alt={work.title} data-morph={work.slug} loading="lazy" />
                </div>
                <p className={`meta ${styles.caption} ${sold ? styles.sold : ""}`}>
                  {formatMeta(work)}
                  {sold ? " · sold" : ""}
                </p>
              </Link>
            </motion.li>
          );
        })}
      </motion.ul>
    </LayoutGroup>
  );
}
```

- [ ] **Step 3: Run the existing component tests to verify they still pass**

Run: `npm test -- WorkGrid GalleryView`
Expected: PASS — the `jsdom guard` (`typeof el.animate !== "function"`) prevents the entrance effect from throwing; dim/order/structure assertions are unchanged.

- [ ] **Step 4: Manual verification of motion**

Run: `npm run dev`.
- **Entrance:** load `/works` → tiles slide-fade in as a vertical snake (row 1 from top, row 2 from bottom, …), image + caption moving together as a unit, ceremonial pace.
- **Reflow:** toggle a sort key → tiles glide to new positions (calm FLIP, ~0.5s), no re-entrance.
- **Availability:** toggle "Available only" → sold tiles darken in place, no reflow.
- **Reduced motion:** enable OS "reduce motion" → entrance is a plain opacity fade; sorting reorders instantly (no glide).
- **Responsive:** resize during a fresh load; the entrance rows match the current column count.

- [ ] **Step 5: Commit**

```bash
git add components/motion/WorkGrid.tsx components/motion/grid.module.css
git commit -m "feat: snake entrance and calm FLIP reflow for the works grid"
```

---

### Task 8: Skip the entrance when returning from a detail morph

**Files:**
- Create: `components/motion/entranceFlag.ts`, `components/motion/entranceFlag.test.ts`
- Modify: `components/motion/WorkGrid.tsx`

**Interfaces:**
- Consumes: `sessionStorage` (browser).
- Produces:
  - `markGalleryReturn(): void` — sets a session flag, called when a tile is clicked (forward nav into the morph).
  - `consumeGalleryReturn(): boolean` — returns `true` once if the flag is set, clearing it.
  - `WorkGrid` calls `markGalleryReturn()` on tile click and, on mount, skips the entrance when `consumeGalleryReturn()` is true (so the reverse morph reads against tiles already in place).

- [ ] **Step 1: Write the failing test**

Create `components/motion/entranceFlag.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { markGalleryReturn, consumeGalleryReturn } from "./entranceFlag";

describe("entranceFlag", () => {
  beforeEach(() => sessionStorage.clear());

  it("consume returns false when nothing was marked", () => {
    expect(consumeGalleryReturn()).toBe(false);
  });
  it("consume returns true once after mark, then false", () => {
    markGalleryReturn();
    expect(consumeGalleryReturn()).toBe(true);
    expect(consumeGalleryReturn()).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- entranceFlag`
Expected: FAIL — cannot resolve `./entranceFlag`.

- [ ] **Step 3: Write `components/motion/entranceFlag.ts`**

```ts
const KEY = "tg:gallery-return";

export function markGalleryReturn(): void {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // sessionStorage unavailable (SSR / privacy mode) — entrance simply always plays.
  }
}

export function consumeGalleryReturn(): boolean {
  try {
    if (sessionStorage.getItem(KEY)) {
      sessionStorage.removeItem(KEY);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- entranceFlag`
Expected: PASS — 2 passed. (jsdom provides `sessionStorage`.)

- [ ] **Step 5: Wire the flag into `components/motion/WorkGrid.tsx`**

Add the import:
```tsx
import { consumeGalleryReturn, markGalleryReturn } from "./entranceFlag";
```

Guard the entrance effect — at the very top of the `useEffect(() => { … }, [])` body, before measuring:
```tsx
    if (consumeGalleryReturn()) return; // returned from a detail morph → no re-entrance
```

Call `markGalleryReturn()` in the tile `onClick`, alongside the rect capture:
```tsx
                onClick={(e) => {
                  const img = e.currentTarget.querySelector("img");
                  if (img) {
                    const r = img.getBoundingClientRect();
                    setMorphOrigin(work.slug, {
                      top: r.top, left: r.left, width: r.width, height: r.height,
                    });
                  }
                  markGalleryReturn();
                }}
```

- [ ] **Step 6: Run the component tests to verify they still pass**

Run: `npm test -- WorkGrid GalleryView`
Expected: PASS — unchanged (no tile clicks in those tests, so the flag stays unset and the entrance guard is a no-op).

- [ ] **Step 7: Manual verification**

Run: `npm run dev`.
- From `/works`, click a tile → it morphs to detail. Press the browser **Back** button → the grid appears **without** replaying the entrance, and the reverse morph (if implemented in parent Task 7) reads cleanly.
- Open `/works` fresh (new tab / hard reload) → the entrance **does** play.

- [ ] **Step 8: Commit**

```bash
git add components/motion/entranceFlag.ts components/motion/entranceFlag.test.ts components/motion/WorkGrid.tsx
git commit -m "feat: skip grid entrance when returning from a detail morph"
```

---

### Task 9: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run the whole test suite**

Run: `npm test`
Expected: PASS — all suites green, including `gallery`, `snake`, `GallerySortBar`, `WorkGrid`, `GalleryView`, `entranceFlag`, plus the parent plan's existing tests.

- [ ] **Step 2: Lint and build**

Run: `npm run lint && npm run build`
Expected: no lint errors; production build succeeds (the `/works` `Suspense` boundary compiles, no `useSearchParams`-without-Suspense error).

- [ ] **Step 3: Final manual checklist**

Run: `npm run dev` and confirm against the spec:
- §1 fluid scaling across 375 / 1366 / 1920 / 2560 / 3840 (the `TODO(grid-scaling)` checkpoint).
- §2 Artist primary + Year secondary multi-key sort; availability dims in place; default is curated order; URL persists and is shareable.
- §3 vertical-snake entrance (whole-tile), calm FLIP reflow, ~300ms availability cross-fade, hover affordance.
- §3.5 reduced-motion: opacity-only entrance, instant reflow/availability.
- §4.3 entrance skipped on morph return.

- [ ] **Step 4: Commit any final tuning**

```bash
git add -A
git commit -m "chore: gallery grid verification pass and clamp tuning"
```

## Self-Review (author check)

- **Spec coverage:** §1 → Tasks 2 + 9; §2.1 sort keys/precedence → Tasks 1 + 4 + 6; §2.2 availability dim → Tasks 4 + 5; §2.3 default → Task 1 (`DEFAULT_SORT_STATE`); §2.4 URL state → Tasks 1 + 6; §3.1 entrance → Tasks 3 + 7; §3.2 reflow → Task 7; §3.3 availability cross-fade → Task 5 CSS transition; §3.4 hover → Task 5 CSS; §3.5 reduced motion → Task 7; §4.1 components → Tasks 1/4/5/6; §4.2 motion impl (nested layout vs entrance element) → Task 7; §4.3 entrance-skip → Task 8; §5 edges → covered (no empty state; malformed params Task 1; resize Task 7); §6 tests → each task's tests + Task 9.
- **Type consistency:** `SortState`/`SortDir`/`SortKey` defined in Task 1 and consumed verbatim in Tasks 4/6; `SnakeItem`/`SnakeStep`/`computeSnakeOrder` defined in Task 3 and consumed in Task 7; `WorkGrid({ works, dim })` signature stable across Tasks 5/7/8; `markGalleryReturn`/`consumeGalleryReturn` defined in Task 8 and used in the same task.
- **No placeholders:** every code step contains full code; manual-verify steps are explicit; the only `TODO` is the intentional `TODO(grid-scaling)` tuning checkpoint (an inline stub per house convention, not a plan gap).
