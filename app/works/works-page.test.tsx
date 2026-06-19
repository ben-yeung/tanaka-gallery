import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// GalleryView reads next/navigation hooks; stub them so the RSC page renders in jsdom.
vi.mock("next/navigation", () => ({
  usePathname: () => "/works",
  useRouter: () => ({ replace: () => {} }),
  useSearchParams: () => new URLSearchParams(),
}));

import WorksPage from "./page";

describe("Works page", () => {
  it("renders the Works heading", () => {
    render(<WorksPage />);
    expect(screen.getByRole("heading", { level: 1, name: /works/i })).toBeInTheDocument();
  });
});
