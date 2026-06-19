"use client";

import { DEFAULT_SORT_STATE } from "@/lib/gallery";
import { GallerySortBar } from "./GallerySortBar";
import { GallerySkeleton } from "./GallerySkeleton";

const noop = () => {};

/**
 * Loading chrome for the works gallery: the filter bar (in its default,
 * non-interactive state) sits above a grid-area skeleton, so the title and
 * controls stay in place while only the grid loads. Used as both the in-page
 * Suspense fallback and the route-level loading UI.
 */
export function GalleryLoading() {
  return (
    <>
      <GallerySortBar state={DEFAULT_SORT_STATE} onChange={noop} />
      <GallerySkeleton />
    </>
  );
}
