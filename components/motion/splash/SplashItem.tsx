"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, useLayoutEffect, useRef } from "react";
import { isFreshLoad } from "./splashGate";
import { itemVariants, inlineVariants, furiganaVariants } from "./variants";
import { CONTENT_START } from "./timing";

type Tag = "div" | "span" | "p" | "li" | "section" | "header" | "h1" | "h2";

type SplashItemProps = {
  // Optional so purely decorative elements (e.g. a divider) can self-close.
  children?: React.ReactNode;
  as?: Tag;
  delay?: number;
  variant?: "item" | "inline" | "furigana";
  className?: string;
  // When true, plays the entrance on every mount — not just the initial
  // document load. Use on pages where you want the splash to replay on
  // client-side navigation (e.g. the /artists index).
  replay?: boolean;
};

export function SplashItem({
  children,
  as = "div",
  delay = 0,
  variant = "item",
  className,
  replay = false,
}: SplashItemProps) {
  const reduce = !!useReducedMotion();
  // Three-state: null = not yet mounted (SSR + initial hydration render),
  // false = mounted but no animation (client-side nav), true = animating.
  // Starts null so the server HTML and the initial client render both agree:
  // both ship opacity:0, so the browser never flashes visible content before
  // JS hydrates. useLayoutEffect flips to true on a fresh load or when
  // replay=true (animation plays) or false otherwise (content visible immediately).
  // The null→false transition happens before paint.
  const [play, setPlay] = useState<boolean | null>(null);
  // True when animating due to client-side navigation (replay=true, not a fresh
  // load). In this case the navbar doesn't reanimate, so we subtract CONTENT_START
  // from the delay to avoid waiting for a navbar lead that isn't happening.
  const navReplayRef = useRef(false);
  useLayoutEffect(() => {
    const fresh = isFreshLoad();
    navReplayRef.current = replay && !fresh;
    setPlay(replay || fresh ? true : false);
  }, []);
  // Same element type on both the playing and at-rest paths (avoids hydration mismatch).
  const Comp = motion[as] as React.ElementType;

  if (play !== true) {
    // play=null: initial load, pre-hydration — hidden so SSR content doesn't
    // flash visible in the browser before the splash animation begins.
    // play=false: client-side nav — show normally, no animation.
    // key="idle" pairs with key="anim" below: different keys force Framer to
    // remount (not update) when play flips to true, so initial="hidden" is
    // treated as a fresh mount and the opacity-0 starting state is applied.
    return (
      <Comp key="idle" className={className} style={play === null ? { opacity: 0 } : undefined}>
        {children}
      </Comp>
    );
  }

  const effectiveDelay = navReplayRef.current ? Math.max(0, delay - CONTENT_START) : delay;
  const variants =
    variant === "inline"
      ? inlineVariants(reduce, effectiveDelay)
      : variant === "furigana"
        ? furiganaVariants(reduce, effectiveDelay)
        : itemVariants(reduce, effectiveDelay);

  return (
    <Comp key="anim" className={className} initial="hidden" animate="visible" variants={variants}>
      {children}
    </Comp>
  );
}
