# Artist & Medium Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the gallery's content roster with a fresh all-Japanese set of 10 artists / 14 works centered on ceremonial teaware/ceramics and watercolor/sumi-e/woodblock/nihonga, and keep every downstream mirror (placeholder generator, generated SVGs, tests) in sync.

**Architecture:** Pure content swap. `data/artists.ts` and `data/works.ts` are the single source of truth; page components, motion, theming, and Stripe checkout are untouched. The only other files that change are the placeholder generator (which hard-copies the work list), the generated SVGs, and the tests that assert concrete fixtures. `data/types.ts` does not change.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Vitest, Node ESM script for placeholder generation.

## Global Constraints

- Roster is **fully Japanese**; 10 artists / 14 works exactly.
- `data/types.ts` (`Artist`, `Work` shapes) must NOT change.
- `priceCents` is USD cents (Stripe-ready); `image` is always `/works/<slug>.svg`.
- Bios stay terse — one line, house voice, no adjective pile-ups.
- Retained verbatim: artist `saburo-ohta` and `mika-narita`; works `line-study-iii` and `line-study-ix` (slug, title, medium, year, dimensions, price, availability unchanged). `line-study-ix` stays `available: false`.
- Exactly two works unavailable: `kuro-hagi-bowl` and `line-study-ix`.
- The spec lives at `docs/superpowers/specs/2026-06-19-artist-medium-rework-design.md`; `docs/artwork-image-prompts.md` is already rewritten and committed — do NOT regenerate it here.
- No copy changes to `app/page.tsx` (tagline / About) — the existing copy is accurate for an all-Japanese roster sold from the SF gallery.

---

### Task 1: Rebuild artist & work data and repoint dependent tests

**Files:**
- Modify: `data/artists.ts` (replace the `artists` array)
- Modify: `data/works.ts` (replace the `works` array)
- Modify: `data/types.ts:17` (comment example only)
- Test (modify): `data/selectors.test.ts`
- Test (modify): `components/ui/Caption.test.tsx`
- Test (modify): `app/works/[slug]/detail.test.tsx`
- Test (modify): `app/api/checkout/route.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: the canonical roster every other consumer reads via existing selectors `allArtists()`, `getArtist(slug)`, `allWorks()`, `getWork(slug)`, `worksByArtist(slug)`, `formatMeta(work)` (all signatures unchanged). Anchor fixtures later steps/tasks rely on:
  - Artist `saburo-ohta` → name "Saburo Ohta", exactly 2 works.
  - Work `mizusashi-ash-fall` → title "Mizusashi (Ash Fall)", artist saburo-ohta, year 2019, priceCents 130000, available true.
  - `formatMeta(getWork("mizusashi-ash-fall")!)` → `"Mizusashi (Ash Fall) · Saburo Ohta · 2019"`.
  - Work `line-study-ix` → available false (retained).

- [ ] **Step 1: Update the canonical selector test to the new anchors (the failing test)**

In `data/selectors.test.ts`, change the two assertions that reference the removed `untitled-vessel`. Leave every other assertion unchanged (`getArtist("saburo-ohta")`, the `>= 8` count, `worksByArtist("saburo-ohta")` length 2, and the structural loops all still hold).

Replace line ~19:
```ts
    expect(getWork("untitled-vessel")?.title).toBe("Untitled (Vessel)");
```
with:
```ts
    expect(getWork("mizusashi-ash-fall")?.title).toBe("Mizusashi (Ash Fall)");
```

Replace line ~43:
```ts
    expect(formatMeta(getWork("untitled-vessel")!)).toBe("Untitled (Vessel) · Saburo Ohta · 2019");
```
with:
```ts
    expect(formatMeta(getWork("mizusashi-ash-fall")!)).toBe("Mizusashi (Ash Fall) · Saburo Ohta · 2019");
