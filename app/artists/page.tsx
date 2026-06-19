import type { Metadata } from "next";
import Link from "next/link";
import { allArtists } from "@/data/artists";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { CONTENT_START, rowDelay } from "@/components/motion/splash/timing";
import styles from "./artists.module.css";

export const metadata: Metadata = { title: "Artists" };

export default function ArtistsPage() {
  return (
    <>
      <SplashItem as="header" delay={CONTENT_START} className={styles.head}>
        <h1>Artists</h1>
        <p className="subhead">Twenty represented — half Japanese, half Bay Area</p>
      </SplashItem>
      <section className={styles.index}>
        {allArtists().map((a, i) => (
          <SplashItem key={a.slug} as="div" delay={rowDelay(i)}>
            <Link href={`/artists/${a.slug}`} className={styles.row}>
              <span className={styles.name}>{a.name}</span>
              <span className={styles.origin}>
                {a.origin} · b. {a.born}
              </span>
            </Link>
          </SplashItem>
        ))}
      </section>
    </>
  );
}
