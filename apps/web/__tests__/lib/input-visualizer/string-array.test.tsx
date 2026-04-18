import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderStringArray } from "@/lib/input-visualizer/renderers/string-array";

describe("renderStringArray", () => {
  it("renders one cell per string", () => {
    const { container } = render(renderStringArray(["eat", "tea", "ate"]));
    expect(container.querySelectorAll("rect").length).toBe(3);
  });

  it("displays each string", () => {
    const { container } = render(renderStringArray(["foo", "bar"]));
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toEqual(expect.arrayContaining(["foo", "bar"]));
  });

  it("handles empty array", () => {
    const { container } = render(renderStringArray([]));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("rect").length).toBe(0);
  });
});
