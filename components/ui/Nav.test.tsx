import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Nav } from "./Nav";
import { isFreshLoad } from "@/components/motion/splash/splashGate";

describe("Nav", () => {
  it("ends the fresh-load window on mount (no splash replay on later navigations)", () => {
    // The gate is true on a fresh module (initial document load). Nav's
    // post-hydration mount effect must flip it to false.
    expect(isFreshLoad()).toBe(true);
    render(<Nav />);
    expect(isFreshLoad()).toBe(false);
  });
  it("links to Works and Artists and shows the wordmark", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: /works/i })).toHaveAttribute("href", "/works");
    expect(screen.getByRole("link", { name: /artists/i })).toHaveAttribute("href", "/artists");
    expect(screen.getByText(/Tanaka/)).toBeInTheDocument();
  });
});
