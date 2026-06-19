const KEY = "tg:gallery-return";

export function markGalleryReturn(): void {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // sessionStorage unavailable (SSR / privacy mode) — entrance simply always plays.
  }
}

export function consumeGalleryReturn(): boolean {
  try {
    if (sessionStorage.getItem(KEY)) {
      sessionStorage.removeItem(KEY);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}
