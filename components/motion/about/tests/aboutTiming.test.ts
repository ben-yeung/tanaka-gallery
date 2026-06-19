import { describe, it, expect } from "vitest";
import {
  ABOUT_LEAD_DELAY,
  ABOUT_COL_DELAY,
  ABOUT_UNDERLINE_DELAY,
  ABOUT_HL_START,
  ABOUT_HL_STAGGER,
  aboutHighlightDelay,
} from "../../splash/timing";

describe("about choreography timing", () => {
  it("highlight delays advance by the highlight stagger", () => {
    expect(aboutHighlightDelay(0)).toBe(ABOUT_HL_START);
    expect(aboutHighlightDelay(1)).toBeCloseTo(ABOUT_HL_START + ABOUT_HL_STAGGER);
    expect(aboutHighlightDelay(2)).toBeGreaterThan(aboutHighlightDelay(1));
  });

  it("emphasis follows its text: underline after the lead, highlights after the splash", () => {
    expect(ABOUT_UNDERLINE_DELAY).toBeGreaterThanOrEqual(ABOUT_LEAD_DELAY);
    expect(aboutHighlightDelay(0)).toBeGreaterThan(ABOUT_COL_DELAY[2]);
  });
});
