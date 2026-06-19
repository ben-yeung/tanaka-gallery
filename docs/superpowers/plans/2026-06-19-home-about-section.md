# Home "About" Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a minimal static "About" section to the home page describing Ren Tanaka and his curation, plus an "About" nav link anchoring to it.

**Architecture:** Two changes to existing files only. (1) Insert an anchor nav link in `components/ui/Nav.tsx`. (2) Append an `<section id="about">` to the home page in `app/page.tsx` with styles in `app/home.module.css`. Copy is hard-coded; no route, data model, or assets are added.

**Tech Stack:** Next.js (App Router), React, TypeScript, CSS Modules, Vitest + @testing-library/react.

## Global Constraints

- Copy is verbatim from the spec — no invented biographical details.
- Reuse existing design tokens: `--ink`, `--matcha`, `--stone`, `--gutter`; fonts `--font-serif`, `--font-grotesk`, `--font-sans`.
- Nav link order must be: Works, About, Artists.
- About link href is exactly `/#about`; section id is exactly `about`.
- No new route, no images, no animation, no CMS.
- Run tests with `npm test` (vitest run).

---

### Task 1: About link in the Nav

**Files:**
- Create: `components/ui/Nav.test.tsx`
- Modify: `components/ui/Nav.tsx`

**Interfaces:**
- Consumes: existing `Nav` component (default-less named export `Nav`).
- Produces: nav renders three links in order Works (`/works`), About (`/#about`), Artists (`/artists`).

- [ ] **Step 1: Write the failing test**

Create `components/ui/Nav.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Nav } from "./Nav";

describe("Nav", () => {
  it("links About to the home anchor", () => {
    render(<Nav />);
    const about = screen.getByRole("link", { name: /about/i });
    expect(about).toHaveAttribute("href", "/#about");
  });

  it("orders the section links Works, About, Artists", () => {
    render(<Nav />);
    const labels = screen
      .getAllByRole("link")
      .map((a) => a.textContent?.trim())
      .filter((t): t is string => ["Works", "About", "Artists"].includes(t ?? ""));
    expect(labels).toEqual(["Works", "About", "Artists"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Nav`
Expected: FAIL — no link named "About" found.

- [ ] **Step 3: Add the About link**

In `components/ui/Nav.tsx`, inside `.navLinks`, insert the About link between Works and Artists:

```tsx
      <div className={styles.navLinks}>
        <Link href="/works" className={styles.navLink}>Works</Link>
        <Link href="/#about" className={styles.navLink}>About</Link>
        <Link href="/artists" className={styles.navLink}>Artists</Link>
      </div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- Nav`
Expected: PASS (both tests).

- [ ] **Step 5: Commit**

```bash
git add components/ui/Nav.tsx components/ui/Nav.test.tsx
git commit -m "feat: add About nav link anchoring to /#about"
```

---

### Task 2: About section on the home page

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/home.module.css`
- Modify: `app/home.test.tsx`

**Interfaces:**
- Consumes: existing `styles` import from `./home.module.css` in `app/page.tsx`; existing `.index` section is left unchanged.
- Produces: a `<section id="about">` with an `<h2>About</h2>` heading and five `<p>` paragraphs of verbatim copy, rendered after `.index`.

- [ ] **Step 1: Write the failing test**

Add two cases to the existing `describe("Home", ...)` block in `app/home.test.tsx`:

```tsx
  it("renders the About heading", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: /^about$/i })).toBeInTheDocument();
  });

  it("renders the About copy", () => {
    render(<Home />);
    expect(screen.getByText(/debuted in 2001/i)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- home`
Expected: FAIL — no "About" heading / "debuted in 2001" text found.

- [ ] **Step 3: Add the About section markup**

In `app/page.tsx`, add the section immediately after the closing `</section>` of `.index` (still inside the `<>...</>` fragment):

```tsx
      <section id="about" className={styles.about}>
        <h2 className={styles.aboutHead}>About</h2>
        <p className={styles.aboutLead}>
          Ren Tanaka left Osaka at nineteen with a duffel bag and an admission
          letter from SFAI he wasn&apos;t sure he deserved.
        </p>
        <p className={styles.aboutBody}>
          He spent his twenties absorbing San Francisco: the Japantown shops,
          the Mission murals, and the quiet rigor of Japanese artists he
          discovered in the back rooms of galleries that no longer exist.
        </p>
        <p className={styles.aboutBody}>
          He started buying work before he could afford to, falling in love with
          pieces by obscure artists trying to make a living.
        </p>
        <p className={styles.aboutBody}>
          Tanaka&apos;s Gallery debuted in 2001 in a small San Francisco
          storefront that still smelled like the flower shop it once was.
        </p>
        <p className={styles.aboutBody}>
          Tanaka&apos;s curation brought together artists who reached the same
          conclusion from different directions: that less, done carefully, is
          enough.
        </p>
      </section>
```

- [ ] **Step 4: Add the styles**

Append to `app/home.module.css`:

```css
.about {
  padding: 40px var(--gutter) 96px;
  border-top: 1px solid var(--stone);
}
/* Section title: serif and inked, same scale as the "Tanaka's favorites" head
   but without the matcha underline (this is a heading, not a label). */
.aboutHead {
  font-family: var(--font-serif), serif;
  color: var(--ink);
  font-size: clamp(22px, 3vw, 38px);
  line-height: 1.1;
}
/* Lead: the opening line, set larger in the heading serif to anchor the column. */
.aboutLead {
  margin-top: clamp(20px, 3vh, 36px);
  max-width: 52ch;
  font-family: var(--font-serif), serif;
  color: var(--ink);
  font-size: clamp(20px, 2.6vw, 28px);
  line-height: 1.4;
}
/* Body: the remaining paragraphs, a step down in the grotesk for readability. */
.aboutBody {
  margin-top: 18px;
  max-width: 52ch;
  font-family: var(--font-grotesk), sans-serif;
  color: var(--ink);
  font-size: 17px;
  line-height: 1.6;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- home`
Expected: PASS (existing cases plus the two new About cases).

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/home.module.css app/home.test.tsx
git commit -m "feat: add minimal About section to home page"
```

---

### Task 3: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — all suites green, including Nav and home.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds with no type errors.

---

## Self-Review

**Spec coverage:**
- Placement (section after `.index`, id `about`) → Task 2.
- Nav link between Works and Artists, `/#about` → Task 1.
- Lead + body layout, serif heading scale → Task 2 styles.
- Verbatim five-paragraph copy → Task 2 markup.
- Tests (About heading, copy snippet, nav order/href) → Tasks 1 & 2.
- Out of scope (no route/images/animation/CMS) → respected; only existing files touched.

**Placeholder scan:** none — all steps contain concrete code and commands.

**Type consistency:** class names (`about`, `aboutHead`, `aboutLead`, `aboutBody`)
are used identically in markup (Task 2 Step 3) and CSS (Task 2 Step 4). Nav href
`/#about` matches between Task 1 and the spec.
