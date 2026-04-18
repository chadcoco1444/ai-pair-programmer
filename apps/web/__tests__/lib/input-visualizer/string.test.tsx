import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderString } from "@/lib/input-visualizer/renderers/string";

describe("renderString", () => {
  it("renders one cell per character", () => {
    const { container } = render(renderString("abc"));
    expect(container.querySelectorAll("rect").length).toBe(3);
  });

  it("displays each character", () => {
    const { container } = render(renderString("xyz"));
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("x");
    expect(texts).toContain("y");
    expect(texts).toContain("z");
  });

  it("handles empty string", () => {
    const { container } = render(renderString(""));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("rect").length).toBe(0);
  });
});
