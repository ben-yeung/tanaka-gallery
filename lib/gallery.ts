import type { Work } from "@/data/types";

export type SortKey = "artist" | "year";
export type SortDir = "asc" | "desc";

export interface SortState {
  artist?: SortDir;
  year?: SortDir;
  dim: boolean;
}

export const DEFAULT_SORT_STATE: SortState = { dim: false };

// First-press direction per key: artist A→Z, year newest-first.
const NATURAL: Record<SortKey, SortDir> = { artist: "asc", year: "desc" };

export function nextSortDir(key: SortKey, current: SortDir | undefined): SortDir | undefined {
  if (current === undefined) return NATURAL[key];
  if (current === NATURAL[key]) return NATURAL[key] === "asc" ? "desc" : "asc";
  return undefined;
}

export function sortWorks(
  works: Work[],
  state: SortState,
  artistNameOf: (slug: string) => string,
): Work[] {
  const orig = new Map(works.map((w, i) => [w.slug, i]));
  return works.slice().sort((a, b) => {
    if (state.artist) {
      const c = artistNameOf(a.artistSlug).localeCompare(artistNameOf(b.artistSlug));
      if (c !== 0) return state.artist === "asc" ? c : -c;
    }
    if (state.year) {
      const c = a.year - b.year;
      if (c !== 0) return state.year === "asc" ? c : -c;
    }
    return (orig.get(a.slug) ?? 0) - (orig.get(b.slug) ?? 0);
  });
}

export function parseGalleryParams(params: { get(name: string): string | null }): SortState {
  const state: SortState = { dim: params.get("dim") === "1" };
  const raw = params.get("sort");
  if (raw) {
    for (const part of raw.split(",")) {
      const [key, dir] = part.split("-");
      if ((key === "artist" || key === "year") && (dir === "asc" || dir === "desc")) {
        state[key] = dir;
      }
    }
  }
  return state;
}

export function serializeGalleryParams(state: SortState): string {
  const sort: string[] = [];
  if (state.artist) sort.push(`artist-${state.artist}`); // artist first = primary
  if (state.year) sort.push(`year-${state.year}`);
  const sp = new URLSearchParams();
  if (sort.length) sp.set("sort", sort.join(","));
  if (state.dim) sp.set("dim", "1");
  return sp.toString();
}
