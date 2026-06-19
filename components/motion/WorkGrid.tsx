"use client";

import Link from "next/link";
import type { Work } from "@/data/types";
import { formatMeta } from "@/data/works";
import { setMorphOrigin } from "./morphStore";
import styles from "./grid.module.css";

export function WorkGrid({ works, dim = false }: { works: Work[]; dim?: boolean }) {
  return (
    <ul className={styles.grid}>
      {works.map((work) => {
        const sold = !work.available;
        return (
          <li key={work.slug} className={styles.cell}>
            <Link
              href={`/works/${work.slug}`}
              className={`${styles.unit} ${dim && sold ? styles.dimmed : ""}`}
              onClick={(e) => {
                const img = e.currentTarget.querySelector("img");
                if (img) {
                  const r = img.getBoundingClientRect();
                  setMorphOrigin(work.slug, {
                    top: r.top, left: r.left, width: r.width, height: r.height,
                  });
                }
              }}
            >
              <div className={styles.frame}>
                <img src={work.image} alt={work.title} data-morph={work.slug} loading="lazy" />
              </div>
              <p className={`meta ${styles.caption} ${sold ? styles.sold : ""}`}>
                {formatMeta(work)}
                {sold ? " · sold" : ""}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
