"use client";

import { useEffect, useState } from "react";
import styles from "./ui.module.css";

type Mode = "light" | "dark";

function prefersDark() {
  // Guard matchMedia: it's absent under SSR and in some test environments (jsdom).
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function ThemeToggle() {
  // null until mounted: the active mode depends on localStorage / system
  // preference, neither known during SSR. Rendering an icon before we know the
  // mode would risk a hydration mismatch, so we hold the slot and fill it after.
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    // The pre-paint script in the layout may already have pinned data-theme.
    const current = document.documentElement.dataset.theme as Mode | undefined;
    setMode(current ?? (prefersDark() ? "dark" : "light"));
  }, []);

  function toggle() {
    const active: Mode = mode ?? (prefersDark() ? "dark" : "light");
    const next: Mode = active === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode / storage disabled: the choice just won't persist.
    }
    setMode(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={styles.themeToggle}
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title="Toggle color mode"
    >
      <span className={styles.themeToggleIcon} aria-hidden>
        {mode === "dark" ? <MoonIcon /> : mode === "light" ? <SunIcon /> : null}
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 14.2A8 8 0 0 1 9.8 4 7 7 0 1 0 20 14.2Z" />
    </svg>
  );
}
