import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderTree } from "@/lib/input-visualizer/renderers/tree";

describe("renderTree", () => {
  it("renders circles for each non-null value", () => {
    const { container } = render(renderTree([3, 9, 20, null, null, 15, 7]));
    // 5 non-null = 5 circles
    expect(container.querySelectorAll("circle").length).toBe(5);
  });

  it("displays each non-null value as text", () => {
    const { container } = render(renderTree([1, 2, 3]));
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("1");
    expect(texts).toContain("2");
    expect(texts).toContain("3");
  });

  it("renders empty svg for empty input", () => {
    const { container } = render(renderTree([]));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("circle").length).toBe(0);
  });

  it("handles single root", () => {
    const { container } = render(renderTree([42]));
    expect(container.querySelectorAll("circle").length).toBe(1);
    expect(container.querySelector("text")?.textContent).toBe("42");
  });
});
