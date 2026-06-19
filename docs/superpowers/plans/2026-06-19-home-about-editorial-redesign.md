# Home "About" Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reformat the home `#about` section from a single-column wall of text into a full-width editorial layout (wide serif lead + three-column body) with a drawn underline on the lead and three highlight wipes that ride on the existing staggered reveal as a slower storytelling pass.

**Architecture:** A single in-view trigger (`useInView` on the section, latched once) is provided via React context to every animated child, so all delays are measured from one moment — the section entering view — instead of per-element scroll position or nested stagger propagation. Splash blocks (label, lead, columns) reuse the existing `itemVariants` rise-in; two new emphasis marks (`Underline`, `Highlight`) animate a colored layer with a shared left→right `scaleX` "wipe." All timing lives as constants in the existing splash `timing.ts`.

**Tech Stack:** Next.js 15 (App Router), React 19, framer-motion 11, CSS Modules, Vitest + Testing Library (jsdom).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-06-19-home-about-editorial-redesign-design.md` is the source of truth for copy, layout, and the choreography timing table.
- Reduced motion (`prefers-reduced-motion`): no rise translate/blur, no underline draw, no highlight wipe — everything fades in (opacity-only) and the underline/highlights render already drawn. Match the existing convention in `components/motion/splash/variants.ts`.
- Colors via tokens only: `var(--matcha)`, `var(--ink)`, `var(--stone)`, `var(--font-serif)`, `var(--font-grotesk)`. The highlight wash alpha is `rgba(124, 138, 107, 0.24)` (the matcha RGB, the "taller + lighter" value landed during design).
- Copy is verbatim from the spec. Apostrophes in JSX text MUST be written `&apos;` and em dashes `&mdash;` (the project's ESLint config flags unescaped entities — see existing `app/page.tsx`).
- Emphasis always *follows* its text: the underline begins after the lead settles; the highlights begin after the splash has landed. The two tuned-and-approved values are the highlight wipe duration (`1.05s`) and the highlight stagger (`0.65s`).
- Tests run with `npm test` (`vitest run`). The jsdom env stubs `IntersectionObserver` (callback never fires), so in tests reveal elements stay in the "hidden" state but their text is still in the DOM.

---

### Task 1: About choreography timing constants

**Files:**
- Modify: `components/motion/splash/timing.ts` (append a new "Home About section" block)
- Test: `components/motion/about/tests/aboutTiming.test.ts` (create)

**Interfaces:**
- Consumes: nothing new (sits alongside existing `EASE_OUT`, `ITEM_DUR`).
- Produces: `ABOUT_LABEL_DELAY: number`, `ABOUT_LEAD_DELAY: number`, `ABOUT_COL_DELAY: readonly [number, number, number]`, `ABOUT_UNDERLINE_DELAY: number`, `ABOUT_UNDERLINE_DUR: number`, `ABOUT_HL_START: number`, `ABOUT_HL_STAGGER: number`, `ABOUT_HL_DUR: number`, `ABOUT_HL_EASE: readonly [number, number, number, number]`, `aboutHighlightDelay(i: number): number`.

- [ ] **Step 1: Write the failing test**

Create `components/motion/about/tests/aboutTiming.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  ABOUT_LEAD_DELAY,
  ABOUT_COL_DELAY,
  ABOUT_UNDERLINE_DELAY,
  ABOUT_HL_START,
  ABOUT_HL_STAGGER,
  aboutHighlightDelay,
} from "../../splash/timing";

