// TODO(stripe-integration): test-mode only — anchor: app/api/checkout/route.ts
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY ?? "";

// Mockup safety rail: never allow a live key to run. See TODO(stripe-integration).
export function assertTestMode(): void {
  if (!key.startsWith("sk_test_")) {
    throw new Error(
      "Refusing to run checkout: STRIPE_SECRET_KEY must be a test-mode key (sk_test_…). " +
        "This mockup never processes live payments.",
    );
  }
}

// apiVersion intentionally omitted: stripe@17 types reject "2025-05-28.basil"
// (expect "2025-02-24.acacia"). Per the brief we don't guess — let the SDK default
// to the account's pinned version. See TODO(stripe-integration).
//
// Placeholder when the key is empty: `new Stripe("")` throws at construction
// ("Neither apiKey nor config.authenticator provided"), which would break the
// production build during page-data collection (no .env.local in this mockup).
// The real guard is assertTestMode(), which runs before any Stripe API call and
// inspects the actual STRIPE_SECRET_KEY — never this placeholder. A bare
// constructor placeholder cannot reach Stripe's servers without passing the guard.
export const stripe = new Stripe(key || "sk_test_placeholder");
