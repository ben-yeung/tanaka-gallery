"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { endFreshLoad } from "@/components/motion/splash/splashGate";
import { WORDMARK_DELAY, LINK_DELAY, LINK_STAGGER } from "@/components/motion/splash/timing";
import styles from "./ui.module.css";

export function Nav() {
  // End the fresh-load window after the initial page hydrates, so client-side
  // navigations don't replay the splash. Runs exactly once — Nav lives in the
  // root layout and does not remount on navigation. Doing this in a post-hydration
  // effect (not a pre-hydration timer) is what keeps SSR and the first client
  // render in agreement and prevents the hydration mismatch.
  useEffect(() => {
    endFreshLoad();
  }, []);

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.wordmark}>
        <Logo size={22} title="" className={styles.wordmarkLogo} animated />
        <SplashItem as="span" variant="inline" delay={WORDMARK_DELAY}>
          Tanaka&apos;s Gallery
        </SplashItem>
      </Link>
      <div className={styles.navLinks}>
        <SplashItem as="span" variant="inline" delay={LINK_DELAY}>
          <Link href="/works" className={styles.navLink}>
            Works
          </Link>
        </SplashItem>
        <SplashItem as="span" variant="inline" delay={LINK_DELAY + LINK_STAGGER}>
          <Link href="/artists" className={styles.navLink}>
            Artists
          </Link>
        </SplashItem>
      </div>
    </nav>
  );
}