describe("about choreography timing", () => {
  it("highlight delays advance by the highlight stagger", () => {
    expect(aboutHighlightDelay(0)).toBe(ABOUT_HL_START);
    expect(aboutHighlightDelay(1)).toBeCloseTo(ABOUT_HL_START + ABOUT_HL_STAGGER);
    expect(aboutHighlightDelay(2)).toBeGreaterThan(aboutHighlightDelay(1));
  });

  it("emphasis follows its text: underline after the lead, highlights after the splash", () => {
    expect(ABOUT_UNDERLINE_DELAY).toBeGreaterThanOrEqual(ABOUT_LEAD_DELAY);
    expect(aboutHighlightDelay(0)).toBeGreaterThan(ABOUT_COL_DELAY[2]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- aboutTiming`
Expected: FAIL — `aboutHighlightDelay`/constants are not exported from `timing.ts`.

- [ ] **Step 3: Add the constants**

Append to the end of `components/motion/splash/timing.ts`:

```ts
// Home "About" editorial section. Splash blocks reuse ITEM_DUR/EASE_OUT above; these
// are the section-relative delays (seconds from the section entering view) and the
// emphasis (underline draw / highlight wipe) timing. See
// docs/superpowers/specs/2026-06-19-home-about-editorial-redesign-design.md §Choreography.
export const ABOUT_LABEL_DELAY = 0;
export const ABOUT_LEAD_DELAY = 0.22;
export const ABOUT_COL_DELAY = [0.66, 0.88, 1.1] as const; // cols 1, 2, 3 rise-in
export const ABOUT_UNDERLINE_DELAY = 1.0; // underline draws as the lead settles
export const ABOUT_UNDERLINE_DUR = 0.7;
export const ABOUT_HL_START = 1.8; // first highlight begins, after the splash lands
export const ABOUT_HL_STAGGER = 0.65; // gap between highlight wipes (tuned/approved)
export const ABOUT_HL_DUR = 1.05; // each highlight's wipe (tuned/approved)
export const ABOUT_HL_EASE = [0.4, 0, 0.2, 1] as const; // gentle ease for the wash

// The i-th body highlight's absolute delay (i = 0,1,2 → cols 1,2,3).
export const aboutHighlightDelay = (i: number): number =>
  ABOUT_HL_START + i * ABOUT_HL_STAGGER;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- aboutTiming`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/motion/splash/timing.ts components/motion/about/tests/aboutTiming.test.ts
git commit -m "feat: add About section choreography timing constants"
```

---

### Task 2: The shared `wipeVariants` factory

**Files:**
- Create: `components/motion/about/aboutVariants.ts`
- Test: `components/motion/about/tests/aboutVariants.test.ts`

**Interfaces:**
- Consumes: `Variants` type from `framer-motion`.
- Produces: `wipeVariants(reduce: boolean, delay: number, duration: number, ease: readonly number[]): Variants` — `hidden: { scaleX: 0 }`, `visible: { scaleX: 1, transition }`. Under reduced motion both states are `{ scaleX: 1 }` (already drawn, no animation).

- [ ] **Step 1: Write the failing test**

Create `components/motion/about/tests/aboutVariants.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { wipeVariants } from "../aboutVariants";
import { EASE_OUT } from "../../splash/timing";

describe("wipeVariants", () => {
  it("wipes scaleX 0 → 1 with the given delay and duration", () => {
    const v = wipeVariants(false, 1.8, 1.05, EASE_OUT);
    expect(v.hidden).toMatchObject({ scaleX: 0 });
    expect(v.visible).toMatchObject({ scaleX: 1 });
    const t = (v.visible as { transition: { delay: number; duration: number } }).transition;
    expect(t.delay).toBe(1.8);
    expect(t.duration).toBe(1.05);
  });

  it("renders already-drawn (scaleX 1, no animation) under reduced motion", () => {
    const v = wipeVariants(true, 1.8, 1.05, EASE_OUT);
    expect(v.hidden).toEqual({ scaleX: 1 });
    expect(v.visible).toEqual({ scaleX: 1 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- aboutVariants`
Expected: FAIL — `Cannot find module '../aboutVariants'`.

- [ ] **Step 3: Write the factory**

Create `components/motion/about/aboutVariants.ts`:

```ts
import type { Variants } from "framer-motion";

// A left→right "wipe" shared by the lead underline (a thin bar) and the body
// highlights (a translucent wash): the colored layer scales in X from 0 to 1 with its
// origin pinned left. Reduced motion: the layer renders already-drawn (scaleX 1, no
// animation), mirroring the splash's opacity-only reduced behavior.
export function wipeVariants(
  reduce: boolean,
  delay: number,
  duration: number,
  ease: readonly number[],
): Variants {
  if (reduce) {
    return { hidden: { scaleX: 1 }, visible: { scaleX: 1 } };
  }
  return {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration, ease: ease as number[], delay } },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- aboutVariants`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/motion/about/aboutVariants.ts components/motion/about/tests/aboutVariants.test.ts
git commit -m "feat: add wipeVariants for About underline/highlight"
```

---

### Task 3: `AboutReveal` provider + `AboutRevealItem` splash block

**Files:**
- Create: `components/motion/about/AboutReveal.tsx`
- Test: `components/motion/about/tests/AboutReveal.test.tsx`

**Interfaces:**
- Consumes: `itemVariants` from `components/motion/splash/variants.ts` (existing — `itemVariants(reduce: boolean, delay?: number): Variants`).
- Produces:
  - `AboutInViewContext: React.Context<boolean>` — true once the section has entered view (latched).
  - `AboutReveal({ children, id?, className? })` — a `<section>` that owns the single `useInView` trigger and provides it via context.
  - `AboutRevealItem({ children, as?, delay?, className? })` — a `motion[as]` block that rises/deblurs/fades in when the context flips true, at its own `delay`. `as` ∈ `"div" | "p" | "h2" | "span"`, default `"div"`.

- [ ] **Step 1: Write the failing test**

Create `components/motion/about/tests/AboutReveal.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AboutReveal, AboutRevealItem } from "../AboutReveal";

describe("AboutReveal", () => {
  it("renders the section with its id and a heading child", () => {
    render(
      <AboutReveal id="about" className="about">
        <AboutRevealItem as="h2">About</AboutRevealItem>
      </AboutReveal>,
    );
    expect(screen.getByRole("heading", { name: /^about$/i })).toBeInTheDocument();
  });

  it("renders a reveal item's children in the chosen element", () => {
    render(
      <AboutRevealItem as="p" className="lead">
        Lead copy
      </AboutRevealItem>,
    );
    const el = screen.getByText("Lead copy");
    expect(el.tagName).toBe("P");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- AboutReveal`
Expected: FAIL — `Cannot find module '../AboutReveal'`.

- [ ] **Step 3: Write the component**

Create `components/motion/about/AboutReveal.tsx`:

```tsx
"use client";

import { createContext, useContext, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { itemVariants } from "../splash/variants";

type Tag = "div" | "p" | "h2" | "span";

// True once the section has scrolled into view. Latched (once:true) so it never
// flips back, and read by every animated child so all delays share one zero point.
export const AboutInViewContext = createContext(false);

// Section wrapper owning the single viewport trigger. once:true never re-hides;
// amount:0.2 fires as the reader arrives (matches the retired ScrollReveal).
export function AboutReveal({
  children,
  id,
  className,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <section ref={ref} id={id} className={className}>
      <AboutInViewContext.Provider value={inView}>{children}</AboutInViewContext.Provider>
    </section>
  );
}

// A splash block (label, lead, or a body column) that rises/deblurs/fades in when the
// section enters view, at its own section-relative delay. Reuses the splash
// itemVariants so it shares the homepage rise-in (opacity-only under reduced motion).
export function AboutRevealItem({
  children,
  as = "div",
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  as?: Tag;
  delay?: number;
  className?: string;
}) {
  const reduce = !!useReducedMotion();
  const inView = useContext(AboutInViewContext);
  const Comp = motion[as] as React.ElementType;
  return (
    <Comp
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={itemVariants(reduce, delay)}
    >
      {children}
    </Comp>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- AboutReveal`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/motion/about/AboutReveal.tsx components/motion/about/tests/AboutReveal.test.tsx
git commit -m "feat: add AboutReveal context provider and reveal item"
```

---

### Task 4: `Underline` + `Highlight` emphasis marks

**Files:**
- Create: `components/motion/about/marks.tsx`
- Create: `components/motion/about/marks.module.css`
- Test: `components/motion/about/tests/marks.test.tsx`

**Interfaces:**
- Consumes: `AboutInViewContext` (Task 3), `wipeVariants` (Task 2), and from `timing.ts` (Task 1): `EASE_OUT`, `ABOUT_UNDERLINE_DELAY`, `ABOUT_UNDERLINE_DUR`, `ABOUT_HL_DUR`, `ABOUT_HL_EASE`, `aboutHighlightDelay`.
- Produces:
  - `Underline({ children, className? })` — wraps the lead's opening clause; a matcha bar draws left→right after the lead settles.
  - `Highlight({ children, index, className? })` — wraps a body phrase; a translucent wash wipes in. `index` ∈ `0 | 1 | 2` selects the staggered delay for cols 1–3.

- [ ] **Step 1: Write the failing test**

Create `components/motion/about/tests/marks.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Underline, Highlight } from "../marks";

describe("about marks", () => {
  it("Underline renders its clause text", () => {
    render(<Underline>Ren Tanaka left Osaka at nineteen</Underline>);
    expect(screen.getByText("Ren Tanaka left Osaka at nineteen")).toBeInTheDocument();
  });

  it("Highlight renders its phrase text", () => {
    render(<Highlight index={0}>Japanese artists</Highlight>);
    expect(screen.getByText("Japanese artists")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- marks`
Expected: FAIL — `Cannot find module '../marks'`.

- [ ] **Step 3: Write the styles and component**

Create `components/motion/about/marks.module.css`:

```css
/* Lead underline: a 2px matcha bar pinned under the clause, scaled in by Framer
   (scaleX 0→1 from the left). transform-origin lives here; Framer drives transform. */
.bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -3px;
  height: 2px;
  background: var(--matcha);
  transform-origin: left center;
}
/* Body highlight: a translucent matcha wash behind the phrase, occupying the lower
   ~70% of the line (taller + lighter — the values tuned during design). Scaled in by
   Framer the same way as the bar; the phrase text paints above it (see .text). */
.wash {
  position: absolute;
  left: -0.06em;
  right: -0.06em;
  top: 30%;
  bottom: 0;
  background: rgba(124, 138, 107, 0.24);
  transform-origin: left center;
}
/* Relative so the phrase stacks above its (earlier-sibling, absolutely-positioned) wash. */
.text {
  position: relative;
}
```

Create `components/motion/about/marks.tsx`:

```tsx
"use client";

import { useContext } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AboutInViewContext } from "./AboutReveal";
import { wipeVariants } from "./aboutVariants";
import {
  EASE_OUT,
  ABOUT_UNDERLINE_DELAY,
  ABOUT_UNDERLINE_DUR,
  ABOUT_HL_DUR,
  ABOUT_HL_EASE,
  aboutHighlightDelay,
} from "../splash/timing";
import styles from "./marks.module.css";

// The lead's opening clause with a matcha bar that draws left→right once the lead has
// settled. The clause is expected to sit on one line (the lead is wide); if it wraps,
// the bar spans the clause's bounding box — an acceptable approximation for a
// decorative mark. whiteSpace:nowrap keeps the clause from breaking mid-phrase.
export function Underline({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = !!useReducedMotion();
  const inView = useContext(AboutInViewContext);
  return (
    <span className={className} style={{ position: "relative", whiteSpace: "nowrap" }}>
      {children}
      <motion.span
        aria-hidden="true"
        className={styles.bar}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={wipeVariants(reduce, ABOUT_UNDERLINE_DELAY, ABOUT_UNDERLINE_DUR, EASE_OUT)}
      />
    </span>
  );
}

// A body phrase with a translucent matcha wash that wipes in left→right as its own
// storytelling beat. `index` (0,1,2) selects the staggered delay for cols 1–3.
export function Highlight({
  children,
  index,
  className,
}: {
  children: React.ReactNode;
  index: number;
  className?: string;
}) {
  const reduce = !!useReducedMotion();
  const inView = useContext(AboutInViewContext);
  return (
    <span className={className} style={{ position: "relative", whiteSpace: "nowrap" }}>
      <motion.span
        aria-hidden="true"
        className={styles.wash}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={wipeVariants(reduce, aboutHighlightDelay(index), ABOUT_HL_DUR, ABOUT_HL_EASE)}
      />
      <span className={styles.text}>{children}</span>
    </span>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- marks`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/motion/about/marks.tsx components/motion/about/marks.module.css components/motion/about/tests/marks.test.tsx
git commit -m "feat: add Underline and Highlight emphasis marks"
```

---

### Task 5: Wire the new About section into the home page

**Files:**
- Modify: `app/page.tsx` (replace the `#about` block and its imports; drop the unused `ABOUT_BODY`)
- Modify: `app/home.module.css` (replace `.aboutHead`/`.aboutLead`/`.aboutBody` with the new editorial styles; extend the mobile media query)
- Modify: `app/home.test.tsx` (add assertions for the new copy + emphasized phrases)
- Modify: `test/setup.ts` (update the comment that names `ScrollReveal`)
- Delete: `components/motion/ScrollReveal.tsx` (dead after this task — only the About block used it)

**Interfaces:**
- Consumes: `AboutReveal`, `AboutRevealItem` (Task 3), `Underline`, `Highlight` (Task 4), and `ABOUT_LABEL_DELAY`, `ABOUT_LEAD_DELAY`, `ABOUT_COL_DELAY` (Task 1).
- Produces: the rendered `#about` section (the feature's user-facing deliverable).

- [ ] **Step 1: Write the failing tests**

In `app/home.test.tsx`, add these inside the existing `describe("Home", ...)` block (keep the existing "renders the About heading" and "renders the About copy" tests as-is):

```tsx
  it("renders the re-flowed closing line", () => {
    render(<Home />);
    expect(screen.getByText(/less, done carefully, is more/i)).toBeInTheDocument();
  });

  it("renders the underlined lead clause", () => {
    render(<Home />);
    expect(screen.getByText("Ren Tanaka left Osaka at nineteen")).toBeInTheDocument();
  });

  it("renders the three highlighted body phrases", () => {
    render(<Home />);
    expect(screen.getByText("Japanese artists")).toBeInTheDocument();
    expect(screen.getByText("falling in love")).toBeInTheDocument();
    expect(screen.getByText("flower shop")).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- home`
Expected: FAIL — e.g. "Unable to find an element with the text: Ren Tanaka left Osaka at nineteen" (it currently lives in one unsplit string, and the new closing line text "is more" / phrase wrappers don't exist yet).

- [ ] **Step 3: Replace the About styles**

In `app/home.module.css`, delete the `.aboutHead`, `.aboutLead`, and `.aboutBody` rules (keep the `.about` rule — its padding, `border-top`, and `scroll-margin-top` are unchanged) and add in their place:

```css
/* Section kicker: the <h2> "About" kept for semantics but set as a small uppercase
   grotesk label (not the former serif heading). */
.aboutLabel {
  font-family: var(--font-grotesk), sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  font-weight: 600;
  color: var(--stone);
}
/* Lead: the opening line, serif and inked, held to 75% width so it spans wide above
   the columns without running the full measure. Carries the underline emphasis. */
.aboutLead {
  margin-top: clamp(16px, 2.4vh, 28px);
  width: 75%;
  font-family: var(--font-serif), serif;
  color: var(--ink);
  font-size: clamp(22px, 2.8vw, 31px);
  line-height: 1.3;
}
/* Body: three equal columns across the full section width. */
.aboutGrid {
  margin-top: clamp(28px, 4vh, 40px);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: clamp(28px, 3vw, 36px);
}
.aboutCol {
  font-family: var(--font-grotesk), sans-serif;
  color: var(--ink);
  font-size: 17px;
  line-height: 1.6;
}
```

Then, inside the existing `@media (max-width: 600px) { ... }` block (the one that already sets `.hero`, `.tagline`, `.sf`, `.index`), add:

```css
  .aboutLead {
    width: 100%;
  }
  .aboutGrid {
    grid-template-columns: 1fr;
    gap: 22px;
  }
```

- [ ] **Step 4: Rewrite the About block in `app/page.tsx`**

In `app/page.tsx`:

a) Replace the splash/ScrollReveal import lines. Remove:

```tsx
import { ScrollReveal, ScrollRevealItem } from "@/components/motion/ScrollReveal";
```

and add (next to the other `@/components/motion` imports):

```tsx
import { AboutReveal, AboutRevealItem } from "@/components/motion/about/AboutReveal";
import { Underline, Highlight } from "@/components/motion/about/marks";
import {
  ABOUT_LABEL_DELAY,
  ABOUT_LEAD_DELAY,
  ABOUT_COL_DELAY,
} from "@/components/motion/splash/timing";
```

b) Delete the now-unused `ABOUT_BODY` constant (the whole `const ABOUT_BODY = [ ... ];` block and its preceding comment).

c) Replace the entire `<ScrollReveal as="section" id="about" ...> ... </ScrollReveal>` block (and its preceding `{/* About sits below the fold ... */}` comment) with:

```tsx
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
```

- [ ] **Step 5: Remove the dead `ScrollReveal` and fix the setup comment**

Delete the file `components/motion/ScrollReveal.tsx`:

```bash
git rm components/motion/ScrollReveal.tsx
```

In `test/setup.ts`, update the comment on lines 3–5 so it no longer names the removed component. Replace:

```ts
// jsdom has no IntersectionObserver, which framer-motion's `whileInView` (used by
// ScrollReveal) instantiates on mount. Stub it so components that observe the viewport
// render without throwing; the callback is never fired in tests.
```

with:

```ts
// jsdom has no IntersectionObserver, which framer-motion's `useInView` / `whileInView`
// (used by AboutReveal and the splash) instantiates on mount. Stub it so components that
// observe the viewport render without throwing; the callback is never fired in tests.
```

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: PASS — all suites, including the existing `app/home.test.tsx` About tests (`/^about$/i` heading, `/debuted in 2001/i`) and the three new ones, plus `Nav.test.tsx`, the splash/about unit tests, and `selectors`. No test imports the deleted `ScrollReveal`.

- [ ] **Step 7: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no type errors; no ESLint errors (in particular no `react/no-unescaped-entities` from the new copy).

- [ ] **Step 8: Commit**

```bash
git add app/page.tsx app/home.module.css app/home.test.tsx test/setup.ts
git commit -m "feat: editorial About section with animated underline and highlights"
```

---

## Self-Review

**Spec coverage:**
- Layout (full-width kicker + 75% serif lead + 3-col body, mobile collapse) → Task 5 (CSS + page).
- Re-flowed copy ("is more", philosophy closing col 2, standalone 2001 line) → Task 5 (page) + tests.
- Underline on "Ren Tanaka left Osaka at nineteen" (scaleX draw) → Task 4 (`Underline`) + Task 1 timing + Task 2 wipe.
- Highlights on "Japanese artists" / "falling in love" / "flower shop" (wipe, ~1.05s, ~0.65s stagger) → Task 4 (`Highlight`) + Task 1 (`aboutHighlightDelay`).
- Splash reuse + single in-view trigger → Task 3 (`AboutReveal`/`AboutRevealItem`, reuses `itemVariants`).
- Choreography timing table → Task 1 constants, consumed in Tasks 3–5.
- Reduced motion (fade-only, marks already drawn) → `itemVariants` (existing, reused) + `wipeVariants` reduced branch (Task 2).
- Tests (heading, `/debuted in 2001/`, new closing line, emphasized phrases) → Task 5.

**Placeholder scan:** No TBD/TODO/"handle edge cases"/"similar to" — every code step shows full content. The spec's `TODO(about-emphasis)` fallback note intentionally stays in the spec (its anchor); this plan implements the recommended single-trigger path directly, so no in-code TODO is carried.

**Type consistency:** `wipeVariants(reduce, delay, duration, ease)` signature is identical in Task 2's definition and both Task 4 call sites. `AboutInViewContext` exported in Task 3, imported in Task 4. `aboutHighlightDelay(i)`, `ABOUT_COL_DELAY` (tuple), and the `ABOUT_*` constants are defined in Task 1 and consumed with matching names in Tasks 4–5. `Highlight`'s `index` is a `number` consumed as `0|1|2` at the call sites.

## Manual Verification (post-implementation checkpoint)

Run `npm run dev`, scroll the homepage to the About section (or load `/#about`), and check against the spec's choreography table:
1. Splash lands first: label → lead → columns left→right.
2. The underline draws left→right under "Ren Tanaka left Osaka at nineteen" as the lead settles (~1.0s).
3. The three highlights wipe in left→right, one at a time, ~0.65s apart, well after the columns settle — reading as a storytelling pass, not a quick flush.
4. With OS "reduce motion" on: everything fades in; underline and highlights appear already drawn.
5. Narrow the viewport below 600px: lead goes full width, columns stack to one.

These are the two tuned values to confirm by eye and nudge in `timing.ts` if needed: `ABOUT_HL_DUR` (1.05) and `ABOUT_HL_STAGGER` (0.65).
