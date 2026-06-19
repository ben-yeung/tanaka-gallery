# Tanaka Gallery — Page Splash Intro Sequences Design Spec

**Date:** 2026-06-19
**Status:** Approved (brainstorming)
**Type:** Frontend feature — follow-up to the mockup + gallery-grid specs
**Parent specs:**
- `docs/superpowers/specs/2026-06-18-tanaka-gallery-design.md` (motion baseline, §4)
- `docs/superpowers/specs/2026-06-18-tanaka-gallery-gallery-grid-design.md` (snake entrance, §3)

## Summary

An orchestrated **splash intro sequence** that animates the navbar, page header/hero,
and section content into place as one continuous, narrative-matched motion sequence on
first page load. It extends the existing motion language — the 200ms route fade-through,
the signature grid→detail morph, and the ceremonial "vertical-snake" grid entrance —
**without changing any of them**. The splash reuses the established motion vocabulary
(slide-fade + soft blur, easing `cubic-bezier(0.22, 1, 0.36, 1)`, ceremonial pace) so it
reads as the same family.

The intro is a **landing ceremony**: it plays once per full document load on the page the
visitor lands on, then steps aside for the lighter in-session fade-through.

## Goals

- Give the navbar, hero/header, and section content a deliberate, high-craft entrance
  that matches the brand narrative ("Art. 侘び寂び. San Francisco. Made in Japan. Curated
  in SF.").
- Reuse the existing motion vocabulary so the splash is consistent with the snake entrance
  and the signature morph — one coherent motion language, not a second one.
- Fire the heavy sequence sparingly (once per document load) so it never feels repetitive
  and never competes with the signature grid→detail morph.
- Honor `prefers-reduced-motion` as a first-class state.

## Non-Goals

- No change to the route fade-through (`app/template.tsx`), the grid→detail morph, or the
  grid snake entrance choreography.
- No splash on detail pages (`/works/[slug]`, `/artists/[slug]`), `/confirmed`, the inquire
  flow, or 404 — only the three index pages get bespoke content beats (the navbar's own
  first-load entrance is global; see §4).
- No replay of the splash on client-side navigation (it is strictly a first-document-load
  ceremony).
- No `sessionStorage`/persisted flag — the App Router root-layout lifecycle is the signal
  (§2).
- No scroll-triggered / on-scroll section reveals (this is an above-the-fold intro only).
- No footer entrance choreography.

## 1. Scope & Triggers

**Pages with a bespoke content sequence:** `/` (Home), `/artists`, `/works`. Any one of
them can be the session's landing page (deep link / hard refresh), so each defines its own
content beats.

**Trigger model — once per full document load:**

- The full splash (navbar lead → page content beats) plays on the **initial document load**
  of whichever page the visitor lands on, and on a **hard refresh**.
- All **client-side navigation** (Next `<Link>`) uses the existing 200ms fade-through in
  `app/template.tsx` — **no splash replay**.
- The mechanism is the App Router lifecycle, not a stored flag: the root layout persists
  across client navigation and only remounts on a full document load (§2).

**`/works` handoff:** the splash covers the navbar + the `Works` header + the sort bar; the
existing **snake entrance then plays as the next beat**. The snake keeps its current trigger
(plays on any fresh grid visit, skipped on morph-return) and its current choreography — the
only addition is a lead-delay when `/works` is a first-load landing (§3.3).

## 2. Architecture (Approach A — Framer Motion variants + orchestration)

Builds on the parent plan's `components/motion/` island structure. Chosen over an imperative
WAAPI timeline (B) and CSS-only delay chains (C) because the project already depends on
Framer Motion, variants express staged sequences declaratively via `delayChildren` /
`staggerChildren`, the first-load gate is isolated in one provider, and reduced-motion is a
single variant swap. (Decision log §7.)

### 2.1 The first-load gate

A `SplashProvider` client component lives in the **root layout** (`app/layout.tsx`),
wrapping the page region. Because the App Router root layout **persists across client-side
navigation and only remounts on a full document load**, a ref it holds is `true` only during
the initial hydration of a fresh load / hard refresh and `false` for all in-session `<Link>`
navigation. **No `sessionStorage` needed** — the layout's lifecycle is the signal.

- `useSplashGate()` exposes a read-only `isInitialLoad: boolean`.
- Each consumer **snapshots it once at mount** (`useState(() => gate.isInitialLoad)`) so a
  later context update never restarts an in-flight animation.
- After the landing page's reveal mounts, it calls `gate.consume()` to flip the flag `false`
  for subsequent navigations. Because both the `/works` header and the grid read the snapshot
  during the *same* first paint, both correctly see `true` before `consume()` runs.

### 2.2 Reveal primitives (`components/motion/splash/`)

- **`SplashProvider.tsx`** — context provider (the gate, §2.1). Mounted in the root layout.
- **`SplashSequence.tsx`** — the per-page orchestrator. If its snapshot of `isInitialLoad`
  is `true`, it runs a Framer Motion parent variant with `delayChildren` (so the navbar
  leads) + `staggerChildren`. If `false`, it renders children at rest (`initial={false}`)
  and the existing `template.tsx` fade-through owns the transition.
- **`SplashItem.tsx`** — a child reveal using the **established grid vocabulary**:
  `opacity 0→1`, `filter: blur(8px) brightness(1.12) → none`, `transform: translateY(28px)
  → 0`, easing `cubic-bezier(0.22, 1, 0.36, 1)`. Text travels less than the grid's 80px
  tiles so it reads calm rather than theatrical. Beats reveal in DOM order via the parent
  stagger.
- **Furigana settle** — a specialized variant for the hero's `.rt` readings (わ / さ): the
  reading starts slightly higher + faded and settles to its resting offset a beat *after*
  its kanji. Implemented as a dedicated variant applied to the `.rt` elements (or a small
  wrapper) within the hero's headline beat.

### 2.3 Shared timing module

**`components/motion/splash/timing.ts`** — the single source of truth for beat durations and
offsets (navbar logo-draw, wordmark, links; `CONTENT_START`; `HEADER_DURATION`; per-beat
stagger; reduced-motion variants). `Nav` and each page's `SplashSequence` import these
constants so the navbar lead and the content/snake handoff stay in lockstep **without runtime
measurement**. All values are tunable at the manual checkpoint (§6).

### 2.4 Logo draw

`components/ui/Logo.tsx` gains an optional `animated` prop. When set, `Nav` renders the
mark's `rect`/`line` strokes via Framer `motion` elements with `pathLength: 0 → 1` (declarative
stroke-on draw). When unset (every other placement of `Logo`), it renders exactly as today.

