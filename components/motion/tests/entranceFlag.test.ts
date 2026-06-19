import { describe, it, expect, beforeEach } from "vitest";
import { markGalleryReturn, consumeGalleryReturn } from "../lib/entranceFlag";

describe("entranceFlag", () => {
  beforeEach(() => sessionStorage.clear());

  it("consume returns false when nothing was marked", () => {
    expect(consumeGalleryReturn("/works")).toBe(false);
  });
  it("consume returns true once after mark, then false (read-once)", () => {
    markGalleryReturn("/works");
    expect(consumeGalleryReturn("/works")).toBe(true);
    expect(consumeGalleryReturn("/works")).toBe(false);
  });
  it("cross-grid: consume for a different path clears the flag without matching", () => {
    markGalleryReturn("/works");
    expect(consumeGalleryReturn("/artists/x")).toBe(false); // different grid — no match
    expect(consumeGalleryReturn("/works")).toBe(false);    // flag already cleared
  });
});
