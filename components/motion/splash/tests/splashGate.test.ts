import { describe, it, expect, beforeEach, vi } from "vitest";

describe("splashGate", () => {
  beforeEach(() => {
    // vitest resets module registry between files; within this file we reset
    // manually so each test gets a pristine `fresh = true`.
    vi.resetModules();
  });

  it("reports a fresh load until ended", async () => {
    const gate = await import("../splashGate");
    expect(gate.isFreshLoad()).toBe(true);
  });

  it("reports not-fresh after endFreshLoad()", async () => {
    const gate = await import("../splashGate");
    gate.endFreshLoad();
    expect(gate.isFreshLoad()).toBe(false);
  });
});
