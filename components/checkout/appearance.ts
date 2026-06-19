import type { Appearance } from "@stripe/stripe-js";

// Reads the live theme tokens off :root so Stripe Elements match the active theme.
export function buildAppearance(): Appearance {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string) => s.getPropertyValue(name).trim();
  return {
    theme: "stripe",
    variables: {
      colorBackground: v("--paper"),
      colorText: v("--ink"),
      colorPrimary: v("--matcha"),
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: "2px",
    },
  };
}