### 2.5 Touched files

| File | Change |
|---|---|
| `app/layout.tsx` | Mount `SplashProvider` around the page region |
| `components/ui/Nav.tsx` | Staged beats (logo draw → wordmark → links); reads timing module |
| `components/ui/Logo.tsx` | Optional `animated` prop rendering `pathLength` strokes |
| `app/page.tsx` | Wrap hero + Selected Works in `SplashSequence`/`SplashItem` (meaning order) |
| `app/artists/page.tsx` | Wrap header + artist rows in `SplashSequence`/`SplashItem` |
| `app/works/page.tsx` | Wrap `Works` header + sort bar in `SplashSequence`/`SplashItem` |
| `components/motion/WorkGrid.tsx` | Lead-delay the snake on a first-load landing (§3.3) |
| `components/motion/splash/*` | New module: provider, sequence, item, timing |

`app/template.tsx` is **unchanged**: it wraps only the page content (not the navbar), and its
brief 200ms parent fade is harmless beneath the longer child stagger.

## 3. Choreography & Timeline

All numeric values live in `timing.ts` and are tunable at the manual checkpoint (§6).
Vocabulary is the grid family (easing `cubic-bezier(0.22, 1, 0.36, 1)`); text travels ~28px
with `blur(8px)` so it reads calm.

### 3.1 Beat 0 — Navbar (leads on every first load, all pages)

| Beat | Start | Motion |
|---|---|---|
| Logo draw | 0ms | `pathLength 0→1` (strokes draw on), ~700ms |
| Wordmark | ~350ms | fade + 12px slide-in, ~600ms |
| Links (Works, Artists) | ~650ms | fade in, ~80ms stagger between them |

Navbar settled ≈1150ms. **`CONTENT_START` ≈ 900ms** — page content begins a beat *before*
the navbar fully lands, so they overlap gracefully rather than feeling sequential-and-stiff.

### 3.2 Home hero — meaning-ordered (from `CONTENT_START`, ~220ms stagger)

1. `Art.` rises + settles
2. 侘び寂び kanji rise → **furigana わ / さ settle ~200ms after** (drop from slightly higher
   + fade to their resting offset)
3. `San Francisco.`
4. subline *Made in Japan. Curated in SF.*
5. **Selected Works section** (`.note` header + "View (N) Selected Works →") as the closing
   beat, flowing continuously from the headline.

### 3.3 `/works` — sequential handoff (snake unchanged)

Navbar (Beat 0) → `Works` header rises (one beat) → `GallerySortBar` fades in just under it
→ **then the existing snake** starts after `HEADER_DURATION`.

`WorkGrid` reads `isInitialLoad`:

- **First-load landing at `/works`:** apply the `HEADER_DURATION` lead-delay before starting
  the snake, so header → snake reads as one continuous sequence.
