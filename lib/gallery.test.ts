import { describe, it, expect } from "vitest";
import {
  nextSortDir,
  sortWorks,
  parseGalleryParams,
  serializeGalleryParams,
  DEFAULT_SORT_STATE,
  type SortState,
} from "./gallery";
import type { Work } from "@/data/types";

const W = (slug: string, artistSlug: string, year: number, available = true): Work => ({
  slug, title: slug, artistSlug, year, medium: "", dimensions: "",
  priceCents: 0, image: `/works/${slug}.svg`, available,
});

// artist slugs map to display names so alphabetical order is testable
const names: Record<string, string> = { ohta: "Saburo Ohta", arai: "Ken Arai", lund: "Iris Lund" };
const nameOf = (slug: string) => names[slug] ?? slug;

describe("nextSortDir", () => {
  it("cycles artist off → asc → desc → off", () => {
    expect(nextSortDir("artist", undefined)).toBe("asc");
    expect(nextSortDir("artist", "asc")).toBe("desc");
    expect(nextSortDir("artist", "desc")).toBeUndefined();
  });
  it("cycles year off → desc → asc → off (newest first natural)", () => {
    expect(nextSortDir("year", undefined)).toBe("desc");
    expect(nextSortDir("year", "desc")).toBe("asc");
    expect(nextSortDir("year", "asc")).toBeUndefined();
  });
});

describe("sortWorks", () => {
  const works = [
    W("a", "ohta", 2019), W("b", "arai", 2021), W("c", "lund", 2020), W("d", "arai", 2018),
  ];
  it("returns curated (original) order when no keys active", () => {
    expect(sortWorks(works, DEFAULT_SORT_STATE, nameOf).map((w) => w.slug)).toEqual(["a", "b", "c", "d"]);
  });
  it("sorts by artist name ascending, ties keep curated order", () => {
    const r = sortWorks(works, { artist: "asc", dim: false }, nameOf).map((w) => w.slug);
    // Iris Lund(c), Ken Arai(b,d in curated order), Saburo Ohta(a)
    expect(r).toEqual(["c", "b", "d", "a"]);
  });
  it("groups by artist (primary) then year (secondary)", () => {
    const r = sortWorks(works, { artist: "asc", year: "asc", dim: false }, nameOf).map((w) => w.slug);
    // Lund(c 2020), Arai(d 2018, b 2021), Ohta(a 2019)
    expect(r).toEqual(["c", "d", "b", "a"]);
  });
  it("sorts by year only, descending", () => {
    const r = sortWorks(works, { year: "desc", dim: false }, nameOf).map((w) => w.slug);
    expect(r).toEqual(["b", "c", "a", "d"]);
  });
  it("does not mutate the input array", () => {
    const copy = works.slice();
    sortWorks(works, { year: "asc", dim: false }, nameOf);
    expect(works).toEqual(copy);
  });
  it("dim does not affect order", () => {
    const a = sortWorks(works, { artist: "asc", dim: false }, nameOf).map((w) => w.slug);
    const b = sortWorks(works, { artist: "asc", dim: true }, nameOf).map((w) => w.slug);
    expect(a).toEqual(b);
  });
});

describe("URL params", () => {
  it("round-trips state through serialize/parse", () => {
    const state: SortState = { artist: "asc", year: "desc", dim: true };
    const qs = serializeGalleryParams(state);
    expect(parseGalleryParams(new URLSearchParams(qs))).toEqual(state);
  });
  it("encodes artist before year", () => {
    expect(serializeGalleryParams({ artist: "asc", year: "desc", dim: false }))
      .toBe("sort=artist-asc%2Cyear-desc");
  });
  it("returns default state for empty params", () => {
    expect(parseGalleryParams(new URLSearchParams(""))).toEqual(DEFAULT_SORT_STATE);
  });
  it("ignores malformed sort tokens", () => {
    expect(parseGalleryParams(new URLSearchParams("sort=bogus-up,year-sideways&dim=9")))
      .toEqual({ dim: false });
  });
});
