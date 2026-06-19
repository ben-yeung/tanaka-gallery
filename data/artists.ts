import type { Artist } from "./types";

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

export function allArtists(): Artist[] {
  return artists;
}

export function getArtist(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug);
}
