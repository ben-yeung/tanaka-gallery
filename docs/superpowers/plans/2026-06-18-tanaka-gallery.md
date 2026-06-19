# Tanaka Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clean, minimal portfolio + sales mockup for the fictional gallery "Tanaka Projects" — a hybrid 2003-disciplined / quietly-warm aesthetic with light/dark theming, four page types, one signature image-morph transition, and a Stripe checkout running strictly in test mode.

**Architecture:** Next.js App Router. Server Components own structure/data/content (gallery data is static, typed TS modules); motion and Stripe are quarantined into small Client Component islands. The signature grid→detail transition is a FLIP morph driven by Framer Motion imperative controls (capture the clicked tile's rect, animate the full-bleed detail image from it). Checkout uses a single Route Handler that creates a test-mode Stripe PaymentIntent, with a hard guard that refuses any non-test key.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5, Framer Motion 11, Stripe (`stripe` 17 server + `@stripe/stripe-js` 4 / `@stripe/react-stripe-js` 2 client), CSS Modules + a token-based `globals.css`. Testing: Vitest 2 + React Testing Library 16 + jsdom.

## Global Constraints

- **Mockup only.** No production backend, CMS, database, or auth. Static typed data is the single source of truth.
- **Stripe is test-mode only.** Only `sk_test_…` / `pk_test_…` keys, ever. A runtime guard (`assertTestMode`) must throw if the secret key does not start with `sk_test_`. No live keys in this repo, ever. Real fulfillment/webhooks are explicitly out of scope — see `TODO(stripe-integration)`.
- **No color literals in components.** Components read CSS custom properties only (`var(--paper)`, `var(--ink)`, `var(--matcha)`, `var(--stone)`). Theme switching is via `prefers-color-scheme` only (no manual toggle in this build — see `TODO(theme-toggle)`).
- **Three type roles:** EB Garamond = serif headers/titles/tagline; Space Grotesk = subheaders/section labels; Inter = body/UI/metadata. Exposed as `--font-serif`, `--font-grotesk`, `--font-sans`.
- **Palette (light / dark):** `--paper` `#F4F1EA`/`#1C1E1F`; `--ink` `#1A1A18`/`#E8E6E0`; `--matcha` `#7C8A6B`/`#8C9B7A`; `--stone` `#7E766A`/`#5A5E60`.
- **Voice:** terse. Titles and dates. One sentence maximum, anywhere. Metadata format: `Title · Artist · Year`.
- **Art photography is edge-to-edge, no border.** Only surrounding chrome swaps between themes.
- **Accessibility:** all motion (route fades + signature morph) collapses to instant when `prefers-reduced-motion: reduce`.
- **Commit after every task.** TDD where logic is testable (data selectors, formatters, checkout route); manual-verify checkpoints for visual/motion.

## File Structure

```
tanaka-gallery/
├─ app/
│  ├─ layout.tsx              # root: font vars, <html>, base chrome, metadata
│  ├─ template.tsx            # client fade-through route transition wrapper
│  ├─ page.tsx                # Home
│  ├─ globals.css             # token sets (light/dark), base element styles
│  ├─ works/
│  │  ├─ page.tsx             # gallery grid (RSC) → renders WorkGrid island
│  │  ├─ loading.tsx          # terse loading state
│  │  └─ [slug]/page.tsx      # work detail, full-bleed (morph target) + checkout entry
│  ├─ artists/
│  │  ├─ page.tsx             # artists index
│  │  └─ [slug]/page.tsx      # artist detail + their works
│  ├─ confirmed/page.tsx      # Stripe return_url landing (test-mode confirmation)
│  └─ api/
│     └─ checkout/route.ts    # Route Handler: test-mode PaymentIntent (+ guard)
├─ components/
│  ├─ motion/
│  │  ├─ morphStore.ts        # module-level FLIP origin store
│  │  ├─ WorkGrid.tsx         # client grid; captures tile rect on click
│  │  └─ MorphImage.tsx       # client full-bleed image; FLIP-animates from origin
│  ├─ checkout/
│  │  ├─ CheckoutPanel.tsx    # client; fetches clientSecret, mounts <PaymentElement>
│  │  └─ appearance.ts        # builds Stripe Appearance API object from CSS vars
│  └─ ui/
│     ├─ Nav.tsx              # top nav (server)
│     ├─ Footer.tsx           # footer (server)
│     ├─ Caption.tsx          # `Title · Artist · Year` formatter (server)
│     └─ Hairline.tsx         # 1px rule (server)
├─ data/
│  ├─ types.ts                # Artist, Work types
│  ├─ artists.ts              # Artist[] + getArtist, allArtists
│  ├─ works.ts                # Work[] + getWork, worksByArtist, allWorks, formatMeta
│  └─ format.ts               # formatPrice helper (cents → "$1,200")
├─ lib/
│  └─ stripe.ts               # server: test-mode Stripe client + assertTestMode
├─ scripts/
│  └─ gen-placeholders.mjs    # writes public/works/<slug>.svg art stand-ins
├─ public/works/              # generated SVG placeholder imagery
├─ test/
│  └─ setup.ts                # vitest + jest-dom setup
├─ .env.example               # NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY + STRIPE_SECRET_KEY (test)
├─ vitest.config.ts
└─ (next.config, tsconfig, eslint, prettier, package.json)
```

**Note on `start.md` / `preview/`:** `start.md` is gitignored (the brief). The `preview/` folder is a throwaway palette visualization from brainstorming and is NOT part of the build — Task 1 deletes it.

---

### Task 1: Project scaffold, tooling, and test harness

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `.eslintrc.json`, `.prettierrc`, `.gitignore`, `vitest.config.ts`, `test/setup.ts`, `.env.example`
- Delete: `preview/` (throwaway)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: a runnable Next.js 15 / React 19 app with `npm run dev`, `npm run build`, `npm test`, `npm run lint`. Vitest configured with jsdom + `@testing-library/jest-dom`, path alias `@/*` → repo root.

- [ ] **Step 1: Initialize package.json and install dependencies**

```bash
npm init -y
npm install next@^15 react@^19 react-dom@^19 framer-motion@^11 \
  stripe@^17 @stripe/stripe-js@^4 @stripe/react-stripe-js@^2
npm install -D typescript@^5 @types/react@^19 @types/react-dom@^19 @types/node \
  vitest@^2 @vitejs/plugin-react@^4 jsdom@^25 \
  @testing-library/react@^16 @testing-library/dom@^10 @testing-library/jest-dom@^6 \
  eslint eslint-config-next@^15 prettier
```

- [ ] **Step 2: Write `package.json` scripts**

Replace the `"scripts"` block in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "gen:placeholders": "node scripts/gen-placeholders.mjs"
  }
}
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Write `next.config.ts`, `.eslintrc.json`, `.prettierrc`**

`next.config.ts`:
```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = { reactStrictMode: true };
export default nextConfig;
```

`.eslintrc.json`:
```json
{ "extends": "next/core-web-vitals" }
```

`.prettierrc`:
```json
{ "semi": true, "singleQuote": false, "printWidth": 90 }
```

- [ ] **Step 5: Write `vitest.config.ts` and `test/setup.ts`**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
```

`test/setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: Write `.env.example` and update `.gitignore`**

`.env.example`:
```bash
# Stripe TEST MODE ONLY. Never put live (sk_live_/pk_live_) keys here.
# Get test keys at https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

Append to `.gitignore` (create if missing — keep the existing `start.md` line if present):
```
node_modules/
.next/
.env.local
.env*.local
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 7: Delete the throwaway preview folder**

