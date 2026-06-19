import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GallerySortBar } from "./GallerySortBar";

describe("GallerySortBar", () => {
  it("cycles Artist off → asc on first click", () => {
    const onChange = vi.fn();
    render(<GallerySortBar state={{ dim: false }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /artist/i }));
    expect(onChange).toHaveBeenCalledWith({ dim: false, artist: "asc" });
  });
  it("cycles Year to desc (newest first) on first click", () => {
    const onChange = vi.fn();
    render(<GallerySortBar state={{ dim: false }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /year/i }));
    expect(onChange).toHaveBeenCalledWith({ dim: false, year: "desc" });
  });
  it("turns an active (desc) artist key off on the third state", () => {
    const onChange = vi.fn();
    render(<GallerySortBar state={{ dim: false, artist: "desc" }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /artist/i }));
    expect(onChange).toHaveBeenCalledWith({ dim: false, artist: undefined });
  });
  it("toggles the availability dim pill", () => {
    const onChange = vi.fn();
    render(<GallerySortBar state={{ dim: false }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /available only/i }));
    expect(onChange).toHaveBeenCalledWith({ dim: true });
  });
  it("marks an active key with aria-pressed", () => {
    render(<GallerySortBar state={{ dim: false, year: "desc" }} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /year/i })).toHaveAttribute("aria-pressed", "true");
  });
});
