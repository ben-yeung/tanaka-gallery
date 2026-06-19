import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({ usePathname: () => "/works" }));

import { WorkGrid } from "../WorkGrid";
import type { Work } from "@/data/types";
import styles from "../styles/grid.module.css";

const work = (slug: string, available: boolean): Work => ({
  slug, title: slug, artistSlug: "saburo-ohta", year: 2020, medium: "", dimensions: "",
  priceCents: 0, image: `/works/${slug}.svg`, available,
});

describe("WorkGrid", () => {
  it("renders one link per work to its detail route", () => {
    render(<WorkGrid works={[work("a", true), work("b", true)]} />);
    expect(screen.getByRole("link", { name: /\ba\b/ })).toHaveAttribute("href", "/works/a");
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
  it("appends ' · sold' to unavailable works", () => {
    render(<WorkGrid works={[work("gone", false)]} />);
    expect(screen.getByText(/· sold/)).toBeInTheDocument();
  });
  it("applies the dimmed class to sold works only when dim is on", () => {
    const { rerender, container } = render(<WorkGrid works={[work("gone", false)]} dim={false} />);
    expect(container.querySelector(`.${styles.dimmed}`)).toBeNull();
    rerender(<WorkGrid works={[work("gone", false)]} dim={true} />);
    expect(container.querySelector(`.${styles.dimmed}`)).not.toBeNull();
  });
  it("does not dim available works", () => {
    const { container } = render(<WorkGrid works={[work("here", true)]} dim={true} />);
    expect(container.querySelector(`.${styles.dimmed}`)).toBeNull();
  });
});
