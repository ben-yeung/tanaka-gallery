import type { Artist } from "./types";

export const artists: Artist[] = [
  { slug: "saburo-ohta",   name: "Saburo Ohta",   nameJa: "太田 三郎", origin: "Imbe, Okayama",    born: 1968, bio: "Wood-fired Bizen. Thrown and left unglazed." },
  { slug: "kenji-mori",    name: "Kenji Mori",    nameJa: "森 健二",   origin: "Hagi, Yamaguchi",  born: 1971, bio: "Hagi ware. The glaze warms with use." },
  { slug: "yuki-hara",     name: "Yuki Hara",     nameJa: "原 由紀",   origin: "Kyoto, Japan",     born: 1980, bio: "Raku. Hand-built, fired fast." },
  { slug: "aiko-tani",     name: "Aiko Tani",     nameJa: "谷 愛子",   origin: "Kanazawa, Japan",  born: 1984, bio: "Watercolor. Mountains losing themselves in mist." },
  { slug: "sora-maeda",    name: "Sora Maeda",    nameJa: "前田 空",   origin: "Matsumoto, Japan", born: 1989, bio: "Watercolor. One season per sheet." },
  { slug: "rei-kobayashi", name: "Rei Kobayashi", nameJa: "小林 怜",   origin: "Nara, Japan",      born: 1976, bio: "Watercolor and gofun. Deer, and the space around them." },
  { slug: "mika-narita",   name: "Mika Narita",   nameJa: "成田 美香", origin: "Kyoto, Japan",     born: 1981, bio: "Ink on paper. Repetition until the line forgets itself." },
  { slug: "jun-asano",     name: "Jun Asano",     nameJa: "浅野 純",   origin: "Tokyo, Japan",     born: 1973, bio: "Sumi-e. The ensō and the breath that draws it." },
  { slug: "haru-sasaki",   name: "Haru Sasaki",   nameJa: "佐々木 春", origin: "Tokyo, Japan",     born: 1979, bio: "Shin-hanga woodblock. Snow on quiet streets." },
  { slug: "emi-takagi",    name: "Emi Takagi",    nameJa: "高木 恵美", origin: "Kyoto, Japan",     born: 1985, bio: "Nihonga. Mineral pigment over gofun, gold ground." },
];

export function allArtists(): Artist[] {
  return artists;
}

export function getArtist(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug);
}
