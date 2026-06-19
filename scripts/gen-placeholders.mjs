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
