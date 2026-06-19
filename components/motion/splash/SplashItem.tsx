"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { isFreshLoad } from "./splashGate";
import { itemVariants, inlineVariants, furiganaVariants } from "./variants";

type Tag = "div" | "span" | "p" | "li" | "section" | "header" | "h1";

type SplashItemProps = {
  children: React.ReactNode;
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
  // Snapshot the gate ONCE during render (before any effects), so client
  // navigations and the gate's post-paint flip never restart an animation.
  const [play] = useState(() => isFreshLoad());
  // Same element type on both the playing and at-rest paths (avoids hydration mismatch).
  const Comp = motion[as] as React.ElementType;

  if (!play) {
    return <Comp className={className}>{children}</Comp>;
  }

  const variants =
    variant === "inline"
      ? inlineVariants(reduce, delay)
      : variant === "furigana"
        ? furiganaVariants(reduce, delay)
        : itemVariants(reduce, delay);

  return (
    <Comp className={className} initial="hidden" animate="visible" variants={variants}>
      {children}
    </Comp>
  );
}
