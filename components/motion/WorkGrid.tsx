"use client";

import Link from "next/link";
import type { Work } from "@/data/types";
import { formatMeta } from "@/data/works";
import { setMorphOrigin } from "./morphStore";
import styles from "./grid.module.css";

export function WorkGrid({ works }: { works: Work[] }) {
  return (
    <div className={styles.grid}>
      {works.map((work) => (
        <Link
          key={work.slug}
          href={`/works/${work.slug}`}
          className={styles.tile}
          onClick={(e) => {
            const img = e.currentTarget.querySelector("img");
            if (img) {
              const r = img.getBoundingClientRect();
              setMorphOrigin(work.slug, { top: r.top, left: r.left, width: r.width, height: r.height });
            }
          }}
        >
          <div className={styles.frame}>
            <img src={work.image} alt={work.title} data-morph={work.slug} loading="lazy" />
          </div>
          <p className={`meta ${styles.caption} ${work.available ? "" : styles.sold}`}>
            {formatMeta(work)}
            {work.available ? "" : " · sold"}
          </p>
        </Link>
      ))}
    </div>
  );
}
