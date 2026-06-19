import { describe, it, expect } from "vitest";
import { wipeVariants } from "../aboutVariants";
import { EASE_OUT } from "../../splash/timing";

describe("wipeVariants", () => {
  it("wipes scaleX 0 → 1 with the given delay and duration", () => {
    const v = wipeVariants(false, 1.8, 1.05, EASE_OUT);
    expect(v.hidden).toMatchObject({ scaleX: 0 });
    expect(v.visible).toMatchObject({ scaleX: 1 });
    const t = (v.visible as { transition: { delay: number; duration: number } }).transition;
    expect(t.delay).toBe(1.8);
    expect(t.duration).toBe(1.05);
  });

  it("renders already-drawn (scaleX 1, no animation) under reduced motion", () => {
    const v = wipeVariants(true, 1.8, 1.05, EASE_OUT);
    expect(v.hidden).toEqual({ scaleX: 1 });
    expect(v.visible).toEqual({ scaleX: 1 });
  });
});