- **In-session nav to `/works`** (no splash): start the snake promptly, exactly as today.
- **Morph-return:** unchanged — `consumeGalleryReturn` still skips the snake; no splash fires
  (it's client navigation, not a document load).

The snake choreography, timing, and reduced-motion branch are otherwise untouched.

### 3.4 `/artists`

Navbar → `Artists` header + subhead rise (one beat) → artist rows stagger in down the list in
reading order (~100ms stagger), reusing `SplashItem`.

### 3.5 Reduced motion (`prefers-reduced-motion: reduce`)

Mirrors the grid's existing reading — first-class, not an error state:

- **Opacity-only**: no translate, no blur, no brightness, **no logo draw** (the logo fades in
  as a unit with the navbar).
- Faster (~450ms), small ~60ms stagger, strict top-down reading order.
- Furigana appears **with** its kanji (no separate settle).
- The snake's own reduced-motion branch is unchanged; the `/works` handoff still leads with
  the header then the snake's reduced fallback.

## 4. Error & Edge Handling

- **FOUC / SSR:** Framer renders the `hidden` initial variant into the SSR markup, so content
  paints hidden and animates in — no flash of fully-visible-then-hidden content. A no-JS
  fallback (content permanently hidden without JS) is **out of scope**, consistent with the
  existing motion islands.
- **Landing on a non-splash page first** (e.g. `/works/[slug]`, `/confirmed`, 404): the navbar
  **still does its first-load draw** (it is global), but there is no bespoke content sequence —
  that page's content uses the existing template fade. Navbar intro = "any first document
  load"; only the three index pages add content beats.
- **Client-side navigation between the three pages:** no splash; the 200ms fade-through
  handles it; no replay.
- **Morph return to `/works`:** client navigation, not a document load → no splash; existing
  `consumeGalleryReturn` snake-skip logic untouched (§3.3).
- **Resize during entrance:** the text/section reveals are not position-derived (unlike the
  snake), so there is nothing to recompute.

## 5. Testing

- **Unit — gate (`useSplashGate` / `SplashProvider`):** the first consumer reads
  `isInitialLoad === true`; after `consume()`, subsequent reads are `false` (the
  in-session-nav contract). Timing constants exist and are ordered
  (navbar beats < `CONTENT_START` < content; `HEADER_DURATION` defined).
- **Component:**
  - `SplashSequence` runs the play variant when its snapshot is `true` and renders at rest
    (`initial={false}`) when `false`.
  - `Nav` renders animated logo paths when on a first load.
  - **Reduced-motion variant asserts opacity-only** (no transform/filter terms).
- **Interaction / manual:**
  - Full document load on each of the three pages plays its bespoke intro.
  - Client navigation between them uses the fade-through with **no replay**.
  - `/works` plays header → snake in sequence on a first-load landing.
  - Furigana settle and logo draw read correctly.
  - Reduced-motion is opacity-only end to end.
- **jsdom guards** mirror `WorkGrid` (`typeof el.animate !== "function"` where any imperative
  animation is used).

## 6. Manual Checkpoint (timing tune)

`TODO(splash-timing): tune the timing.ts constants by eye at the manual checkpoint — navbar
beat durations/offsets, CONTENT_START overlap, the ~28px text rise vs. the grid's 80px, the
~220ms hero stagger, the furigana settle delay (~200ms), and HEADER_DURATION so the /works
header→snake handoff reads as one continuous sequence. Verify against reduced-motion.
Anchor site: this spec §3 / §6. Sibling site: components/motion/splash/timing.ts.`

## 7. Decision Log (brainstorming)

- **Scope:** Home + section pages (`/`, `/artists`, `/works`) each get a tailored intro —
  over Home-only (too narrow) or every page (repetitive, fights the morph).
- **Trigger:** once per full document load — over first-entry-per-page-per-session (needs a
  stored flag) or every-page-entry (repetitive). The root-layout lifecycle is the signal.
- **`/works` relationship:** sequential handoff with the snake **unchanged** — over making
  the snake first-load-only (changes beloved behavior) or overlapping header into snake
  (busy, against the disciplined aesthetic).
- **Hero character:** meaning-ordered reveal with a **furigana settle** micro-gesture — over
  a unified single-line rise or a plain word-by-word stagger; the furigana settle is a small
  wabi-sabi signature.
- **Navbar:** staged — **logo draws**, then wordmark, then links — over a whole-bar fade or
  logo+wordmark-together; the stroke-on logo draw is the opening signature.
- **Mechanism:** Framer Motion variants + orchestration (Approach A) — over an imperative
  WAAPI timeline (B) or CSS-only delay chains (C).
