# Tanaka Projects — gallery mockup

A clean, minimal portfolio + sales mockup. Next.js (App Router), React, TypeScript,
Framer Motion. Checkout is **Stripe test mode only** — no real payments.

## Run
```bash
npm install
npm run gen:placeholders   # writes public/works/*.svg art stand-ins
cp .env.example .env.local # add your Stripe TEST keys (sk_test_/pk_test_)
npm run dev
```

## Test
```bash
npm test
npm run build
```

## Notes
- Light/dark follow your OS preference (`prefers-color-scheme`).
- Checkout test card: 4242 4242 4242 4242, any future expiry, any CVC.
- Deferred work is tracked inline: `grep -rn "TODO(stripe-integration)"`, `TODO(theme-toggle)`.
