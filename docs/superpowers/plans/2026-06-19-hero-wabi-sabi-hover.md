# Hero Wabi-sabi Hover Effect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hover/tap effect to the hero's `侘び寂び。` kanji that reveals "wabi-sabi." letter by letter with blur+fade and a cursor-depth color gradient, while "San Francisco." slides right to accommodate.

**Architecture:** A new `WabiSabiToggle` client component stacks the kanji and Latin layers in an `inline-grid` and drives all animations via Framer Motion `animate` prop based on a `show: boolean` state. A new `HeroTagline` client component wraps the full `<h1>` so it can own `show` state and animate the "San Francisco." slide — necessary because `app/page.tsx` is a Server Component and cannot hold state.

**Tech Stack:** React 18, Next.js App Router, Framer Motion, Vitest + @testing-library/react, CSS Modules

## Global Constraints

- All animation timings live inline in `WabiSabiToggle.tsx` — do not add new exports to `timing.ts`
- `EASE_OUT` imported from `@/components/motion/splash/timing` (`[0.22, 1, 0.36, 1] as const`)
- `SplashItem`, `variants.ts`, `timing.ts`, and all existing motion infrastructure are **unchanged**
- `app/page.tsx` remains a Server Component — no `"use client"` added
- `aria-hidden="true"` on the Latin letter layer
- Color gradient applies in both normal and reduced-motion modes (it is visual, not motion)

---

## File Map

| File | Status | Responsibility |
|---|---|---|
| `components/home/WabiSabiToggle.tsx` | CREATE | inline-grid container, kanji/letter Framer animations, hover/tap state, color gradient |
| `components/home/WabiSabiToggle.module.css` | CREATE | `.wabiToggle { display: inline-grid; cursor: pointer; }` |
| `components/home/HeroTagline.tsx` | CREATE | `<h1>` tagline, owns `show` state, drives SF slide via outer `motion.span` |
| `components/home/tests/WabiSabiToggle.test.tsx` | CREATE | unit tests |
| `app/home.module.css` | MODIFY | add `display: inline-block` to existing `.sf` rule |
| `app/page.tsx` | MODIFY | replace the `<h1>` block with `<HeroTagline />`, remove `jpBeat` |

---

## Task 1: CSS groundwork

**Files:**
- Modify: `app/home.module.css`
- Create: `components/home/WabiSabiToggle.module.css`

**Interfaces:**
- Produces: `.wabiToggle` class (consumed by Task 2), `.sf` with `display: inline-block` (consumed by Task 3)

- [ ] **Step 1: Add `display: inline-block` to `.sf` in `home.module.css`**

Find the existing `.sf` rule and extend it:

```css
/* "San Francisco." — inline-block so the outer motion.span's translateX applies.
   display: block override in the mobile media query below still wins on small screens. */
.sf {
  display: inline-block;
  white-space: nowrap;
}
```

- [ ] **Step 2: Create `WabiSabiToggle.module.css`**

```css
/* Stacks kanji and Latin layers in the same grid cell.
   cursor: pointer signals interactivity without a role="button". */
.wabiToggle {
  display: inline-grid;
  cursor: pointer;
}
```

- [ ] **Step 3: Commit**

```bash
git add app/home.module.css components/home/WabiSabiToggle.module.css
git commit -m "style: add wabiToggle grid container and sf inline-block"
```

---

## Task 2: `WabiSabiToggle` component + tests

**Files:**
- Create: `components/home/WabiSabiToggle.tsx`
- Create: `components/home/tests/WabiSabiToggle.test.tsx`

**Interfaces:**
- Consumes: `styles.wabiToggle` from `./WabiSabiToggle.module.css`, `EASE_OUT` from `@/components/motion/splash/timing`, `useReducedMotion` from `framer-motion`
- Produces: `export function WabiSabiToggle({ children, onShowChange }: WabiSabiToggleProps)`
  - `children: React.ReactNode` — the kanji JSX tree
  - `onShowChange?: (show: boolean) => void` — called whenever `show` flips

- [ ] **Step 1: Write the failing tests**

