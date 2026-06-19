import type { Artist } from "./types";

export const artists: Artist[] = [
  { slug: "saburo-ohta", name: "Saburo Ohta", origin: "Osaka, Japan", born: 1968, bio: "Stoneware vessels, thrown and left unglazed." },
  { slug: "mika-narita", name: "Mika Narita", origin: "Kyoto, Japan", born: 1981, bio: "Ink on paper. Repetition until the line forgets itself." },
  { slug: "ken-arai", name: "Ken Arai", origin: "Nagoya, Japan", born: 1974, bio: "Folded steel. Small objects that hold their weight." },
  { slug: "yuki-tomita", name: "Yuki Tomita", origin: "Sapporo, Japan", born: 1986, bio: "Photographs of rooms after the people leave." },
  { slug: "haruka-sen", name: "Haruka Sen", origin: "Tokyo, Japan", born: 1979, bio: "Lacquer over wood. Black on black." },
  { slug: "dana-cole", name: "Dana Cole", origin: "Oakland, CA", born: 1983, bio: "Oil on linen. Light doing very little." },
  { slug: "marcus-reyes", name: "Marcus Reyes", origin: "San Francisco, CA", born: 1977, bio: "Concrete casts of things that were soft." },
  { slug: "iris-lund", name: "Iris Lund", origin: "Berkeley, CA", born: 1990, bio: "Glass. Cooled too fast on purpose." },
];

export function allArtists(): Artist[] {
  return artists;
}

export function getArtist(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug);
}
