"use client";

import { useContext } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AboutInViewContext } from "./AboutReveal";
import { wipeVariants } from "./aboutVariants";
import {
  EASE_OUT,
  ABOUT_UNDERLINE_DELAY,
  ABOUT_UNDERLINE_DUR,
  ABOUT_HL_DUR,
  ABOUT_HL_EASE,
  aboutHighlightDelay,
} from "../splash/timing";
import styles from "./marks.module.css";

// The lead's opening clause with a matcha bar that draws left→right once the lead has
// settled. The clause is expected to sit on one line (the lead is wide); if it wraps,
// the bar spans the clause's bounding box — an acceptable approximation for a
// decorative mark. whiteSpace:nowrap keeps the clause from breaking mid-phrase.
export function Underline({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = !!useReducedMotion();
  const inView = useContext(AboutInViewContext);
  return (
    <span className={className} style={{ position: "relative", whiteSpace: "nowrap" }}>
      {children}
      <motion.span
        aria-hidden="true"
        className={styles.bar}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={wipeVariants(reduce, ABOUT_UNDERLINE_DELAY, ABOUT_UNDERLINE_DUR, EASE_OUT)}
      />
    </span>
  );
}

// A body phrase with a translucent matcha wash that wipes in left→right as its own
// storytelling beat. `index` (0,1,2) selects the staggered delay for cols 1–3.
export function Highlight({
  children,
  index,
  className,
}: {
  children: React.ReactNode;
  index: number;
  className?: string;
}) {
  const reduce = !!useReducedMotion();
  const inView = useContext(AboutInViewContext);
  return (
    <span className={className} style={{ position: "relative", whiteSpace: "nowrap" }}>
      <motion.span
        aria-hidden="true"
        className={styles.wash}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={wipeVariants(reduce, aboutHighlightDelay(index), ABOUT_HL_DUR, ABOUT_HL_EASE)}
      />
      <span className={styles.text}>{children}</span>
    </span>
  );
}
