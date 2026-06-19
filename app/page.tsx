// app/page.tsx
import Link from "next/link";
import { allWorks } from "@/data/works";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { beat, FURIGANA_DELAY } from "@/components/motion/splash/timing";
import styles from "./home.module.css";

export default function Home() {
  const count = allWorks().length;
  const jpBeat = beat(1);
  return (
    <>
      <section className={styles.hero}>
        <h1 className={styles.tagline}>
          <SplashItem as="span" variant="inline" delay={beat(0)}>
            Art.{" "}
          </SplashItem>
          <SplashItem as="span" variant="inline" delay={jpBeat} className={styles.jp}>
            <span className={styles.ruby}>
              侘
              <SplashItem
                as="span"
                variant="furigana"
                delay={jpBeat + FURIGANA_DELAY}
                className={styles.rt}
              >
                わ
              </SplashItem>
            </span>
            び
            <span className={styles.ruby}>
              寂
              <SplashItem
                as="span"
                variant="furigana"
                delay={jpBeat + FURIGANA_DELAY}
                className={styles.rt}
              >
                さ
              </SplashItem>
            </span>
            び<span className={styles.maru}>。</span>
          </SplashItem>
          <SplashItem as="span" variant="inline" delay={beat(2)} className={styles.sf}>
            San Francisco.
          </SplashItem>
        </h1>
        <SplashItem as="p" delay={beat(3)} className={styles.heroSub}>
          Made in Japan. Curated in SF.
        </SplashItem>
      </section>
      <SplashItem as="section" delay={beat(4)} className={styles.index}>
        <p className={styles.note}>
          <span className={styles.noteHead}>Contemporary art projects.</span>
          <span className={styles.noteSub}>Timeless artists, from Tokyo to the Bay.</span>
        </p>
        <Link href="/works" className={styles.indexLink}>
          View ({count}) Selected Works →
        </Link>
      </SplashItem>
    </>
  );
}
