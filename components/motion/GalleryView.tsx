"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Work } from "@/data/types";
import { getArtist } from "@/data/artists";
import { getSandboxSold } from "@/lib/sandboxSold";
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

  const [soldSlugs, setSoldSlugs] = useState<string[]>([]);
  useEffect(() => { setSoldSlugs(getSandboxSold()); }, []);

  const merged = soldSlugs.length > 0
    ? works.map((w) => soldSlugs.includes(w.slug) ? { ...w, available: false } : w)
    : works;
  const sorted = sortWorks(merged, state, artistNameOf);

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
