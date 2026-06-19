# Artwork image prompts

Image-generation prompts for the fourteen works in `data/works.ts`. The aesthetic is
Ren Tanaka's wabi-sabi creed (侘び寂び — "less, done carefully, is enough"), curated
"from Tokyo to the Bay." The roster is fully Japanese and traditional: ceremonial
teaware and ceramics, watercolor, sumi-e ink, woodblock, and nihonga. These prompts
steer hard toward Japanese painting and tea-ceremony sensibility.

## How to use

Each work below carries a **self-contained prompt** — it already folds in the shared
style spine, so you can paste a single block straight into an image generator. The
**Style spine** and **Avoid** sections are repeated here only as reference for editing
or for tools that take a separate negative prompt.

Keep each generated image consistent with the work's caption in `data/works.ts`
(medium, year, dimensions). Every object is traditional Japanese tea ware or ceramics;
every flat work is a watercolor, sumi-e ink work, woodblock print, or nihonga painting
— all under the same quiet, painterly Japanese lens.

### Output resolution

**All images must be generated at 4:3 landscape (1200 × 900 px).** Both the gallery
grid and the homepage preview cards render at `aspect-ratio: 4 / 3`. Non-4:3 images
are center-cropped by `object-fit: cover` and will lose subject matter at the top and
bottom (portrait) or sides (square).

Every prompt below already includes `--ar 4:3` as the final line. For generators that
don't use Midjourney-style flags, use the equivalent setting:

| Generator | Setting |
|---|---|
| Midjourney | `--ar 4:3` (already in each prompt) |
| DALL-E 3 (API) | `"size": "1792x1344"` (closest native 4:3) |
| DALL-E 3 (ChatGPT) | ask for "landscape, 4 by 3 ratio" in the prompt |
| Stable Diffusion | `width=1200 height=900` (or `768×576` for lighter jobs) |
| Firefly / other | choose the **4:3 Landscape** preset before generating |

## Style spine (inherited by every prompt)

Wabi-sabi (侘び寂び): muted earthy palette — clay, ash, stone, sumi black, raw linen,
faded indigo. Asymmetric composition with generous *ma* (negative space). Natural
imperfection, aged patina, the beauty of the incomplete and the worn. Soft, low,
single-source side light; deep quiet shadow; no hard highlights. Rendered as
**painting or fine artwork** — sumi-e ink, nihonga mineral pigment, shin-hanga
woodblock restraint — not as a photoreal studio product shot. Composed and still, as
if seen in a tearoom or a back-room gallery.

## Avoid (global negative)

Bright or saturated color, neon, candy palettes. Glossy Western studio / e-commerce
product photography, HDR, lens flare, bokeh sparkle, digital sheen, plastic surfaces.
Perfect symmetry, centered hero framing, ornate decoration, busy or cluttered
backgrounds, props, text, watermarks, signatures, people, hands.

---

## Teaware & ceramics — Saburo Ohta (Imbe, Okayama, b. 1968 · wood-fired Bizen)

### `mizusashi-ash-fall` — *Mizusashi (Ash Fall)* · 2019 · wood-fired Bizen stoneware · 11 × 8 × 8 in

> A tall ceremonial water jar (mizusashi) for the Japanese tea ceremony, hand-thrown
> unglazed Bizen wood-fired stoneware. Iron-brown and ash-grey clay body with a
> natural ash-glaze fall running down one shoulder, fly-ash flashing, sesame-seed
> (goma) speckle, and a slightly off-center mouth. Coarse grog texture, fingertip
> throwing marks spiraling up the wall, a worn unglazed foot. Set just off-center on a
> length of raw weathered wood against a dim plaster wall, lit by soft low light from
> one side, long soft shadow pooling into deep *ma*. Painterly still life, sumi-e and
> nihonga restraint, muted earthy palette, wabi-sabi.
> --ar 4:3

### `chawan-no-7` — *Chawan No. 7* · 2021 · wood-fired Bizen stoneware · 5 × 5 × 4 in

