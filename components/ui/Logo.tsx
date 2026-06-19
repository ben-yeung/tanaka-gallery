"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { isFreshLoad } from "@/components/motion/splash/splashGate";
import { LOGO_DRAW_DUR, EASE_OUT } from "@/components/motion/splash/timing";

type LogoProps = {
  /** Rendered width/height in px (the mark is square). */
  size?: number;
  className?: string;
  /** Accessible label; pass an empty string to mark the logo decorative. */
  title?: string;
  /** Draw the strokes on, once, on a fresh document load. */
  animated?: boolean;
};

/**
 * Tanaka Projects mark — nested squares with corner ties.
 * Strokes use `currentColor` so the logo inherits the surrounding text color
 * (adapts to light/dark theme and any placement). Scale via the `size` prop.
 * When `animated` and on a fresh load (and motion is allowed), the strokes
 * draw on via pathLength.
 */
export function Logo({ size = 24, className, title = "Tanaka's Gallery", animated = false }: LogoProps) {
  const decorative = title === "";
  const reduce = !!useReducedMotion();
  const [fresh] = useState(() => isFreshLoad());
  const draw = animated && fresh && !reduce;

  const drawProps = draw
    ? {
        initial: { pathLength: 0 },
        animate: { pathLength: 1 },
        transition: { duration: LOGO_DRAW_DUR, ease: EASE_OUT },
      }
    : {};

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative ? true : undefined}
    >
      <motion.rect x="6" y="6" width="36" height="36" stroke="currentColor" strokeWidth="1.2" {...drawProps} />
      <motion.rect x="15" y="15" width="18" height="18" stroke="currentColor" strokeWidth="1.2" {...drawProps} />
      <motion.line x1="6" y1="6" x2="15" y2="15" stroke="currentColor" strokeWidth="1.2" {...drawProps} />
      <motion.line x1="42" y1="6" x2="33" y2="15" stroke="currentColor" strokeWidth="1.2" {...drawProps} />
      <motion.line x1="6" y1="42" x2="15" y2="33" stroke="currentColor" strokeWidth="1.2" {...drawProps} />
      <motion.line x1="42" y1="42" x2="33" y2="33" stroke="currentColor" strokeWidth="1.2" {...drawProps} />
    </svg>
  );
}
