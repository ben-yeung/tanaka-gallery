import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { vi } from "vitest";

describe("assertTestMode", () => {
  const original = process.env.STRIPE_SECRET_KEY;
  beforeEach(() => { vi.resetModules?.(); });
  afterEach(() => { process.env.STRIPE_SECRET_KEY = original; });

  it("throws when the key is not a test key", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_danger";
    const { assertTestMode } = await import("./stripe");
    expect(() => assertTestMode()).toThrow(/test-mode/i);
  });
  it("passes for a test key", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_ok";
    const { assertTestMode } = await import("./stripe");
    expect(() => assertTestMode()).not.toThrow();
  });
});
