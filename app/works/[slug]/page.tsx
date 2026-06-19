import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getWork } from "@/data/works";
import { getArtist } from "@/data/artists";
import { formatPrice } from "@/data/format";
import { MorphImage } from "@/components/motion/MorphImage";
import styles from "./detail.module.css";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  return { title: work ? work.title : "Not found" };
}

export default async function WorkDetail({ params }: Params) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();
  const artist = getArtist(work.artistSlug);

  return (
    <article>
      <div className={styles.stage}>
        <MorphImage slug={work.slug} src={work.image} alt={work.title} />
      </div>
      <div className={styles.info}>
        <div>
          <h1 className={styles.title}>{work.title}</h1>
          <p className={`meta ${styles.line}`}>
            {artist ? (
              <Link href={`/artists/${artist.slug}`} className={styles.artistLink}>{artist.name}</Link>
            ) : (
              "Unknown"
            )}
            {` · ${work.year} · ${work.medium} · ${work.dimensions}`}
          </p>
        </div>
        <div>
          {work.available ? (
            <>
              <p className={styles.price}>{formatPrice(work.priceCents)}</p>
              <Link href={`/works/${work.slug}/inquire`} className={styles.inquire}>
                Inquire →
              </Link>
            </>
          ) : (
            <p className={`${styles.price} ${styles.sold}`}>Sold</p>
          )}
        </div>
      </div>
    </article>
  );
}
