import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getWork } from "@/data/works";
import { getArtist } from "@/data/artists";
import { LightboxStage } from "@/components/motion/LightboxStage";
import { WorkAvailability } from "@/components/checkout/WorkAvailability";
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
      <LightboxStage slug={work.slug} src={work.image} alt={work.title} />
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
          <WorkAvailability slug={work.slug} priceCents={work.priceCents} available={work.available} />
        </div>
      </div>
    </article>
  );
}
