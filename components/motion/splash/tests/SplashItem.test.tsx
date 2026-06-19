import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

describe("SplashItem", () => {
  beforeEach(() => vi.resetModules());

  it("renders its children in the chosen element", async () => {
    const { SplashItem } = await import("../SplashItem");
    render(<SplashItem as="p">Made in Japan.</SplashItem>);
    expect(screen.getByText("Made in Japan.")).toBeInTheDocument();
  });

  it("renders at rest (no hidden initial) when it is NOT a fresh load", async () => {
    vi.doMock("../splashGate", () => ({ isFreshLoad: () => false, endFreshLoad: () => {} }));
    const { SplashItem } = await import("../SplashItem");
    render(
      <SplashItem as="div" className="beat">
        rest
      </SplashItem>,
    );
    const el = screen.getByText("rest");
    // At rest, framer must not have applied the hidden opacity:0 initial style.
    expect(el.style.opacity).not.toBe("0");
  });

  it("mounts hidden (opacity 0) when it IS a fresh load", async () => {
    vi.doMock("../splashGate", () => ({ isFreshLoad: () => true, endFreshLoad: () => {} }));
    const { SplashItem } = await import("../SplashItem");
    render(
      <SplashItem as="div" className="beat">
        play
      </SplashItem>,
    );
    expect(screen.getByText("play").style.opacity).toBe("0");
  });
});
