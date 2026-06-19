import Link from "next/link";
import { allWorks } from "@/data/works";
import styles from "./home.module.css";

export default function Home() {
  const count = allWorks().length;
  return (
    <>
      <section className={styles.hero}>
        <h1 className={styles.tagline}>
          Art.{" "}
          <span className={styles.jp}>
            <span className={styles.ruby}>
              侘<span className={styles.rt}>わ</span>
            </span>
            び
            <span className={styles.ruby}>
              寂<span className={styles.rt}>さ</span>
            </span>
            び<span className={styles.maru}>。</span>
          </span>
          <span className={styles.sf}>San Francisco.</span>
        </h1>
        <p className={styles.heroSub}>Made in Japan. Curated in SF.</p>
      </section>
      <section className={styles.index}>
        <p className={styles.note}>
          <span className={styles.noteHead}>Contemporary art projects.</span>
          <span className={styles.noteSub}>Timeless artists, from Tokyo to the Bay.</span>
        </p>
        <Link href="/works" className={styles.indexLink}>
          View ({count}) Selected Works →
        </Link>
      </section>
    </>
  );
}
