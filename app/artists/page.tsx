import type { Metadata } from "next";
import Link from "next/link";
import { allArtists } from "@/data/artists";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { CONTENT_START, rowDelay, beat } from "@/components/motion/splash/timing";
import styles from "./artists.module.css";

export const metadata: Metadata = { title: "Artists" };

export default function ArtistsPage() {
  return (
    <>
      <header className={styles.head}>
        <SplashItem as="h1" delay={CONTENT_START}>Artists</SplashItem>
        <SplashItem as="p" delay={beat(1)} className={styles.haikuLine}>From the kiln, from rain</SplashItem>
        <SplashItem as="p" delay={beat(2)} className={styles.haikuLine}>Each mark made before it fades</SplashItem>
        <SplashItem as="p" delay={beat(3)} className={styles.haikuLine}>Ten voices remain.</SplashItem>
      </header>
      <section className={styles.index}>
        {allArtists().map((a, i) => (
          <SplashItem key={a.slug} as="div" delay={rowDelay(i)}>
            <Link href={`/artists/${a.slug}`} className={styles.row}>
              <span className={styles.nameGroup}>
                <span className={styles.name}>{a.name}</span>
                <span className={styles.nameJa}>{a.nameJa}</span>
              </span>
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
