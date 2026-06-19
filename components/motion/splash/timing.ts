// Single source of truth for the splash choreography. All values in SECONDS
// unless the name ends in _MS. Tunable at the manual checkpoint — see
// TODO(splash-timing) in docs/superpowers/specs/2026-06-19-page-splash-intro-design.md §6.
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Navbar beats (lead).
export const LOGO_DRAW_DUR = 0.7;
export const WORDMARK_DELAY = 0.35;
export const WORDMARK_DUR = 0.6;
export const LINK_DELAY = 0.65;
export const LINK_STAGGER = 0.08;

// Page content beats.
export const CONTENT_START = 0.9; // first content beat begins, overlapping the navbar tail
export const ITEM_DUR = 0.8;
export const ITEM_STAGGER = 0.22; // hero meaning-order cadence
export const ROW_STAGGER = 0.1; // artists list cadence
export const RISE_Y = 28; // px — text rise (calmer than the grid's 80px tiles)
export const BLUR = 8; // px — soft blur
export const FURIGANA_DELAY = 0.2; // furigana settles this long after its kanji

// Reduced motion (opacity-only).
export const REDUCED_DUR = 0.45;
export const REDUCED_STAGGER = 0.06;

// /works handoff.
export const SORTBAR_DELAY = 1.2; // sort bar fades in just under the header beat
export const SNAKE_LEAD_MS = 1100; // header leads before the grid snake begins (ms; snake uses WAAPI)

// The i-th content beat (Art. = 0, JP = 1, SF = 2, subline = 3, section = 4, ...).
export const beat = (i: number): number => CONTENT_START + i * ITEM_STAGGER;

// The i-th list row (artists), beginning a beat after the header.
export const rowDelay = (i: number): number => CONTENT_START + 0.3 + i * ROW_STAGGER;
