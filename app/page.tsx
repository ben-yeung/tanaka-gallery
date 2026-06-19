import Link from "next/link";
import { allWorks } from "@/data/works";
import { getArtist } from "@/data/artists";
import { Spotlight, type SpotlightItem } from "@/components/home/Spotlight";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { Typewriter } from "@/components/motion/splash/Typewriter";
import { beat, ITEM_STAGGER, typewriterEnd } from "@/components/motion/splash/timing";
import styles from "./home.module.css";

const SUBHEAD = ["Made in Japan.", "Curated in SF."];

// About narrative (after the lead). Plain strings — apostrophes don't need escaping
// inside JS, only in JSX text.
const ABOUT_BODY = [
  "He spent his twenties absorbing San Francisco: the Japantown shops, the Mission murals, and the quiet rigor of Japanese artists he discovered in the back rooms of galleries that no longer exist.",
  "He started buying work before he could afford to, falling in love with pieces by obscure artists trying to make a living.",
  "Tanaka's Gallery debuted in 2001 in a small San Francisco storefront that still smelled like the flower shop it once was.",
  "Tanaka's curation brought together artists who reached the same conclusion from different directions: that less, done carefully, is enough.",
];

export default function Home() {
  const works = allWorks();
  const count = works.length;
  const jpBeat = beat(1);
  // The works section holds until the second subheader line finishes typing, then
  // reveals in its own short cadence (divider → text → grid).
  const worksBeat = (i: number) => typewriterEnd(SUBHEAD, beat(3)) + i * ITEM_STAGGER;
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
        <Typewriter sentences={SUBHEAD} delay={beat(3)} className={styles.heroSub} />
      </section>
      {/* Divider leads the works reveal so it settles in WITH the section below
          rather than sitting visible from first paint. */}
      <SplashItem
        as="div"
        variant="inline"
        delay={worksBeat(0)}
        className={styles.divider}
        aria-hidden="true"
      />
      <section className={styles.index}>
        <SplashItem as="div" delay={worksBeat(1)} className={styles.indexText}>
          <p className={styles.note}>
            <span className={styles.noteHead}>Tanaka&apos;s favorites.</span>
            <span className={styles.noteSub}>
              Timeless artists, from Tokyo to the Bay.
            </span>
          </p>
          <Link href="/works" className={styles.indexLink}>
            View ({count}) Selected Works →
          </Link>
        </SplashItem>
        <SplashItem as="div" delay={worksBeat(2)} className={styles.spotlightWrap}>
          <Spotlight items={items} />
        </SplashItem>
      </section>
      {/* About continues the page cadence after the works grid, each block rising in
          on its own beat like the rest of the homepage. */}
      <section id="about" className={styles.about}>
        <SplashItem as="h2" delay={worksBeat(3)} className={styles.aboutHead}>
          About
        </SplashItem>
        <SplashItem as="p" delay={worksBeat(4)} className={styles.aboutLead}>
          Ren Tanaka left Osaka at nineteen with a duffel bag and an admission
          letter from SFAI he wasn&apos;t sure he deserved.
        </SplashItem>
        {ABOUT_BODY.map((para, i) => (
          <SplashItem
            key={i}
            as="p"
            delay={worksBeat(5 + i)}
            className={styles.aboutBody}
          >
            {para}
          </SplashItem>
        ))}
      </section>
    </>
  );
}
