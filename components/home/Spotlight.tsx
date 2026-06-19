"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./Spotlight.module.css";

export interface SpotlightItem {
  slug: string;
  title: string;
  image: string;
  meta: string; // kept for data parity (unused in the caption)
  artistName: string;
  artistBio: string; // kept for data parity (unused in the caption)
}

const ADVANCE_MS = 5000;
const GAP = 16; // px — must match .grid gap in Spotlight.module.css
const MIN_CARD = 240; // px — min comfortable card width before dropping a column
const MAX_COLS = 3;

// Fisher–Yates: returns a permutation of [0..n-1]. Default order source for production.
function fisherYates(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// How many cards fit in `width`, clamped to [1, MAX_COLS].
function fitColumns(width: number): number {
  if (!width) return 1;
  const cards = Math.floor((width + GAP) / (MIN_CARD + GAP));
  return Math.max(1, Math.min(MAX_COLS, cards));
}

// Local reduced-motion hook: reads the live media query (SSR-safe, reactive),
// avoiding framer-motion's module-level singleton so render and timing share one source.
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function Spotlight({
  items,
  shuffle = fisherYates,
}: {
  items: SpotlightItem[];
  shuffle?: (n: number) => number[];
}) {
  const reduce = usePrefersReducedMotion();
  // SSR + first client render use identity order and 1 column so markup is deterministic.
  const [order, setOrder] = useState<number[]>(() => items.map((_, i) => i));
  const [start, setStart] = useState(0);
  const [cols, setCols] = useState(1);
  const [paused, setPaused] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Shuffle once, after mount (client only), to avoid a hydration mismatch.
  useEffect(() => {
    setOrder(shuffle(items.length));
    setStart(0);
  }, [items.length, shuffle]);

  // Responsive column count: measure the live grid width and pick how many fit.
  useEffect(() => {
    const el = gridRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      setCols(fitColumns(entries[0]?.contentRect.width ?? 0));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const total = items.length;
  const n = Math.max(1, Math.min(cols, Math.max(total, 1)));

  // Auto-advance the window by one work — disabled under reduced motion, while
  // hovered, or when every work is already visible.
  useEffect(() => {
    if (reduce || paused || total <= n) return;
    const id = setInterval(() => setStart((s) => (s + 1) % total), ADVANCE_MS);
    return () => clearInterval(id);
  }, [reduce, paused, total, n]);

  if (total === 0) return null;

  // The visible window: n works starting at `start`, wrapping around.
  const visible = Array.from(
    { length: n },
    (_, i) => items[order[(start + i) % total] ?? 0],
  );

  return (
    <div
      className={styles.spotlight}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        ref={gridRef}
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {/* popLayout pops the exiting card out of flow so the remaining cards slide
            left to fill the gap while a new card slides in from the right. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((work) => (
            <motion.div
              key={work.slug}
              layout
              className={styles.card}
              initial={reduce ? false : { opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: "-100%" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/works/${work.slug}`} className={styles.link}>
                <div className={styles.frame}>
                  <img src={work.image} alt={work.title} className={styles.img} />
                </div>
                <div className={styles.caption}>
                  <p className={styles.label}>
                    <span className={styles.title}>{work.title}</span>
                    <span className={styles.sep} aria-hidden="true">
                      •
                    </span>
                    <span className={styles.artist}>{work.artistName}</span>
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
