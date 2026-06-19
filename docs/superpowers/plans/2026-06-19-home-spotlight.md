# Home Spotlight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an auto-cycling, shuffled work spotlight to the right column of the home page's `.index` section.

**Architecture:** A new `"use client"` component `components/home/Spotlight.tsx` receives a pre-resolved, serializable array of work items from the server component `app/page.tsx`. It shuffles client-side after mount (avoiding hydration mismatch), cross-fades between works on a 5s timer that pauses on hover, and degrades to a single static work under `prefers-reduced-motion`. The `.index` section becomes a two-column grid that stacks on mobile.

**Tech Stack:** Next.js 15 (App Router), React 19, framer-motion 11, CSS Modules, Vitest + Testing Library + jsdom.

## Global Constraints

- Use **CSS variables already defined** in `app/globals.css`: `--paper`, `--ink`, `--matcha`, `--stone`, `--gutter`, and the font vars `--font-serif`, `--font-grotesk` (set by `app/fonts.ts`). Do not hardcode colors.
- Components that use hooks/timers/motion must start with `"use client"`. `app/page.tsx` stays a **server component** — it must not import client-only hooks.
- Follow the existing test style: `vitest` + `@testing-library/react`, files under a `tests/` subfolder named `*.test.tsx` (see `components/motion/tests/`). Test runner: `npm test` (`vitest run`).
- Caption fields, in order: **work title**, **artist name**, **work meta** (`medium · year · dimensions`), **artist bio line**. The middot separator is `·` (U+00B7).
- The spotlight must always show the **work image** — artists are never rendered as their own slide.
- Progress indicator is a **non-interactive typographic counter** `NN / NN` (zero-padded to 2 digits).
- Auto-advance interval: **5000 ms**. Pause while the pointer is over the spotlight. No manual controls.

---

## File Structure

- **Create** `components/home/Spotlight.tsx` — the client component (type + logic + markup).
- **Create** `components/home/Spotlight.module.css` — spotlight styles (frame, caption, counter).
- **Create** `components/home/tests/Spotlight.test.tsx` — component tests.
- **Modify** `app/page.tsx` — build the items array, render `<Spotlight>`, wrap the existing text in a left-column div.
- **Modify** `app/home.module.css` — make `.index` a two-column grid; add `.indexText`; mobile stacking.
- **Modify** `app/home.test.tsx` — assert the spotlight renders (counter + a work-detail link).

---

## Task 1: Spotlight component

**Files:**
- Create: `components/home/Spotlight.tsx`
- Create: `components/home/Spotlight.module.css`
- Test: `components/home/tests/Spotlight.test.tsx`

**Interfaces:**
- Produces:
  - `interface SpotlightItem { slug: string; title: string; image: string; meta: string; artistName: string; artistBio: string }`
  - `function Spotlight(props: { items: SpotlightItem[]; shuffle?: (n: number) => number[] }): JSX.Element | null`
  - The `shuffle` prop defaults to a Fisher–Yates shuffle using `Math.random`. It exists so tests can inject a deterministic order (identity). It takes a length `n` and returns a permutation of `[0..n-1]`.
- Consumes: nothing from other tasks.

**Why a `shuffle` prop:** the real shuffle is random and runs in an effect after mount. Tests pass an identity permutation so the rendered order is deterministic and assertable. Production callers omit it and get the random default.

- [ ] **Step 1: Write the failing test file**

