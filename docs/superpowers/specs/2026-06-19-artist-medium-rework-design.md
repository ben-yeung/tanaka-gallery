# Artist & Medium Rework — Design Spec

**Date:** 2026-06-19
**Status:** Approved (brainstorming)
**Type:** Content rebuild (data + downstream mirrors); no architecture change

## Summary

A full rebuild of the gallery's content roster so it aligns with the wabi-sabi
narrative Tanaka Projects actually tells: **ceremonial teaware and ceramics**, and
**watercolor / brushstroke / Japanese-traditional painting** — instead of the
current metal, stone, and glass works. The new roster is **all-Japanese**, **10
artists / 14 works**, spread across four media and weighted toward the two pillars
(teaware and watercolor).

This is a **content swap**, not an architecture change. `data/types.ts`, all page
components, motion, theming, and Stripe checkout are untouched. The work is: rewrite
`data/artists.ts` and `data/works.ts`, update the files that mirror that data
(placeholder generator, generated SVGs, the image-prompts doc), and repoint the
tests that assert concrete fixtures.

## Goals

- Replace the off-narrative media (folded steel, concrete, glass, lacquer, oil,
  photography) with teaware/ceramics + watercolor + sumi-e ink + woodblock/nihonga.
- An all-Japanese roster of 10 artists / 14 works that keeps the existing terse
  house voice and the wabi-sabi aesthetic.
- Keep the data the single source of truth; keep every downstream mirror in sync
  (placeholders, image prompts, tests) so the build and test suite stay green.

## Non-Goals

- No changes to `data/types.ts` (`Artist`/`Work` shapes are sufficient).
- No changes to page components, motion, theming, or checkout.
- No new routes, fields, or features. YAGNI: this is content, not capability.

## Decisions (from brainstorming)

- **Roster treatment:** full rebuild (fresh roster), not a reassignment of the old
  one. Exception: **Saburo Ohta** and **Mika Narita** are retained verbatim — they
  were already on-narrative, and keeping their slugs steadies existing tests.
- **Origin:** fully Japanese. Consistent with the gallery sitting in SF while the
  art travels in from Japan — so the tagline ("Made in Japan. Curated in SF.") and
  the "from Tokyo to the Bay" subhead need no change.
- **Media:** four — teaware/ceramics, watercolor, sumi-e ink, woodblock/nihonga.
- **Size:** 10 artists / 14 works.

## 1. Medium balance

| Medium | Artists | Works |
|---|---|---|
| Teaware / ceramics | 3 | 5 |
| Watercolor | 3 | 4 |
| Sumi-e ink | 2 | 3 |
| Woodblock / nihonga | 2 | 2 |
| **Total** | **10** | **14** |

## 2. Roster — artists

Bios stay terse: one line, no adjective pile-ups, matching the existing voice.

| Slug | Name | Origin | Born | Bio |
|---|---|---|---|---|
| `saburo-ohta` | Saburo Ohta | Imbe, Okayama | 1968 | Wood-fired Bizen. Thrown and left unglazed. |
| `kenji-mori` | Kenji Mori | Hagi, Yamaguchi | 1971 | Hagi ware. The glaze warms with use. |
| `yuki-hara` | Yuki Hara | Kyoto, Japan | 1980 | Raku. Hand-built, fired fast. |
| `aiko-tani` | Aiko Tani | Kanazawa, Japan | 1984 | Watercolor. Mountains losing themselves in mist. |
| `sora-maeda` | Sora Maeda | Matsumoto, Japan | 1989 | Watercolor. One season per sheet. |
| `rei-kobayashi` | Rei Kobayashi | Nara, Japan | 1976 | Watercolor and gofun. Deer, and the space around them. |
| `mika-narita` | Mika Narita | Kyoto, Japan | 1981 | Ink on paper. Repetition until the line forgets itself. |
| `jun-asano` | Jun Asano | Tokyo, Japan | 1973 | Sumi-e. The ensō and the breath that draws it. |
| `haru-sasaki` | Haru Sasaki | Tokyo, Japan | 1979 | Shin-hanga woodblock. Snow on quiet streets. |
| `emi-takagi` | Emi Takagi | Kyoto, Japan | 1985 | Nihonga. Mineral pigment over gofun, gold ground. |

Retained verbatim from the current data: `saburo-ohta`, `mika-narita` (slug, name,
origin, born, bio unchanged). Their *works* below are also retained where noted.

## 3. Roster — works

`priceCents` stays USD cents, Stripe-ready. `image` is always `/works/<slug>.svg`.
Two works are marked unavailable (`available: false`) for realism, mirroring the
current data's single sold piece.

