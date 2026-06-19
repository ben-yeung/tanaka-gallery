// Module singleton (same shape as morphStore.ts / entranceFlag.ts): true only
// during the initial document load's first paint. The module is re-evaluated on
// every full document load / hard refresh (so the flag resets to true), and
// persists across client-side <Link> navigation (so it stays false). Client
// navigations always happen well after first paint, so their renders read false.
let fresh = true;

export function isFreshLoad(): boolean {
  return fresh;
}

export function endFreshLoad(): void {
  fresh = false;
}

// Close the fresh-load window once the initial paint has happened. Guarded so it
// no-ops under SSR and in jsdom (which lacks rAF), where the flag simply stays
// true for the synchronous render — harmless for tests.
if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
  window.requestAnimationFrame(() => window.requestAnimationFrame(endFreshLoad));
}
