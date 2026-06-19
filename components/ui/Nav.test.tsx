import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Nav } from "./Nav";

describe("Nav", () => {
  it("links to Works and Artists and shows the wordmark", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: /works/i })).toHaveAttribute("href", "/works");
    expect(screen.getByRole("link", { name: /artists/i })).toHaveAttribute("href", "/artists");
    expect(screen.getByText(/Tanaka/)).toBeInTheDocument();
  });
});
