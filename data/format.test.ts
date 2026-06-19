import { describe, it, expect } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("formats cents as whole-dollar USD", () => {
    expect(formatPrice(120000)).toBe("$1,200");
  });
  it("formats sub-thousand amounts", () => {
    expect(formatPrice(45000)).toBe("$450");
  });
  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$0");
  });
});