```

- [ ] **Step 2: Run the selector test and confirm it fails**

Run: `npm test -- data/selectors.test.ts`
Expected: FAIL — `getWork("mizusashi-ash-fall")` returns `undefined` (slug not in data yet), so `?.title` is `undefined` and `formatMeta` throws / mismatches.

- [ ] **Step 3: Replace the artists array**

Overwrite the `artists` array in `data/artists.ts` with the 10-artist roster (helper functions `allArtists` / `getArtist` and the import stay exactly as they are):

```ts
export const artists: Artist[] = [
  { slug: "saburo-ohta", name: "Saburo Ohta", origin: "Imbe, Okayama", born: 1968, bio: "Wood-fired Bizen. Thrown and left unglazed." },
  { slug: "kenji-mori", name: "Kenji Mori", origin: "Hagi, Yamaguchi", born: 1971, bio: "Hagi ware. The glaze warms with use." },
  { slug: "yuki-hara", name: "Yuki Hara", origin: "Kyoto, Japan", born: 1980, bio: "Raku. Hand-built, fired fast." },
  { slug: "aiko-tani", name: "Aiko Tani", origin: "Kanazawa, Japan", born: 1984, bio: "Watercolor. Mountains losing themselves in mist." },
  { slug: "sora-maeda", name: "Sora Maeda", origin: "Matsumoto, Japan", born: 1989, bio: "Watercolor. One season per sheet." },
  { slug: "rei-kobayashi", name: "Rei Kobayashi", origin: "Nara, Japan", born: 1976, bio: "Watercolor and gofun. Deer, and the space around them." },
  { slug: "mika-narita", name: "Mika Narita", origin: "Kyoto, Japan", born: 1981, bio: "Ink on paper. Repetition until the line forgets itself." },
  { slug: "jun-asano", name: "Jun Asano", origin: "Tokyo, Japan", born: 1973, bio: "Sumi-e. The ensō and the breath that draws it." },
  { slug: "haru-sasaki", name: "Haru Sasaki", origin: "Tokyo, Japan", born: 1979, bio: "Shin-hanga woodblock. Snow on quiet streets." },
  { slug: "emi-takagi", name: "Emi Takagi", origin: "Kyoto, Japan", born: 1985, bio: "Nihonga. Mineral pigment over gofun, gold ground." },
];
```

- [ ] **Step 4: Replace the works array**

Overwrite the `works` array in `data/works.ts` with the 14-work roster (imports and the helper functions `allWorks` / `getWork` / `worksByArtist` / `formatMeta` stay exactly as they are):

```ts
export const works: Work[] = [
  { slug: "mizusashi-ash-fall", title: "Mizusashi (Ash Fall)", artistSlug: "saburo-ohta", year: 2019, medium: "wood-fired Bizen stoneware", dimensions: "11 × 8 × 8 in", priceCents: 130000, image: "/works/mizusashi-ash-fall.svg", available: true },
  { slug: "chawan-no-7", title: "Chawan No. 7", artistSlug: "saburo-ohta", year: 2021, medium: "wood-fired Bizen stoneware", dimensions: "5 × 5 × 4 in", priceCents: 95000, image: "/works/chawan-no-7.svg", available: true },
  { slug: "hagi-chawan", title: "Hagi Chawan", artistSlug: "kenji-mori", year: 2020, medium: "Hagi-ware stoneware", dimensions: "5 × 5 × 4 in", priceCents: 110000, image: "/works/hagi-chawan.svg", available: true },
  { slug: "kuro-hagi-bowl", title: "Kuro-Hagi Bowl", artistSlug: "kenji-mori", year: 2022, medium: "Hagi-ware stoneware", dimensions: "5 × 5 × 3 in", priceCents: 98000, image: "/works/kuro-hagi-bowl.svg", available: false },
  { slug: "black-raku-chawan", title: "Black Raku Chawan", artistSlug: "yuki-hara", year: 2023, medium: "raku-fired earthenware", dimensions: "5 × 4 × 4 in", priceCents: 145000, image: "/works/black-raku-chawan.svg", available: true },
  { slug: "mist-over-tateyama", title: "Mist Over Tateyama", artistSlug: "aiko-tani", year: 2021, medium: "watercolor on paper", dimensions: "22 × 30 in", priceCents: 72000, image: "/works/mist-over-tateyama.svg", available: true },
  { slug: "rain-faint", title: "Rain, Faint", artistSlug: "aiko-tani", year: 2023, medium: "watercolor on paper", dimensions: "18 × 24 in", priceCents: 58000, image: "/works/rain-faint.svg", available: true },
  { slug: "late-plum", title: "Late Plum", artistSlug: "sora-maeda", year: 2022, medium: "watercolor on paper", dimensions: "14 × 11 in", priceCents: 46000, image: "/works/late-plum.svg", available: true },
  { slug: "field-before-snow", title: "Field, Before Snow", artistSlug: "rei-kobayashi", year: 2020, medium: "watercolor and gofun on paper", dimensions: "24 × 36 in", priceCents: 88000, image: "/works/field-before-snow.svg", available: true },
  { slug: "line-study-iii", title: "Line Study III", artistSlug: "mika-narita", year: 2020, medium: "ink on paper", dimensions: "30 × 22 in", priceCents: 64000, image: "/works/line-study-iii.svg", available: true },
  { slug: "line-study-ix", title: "Line Study IX", artistSlug: "mika-narita", year: 2022, medium: "ink on paper", dimensions: "30 × 22 in", priceCents: 64000, image: "/works/line-study-ix.svg", available: false },
  { slug: "enso-one-breath", title: "Ensō (One Breath)", artistSlug: "jun-asano", year: 2021, medium: "ink on paper", dimensions: "27 × 27 in", priceCents: 70000, image: "/works/enso-one-breath.svg", available: true },
  { slug: "snow-yanaka", title: "Snow, Yanaka", artistSlug: "haru-sasaki", year: 2019, medium: "woodblock print", dimensions: "17 × 11 in", priceCents: 52000, image: "/works/snow-yanaka.svg", available: true },
  { slug: "camellia-single-stem", title: "Camellia, Single Stem", artistSlug: "emi-takagi", year: 2023, medium: "nihonga, mineral pigment on paper", dimensions: "20 × 16 in", priceCents: 120000, image: "/works/camellia-single-stem.svg", available: true },
];
```

- [ ] **Step 5: Run the selector test and confirm it passes**

Run: `npm test -- data/selectors.test.ts`
Expected: PASS (all describe blocks green).

- [ ] **Step 6: Repoint the remaining data-dependent tests**

These three tests assert the removed `untitled-vessel` fixture and break once Steps 3–4 land. Repoint each to the `mizusashi-ash-fall` anchor.

`components/ui/Caption.test.tsx` — replace lines 8–9:
```tsx
    render(<Caption work={getWork("untitled-vessel")!} />);
    expect(screen.getByText("Untitled (Vessel) · Saburo Ohta · 2019")).toBeInTheDocument();
