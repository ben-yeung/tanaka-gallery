"use client";

import { nextSortDir, type SortKey, type SortState } from "@/lib/gallery";
import styles from "./sortbar.module.css";

const ARROW = { asc: "↑", desc: "↓" } as const;

export function GallerySortBar({
  state,
  onChange,
}: {
  state: SortState;
  onChange: (next: SortState) => void;
}) {
  const toggleKey = (key: SortKey) =>
    onChange({ ...state, [key]: nextSortDir(key, state[key]) });

  return (
    <div className={styles.bar}>
      <span className={styles.label}>Sort</span>

      <button
        type="button"
        className={`${styles.key} ${state.artist ? styles.on : ""}`}
        aria-pressed={!!state.artist}
        onClick={() => toggleKey("artist")}
      >
        Artist {state.artist && <span className={styles.arrow}>{ARROW[state.artist]}</span>}
      </button>

      <button
        type="button"
        className={`${styles.key} ${state.year ? styles.on : ""}`}
        aria-pressed={!!state.year}
        onClick={() => toggleKey("year")}
      >
        Year {state.year && <span className={styles.arrow}>{ARROW[state.year]}</span>}
      </button>

      <button
        type="button"
        className={`${styles.pill} ${state.dim ? styles.pillOn : ""}`}
        aria-pressed={state.dim}
        onClick={() => onChange({ ...state, dim: !state.dim })}
      >
        Available only
      </button>
    </div>
  );
}
