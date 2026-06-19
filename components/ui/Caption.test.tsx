import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Caption } from "./Caption";
import { getWork } from "@/data/works";

describe("Caption", () => {
  it("renders Title · Artist · Year", () => {
    render(<Caption work={getWork("mizusashi-ash-fall")!} />);
    expect(screen.getByText("Mizusashi (Ash Fall) · Saburo Ohta · 2019")).toBeInTheDocument();
  });
});
