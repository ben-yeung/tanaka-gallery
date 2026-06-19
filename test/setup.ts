import "@testing-library/jest-dom/vitest";

// jsdom's PointerEvent does not carry pointerType on the event object, so
// fireEvent.pointerEnter(el, { pointerType: "mouse" }) loses that property.
// Replace it with a minimal subclass that stores pointerType from the init dict.
// This lets WabiSabiToggle (and any future pointer-type-aware component) distinguish
// mouse vs. touch in tests without changing production code.
// Guard: only runs in jsdom (browser-like) environments; node env tests (e.g. theme.test.ts)
// don't have MouseEvent so we skip this polyfill there.
if (typeof MouseEvent !== "undefined" &&
    (typeof globalThis.PointerEvent === "undefined" ||
     new globalThis.PointerEvent("pointerenter", { pointerType: "mouse" }).pointerType === undefined)) {
  class PointerEventPolyfill extends MouseEvent {
    readonly pointerType: string;
    readonly pointerId: number;
    readonly width: number;
    readonly height: number;
    readonly pressure: number;
    readonly tiltX: number;
    readonly tiltY: number;
    readonly isPrimary: boolean;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerType = init.pointerType ?? "";
      this.pointerId = init.pointerId ?? 0;
      this.width = init.width ?? 1;
      this.height = init.height ?? 1;
      this.pressure = init.pressure ?? 0;
      this.tiltX = init.tiltX ?? 0;
      this.tiltY = init.tiltY ?? 0;
      this.isPrimary = init.isPrimary ?? false;
    }
  }
  // @ts-expect-error — replacing jsdom's broken PointerEvent with a polyfill that carries pointerType.
  globalThis.PointerEvent = PointerEventPolyfill;
}

// jsdom has no IntersectionObserver, which framer-motion's `useInView` / `whileInView`
// (used by AboutReveal and the splash) instantiates on mount. Stub it so components that
// observe the viewport render without throwing; the callback is never fired in tests.
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
