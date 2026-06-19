import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Caption } from "./Caption";
import { getWork } from "@/data/works";

describe("Caption", () => {
  it("renders Title · Artist · Year", () => {
    render(<Caption work={getWork("untitled-vessel")!} />);
    expect(screen.getByText("Untitled (Vessel) · Saburo Ohta · 2019")).toBeInTheDocument();
  });
});
