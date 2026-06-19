"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { computeSnakeOrder, type SnakeItem } from "./lib/snake";
import styles from "./styles/grid.module.css";

const SKELETON_COUNT = 12;
const STEP_MS = 75; // per-tile stagger along the snake path

/**
 * Decorative grid-area placeholder shown while the works grid loads. Reuses the
 * real `.grid`/`.frame` layout so the skeleton matches the live column count, and
 * staggers a subtle color pulse in the same boustrophedon (snake) order as the
 * grid entrance, so the loading state previews the entrance's rhythm.
 */
export function GallerySkeleton({ count = SKELETON_COUNT }: { count?: number }) {
  const reduce = useReducedMotion();
  const frames = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (reduce) return; // reduced motion: leave frames static (CSS also disables the pulse)
    const items: SnakeItem[] = [];
    frames.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      items.push({ key: String(i), top: r.top, left: r.left });
    });
    for (const step of computeSnakeOrder(items)) {
      const el = frames.current[Number(step.key)];
      if (el) el.style.setProperty("--skel-delay", `${step.index * STEP_MS}ms`);
    }
  }, [reduce, count]);

  return (
    <ul className={styles.grid} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={styles.cell}>
          <div
            ref={(el) => {
              frames.current[i] = el;
            }}
            className={`${styles.frame} ${styles.skel}`}
          />
        </li>
      ))}
    </ul>
  );
}
