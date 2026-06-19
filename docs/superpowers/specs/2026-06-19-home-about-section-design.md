# Home "About" section — design

**Date:** 2026-06-19
**Status:** Approved (design), pending implementation plan

## Goal

Add a minimal "About" section to the home page describing Ren Tanaka, his
background, and his curatorial philosophy. It must sit inline with the site's
existing minimal section conventions (shared tokens, gutter, serif headings) and
add nothing beyond static copy.

## Decisions

- **Placement:** a new `<section id="about">` appended after the spotlight
  (`.index`) section on the home page (`app/page.tsx`). No new route.
- **Nav:** add an "About" link to `components/ui/Nav.tsx` between Works and
  Artists, pointing at the anchor `/#about`. Final order: Works · About · Artists.
- **Layout:** lead line + body. A serif "About" heading, paragraph 1 set as a
  larger serif lead, paragraphs 2–5 as smaller sans body text.

## Structure

In `app/page.tsx`, after the existing `.index` section:

```
<section id="about" className={styles.about}>
  <h2 className={styles.aboutHead}>About</h2>
  <p className={styles.aboutLead}>{/* paragraph 1 */}</p>
  <p className={styles.aboutBody}>{/* paragraph 2 */}</p>
  ... paragraphs 3–5 ...
</section>
```

The existing `.index { flex: 1 }` rule is unchanged. It still grows to fill the
first viewport, so the hero + spotlight occupy screen one and About reads as a
natural second screen reached by scroll or the nav anchor. The footer pins below
About as content now extends past the viewport.

## Copy (verbatim — no invented details)

1. Ren Tanaka left Osaka at nineteen with a duffel bag and an admission letter
   from SFAI he wasn't sure he deserved.
2. He spent his twenties absorbing San Francisco: the Japantown shops, the
   Mission murals, and the quiet rigor of Japanese artists he discovered in the
   back rooms of galleries that no longer exist.
3. He started buying work before he could afford to, falling in love with pieces
   by obscure artists trying to make a living.
4. Tanaka's Gallery debuted in 2001 in a small San Francisco storefront that
   still smelled like the flower shop it once was.
5. Tanaka's curation brought together artists who reached the same conclusion
   from different directions: that less, done carefully, is enough.

## Styling (`app/home.module.css`)

- `.about`: `padding: 40px var(--gutter) 96px; border-top: 1px solid var(--stone);`
- `.aboutHead`: serif (`var(--font-serif)`), `color: var(--ink)`,
  `font-size: clamp(22px, 3vw, 38px)`, line-height ~1.1. Mirrors `.noteHead`'s
  scale (without the matcha underline — this is a section title, not a label).
- `.aboutLead`: serif, `font-size: clamp(20px, 2.6vw, 28px)`, `color: var(--ink)`,
  `max-width: 52ch`, `line-height: 1.4`, `margin-top: clamp(20px, 3vh, 36px)`.
- `.aboutBody`: `var(--font-grotesk)` sans, `font-size: 17px`,
  `line-height: 1.6`, `color: var(--ink)`, `max-width: 52ch`. Paragraph spacing
  via `margin-top` (~18px) on each body paragraph.

Exact px values are starting points and may be nudged during implementation to
match the page's optical rhythm; the tokens, fonts, and relative hierarchy
(lead > body) are the fixed contract.

## Tests

- `app/home.test.tsx`:
  - About heading renders (`getByRole("heading", { name: /about/i })`).
  - A copy snippet renders (e.g. `/debuted in 2001/`).
- `components/ui/Nav.test.tsx` (new):
  - About link renders with `href="/#about"`.
  - Link order is Works, About, Artists.

## Out of scope (YAGNI)

- No `/about` route or page.
- No images, illustration, or portrait.
- No animation or scroll effects.
- No CMS / data model — copy lives statically in `app/page.tsx`.
