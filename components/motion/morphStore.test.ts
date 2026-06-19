import { describe, it, expect, beforeEach } from "vitest";
import { setMorphOrigin, takeMorphOrigin } from "./morphStore";

const rect = { top: 10, left: 20, width: 100, height: 80 };

describe("morphStore", () => {
  // Clear any pending origin so tests don't bleed module-level state into each other.
  beforeEach(() => {
    setMorphOrigin("__reset__", rect);
    takeMorphOrigin("__reset__");
  });

  it("returns the stored rect for the matching slug, once", () => {
    setMorphOrigin("a", rect);
    expect(takeMorphOrigin("a")).toEqual(rect);
    expect(takeMorphOrigin("a")).toBeNull(); // consumed
  });
  it("returns null for a non-matching slug", () => {
    setMorphOrigin("a", rect);
    expect(takeMorphOrigin("b")).toBeNull();
  });
});