Create `components/home/tests/Spotlight.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react";
import { Spotlight, type SpotlightItem } from "../Spotlight";

// Identity permutation: makes the post-mount shuffle a no-op so order is deterministic.
const identity = (n: number) => Array.from({ length: n }, (_, i) => i);

const items: SpotlightItem[] = [
  { slug: "a", title: "Alpha", image: "/works/a.svg", meta: "ink · 2020 · 1 in", artistName: "Mika Narita", artistBio: "Lines." },
  { slug: "b", title: "Beta", image: "/works/b.svg", meta: "glass · 2023 · 2 in", artistName: "Iris Lund", artistBio: "Cooled fast." },
];

// framer-motion's useReducedMotion reads window.matchMedia; jsdom has none by default
// (treated as "no reduction"). This installs a mock that reports reduced motion ON.
function mockReducedMotion(on: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: on && query.includes("reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

afterEach(() => {
  vi.useRealTimers();
  // Reset matchMedia back to "undefined" (jsdom default) between tests.
  (window as unknown as { matchMedia?: unknown }).matchMedia = undefined;
});

describe("Spotlight", () => {
  it("renders nothing when there are no items", () => {
    const { container } = render(<Spotlight items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the active work's title, artist, meta and bio", () => {
    render(<Spotlight items={items} shuffle={identity} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Mika Narita")).toBeInTheDocument();
    expect(screen.getByText("ink · 2020 · 1 in")).toBeInTheDocument();
    expect(screen.getByText(/Lines\./)).toBeInTheDocument();
  });

  it("shows a zero-padded counter", () => {
    render(<Spotlight items={items} shuffle={identity} />);
    expect(screen.getByText("01 / 02")).toBeInTheDocument();
  });

  it("links the active work to its detail page", () => {
    render(<Spotlight items={items} shuffle={identity} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/works/a");
  });

  it("auto-advances to the next work after the interval", () => {
    vi.useFakeTimers();
    render(<Spotlight items={items} shuffle={identity} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("02 / 02")).toBeInTheDocument();
  });

  it("pauses auto-advance while the pointer is over it", () => {
    vi.useFakeTimers();
    const { container } = render(<Spotlight items={items} shuffle={identity} />);
    const region = container.firstChild as Element;
    fireEvent.pointerEnter(region);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText("Alpha")).toBeInTheDocument(); // unchanged while hovered
    fireEvent.pointerLeave(region);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("does not auto-advance under reduced motion", () => {
    mockReducedMotion(true);
    vi.useFakeTimers();
    render(<Spotlight items={items} shuffle={identity} />);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- Spotlight`
Expected: FAIL — `Cannot find module '../Spotlight'` (file not yet created).

- [ ] **Step 3: Create the component**

