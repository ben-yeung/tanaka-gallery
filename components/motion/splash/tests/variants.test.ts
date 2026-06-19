import { describe, it, expect } from "vitest";
import { itemVariants, inlineVariants, furiganaVariants } from "../variants";
import { beat, CONTENT_START, ITEM_STAGGER, SNAKE_LEAD_MS } from "../timing";

describe("splash timing", () => {
  it("beats advance by the item stagger", () => {
    expect(beat(0)).toBe(CONTENT_START);
    expect(beat(1)).toBeCloseTo(CONTENT_START + ITEM_STAGGER);
    expect(beat(1)).toBeGreaterThan(beat(0));
  });
  it("snake lead is a positive millisecond value", () => {
    expect(SNAKE_LEAD_MS).toBeGreaterThan(0);
  });
});

describe("splash variants — full motion", () => {
  it("block items rise, deblur and fade", () => {
    const v = itemVariants(false);
    expect(v.hidden).toMatchObject({ opacity: 0 });
    expect(v.hidden).toHaveProperty("y");
    expect(v.hidden).toHaveProperty("filter");
    expect(v.visible).toMatchObject({ opacity: 1, y: 0 });
  });
  it("inline items fade and deblur but do NOT translate", () => {
    const v = inlineVariants(false);
    expect(v.hidden).toMatchObject({ opacity: 0 });
    expect(v.hidden).toHaveProperty("filter");
    expect(v.hidden).not.toHaveProperty("y");
    expect(v.visible).not.toHaveProperty("y");
  });
  it("furigana full motion rises (Y) and fades, no blur", () => {
    const v = furiganaVariants(false);
    expect(v.hidden).toMatchObject({ opacity: 0 });
    expect(v.hidden).toHaveProperty("y");
    expect(v.hidden).not.toHaveProperty("filter");
    expect(v.visible).toMatchObject({ opacity: 1, y: 0 });
  });
  it("applies a per-element delay to the visible transition", () => {
    const v = itemVariants(false, 0.9);
    expect((v.visible as { transition: { delay: number } }).transition.delay).toBe(0.9);
  });
});

describe("splash variants — reduced motion (opacity-only)", () => {
  it("block items are opacity-only", () => {
    expect(itemVariants(true).hidden).toEqual({ opacity: 0 });
    expect(itemVariants(true).visible).not.toHaveProperty("y");
    expect(itemVariants(true).visible).not.toHaveProperty("filter");
  });
  it("inline items are opacity-only", () => {
    expect(inlineVariants(true).hidden).toEqual({ opacity: 0 });
    expect(inlineVariants(true).visible).not.toHaveProperty("y");
    expect(inlineVariants(true).visible).not.toHaveProperty("filter");
  });
  it("furigana is opacity-only (no settle Y)", () => {
    expect(furiganaVariants(true).hidden).toEqual({ opacity: 0 });
    expect(furiganaVariants(true).visible).not.toHaveProperty("y");
  });
});
