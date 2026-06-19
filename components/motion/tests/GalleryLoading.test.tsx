import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GalleryLoading } from "../GalleryLoading";
import styles from "../styles/grid.module.css";

describe("GalleryLoading", () => {
  it("preloads the sort/filter bar", () => {
    render(<GalleryLoading />);
    expect(screen.getByRole("button", { name: /artist/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /year/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /available only/i })).toBeInTheDocument();
  });

  it("shows the sort keys in their default (inactive) state", () => {
    render(<GalleryLoading />);
    expect(screen.getByRole("button", { name: /artist/i })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: /year/i })).toHaveAttribute("aria-pressed", "false");
  });

  it("renders the grid-area skeleton", () => {
    const { container } = render(<GalleryLoading />);
    expect(container.querySelector(`ul[aria-hidden="true"].${styles.grid}`)).not.toBeNull();
  });
});
