"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Work } from "@/data/types";
import { getArtist } from "@/data/artists";
import {
  parseGalleryParams,
  serializeGalleryParams,
  sortWorks,
  type SortState,
} from "@/lib/gallery";
import { GallerySortBar } from "./GallerySortBar";
import { WorkGrid } from "./WorkGrid";

const artistNameOf = (slug: string) => getArtist(slug)?.name ?? "";

export function GalleryView({ works }: { works: Work[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const state = parseGalleryParams(useSearchParams());
  const sorted = sortWorks(works, state, artistNameOf);

  const onChange = useCallback(
    (next: SortState) => {
      const qs = serializeGalleryParams(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  return (
    <>
      <GallerySortBar state={state} onChange={onChange} />
      <WorkGrid works={sorted} dim={state.dim} />
    </>
  );
}
