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

  it("links About to the home anchor", () => {
    render(<Nav />);
    const about = screen.getByRole("link", { name: /about/i });
    expect(about).toHaveAttribute("href", "/#about");
  });

  it("orders the section links Works, About, Artists", () => {
    render(<Nav />);
    const labels = screen
      .getAllByRole("link")
      .map((a) => a.textContent?.trim())
      .filter((t): t is string => ["Works", "About", "Artists"].includes(t ?? ""));
    expect(labels).toEqual(["Works", "About", "Artists"]);
  });
});
