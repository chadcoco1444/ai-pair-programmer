import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderArray } from "@/lib/input-visualizer/renderers/array";

describe("renderArray", () => {
  it("renders an svg with correct number of cells for the values", () => {
    const { container } = render(renderArray([2, 7, 11, 15]));
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBe(4);
  });

  it("displays each value as text", () => {
    const { container } = render(renderArray([2, 7, 11, 15]));
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("2");
    expect(texts).toContain("7");
    expect(texts).toContain("11");
    expect(texts).toContain("15");
  });

  it("displays index labels below each cell", () => {
    const { container } = render(renderArray([5, 10]));
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("[0]");
    expect(texts).toContain("[1]");
  });

  it("renders empty svg for empty array", () => {
    const { container } = render(renderArray([]));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("rect").length).toBe(0);
  });
});