```
with:
```tsx
    render(<Caption work={getWork("mizusashi-ash-fall")!} />);
    expect(screen.getByText("Mizusashi (Ash Fall) · Saburo Ohta · 2019")).toBeInTheDocument();
```

`app/works/[slug]/detail.test.tsx` — replace lines 14 and 16:
```tsx
    const ui = await WorkDetail({ params: Promise.resolve({ slug: "untitled-vessel" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Untitled (Vessel)" })).toBeInTheDocument();
```
with:
```tsx
    const ui = await WorkDetail({ params: Promise.resolve({ slug: "mizusashi-ash-fall" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Mizusashi (Ash Fall)" })).toBeInTheDocument();
```

`app/api/checkout/route.test.ts` — replace lines 22 and the amount in the assertion at ~25–27:
```ts
    const res = await call({ slug: "untitled-vessel" });
```
with:
```ts
    const res = await call({ slug: "mizusashi-ash-fall" });
```
and:
```ts
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 120000, currency: "usd" }),
    );
```
with:
```ts
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 130000, currency: "usd" }),
    );
```
Leave the `line-study-ix` unavailable-work test unchanged — that slug is retained and still `available: false`.

- [ ] **Step 7: Update the stale comment example in types.ts**

In `data/types.ts:17`, update the comment so it doesn't cite a removed slug:
```ts
  image: string; // public path, e.g. "/works/mizusashi-ash-fall.svg"
```

> Note: `lib/gallery.test.ts` and `components/home/tests/Spotlight.test.tsx` contain LOCAL fixture names ("Ken Arai", "Iris Lund") that coincide with old artists but are arbitrary test data — `lib/gallery.test.ts`'s alphabetical-sort expectations are tuned to those exact strings. Leave both files untouched; changing the names would break the sort assertions for no functional gain.

- [ ] **Step 8: Run the full unit suite and confirm green**

Run: `npm test`
Expected: PASS — all test files green, including `app/artists/[slug]/artist.test.tsx` ("2 works" for retained `saburo-ohta`), `app/artists/artists-index.test.tsx` (derives from `allArtists()[0]`), `app/home.test.tsx`, and `lib/gallery.test.ts` (untouched).

- [ ] **Step 9: Commit**

```bash
git add data/artists.ts data/works.ts data/types.ts data/selectors.test.ts components/ui/Caption.test.tsx "app/works/[slug]/detail.test.tsx" app/api/checkout/route.test.ts
git commit -m "feat: rebuild roster as all-Japanese teaware/ceramics + traditional painting

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Regenerate placeholder artwork SVGs

**Files:**
- Modify: `scripts/gen-placeholders.mjs` (the duplicated `[slug, title]` list)
- Delete: the 12 old `public/works/*.svg`
- Create: 14 new `public/works/<slug>.svg` (written by the script)

**Interfaces:**
- Consumes: the work slugs/titles defined in Task 1 (the script keeps its own copy of the list — it must match `data/works.ts` exactly).
- Produces: one committed SVG per work at `/works/<slug>.svg`, matching the `image` paths in `data/works.ts`.

- [ ] **Step 1: Update the work list inside the generator**

In `scripts/gen-placeholders.mjs`, replace the `works` array (the `[slug, title]` pairs, lines ~12–25) with the new 14. The surrounding script logic (palette, hashing, SVG template, write loop) stays unchanged:

```js
const works = [
  ["mizusashi-ash-fall", "Mizusashi (Ash Fall)"],
  ["chawan-no-7", "Chawan No. 7"],
  ["hagi-chawan", "Hagi Chawan"],
  ["kuro-hagi-bowl", "Kuro-Hagi Bowl"],
  ["black-raku-chawan", "Black Raku Chawan"],
  ["mist-over-tateyama", "Mist Over Tateyama"],
  ["rain-faint", "Rain, Faint"],
  ["late-plum", "Late Plum"],
  ["field-before-snow", "Field, Before Snow"],
  ["line-study-iii", "Line Study III"],
  ["line-study-ix", "Line Study IX"],
  ["enso-one-breath", "Ensō (One Breath)"],
  ["snow-yanaka", "Snow, Yanaka"],
  ["camellia-single-stem", "Camellia, Single Stem"],
];
```

- [ ] **Step 2: Delete the old placeholders and regenerate**

Run:
```bash
rm public/works/*.svg && npm run gen:placeholders
```
Expected: console prints `Wrote 14 placeholder artworks to public/works/`.

- [ ] **Step 3: Verify the directory holds exactly the 14 new files**

Run:
```bash
ls public/works | sort
```
Expected output (14 files, no old slugs like `quench.svg` / `fold-small.svg`):
```
black-raku-chawan.svg
camellia-single-stem.svg
chawan-no-7.svg
enso-one-breath.svg
field-before-snow.svg
hagi-chawan.svg
kuro-hagi-bowl.svg
late-plum.svg
line-study-iii.svg
line-study-ix.svg
mist-over-tateyama.svg
rain-faint.svg
snow-yanaka.svg
mizusashi-ash-fall.svg
```

- [ ] **Step 4: Confirm no live references to removed slugs/artists remain in source**

Run:
```bash
grep -rn -E "untitled-vessel|vessel-no-7|fold-small|room-401|room-902|black-on-black-ii|low-light|cast-no-3|quench|ken-arai|yuki-tomita|haruka-sen|dana-cole|marcus-reyes|iris-lund" app components data lib scripts public
```
Expected: no output (empty). (The deliberately-untouched local fixture names in `lib/gallery.test.ts` / `Spotlight.test.tsx` — "Ken Arai", "Iris Lund" — are display-name strings, not the slugs/identifiers above, so they do not appear in this slug-oriented grep.)

- [ ] **Step 5: Build to confirm nothing references a missing asset or slug**

Run: `npm run build`
Expected: build succeeds (no type errors, no broken imports). Static params for `/works/[slug]` and `/artists/[slug]` enumerate the new roster.

- [ ] **Step 6: Commit**

```bash
git add scripts/gen-placeholders.mjs public/works
git commit -m "chore: regenerate placeholder artworks for the new roster

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Manual verification (after both tasks)

- `npm run dev`, then:
  - `/works` shows 14 works; `/artists` lists 10 artists.
  - A retained detail page resolves: `/works/line-study-iii`, `/artists/saburo-ohta`.
  - A new detail page resolves: `/works/mizusashi-ash-fall`, `/artists/emi-takagi`.
  - A removed slug 404s: `/works/quench`, `/artists/iris-lund`.
  - Homepage tagline and About copy are unchanged and still read correctly.

## Self-Review Notes (plan author)

- **Spec coverage:** §1 medium balance → roster in Task 1 Steps 3–4 (3/3/2/2 artists, 5/4/3/2 works = 10/14). §2 artists → Step 3. §3 works → Step 4. §4 files → Tasks 1 & 2 (image-prompts doc already committed, excluded per Global Constraints). §5 no copy change → Global Constraints + manual verification. §6 tests → Task 1 Steps 1, 6 (selectors, Caption, detail, route); gallery/Spotlight intentionally left, documented in Step 7 note. §7 verification → Task 2 Steps 3–5 + manual section.
- **Placeholder scan:** none — every code/test/command step shows literal content.
- **Type consistency:** no type changes; all selector signatures unchanged; anchor fixture `mizusashi-ash-fall` (title "Mizusashi (Ash Fall)", year 2019, price 130000) used identically across selectors, Caption, detail, and route tests.
