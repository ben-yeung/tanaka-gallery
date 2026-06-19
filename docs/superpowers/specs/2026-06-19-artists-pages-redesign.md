# Artists Pages Redesign

**Date:** 2026-06-19
**Scope:** `/artists` listing page and `/artists/[slug]` profile page
**Goal:** Bring both pages in line with the design language established by the works gallery and the homepage About/Spotlight redesign.

---

## 1. Data Model

### `data/types.ts`
Add `nameJa: string` to the `Artist` interface — the artist's name written in Japanese script, in Japanese name order (family name first).

```ts
export interface Artist {
  slug: string;
  name: string;       // romanized, Western order — e.g. "Saburo Ohta"
  nameJa: string;     // Japanese script, Japanese order — e.g. "太田 三郎"
  origin: string;
  born: number;
  bio: string;
}
```

### `data/artists.ts`
Populate `nameJa` for all ten artists:

| slug | name | nameJa |
|---|---|---|
| saburo-ohta | Saburo Ohta | 太田 三郎 |
| kenji-mori | Kenji Mori | 森 健二 |
| yuki-hara | Yuki Hara | 原 由紀 |
| aiko-tani | Aiko Tani | 谷 愛子 |
| sora-maeda | Sora Maeda | 前田 空 |
| rei-kobayashi | Rei Kobayashi | 小林 怜 |
| mika-narita | Mika Narita | 成田 美香 |
| jun-asano | Jun Asano | 浅野 純 |
| haru-sasaki | Haru Sasaki | 佐々木 春 |
| emi-takagi | Emi Takagi | 高木 恵美 |

---

## 2. `/artists` Listing Page

### Header — haiku subheader

Replace the current single `<p className="subhead">` with three sibling `SplashItem` elements, one per haiku line, staggered after `CONTENT_START` using `beat()` offsets.

**Haiku (B1):**
```
From the kiln, from rain
Each mark made before it fades
Ten voices remain.
```

Each line is a `<p>` `SplashItem` inside a plain `<header className={styles.head}>` (the header is no longer itself a SplashItem — the children animate independently). The `h1` stays in its own `SplashItem as="div"` at `CONTENT_START`. The haiku lines follow at `beat(1)`, `beat(2)`, `beat(3)` — i.e. `1.12s`, `1.34s`, `1.56s` after page load (`beat(i) = CONTENT_START + i * ITEM_STAGGER`, both exported from `timing.ts`).

Haiku line style: grotesk font, matcha color, `subhead` font-size (`14px`) and letter-spacing (`0.04em`), displayed as block elements with a small top gap between lines (e.g. `4px`).

### Row — inline Japanese name

The romanized name and Japanese name are grouped in a left-side `<span>` (`.nameGroup`), separated by a small gap (via `gap` on a flex container or an em-space). The origin/born metadata stays right-aligned as before.

- `.name` — unchanged: serif, `clamp(22px, 3vw, 34px)`, ink
- `.nameJa` — inline after `.name`: stone color, same serif family, slightly smaller (e.g. `0.75em` relative to `.name` or a fixed `clamp(14px, 1.6vw, 20px)`)
- **Hover:** entire row hover turns `.name` matcha (existing behaviour). `.nameJa` stays stone on hover — it reads as annotation, not the primary label.

```tsx
<Link href={`/artists/${a.slug}`} className={styles.row}>
  <span className={styles.nameGroup}>
    <span className={styles.name}>{a.name}</span>
    <span className={styles.nameJa}>{a.nameJa}</span>
  </span>
  <span className={styles.origin}>{a.origin} · b. {a.born}</span>
</Link>
```

---

## 3. Artist Profile Page (`/artists/[slug]`)

### Bio width

Change `.bio` in `artists.module.css` from `max-width: 26ch` to `max-width: 70%`. All other bio styles (serif font, `clamp(20px, 3vw, 30px)` size, `28px var(--gutter)` padding) are unchanged.

This mirrors the `aboutLead` pattern from `home.module.css` (which uses `width: 75%`) and lets the bio breathe across the page without running the full measure on wide viewports.

No structural changes to the profile page component — header → bio → work count → `WorkGrid` order stays as-is.

---

## Out of Scope

- Animation changes to the profile page
- Furigana readings on the Japanese names in the row
- Any changes to the works gallery or homepage
- Mobile-specific breakpoints beyond what inherits naturally from the existing responsive system
