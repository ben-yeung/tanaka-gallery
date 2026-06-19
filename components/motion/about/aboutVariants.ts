import type { Variants } from "framer-motion";

// A left→right "wipe" shared by the lead underline (a thin bar) and the body
// highlights (a translucent wash): the colored layer scales in X from 0 to 1 with its
// origin pinned left. Reduced motion: the layer renders already-drawn (scaleX 1, no
// animation), mirroring the splash's opacity-only reduced behavior.
export function wipeVariants(
  reduce: boolean,
  delay: number,
  duration: number,
  ease: readonly number[],
): Variants {
  if (reduce) {
    return { hidden: { scaleX: 1 }, visible: { scaleX: 1 } };
  }
  return {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration, ease: ease as number[], delay } },
  };
}
