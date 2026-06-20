// TODO(stripe-integration): test-mode only — anchor: app/api/checkout/route.ts
"use client";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { buildAppearance } from "./appearance";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

function Form({ slug }: { slug: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/confirmed?work=${slug}` },
    });
    if (error) {
      setError(error.message ?? "Payment failed.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <PaymentElement />
      {error && <p className="meta" role="alert" style={{ marginTop: 12 }}>{error}</p>}
      <button type="submit" disabled={!stripe || busy} className="subhead" style={{ marginTop: 20, cursor: "pointer", background: "none", border: "1px solid var(--ink)", padding: "10px 18px", color: "inherit" }}>
        {busy ? "Processing…" : "Checkout"}
      </button>
    </form>
  );
}

export function CheckoutPanel({ slug }: { slug: string }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("This work is unavailable.");
        return r.json();
      })
      .then((d) => setClientSecret(d.clientSecret))
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <p className="meta" role="alert">{error}</p>;
  if (!clientSecret) return <p className="meta">Preparing checkout…</p>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: buildAppearance() }}>
      <Form slug={slug} />
    </Elements>
  );
}
