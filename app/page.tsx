import Link from "next/link";
import { allWorks } from "@/data/works";
import styles from "./home.module.css";

export default function Home() {
  const count = allWorks().length;
  return (
    <>
      <section className={styles.hero}>
        <h1 className={styles.tagline}>Art. Objects. San Francisco.</h1>
      </section>
      <section className={styles.index}>
        <p className={styles.note}>
          Contemporary art and objects. Twenty artists, half Japanese, half Bay Area.
        </p>
        <Link href="/works" className={styles.indexLink}>
          Selected Works ({count}) →
        </Link>
      </section>
    </>
  );
}
