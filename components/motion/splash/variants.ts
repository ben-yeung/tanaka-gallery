import type { Variants } from "framer-motion";
import { EASE_OUT, ITEM_DUR, RISE_Y, BLUR, REDUCED_DUR, FURIGANA_DELAY } from "./timing";

// Block elements: rise + deblur + fade (reduced: opacity-only).
export function itemVariants(reduce: boolean, delay = 0): Variants {
  if (reduce) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: REDUCED_DUR, ease: "easeOut", delay } },
    };
  }
  return {
    hidden: { opacity: 0, y: RISE_Y, filter: `blur(${BLUR}px)` },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: ITEM_DUR, ease: EASE_OUT, delay },
    },
  };
}

// Inline fragments (hero headline): fade + deblur, NO translate (inline spans
// are not reliably transformable). Reduced: opacity-only.
export function inlineVariants(reduce: boolean, delay = 0): Variants {
  if (reduce) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: REDUCED_DUR, ease: "easeOut", delay } },
    };
  }
  return {
    hidden: { opacity: 0, filter: `blur(${BLUR}px)` },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: ITEM_DUR, ease: EASE_OUT, delay },
    },
  };
}

// Furigana readings (.rt, position:absolute → transformable): a small settle.
// Reduced: opacity-only (appears with its kanji).
export function furiganaVariants(reduce: boolean, delay = 0): Variants {
  // x: "-50%" self-centers the reading over its kanji. It MUST live here (not in CSS):
  // Framer drives `transform` for the Y settle, so a CSS translateX on .rt is overridden.
  if (reduce) {
    return {
      hidden: { opacity: 0, x: "-50%" },
      visible: { opacity: 1, x: "-50%", transition: { duration: REDUCED_DUR, ease: "easeOut", delay } },
    };
  }
  return {
    hidden: { opacity: 0, x: "-50%", y: -8 },
    // Deliberately no blur here: the readings are tiny — a settle (Y) reads cleaner than blur.
    visible: {
      opacity: 1,
      x: "-50%",
      y: 0,
      transition: { duration: 0.5, ease: EASE_OUT, delay: delay + FURIGANA_DELAY },
    },
  };
}
