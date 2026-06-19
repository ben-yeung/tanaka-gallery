import Link from "next/link";
import { allWorks } from "@/data/works";
import { getArtist } from "@/data/artists";
import { Spotlight, type SpotlightItem } from "@/components/home/Spotlight";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { beat } from "@/components/motion/splash/timing";
import styles from "./home.module.css";

export default function Home() {
  const works = allWorks();
  const count = works.length;
  const jpBeat = beat(1);
  const items: SpotlightItem[] = works.map((w) => {
    const artist = getArtist(w.artistSlug);
    return {
      slug: w.slug,
      title: w.title,
      image: w.image,
      meta: `${w.medium} · ${w.year} · ${w.dimensions}`,
      artistName: artist?.name ?? "Unknown",
      artistBio: artist?.bio ?? "",
    };
  });

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
                delay={jpBeat}
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
                delay={jpBeat}
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
        <div className={styles.indexText}>
          <p className={styles.note}>
            <span className={styles.noteHead}>Tanaka&apos;s favorites.</span>
            <span className={styles.noteSub}>
              Timeless artists, from Tokyo to the Bay.
            </span>
          </p>
          <Link href="/works" className={styles.indexLink}>
            View ({count}) Selected Works →
          </Link>
        </div>
        <Spotlight items={items} />
      </SplashItem>
      <section id="about" className={styles.about}>
        <h2 className={styles.aboutHead}>About</h2>
        <p className={styles.aboutLead}>
          Ren Tanaka left Osaka at nineteen with a duffel bag and an admission
          letter from SFAI he wasn&apos;t sure he deserved.
        </p>
        <p className={styles.aboutBody}>
          He spent his twenties absorbing San Francisco: the Japantown shops,
          the Mission murals, and the quiet rigor of Japanese artists he
          discovered in the back rooms of galleries that no longer exist.
        </p>
        <p className={styles.aboutBody}>
          He started buying work before he could afford to, falling in love with
          pieces by obscure artists trying to make a living.
        </p>
        <p className={styles.aboutBody}>
          Tanaka&apos;s Gallery debuted in 2001 in a small San Francisco
          storefront that still smelled like the flower shop it once was.
        </p>
        <p className={styles.aboutBody}>
          Tanaka&apos;s curation brought together artists who reached the same
          conclusion from different directions: that less, done carefully, is
          enough.
        </p>
      </section>
    </>
  );
}
