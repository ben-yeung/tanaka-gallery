import { describe, it, expect } from "vitest";
import { getArtist, allArtists } from "./artists";
import { getWork, worksByArtist, allWorks, formatMeta } from "./works";

describe("artist selectors", () => {
  it("returns an artist by slug", () => {
    expect(getArtist("saburo-ohta")?.name).toBe("Saburo Ohta");
  });
  it("returns undefined for an unknown slug", () => {
    expect(getArtist("nobody")).toBeUndefined();
  });
  it("lists all artists", () => {
    expect(allArtists().length).toBe(10);
  });
});

describe("work selectors", () => {
  it("returns a work by slug", () => {
    expect(getWork("mizusashi-ash-fall")?.title).toBe("Mizusashi (Ash Fall)");
  });
  it("returns undefined for an unknown slug", () => {
    expect(getWork("nope")).toBeUndefined();
  });
  it("filters works by artist", () => {
    const w = worksByArtist("saburo-ohta");
    expect(w.length).toBe(2);
    expect(w.every((x) => x.artistSlug === "saburo-ohta")).toBe(true);
  });
  it("every work references a real artist", () => {
    for (const w of allWorks()) {
      expect(getArtist(w.artistSlug), `missing artist for ${w.slug}`).toBeDefined();
    }
  });
  it("every work image path is a valid public works path", () => {
    for (const w of allWorks()) {
      expect(w.image).toMatch(/^\/works\/.+\.(png|svg|jpg|webp)$/);
    }
  });
});

describe("formatMeta", () => {
  it("formats Title · Artist · Year", () => {
    expect(formatMeta(getWork("mizusashi-ash-fall")!)).toBe("Mizusashi (Ash Fall) · Saburo Ohta · 2019");
  });
});
