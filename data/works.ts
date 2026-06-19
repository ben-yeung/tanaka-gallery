import type { Work } from "./types";
import { getArtist } from "./artists";

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