```bash
rm -rf preview
```

- [ ] **Step 8: Add a smoke test to prove the harness works**

Create `test/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("test harness", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 9: Run the test to verify the harness**

Run: `npm test`
Expected: PASS — 1 passed (`test/smoke.test.ts`).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app, tooling, and Vitest harness"
```

---

### Task 2: Theme tokens, fonts, and root layout

**Files:**
- Create: `app/fonts.ts`, `app/globals.css`, `app/layout.tsx`
- Test: `test/theme.test.ts`

**Interfaces:**
- Consumes: nothing from prior tasks
- Produces:
  - `app/fonts.ts` exports `serif`, `grotesk`, `sans` (next/font objects) each exposing `.variable`: `--font-serif`, `--font-grotesk`, `--font-sans`.
  - `globals.css` defines `:root` light tokens and a `prefers-color-scheme: dark` override for `--paper`, `--ink`, `--matcha`, `--stone`, plus `--font-serif|grotesk|sans` consumed from the font vars.
  - Root layout sets `<html lang="en">` with the three font variable classes; `<body>` uses `background: var(--paper); color: var(--ink)`.

- [ ] **Step 1: Write the failing test for token definitions**

Create `test/theme.test.ts` (asserts the stylesheet declares every required token in both themes — guards the Global Constraints palette):
```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

describe("theme tokens", () => {
  const tokens = ["--paper", "--ink", "--matcha", "--stone"];
  it("defines all light-mode tokens in :root", () => {
    for (const t of tokens) expect(css).toMatch(new RegExp(`${t}\\s*:`));
  });
  it("redefines tokens under prefers-color-scheme: dark", () => {
    const dark = css.slice(css.indexOf("prefers-color-scheme: dark"));
    for (const t of tokens) expect(dark).toMatch(new RegExp(`${t}\\s*:`));
  });
  it("uses the corrected light --stone (#7E766A), not the low-contrast value", () => {
    expect(css).toMatch(/--stone:\s*#7E766A/i);
    expect(css).not.toMatch(/#B8B0A1/i);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- theme`
Expected: FAIL — cannot read `app/globals.css` (file does not exist).

- [ ] **Step 3: Write `app/fonts.ts`**

```ts
import { EB_Garamond, Space_Grotesk, Inter } from "next/font/google";

export const serif = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

export const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-grotesk",
});

export const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-sans",
});
```

- [ ] **Step 4: Write `app/globals.css`**

```css
:root {
  --paper: #f4f1ea;
  --ink: #1a1a18;
  --matcha: #7c8a6b;
  --stone: #7e766a;

  --measure: 68ch;
  --gutter: clamp(20px, 5vw, 64px);
}

@media (prefers-color-scheme: dark) {
  :root {
    --paper: #1c1e1f;
    --ink: #e8e6e0;
    --matcha: #8c9b7a;
    --stone: #5a5e60;
  }
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { font-family: var(--font-sans), system-ui, sans-serif; }

body {
  background: var(--paper);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  min-height: 100vh;
}

h1, h2, h3 { font-family: var(--font-serif), Georgia, serif; font-weight: 400; line-height: 1.05; }

.subhead {
  font-family: var(--font-grotesk), sans-serif;
  text-transform: none;
  letter-spacing: 0.04em;
  font-size: 14px;
  font-weight: 500;
}

.meta {
  font-size: 13px;
  letter-spacing: 0.02em;
  color: var(--stone);
}

a { color: inherit; text-decoration: none; }

img { display: block; max-width: 100%; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 5: Write `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { serif, grotesk, sans } from "./fonts";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Tanaka Projects", template: "%s — Tanaka Projects" },
  description: "Art. Objects. San Francisco.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${grotesk.variable} ${sans.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

> Note: `Nav`/`Footer` are created in Task 4. Until then, `npm run build` will fail to resolve them — that is expected; this task is verified by the unit test in Step 6, and full build is verified at the end of Task 4.

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- theme`
Expected: PASS — all three theme-token assertions pass.

- [ ] **Step 7: Commit**

```bash
git add app/fonts.ts app/globals.css app/layout.tsx test/theme.test.ts
git commit -m "feat: add theme tokens, font roles, and root layout"
```

---

### Task 3: Data model and selectors

**Files:**
- Create: `data/types.ts`, `data/format.ts`, `data/artists.ts`, `data/works.ts`
- Test: `data/format.test.ts`, `data/selectors.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `data/types.ts`: `interface Artist { slug; name; origin; born; bio }` and `interface Work { slug; title; artistSlug; year; medium; dimensions; priceCents; image; available }`.
  - `data/format.ts`: `formatPrice(cents: number): string` → `"$1,200"`.
  - `data/artists.ts`: `artists: Artist[]`, `getArtist(slug: string): Artist | undefined`, `allArtists(): Artist[]`.
  - `data/works.ts`: `works: Work[]`, `getWork(slug: string): Work | undefined`, `worksByArtist(artistSlug: string): Work[]`, `allWorks(): Work[]`, `formatMeta(work: Work): string` → `"Title · Artist · Year"`.

- [ ] **Step 1: Write `data/types.ts`**

```ts
export interface Artist {
  slug: string;
  name: string;
  origin: string; // e.g. "Osaka, Japan" or "Oakland, CA"
  born: number; // year
  bio: string; // terse — one or two sentences, no adjectives
}

export interface Work {
  slug: string;
  title: string;
  artistSlug: string;
  year: number;
  medium: string; // e.g. "stoneware"
  dimensions: string; // e.g. "12 × 8 × 8 in"
  priceCents: number; // USD cents — Stripe-ready
  image: string; // public path, e.g. "/works/untitled-vessel.svg"
  available: boolean;
}
```

- [ ] **Step 2: Write the failing test for `formatPrice`**

Create `data/format.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("formats cents as whole-dollar USD", () => {
    expect(formatPrice(120000)).toBe("$1,200");
  });
  it("formats sub-thousand amounts", () => {
    expect(formatPrice(45000)).toBe("$450");
  });
  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$0");
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- format`
Expected: FAIL — cannot resolve `./format`.

- [ ] **Step 4: Write `data/format.ts`**

```ts
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- format`
Expected: PASS — 3 passed.

- [ ] **Step 6: Write `data/artists.ts` (seed data + selectors)**

```ts
import type { Artist } from "./types";

export const artists: Artist[] = [
  { slug: "saburo-ohta", name: "Saburo Ohta", origin: "Osaka, Japan", born: 1968, bio: "Stoneware vessels, thrown and left unglazed." },
  { slug: "mika-narita", name: "Mika Narita", origin: "Kyoto, Japan", born: 1981, bio: "Ink on paper. Repetition until the line forgets itself." },
  { slug: "ken-arai", name: "Ken Arai", origin: "Nagoya, Japan", born: 1974, bio: "Folded steel. Small objects that hold their weight." },
  { slug: "yuki-tomita", name: "Yuki Tomita", origin: "Sapporo, Japan", born: 1986, bio: "Photographs of rooms after the people leave." },
  { slug: "haruka-sen", name: "Haruka Sen", origin: "Tokyo, Japan", born: 1979, bio: "Lacquer over wood. Black on black." },
  { slug: "dana-cole", name: "Dana Cole", origin: "Oakland, CA", born: 1983, bio: "Oil on linen. Light doing very little." },
  { slug: "marcus-reyes", name: "Marcus Reyes", origin: "San Francisco, CA", born: 1977, bio: "Concrete casts of things that were soft." },
  { slug: "iris-lund", name: "Iris Lund", origin: "Berkeley, CA", born: 1990, bio: "Glass. Cooled too fast on purpose." },
];

export function allArtists(): Artist[] {
  return artists;
}

export function getArtist(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug);
}
```

