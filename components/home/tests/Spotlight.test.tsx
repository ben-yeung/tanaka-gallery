import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react";
import { Spotlight, type SpotlightItem } from "../Spotlight";

// Identity permutation: makes the post-mount shuffle a no-op so order is deterministic.
const identity = (n: number) => Array.from({ length: n }, (_, i) => i);

const items: SpotlightItem[] = [
  { slug: "a", title: "Alpha", image: "/works/a.svg", meta: "ink · 2020 · 1 in", artistName: "Mika Narita", artistBio: "Lines." },
  { slug: "b", title: "Beta", image: "/works/b.svg", meta: "glass · 2023 · 2 in", artistName: "Iris Lund", artistBio: "Cooled fast." },
];

// framer-motion's useReducedMotion reads window.matchMedia; jsdom has none by default
// (treated as "no reduction"). This installs a mock that reports reduced motion ON.
function mockReducedMotion(on: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: on && query.includes("reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

afterEach(() => {
  vi.useRealTimers();
  // Reset matchMedia back to "undefined" (jsdom default) between tests.
  (window as unknown as { matchMedia?: unknown }).matchMedia = undefined;
});

describe("Spotlight", () => {
  it("renders nothing when there are no items", () => {
    const { container } = render(<Spotlight items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the active work's title and artist in one label", () => {
    render(<Spotlight items={items} shuffle={identity} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Mika Narita")).toBeInTheDocument();
  });

  it("shows a zero-padded counter", () => {
    render(<Spotlight items={items} shuffle={identity} />);
    expect(screen.getByText("01 / 02")).toBeInTheDocument();
  });

  it("links the active work to its detail page", () => {
    render(<Spotlight items={items} shuffle={identity} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/works/a");
  });

  it("auto-advances to the next work after the interval", () => {
    vi.useFakeTimers();
    render(<Spotlight items={items} shuffle={identity} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("02 / 02")).toBeInTheDocument();
  });

  it("pauses auto-advance while the pointer is over it", () => {
    vi.useFakeTimers();
    const { container } = render(<Spotlight items={items} shuffle={identity} />);
    const region = container.firstChild as Element;
    fireEvent.pointerEnter(region);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText("Alpha")).toBeInTheDocument(); // unchanged while hovered
    fireEvent.pointerLeave(region);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("does not auto-advance under reduced motion", () => {
    mockReducedMotion(true);
    vi.useFakeTimers();
    render(<Spotlight items={items} shuffle={identity} />);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    // Under reduced motion the static <img> branch renders (no AnimatePresence cross-fade).
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/works/a.svg");
  });
});
