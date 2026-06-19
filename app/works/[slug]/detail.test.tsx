import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import WorkDetail from "./page";

// notFound throws a Next control-flow error; assert it is hit for a bad slug.
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

describe("WorkDetail", () => {
  it("renders a known work", async () => {
    const ui = await WorkDetail({ params: Promise.resolve({ slug: "untitled-vessel" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Untitled (Vessel)" })).toBeInTheDocument();
  });
  it("calls notFound for an unknown slug", async () => {
    await expect(
      WorkDetail({ params: Promise.resolve({ slug: "nope" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
