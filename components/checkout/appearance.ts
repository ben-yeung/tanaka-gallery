import type { Appearance } from "@stripe/stripe-js";

// Reads the live theme tokens off :root so Stripe Elements match the active theme.
export function buildAppearance(): Appearance {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string) => s.getPropertyValue(name).trim();
  // Scale Stripe's internal font proportionally with viewport — the element is
  // an iframe so it ignores our CSS vw/vh values; must be computed here.
  // Match site's meta scale: max(13px, 0.75vw)
  const fontSizeBase = `${Math.max(13, window.innerWidth * 0.0075)}px`;
  return {
    theme: "stripe",
    variables: {
      colorBackground: v("--paper"),
      colorText: v("--ink"),
      colorPrimary: v("--matcha"),
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: "2px",
      fontSizeBase,
    },
  };
}
