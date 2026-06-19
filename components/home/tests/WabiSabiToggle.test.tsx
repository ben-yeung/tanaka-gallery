import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WabiSabiToggle } from "../WabiSabiToggle";

afterEach(() => {
  (window as unknown as { matchMedia?: unknown }).matchMedia = undefined;
});

describe("WabiSabiToggle", () => {
  it("renders kanji children", () => {
    render(
      <WabiSabiToggle>
        <span data-testid="kanji">侘び寂び</span>
      </WabiSabiToggle>,
    );
    expect(screen.getByTestId("kanji")).toBeInTheDocument();
  });

  it("renders exactly 10 letter spans for 'wabi-sabi.'", () => {
    const { container } = render(<WabiSabiToggle><span /></WabiSabiToggle>);
    expect(container.querySelectorAll("[data-wabi-letter]")).toHaveLength(10);
  });

  it("marks the latin layer aria-hidden", () => {
    const { container } = render(<WabiSabiToggle><span /></WabiSabiToggle>);
    // The latin layer wraps all letters; it must carry aria-hidden so screen
    // readers skip the animated spans (kanji provides semantic content).
    const hidden = container.querySelector('[aria-hidden="true"]');
    expect(hidden).toBeInTheDocument();
    expect(hidden!.querySelectorAll("[data-wabi-letter]")).toHaveLength(10);
  });

  it("calls onShowChange(true) on mouse pointerenter", () => {
    const onShowChange = vi.fn();
    const { container } = render(
      <WabiSabiToggle onShowChange={onShowChange}><span /></WabiSabiToggle>,
    );
    const toggle = container.firstChild as Element;
    fireEvent.pointerEnter(toggle, { pointerType: "mouse" });
    expect(onShowChange).toHaveBeenCalledWith(true);
  });

  it("calls onShowChange(false) on mouse pointerleave", () => {
    const onShowChange = vi.fn();
    const { container } = render(
      <WabiSabiToggle onShowChange={onShowChange}><span /></WabiSabiToggle>,
    );
    const toggle = container.firstChild as Element;
    fireEvent.pointerEnter(toggle, { pointerType: "mouse" });
    fireEvent.pointerLeave(toggle, { pointerType: "mouse" });
    expect(onShowChange).toHaveBeenLastCalledWith(false);
  });

  it("does not call onShowChange on touch pointerenter (touch uses click)", () => {
    const onShowChange = vi.fn();
    const { container } = render(
      <WabiSabiToggle onShowChange={onShowChange}><span /></WabiSabiToggle>,
    );
    const toggle = container.firstChild as Element;
    fireEvent.pointerEnter(toggle, { pointerType: "touch" });
    expect(onShowChange).not.toHaveBeenCalled();
  });

  it("toggles show on touch tap (pointerdown then click)", () => {
    const onShowChange = vi.fn();
    const { container } = render(
      <WabiSabiToggle onShowChange={onShowChange}><span /></WabiSabiToggle>,
    );
    const toggle = container.firstChild as Element;
    fireEvent.pointerDown(toggle, { pointerType: "touch" });
    fireEvent.click(toggle);
    expect(onShowChange).toHaveBeenCalledWith(true);
    fireEvent.pointerDown(toggle, { pointerType: "touch" });
    fireEvent.click(toggle);
    expect(onShowChange).toHaveBeenLastCalledWith(false);
  });
});