> Content note: this is the working seed set (8 artists). To reach the spec's full roster of 20, append more entries in the exact same shape — no code changes needed. Treated as content entry, not a code task.

- [ ] **Step 7: Write `data/works.ts` (seed data + selectors)**

```ts
import type { Work } from "./types";
import { getArtist } from "./artists";

export const works: Work[] = [
  { slug: "untitled-vessel", title: "Untitled (Vessel)", artistSlug: "saburo-ohta", year: 2019, medium: "stoneware", dimensions: "12 × 8 × 8 in", priceCents: 120000, image: "/works/untitled-vessel.svg", available: true },
  { slug: "vessel-no-7", title: "Vessel No. 7", artistSlug: "saburo-ohta", year: 2021, medium: "stoneware", dimensions: "9 × 7 × 7 in", priceCents: 95000, image: "/works/vessel-no-7.svg", available: true },
  { slug: "line-study-iii", title: "Line Study III", artistSlug: "mika-narita", year: 2020, medium: "ink on paper", dimensions: "30 × 22 in", priceCents: 64000, image: "/works/line-study-iii.svg", available: true },
  { slug: "line-study- ix", title: "Line Study IX", artistSlug: "mika-narita", year: 2022, medium: "ink on paper", dimensions: "30 × 22 in", priceCents: 64000, image: "/works/line-study-ix.svg", available: false },
  { slug: "fold-small", title: "Fold (Small)", artistSlug: "ken-arai", year: 2018, medium: "folded steel", dimensions: "6 × 6 × 4 in", priceCents: 180000, image: "/works/fold-small.svg", available: true },
  { slug: "room-401", title: "Room 401", artistSlug: "yuki-tomita", year: 2021, medium: "archival pigment print", dimensions: "24 × 36 in", priceCents: 52000, image: "/works/room-401.svg", available: true },
  { slug: "room-902", title: "Room 902", artistSlug: "yuki-tomita", year: 2023, medium: "archival pigment print", dimensions: "24 × 36 in", priceCents: 52000, image: "/works/room-902.svg", available: true },
  { slug: "black-on-black-ii", title: "Black on Black II", artistSlug: "haruka-sen", year: 2017, medium: "lacquer on wood", dimensions: "18 × 14 in", priceCents: 240000, image: "/works/black-on-black-ii.svg", available: true },
  { slug: "low-light", title: "Low Light", artistSlug: "dana-cole", year: 2022, medium: "oil on linen", dimensions: "40 × 30 in", priceCents: 300000, image: "/works/low-light.svg", available: true },
  { slug: "cast-no-3", title: "Cast No. 3", artistSlug: "marcus-reyes", year: 2020, medium: "concrete", dimensions: "14 × 10 × 10 in", priceCents: 88000, image: "/works/cast-no-3.svg", available: true },
  { slug: "quench", title: "Quench", artistSlug: "iris-lund", year: 2023, medium: "glass", dimensions: "8 × 8 × 8 in", priceCents: 72000, image: "/works/quench.svg", available: true },
  { slug: "quench-ii", title: "Quench II", artistSlug: "iris-lund", year: 2024, medium: "glass", dimensions: "8 × 8 × 8 in", priceCents: 76000, image: "/works/quench-ii.svg", available: true },
];

export function allWorks(): Work[] {
  return works;
}

export function getWork(slug: string): Work | undefined {
  return works.find((w) => w.slug === slug);
}

export function worksByArtist(artistSlug: string): Work[] {
  return works.filter((w) => w.artistSlug === artistSlug);
}

export function formatMeta(work: Work): string {
  const artist = getArtist(work.artistSlug);
  const name = artist ? artist.name : "Unknown";
  return `${work.title} · ${name} · ${work.year}`;
}
```

> Fix the obvious typo before committing: the slug `"line-study- ix"` above contains a stray space — change it to `"line-study-ix"` so it matches its image path. (Left visible here so the implementer corrects it rather than copying a broken slug.)

- [ ] **Step 8: Write the failing test for selectors**

Create `data/selectors.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { getArtist, allArtists } from "./artists";
import { getWork, worksByArtist, allWorks, formatMeta } from "./works";

describe("artist selectors", () => {
  it("returns an artist by slug", () => {
    expect(getArtist("saburo-ohta")?.name).toBe("Saburo Ohta");
  });
  it("returns undefined for an unknown slug", () => {
    expect(getArtist("nobody")).toBeUndefined();
  });
  it("lists all artists", () => {
    expect(allArtists().length).toBeGreaterThanOrEqual(8);
  });
});

describe("work selectors", () => {
  it("returns a work by slug", () => {
    expect(getWork("untitled-vessel")?.title).toBe("Untitled (Vessel)");
  });
  it("returns undefined for an unknown slug", () => {
    expect(getWork("nope")).toBeUndefined();
  });
  it("filters works by artist", () => {
    const w = worksByArtist("saburo-ohta");
    expect(w.length).toBe(2);
    expect(w.every((x) => x.artistSlug === "saburo-ohta")).toBe(true);
  });
  it("every work references a real artist", () => {
    for (const w of allWorks()) {
      expect(getArtist(w.artistSlug), `missing artist for ${w.slug}`).toBeDefined();
    }
  });
  it("every work image path matches its slug", () => {
    for (const w of allWorks()) {
      expect(w.image).toBe(`/works/${w.slug}.svg`);
    }
  });
});

describe("formatMeta", () => {
  it("formats Title · Artist · Year", () => {
    expect(formatMeta(getWork("untitled-vessel")!)).toBe("Untitled (Vessel) · Saburo Ohta · 2019");
  });
});
```

- [ ] **Step 9: Run the tests to verify they pass**

Run: `npm test -- selectors`
Expected: PASS — all selector assertions pass. (If `image path matches slug` fails, you left the `line-study- ix` typo from Step 7 — fix the slug.)

- [ ] **Step 10: Commit**

```bash
git add data/
git commit -m "feat: add typed artist/work data model and selectors"
```

---

### Task 4: Placeholder imagery generator and UI primitives

**Files:**
- Create: `scripts/gen-placeholders.mjs`, `components/ui/Caption.tsx`, `components/ui/Hairline.tsx`, `components/ui/Nav.tsx`, `components/ui/Footer.tsx`, `components/ui/ui.module.css`
- Generated: `public/works/*.svg`
- Test: `components/ui/Caption.test.tsx`

**Interfaces:**
- Consumes: `allWorks()` (Task 3) in the generator; `formatMeta` (Task 3) in `Caption`.
- Produces:
  - One `public/works/<slug>.svg` per work — a muted, deterministic color field with the title set in the serif. Fills any container.
  - `Caption({ work }: { work: Work })` → renders `formatMeta(work)` in `.meta`.
  - `Hairline()` → a `<hr>` styled to `--stone`, 1px.
  - `Nav()` → server component: wordmark "TANAKA PROJECTS" (links `/`), nav links Works `/works`, Artists `/artists`.
  - `Footer()` → server component: tagline "Art. Objects. San Francisco." + "San Francisco, est. 2001".

- [ ] **Step 1: Write `scripts/gen-placeholders.mjs`**

