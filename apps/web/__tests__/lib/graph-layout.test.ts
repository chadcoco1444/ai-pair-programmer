import { describe, it, expect } from "vitest";
import { layoutGraph } from "@/lib/graph-layout";

describe("layoutGraph", () => {
  it("returns nodes with positions and edges unchanged", () => {
    const input = {
      nodes: [
        { id: "c1", data: { label: "Array" } },
        { id: "c2", data: { label: "Two Pointer" } },
      ],
      edges: [{ id: "c1-c2", source: "c1", target: "c2", type: "prerequisite" }],
    };
    const result = layoutGraph(input.nodes as any, input.edges as any);
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes[0].position).toMatchObject({ x: expect.any(Number), y: expect.any(Number) });
    expect(result.edges).toEqual(input.edges);
  });

  it("places parent above child in prerequisite edges (top-down)", () => {
    const nodes = [
      { id: "c1", data: { label: "Array" } },
      { id: "c2", data: { label: "Two Pointer" } },
    ];
    const edges = [{ id: "e1", source: "c1", target: "c2", type: "prerequisite" }];
    const result = layoutGraph(nodes as any, edges as any);
    const c1 = result.nodes.find((n) => n.id === "c1")!;
    const c2 = result.nodes.find((n) => n.id === "c2")!;
    expect(c1.position.y).toBeLessThan(c2.position.y);
  });

  it("handles empty input", () => {
    const result = layoutGraph([], []);
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });
});
