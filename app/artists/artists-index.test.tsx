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

  it("renders all three haiku lines", () => {
    render(<ArtistsPage />);
    expect(screen.getByText("From the kiln, from rain")).toBeInTheDocument();
    expect(screen.getByText("Each mark made before it fades")).toBeInTheDocument();
    expect(screen.getByText("Ten voices remain.")).toBeInTheDocument();
  });

  it("renders the Japanese name for each artist", () => {
    render(<ArtistsPage />);
    for (const a of allArtists()) {
      expect(screen.getByText(a.nameJa)).toBeInTheDocument();
    }
  });
});
