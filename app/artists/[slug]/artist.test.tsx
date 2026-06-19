import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ArtistDetail from "./page";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

describe("ArtistDetail", () => {
  it("renders a known artist with their work count", async () => {
    const ui = await ArtistDetail({ params: Promise.resolve({ slug: "saburo-ohta" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Saburo Ohta" })).toBeInTheDocument();
    expect(screen.getByText("2 works")).toBeInTheDocument();
  });
  it("calls notFound for an unknown artist", async () => {
    await expect(
      ArtistDetail({ params: Promise.resolve({ slug: "ghost" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
