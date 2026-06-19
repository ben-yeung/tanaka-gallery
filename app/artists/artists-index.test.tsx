import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ArtistsPage from "./page";
import { allArtists } from "@/data/artists";

describe("Artists index", () => {
  it("renders the heading and one link per artist", () => {
    render(<ArtistsPage />);
    expect(screen.getByRole("heading", { level: 1, name: /artists/i })).toBeInTheDocument();
    const first = allArtists()[0];
    expect(screen.getByRole("link", { name: new RegExp(first.name) })).toHaveAttribute(
      "href",
      `/artists/${first.slug}`,
    );
  });
});
