# Page Splash Intro Sequences Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an orchestrated first-load entrance that animates the navbar, then each index page's header/hero and section content, as one narrative-matched motion sequence — reusing the existing motion vocabulary and never replaying on client-side navigation.

**Architecture:** A module-singleton "fresh load" gate (in the spirit of the existing `morphStore`/`entranceFlag` singletons) reports whether the current render is part of the initial document load. A single client primitive `SplashItem` self-animates (gated by that flag) with per-element delays drawn from one shared `timing.ts`, so each animated element is independent of DOM nesting. Framer Motion variants (block / inline / furigana) carry the established slide-fade + soft-blur vocabulary and collapse to opacity-only under reduced motion. The navbar leads (logo stroke-draw → wordmark → links); the three index pages compose `SplashItem`s in meaning/reading order; `/works` leads with its header then hands off to the existing snake via a lead-delay.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Framer Motion 11 (already a dependency), Vitest + Testing Library + jsdom.

## Deviations from the spec (locked here)

These refine spec §2 implementation details without changing approved behavior (spec §1/§3/§7):

1. **Gate is a module singleton, not React context.** The spec described a `SplashProvider` / `useSplashGate` / `consume()`. We implement the identical behavior as a module singleton (`splashGate.ts`) matching the codebase's existing `morphStore.ts` / `entranceFlag.ts` patterns. It needs no provider in `app/layout.tsx` and avoids context re-render subtleties. The flag is `true` during the initial document load's first paint and flips `false` after first paint (a double `requestAnimationFrame`), so all client-side navigations — which happen long after first paint — read `false`. Consumers snapshot it once via a `useState` initializer (the spec's "snapshot once at mount").
2. **One primitive (`SplashItem`), no `SplashSequence` container.** Because the hero headline is semantically a single `<h1>` of inline fragments (and the page's beats span separate `<section>`s), a staggering parent container is awkward and risks layout changes. Instead every animated element is a self-driving `SplashItem` with an explicit `delay` from `timing.ts`. This is nesting-independent and avoids extra wrapper elements.
3. **Hero inline fragments fade/deblur (no translate).** Inline `<span>`s inside the `<h1>` are not reliably transformable; applying `translateY` to them is a no-op or forces `inline-block` (which would disturb the carefully tuned headline + furigana layout). So the three hero fragments (`Art.`, the Japanese run, `San Francisco.`) use an **inline variant** (opacity + blur, no Y). The rise is carried by the block beats (subline, sections, headers, rows). The furigana readings animate Y because `.rt` is `position: absolute` (transformable).
4. **`Logo` gains the `animated` prop directly** (it is used only by `Nav`), rather than a separate `AnimatedLogo`, to stay DRY.

---

## Global Constraints

- **Motion vocabulary (verbatim from existing code):** easing `cubic-bezier(0.22, 1, 0.36, 1)` (as the array `[0.22, 1, 0.36, 1]`). Slide-fade + soft blur. No scale, no bounce.
- **Reduced motion is first-class:** under `prefers-reduced-motion: reduce`, all splash motion is **opacity-only** — no translate, no blur, no logo draw, no furigana settle. Faster (~0.45s), small (~0.06s) cadence, reading order.
- **No color literals in components** — only `var(--token)` (`--paper`, `--ink`, `--matcha`, `--stone`). (No new colors are introduced by this feature.)
- **No splash replay on client navigation.** The full splash plays once per document load (hard refresh replays). All `<Link>` navigation uses the existing 200ms `app/template.tsx` fade-through, unchanged.
- **Do not modify** `app/template.tsx`, the grid→detail morph (`MorphImage.tsx`, `morphStore.ts`), or the snake choreography in `WorkGrid.tsx` (the only `WorkGrid` change is an additive lead-delay).
- **TDD, frequent commits.** Tests: `npx vitest run <path>`. Match existing test style (`components/motion/tests/*`, `app/home.test.tsx`).
- **jsdom guard:** any imperative `element.animate(...)` must guard `typeof el.animate === "function"` (jsdom lacks WAAPI), mirroring `WorkGrid.tsx`.

---

## File Structure

**New (`components/motion/splash/`):**
- `splashGate.ts` — module singleton: `isFreshLoad()`, `endFreshLoad()`, auto-flip after first paint.
- `timing.ts` — all durations/delays/easing constants + the `beat(i)` helper.
- `variants.ts` — Framer variant factories: `itemVariants`, `inlineVariants`, `furiganaVariants` (each reduced-motion aware).
- `SplashItem.tsx` — the single client reveal primitive.
- `tests/splashGate.test.ts`, `tests/variants.test.ts`, `tests/SplashItem.test.tsx`.

**Modified:**
- `components/ui/Logo.tsx` — add `animated` prop + `"use client"`; stroke-draw via `pathLength`.
- `components/ui/Nav.tsx` — `"use client"`; staged logo-draw → wordmark → links.
- `app/page.tsx` — hero fragments + subline + Selected Works section as meaning-ordered beats.
- `app/artists/page.tsx` — header beat + staggered artist rows.
- `app/works/page.tsx` — header beat.
- `components/motion/GallerySortBar.tsx` — sort bar fades in as the post-header beat (gated).
- `components/motion/WorkGrid.tsx` — additive snake lead-delay on a fresh-load landing.

**New tests:** `components/ui/Logo.test.tsx`, `components/ui/Nav.test.tsx`, `app/artists/artists-index.test.tsx`, `app/works/works-page.test.tsx`.

---

### Task 1: Fresh-load gate (module singleton)

**Files:**
- Create: `components/motion/splash/splashGate.ts`
- Test: `components/motion/splash/tests/splashGate.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `isFreshLoad(): boolean` — `true` during the initial document load's first paint; `false` afterward.
  - `endFreshLoad(): void` — ends the fresh-load window (called by the auto-flip; exported for tests/explicit use).

- [ ] **Step 1: Write the failing test**

```ts
// components/motion/splash/tests/splashGate.test.ts
import { describe, it, expect, beforeEach } from "vitest";

// Re-import a fresh module instance per test so the singleton starts `true`.
async function freshGate() {
  const { resetModules } = await import("vitest");
  return import("../splashGate");
}

describe("splashGate", () => {
  beforeEach(() => {
    // vitest resets module registry between files; within this file we reset
    // manually so each test gets a pristine `fresh = true`.
    return import("vitest").then(({ vi }) => vi.resetModules());
  });

  it("reports a fresh load until ended", async () => {
    const gate = await import("../splashGate");
    expect(gate.isFreshLoad()).toBe(true);
  });

  it("reports not-fresh after endFreshLoad()", async () => {
    const gate = await import("../splashGate");
    gate.endFreshLoad();
    expect(gate.isFreshLoad()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/motion/splash/tests/splashGate.test.ts`
Expected: FAIL — cannot resolve `../splashGate`.

- [ ] **Step 3: Write minimal implementation**

```ts
// components/motion/splash/splashGate.ts
// Module singleton (same shape as morphStore.ts / entranceFlag.ts): true only
// during the initial document load's first paint. The module is re-evaluated on
// every full document load / hard refresh (so the flag resets to true), and
// persists across client-side <Link> navigation (so it stays false). Client
// navigations always happen well after first paint, so their renders read false.
let fresh = true;

export function isFreshLoad(): boolean {
  return fresh;
}

export function endFreshLoad(): void {
  fresh = false;
}

// Close the fresh-load window once the initial paint has happened. Guarded so it
// no-ops under SSR and in jsdom (which lacks rAF), where the flag simply stays
// true for the synchronous render — harmless for tests.
if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
  window.requestAnimationFrame(() => window.requestAnimationFrame(endFreshLoad));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/motion/splash/tests/splashGate.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/motion/splash/splashGate.ts components/motion/splash/tests/splashGate.test.ts
git commit -m "feat: add fresh-load gate singleton for splash intro"
```

---

### Task 2: Timing constants + variant factories

**Files:**
- Create: `components/motion/splash/timing.ts`
- Create: `components/motion/splash/variants.ts`
- Test: `components/motion/splash/tests/variants.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces (from `timing.ts`):
  - `EASE_OUT: readonly [number, number, number, number]` = `[0.22, 1, 0.36, 1]`
  - Navbar: `LOGO_DRAW_DUR`, `WORDMARK_DELAY`, `WORDMARK_DUR`, `LINK_DELAY`, `LINK_STAGGER` (seconds)
  - Content: `CONTENT_START`, `ITEM_DUR`, `ITEM_STAGGER`, `ROW_STAGGER`, `RISE_Y` (px), `BLUR` (px), `FURIGANA_DELAY` (seconds)
  - Reduced: `REDUCED_DUR`, `REDUCED_STAGGER` (seconds)
  - Works handoff: `SNAKE_LEAD_MS` (ms), `SORTBAR_DELAY` (seconds)
  - `beat(i: number): number` — `CONTENT_START + i * ITEM_STAGGER`
  - `rowDelay(i: number): number` — `CONTENT_START + 0.3 + i * ROW_STAGGER`
- Produces (from `variants.ts`), each returning a Framer `Variants`-shaped object `{ hidden, visible }`:
  - `itemVariants(reduce: boolean, delay?: number)` — block: opacity + Y-rise + blur (reduce: opacity-only)
  - `inlineVariants(reduce: boolean, delay?: number)` — inline: opacity + blur, no Y (reduce: opacity-only)
  - `furiganaVariants(reduce: boolean, delay?: number)` — opacity + small Y on absolute `.rt` (reduce: opacity-only)

- [ ] **Step 1: Write the failing test**

```ts
// components/motion/splash/tests/variants.test.ts
import { describe, it, expect } from "vitest";
import { itemVariants, inlineVariants, furiganaVariants } from "../variants";
import { beat, CONTENT_START, ITEM_STAGGER, SNAKE_LEAD_MS } from "../timing";

describe("splash timing", () => {
  it("beats advance by the item stagger", () => {
    expect(beat(0)).toBe(CONTENT_START);
    expect(beat(1)).toBeCloseTo(CONTENT_START + ITEM_STAGGER);
    expect(beat(1)).toBeGreaterThan(beat(0));
  });
  it("snake lead is a positive millisecond value", () => {
    expect(SNAKE_LEAD_MS).toBeGreaterThan(0);
  });
});

describe("splash variants — full motion", () => {
  it("block items rise, deblur and fade", () => {
    const v = itemVariants(false);
    expect(v.hidden).toMatchObject({ opacity: 0 });
    expect(v.hidden).toHaveProperty("y");
    expect(v.hidden).toHaveProperty("filter");
    expect(v.visible).toMatchObject({ opacity: 1, y: 0 });
  });
  it("inline items fade and deblur but do NOT translate", () => {
    const v = inlineVariants(false);
    expect(v.hidden).toMatchObject({ opacity: 0 });
    expect(v.hidden).toHaveProperty("filter");
    expect(v.hidden).not.toHaveProperty("y");
    expect(v.visible).not.toHaveProperty("y");
  });
  it("applies a per-element delay to the visible transition", () => {
    const v = itemVariants(false, 0.9);
    expect((v.visible as { transition: { delay: number } }).transition.delay).toBe(0.9);
  });
});

describe("splash variants — reduced motion (opacity-only)", () => {
  it("block items are opacity-only", () => {
    expect(itemVariants(true).hidden).toEqual({ opacity: 0 });
    expect(itemVariants(true).visible).not.toHaveProperty("y");
    expect(itemVariants(true).visible).not.toHaveProperty("filter");
  });
  it("inline items are opacity-only", () => {
    expect(inlineVariants(true).hidden).toEqual({ opacity: 0 });
  });
  it("furigana is opacity-only (no settle Y)", () => {
    expect(furiganaVariants(true).hidden).toEqual({ opacity: 0 });
    expect(furiganaVariants(true).visible).not.toHaveProperty("y");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/motion/splash/tests/variants.test.ts`
Expected: FAIL — cannot resolve `../variants` / `../timing`.

- [ ] **Step 3: Write `timing.ts`**

```ts
// components/motion/splash/timing.ts
// Single source of truth for the splash choreography. All values in SECONDS
// unless the name ends in _MS. Tunable at the manual checkpoint — see
// TODO(splash-timing) in docs/superpowers/specs/2026-06-19-page-splash-intro-design.md §6.
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Navbar beats (lead).
export const LOGO_DRAW_DUR = 0.7;
export const WORDMARK_DELAY = 0.35;
export const WORDMARK_DUR = 0.6;
export const LINK_DELAY = 0.65;
export const LINK_STAGGER = 0.08;

// Page content beats.
export const CONTENT_START = 0.9; // first content beat begins, overlapping the navbar tail
export const ITEM_DUR = 0.8;
export const ITEM_STAGGER = 0.22; // hero meaning-order cadence
export const ROW_STAGGER = 0.1; // artists list cadence
export const RISE_Y = 28; // px — text rise (calmer than the grid's 80px tiles)
export const BLUR = 8; // px — soft blur
export const FURIGANA_DELAY = 0.2; // furigana settles this long after its kanji

// Reduced motion (opacity-only).
export const REDUCED_DUR = 0.45;
export const REDUCED_STAGGER = 0.06;

// /works handoff.
export const SORTBAR_DELAY = 1.2; // sort bar fades in just under the header beat
export const SNAKE_LEAD_MS = 1100; // header leads before the grid snake begins (ms; snake uses WAAPI)

// The i-th content beat (Art. = 0, JP = 1, SF = 2, subline = 3, section = 4, ...).
export const beat = (i: number): number => CONTENT_START + i * ITEM_STAGGER;

// The i-th list row (artists), beginning a beat after the header.
export const rowDelay = (i: number): number => CONTENT_START + 0.3 + i * ROW_STAGGER;
```

- [ ] **Step 4: Write `variants.ts`**

```ts
// components/motion/splash/variants.ts
import type { Variants } from "framer-motion";
import { EASE_OUT, ITEM_DUR, RISE_Y, BLUR, REDUCED_DUR, FURIGANA_DELAY } from "./timing";

// Block elements: rise + deblur + fade (reduced: opacity-only).
export function itemVariants(reduce: boolean, delay = 0): Variants {
  if (reduce) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: REDUCED_DUR, ease: "easeOut", delay } },
    };
  }
  return {
    hidden: { opacity: 0, y: RISE_Y, filter: `blur(${BLUR}px)` },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: ITEM_DUR, ease: EASE_OUT, delay },
    },
  };
}

// Inline fragments (hero headline): fade + deblur, NO translate (inline spans
// are not reliably transformable). Reduced: opacity-only.
export function inlineVariants(reduce: boolean, delay = 0): Variants {
  if (reduce) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: REDUCED_DUR, ease: "easeOut", delay } },
    };
  }
  return {
    hidden: { opacity: 0, filter: `blur(${BLUR}px)` },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: ITEM_DUR, ease: EASE_OUT, delay },
    },
  };
}

// Furigana readings (.rt, position:absolute → transformable): a small settle.
// Reduced: opacity-only (appears with its kanji).
export function furiganaVariants(reduce: boolean, delay = 0): Variants {
  if (reduce) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: REDUCED_DUR, ease: "easeOut", delay } },
    };
  }
  return {
    hidden: { opacity: 0, y: -8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: EASE_OUT, delay: delay + FURIGANA_DELAY },
    },
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run components/motion/splash/tests/variants.test.ts`
Expected: PASS (all tests).

- [ ] **Step 6: Commit**

```bash
git add components/motion/splash/timing.ts components/motion/splash/variants.ts components/motion/splash/tests/variants.test.ts
git commit -m "feat: add splash timing constants and motion variants"
```

---

### Task 3: `SplashItem` reveal primitive

**Files:**
- Create: `components/motion/splash/SplashItem.tsx`
- Test: `components/motion/splash/tests/SplashItem.test.tsx`

**Interfaces:**
- Consumes: `isFreshLoad()` (Task 1); `itemVariants` / `inlineVariants` / `furiganaVariants` (Task 2).
- Produces: `SplashItem` React component.
  - Props: `{ children: React.ReactNode; as?: "div" | "span" | "p" | "li" | "section" | "header" | "h1"; delay?: number; variant?: "item" | "inline" | "furigana"; className?: string }`
  - Behavior: on a fresh load it mounts `hidden` and animates to `visible` (delay from `delay`); otherwise it renders the element at rest (no animation) so the route fade-through owns the transition. Honors `prefers-reduced-motion` via the variant factories.

- [ ] **Step 1: Write the failing test**

```tsx
// components/motion/splash/tests/SplashItem.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

describe("SplashItem", () => {
  beforeEach(() => vi.resetModules());

  it("renders its children in the chosen element", async () => {
    const { SplashItem } = await import("../SplashItem");
    render(<SplashItem as="p">Made in Japan.</SplashItem>);
    expect(screen.getByText("Made in Japan.")).toBeInTheDocument();
  });

  it("renders at rest (no hidden initial) when it is NOT a fresh load", async () => {
    vi.doMock("../splashGate", () => ({ isFreshLoad: () => false, endFreshLoad: () => {} }));
    const { SplashItem } = await import("../SplashItem");
    render(
      <SplashItem as="div" className="beat">
        rest
      </SplashItem>,
    );
    const el = screen.getByText("rest");
    // At rest, framer must not have applied the hidden opacity:0 initial style.
    expect(el.style.opacity).not.toBe("0");
  });

  it("mounts hidden (opacity 0) when it IS a fresh load", async () => {
    vi.doMock("../splashGate", () => ({ isFreshLoad: () => true, endFreshLoad: () => {} }));
    const { SplashItem } = await import("../SplashItem");
    render(
      <SplashItem as="div" className="beat">
        play
      </SplashItem>,
    );
    expect(screen.getByText("play").style.opacity).toBe("0");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/motion/splash/tests/SplashItem.test.tsx`
Expected: FAIL — cannot resolve `../SplashItem`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// components/motion/splash/SplashItem.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { isFreshLoad } from "./splashGate";
import { itemVariants, inlineVariants, furiganaVariants } from "./variants";

type Tag = "div" | "span" | "p" | "li" | "section" | "header" | "h1";

type SplashItemProps = {
  children: React.ReactNode;
  as?: Tag;
  delay?: number;
  variant?: "item" | "inline" | "furigana";
  className?: string;
};

export function SplashItem({
  children,
  as = "div",
  delay = 0,
  variant = "item",
  className,
}: SplashItemProps) {
  const reduce = !!useReducedMotion();
  // Snapshot the gate ONCE during render (before any effects), so client
  // navigations and the gate's post-paint flip never restart an animation.
  const [play] = useState(() => isFreshLoad());
  const Comp = motion[as] as React.ElementType;

  if (!play) {
    return <Comp className={className}>{children}</Comp>;
  }

  const variants =
    variant === "inline"
      ? inlineVariants(reduce, delay)
      : variant === "furigana"
        ? furiganaVariants(reduce, delay)
        : itemVariants(reduce, delay);

  return (
    <Comp className={className} initial="hidden" animate="visible" variants={variants}>
      {children}
    </Comp>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/motion/splash/tests/SplashItem.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/motion/splash/SplashItem.tsx components/motion/splash/tests/SplashItem.test.tsx
git commit -m "feat: add SplashItem reveal primitive"
```

---

### Task 4: Animated logo (stroke-draw)

**Files:**
- Modify: `components/ui/Logo.tsx`
- Test: `components/ui/Logo.test.tsx`

**Interfaces:**
- Consumes: `isFreshLoad()` (Task 1); `LOGO_DRAW_DUR`, `EASE_OUT` (Task 2).
- Produces: `Logo` with a new optional prop `animated?: boolean` (default `false`). When `animated` and a fresh load (and not reduced motion), the mark's strokes draw on via `pathLength: 0 → 1`. When not animated, or not a fresh load, or reduced motion, it renders exactly as today.

- [ ] **Step 1: Write the failing test**

```tsx
// components/ui/Logo.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("renders the nested-squares mark (2 rects, 4 lines) when static", () => {
    const { container } = render(<Logo title="" />);
    expect(container.querySelectorAll("rect")).toHaveLength(2);
    expect(container.querySelectorAll("line")).toHaveLength(4);
  });

  it("keeps the same geometry when animated", () => {
    const { container } = render(<Logo title="" animated />);
    expect(container.querySelectorAll("rect")).toHaveLength(2);
    expect(container.querySelectorAll("line")).toHaveLength(4);
  });

  it("stays accessible-labelled when a title is given", () => {
    const { getByRole } = render(<Logo title="Tanaka's Gallery" animated />);
    expect(getByRole("img", { name: "Tanaka's Gallery" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/ui/Logo.test.tsx`
Expected: FAIL — `animated` prop not yet accepted (TS) / the animated test renders nothing new but the file may not compile against the new prop. (If it passes the static test only, the `animated` test still drives the change.)

- [ ] **Step 3: Write implementation**

```tsx
// components/ui/Logo.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { isFreshLoad } from "@/components/motion/splash/splashGate";
import { LOGO_DRAW_DUR, EASE_OUT } from "@/components/motion/splash/timing";

type LogoProps = {
  /** Rendered width/height in px (the mark is square). */
  size?: number;
  className?: string;
  /** Accessible label; pass an empty string to mark the logo decorative. */
  title?: string;
  /** Draw the strokes on, once, on a fresh document load. */
  animated?: boolean;
};

/**
 * Tanaka Projects mark — nested squares with corner ties.
 * Strokes use `currentColor` so the logo inherits the surrounding text color
 * (adapts to light/dark theme and any placement). Scale via the `size` prop.
 * When `animated` and on a fresh load (and motion is allowed), the strokes
 * draw on via pathLength.
 */
export function Logo({ size = 24, className, title = "Tanaka's Gallery", animated = false }: LogoProps) {
  const decorative = title === "";
  const reduce = !!useReducedMotion();
  const [fresh] = useState(() => isFreshLoad());
  const draw = animated && fresh && !reduce;

  const drawProps = draw
    ? {
        initial: { pathLength: 0 },
        animate: { pathLength: 1 },
        transition: { duration: LOGO_DRAW_DUR, ease: EASE_OUT },
      }
    : {};

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative ? true : undefined}
    >
      <motion.rect x="6" y="6" width="36" height="36" stroke="currentColor" strokeWidth="1.2" {...drawProps} />
      <motion.rect x="15" y="15" width="18" height="18" stroke="currentColor" strokeWidth="1.2" {...drawProps} />
      <motion.line x1="6" y1="6" x2="15" y2="15" stroke="currentColor" strokeWidth="1.2" {...drawProps} />
      <motion.line x1="42" y1="6" x2="33" y2="15" stroke="currentColor" strokeWidth="1.2" {...drawProps} />
      <motion.line x1="6" y1="42" x2="15" y2="33" stroke="currentColor" strokeWidth="1.2" {...drawProps} />
      <motion.line x1="42" y1="42" x2="33" y2="33" stroke="currentColor" strokeWidth="1.2" {...drawProps} />
    </svg>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/ui/Logo.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/ui/Logo.tsx components/ui/Logo.test.tsx
git commit -m "feat: add stroke-draw entrance to the logo mark"
```

---

### Task 5: Navbar staged entrance

**Files:**
- Modify: `components/ui/Nav.tsx`
- Test: `components/ui/Nav.test.tsx`

**Interfaces:**
- Consumes: `Logo` with `animated` (Task 4); `SplashItem` (Task 3); `WORDMARK_DELAY`, `LINK_DELAY`, `LINK_STAGGER` (Task 2).
- Produces: `Nav` (now a client component) whose wordmark and links are `SplashItem`s with navbar-beat delays, and whose logo uses `animated`. Static markup/links unchanged for non-fresh loads.

- [ ] **Step 1: Write the failing test**

```tsx
// components/ui/Nav.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Nav } from "./Nav";

describe("Nav", () => {
  it("links to Works and Artists and shows the wordmark", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: /works/i })).toHaveAttribute("href", "/works");
    expect(screen.getByRole("link", { name: /artists/i })).toHaveAttribute("href", "/artists");
    expect(screen.getByText(/Tanaka/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/ui/Nav.test.tsx`
Expected: PASS for the existing structure is possible — but it drives the regression contract. If it fails, it is because the test file is new and `Nav` must still expose these roles after the rewrite. Proceed to implement and keep it green.

(Note: this is a regression guard; the meaningful new behavior — staged delays — is verified manually. Keep the test green through the rewrite.)

- [ ] **Step 3: Write implementation**

```tsx
// components/ui/Nav.tsx
"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { WORDMARK_DELAY, LINK_DELAY, LINK_STAGGER } from "@/components/motion/splash/timing";
import styles from "./ui.module.css";

export function Nav() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.wordmark}>
        <Logo size={22} title="" className={styles.wordmarkLogo} animated />
        <SplashItem as="span" variant="inline" delay={WORDMARK_DELAY}>
          Tanaka&apos;s Gallery
        </SplashItem>
      </Link>
      <div className={styles.navLinks}>
        <SplashItem as="span" variant="inline" delay={LINK_DELAY}>
          <Link href="/works" className={styles.navLink}>
            Works
          </Link>
        </SplashItem>
        <SplashItem as="span" variant="inline" delay={LINK_DELAY + LINK_STAGGER}>
          <Link href="/artists" className={styles.navLink}>
            Artists
          </Link>
        </SplashItem>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/ui/Nav.test.tsx`
Expected: PASS (1 test). The two nav links and wordmark remain queryable.

- [ ] **Step 5: Commit**

```bash
git add components/ui/Nav.tsx components/ui/Nav.test.tsx
git commit -m "feat: stage the navbar entrance (logo draw, wordmark, links)"
```

---

### Task 6: Home hero + Selected Works beats

**Files:**
- Modify: `app/page.tsx`
- Test: `app/home.test.tsx` (existing — must stay green; add one assertion)

**Interfaces:**
- Consumes: `SplashItem` (Task 3); `beat`, `FURIGANA_DELAY` (Task 2).
- Produces: the home hero fragments (`Art.`, the Japanese run, `San Francisco.`), the subline, and the Selected Works block, each wrapped as meaning-ordered `SplashItem` beats. No change to text content, links, or the `count`.

- [ ] **Step 1: Extend the existing test (failing assertion first)**

Add to `app/home.test.tsx` inside `describe("Home", ...)`:

```tsx
  it("still renders the furigana readings (わ / さ) within the heading", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("わ");
    expect(heading).toHaveTextContent("さ");
  });
```

- [ ] **Step 2: Run test to verify current state**

Run: `npx vitest run app/home.test.tsx`
Expected: the new test PASSES against the current page (readings are present), but it locks the contract before we restructure the markup. (If it fails, the current markup already lacks the readings — it does not; proceed.)

- [ ] **Step 3: Rewrite the page with beats**

```tsx
// app/page.tsx
import Link from "next/link";
import { allWorks } from "@/data/works";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { beat, FURIGANA_DELAY } from "@/components/motion/splash/timing";
import styles from "./home.module.css";

export default function Home() {
  const count = allWorks().length;
  const jpBeat = beat(1);
  return (
    <>
      <section className={styles.hero}>
        <h1 className={styles.tagline}>
          <SplashItem as="span" variant="inline" delay={beat(0)}>
            Art.{" "}
          </SplashItem>
          <SplashItem as="span" variant="inline" delay={jpBeat} className={styles.jp}>
            <span className={styles.ruby}>
              侘
              <SplashItem
                as="span"
                variant="furigana"
                delay={jpBeat + FURIGANA_DELAY}
                className={styles.rt}
              >
                わ
              </SplashItem>
            </span>
            び
            <span className={styles.ruby}>
              寂
              <SplashItem
                as="span"
                variant="furigana"
                delay={jpBeat + FURIGANA_DELAY}
                className={styles.rt}
              >
                さ
              </SplashItem>
            </span>
            び<span className={styles.maru}>。</span>
          </SplashItem>
          <SplashItem as="span" variant="inline" delay={beat(2)} className={styles.sf}>
            San Francisco.
          </SplashItem>
        </h1>
        <SplashItem as="p" delay={beat(3)} className={styles.heroSub}>
          Made in Japan. Curated in SF.
        </SplashItem>
      </section>
      <SplashItem as="section" delay={beat(4)} className={styles.index}>
        <p className={styles.note}>
          <span className={styles.noteHead}>Contemporary art projects.</span>
          <span className={styles.noteSub}>Timeless artists, from Tokyo to the Bay.</span>
        </p>
        <Link href="/works" className={styles.indexLink}>
          View ({count}) Selected Works →
        </Link>
      </SplashItem>
    </>
  );
}
```

Note: `delay={jpBeat + FURIGANA_DELAY}` plus the furigana variant's own `+FURIGANA_DELAY` means the readings settle two `FURIGANA_DELAY` units after the kanji beat — intentional; tune at the manual checkpoint. To settle exactly one unit after, pass `delay={jpBeat}` instead.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run app/home.test.tsx`
Expected: PASS (3 tests — tagline, link, furigana). The `.index` is now a `<section>` via `SplashItem as="section"`, so `styles.index` is preserved.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/home.test.tsx
git commit -m "feat: animate home hero + Selected Works as meaning-ordered beats"
```

---

### Task 7: Artists index header + row beats

**Files:**
- Modify: `app/artists/page.tsx`
- Test: `app/artists/artists-index.test.tsx` (new)

**Interfaces:**
- Consumes: `SplashItem` (Task 3); `CONTENT_START`, `rowDelay` (Task 2).
- Produces: the `Artists` header as one beat and each artist row staggered down the list in reading order. No change to links, text, or data.

- [ ] **Step 1: Write the failing test**

```tsx
// app/artists/artists-index.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ArtistsPage from "./page";
import { allArtists } from "@/data/artists";

describe("Artists index", () => {
  it("renders the heading and one link per artist", () => {
    render(<ArtistsPage />);
    expect(screen.getByRole("heading", { level: 1, name: /artists/i })).toBeInTheDocument();
    const first = allArtists()[0];
    expect(screen.getByRole("link", { name: new RegExp(first.name) })).toHaveAttribute(
      "href",
      `/artists/${first.slug}`,
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/artists/artists-index.test.tsx`
Expected: PASS against the current page is possible (links already exist) — it is a regression guard for the rewrite. Keep it green.

- [ ] **Step 3: Write implementation**

```tsx
// app/artists/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { allArtists } from "@/data/artists";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { CONTENT_START, rowDelay } from "@/components/motion/splash/timing";
import styles from "./artists.module.css";

export const metadata: Metadata = { title: "Artists" };

export default function ArtistsPage() {
  return (
    <>
      <SplashItem as="header" delay={CONTENT_START} className={styles.head}>
        <h1>Artists</h1>
        <p className="subhead">Twenty represented — half Japanese, half Bay Area</p>
      </SplashItem>
      <section className={styles.index}>
        {allArtists().map((a, i) => (
          <SplashItem key={a.slug} as="div" delay={rowDelay(i)}>
            <Link href={`/artists/${a.slug}`} className={styles.row}>
              <span className={styles.name}>{a.name}</span>
              <span className={styles.origin}>
                {a.origin} · b. {a.born}
              </span>
            </Link>
          </SplashItem>
        ))}
      </section>
    </>
  );
}
```

Note: each row Link is wrapped in a `SplashItem` `<div>`; `.row` styling (border-top, flex, hover) stays on the `Link`, so the visual rows are unchanged.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/artists/artists-index.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add app/artists/page.tsx app/artists/artists-index.test.tsx
git commit -m "feat: animate artists index header and rows"
```

---

### Task 8: Works header beat, sort bar beat, and snake lead-delay

**Files:**
- Modify: `app/works/page.tsx`
- Modify: `components/motion/GallerySortBar.tsx`
- Modify: `components/motion/WorkGrid.tsx`
- Test: `app/works/works-page.test.tsx` (new)

**Interfaces:**
- Consumes: `SplashItem` (Task 3); `CONTENT_START`, `SORTBAR_DELAY`, `SNAKE_LEAD_MS` (Task 2); `isFreshLoad()` (Task 1).
- Produces:
  - `/works` header wrapped as one beat.
  - `GallerySortBar` content wrapped as the post-header beat.
  - `WorkGrid` entrance: when this is a fresh-load landing (and not a morph-return), each snake step's WAAPI delay is offset by `SNAKE_LEAD_MS` so the header leads. In-session navigation and morph-return are unchanged.

- [ ] **Step 1: Write the failing test (works page header)**

```tsx
// app/works/works-page.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// GalleryView reads next/navigation hooks; stub them so the RSC page renders in jsdom.
vi.mock("next/navigation", () => ({
  usePathname: () => "/works",
  useRouter: () => ({ replace: () => {} }),
  useSearchParams: () => new URLSearchParams(),
}));

import WorksPage from "./page";

describe("Works page", () => {
  it("renders the Works heading", () => {
    render(<WorksPage />);
    expect(screen.getByRole("heading", { level: 1, name: /works/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails / current state**

Run: `npx vitest run app/works/works-page.test.tsx`
Expected: PASS is possible against the current header — regression guard. (The `<Suspense>` resolves synchronously in jsdom because the mocked `useSearchParams` does not suspend.) Keep green through the rewrite.

- [ ] **Step 3: Wrap the works header**

```tsx
// app/works/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { allWorks } from "@/data/works";
import { GalleryView } from "@/components/motion/GalleryView";
import { GalleryLoading } from "@/components/motion/GalleryLoading";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { CONTENT_START } from "@/components/motion/splash/timing";
import styles from "@/components/motion/styles/grid.module.css";

export const metadata: Metadata = { title: "Works" };

export default function WorksPage() {
  return (
    <>
      <SplashItem as="header" delay={CONTENT_START} className={styles.head}>
        <h1>Works</h1>
      </SplashItem>
      <Suspense fallback={<GalleryLoading />}>
        <GalleryView works={allWorks()} />
      </Suspense>
    </>
  );
}
```

- [ ] **Step 4: Wrap the sort bar as the post-header beat**

Open `components/motion/GallerySortBar.tsx`. It is already a `"use client"` component whose root is `<div className={styles.bar}>` containing the `Sort` label and the Artist/Year/Available-only buttons. Wrap that root in a `SplashItem` so it fades in just under the header on a fresh load. Add the imports:

```tsx
import { SplashItem } from "./splash/SplashItem";
import { SORTBAR_DELAY } from "./splash/timing";
```

The current return opens with `<div className={styles.bar}>` and closes with `</div>`. Change only those two lines:

- Opening: `<div className={styles.bar}>` → `<SplashItem as="div" delay={SORTBAR_DELAY} className={styles.bar}>`
- Closing: the matching `</div>` → `</SplashItem>`

Keep every existing child, prop, and handler (the `Sort` label `<span>`, the three `<button>`s, their `className`/`aria-pressed`/`onClick`) exactly as-is.

- [ ] **Step 5: Add the snake lead-delay in `WorkGrid`**

In `components/motion/WorkGrid.tsx`, add imports near the existing ones:

```tsx
import { useState } from "react"; // extend the existing react import
import { isFreshLoad } from "./splash/splashGate";
import { SNAKE_LEAD_MS } from "./splash/timing";
```

(If `useEffect`/`useRef` are already imported from `react`, add `useState` to that same import statement rather than duplicating it.)

Inside the component, snapshot the gate during render (before the entrance effect):

```tsx
  // Snapshot once: on a fresh document-load landing, the navbar + header lead,
  // so the snake waits SNAKE_LEAD_MS before beginning. Client-nav and reduced
  // motion are unaffected by the snapshot timing.
  const [freshLanding] = useState(() => isFreshLoad());
```

Then, in the existing entrance `useEffect`, compute the lead and add it to BOTH the reduced and full delay expressions. The lead applies only on a fresh-load entrance that is actually playing (i.e. not a morph-return — the effect already early-returns via `consumeGalleryReturn(pathname)` before this point, so any code that runs here is a real entrance):

```tsx
    const lead = freshLanding ? SNAKE_LEAD_MS : 0;
```

- Reduced branch: change `delay: step.index * 60,` to `delay: lead + step.index * 60,`.
- Full branch: change `delay: step.index * 190,` to `delay: lead + step.index * 190,`.

Leave the snake choreography (durations, easing, transforms, snake order, jsdom guard) otherwise untouched.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run app/works/works-page.test.tsx components/motion/tests/WorkGrid.test.tsx components/motion/tests/GallerySortBar.test.tsx`
Expected: PASS — the works header renders; existing `WorkGrid` and `GallerySortBar` behavior is unchanged (the jsdom guard skips `el.animate`, so the lead-delay code path is exercised without throwing).

- [ ] **Step 7: Commit**

```bash
git add app/works/page.tsx components/motion/GallerySortBar.tsx components/motion/WorkGrid.tsx app/works/works-page.test.tsx
git commit -m "feat: lead the works header and sort bar, then the grid snake"
```

---

### Task 9: Full-suite verification

**Files:** none (verification only).

- [ ] **Step 1: Run the entire test suite**

Run: `npm test`
Expected: PASS — all existing tests plus the new splash tests green.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors (warnings acceptable if pre-existing).

- [ ] **Step 3: Production build (type-check + RSC/client boundary check)**

Run: `npm run build`
Expected: build succeeds. This confirms the new `"use client"` boundaries (`Logo`, `Nav`, `SplashItem`) and the server pages importing them compile and that no server component illegally imports client-only APIs.

- [ ] **Step 4: Manual checkpoint (timing tune — TODO(splash-timing))**

Per spec §6, verify by eye with `npm run dev`:
- Hard-refresh `/` → navbar logo draws → wordmark → links; then `Art.` → 侘び寂び (furigana settle) → `San Francisco.` → subline → Selected Works.
- Hard-refresh `/artists` → navbar → header → rows stagger down.
- Hard-refresh `/works` → navbar → `Works` header + sort bar → then the snake.
- Click into a work and back, and navigate between pages via the nav — **no splash replay**; only the 200ms fade-through.
- Toggle OS "reduce motion" → opacity-only everywhere, no logo draw, no furigana settle.

Tune the constants in `components/motion/splash/timing.ts` as needed (this is the `TODO(splash-timing)` checkpoint anchored in the spec).

- [ ] **Step 5: Commit any timing tweaks**

```bash
git add components/motion/splash/timing.ts
git commit -m "chore: tune splash intro timing at manual checkpoint"
```

---

## Self-Review

**Spec coverage:**
- §1 Scope/triggers (Home, /artists, /works; once per document load; client-nav fade-through) → Tasks 1, 6, 7, 8 (gate + page beats).
- §2 Architecture (gate, primitives, timing module, logo draw) → Tasks 1–5 (gate as module singleton per documented deviation; `SplashItem` single primitive per documented deviation).
- §3.1 Navbar staged beats → Tasks 4, 5.
- §3.2 Hero meaning order + furigana settle → Task 6.
- §3.3 /works sequential handoff + snake lead-delay (snake unchanged) → Task 8.
- §3.4 Artists header + row stagger → Task 7.
- §3.5 Reduced motion opacity-only (incl. no logo draw, no furigana settle) → Task 2 variants + Task 4 logo guard; asserted in Task 2 tests.
- §4 Edge handling: FOUC (framer SSR initial), navbar-only on non-splash landings (Logo `animated` only in Nav; pages without `SplashItem` simply don't animate), morph-return untouched (Task 8 relies on the existing `consumeGalleryReturn` early-return) → covered.
- §5 Testing (gate, variants opacity-only, SplashItem play/at-rest, regression renders) → Tasks 1–8 tests; full suite Task 9.
- §6 Manual timing checkpoint → Task 9 Step 4 (TODO(splash-timing)).

**Placeholder scan:** No "TBD"/"implement later". Task 8 Step 4/5 reference the *existing* `GallerySortBar`/`WorkGrid` bodies (which the implementer has open) and give exact wrapper/line edits rather than reprinting unrelated code — the specific strings to change are quoted.

**Type consistency:** `isFreshLoad`/`endFreshLoad` (Task 1) used unchanged in Tasks 3, 4, 8. `itemVariants`/`inlineVariants`/`furiganaVariants(reduce, delay)` signatures (Task 2) match calls in Task 3. `SplashItem` prop set (`as`/`delay`/`variant`/`className`) defined in Task 3 matches every usage in Tasks 5–8. Timing exports (`CONTENT_START`, `beat`, `rowDelay`, `SORTBAR_DELAY`, `SNAKE_LEAD_MS`, `FURIGANA_DELAY`, navbar delays) are each defined in Task 2 and consumed with matching names.