```js
// Generates a deterministic muted SVG "artwork" per work into public/works/.
// Real, committed files — not a runtime placeholder. Run: npm run gen:placeholders
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "../public/works");
mkdirSync(outDir, { recursive: true });

// Minimal duplicate of the works list (slug + title) to avoid importing TS.
const works = [
  ["untitled-vessel", "Untitled (Vessel)"],
  ["vessel-no-7", "Vessel No. 7"],
  ["line-study-iii", "Line Study III"],
  ["line-study-ix", "Line Study IX"],
  ["fold-small", "Fold (Small)"],
  ["room-401", "Room 401"],
  ["room-902", "Room 902"],
  ["black-on-black-ii", "Black on Black II"],
  ["low-light", "Low Light"],
  ["cast-no-3", "Cast No. 3"],
  ["quench", "Quench"],
  ["quench-ii", "Quench II"],
];

// Muted, earthy stand-in palette (image is theme-agnostic).
const fields = ["#cdc6b8", "#b7a99a", "#9aa089", "#a89f93", "#8d8475", "#bcae9b"];
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

for (const [slug, title] of works) {
  const bg = fields[hash(slug) % fields.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
  <rect width="1200" height="900" fill="${bg}"/>
  <text x="60" y="840" font-family="EB Garamond, Georgia, serif" font-size="40" fill="#1a1a18" opacity="0.55">${title}</text>
</svg>`;
  writeFileSync(resolve(outDir, `${slug}.svg`), svg, "utf8");
}

console.log(`Wrote ${works.length} placeholder artworks to public/works/`);
```

- [ ] **Step 2: Generate the imagery and verify**

Run: `npm run gen:placeholders`
Expected: `Wrote 12 placeholder artworks to public/works/` and 12 `.svg` files exist in `public/works/`.

- [ ] **Step 3: Write `components/ui/ui.module.css`**

```css
.nav {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 24px var(--gutter);
  border-bottom: 1px solid var(--stone);
}
.wordmark {
  font-family: var(--font-sans), sans-serif;
  font-size: 13px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 500;
}
.navLinks { display: flex; gap: 28px; }
.navLink {
  font-family: var(--font-grotesk), sans-serif;
  font-size: 13px;
  letter-spacing: 0.04em;
}
.navLink:hover { color: var(--matcha); }

.footer {
  padding: 48px var(--gutter);
  border-top: 1px solid var(--stone);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.tagline { font-family: var(--font-serif), serif; font-style: italic; font-size: 16px; }
.footerMeta { font-size: 12px; color: var(--stone); letter-spacing: 0.04em; }

.hairline { border: 0; border-top: 1px solid var(--stone); width: 100%; }
```

- [ ] **Step 4: Write `components/ui/Hairline.tsx` and `components/ui/Nav.tsx` and `components/ui/Footer.tsx`**

`Hairline.tsx`:
```tsx
import styles from "./ui.module.css";
export function Hairline() {
  return <hr className={styles.hairline} />;
}
```

`Nav.tsx`:
```tsx
import Link from "next/link";
import styles from "./ui.module.css";

export function Nav() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.wordmark}>Tanaka Projects</Link>
      <div className={styles.navLinks}>
        <Link href="/works" className={styles.navLink}>Works</Link>
        <Link href="/artists" className={styles.navLink}>Artists</Link>
      </div>
    </nav>
  );
}
```

`Footer.tsx`:
```tsx
import styles from "./ui.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.tagline}>Art. Objects. San Francisco.</span>
      <span className={styles.footerMeta}>San Francisco · est. 2001</span>
    </footer>
  );
}
```

- [ ] **Step 5: Write the failing test for `Caption`**

Create `components/ui/Caption.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Caption } from "./Caption";
import { getWork } from "@/data/works";

