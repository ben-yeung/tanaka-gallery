"use client";

import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useLayoutEffect, useRef } from "react";
import { takeMorphOrigin } from "./morphStore";
import styles from "./grid.module.css";

export function MorphImage({ slug, src, alt }: { slug: string; src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const target = ref.current?.getBoundingClientRect();
    const origin = takeMorphOrigin(slug);
    if (!target || !origin || reduce) {
      controls.set({ x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 });
      return;
    }
    // FLIP: place at the captured grid-tile rect, then animate to identity (full-bleed).
    controls.set({
      x: origin.left - target.left,
      y: origin.top - target.top,
      scaleX: origin.width / target.width,
      scaleY: origin.height / target.height,
      opacity: 1,
    });
    controls.start({
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    });
  }, [slug, reduce, controls]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial={false}
      style={{ transformOrigin: "top left", width: "100%", height: "100%" }}
      className={styles.morphWrap}
    >
      <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </motion.div>
  );
}
