# Tanaka Gallery — Design Spec

**Date:** 2026-06-18
**Status:** Approved (brainstorming)
**Type:** Frontend mockup (no production backend)

## Summary

A clean, minimal portfolio and sales website for the fictional gallery **Tanaka
Projects — Contemporary Art & Objects** (founder Ren Tanaka). This is a **mockup
design project**: there is no production backend and no real data. The one
exception is checkout, which uses Stripe in **test mode only** (see §7).

The aesthetic is a **hybrid**: the disciplined, slightly-cold structure of a
"designed in 2003 and maintained ever since" gallery site (grotesk body, lots of
whitespace, small type, edge-to-edge art photography, terse voice), warmed by a
cream/beige paper ground and a serif display face. Tagline: **Art. Objects. San
Francisco.**

## Goals

- A coherent, high-craft mockup demonstrating layout, typography, theming, and
  one signature interactive transition.
- Clean, maintainable architecture on the named stack: Next.js (App Router),
  React, TypeScript, Framer Motion.
- A real-but-sandboxed Stripe checkout flow that never accepts a real payment.

## Non-Goals

- No production backend, CMS, auth, database, or real inventory.
- No real payment processing or order fulfillment (test mode only).
- No manual theme toggle in the initial build (system-preference driven; manual
  toggle is a deferred stub — see §3).

## 1. Design System — "disciplined gallery, quiet warmth"

**Layout language.** Generous whitespace, small type, hairline rules, generous
margins. Art photography is **edge-to-edge, no border**. Metadata is terse:
`Title · Artist · Year`. Voice is clipped — one sentence maximum, anywhere.

**Type — three roles, deliberate contrast.**
- **EB Garamond** (serif display) — large headers, work titles, artist names, the
  tagline. The "quiet Japanese sensibility / serif accent."
- **Space Grotesk** (modern grotesque) — subheaders / section labels. The
  "robotica" register: a modern, faintly mechanical voice that visibly contrasts
  the serif headers above it.
- **Inter** (neutral grotesk) — all body and functional text: nav, captions,
  metadata, UI. Small sizes, tight tracking. The disciplined web stand-in for the
  brief's Helvetica (no paid license required).

Pairing intent: serif header → grotesque subheader → neutral body, so the
typographic hierarchy is legible by *typeface*, not just size.

**Theming — light & dark, system-preference driven.** Two themes expressed as
CSS custom-property token sets, switched via `prefers-color-scheme`. Components
**never use color literals** — they only read `var(--token)`. Light mode is the
cream/beige paper feel; dark mode is an ink/charcoal/slate aesthetic.

| Token | Role | Light (cream/paper) | Dark (ink/charcoal/slate) |
|---|---|---|---|
| `--paper` | ground | `#F4F1EA` | `#1C1E1F` |
| `--ink` | text | `#1A1A18` | `#E8E6E0` |
| `--matcha` | accent (links/hover, Inquire) | `#7C8A6B` | `#8C9B7A` |
| `--stone` | hairlines, captions, secondary | `#7E766A` | `#5A5E60` |

(Hex values are starting points, tunable during implementation.)

Edge-to-edge art photography is theme-agnostic — it always fills the screen;
only the surrounding chrome (cream ↔ slate) swaps.

`TODO(theme-toggle): add a discreet manual light/dark override (persisted to
localStorage, defaulting to system). Deferred from initial build to preserve the
"no unnecessary chrome" discipline. See spec §3 / roadmap phase 6.`

## 2. Information Architecture

| Route | Purpose |
|---|---|
| `/` | Home — tagline, terse featured index/rotation |
| `/works` | Gallery grid — all artworks; origin of the signature morph |
| `/works/[slug]` | Work detail — full-bleed image + terse meta + Inquire/checkout |
| `/artists` | Artists index — the 20 represented artists (half Japanese, half Bay Area) |
| `/artists/[slug]` | Artist detail — terse bio + that artist's available works |
| `/api/checkout` | Route Handler — creates a test-mode Stripe PaymentIntent |

The **signature transition** lives on the `/works` → `/works/[slug]` edge.

## 3. Architecture (Next.js App Router)

**Rendering split.** App Router. Server Components own structure, data, and
content (the gallery data is static, so most of the tree is RSC). Motion is
isolated into small Client Component "islands" (`"use client"`) — the grid tile,
the transition wrapper, hover affordances. This keeps the client JS surface small
and data flow one-directional.

**Data (mockup, no backend).** Static, typed TS modules are the single source of
truth:
- `data/types.ts` — `Artist`, `Work` types.
- `data/artists.ts` — 20 artists, typed `Artist[]`.
- `data/works.ts` — artworks, typed `Work[]`, each referencing an `artistSlug`.
- Selector helpers (`getWork(slug)`, `worksByArtist(slug)`) so pages never reach
  into raw arrays.
- Placeholder imagery in `/public`, referenced by path.

**Checkout.** A single Route Handler creates the test-mode PaymentIntent; the
embedded Stripe Payment Element renders on-site (see §7).

## 4. Motion

Restrained baseline plus **one signature gesture**.

- **Baseline:** 200ms fade-through on route changes; images fade in as they load;
  subtle hover affordances (e.g. title underline). No parallax, no bounce, no
  scroll-jacking.
- **Signature gesture:** clicking a work in the grid **morphs that image
  full-bleed** into the detail view. Implemented with Framer Motion shared-layout
  (`layoutId={`work-${slug}`}`) inside a persistent client `AnimatePresence`
  hosted in a route `template.tsx`. FLIP-style transition from grid cell →
  full-bleed detail.
- **Accessibility:** `prefers-reduced-motion` collapses both baseline and
  signature motion to instant cuts.

## 5. Folder Structure

