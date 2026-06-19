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

export function ThemeToggle({ className }: { className?: string }) {
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
      className={className ? `${styles.themeToggle} ${className}` : styles.themeToggle}
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title="Toggle color mode"
    >
      <span className={styles.themeToggleIcon} aria-hidden>
        {mode === "dark" ? <MoonIcon /> : mode === "light" ? <SunIcon /> : null}
      </span>
    </button>
  );
}

// Solid sun (filled disc + bold rays) and filled crescent moon: heavier than thin
// outlines so the toggle reads at the nav's small type size. Strokes/fills use
// currentColor, so the mark takes the nav's ink color and the matcha hover.
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em">
      <circle cx="12" cy="12" r="5" fill="currentColor" />
      <path
        d="M12 1.5v2.6M12 19.9v2.6M3.7 3.7l1.9 1.9M18.4 18.4l1.9 1.9M1.5 12h2.6M19.9 12h2.6M3.7 20.3l1.9-1.9M18.4 5.6l1.9-1.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}
