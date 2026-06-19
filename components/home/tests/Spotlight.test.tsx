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

  it("links a visible work to its detail page", () => {
    render(<Spotlight items={items} shuffle={identity} />);
    // jsdom has no ResizeObserver, so the window stays at 1 card: the first work.
    expect(screen.getByRole("link")).toHaveAttribute("href", "/works/a");
  });

  it("advances the window by one work after the interval", () => {
    vi.useFakeTimers();
    render(<Spotlight items={items} shuffle={identity} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText("Beta")).toBeInTheDocument();
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

  it("does not auto-advance while the tab is hidden", () => {
    // Backgrounded tabs pause framer-motion's rAF-driven exit animations, so if the
    // interval keeps firing the un-exited cards pile up. Advancing must pause while hidden.
    vi.useFakeTimers();
    const visibility = { value: "visible" as DocumentVisibilityState };
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => visibility.value,
    });
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => visibility.value === "hidden",
    });
    try {
      render(<Spotlight items={items} shuffle={identity} />);
      visibility.value = "hidden";
      act(() => { document.dispatchEvent(new Event("visibilitychange")); });
      act(() => { vi.advanceTimersByTime(5000); });
      // No advance happened while hidden: the second work never entered the window.
      expect(screen.queryByText("Beta")).toBeNull();
    } finally {
      delete (document as unknown as { visibilityState?: unknown }).visibilityState;
      delete (document as unknown as { hidden?: unknown }).hidden;
    }
  });

  it("does not auto-advance under reduced motion", () => {
    mockReducedMotion(true);
    vi.useFakeTimers();
    render(<Spotlight items={items} shuffle={identity} />);
    act(() => { vi.advanceTimersByTime(5000); });
    // Window does not advance; the first work stays put.
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/works/a.svg");
  });
});
