import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("renders the nested-squares mark (2 rects, 4 lines) when static", () => {
    const { container } = render(<Logo title="" />);
    expect(container.querySelectorAll("rect")).toHaveLength(2);
    expect(container.querySelectorAll("line")).toHaveLength(4);
  });

  it("keeps the same geometry when animated", () => {
    const { container } = render(<Logo title="" animated />);
    expect(container.querySelectorAll("rect")).toHaveLength(2);
    expect(container.querySelectorAll("line")).toHaveLength(4);
  });

  it("stays accessible-labelled when a title is given", () => {
    const { getByRole } = render(<Logo title="Tanaka's Gallery" animated />);
    expect(getByRole("img", { name: "Tanaka's Gallery" })).toBeInTheDocument();
  });
});
