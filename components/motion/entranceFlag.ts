const KEY = "tg:gallery-return";

export function markGalleryReturn(path: string): void {
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    // sessionStorage unavailable (SSR / privacy mode) — entrance simply always plays.
  }
}

export function consumeGalleryReturn(path: string): boolean {
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored !== null) {
      sessionStorage.removeItem(KEY); // read-once: always clear
      return stored === path;
    }
  } catch {
    // sessionStorage unavailable — treat as unset, entrance plays.
  }
  return false;
}
