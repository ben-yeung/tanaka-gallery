"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./Spotlight.module.css";

export interface SpotlightItem {
  slug: string;
  title: string;
  image: string;
  meta: string; // "stoneware · 2021 · 9 × 7 × 7 in"
  artistName: string;
  artistBio: string;
}

const ADVANCE_MS = 5000;

// Fisher–Yates: returns a permutation of [0..n-1]. Default order source for production.
function fisherYates(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

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
  // SSR + first client render use identity order so server/client markup match.
  const [order, setOrder] = useState<number[]>(() => items.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Shuffle once, after mount (client only), to avoid a hydration mismatch.
  useEffect(() => {
    setOrder(shuffle(items.length));
    setIndex(0);
  }, [items.length, shuffle]);

  // Auto-advance — disabled under reduced motion, while hovered, or with <2 items.
  useEffect(() => {
    if (reduce || paused || items.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, ADVANCE_MS);
    return () => clearInterval(id);
  }, [reduce, paused, items.length]);

  if (items.length === 0) return null;

  const active = items[order[index] ?? 0];
  const total = items.length;

  return (
    <div
      className={styles.spotlight}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <Link href={`/works/${active.slug}`} className={styles.link}>
        <div className={styles.frame}>
          {reduce ? (
            <img src={active.image} alt={active.title} className={styles.img} />
          ) : (
            <AnimatePresence initial={false}>
              <motion.img
                key={active.slug}
                src={active.image}
                alt={active.title}
                className={styles.img}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>
          )}
        </div>
        <div className={styles.caption}>
          <p className={styles.title}>{active.title}</p>
          <p className={styles.artist}>{active.artistName}</p>
          <p className={styles.meta}>{active.meta}</p>
          <p className={styles.bio}>{active.artistBio}</p>
        </div>
      </Link>
      <p className={styles.counter} aria-hidden="true">
        {pad2(index + 1)} / {pad2(total)}
      </p>
    </div>
  );
}
