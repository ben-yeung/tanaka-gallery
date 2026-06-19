"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { EASE_OUT } from "@/components/motion/splash/timing";
import styles from "./WabiSabiToggle.module.css";

const WABI = "wabi-sabi."; // 10 chars, indices 0–9

// Light mode: cursor deepens toward richer ink-green.
// Dark mode:  cursor lightens toward pale surface glow.
const ACCENT = {
  light: { base: [124, 138, 107] as const, cursor: [70, 82, 54] as const },
  dark:  { base: [140, 155, 122] as const, cursor: [210, 230, 192] as const },
};

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

export type WabiSabiToggleProps = {
  children: React.ReactNode;
  onShowChange?: (show: boolean) => void;
};

export function WabiSabiToggle({ children, onShowChange }: WabiSabiToggleProps) {
  const reduce = !!useReducedMotion();
  const [show, setShow] = useState(false);
  const latinRef = useRef<HTMLSpanElement>(null);
  const lastPtrRef = useRef<string>("mouse");

  const setShowAndNotify = useCallback(
    (next: boolean) => {
      setShow(next);
      onShowChange?.(next);
    },
    [onShowChange],
  );

  const applyGradient = useCallback((clientX: number) => {
    const el = latinRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = clientX - rect.left;
    const radius = rect.width * 0.38;
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark" ||
      (!document.documentElement.hasAttribute("data-theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    const { base, cursor } = isDark ? ACCENT.dark : ACCENT.light;
    el.querySelectorAll<HTMLSpanElement>("[data-wabi-letter]").forEach((letter) => {
      const lr = letter.getBoundingClientRect();
      const lx = lr.left + lr.width / 2 - rect.left;
      const t = Math.max(0, 1 - Math.abs(mx - lx) / radius);
      letter.style.color = `rgb(${lerp(base[0], cursor[0], t)},${lerp(base[1], cursor[1], t)},${lerp(base[2], cursor[2], t)})`;
    });
  }, []);

  const clearGradient = useCallback(() => {
    latinRef.current
      ?.querySelectorAll<HTMLSpanElement>("[data-wabi-letter]")
      .forEach((l) => { l.style.color = ""; });
  }, []);

  // Animation targets — reduced motion drops filter entirely.
  const kanjiVisible = reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" };
  const kanjiHidden  = reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(6px)" };
  const lettrVisible = reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" };
  const lettrHidden  = reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(10px)" };

  return (
    <span
      className={styles.wabiToggle}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setShowAndNotify(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") {
          setShowAndNotify(false);
          clearGradient();
        }
      }}
      onMouseMove={(e) => { if (show) applyGradient(e.clientX); }}
      onPointerDown={(e) => { lastPtrRef.current = e.pointerType; }}
      onClick={() => {
        if (lastPtrRef.current !== "mouse") {
          const next = !show;
          setShowAndNotify(next);
          if (!next) clearGradient();
        }
      }}
    >
      {/* Kanji: exits immediately on show, returns after wabi-sabi. fully exits (0.38s delay) */}
      <motion.span
        style={{ gridArea: "1/1" }}
        animate={show ? kanjiHidden : kanjiVisible}
        transition={
          reduce
            ? { duration: 0.15 }
            : show
              ? { duration: 0.22, ease: EASE_OUT }
              : { duration: 0.28, ease: EASE_OUT, delay: 0.38 }
        }
      >
        {children}
      </motion.span>

      {/* wabi-sabi. letters: left→right blur-in on show, right→left on hide */}
      <span ref={latinRef} className={styles.latinLayer} style={{ gridArea: "1/1" }} aria-hidden="true">
        {Array.from(WABI).map((ch, i) => (
          <motion.span
            key={i}
            data-wabi-letter=""
            initial={lettrHidden}
            animate={show ? lettrVisible : lettrHidden}
            transition={
              reduce
                ? { duration: 0.15 }
                : show
                  ? { duration: 0.28, ease: EASE_OUT, delay: 0.04 + i * 0.038 }
                  : { duration: 0.18, ease: EASE_OUT, delay: (9 - i) * 0.022 }
            }
            style={{ display: "inline-block" }}
          >
            {ch}
          </motion.span>
        ))}
      </span>
    </span>
  );
}
