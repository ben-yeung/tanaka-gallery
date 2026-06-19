import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Work } from "@/data/types";

const replace = vi.fn();
let search = new URLSearchParams("");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/works",
  useSearchParams: () => search,
}));

import { GalleryView } from "./GalleryView";

const work = (slug: string, artistSlug: string, year: number): Work => ({
  slug, title: slug, artistSlug, year, medium: "", dimensions: "",
  priceCents: 0, image: `/works/${slug}.svg`, available: true,
});

// Both fixtures use "saburo-ohta" which resolves via real data/artists.
const works = [work("old", "saburo-ohta", 2018), work("new", "saburo-ohta", 2023)];

describe("GalleryView", () => {
  beforeEach(() => {
    replace.mockClear();
    search = new URLSearchParams("");
  });

  it("renders works in the order dictated by the URL (year desc → newest first)", () => {
    search = new URLSearchParams("sort=year-desc");
    render(<GalleryView works={works} />);
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/works/new");
    expect(links[1]).toHaveAttribute("href", "/works/old");
  });

  it("writes serialized state to the URL when a key is toggled", () => {
    render(<GalleryView works={works} />);
    fireEvent.click(screen.getByRole("button", { name: /year/i }));
    expect(replace).toHaveBeenCalledWith("/works?sort=year-desc", { scroll: false });
  });

  it("clears the query string when state returns to default", () => {
    search = new URLSearchParams("dim=1");
    render(<GalleryView works={works} />);
    fireEvent.click(screen.getByRole("button", { name: /available only/i }));
    expect(replace).toHaveBeenCalledWith("/works", { scroll: false });
  });
});
