import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderGraph } from "@/lib/input-visualizer/renderers/graph";

describe("renderGraph", () => {
  it("renders one node per adjacency list entry", () => {
    const { container } = render(renderGraph([[2, 4], [1, 3], [2, 4], [1, 3]]));
    expect(container.querySelectorAll("circle").length).toBe(4);
  });

  it("displays each node label (1-indexed)", () => {
    const { container } = render(renderGraph([[2], [1]]));
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("1");
    expect(texts).toContain("2");
  });

  it("handles empty graph", () => {
    const { container } = render(renderGraph([]));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("circle").length).toBe(0);
  });
});
