# Artists Pages Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `/artists` and `/artists/[slug]` to match the design language of the works gallery and homepage — haiku subheader, inline Japanese names in list rows, and wider bio text on profiles.

**Architecture:** Three ordered tasks — data model first (adding `nameJa`), then the listing page (haiku header + Japanese names in rows), then the profile bio width. All CSS lives in the existing `artists.module.css`; no new files are created.

**Tech Stack:** Next.js 15, React, Framer Motion (via `SplashItem`), CSS Modules, Vitest + Testing Library

## Global Constraints

- All `nameJa` values use Japanese name order: family name first (e.g. `太田 三郎`, not `三郎 太田`)
- Haiku copy is fixed — do not derive it from data: "From the kiln, from rain / Each mark made before it fades / Ten voices remain."
- Timing constants come from `components/motion/splash/timing.ts` — `CONTENT_START`, `beat`, `rowDelay` — do not inline raw numbers
- No new npm dependencies
- All tests pass via `npm test`

---

### Task 1: Add `nameJa` to the Artist data model

**Files:**
- Modify: `data/types.ts`
- Modify: `data/artists.ts`
- Modify: `data/selectors.test.ts`

**Interfaces:**
- Produces: `Artist.nameJa: string` — consumed by Task 2 (row render) and available on any profile page

---

- [ ] **Step 1: Write the failing test**

Add inside the `"artist selectors"` describe block in `data/selectors.test.ts`:

```ts
it("every artist has a nameJa", () => {
  for (const a of allArtists()) {
    expect(a.nameJa, `${a.slug} is missing nameJa`).toBeTruthy();
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npm test -- data/selectors
```

Expected: FAIL — TypeScript error `Property 'nameJa' does not exist on type 'Artist'`

- [ ] **Step 3: Add `nameJa` to the Artist interface in `data/types.ts`**

```ts
export interface Artist {
  slug: string;
  name: string;
  nameJa: string;  // Japanese script, Japanese name order — e.g. "太田 三郎"
  origin: string;
  born: number;
  bio: string;
}

export interface Work {
  slug: string;
  title: string;
  artistSlug: string;
  year: number;
  medium: string;
  dimensions: string;
  priceCents: number;
  image: string;
  available: boolean;
}
```

- [ ] **Step 4: Populate `nameJa` in `data/artists.ts`**

Replace the `artists` array (keep the selector functions unchanged below it):

```ts
export const artists: Artist[] = [
  { slug: "saburo-ohta",   name: "Saburo Ohta",   nameJa: "太田 三郎", origin: "Imbe, Okayama",    born: 1968, bio: "Wood-fired Bizen. Thrown and left unglazed." },
  { slug: "kenji-mori",    name: "Kenji Mori",    nameJa: "森 健二",   origin: "Hagi, Yamaguchi",  born: 1971, bio: "Hagi ware. The glaze warms with use." },
  { slug: "yuki-hara",     name: "Yuki Hara",     nameJa: "原 由紀",   origin: "Kyoto, Japan",     born: 1980, bio: "Raku. Hand-built, fired fast." },
  { slug: "aiko-tani",     name: "Aiko Tani",     nameJa: "谷 愛子",   origin: "Kanazawa, Japan",  born: 1984, bio: "Watercolor. Mountains losing themselves in mist." },
  { slug: "sora-maeda",    name: "Sora Maeda",    nameJa: "前田 空",   origin: "Matsumoto, Japan", born: 1989, bio: "Watercolor. One season per sheet." },
  { slug: "rei-kobayashi", name: "Rei Kobayashi", nameJa: "小林 怜",   origin: "Nara, Japan",      born: 1976, bio: "Watercolor and gofun. Deer, and the space around them." },
  { slug: "mika-narita",   name: "Mika Narita",   nameJa: "成田 美香", origin: "Kyoto, Japan",     born: 1981, bio: "Ink on paper. Repetition until the line forgets itself." },
  { slug: "jun-asano",     name: "Jun Asano",     nameJa: "浅野 純",   origin: "Tokyo, Japan",     born: 1973, bio: "Sumi-e. The ensō and the breath that draws it." },
  { slug: "haru-sasaki",   name: "Haru Sasaki",   nameJa: "佐々木 春", origin: "Tokyo, Japan",     born: 1979, bio: "Shin-hanga woodblock. Snow on quiet streets." },
  { slug: "emi-takagi",    name: "Emi Takagi",    nameJa: "高木 恵美", origin: "Kyoto, Japan",     born: 1985, bio: "Nihonga. Mineral pigment over gofun, gold ground." },
];
```

- [ ] **Step 5: Run tests to verify they pass**

```
npm test -- data/selectors
```

Expected: PASS — 4 tests (3 existing + 1 new)

- [ ] **Step 6: Commit**

```
git add data/types.ts data/artists.ts data/selectors.test.ts
git commit -m "feat: add nameJa field to Artist type and populate all ten artists"
```

---

### Task 2: `/artists` listing page — haiku header + Japanese names in rows

**Files:**
- Modify: `app/artists/page.tsx`
- Modify: `app/artists/artists.module.css`
- Modify: `app/artists/artists-index.test.tsx`

