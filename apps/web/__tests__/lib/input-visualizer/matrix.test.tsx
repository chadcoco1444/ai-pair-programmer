import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderMatrix } from "@/lib/input-visualizer/renderers/matrix";

describe("renderMatrix", () => {
  it("renders rows × cols cells", () => {
    const { container } = render(renderMatrix([[1, 2, 3], [4, 5, 6]]));
    expect(container.querySelectorAll("rect").length).toBe(6);
  });

  it("displays each cell value as text", () => {
    const { container } = render(renderMatrix([[1, 0], [0, 1]]));
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toEqual(expect.arrayContaining(["1", "0", "0", "1"]));
  });

  it("returns null-like (empty svg) for empty input", () => {
    const { container } = render(renderMatrix([]));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("rect").length).toBe(0);
  });
});