> A small Bizen tea bowl (chawan), wood-fired and unglazed, iron-red and ash-grey with
> scarlet hidasuki scorch-lines and goma ash speckle across the surface. A gently
> uneven rim, a rough cut foot (kodai), fingertip marks — the wabi beauty of an
> asymmetric, "imperfect" pot. Resting low on a tatami edge with the faint suggestion
> of a bamboo tea whisk (chasen) out of focus beside it in the half-light. Single soft
> side light, deep shadow, large empty space above. Painterly, muted, sumi-e quietness,
> wabi-sabi.
> --ar 4:3

---

## Teaware & ceramics — Kenji Mori (Hagi, Yamaguchi, b. 1971 · Hagi ware)

### `hagi-chawan` — *Hagi Chawan* · 2020 · Hagi-ware stoneware · 5 × 5 × 4 in

> A Hagi-ware tea bowl, soft loquat-cream and pale pink glaze pooling thin over a warm
> clay body, the characteristic Hagi crackle (kannyu) webbed finely across the surface,
> a deliberately notched foot. Warm, quiet, faintly translucent matte glaze with gentle
> asymmetry. Resting on raw weathered wood by a tatami edge, low single side light, soft
> shadow, generous empty space. Painterly still life, muted earthy palette, sumi-e
> restraint, wabi-sabi.
> --ar 4:3

### `kuro-hagi-bowl` — *Kuro-Hagi Bowl* · 2022 · Hagi-ware stoneware · 5 × 5 × 3 in

> A low, wide kuro (black) Hagi tea bowl, dark iron glaze breaking to rust-brown and
> straw at the rim and foot, fine crackle across the surface, a quiet warp to the lip.
> Matte, aged, never glossy. Resting off-center on raw wood against dim plaster, a
> single soft side light raking across the rim, deep shadow, large empty space around
> it. Painterly, muted, heavy and still, wabi-sabi.
> --ar 4:3

---

## Teaware & ceramics — Yuki Hara (Kyoto, b. 1980 · raku)

### `black-raku-chawan` — *Black Raku Chawan* · 2023 · raku-fired earthenware · 5 × 4 × 4 in

> A black raku tea bowl (kuro-raku), hand-built and carved rather than thrown, with a
> deep matte-to-soft-sheen black glaze and subtle red-bronze where the fire thinned it.
> Faceted tool marks, an irregular warped rim, a sturdy hand-cut foot — the wabi beauty
> of an intimate, imperfect bowl. Resting on a tatami edge in half-light, soft side
> light grazing the lip, deep shadow, breathing *ma* around it. Painterly,
> near-monochrome, sumi-e stillness, wabi-sabi.
> --ar 4:3

---

## Watercolor — Aiko Tani (Kanazawa, b. 1984)

### `mist-over-tateyama` — *Mist Over Tateyama* · 2021 · watercolor on paper · 22 × 30 in

> A traditional Japanese watercolor of distant mountains dissolving into mist — layered
> grey-blue and faint indigo washes, wet-on-wet bleeding, ridgelines fading to nothing
> toward the top, vast pale paper left as *ma*. Soft graded washes, a few darker
> ink-touched pines low at one side, no hard edges anywhere. Asymmetric, a high empty
> horizon, muted and atmospheric. Painterly, restrained, suibokuga sensibility,
> wabi-sabi.
> --ar 4:3

### `rain-faint` — *Rain, Faint* · 2023 · watercolor on paper · 18 × 24 in

> A spare watercolor of rain barely there — long pale grey vertical washes drawn over a
> near-empty ground, a single faint roofline or bed of reeds suggested low in the frame,
> the rest soft wet paper and bleed. Muted ash and faded-indigo tones, visible
> granulation, dry paper breathing around the marks. Quiet, minimal, off-center,
> melancholy stillness. Painterly Japanese-traditional watercolor, wabi-sabi.
> --ar 4:3

---

## Watercolor — Sora Maeda (Matsumoto, b. 1989)

### `late-plum` — *Late Plum* · 2022 · watercolor on paper · 14 × 11 in

