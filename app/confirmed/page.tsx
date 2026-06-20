import type { Metadata } from "next";
import Link from "next/link";
import { getWork } from "@/data/works";
import { getArtist } from "@/data/artists";
import { formatPrice } from "@/data/format";
import styles from "./confirmed.module.css";

export const metadata: Metadata = { title: "Confirmed" };

type Search = { searchParams: Promise<{ work?: string; redirect_status?: string }> };

export default async function Confirmed({ searchParams }: Search) {
  const { work: slug, redirect_status } = await searchParams;
  const work = slug ? getWork(slug) : undefined;
  const artist = work ? getArtist(work.artistSlug) : undefined;
  const ok = redirect_status === "succeeded";

  return (
    <section className={styles.wrap}>
      <h1 className={styles.heading}>{ok ? "Thank you." : "Order incomplete."}</h1>

      {ok && work ? (
        <>
          <div className={styles.receipt}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={work.image} alt={work.title} className={styles.thumb} />
            <div className={styles.receiptInfo}>
              <p className={styles.workTitle}>{work.title}</p>
              <p className={`meta ${styles.workMeta}`}>
                {artist?.name ?? "Unknown"} · {work.year}
              </p>
              <p className={`meta ${styles.workMeta}`}>{work.medium}</p>
              <p className={styles.workPrice}>{formatPrice(work.priceCents)}</p>
            </div>
          </div>
          <p className={`meta ${styles.note}`}>
            Test-mode order — no real payment was taken and nothing ships.
          </p>
        </>
      ) : (
        <p className={`meta ${styles.note}`}>No payment was completed.</p>
      )}

      <Link href="/works" className={`subhead ${styles.back}`} style={{ borderBottom: "1px solid currentColor", display: "inline-block" }}>
        ← Back to works
      </Link>
    </section>
  );
}