describe("Caption", () => {
  it("renders Title · Artist · Year", () => {
    render(<Caption work={getWork("untitled-vessel")!} />);
    expect(screen.getByText("Untitled (Vessel) · Saburo Ohta · 2019")).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm test -- Caption`
Expected: FAIL — cannot resolve `./Caption`.

- [ ] **Step 7: Write `components/ui/Caption.tsx`**

```tsx
import type { Work } from "@/data/types";
import { formatMeta } from "@/data/works";

export function Caption({ work }: { work: Work }) {
  return <p className="meta">{formatMeta(work)}</p>;
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test -- Caption`
Expected: PASS — 1 passed.

- [ ] **Step 9: Verify the app now builds and the layout renders**

Run: `npm run build`
Expected: build succeeds (Nav/Footer now resolve; Home/works pages come next but `app/layout.tsx` + an empty `app/page.tsx` placeholder are enough). If `app/page.tsx` does not exist yet, create a temporary one:
```tsx
export default function Home() { return <section style={{ padding: "var(--gutter)" }} />; }
```
(Task 5 replaces it.)

- [ ] **Step 10: Commit**

```bash
git add components/ui scripts/gen-placeholders.mjs public/works app/page.tsx
git commit -m "feat: add placeholder art generator and UI primitives (Nav, Footer, Caption, Hairline)"
```

---

### Task 5: Home page

**Files:**
- Modify: `app/page.tsx` (replace the Task 4 placeholder)
- Create: `app/home.module.css`
- Test: `app/home.test.tsx`

**Interfaces:**
- Consumes: `allWorks()` (Task 3), `Link` from next.
- Produces: a server-rendered Home with the tagline as the hero and a terse "Selected" index linking into `/works`.

- [ ] **Step 1: Write the failing test**

Create `app/home.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("shows the tagline", () => {
    render(<Home />);
    expect(screen.getByText(/Art\. Objects\. San Francisco\./i)).toBeInTheDocument();
  });
  it("links to the works index", () => {
    render(<Home />);
    const link = screen.getByRole("link", { name: /selected works/i });
    expect(link).toHaveAttribute("href", "/works");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- home`
Expected: FAIL — the placeholder `Home` has no tagline.

- [ ] **Step 3: Write `app/home.module.css`**

```css
.hero {
  padding: clamp(64px, 16vh, 200px) var(--gutter);
  border-bottom: 1px solid var(--stone);
}
.tagline { font-size: clamp(40px, 9vw, 120px); line-height: 0.98; max-width: 14ch; }
.index { padding: 40px var(--gutter) 96px; }
.indexLink {
  display: inline-block;
  font-family: var(--font-grotesk), sans-serif;
  font-size: 14px;
  letter-spacing: 0.04em;
  border-bottom: 1px solid currentColor;
  padding-bottom: 2px;
}
.indexLink:hover { color: var(--matcha); }
.note { font-family: var(--font-serif), serif; font-style: italic; color: var(--stone); margin-bottom: 28px; max-width: 40ch; }
```

- [ ] **Step 4: Write `app/page.tsx`**

```tsx
import Link from "next/link";
import { allWorks } from "@/data/works";
import styles from "./home.module.css";

export default function Home() {
  const count = allWorks().length;
  return (
    <>
      <section className={styles.hero}>
        <h1 className={styles.tagline}>Art. Objects. San Francisco.</h1>
      </section>
      <section className={styles.index}>
        <p className={styles.note}>
          Contemporary art and objects. Twenty artists, half Japanese, half Bay Area.
        </p>
        <Link href="/works" className={styles.indexLink}>
          Selected Works ({count}) →
        </Link>
      </section>
    </>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- home`
Expected: PASS — 2 passed.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/home.module.css app/home.test.tsx
git commit -m "feat: add Home page"
```

---

### Task 6: Works grid (with rect-capturing client island)

**Files:**
- Create: `components/motion/morphStore.ts`, `components/motion/WorkGrid.tsx`, `components/motion/grid.module.css`, `app/works/page.tsx`, `app/works/loading.tsx`
- Test: `components/motion/morphStore.test.ts`

**Interfaces:**
- Consumes: `allWorks()`, `Work` (Task 3).
- Produces:
  - `morphStore.ts`: `type Rect = { top; left; width; height }`; `setMorphOrigin(slug: string, rect: Rect): void`; `takeMorphOrigin(slug: string): Rect | null` (consumes once — returns null on mismatch or after read).
  - `WorkGrid({ works }: { works: Work[] })`: client grid of `<Link href="/works/[slug]">` tiles; on click, stores the tile image's `getBoundingClientRect()` via `setMorphOrigin`. Each tile image carries `data-morph={slug}`.
  - `app/works/page.tsx`: server component rendering `<WorkGrid works={allWorks()} />` under an `<h1>` / subhead.

- [ ] **Step 1: Write `components/motion/morphStore.ts`**

```ts
export type Rect = { top: number; left: number; width: number; height: number };

let pending: { slug: string; rect: Rect } | null = null;

export function setMorphOrigin(slug: string, rect: Rect): void {
  pending = { slug, rect };
}

// Consumes the stored origin exactly once, and only for the matching slug.
export function takeMorphOrigin(slug: string): Rect | null {
  if (pending && pending.slug === slug) {
    const { rect } = pending;
    pending = null;
    return rect;
  }
  return null;
}
```

- [ ] **Step 2: Write the failing test for the store**

Create `components/motion/morphStore.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { setMorphOrigin, takeMorphOrigin } from "./morphStore";

const rect = { top: 10, left: 20, width: 100, height: 80 };

describe("morphStore", () => {
  it("returns the stored rect for the matching slug, once", () => {
    setMorphOrigin("a", rect);
    expect(takeMorphOrigin("a")).toEqual(rect);
    expect(takeMorphOrigin("a")).toBeNull(); // consumed
  });
  it("returns null for a non-matching slug", () => {
    setMorphOrigin("a", rect);
    expect(takeMorphOrigin("b")).toBeNull();
  });
});
```

- [ ] **Step 3: Run the test to verify it passes**

Run: `npm test -- morphStore`
Expected: PASS — 2 passed.

- [ ] **Step 4: Write `components/motion/grid.module.css`**

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: clamp(12px, 2vw, 28px);
  padding: 40px var(--gutter) 96px;
}
.tile { display: block; }
.frame { aspect-ratio: 4 / 3; overflow: hidden; background: var(--stone); }
.frame img { width: 100%; height: 100%; object-fit: cover; }
.tile:hover .caption { color: var(--matcha); }
.caption { margin-top: 10px; }
.sold { color: var(--stone); }
.head { padding: 40px var(--gutter) 0; }
.subhead { margin-top: 8px; color: var(--stone); }
```

- [ ] **Step 5: Write `components/motion/WorkGrid.tsx`**

```tsx
"use client";

import Link from "next/link";
import type { Work } from "@/data/types";
import { formatMeta } from "@/data/works";
import { setMorphOrigin } from "./morphStore";
import styles from "./grid.module.css";

export function WorkGrid({ works }: { works: Work[] }) {
  return (
    <div className={styles.grid}>
      {works.map((work) => (
        <Link
          key={work.slug}
          href={`/works/${work.slug}`}
          className={styles.tile}
          onClick={(e) => {
            const img = e.currentTarget.querySelector("img");
            if (img) {
              const r = img.getBoundingClientRect();
              setMorphOrigin(work.slug, { top: r.top, left: r.left, width: r.width, height: r.height });
            }
          }}
        >
          <div className={styles.frame}>
            <img src={work.image} alt={work.title} data-morph={work.slug} loading="lazy" />
          </div>
          <p className={`meta ${styles.caption} ${work.available ? "" : styles.sold}`}>
            {formatMeta(work)}
            {work.available ? "" : " · sold"}
          </p>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Write `app/works/page.tsx` and `app/works/loading.tsx`**

`app/works/page.tsx`:
```tsx
import type { Metadata } from "next";
import { allWorks } from "@/data/works";
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
      <WorkGrid works={allWorks()} />
    </>
  );
}
```

`app/works/loading.tsx`:
```tsx
export default function Loading() {
  return <p className="meta" style={{ padding: "40px var(--gutter)" }}>Loading…</p>;
}
```

- [ ] **Step 7: Verify build and manual check**

Run: `npm run build && npm run dev`
Manual: visit `http://localhost:3000/works` — grid of artworks, edge-to-edge thumbnails, terse captions, "sold" on the unavailable one (`line-study-ix`), hover turns caption matcha.

- [ ] **Step 8: Commit**

```bash
git add components/motion app/works
git commit -m "feat: add works grid with morph-origin capture"
```

---

### Task 7: Work detail page with signature morph

**Files:**
- Create: `components/motion/MorphImage.tsx`, `app/works/[slug]/page.tsx`, `app/works/[slug]/detail.module.css`
- Test: covered by manual verification (motion) + the existing `notFound` behavior is asserted via a render guard test `app/works/[slug]/detail.test.tsx`

**Interfaces:**
- Consumes: `getWork`, `getArtist`, `formatPrice` (Task 3); `takeMorphOrigin`, `Rect` (Task 6); `useReducedMotion`, `useAnimationControls`, `motion` from framer-motion.
- Produces:
  - `MorphImage({ slug, src, alt }: { slug: string; src: string; alt: string })`: client full-bleed image that, on mount, reads `takeMorphOrigin(slug)` and FLIP-animates from that rect to its resting full-bleed position via imperative controls; no-op (instant) when no origin or when reduced-motion.
  - `app/works/[slug]/page.tsx`: server component; `getWork(slug)` → `notFound()` when absent; renders `MorphImage` + terse meta + an Inquire entry that links to checkout (built in Task 9).

- [ ] **Step 1: Write `components/motion/MorphImage.tsx`**

```tsx
"use client";

import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useLayoutEffect, useRef } from "react";
import { takeMorphOrigin } from "./morphStore";
import styles from "./grid.module.css";

export function MorphImage({ slug, src, alt }: { slug: string; src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const target = ref.current?.getBoundingClientRect();
    const origin = takeMorphOrigin(slug);
    if (!target || !origin || reduce) {
      controls.set({ x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 });
      return;
    }
    // FLIP: place at the captured grid-tile rect, then animate to identity (full-bleed).
    controls.set({
      x: origin.left - target.left,
      y: origin.top - target.top,
      scaleX: origin.width / target.width,
      scaleY: origin.height / target.height,
      opacity: 1,
    });
    controls.start({
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    });
  }, [slug, reduce, controls]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial={false}
      style={{ transformOrigin: "top left", width: "100%", height: "100%" }}
      className={styles.morphWrap}
    >
      <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </motion.div>
  );
}
```

- [ ] **Step 2: Add the `.morphWrap` and detail styles**

Append to `components/motion/grid.module.css`:
```css
.morphWrap { display: block; }
```

Create `app/works/[slug]/detail.module.css`:
```css
.stage {
  width: 100%;
  height: clamp(60vh, 78vh, 88vh);
  overflow: hidden;
  background: var(--stone);
}
.info {
  padding: 28px var(--gutter) 96px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: end;
}
.title { font-size: clamp(28px, 4vw, 48px); }
.line { margin-top: 8px; }
.price { font-family: var(--font-grotesk), sans-serif; font-size: 16px; letter-spacing: 0.03em; }
.inquire {
  display: inline-block;
  margin-top: 12px;
  font-family: var(--font-grotesk), sans-serif;
  font-size: 14px;
  letter-spacing: 0.04em;
  color: var(--matcha);
  border-bottom: 1px solid currentColor;
  padding-bottom: 2px;
}
.sold { color: var(--stone); }
```

- [ ] **Step 3: Write `app/works/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getWork } from "@/data/works";
import { getArtist } from "@/data/artists";
import { formatPrice } from "@/data/format";
import { MorphImage } from "@/components/motion/MorphImage";
import styles from "./detail.module.css";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  return { title: work ? work.title : "Not found" };
}

export default async function WorkDetail({ params }: Params) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();
  const artist = getArtist(work.artistSlug);

  return (
    <article>
      <div className={styles.stage}>
        <MorphImage slug={work.slug} src={work.image} alt={work.title} />
      </div>
      <div className={styles.info}>
        <div>
          <h1 className={styles.title}>{work.title}</h1>
          <p className={`meta ${styles.line}`}>
            {artist ? (
              <Link href={`/artists/${artist.slug}`}>{artist.name}</Link>
            ) : (
              "Unknown"
            )}
            {` · ${work.year} · ${work.medium} · ${work.dimensions}`}
          </p>
        </div>
        <div>
          {work.available ? (
            <>
              <p className={styles.price}>{formatPrice(work.priceCents)}</p>
              <Link href={`/works/${work.slug}/inquire`} className={styles.inquire}>
                Inquire →
              </Link>
            </>
          ) : (
            <p className={`${styles.price} ${styles.sold}`}>Sold</p>
          )}
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Write the failing render-guard test**

Create `app/works/[slug]/detail.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import WorkDetail from "./page";

// notFound throws a Next control-flow error; assert it is hit for a bad slug.
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

describe("WorkDetail", () => {
  it("renders a known work", async () => {
    const ui = await WorkDetail({ params: Promise.resolve({ slug: "untitled-vessel" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Untitled (Vessel)" })).toBeInTheDocument();
  });
  it("calls notFound for an unknown slug", async () => {
    await expect(
      WorkDetail({ params: Promise.resolve({ slug: "nope" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- detail`
Expected: PASS — 2 passed.

- [ ] **Step 6: Manual verification of the signature morph**

Run: `npm run dev`
Manual: from `/works`, click a tile → the image should expand full-bleed from the tile's position (≈0.5s ease). Reload the detail URL directly → image simply appears (no morph). Toggle OS "reduce motion" → click a tile → instant, no morph.

- [ ] **Step 7: Commit**

```bash
git add components/motion/MorphImage.tsx components/motion/grid.module.css app/works/[slug]
git commit -m "feat: add work detail page with signature FLIP morph"
```

---

### Task 8: Artists index and detail pages

**Files:**
- Create: `app/artists/page.tsx`, `app/artists/[slug]/page.tsx`, `app/artists/artists.module.css`
- Test: `app/artists/[slug]/artist.test.tsx`

**Interfaces:**
- Consumes: `allArtists`, `getArtist` (Task 3); `worksByArtist`, `formatMeta` (Task 3); `WorkGrid` (Task 6).
- Produces: artists index (terse list) + artist detail (bio + their works via `WorkGrid`); `notFound()` for unknown artist slug.

- [ ] **Step 1: Write `app/artists/artists.module.css`**

```css
.index { padding: 40px var(--gutter) 96px; }
.row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 18px 0;
  border-top: 1px solid var(--stone);
}
.row:hover .name { color: var(--matcha); }
.name { font-family: var(--font-serif), serif; font-size: clamp(22px, 3vw, 34px); }
.origin { font-size: 12px; color: var(--stone); letter-spacing: 0.04em; }
.head { padding: 40px var(--gutter) 0; }
.bio { padding: 28px var(--gutter); font-family: var(--font-serif), serif; font-size: clamp(20px, 3vw, 30px); max-width: 26ch; }
.detailMeta { padding: 0 var(--gutter); color: var(--stone); }
```

- [ ] **Step 2: Write `app/artists/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { allArtists } from "@/data/artists";
import styles from "./artists.module.css";

export const metadata: Metadata = { title: "Artists" };

export default function ArtistsPage() {
  return (
    <>
      <header className={styles.head}>
        <h1>Artists</h1>
        <p className="subhead">Twenty represented — half Japanese, half Bay Area</p>
      </header>
      <section className={styles.index}>
        {allArtists().map((a) => (
          <Link key={a.slug} href={`/artists/${a.slug}`} className={styles.row}>
            <span className={styles.name}>{a.name}</span>
            <span className={styles.origin}>{a.origin} · b. {a.born}</span>
          </Link>
        ))}
      </section>
    </>
  );
}
```

- [ ] **Step 3: Write `app/artists/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtist } from "@/data/artists";
import { worksByArtist } from "@/data/works";
import { WorkGrid } from "@/components/motion/WorkGrid";
import styles from "../artists.module.css";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const artist = getArtist(slug);
  return { title: artist ? artist.name : "Not found" };
}

export default async function ArtistDetail({ params }: Params) {
  const { slug } = await params;
  const artist = getArtist(slug);
  if (!artist) notFound();
  const works = worksByArtist(artist.slug);

  return (
    <article>
      <header className={styles.head}>
        <h1>{artist.name}</h1>
        <p className="subhead">{artist.origin} · b. {artist.born}</p>
      </header>
      <p className={styles.bio}>{artist.bio}</p>
      <p className={`meta ${styles.detailMeta}`}>
        {works.length} {works.length === 1 ? "work" : "works"}
      </p>
      <WorkGrid works={works} />
    </article>
  );
}
```

- [ ] **Step 4: Write the failing test**

Create `app/artists/[slug]/artist.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ArtistDetail from "./page";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

describe("ArtistDetail", () => {
  it("renders a known artist with their work count", async () => {
    const ui = await ArtistDetail({ params: Promise.resolve({ slug: "saburo-ohta" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Saburo Ohta" })).toBeInTheDocument();
    expect(screen.getByText("2 works")).toBeInTheDocument();
  });
  it("calls notFound for an unknown artist", async () => {
    await expect(
      ArtistDetail({ params: Promise.resolve({ slug: "ghost" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- artist`
Expected: PASS — 2 passed.

- [ ] **Step 6: Commit**

```bash
git add app/artists
git commit -m "feat: add artists index and detail pages"
```

---

### Task 9: Checkout — test-mode Stripe Payment Element

**Files:**
- Create: `lib/stripe.ts`, `app/api/checkout/route.ts`, `components/checkout/appearance.ts`, `components/checkout/CheckoutPanel.tsx`, `app/works/[slug]/inquire/page.tsx`, `app/works/[slug]/inquire/inquire.module.css`, `app/confirmed/page.tsx`
- Test: `lib/stripe.test.ts`, `app/api/checkout/route.test.ts`

**Interfaces:**
- Consumes: `getWork` (Task 3), `formatPrice` (Task 3), Stripe SDKs.
- Produces:
  - `lib/stripe.ts`: `stripe` (server `Stripe` instance), `assertTestMode(): void` (throws unless `STRIPE_SECRET_KEY` starts with `sk_test_`).
  - `app/api/checkout/route.ts`: `POST` → `{ slug }` → `{ clientSecret }` for a test-mode PaymentIntent; 404 if work missing/unavailable; runs `assertTestMode()` first.
  - `components/checkout/appearance.ts`: `buildAppearance(): Appearance` reading live CSS vars off `:root`.
  - `CheckoutPanel({ slug }: { slug: string })`: client; POSTs to `/api/checkout`, mounts `<Elements>` + `<PaymentElement>`, confirms with `return_url` `/confirmed?work=<slug>`.

- [ ] **Step 1: Write the failing test for the test-mode guard**

Create `lib/stripe.test.ts`:
```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("assertTestMode", () => {
  const original = process.env.STRIPE_SECRET_KEY;
  beforeEach(() => { vi.resetModules?.(); });
  afterEach(() => { process.env.STRIPE_SECRET_KEY = original; });

  it("throws when the key is not a test key", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_danger";
    const { assertTestMode } = await import("./stripe");
    expect(() => assertTestMode()).toThrow(/test-mode/i);
  });
  it("passes for a test key", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_ok";
    const { assertTestMode } = await import("./stripe");
    expect(() => assertTestMode()).not.toThrow();
  });
});
```

(Add `import { vi } from "vitest";` at the top.)

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- stripe`
Expected: FAIL — cannot resolve `./stripe`.

- [ ] **Step 3: Write `lib/stripe.ts`**

```ts
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY ?? "";

// Mockup safety rail: never allow a live key to run. See TODO(stripe-integration).
export function assertTestMode(): void {
  if (!key.startsWith("sk_test_")) {
    throw new Error(
      "Refusing to run checkout: STRIPE_SECRET_KEY must be a test-mode key (sk_test_…). " +
        "This mockup never processes live payments.",
    );
  }
}

export const stripe = new Stripe(key, { apiVersion: "2025-05-28.basil" });
```

> If the `apiVersion` string is rejected by the installed `stripe` types, remove the `apiVersion` option entirely — the SDK will default to the account's pinned version. Do not add it back with a guessed value.

- [ ] **Step 4: Run the guard test to verify it passes**

Run: `npm test -- stripe`
Expected: PASS — 2 passed.

- [ ] **Step 5: Write the failing test for the route handler**

Create `app/api/checkout/route.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const create = vi.fn();

vi.mock("@/lib/stripe", () => ({
  assertTestMode: vi.fn(),
  stripe: { paymentIntents: { create: (...a: unknown[]) => create(...a) } },
}));

beforeEach(() => {
  create.mockReset();
  create.mockResolvedValue({ client_secret: "pi_test_secret" });
});

async function call(body: unknown) {
  const { POST } = await import("./route");
  return POST(new Request("http://t/api/checkout", { method: "POST", body: JSON.stringify(body) }));
}

describe("POST /api/checkout", () => {
  it("creates a PaymentIntent for the work price and returns the client secret", async () => {
    const res = await call({ slug: "untitled-vessel" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ clientSecret: "pi_test_secret" });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 120000, currency: "usd" }),
    );
  });
  it("404s for an unknown work", async () => {
    const res = await call({ slug: "nope" });
    expect(res.status).toBe(404);
    expect(create).not.toHaveBeenCalled();
  });
  it("404s for an unavailable work", async () => {
    const res = await call({ slug: "line-study-ix" });
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm test -- checkout/route`
Expected: FAIL — cannot resolve `./route`.

- [ ] **Step 7: Write `app/api/checkout/route.ts`**

```ts
import { NextResponse } from "next/server";
import { stripe, assertTestMode } from "@/lib/stripe";
import { getWork } from "@/data/works";

export async function POST(req: Request) {
  assertTestMode();
  const { slug } = (await req.json()) as { slug?: string };
  const work = slug ? getWork(slug) : undefined;
  if (!work || !work.available) {
    return NextResponse.json({ error: "Work unavailable" }, { status: 404 });
  }
  const intent = await stripe.paymentIntents.create({
    amount: work.priceCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: { workSlug: work.slug, title: work.title },
  });
  return NextResponse.json({ clientSecret: intent.client_secret });
}
```

- [ ] **Step 8: Run the route test to verify it passes**

Run: `npm test -- checkout/route`
Expected: PASS — 3 passed.

- [ ] **Step 9: Write `components/checkout/appearance.ts`**

```ts
import type { Appearance } from "@stripe/stripe-js";

// Reads the live theme tokens off :root so Stripe Elements match the active theme.
export function buildAppearance(): Appearance {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string) => s.getPropertyValue(name).trim();
  return {
    theme: "stripe",
    variables: {
      colorBackground: v("--paper"),
      colorText: v("--ink"),
      colorPrimary: v("--matcha"),
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: "2px",
    },
  };
}
```

- [ ] **Step 10: Write `components/checkout/CheckoutPanel.tsx`**

```tsx
"use client";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { buildAppearance } from "./appearance";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

function Form({ slug }: { slug: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/confirmed?work=${slug}` },
    });
    if (error) {
      setError(error.message ?? "Payment failed.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <PaymentElement />
      {error && <p className="meta" role="alert" style={{ marginTop: 12 }}>{error}</p>}
      <button type="submit" disabled={!stripe || busy} className="subhead" style={{ marginTop: 20, cursor: "pointer", background: "none", border: "1px solid var(--ink)", padding: "10px 18px", color: "inherit" }}>
        {busy ? "Processing…" : "Pay (test mode)"}
      </button>
    </form>
  );
}

export function CheckoutPanel({ slug }: { slug: string }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("This work is unavailable.");
        return r.json();
      })
      .then((d) => setClientSecret(d.clientSecret))
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <p className="meta" role="alert">{error}</p>;
  if (!clientSecret) return <p className="meta">Preparing checkout…</p>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: buildAppearance() }}>
      <Form slug={slug} />
    </Elements>
  );
}
```

- [ ] **Step 11: Write the inquire page and confirmation page**

`app/works/[slug]/inquire/inquire.module.css`:
```css
.wrap { padding: 56px var(--gutter); max-width: 520px; }
.title { font-size: clamp(26px, 4vw, 40px); }
.line { margin: 8px 0 8px; }
.price { font-family: var(--font-grotesk), sans-serif; font-size: 18px; margin-bottom: 28px; }
.testnote { color: var(--stone); margin: 28px 0 0; }
```

`app/works/[slug]/inquire/page.tsx`:
```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWork } from "@/data/works";
import { formatMeta } from "@/data/works";
import { formatPrice } from "@/data/format";
import { CheckoutPanel } from "@/components/checkout/CheckoutPanel";
import styles from "./inquire.module.css";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  return { title: work ? `Inquire — ${work.title}` : "Not found" };
}

export default async function Inquire({ params }: Params) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work || !work.available) notFound();

  return (
    <section className={styles.wrap}>
      <h1 className={styles.title}>{work.title}</h1>
      <p className={`meta ${styles.line}`}>{formatMeta(work)}</p>
      <p className={styles.price}>{formatPrice(work.priceCents)}</p>
      <CheckoutPanel slug={work.slug} />
      <p className={`meta ${styles.testnote}`}>
        Test mode. Use card 4242 4242 4242 4242, any future expiry, any CVC. No real payment is taken.
      </p>
    </section>
  );
}
```

`app/confirmed/page.tsx`:
```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getWork } from "@/data/works";

export const metadata: Metadata = { title: "Confirmed" };

type Search = { searchParams: Promise<{ work?: string; redirect_status?: string }> };

export default async function Confirmed({ searchParams }: Search) {
  const { work: slug, redirect_status } = await searchParams;
  const work = slug ? getWork(slug) : undefined;
  const ok = redirect_status === "succeeded";

  return (
    <section style={{ padding: "80px var(--gutter)", maxWidth: 520 }}>
      <h1>{ok ? "Thank you." : "Order incomplete."}</h1>
      <p className="meta" style={{ marginTop: 12 }}>
        {ok && work
          ? `${work.title} — a test-mode order. No real payment was taken and nothing ships.`
          : "No payment was completed."}
      </p>
      <p style={{ marginTop: 28 }}>
        <Link href="/works" className="subhead" style={{ borderBottom: "1px solid currentColor" }}>
          ← Back to works
        </Link>
      </p>
    </section>
  );
}
```

- [ ] **Step 12: Add the deferred-work anchor comment**

At the top of `app/api/checkout/route.ts`, add the anchor TODO (its sibling sites are `lib/stripe.ts` and `components/checkout/CheckoutPanel.tsx`):
```ts
// TODO(stripe-integration): production build-out lives in a future plan — live-key
// config gated to a real environment, webhook handling (payment_intent.succeeded),
// order persistence, fulfillment/receipt. This mockup implements ONLY the test-mode
// Payment Element flow. Anchor: docs/superpowers/specs/2026-06-18-tanaka-gallery-design.md §7.
// Siblings: lib/stripe.ts, components/checkout/CheckoutPanel.tsx.
```
Add a one-line sibling back-reference at the top of `lib/stripe.ts` and `components/checkout/CheckoutPanel.tsx`:
```ts
// TODO(stripe-integration): test-mode only — anchor: app/api/checkout/route.ts
```

- [ ] **Step 13: Run all checkout tests + manual verification**

Run: `npm test -- stripe checkout/route`
Expected: PASS — all 5.

Manual (needs real test keys in `.env.local`): `npm run dev`, visit a work → Inquire → the Stripe Payment Element renders themed to the palette → pay with `4242 4242 4242 4242` → redirect to `/confirmed` showing "Thank you." Without keys, the panel shows "This work is unavailable." / the route throws the test-mode guard — acceptable for the mockup.

- [ ] **Step 14: Commit**

```bash
git add lib app/api app/confirmed components/checkout "app/works/[slug]/inquire"
git commit -m "feat: add test-mode Stripe Payment Element checkout flow"
```

---

### Task 10: Route transitions, polish, and final verification

**Files:**
- Create: `app/template.tsx`, `app/not-found.tsx`, `app/works/[slug]/transition.module.css` (shared fade styles in `app/globals.css` instead)
- Modify: `app/globals.css` (fade keyframes), `README.md`
- Test: full suite + build

**Interfaces:**
- Consumes: `motion`, `useReducedMotion` from framer-motion.
- Produces: `app/template.tsx` — a client wrapper giving every route a 200ms fade-through (instant under reduced motion); `app/not-found.tsx` — themed 404; a `README.md` with run/test/Stripe instructions.

- [ ] **Step 1: Write `app/template.tsx`**

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Write `app/not-found.tsx`**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <section style={{ padding: "96px var(--gutter)", maxWidth: 520 }}>
      <h1>Not here.</h1>
      <p className="meta" style={{ marginTop: 12 }}>That page or work does not exist.</p>
      <p style={{ marginTop: 28 }}>
        <Link href="/" className="subhead" style={{ borderBottom: "1px solid currentColor" }}>
          ← Home
        </Link>
      </p>
    </section>
  );
}
```

- [ ] **Step 3: Write `README.md`**

```markdown
# Tanaka Projects — gallery mockup

A clean, minimal portfolio + sales mockup. Next.js (App Router), React, TypeScript,
Framer Motion. Checkout is **Stripe test mode only** — no real payments.

## Run
\`\`\`bash
npm install
npm run gen:placeholders   # writes public/works/*.svg art stand-ins
cp .env.example .env.local # add your Stripe TEST keys (sk_test_/pk_test_)
npm run dev
\`\`\`

## Test
\`\`\`bash
npm test
npm run build
\`\`\`

## Notes
- Light/dark follow your OS preference (`prefers-color-scheme`).
- Checkout test card: 4242 4242 4242 4242, any future expiry, any CVC.
- Deferred work is tracked inline: \`grep -rn "TODO(stripe-integration)"\`, \`TODO(theme-toggle)\`.
```

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: PASS — all suites (theme, format, selectors, Caption, home, morphStore, detail, artist, stripe, checkout/route) green.

- [ ] **Step 5: Run the production build**

Run: `npm run build`
Expected: build succeeds with no type errors; all routes compile (`/`, `/works`, `/works/[slug]`, `/works/[slug]/inquire`, `/artists`, `/artists/[slug]`, `/confirmed`, `/api/checkout`).

- [ ] **Step 6: Manual smoke pass**

Run: `npm run dev`. Verify: Home tagline; `/works` grid; click → morph to detail; `/artists` → artist → their works; a bad URL → themed 404; light/dark via OS setting; reduced-motion disables fades + morph.

- [ ] **Step 7: Commit**

```bash
git add app/template.tsx app/not-found.tsx README.md app/globals.css
git commit -m "feat: add route fade transitions, 404, and README"
```

---

## Self-Review

**Spec coverage check (spec → task):**
- §1 design system / palette / type roles → Task 2 (tokens, fonts), Global Constraints. ✓
- §1 theming light/dark via `prefers-color-scheme` → Task 2 (`globals.css` dark block + test). ✓ Manual toggle deferred → `TODO(theme-toggle)` carried in Global Constraints + README. ✓
- §2 IA (all 6 routes + api) → Home (5), Works (6), Work detail (7), Artists index/detail (8), checkout/confirmed (9), api/checkout (9). ✓
- §3 architecture (RSC + motion/Stripe islands, static typed data, selectors) → Tasks 3, 6, 7, 9. ✓
- §4 motion (baseline fade + signature morph + reduced-motion) → Task 10 (template fade), Task 7 (morph), reduced-motion in both. ✓
- §6 error handling (unknown slug → notFound, image fallback via `--stone` frame bg, checkout failure inline, reduced-motion) → Tasks 7, 8 (notFound tests), 6/7 (`--stone` frame/stage bg), 9 (inline error). ✓
- §7 Stripe test-mode only + guard + deferred anchor → Task 9 (`assertTestMode`, guard test, `TODO(stripe-integration)` anchor+siblings). ✓
- §8 testing (selectors, components, route handler, manual visual) → Tasks 3, 4, 9 + manual steps. ✓
- §9 roadmap phases → Tasks map 1→Foundation, 2→Foundation, 3/4→Data, 5–8→Core pages, 7+10→Motion, 9→Checkout, 10→Polish. ✓

**Placeholder scan:** No "TBD/implement later" steps; every code step shows full code. The two `TODO(...)` entries are intentional deferred-work anchors per the spec, not plan gaps. The intentional `line-study- ix` typo is explicitly flagged for correction in Task 3 Step 7 and re-checked by a test in Step 9. ✓

**Type consistency:** `Work.priceCents` used consistently (data, route `amount`, `formatPrice`). `setMorphOrigin`/`takeMorphOrigin`/`Rect` consistent across Tasks 6–7. `getWork`/`getArtist`/`worksByArtist`/`allWorks`/`allArtists`/`formatMeta`/`formatPrice` signatures match every call site. `assertTestMode`/`stripe` consistent between `lib/stripe.ts` and the route. Next 15 async `params`/`searchParams` (Promise) handled uniformly in Tasks 7–9. ✓
