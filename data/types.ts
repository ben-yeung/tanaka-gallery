export interface Artist {
  slug: string;
  name: string;
  origin: string; // e.g. "Osaka, Japan" or "Oakland, CA"
  born: number; // year
  bio: string; // terse — one or two sentences, no adjectives
}

export interface Work {
  slug: string;
  title: string;
  artistSlug: string;
  year: number;
  medium: string; // e.g. "stoneware"
  dimensions: string; // e.g. "12 × 8 × 8 in"
  priceCents: number; // USD cents — Stripe-ready
  image: string; // public path, e.g. "/works/untitled-vessel.svg"
  available: boolean;
}