**Interfaces:**
- Consumes: `Artist.nameJa` from Task 1
- Consumes: `beat`, `CONTENT_START`, `rowDelay` from `components/motion/splash/timing.ts`
  - `beat(i): number` — `CONTENT_START + i * ITEM_STAGGER` (0.9 + i × 0.22 seconds)
  - Haiku line delays: `beat(1)` = 1.12 s, `beat(2)` = 1.34 s, `beat(3)` = 1.56 s

---

- [ ] **Step 1: Write the failing tests**

Replace `app/artists/artists-index.test.tsx`:

```tsx
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

  it("renders all three haiku lines", () => {
    render(<ArtistsPage />);
    expect(screen.getByText("From the kiln, from rain")).toBeInTheDocument();
    expect(screen.getByText("Each mark made before it fades")).toBeInTheDocument();
    expect(screen.getByText("Ten voices remain.")).toBeInTheDocument();
  });

  it("renders the Japanese name for each artist", () => {
    render(<ArtistsPage />);
    for (const a of allArtists()) {
      expect(screen.getByText(a.nameJa)).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Run tests to confirm the two new ones fail**

```
npm test -- artists/artists-index
```

Expected: first test PASS, two new tests FAIL

- [ ] **Step 3: Replace `app/artists/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { allArtists } from "@/data/artists";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { CONTENT_START, rowDelay, beat } from "@/components/motion/splash/timing";
import styles from "./artists.module.css";

export const metadata: Metadata = { title: "Artists" };

export default function ArtistsPage() {
  return (
    <>
      <header className={styles.head}>
        <SplashItem as="h1" delay={CONTENT_START}>Artists</SplashItem>
        <SplashItem as="p" delay={beat(1)} className={styles.haikuLine}>From the kiln, from rain</SplashItem>
        <SplashItem as="p" delay={beat(2)} className={styles.haikuLine}>Each mark made before it fades</SplashItem>
        <SplashItem as="p" delay={beat(3)} className={styles.haikuLine}>Ten voices remain.</SplashItem>
      </header>
      <section className={styles.index}>
        {allArtists().map((a, i) => (
          <SplashItem key={a.slug} as="div" delay={rowDelay(i)}>
            <Link href={`/artists/${a.slug}`} className={styles.row}>
              <span className={styles.nameGroup}>
                <span className={styles.name}>{a.name}</span>
                <span className={styles.nameJa}>{a.nameJa}</span>
              </span>
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

- [ ] **Step 4: Replace `app/artists/artists.module.css`**

```css
.head { padding: 40px var(--gutter) 0; }

.haikuLine {
  display: block;
  font-family: var(--font-grotesk), sans-serif;
  font-size: 14px;
  letter-spacing: 0.04em;
  color: var(--matcha);
  margin-top: 4px;
}

.index { padding: 40px var(--gutter) 96px; }

.row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 18px 0;
  border-top: 1px solid var(--stone);
}
.row:hover .name { color: var(--matcha); }

.nameGroup {
  display: flex;
  align-items: baseline;
  gap: 0.6em;
}
.name { font-family: var(--font-serif), serif; font-size: clamp(22px, 3vw, 34px); }
.nameJa {
  font-family: var(--font-serif), serif;
  font-size: clamp(14px, 1.6vw, 20px);
  color: var(--stone);
}

.origin { font-size: 12px; color: var(--stone); letter-spacing: 0.04em; }

/* Profile page */
.bio { padding: 28px var(--gutter); font-family: var(--font-serif), serif; font-size: clamp(20px, 3vw, 30px); max-width: 26ch; }
.detailMeta { padding: 0 var(--gutter); color: var(--stone); }
```

- [ ] **Step 5: Run all tests**

```
npm test -- artists/artists-index
```

Expected: all three PASS

- [ ] **Step 6: Commit**

```
git add app/artists/page.tsx app/artists/artists.module.css app/artists/artists-index.test.tsx
git commit -m "feat: haiku subheader and inline Japanese names on artists listing page"
```

---

### Task 3: Artist profile — widen bio text

**Files:**
- Modify: `app/artists/artists.module.css`

**Interfaces:**
- No new interfaces — CSS-only change to `.bio`

---

- [ ] **Step 1: Run the existing profile test to confirm baseline**

```
npm test -- artist.test
```

Expected: PASS — 2 tests

- [ ] **Step 2: Update `.bio` in `app/artists/artists.module.css`**

Change `max-width: 26ch` to `max-width: 70%` on the `.bio` rule:

```css
.bio { padding: 28px var(--gutter); font-family: var(--font-serif), serif; font-size: clamp(20px, 3vw, 30px); max-width: 70%; }
```

- [ ] **Step 3: Run the profile test to confirm nothing broke**

```
npm test -- artist.test
```

Expected: PASS — 2 tests

- [ ] **Step 4: Run the full test suite**

```
npm test
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```
git add app/artists/artists.module.css
git commit -m "fix: widen artist profile bio from 26ch to 70% to match homepage lead width"
```
