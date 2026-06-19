import { describe, it, expect } from "vitest";
import { computeSnakeOrder, type SnakeItem } from "../lib/snake";

// Two rows of three. Row 0 top≈0, row 1 top≈100. Provided out of order.
const items: SnakeItem[] = [
  { key: "r1c2", top: 102, left: 200 },
  { key: "r0c0", top: 0, left: 0 },
  { key: "r0c2", top: 3, left: 200 },
  { key: "r1c0", top: 100, left: 0 },
  { key: "r0c1", top: 1, left: 100 },
  { key: "r1c1", top: 101, left: 100 },
];

describe("computeSnakeOrder", () => {
  it("orders row 0 left→right, row 1 right→left (boustrophedon)", () => {
    const seq = computeSnakeOrder(items);
    expect(seq.map((s) => s.key)).toEqual(["r0c0", "r0c1", "r0c2", "r1c2", "r1c1", "r1c0"]);
  });
  it("even rows enter from top, odd rows from bottom", () => {
    const seq = computeSnakeOrder(items);
    const dir = Object.fromEntries(seq.map((s) => [s.key, s.fromTop]));
    expect(dir["r0c0"]).toBe(true);
    expect(dir["r0c2"]).toBe(true);
    expect(dir["r1c0"]).toBe(false);
    expect(dir["r1c2"]).toBe(false);
  });
  it("assigns sequential indices along the path", () => {
    const seq = computeSnakeOrder(items);
    expect(seq.map((s) => s.index)).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it("groups near-equal tops into one row via tolerance", () => {
    const seq = computeSnakeOrder([
      { key: "a", top: 0, left: 0 },
      { key: "b", top: 6, left: 100 }, // within default tolerance 8 → same row
    ]);
    expect(seq).toHaveLength(2);
    expect(seq.every((s) => s.fromTop)).toBe(true); // single row = row 0
  });
  it("returns empty array for empty input", () => {
    const seq = computeSnakeOrder([]);
    expect(seq).toEqual([]);
  });
  it("respects custom rowTolerance to separate items into different rows", () => {
    const seq = computeSnakeOrder(
      [
        { key: "a", top: 0, left: 0 },
        { key: "b", top: 5, left: 10 },
      ],
      3 // tolerance = 3, so |0-5|=5 > 3 → different rows
    );
    expect(seq).toHaveLength(2);
    const aStep = seq.find((s) => s.key === "a");
    const bStep = seq.find((s) => s.key === "b");
    expect(aStep!.fromTop).toBe(true); // row 0
    expect(bStep!.fromTop).toBe(false); // row 1
  });
});
