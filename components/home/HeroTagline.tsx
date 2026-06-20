// components/home/HeroTagline.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { WabiSabiToggle } from "./WabiSabiToggle";
import { beat, EASE_OUT } from "@/components/motion/splash/timing";
import { useIsMobile } from "@/hooks/useIsMobile";
import styles from "@/app/home.module.css";

export function HeroTagline() {
  const [show, setShow] = useState(false);
  const isMobile = useIsMobile(768);
  const jpBeat = beat(1);

  return (
    <h1 className={styles.tagline}>
      <SplashItem as="span" variant="inline" delay={beat(0)}>
        Art.{" "}
      </SplashItem>
      <SplashItem as="span" variant="inline" delay={jpBeat} className={styles.jp}>
        <WabiSabiToggle onShowChange={setShow}>
          <span className={styles.ruby}>
            侘
            <SplashItem as="span" variant="furigana" delay={jpBeat} className={styles.rt}>
              わ
            </SplashItem>
          </span>
          び
          <span className={styles.ruby}>
            寂
            <SplashItem as="span" variant="furigana" delay={jpBeat} className={styles.rt}>
              さ
            </SplashItem>
          </span>
          び<span className={styles.maru}>。</span>
        </WabiSabiToggle>
      </SplashItem>
      {/*
        Outer motion.span drives the SF slide; inner SplashItem handles the splash entrance.
        On mobile (≤768px) it becomes block so "San Francisco." sits on its own line, and
        the slide-right is disabled since there's no inline context to shift into.
      */}
      <motion.span
        style={{ display: isMobile ? "block" : "inline-block" }}
        animate={{ x: isMobile ? 0 : show ? "0.18em" : 0 }}
        transition={
          show
            ? { duration: 0.48, ease: EASE_OUT, delay: 0.04 }
            : { duration: 0.38, ease: EASE_OUT }
        }
      >
        <SplashItem as="span" variant="inline" delay={beat(2)} className={styles.sf}>
          San Francisco.
        </SplashItem>
      </motion.span>
    </h1>
  );
}