```tsx
// components/home/tests/WabiSabiToggle.test.tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WabiSabiToggle } from "../WabiSabiToggle";

afterEach(() => {
  (window as unknown as { matchMedia?: unknown }).matchMedia = undefined;
});

describe("WabiSabiToggle", () => {
  it("renders kanji children", () => {
    render(
      <WabiSabiToggle>
        <span data-testid="kanji">侘び寂び</span>
      </WabiSabiToggle>,
    );
    expect(screen.getByTestId("kanji")).toBeInTheDocument();
  });

  it("renders exactly 10 letter spans for 'wabi-sabi.'", () => {
    const { container } = render(<WabiSabiToggle><span /></WabiSabiToggle>);
    expect(container.querySelectorAll("[data-wabi-letter]")).toHaveLength(10);
  });

  it("marks the latin layer aria-hidden", () => {
    const { container } = render(<WabiSabiToggle><span /></WabiSabiToggle>);
    // The latin layer wraps all letters; it must carry aria-hidden so screen
    // readers skip the animated spans (kanji provides semantic content).
    const hidden = container.querySelector('[aria-hidden="true"]');
    expect(hidden).toBeInTheDocument();
    expect(hidden!.querySelectorAll("[data-wabi-letter]")).toHaveLength(10);
  });

  it("calls onShowChange(true) on mouse pointerenter", () => {
    const onShowChange = vi.fn();
    const { container } = render(
      <WabiSabiToggle onShowChange={onShowChange}><span /></WabiSabiToggle>,
    );
    const toggle = container.firstChild as Element;
    fireEvent.pointerEnter(toggle, { pointerType: "mouse" });
    expect(onShowChange).toHaveBeenCalledWith(true);
  });

  it("calls onShowChange(false) on mouse pointerleave", () => {
    const onShowChange = vi.fn();
    const { container } = render(
      <WabiSabiToggle onShowChange={onShowChange}><span /></WabiSabiToggle>,
    );
    const toggle = container.firstChild as Element;
    fireEvent.pointerEnter(toggle, { pointerType: "mouse" });
    fireEvent.pointerLeave(toggle, { pointerType: "mouse" });
    expect(onShowChange).toHaveBeenLastCalledWith(false);
  });

  it("does not call onShowChange on touch pointerenter (touch uses click)", () => {
    const onShowChange = vi.fn();
    const { container } = render(
      <WabiSabiToggle onShowChange={onShowChange}><span /></WabiSabiToggle>,
    );
    const toggle = container.firstChild as Element;
    fireEvent.pointerEnter(toggle, { pointerType: "touch" });
    expect(onShowChange).not.toHaveBeenCalled();
  });

  it("toggles show on touch tap (pointerdown then click)", () => {
    const onShowChange = vi.fn();
    const { container } = render(
      <WabiSabiToggle onShowChange={onShowChange}><span /></WabiSabiToggle>,
    );
    const toggle = container.firstChild as Element;
    fireEvent.pointerDown(toggle, { pointerType: "touch" });
    fireEvent.click(toggle);
    expect(onShowChange).toHaveBeenCalledWith(true);
    fireEvent.pointerDown(toggle, { pointerType: "touch" });
    fireEvent.click(toggle);
    expect(onShowChange).toHaveBeenLastCalledWith(false);
  });
});
```

- [ ] **Step 2: Run tests — expect all to FAIL**

```bash
npx vitest run components/home/tests/WabiSabiToggle.test.tsx
```

Expected: 6 failures (`WabiSabiToggle` not found).

- [ ] **Step 3: Implement `WabiSabiToggle.tsx`**

