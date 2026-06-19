import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("shows the tagline", () => {
    render(<Home />);
    expect(screen.getByText(/Art\. Objects\. San Francisco\./i)).toBeInTheDocument();
  });
  it("links to the works index", () => {
    render(<Home />);
    const link = screen.getByRole("link", { name: /selected works/i });
    expect(link).toHaveAttribute("href", "/works");
  });
});
