"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MorphImage } from "./MorphImage";
import styles from "@/app/works/[slug]/detail.module.css";

export function LightboxStage({ slug, src, alt }: { slug: string; src: string; alt: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Move focus into lightbox on open, restore on close
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    } else {
      stageRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <>
      <div
        ref={stageRef}
        className={styles.stage}
        onClick={() => setIsOpen(true)}
        tabIndex={-1}
      >
        <MorphImage slug={slug} src={src} alt={alt} />
        <span className={styles.expandIcon} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M8.5 2H12v3.5M5.5 12H2V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-modal={true}
            aria-label="Artwork lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              background: "rgba(0, 0, 0, 0.82)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              ref={closeButtonRef}
              aria-label="Close lightbox"
              onClick={() => setIsOpen(false)}
              style={{
                position: "absolute",
                top: 20,
                right: 24,
                background: "none",
                border: "none",
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: 24,
                cursor: "pointer",
                padding: 4,
                lineHeight: 1,
              }}
            >
              {String.fromCharCode(10005)}
            </button>

            <motion.img
              src={src}
              alt={alt}
              initial={{ scale: reduce ? 1 : 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: reduce ? 1 : 0.96, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "calc(100vw - 80px)",
                maxHeight: "calc(100vh - 80px)",
                objectFit: "contain",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
