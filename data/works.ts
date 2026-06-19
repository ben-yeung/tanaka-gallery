import type { Work } from "./types";
import { getArtist } from "./artists";

export const works: Work[] = [
  { slug: "untitled-vessel", title: "Untitled (Vessel)", artistSlug: "saburo-ohta", year: 2019, medium: "stoneware", dimensions: "12 × 8 × 8 in", priceCents: 120000, image: "/works/untitled-vessel.svg", available: true },
  { slug: "vessel-no-7", title: "Vessel No. 7", artistSlug: "saburo-ohta", year: 2021, medium: "stoneware", dimensions: "9 × 7 × 7 in", priceCents: 95000, image: "/works/vessel-no-7.svg", available: true },
  { slug: "line-study-iii", title: "Line Study III", artistSlug: "mika-narita", year: 2020, medium: "ink on paper", dimensions: "30 × 22 in", priceCents: 64000, image: "/works/line-study-iii.svg", available: true },
  { slug: "line-study-ix", title: "Line Study IX", artistSlug: "mika-narita", year: 2022, medium: "ink on paper", dimensions: "30 × 22 in", priceCents: 64000, image: "/works/line-study-ix.svg", available: false },
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