Create `components/home/Spotlight.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import styles from "./Spotlight.module.css";

export interface SpotlightItem {
  slug: string;
  title: string;
  image: string;
  meta: string; // "stoneware · 2021 · 9 × 7 × 7 in"
  artistName: string;
  artistBio: string;
}

const ADVANCE_MS = 5000;

// Fisher–Yates: returns a permutation of [0..n-1]. Default order source for production.
function fisherYates(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export function Spotlight({
  items,
  shuffle = fisherYates,
}: {
  items: SpotlightItem[];
  shuffle?: (n: number) => number[];
}) {
  const reduce = useReducedMotion();
  // SSR + first client render use identity order so server/client markup match.
  const [order, setOrder] = useState<number[]>(() => items.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Shuffle once, after mount (client only), to avoid a hydration mismatch.
  useEffect(() => {
    setOrder(shuffle(items.length));
    setIndex(0);
  }, [items.length, shuffle]);

  // Auto-advance — disabled under reduced motion, while hovered, or with <2 items.
  useEffect(() => {
    if (reduce || paused || items.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, ADVANCE_MS);
    return () => clearInterval(id);
  }, [reduce, paused, items.length]);

  if (items.length === 0) return null;

  const active = items[order[index] ?? 0];
  const total = items.length;

  return (
    <div
      className={styles.spotlight}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <Link href={`/works/${active.slug}`} className={styles.link}>
        <div className={styles.frame}>
          {reduce ? (
            <img src={active.image} alt={active.title} className={styles.img} />
          ) : (
            <AnimatePresence initial={false}>
              <motion.img
                key={active.slug}
                src={active.image}
                alt={active.title}
                className={styles.img}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>
          )}
        </div>
        <div className={styles.caption}>
          <p className={styles.title}>{active.title}</p>
          <p className={styles.artist}>{active.artistName}</p>
          <p className={styles.meta}>{active.meta}</p>
          <p className={styles.bio}>“{active.artistBio}”</p>
        </div>
      </Link>
      <p className={styles.counter} aria-hidden="true">
        {pad2(index + 1)} / {pad2(total)}
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Create the stylesheet**

Create `components/home/Spotlight.module.css`:

```css
.spotlight {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.link {
  display: block;
}
/* Relative frame + absolutely-stacked images lets the outgoing/incoming slides
   overlap during the cross-fade without the layout shifting. */
.frame {
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--paper);
  border: 1px solid var(--stone);
  overflow: hidden;
}
.img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.caption {
  margin-top: 14px;
}
.title {
  font-family: var(--font-serif), serif;
  font-size: clamp(18px, 1.8vw, 24px);
  line-height: 1.15;
  color: var(--ink);
}
.artist {
  font-family: var(--font-grotesk), sans-serif;
  letter-spacing: 0.04em;
  font-size: 14px;
  margin-top: 4px;
}
.link:hover .artist {
  color: var(--matcha);
}
.meta {
  font-size: 13px;
  letter-spacing: 0.02em;
  color: var(--stone);
  margin-top: 6px;
}
.bio {
  font-family: var(--font-grotesk), sans-serif;
  font-style: italic;
  font-size: 14px;
  color: var(--stone);
  margin-top: 8px;
}
.counter {
  font-family: var(--font-grotesk), sans-serif;
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--stone);
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- Spotlight`
Expected: PASS — all 7 tests green.

- [ ] **Step 6: Commit**

```bash
git add components/home/Spotlight.tsx components/home/Spotlight.module.css components/home/tests/Spotlight.test.tsx
git commit -m "feat: add cycling home Spotlight component"
```

---

## Task 2: Wire the spotlight into the home page

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/home.module.css`
- Test: `app/home.test.tsx`

**Interfaces:**
- Consumes from Task 1: `Spotlight` and `SpotlightItem` from `@/components/home/Spotlight`.
- Produces: nothing for later tasks (final task).

- [ ] **Step 1: Extend the home test**

Add two assertions to `app/home.test.tsx`. Insert these `it` blocks inside the existing `describe("Home", ...)` block (keep the existing two tests):

```tsx
  it("renders the spotlight counter starting at the first of all works", () => {
    render(<Home />);
    // 12 works in data/works.ts; counter is zero-padded and starts at 01.
    expect(screen.getByText("01 / 12")).toBeInTheDocument();
  });

  it("spotlights a work that links to its detail page", () => {
    render(<Home />);
    const detailLink = screen
      .getAllByRole("link")
      .find((a) => /^\/works\/.+/.test(a.getAttribute("href") ?? ""));
    expect(detailLink).toBeDefined();
  });
```

Note: the spotlight shuffles after mount but resets `index` to 0, so the counter is deterministically `01 / 12`. The specific work is random, so the second test only asserts a `/works/<slug>` link exists.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- home.test`
Expected: FAIL — `Unable to find an element with the text: 01 / 12` (spotlight not wired up yet).

- [ ] **Step 3: Update the home page to render the spotlight**

Replace the entire contents of `app/page.tsx` with:

```tsx
import Link from "next/link";
import { allWorks } from "@/data/works";
import { getArtist } from "@/data/artists";
import { Spotlight, type SpotlightItem } from "@/components/home/Spotlight";
import styles from "./home.module.css";

