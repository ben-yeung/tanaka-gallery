import "@testing-library/jest-dom/vitest";

// jsdom has no IntersectionObserver, which framer-motion's `whileInView` (used by
// ScrollReveal) instantiates on mount. Stub it so components that observe the viewport
// render without throwing; the callback is never fired in tests.
if (typeof globalThis.IntersectionObserver === "undefined") {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  // @ts-expect-error — assigning a minimal stub onto the global for the test env.
  globalThis.IntersectionObserver = IntersectionObserverStub;
}