```
tanaka-gallery/
├─ app/
│  ├─ layout.tsx              # root: fonts, theme tokens, <html>, base chrome
│  ├─ template.tsx            # persistent AnimatePresence (route transitions)
│  ├─ page.tsx                # Home
│  ├─ globals.css             # token sets (light/dark via prefers-color-scheme)
│  ├─ works/
│  │  ├─ page.tsx             # gallery grid (RSC) + WorkGrid island
│  │  └─ [slug]/page.tsx      # work detail, full-bleed (morph target)
│  ├─ artists/
│  │  ├─ page.tsx             # artists index
│  │  └─ [slug]/page.tsx      # artist detail + their works
│  └─ api/
│     └─ checkout/route.ts    # Route Handler: test-mode PaymentIntent
├─ components/
│  ├─ motion/                 # client islands: WorkGrid, MorphImage, FadeThrough
│  ├─ checkout/               # CheckoutPanel (Payment Element + Appearance theme)
│  └─ ui/                     # Nav, Footer, Caption, Hairline — presentational
├─ data/
│  ├─ artists.ts              # Artist[] + selectors
│  ├─ works.ts                # Work[] + selectors (getWork, worksByArtist)
│  └─ types.ts                # Artist, Work types
├─ lib/
│  ├─ stripe.ts               # server: test-mode Stripe client
│  └─ theme.ts                # Appearance API tokens mapped from CSS vars
├─ public/                    # placeholder art imagery, fonts if self-hosted
├─ .env.example               # NEXT_PUBLIC_STRIPE_* + STRIPE_SECRET (test)
└─ (config: next, ts, eslint, prettier)
```

Principle: `data/` and `components/ui/` are pure and presentational; motion and
Stripe complexity are quarantined into `components/motion/` and
`components/checkout/` so the rest of the app stays calm and readable.

## 6. Error Handling

- **Unknown slug** (`/works/[slug]`, `/artists/[slug]`): selectors return
  `undefined` → page calls `notFound()` → themed 404.
- **Image load failure:** captioned placeholder block in `--stone`; layout never
  collapses.
- **Checkout failures:** Stripe's own validation/decline UI (test cards) surfaces
  inline within the Payment Element. The Route Handler returns typed errors; the
  panel shows a terse failure state.
- **Reduced motion:** treated as a first-class state, not an error — all motion
  becomes instant.

## 7. Checkout — Stripe Test Mode Only

**Scope for this mockup:** a **real Stripe Payment Element**, rendered on-site,
running strictly in **test mode**, that **never accepts a real payment**.

- Test API keys only (`pk_test_…` / `sk_test_…`) in `.env.local`;
  `.env.example` documents the variables. No live keys, ever, in this project.
- `app/api/checkout/route.ts` creates a **test-mode PaymentIntent** via the
  server Stripe client (`lib/stripe.ts`).
- `components/checkout/CheckoutPanel` mounts `<PaymentElement>` via
  `@stripe/react-stripe-js`, themed to the cream/slate palette with Stripe's
  **Appearance API** (`lib/theme.ts`).
- Payment uses Stripe **test cards** (e.g. `4242 4242 4242 4242`). Real Stripe
  validation, success, and decline UI — all sandboxed.
- On (test) success: a terse confirmation screen. No receipts emailed, no order
  persisted, no fulfillment.

`TODO(stripe-integration): build out production checkout in a future plan —
live-key configuration gated to a real environment, webhook handling
(payment_intent.succeeded), order persistence, fulfillment/receipt, and a guard
so test and live modes can never be confused. The mockup deliberately implements
ONLY the test-mode Payment Element flow above. Anchor site: this spec §7. Sibling
sites (to be created during implementation): app/api/checkout/route.ts,
lib/stripe.ts, components/checkout/CheckoutPanel.`

## 8. Testing

- **Unit:** data selectors (`getWork`, `worksByArtist`) — found, not-found,
  cross-references resolve.
- **Component:** UI primitives render with both theme token sets; `Caption`/meta
  formatting (`Title · Artist · Year`).
- **Interaction:** grid→detail morph mounts and resolves; `prefers-reduced-motion`
  disables motion; 404 path for unknown slugs.
- **Checkout:** Route Handler returns a test-mode client secret; panel mounts the
  Payment Element; test-card success reaches the confirmation screen. (Assert
  test mode; no live-key path exists.)
- **Manual:** light/dark via OS preference; full-bleed imagery across breakpoints.

## 9. Roadmap (Phases)

1. **Foundation** — Next.js + TS scaffold, fonts (EB Garamond / Space Grotesk /
   Inter), token-based
   theming with light/dark via `prefers-color-scheme`, root layout + Nav/Footer.
2. **Data + content model** — `types.ts`, `artists.ts`, `works.ts` + selectors,
   placeholder imagery.
3. **Core pages (static)** — Home, Works grid, Work detail, Artists index/detail —
   edge-to-edge art, terse meta, no motion yet.
4. **Motion** — fade-through route transitions, then the signature `layoutId`
   grid→detail morph; honor `prefers-reduced-motion`.
5. **Checkout (test mode)** — Route Handler + PaymentIntent, embedded Payment
   Element themed via Appearance API, test-card flow, confirmation. See §7 TODO.
6. **Polish** — empty/loading states, metadata/OG, accessibility pass, optional
   manual dark-mode toggle (currently a `TODO(theme-toggle)` stub).

## Content Reference

**Tanaka Projects** — founded 2001, Hayes Valley, San Francisco. Founder Ren
Tanaka (b. Osaka, 1976). Represents 20 artists, half Japanese, half Bay Area.
Voice: terse, avoids the art world's adjective problem — titles and dates, maybe
one sentence. Aesthetic confident and unchanged. Tagline: **Art. Objects. San
Francisco.**
