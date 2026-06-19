import { describe, it, expect, beforeEach } from "vitest";
import { markGalleryReturn, consumeGalleryReturn } from "./entranceFlag";

describe("entranceFlag", () => {
  beforeEach(() => sessionStorage.clear());

  it("consume returns false when nothing was marked", () => {
    expect(consumeGalleryReturn()).toBe(false);
  });
  it("consume returns true once after mark, then false", () => {
    markGalleryReturn();
    expect(consumeGalleryReturn()).toBe(true);
    expect(consumeGalleryReturn()).toBe(false);
  });
});