| Slug | Title | Artist | Year | Medium | Dimensions | priceCents | Available |
|---|---|---|---|---|---|---|---|
| `mizusashi-ash-fall` | Mizusashi (Ash Fall) | saburo-ohta | 2019 | wood-fired Bizen stoneware | 11 × 8 × 8 in | 130000 | true |
| `chawan-no-7` | Chawan No. 7 | saburo-ohta | 2021 | wood-fired Bizen stoneware | 5 × 5 × 4 in | 95000 | true |
| `hagi-chawan` | Hagi Chawan | kenji-mori | 2020 | Hagi-ware stoneware | 5 × 5 × 4 in | 110000 | true |
| `kuro-hagi-bowl` | Kuro-Hagi Bowl | kenji-mori | 2022 | Hagi-ware stoneware | 5 × 5 × 3 in | 98000 | false |
| `black-raku-chawan` | Black Raku Chawan | yuki-hara | 2023 | raku-fired earthenware | 5 × 4 × 4 in | 145000 | true |
| `mist-over-tateyama` | Mist Over Tateyama | aiko-tani | 2021 | watercolor on paper | 22 × 30 in | 72000 | true |
| `rain-faint` | Rain, Faint | aiko-tani | 2023 | watercolor on paper | 18 × 24 in | 58000 | true |
| `late-plum` | Late Plum | sora-maeda | 2022 | watercolor on paper | 14 × 11 in | 46000 | true |
| `field-before-snow` | Field, Before Snow | rei-kobayashi | 2020 | watercolor and gofun on paper | 24 × 36 in | 88000 | true |
| `line-study-iii` | Line Study III | mika-narita | 2020 | ink on paper | 30 × 22 in | 64000 | true |
| `line-study-ix` | Line Study IX | mika-narita | 2022 | ink on paper | 30 × 22 in | 64000 | false |
| `enso-one-breath` | Ensō (One Breath) | jun-asano | 2021 | ink on paper | 27 × 27 in | 70000 | true |
| `snow-yanaka` | Snow, Yanaka | haru-sasaki | 2019 | woodblock print | 17 × 11 in | 52000 | true |
| `camellia-single-stem` | Camellia, Single Stem | emi-takagi | 2023 | nihonga, mineral pigment on paper | 20 × 16 in | 120000 | true |

Retained verbatim from current data: `line-study-iii`, `line-study-ix` (Mika
Narita's two ink studies — unchanged slug, title, medium, year, dimensions, price;
`line-study-ix` keeps its `available: false`).

## 4. Files that change

The data modules are the source of truth; everything else mirrors them.

- **`data/artists.ts`** — replace the array with the 10 artists in §2. Selectors
  (`allArtists`, `getArtist`) are unchanged.
- **`data/works.ts`** — replace the array with the 14 works in §3. Selectors
  (`allWorks`, `getWork`, `worksByArtist`, `formatMeta`) are unchanged.
- **`scripts/gen-placeholders.mjs`** — update its duplicated `[slug, title]` list to
  the 14 new works (the script intentionally hard-copies the list to avoid importing
  TS — it must be kept in sync). Then `npm run gen:placeholders` regenerates SVGs.
  The muted-field generation logic and style are unchanged.
- **`public/works/*.svg`** — delete the 12 old placeholders; commit the 14 new ones
  the script writes. (Old slugs no longer referenced anywhere must not linger.)
- **`docs/artwork-image-prompts.md`** — rewrite for the new 14 works. Keep the
  shared **Style spine** and **Avoid** sections as-is (wabi-sabi, sumi-e/nihonga
  lens). Replace the per-work prompt sections so they cover teaware/ceramics,
  watercolor, sumi-e ink, woodblock, and nihonga — no steel/concrete/glass/lacquer.
  Update the intro note that currently says "only Ohta's two stoneware works are
  ceremonial tea ware" to reflect the new all-traditional roster.

## 5. Narrative copy

No copy changes required. `app/page.tsx` tagline (`Art. 侘び寂び。 San Francisco.`),
the subhead (`Made in Japan.` / `Curated in SF.`), the works note ("Timeless
artists, from Tokyo to the Bay."), and the About story all remain accurate for an
all-Japanese roster shown from the SF gallery. Confirmed in brainstorming: leave
copy untouched.

## 6. Tests — repoint to new fixtures

Several tests assert concrete fixtures and must be repointed to the new roster.
Because Ohta and Narita are retained, some assertions still pass; the rest update to
new slugs/titles/years. Anchor fixtures the suite can rely on:

- Artist anchor: `saburo-ohta` → "Saburo Ohta", 2 works (`mizusashi-ash-fall`,
  `chawan-no-7`).
- Work anchor for `formatMeta`: `mizusashi-ash-fall` →
  `Mizusashi (Ash Fall) · Saburo Ohta · 2019`.

Files to review/update:

- **`data/selectors.test.ts`** — `getWork("untitled-vessel")` → new work slug;
  `formatMeta` expectation → new anchor string; `allArtists().length` assertion
  (currently `>= 8`) still holds at 10; `worksByArtist("saburo-ohta")` count stays 2.
  The structural tests ("every work references a real artist", "image path matches
  slug") need no change.
- **`app/artists/[slug]/artist.test.tsx`** — uses `saburo-ohta` (retained) and
  asserts "2 works" — still valid; verify the mocked `usePathname` slug.
- **`app/works/[slug]/detail.test.tsx`** — repoint any concrete work slug/title/meta
  to a new work (or to a retained one).
- **`components/home/tests/Spotlight.test.tsx`** — repoint hard-coded work/artist
  strings.
- **`components/ui/Caption.test.tsx`** — repoint any concrete meta string.
- **`lib/gallery.test.ts`** — repoint any concrete slug/title assertions.
- **`app/api/checkout/route.test.ts`** — repoint any concrete work slug/price used to
  build the test PaymentIntent.

Implementation note: prefer asserting against values derived from the data modules
(import and reference) over re-hard-coding new string literals, so the next content
change doesn't re-break the suite. Where a literal is clearer, anchor on the
retained fixtures above.

## 7. Verification

- `npm run gen:placeholders` writes exactly 14 SVGs; `public/works/` contains only
  those 14 (no orphaned old slugs).
- `npm test` (vitest) passes.
- `npm run build` / typecheck passes (no dangling references to removed slugs).
- Manual: `/works` grid shows 14 works; `/artists` shows 10; each work detail and
  artist detail resolves; a removed old slug (e.g. `/works/quench`) 404s.
- Grep for old slugs/artist names across the repo returns no live references outside
  git history.

## 8. Out of scope / future

- Real artwork imagery — `docs/artwork-image-prompts.md` is the generation guide;
  swapping the SVG placeholders for rendered images is a separate effort.
- Any roster expansion beyond 14 works.
