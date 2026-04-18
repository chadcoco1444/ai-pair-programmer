import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderMultiArg } from "@/lib/input-visualizer/renderers/multi-arg";

describe("renderMultiArg", () => {
  it("renders a labeled section for each named arg", () => {
    const { container } = render(
      renderMultiArg([
        { name: "nums", value: [2, 7, 11, 15] },
        { name: "target", value: 9 },
      ])
    );
    const labels = Array.from(container.querySelectorAll('[data-role="arg-label"]')).map(
      (el) => el.textContent
    );
    expect(labels).toContain("nums");
    expect(labels).toContain("target");
  });

  it("handles empty parts list", () => {
    const { container } = render(renderMultiArg([]));
    expect(container.querySelectorAll('[data-role="arg-label"]').length).toBe(0);
  });
});
