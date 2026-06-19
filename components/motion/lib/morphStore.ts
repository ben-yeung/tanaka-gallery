export type Rect = { top: number; left: number; width: number; height: number };

let pending: { slug: string; rect: Rect } | null = null;

export function setMorphOrigin(slug: string, rect: Rect): void {
  pending = { slug, rect };
}

// Consumes the stored origin exactly once, and only for the matching slug.
export function takeMorphOrigin(slug: string): Rect | null {
  if (pending && pending.slug === slug) {
    const { rect } = pending;
    pending = null;
    return rect;
  }
  return null;
}
