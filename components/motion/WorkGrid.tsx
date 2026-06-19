"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { isFreshLoad } from "./splash/splashGate";
import { SNAKE_LEAD_MS } from "./splash/timing";
import type { Work } from "@/data/types";
import { getArtist } from "@/data/artists";
import { setMorphOrigin } from "./lib/morphStore";
import { consumeGalleryReturn, markGalleryReturn } from "./lib/entranceFlag";
import { computeSnakeOrder, type SnakeItem } from "./lib/snake";
import styles from "./styles/grid.module.css";

const ENTER_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function WorkGrid({ works, dim = false }: { works: Work[]; dim?: boolean }) {
  const reduce = useReducedMotion();
  const units = useRef(new Map<string, HTMLElement>());
  const pathname = usePathname();

  // Snapshot once: on a fresh document-load landing, the navbar + header lead,
  // so the snake waits SNAKE_LEAD_MS before beginning. Client-nav and reduced
  // motion are unaffected by the snapshot timing.
  const [freshLanding] = useState(() => isFreshLoad());

  // Run the entrance once on mount.
  useEffect(() => {
    if (consumeGalleryReturn(pathname)) return; // returned from a detail morph on same grid → no re-entrance
    const lead = freshLanding ? SNAKE_LEAD_MS : 0;
    const items: SnakeItem[] = [];
    units.current.forEach((el, key) => {
      const r = el.getBoundingClientRect();
      items.push({ key, top: r.top, left: r.left });
    });
    const order = computeSnakeOrder(items);

    for (const step of order) {
      const el = units.current.get(step.key);
      if (!el || typeof el.animate !== "function") continue; // jsdom guard
      if (reduce) {
        el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 600,
          delay: lead + step.index * 60,
          easing: "ease",
          fill: "backwards",
        });
      } else {
        const dy = step.fromTop ? -80 : 80;
        el.animate(
          [
            { opacity: 0, filter: "blur(12px) brightness(1.25)", transform: `translateY(${dy}px)` },
            { opacity: 1, filter: "blur(0) brightness(1)", transform: "none" },
          ],
          { duration: 1250, delay: lead + step.index * 190, easing: ENTER_EASE, fill: "backwards" },
        );
      }
    }
    // Mount-only: the entrance should not re-run on sort changes (reflow handles those).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LayoutGroup>
      <motion.ul className={styles.grid}>
        {works.map((work) => {
          const sold = !work.available;
          return (
            <motion.li
              key={work.slug}
              className={styles.cell}
              layout={reduce ? false : true}
              initial={false}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                ref={(el) => {
                  if (el) units.current.set(work.slug, el);
                  else units.current.delete(work.slug);
                }}
                href={`/works/${work.slug}`}
                className={`${styles.unit}${dim && sold ? " " + styles.dimmed : ""}`}
                onClick={(e) => {
                  const img = e.currentTarget.querySelector("img");
                  if (img) {
                    const r = img.getBoundingClientRect();
                    setMorphOrigin(work.slug, {
                      top: r.top, left: r.left, width: r.width, height: r.height,
                    });
                  }
                  markGalleryReturn(pathname);
                }}
              >
                <div className={styles.frame}>
                  <img src={work.image} alt={work.title} data-morph={work.slug} loading="lazy" />
                </div>
                <div className={`${styles.caption} ${sold ? styles.sold : ""}`}>
                  <p className={styles.label}>
                    <span className={styles.title}>{work.title}</span>
                    <span className={styles.sep} aria-hidden="true">•</span>
                    <span className={styles.artist}>{getArtist(work.artistSlug)?.name ?? ""}</span>
                    {sold && <span className={styles.soldTag}> · sold</span>}
                  </p>
                </div>
              </Link>
            </motion.li>
          );
        })}
      </motion.ul>
    </LayoutGroup>
  );
}
