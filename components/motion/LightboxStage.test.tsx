import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LightboxStage } from "./LightboxStage";

vi.mock("./MorphImage", () => ({
  MorphImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

const props = { slug: "mizusashi-ash-fall", src: "/works/01.png", alt: "Ash Fall" };

describe("LightboxStage", () => {
  it("renders the artwork image", () => {
    render(<LightboxStage {...props} />);
    expect(screen.getByRole("img", { name: "Ash Fall" })).toBeInTheDocument();
  });
  it("lightbox is closed by default", () => {
    render(<LightboxStage {...props} />);
    expect(screen.queryByRole("button", { name: "Close lightbox" })).not.toBeInTheDocument();
  });
  it("opens the lightbox when the stage is clicked", () => {
    render(<LightboxStage {...props} />);
    fireEvent.click(screen.getByRole("img", { name: "Ash Fall" }));
    expect(screen.getByRole("button", { name: "Close lightbox" })).toBeInTheDocument();
  });
  it("closes the lightbox when the close button is clicked", () => {
    render(<LightboxStage {...props} />);
    fireEvent.click(screen.getByRole("img", { name: "Ash Fall" }));
    fireEvent.click(screen.getByRole("button", { name: "Close lightbox" }));
    expect(screen.queryByRole("button", { name: "Close lightbox" })).not.toBeInTheDocument();
  });
  it("closes the lightbox when ESC is pressed", () => {
    render(<LightboxStage {...props} />);
    fireEvent.click(screen.getByRole("img", { name: "Ash Fall" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("button", { name: "Close lightbox" })).not.toBeInTheDocument();
  });
  it("does not close when the lightbox image itself is clicked", () => {
    render(<LightboxStage {...props} />);
    fireEvent.click(screen.getByRole("img", { name: "Ash Fall" }));
    const imgs = screen.getAllByRole("img", { name: "Ash Fall" });
    fireEvent.click(imgs[1]);
    expect(screen.getByRole("button", { name: "Close lightbox" })).toBeInTheDocument();
  });
});
