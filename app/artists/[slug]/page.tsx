import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtist } from "@/data/artists";
import { worksByArtist } from "@/data/works";
import { WorkGrid } from "@/components/motion/WorkGrid";
import styles from "../artists.module.css";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const artist = getArtist(slug);
  return { title: artist ? artist.name : "Not found" };
}

export default async function ArtistDetail({ params }: Params) {
  const { slug } = await params;
  const artist = getArtist(slug);
  if (!artist) notFound();
  const works = worksByArtist(artist.slug);

  return (
    <article>
      <header className={styles.head}>
        <h1>{artist.name}</h1>
        <p className="subhead">{artist.origin} · b. {artist.born}</p>
      </header>
      <p className={styles.bio}>{artist.bio}</p>
      <p className={`meta ${styles.detailMeta}`}>
        {works.length} {works.length === 1 ? "work" : "works"}
      </p>
      <WorkGrid works={works} />
    </article>
  );
}
