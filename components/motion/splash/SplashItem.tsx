"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, useLayoutEffect } from "react";
import { isFreshLoad } from "./splashGate";
import { itemVariants, inlineVariants, furiganaVariants } from "./variants";

type Tag = "div" | "span" | "p" | "li" | "section" | "header" | "h1" | "h2";

type SplashItemProps = {
  // Optional so purely decorative elements (e.g. a divider) can self-close.
  children?: React.ReactNode;
  as?: Tag;
  delay?: number;
  variant?: "item" | "inline" | "furigana";
  className?: string;
};

export function SplashItem({
  children,
  as = "div",
  delay = 0,
  variant = "item",
  className,
}: SplashItemProps) {
  const reduce = !!useReducedMotion();
  // Start false so server HTML and the initial hydration render agree: neither
  // carries Framer's inline opacity/filter/transform styles, avoiding the
  // React 19 hydration mismatch where the lazy initializer can be re-invoked
  // after endFreshLoad() has run. useLayoutEffect flips to true before the
  // first paint on a fresh load, so the animation still starts from opacity-0
  // with no visible flash. Client-side navigations leave play=false (gate
  // already closed by Nav's effect) so the splash never replays.
  const [play, setPlay] = useState(false);
  useLayoutEffect(() => {
    if (isFreshLoad()) setPlay(true);
  }, []);
  // Same element type on both the playing and at-rest paths (avoids hydration mismatch).
  const Comp = motion[as] as React.ElementType;

  if (!play) {
    // key="idle" pairs with key="anim" below: different keys force Framer to
    // remount (not update) when play flips, so initial="hidden" is treated as
    // a fresh mount and the opacity-0 starting state is applied.
    return <Comp key="idle" className={className}>{children}</Comp>;
  }

  const variants =
    variant === "inline"
      ? inlineVariants(reduce, delay)
      : variant === "furigana"
        ? furiganaVariants(reduce, delay)
        : itemVariants(reduce, delay);

  return (
    <Comp key="anim" className={className} initial="hidden" animate="visible" variants={variants}>
      {children}
    </Comp>
  );
}