```tsx
// components/home/WabiSabiToggle.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { EASE_OUT } from "@/components/motion/splash/timing";
import styles from "./WabiSabiToggle.module.css";

const WABI = "wabi-sabi."; // 10 chars, indices 0–9

// Light mode: cursor deepens toward richer ink-green.
// Dark mode:  cursor lightens toward pale surface glow.
const ACCENT = {
  light: { base: [124, 138, 107] as const, cursor: [70, 82, 54] as const },
  dark:  { base: [140, 155, 122] as const, cursor: [210, 230, 192] as const },
};

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

export type WabiSabiToggleProps = {
  children: React.ReactNode;
  onShowChange?: (show: boolean) => void;
};

export function WabiSabiToggle({ children, onShowChange }: WabiSabiToggleProps) {
  const reduce = !!useReducedMotion();
  const [show, setShow] = useState(false);
  const latinRef = useRef<HTMLSpanElement>(null);
  const lastPtrRef = useRef<string>("mouse");

  const setShowAndNotify = useCallback(
    (next: boolean) => {
      setShow(next);
      onShowChange?.(next);
    },
    [onShowChange],
  );

  const applyGradient = useCallback((clientX: number) => {
    const el = latinRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = clientX - rect.left;
    const radius = rect.width * 0.38;
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark" ||
      (!document.documentElement.hasAttribute("data-theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    const { base, cursor } = isDark ? ACCENT.dark : ACCENT.light;
    el.querySelectorAll<HTMLSpanElement>("[data-wabi-letter]").forEach((letter) => {
      const lr = letter.getBoundingClientRect();
      const lx = lr.left + lr.width / 2 - rect.left;
      const t = Math.max(0, 1 - Math.abs(mx - lx) / radius);
      letter.style.color = `rgb(${lerp(base[0], cursor[0], t)},${lerp(base[1], cursor[1], t)},${lerp(base[2], cursor[2], t)})`;
    });
  }, []);

  const clearGradient = useCallback(() => {
    latinRef.current
      ?.querySelectorAll<HTMLSpanElement>("[data-wabi-letter]")
      .forEach((l) => { l.style.color = ""; });
  }, []);

  // Animation targets — reduced motion drops filter entirely.
  const kanjiVisible = reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" };
  const kanjiHidden  = reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(6px)" };
  const lettrVisible = reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" };
  const lettrHidden  = reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(10px)" };

  return (
    <span
      className={styles.wabiToggle}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setShowAndNotify(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") {
          setShowAndNotify(false);
          clearGradient();
        }
      }}
      onMouseMove={(e) => { if (show) applyGradient(e.clientX); }}
      onPointerDown={(e) => { lastPtrRef.current = e.pointerType; }}
      onClick={() => {
        if (lastPtrRef.current !== "mouse") {
          const next = !show;
          setShowAndNotify(next);
          if (!next) clearGradient();
        }
      }}
    >
      {/* Kanji: exits immediately on show, returns after wabi-sabi. fully exits (0.38s delay) */}
      <motion.span
        style={{ gridArea: "1/1" }}
        animate={show ? kanjiHidden : kanjiVisible}
        transition={
          reduce
            ? { duration: 0.15 }
            : show
              ? { duration: 0.22, ease: EASE_OUT }
              : { duration: 0.28, ease: EASE_OUT, delay: 0.38 }
        }
      >
        {children}
      </motion.span>

      {/* wabi-sabi. letters: left→right blur-in on show, right→left on hide */}
      <span ref={latinRef} style={{ gridArea: "1/1" }} aria-hidden="true">
        {Array.from(WABI).map((ch, i) => (
          <motion.span
            key={i}
            data-wabi-letter=""
            initial={lettrHidden}
            animate={show ? lettrVisible : lettrHidden}
            transition={
              reduce
                ? { duration: 0.15 }
                : show
                  ? { duration: 0.28, ease: EASE_OUT, delay: 0.04 + i * 0.038 }
                  : { duration: 0.18, ease: EASE_OUT, delay: (9 - i) * 0.022 }
            }
            style={{ display: "inline-block" }}
          >
            {ch}
          </motion.span>
        ))}
      </span>
    </span>
  );
}
```

- [ ] **Step 4: Run tests — expect all to PASS**

```bash
npx vitest run components/home/tests/WabiSabiToggle.test.tsx
```

Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add components/home/WabiSabiToggle.tsx components/home/tests/WabiSabiToggle.test.tsx
git commit -m "feat: add WabiSabiToggle component with kanji/letter animations and color gradient"
```

---

## Task 3: `HeroTagline` client component

The `<h1>` must move into a client component so `show` state can drive the "San Francisco." slide. `app/page.tsx` stays a Server Component.

**Files:**
- Create: `components/home/HeroTagline.tsx`

**Interfaces:**
- Consumes: `WabiSabiToggle` (Task 2), `SplashItem`, `EASE_OUT`, `beat` from timing, `home.module.css` classes
- Produces: `export function HeroTagline()` — no props; all timing constants computed internally

- [ ] **Step 1: Create `HeroTagline.tsx`**

```tsx
// components/home/HeroTagline.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { WabiSabiToggle } from "./WabiSabiToggle";
import { beat, EASE_OUT } from "@/components/motion/splash/timing";
import styles from "@/app/home.module.css";

