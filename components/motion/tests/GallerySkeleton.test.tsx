import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GallerySkeleton } from "../GallerySkeleton";
import styles from "../styles/grid.module.css";

describe("GallerySkeleton", () => {
  it("renders a default set of skeleton frames", () => {
    const { container } = render(<GallerySkeleton />);
    expect(container.querySelectorAll(`.${styles.skel}`).length).toBeGreaterThan(1);
  });

  it("renders exactly `count` skeleton frames", () => {
    const { container } = render(<GallerySkeleton count={5} />);
    expect(container.querySelectorAll(`.${styles.skel}`)).toHaveLength(5);
  });

  it("hides the decorative skeleton from assistive tech", () => {
    const { container } = render(<GallerySkeleton count={3} />);
    expect(container.querySelector('ul[aria-hidden="true"]')).not.toBeNull();
  });

  it("reuses the shared grid layout class", () => {
    const { container } = render(<GallerySkeleton count={3} />);
    expect(container.querySelector(`ul.${styles.grid}`)).not.toBeNull();
  });
});
