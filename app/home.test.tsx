import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("shows the tagline", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/Art\..*San Francisco\./);
    // 侘び寂び (wabi-sabi) sits between Art. and San Francisco.
    expect(heading).toHaveTextContent("侘");
    expect(heading).toHaveTextContent("寂");
  });
  it("links to the works index", () => {
    render(<Home />);
    const link = screen.getByRole("link", { name: /selected works/i });
    expect(link).toHaveAttribute("href", "/works");
  });
  it("renders the spotlight counter starting at the first of all works", () => {
    render(<Home />);
    // 12 works in data/works.ts; counter is zero-padded and starts at 01.
    expect(screen.getByText("01 / 12")).toBeInTheDocument();
  });
  it("spotlights a work that links to its detail page", () => {
    render(<Home />);
    const detailLink = screen
      .getAllByRole("link")
      .find((a) => /^\/works\/.+/.test(a.getAttribute("href") ?? ""));
    expect(detailLink).toBeDefined();
  });
});
