"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  EASE_OUT,
  ITEM_DUR,
  RISE_Y,
  BLUR,
  REDUCED_DUR,
  ITEM_STAGGER,
  REDUCED_STAGGER,
} from "./splash/timing";

type Tag = "div" | "section" | "p" | "h2" | "ul" | "li";

// Same rise-in look as the splash itemVariants, but deliberately WITHOUT a `delay`:
// an explicit per-child delay overrides a parent's staggerChildren, so omitting it
// lets <ScrollReveal>'s stagger drive each paragraph's offset.
function revealItemVariants(reduce: boolean): Variants {
  if (reduce) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: REDUCED_DUR, ease: "easeOut" } },
    };
  }
  return {
    hidden: { opacity: 0, y: RISE_Y, filter: `blur(${BLUR}px)` },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: ITEM_DUR, ease: EASE_OUT },
    },
  };
}

// Container that staggers its <ScrollRevealItem> children the first time it scrolls
// into view — or immediately if it's already in view on load (e.g. landing on /#about).
// Unlike the splash (a one-shot load timer), this is viewport-driven, so the reveal
// lands when the reader actually reaches the section rather than on a fixed beat.
export function ScrollReveal({
  children,
  as = "div",
  id,
  className,
}: {
  children: React.ReactNode;
  as?: Tag;
  id?: string;
  className?: string;
}) {
  const reduce = !!useReducedMotion();
  const Comp = motion[as] as React.ElementType;
  return (
    <Comp
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      // once: don't re-hide on scroll back; amount: wait until a fifth is visible so
      // the cascade fires as the reader arrives, not the instant the edge peeks in.
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: reduce ? REDUCED_STAGGER : ITEM_STAGGER },
        },
      }}
    >
      {children}
    </Comp>
  );
}

// A single block that rises/deblurs/fades in (opacity-only under reduced motion) when
// its parent <ScrollReveal> enters view. Timing comes from the parent's stagger, so it
// shares the homepage's rise-in look without a per-item delay.
export function ScrollRevealItem({
  children,
  as = "div",
  className,
}: {
  children: React.ReactNode;
  as?: Tag;
  className?: string;
}) {
  const reduce = !!useReducedMotion();
  const Comp = motion[as] as React.ElementType;
  return (
    <Comp className={className} variants={revealItemVariants(reduce)}>
      {children}
    </Comp>
  );
}
