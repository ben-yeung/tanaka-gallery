// TODO(stripe-integration): production build-out lives in a future plan — live-key
// config gated to a real environment, webhook handling (payment_intent.succeeded),
// order persistence, fulfillment/receipt. This mockup implements ONLY the test-mode
// Payment Element flow. Anchor: docs/superpowers/specs/2026-06-18-tanaka-gallery-design.md §7.
// Siblings: lib/stripe.ts, components/checkout/CheckoutPanel.tsx.
import { NextResponse } from "next/server";
import { stripe, assertTestMode } from "@/lib/stripe";
import { getWork } from "@/data/works";

export async function POST(req: Request) {
  assertTestMode();
  let slug: string | undefined;
  try {
    ({ slug } = (await req.json()) as { slug?: string });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const work = slug ? getWork(slug) : undefined;
  if (!work || !work.available) {
    return NextResponse.json({ error: "Work unavailable" }, { status: 404 });
  }
  const intent = await stripe.paymentIntents.create({
    amount: work.priceCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: { workSlug: work.slug, title: work.title },
  });
  return NextResponse.json({ clientSecret: intent.client_secret });
}
