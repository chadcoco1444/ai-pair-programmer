import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderLinkedList } from "@/lib/input-visualizer/renderers/list";

describe("renderLinkedList", () => {
  it("renders one node per value", () => {
    const { container } = render(renderLinkedList([1, 2, 3, 4, 5]));
    expect(container.querySelectorAll("rect").length).toBe(5);
  });

  it("renders n-1 arrows between n nodes", () => {
    const { container } = render(renderLinkedList([1, 2, 3]));
    const arrows = container.querySelectorAll('path[data-role="arrow"]');
    expect(arrows.length).toBe(2);
  });

  it("displays each value as text", () => {
    const { container } = render(renderLinkedList([10, 20, 30]));
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("10");
    expect(texts).toContain("20");
    expect(texts).toContain("30");
  });

  it("handles empty list", () => {
    const { container } = render(renderLinkedList([]));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("rect").length).toBe(0);
  });
});
