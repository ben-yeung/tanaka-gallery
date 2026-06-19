import type { Metadata } from "next";
import Link from "next/link";
import { allArtists } from "@/data/artists";
import styles from "./artists.module.css";

export const metadata: Metadata = { title: "Artists" };

export default function ArtistsPage() {
  return (
    <>
      <header className={styles.head}>
        <h1>Artists</h1>
        <p className="subhead">Twenty represented — half Japanese, half Bay Area</p>
      </header>
      <section className={styles.index}>
        {allArtists().map((a) => (
          <Link key={a.slug} href={`/artists/${a.slug}`} className={styles.row}>
            <span className={styles.name}>{a.name}</span>
            <span className={styles.origin}>{a.origin} · b. {a.born}</span>
          </Link>
        ))}
      </section>
    </>
  );
}
