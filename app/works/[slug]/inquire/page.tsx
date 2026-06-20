import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWork } from "@/data/works";
import { getArtist } from "@/data/artists";
import { formatPrice } from "@/data/format";
import { CheckoutPanel } from "@/components/checkout/CheckoutPanel";
import { TestCardNote } from "@/components/checkout/TestCardNote";
import styles from "./inquire.module.css";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  return { title: work ? `Inquire — ${work.title}` : "Not found" };
}

export default async function Inquire({ params }: Params) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work || !work.available) notFound();
  const artist = getArtist(work.artistSlug);

  return (
    <section className={styles.wrap}>
      <div className={styles.grid}>
        {/* Left: order summary */}
        <div>
          <p className={`meta ${styles.sectionLabel}`}>Order summary</p>
          <hr className={styles.rule} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={work.image} alt={work.title} className={styles.thumb} />
          <h1 className={styles.workTitle}>{work.title}</h1>
          <p className={`meta ${styles.workMeta}`}>
            <span className={styles.artistName}>{artist?.name ?? "Unknown"}</span>
            {` · ${work.year} · ${work.medium}`}
          </p>
          <p className={`meta ${styles.workMeta}`}>{work.dimensions}</p>
          <p className={styles.workPrice}>{formatPrice(work.priceCents)}</p>
        </div>

        {/* Right: payment form */}
        <div>
          <p className={`meta ${styles.sectionLabel}`}>Payment</p>
          <hr className={styles.rule} />
          <CheckoutPanel slug={work.slug} />
        </div>

        {/* Floating aside: test card note (third column on wide screens) */}
        <div className={styles.floatingNote}>
          <TestCardNote />
        </div>
      </div>
    </section>
  );
}
