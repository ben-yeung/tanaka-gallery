// Module singleton (same shape as morphStore.ts / entranceFlag.ts): true only
// during the initial document load. The module is re-evaluated on every full
// document load / hard refresh (so the flag resets to true) and persists across
// client-side <Link> navigation (so it stays false after the first flip).
//
// The flag is flipped to false from a POST-HYDRATION effect (see
// components/ui/Nav.tsx) — never on a pre-hydration timer. This is essential for
// SSR: the server always renders with fresh = true (effects never run on the
// server), so the client must also read true while it hydrates that markup,
// otherwise the splash's initial "hidden" styles (and the logo's pathLength) would
// not match and React would throw a hydration mismatch. Flipping only after
// hydration keeps the server and the first client render identical, lets the
// entrance play, and still makes later client navigations read false (no replay).
let fresh = true;

export function isFreshLoad(): boolean {
  return fresh;
}

// Ends the fresh-load window. Called once from a post-hydration mount effect in
// the always-mounted Nav (root layout), so it runs after the initial page has
// hydrated and before any client-side navigation.
export function endFreshLoad(): void {
  fresh = false;
}