> A small, intimate watercolor of a single plum (ume) branch — a few dark sumi-touched
> twigs and two or three pale blossoms, most of the sheet left empty. A soft pink-white
> wash for the petals, wet grey-brown for the branch, a faint bleed halo at the edges.
> The bare-branch restraint of traditional Japanese flower painting, asymmetric,
> generous *ma*. Muted, quiet, painterly, wabi-sabi.
> --ar 4:3

---

## Watercolor — Rei Kobayashi (Nara, b. 1976)

### `field-before-snow` — *Field, Before Snow* · 2020 · watercolor and gofun on paper · 24 × 36 in

> A wide, near-empty watercolor field under a heavy pale sky — the moment before snow.
> Flat washes of faded ochre and ash-grey grass, chalky gofun-white scumbled into the
> sky for a matte cold light, a single dark line of distant trees low across the frame.
> The presence of a deer implied by absence, not shown. Vast horizontal emptiness,
> muted, cold, still. Nihonga-influenced watercolor, deep *ma*, wabi-sabi.
> --ar 4:3

---

## Sumi-e ink — Mika Narita (Kyoto, b. 1981)

### `line-study-iii` — *Line Study III* · 2020 · ink on paper · 30 × 22 in

> A sumi-e ink study on warm handmade washi paper: a single brushstroke repeated and
> overlaid until the line begins to forget itself, an ensō-adjacent gesture trailing
> from saturated wet black into dry-brush grey. Bleed and feathering at the edges,
> bone-dry split-brush texture at the tail, vast untouched paper around it as *ma*.
> Tall vertical format, the mark placed high and to one side. Monochrome sumi ink,
> nihonga restraint, calm and unhurried, wabi-sabi.
> --ar 4:3

### `line-study-ix` — *Line Study IX* · 2022 · ink on paper · 30 × 22 in

> Companion sumi-e ink study on washi: a denser vertical column of the same repeated
> stroke, layered until the individual lines dissolve into a soft graphite-black field
> that frays into pale grey at top and bottom. Wet pooling ink, granulation, the line
> losing itself in repetition. Deep saturation at the core, breathing white paper to
> either side. Monochrome ink on warm paper, meditative, restrained, wabi-sabi.
> --ar 4:3

---

## Sumi-e ink — Jun Asano (Tokyo, b. 1973)

### `enso-one-breath` — *Ensō (One Breath)* · 2021 · ink on paper · 27 × 27 in

> A single ensō circle drawn in one breath on warm washi — a broad sumi brushstroke
> sweeping round, saturated wet black where it begins, drying to split-brush grey with a
> small open gap where it ends. Visible bristle streaks, a faint bleed halo, the ink
> pooling darker at the turn. Square format, the circle off-center with vast empty paper
> around it as *ma*. Monochrome sumi-e, Zen restraint, calm and unhurried, wabi-sabi.
> --ar 4:3

---

## Woodblock — Haru Sasaki (Tokyo, b. 1979 · shin-hanga)

### `snow-yanaka` — *Snow, Yanaka* · 2019 · woodblock print · 17 × 11 in

> A shin-hanga woodblock print of a quiet old Tokyo backstreet (Yanaka) under falling
> snow at dusk — muted indigo and slate sky, snow-laden tiled roofs, a single dim
> lantern glow. Soft flat color fields with the gentle gradation (bokashi) of
> hand-printing and fine keyblock outlines. Snowflakes as tiny reserved-white flecks.
> Vertical format, hushed, nobody present. Restrained shin-hanga palette, muted,
> wabi-sabi melancholy.
> --ar 4:3

---

## Nihonga — Emi Takagi (Kyoto, b. 1985)

### `camellia-single-stem` — *Camellia, Single Stem* · 2023 · nihonga, mineral pigment on paper · 20 × 16 in

> A nihonga painting of a single camellia (tsubaki) stem — one deep crimson-and-shadow
> bloom and two dark waxy leaves, painted in mineral pigments over gofun on a dim,
> softly mottled gold-leaf ground. Matte mineral texture, subtle malachite green and
> iron-red, the gold aged and tarnished rather than bright. Asymmetric, the stem low and
> to one side, with a vast quiet ground above as *ma*. Restrained, elegant, still,
> wabi-sabi.
> --ar 4:3
