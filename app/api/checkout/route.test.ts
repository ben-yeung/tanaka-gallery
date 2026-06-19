import { describe, it, expect, vi, beforeEach } from "vitest";

const create = vi.fn();

vi.mock("@/lib/stripe", () => ({
  assertTestMode: vi.fn(),
  stripe: { paymentIntents: { create: (...a: unknown[]) => create(...a) } },
}));

beforeEach(() => {
  create.mockReset();
  create.mockResolvedValue({ client_secret: "pi_test_secret" });
});

async function call(body: unknown) {
  const { POST } = await import("./route");
  return POST(new Request("http://t/api/checkout", { method: "POST", body: JSON.stringify(body) }));
}

describe("POST /api/checkout", () => {
  it("creates a PaymentIntent for the work price and returns the client secret", async () => {
    const res = await call({ slug: "untitled-vessel" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ clientSecret: "pi_test_secret" });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 120000, currency: "usd" }),
    );
  });
  it("404s for an unknown work", async () => {
    const res = await call({ slug: "nope" });
    expect(res.status).toBe(404);
    expect(create).not.toHaveBeenCalled();
  });
  it("404s for an unavailable work", async () => {
    const res = await call({ slug: "line-study-ix" });
    expect(res.status).toBe(404);
  });
  it("400s for a malformed (non-JSON) body", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      new Request("http://t/api/checkout", { method: "POST", body: "not json" }),
    );
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
});
