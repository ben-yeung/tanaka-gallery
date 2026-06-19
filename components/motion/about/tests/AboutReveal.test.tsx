import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AboutReveal, AboutRevealItem } from "../AboutReveal";

describe("AboutReveal", () => {
  it("renders the section with its id and a heading child", () => {
    render(
      <AboutReveal id="about" className="about">
        <AboutRevealItem as="h2">About</AboutRevealItem>
      </AboutReveal>,
    );
    expect(screen.getByRole("heading", { name: /^about$/i })).toBeInTheDocument();
  });

  it("renders a reveal item's children in the chosen element", () => {
    render(
      <AboutRevealItem as="p" className="lead">
        Lead copy
      </AboutRevealItem>,
    );
    const el = screen.getByText("Lead copy");
    expect(el.tagName).toBe("P");
  });
});
