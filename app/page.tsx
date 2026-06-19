import Link from "next/link";
import { allWorks } from "@/data/works";
import { getArtist } from "@/data/artists";
import { Spotlight, type SpotlightItem } from "@/components/home/Spotlight";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { Typewriter } from "@/components/motion/splash/Typewriter";
import { AboutReveal, AboutRevealItem } from "@/components/motion/about/AboutReveal";
import { Underline, Highlight } from "@/components/motion/about/marks";
import {
  beat,
  ITEM_STAGGER,
  typewriterEnd,
  ABOUT_LABEL_DELAY,
  ABOUT_LEAD_DELAY,
  ABOUT_COL_DELAY,
} from "@/components/motion/splash/timing";
import styles from "./home.module.css";

const SUBHEAD = ["Made in Japan.", "Curated in SF."];

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
      {/* About sits below the fold: a single useInView trigger (latched once) reveals
          the splash blocks on scroll-into-view, then the underline and highlights draw
          in as a slower emphasis pass. Timing: spec §Choreography. */}
      <AboutReveal id="about" className={styles.about}>
        <AboutRevealItem as="h2" delay={ABOUT_LABEL_DELAY} className={styles.aboutLabel}>
          About
        </AboutRevealItem>
        <AboutRevealItem as="p" delay={ABOUT_LEAD_DELAY} className={styles.aboutLead}>
          <Underline>Ren Tanaka left Osaka at nineteen</Underline> with a duffel bag and
          an admission letter from SFAI he wasn&apos;t sure he deserved.
        </AboutRevealItem>
        <div className={styles.aboutGrid}>
          <AboutRevealItem as="p" delay={ABOUT_COL_DELAY[0]} className={styles.aboutCol}>
            He spent his twenties absorbing San Francisco: the Japantown shops, the
            Mission murals, and the quiet rigor of{" "}
            <Highlight index={0}>Japanese artists</Highlight> he discovered in back rooms
            of galleries that no longer exist.
          </AboutRevealItem>
          <AboutRevealItem as="p" delay={ABOUT_COL_DELAY[1]} className={styles.aboutCol}>
            He started buying work before he could afford to,{" "}
            <Highlight index={1}>falling in love</Highlight> with pieces by obscure
            artists trying to make a living &mdash; artists who had reached the same
            conclusion: that less, done carefully, is more.
          </AboutRevealItem>
          <AboutRevealItem as="p" delay={ABOUT_COL_DELAY[2]} className={styles.aboutCol}>
            Tanaka&apos;s Gallery debuted in 2001 in a small San Francisco storefront
            that still smelled like the <Highlight index={2}>flower shop</Highlight> it
            once was.
          </AboutRevealItem>
        </div>
      </AboutReveal>
    </>
  );
}