export function HeroTagline() {
  const [show, setShow] = useState(false);
  const jpBeat = beat(1);

  return (
    <h1 className={styles.tagline}>
      <SplashItem as="span" variant="inline" delay={beat(0)}>
        Art.{" "}
      </SplashItem>
      <SplashItem as="span" variant="inline" delay={jpBeat} className={styles.jp}>
        <WabiSabiToggle onShowChange={setShow}>
          <span className={styles.ruby}>
            侘
            <SplashItem as="span" variant="furigana" delay={jpBeat} className={styles.rt}>
              わ
            </SplashItem>
          </span>
          び
          <span className={styles.ruby}>
            寂
            <SplashItem as="span" variant="furigana" delay={jpBeat} className={styles.rt}>
              さ
            </SplashItem>
          </span>
          び<span className={styles.maru}>。</span>
        </WabiSabiToggle>
      </SplashItem>
      {/*
        Outer motion.span drives the SF slide; inner SplashItem handles the splash entrance.
        The two Framer instances animate independent properties (x vs opacity/filter) without
        conflict. display:inline-block on .sf (Task 1) ensures translateX takes effect.
      */}
      <motion.span
        style={{ display: "inline-block" }}
        animate={{ x: show ? "0.18em" : 0 }}
        transition={
          show
            ? { duration: 0.48, ease: EASE_OUT, delay: 0.04 }
            : { duration: 0.38, ease: EASE_OUT }
        }
      >
        <SplashItem as="span" variant="inline" delay={beat(2)} className={styles.sf}>
          San Francisco.
        </SplashItem>
      </motion.span>
    </h1>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/home/HeroTagline.tsx
git commit -m "feat: add HeroTagline client component with SF slide driven by wabi-sabi toggle"
```

---

## Task 4: Wire up `page.tsx` + full test suite

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `HeroTagline` from `@/components/home/HeroTagline`
- The `jpBeat` local variable is removed (moved into HeroTagline)

- [ ] **Step 1: Update `page.tsx`**

Three changes: add `HeroTagline` import, remove `jpBeat` constant, replace the hero `<section>`.
`SplashItem` stays — it's still used on the divider and index sections.

```tsx
// app/page.tsx — full file after changes

import Link from "next/link";
import { allWorks } from "@/data/works";
import { getArtist } from "@/data/artists";
import { Spotlight, type SpotlightItem } from "@/components/home/Spotlight";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { Typewriter } from "@/components/motion/splash/Typewriter";
import { AboutReveal, AboutRevealItem } from "@/components/motion/about/AboutReveal";
import { Underline, Highlight } from "@/components/motion/about/marks";
import {
  beat,
  ITEM_STAGGER,
  typewriterEnd,
  ABOUT_LABEL_DELAY,
  ABOUT_LEAD_DELAY,
  ABOUT_COL_DELAY,
} from "@/components/motion/splash/timing";
import { HeroTagline } from "@/components/home/HeroTagline";
import styles from "./home.module.css";

const SUBHEAD = ["Made in Japan.", "Curated in SF."];

export default function Home() {
  const works = allWorks();
  const count = works.length;
  // jpBeat removed — now internal to HeroTagline
  const worksBeat = (i: number) => typewriterEnd(SUBHEAD, beat(3)) + i * ITEM_STAGGER;
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
        <HeroTagline />
        <Typewriter sentences={SUBHEAD} delay={beat(3)} className={styles.heroSub} />
      </section>
      {/* Divider leads the works reveal so it settles in WITH the section below
          rather than sitting visible from first paint. */}
      <SplashItem
        as="div"
        variant="inline"
        delay={worksBeat(0)}
        className={styles.divider}
        aria-hidden="true"
      />
      <section className={styles.index}>
        <SplashItem as="div" delay={worksBeat(1)} className={styles.indexText}>
          <p className={styles.note}>
            <span className={styles.noteHead}>Tanaka&apos;s favorites.</span>
            <span className={styles.noteSub}>
              Timeless artists, from Tokyo to the Bay.
            </span>
          </p>
          <Link href="/works" className={styles.indexLink}>
            View ({count}) Selected Works →
          </Link>
        </SplashItem>
        <SplashItem as="div" delay={worksBeat(2)} className={styles.spotlightWrap}>
          <Spotlight items={items} />
        </SplashItem>
      </section>
      {/* About sits below the fold: a single useInView trigger (latched once) reveals
          the splash blocks on scroll-into-view, then the underline and highlights draw
          in as a slower emphasis pass. Timing: spec §Choreography. */}
      <AboutReveal id="about" className={styles.about}>
        <AboutRevealItem as="h2" delay={ABOUT_LABEL_DELAY} className={styles.aboutLabel}>
          About
        </AboutRevealItem>
        <AboutRevealItem as="p" delay={ABOUT_LEAD_DELAY} className={styles.aboutLead}>
          <Underline>Ren Tanaka left Osaka at nineteen</Underline> with a duffel bag and
          an admission letter from SFAI he wasn&apos;t sure he deserved.
        </AboutRevealItem>
        <div className={styles.aboutGrid}>
          <AboutRevealItem as="p" delay={ABOUT_COL_DELAY[0]} className={styles.aboutCol}>
            He spent his twenties absorbing San Francisco: the Japantown shops, the
            Mission murals, and the quiet rigor of{" "}
            <Highlight index={0}>Japanese artists</Highlight> he discovered in back rooms
            of galleries that no longer exist.
          </AboutRevealItem>
          <AboutRevealItem as="p" delay={ABOUT_COL_DELAY[1]} className={styles.aboutCol}>
            He started buying work before he could afford to,{" "}
            <Highlight index={1}>falling in love</Highlight> with pieces by obscure
            artists trying to make a living &mdash; artists who had reached the same
            conclusion: that less, done carefully, is more.
          </AboutRevealItem>
          <AboutRevealItem as="p" delay={ABOUT_COL_DELAY[2]} className={styles.aboutCol}>
            Tanaka&apos;s Gallery debuted in 2001 in a small San Francisco storefront
            that still smelled like the <Highlight index={2}>flower shop</Highlight> it
            once was.
          </AboutRevealItem>
        </div>
      </AboutReveal>
    </>
  );
}
```

- [ ] **Step 2: Run the full test suite**

```bash
npx vitest run
```

Expected: all existing tests pass, 6 new WabiSabiToggle tests pass.

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire HeroTagline into homepage, removing inline h1 from page.tsx"
```

---

## Task 5: Manual verification

- [ ] **Step 1: Start the dev server on a free port**

```bash
npm run dev -- --port 3002
```

- [ ] **Step 2: Verify splash intro still plays**

Hard-refresh (`Ctrl+Shift+R`) on `http://localhost:3002`. Confirm:
- "Art." fades in first
- Kanji `侘び寂び。` (with furigana わ / さ) fades in second
- "San Francisco." fades in third
- Subline typewriter fires after

- [ ] **Step 3: Verify hover effect**

Hover over `侘び寂び。`. Confirm:
- Kanji fades out immediately
- "wabi-sabi." letters blur-in left→right
- "San Francisco." slides right
- Color darkens near cursor (light mode) or lightens (dark mode — test via DevTools → Rendering → "Emulate dark scheme")

- [ ] **Step 4: Verify hover-out**

Move cursor off `侘び寂び。`. Confirm:
- Letters blur-out right→left
- "San Francisco." slides back simultaneously
- Kanji fades back in only after last letter has cleared

- [ ] **Step 5: Verify touch (mobile emulation)**

In Chrome DevTools, toggle mobile emulation. Tap the kanji:
- Same reveal as hover-in
- Tap again: same as hover-out

- [ ] **Step 6: Verify reduced motion**

DevTools → Rendering → "Emulate prefers-reduced-motion: reduce". Hard-refresh. Hover:
- No blur on any transition
- Letters all fade in/out together (no stagger)
- SF slide still occurs
- Color gradient still follows cursor

- [ ] **Step 7: Commit if any tuning was needed, then stop the server**

```bash
git add -p   # stage only intentional tuning changes
git commit -m "fix: tune wabi-sabi hover timing after manual verification"
```