export default function Home() {
  const works = allWorks();
  const count = works.length;
  const items: SpotlightItem[] = works.map((w) => {
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

  return (
    <>
      <section className={styles.hero}>
        <h1 className={styles.tagline}>
          Art.{" "}
          <span className={styles.jp}>
            <span className={styles.ruby}>
              侘<span className={styles.rt}>わ</span>
            </span>
            び
            <span className={styles.ruby}>
              寂<span className={styles.rt}>さ</span>
            </span>
            び<span className={styles.maru}>。</span>
          </span>
          <span className={styles.sf}>San Francisco.</span>
        </h1>
        <p className={styles.heroSub}>Made in Japan. Curated in SF.</p>
      </section>
      <section className={styles.index}>
        <div className={styles.indexText}>
          <p className={styles.note}>
            <span className={styles.noteHead}>Contemporary art projects.</span>
            <span className={styles.noteSub}>Timeless artists, from Tokyo to the Bay.</span>
          </p>
          <Link href="/works" className={styles.indexLink}>
            View ({count}) Selected Works →
          </Link>
        </div>
        <Spotlight items={items} />
      </section>
    </>
  );
}
```

- [ ] **Step 4: Update the home layout CSS for two columns**

In `app/home.module.css`, replace the existing `.index` rule:

```css
.index {
  /* Grow to fill the height <main> inherits from the viewport, so the slack that
     would otherwise sit below the footer is given to the Selected Works section. */
  flex: 1;
  padding: 40px var(--gutter) 96px;
}
```

with this `.index` plus a new `.indexText` rule:

```css
.index {
  /* Grow to fill the height <main> inherits from the viewport, so the slack that
     would otherwise sit below the footer is given to the Selected Works section. */
  flex: 1;
  padding: 40px var(--gutter) 96px;
  /* Two columns: text/link on the left, spotlight on the right. */
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(32px, 6vw, 96px);
  align-items: start;
}
.indexText {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
```

Then, inside the existing `@media (max-width: 600px)` block in the same file, add a rule that collapses the grid so the spotlight stacks below the text:

```css
  .index {
    grid-template-columns: 1fr;
  }
```

(Source order already puts the text column first, so on mobile the spotlight falls below it.)

- [ ] **Step 5: Run the home tests to verify they pass**

Run: `npm test -- home.test`
Expected: PASS — the two existing tests plus the two new ones (4 total).

- [ ] **Step 6: Run the full suite, lint, and build**

Run: `npm test`
Expected: PASS — entire suite green (no regressions).

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds (verifies the server/client boundary and types).

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx app/home.module.css app/home.test.tsx
git commit -m "feat: render work spotlight in home index section"
```

---

## Self-Review

**Spec coverage** (`docs/superpowers/specs/2026-06-19-home-spotlight-design.md`):
- Two-column `.index`, text left / spotlight right → Task 2 (page markup + CSS grid). ✓
- All works, shuffled client-side after mount, no hydration mismatch → Task 1 (`useState` identity init + shuffle in `useEffect`). ✓
- Caption: title, artist name, meta, bio → Task 1 markup + Task 1 field test. ✓
- Auto-advance 5s, pause on hover → Task 1 interval effect + pointer handlers + tests. ✓
- Cross-fade via `AnimatePresence` → Task 1. ✓
- Reduced motion: no auto-advance, static work, still shuffled → Task 1 `reduce` branch + test. ✓
- Typographic counter `NN / NN`, non-interactive → Task 1 `pad2` counter (`aria-hidden`) + test. ✓
- Spotlight links to `/works/[slug]` → Task 1 `Link` + test. ✓
- Fixed aspect-ratio frame, `object-fit: contain` → Task 1 CSS. ✓
- Mobile stacks below text at `max-width: 600px` → Task 2 media query. ✓
- Empty/single-item edges → Task 1 (`items.length === 0` returns null; `<= 1` disables timer) + empty test. ✓
- `TODO(home-spotlight-featured)` future flag → intentionally **not** built (spec Non-goals). ✓

**Placeholder scan:** No TBD/TODO/"handle errors" placeholders; every code step is complete.

**Type consistency:** `SpotlightItem` fields (`slug`, `title`, `image`, `meta`, `artistName`, `artistBio`) are identical in Task 1's definition, Task 1's test fixtures, and Task 2's `items` mapping. The `shuffle` signature `(n: number) => number[]` matches its default `fisherYates` and the test's `identity`.
