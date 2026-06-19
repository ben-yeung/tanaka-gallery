import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Underline, Highlight } from "../marks";

describe("about marks", () => {
  it("Underline renders its clause text", () => {
    render(<Underline>Ren Tanaka left Osaka at nineteen</Underline>);
    expect(screen.getByText("Ren Tanaka left Osaka at nineteen")).toBeInTheDocument();
  });

  it("Highlight renders its phrase text", () => {
    render(<Highlight index={0}>Japanese artists</Highlight>);
    expect(screen.getByText("Japanese artists")).toBeInTheDocument();
  });
});
