# Tanaka Projects — gallery

A minimal portfolio + sales site. Next.js (App Router), React, TypeScript, Framer Motion. Checkout is **Stripe test mode only** — no real payments.

## Run
```bash
npm install
cp .env.example .env.local  # add your Stripe TEST keys (sk_test_/pk_test_)
npm run dev
```

## Test
```bash
npm test
npm run build
```

## Notes
- Light/dark: toggle in the nav, or follows OS preference on first visit.
- Checkout test card: `4242 4242 4242 4242`, any future expiry, any CVC.
- Deferred work: `grep -rn "TODO(stripe-integration)"`, `TODO(splash-timing)`.
