"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { endFreshLoad } from "@/components/motion/splash/splashGate";
import { WORDMARK_DELAY, LINK_DELAY, LINK_STAGGER } from "@/components/motion/splash/timing";
import styles from "./ui.module.css";

const NAV_LINKS = [
  { href: "/works", label: "Works" },
  { href: "/#about", label: "About" },
  { href: "/artists", label: "Artists" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    endFreshLoad();
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <>
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
            <Link href="/#about" className={styles.navLink}>
              About
            </Link>
          </SplashItem>
          <SplashItem as="span" variant="inline" delay={LINK_DELAY + LINK_STAGGER * 2}>
            <Link href="/artists" className={styles.navLink}>
              Artists
            </Link>
          </SplashItem>
        </div>
        <button
          className={styles.hamburger}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        >
          <span className={`${styles.hamburgerLine} ${open ? styles.hamburgerLineTopOpen : ""}`} />
          <span className={`${styles.hamburgerLine} ${open ? styles.hamburgerLineMidOpen : ""}`} />
          <span className={`${styles.hamburgerLine} ${open ? styles.hamburgerLineBotOpen : ""}`} />
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.mobileLink}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
