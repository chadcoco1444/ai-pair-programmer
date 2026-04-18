import { describe, it, expect, vi } from "vitest";
import { KnowledgeGraphService } from "@/server/services/knowledge-graph";

function createMockPrisma() {
  return {
    concept: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    conceptEdge: {
      findMany: vi.fn(),
    },
  } as any;
}

describe("KnowledgeGraphService", () => {
  describe("getFullGraph", () => {
    it("should return all concept nodes and edges", async () => {
      const mockPrisma = createMockPrisma();

      mockPrisma.concept.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "Array",
          domain: "ALGORITHM",
          problems: [{ problemId: "p1" }, { problemId: "p2" }],
        },
        {
          id: "c2",
          name: "Hash Table",
          domain: "DATA_STRUCTURE",
          problems: [{ problemId: "p1" }],
        },
      ]);

      mockPrisma.conceptEdge.findMany.mockResolvedValue([
        { parentId: "c1", childId: "c2", relation: "prerequisite" },
      ]);

      const service = new KnowledgeGraphService(mockPrisma);
      const graph = await service.getFullGraph();

      expect(graph.nodes).toHaveLength(2);
      expect(graph.nodes[0].name).toBe("Array");
      expect(graph.nodes[0].problemCount).toBe(2);
      expect(graph.edges).toHaveLength(1);
    });
  });

  describe("generateMermaidGraph", () => {
    it("should produce valid Mermaid syntax", async () => {
      const mockPrisma = createMockPrisma();

      mockPrisma.concept.findMany.mockResolvedValue([
        { id: "c1", name: "Array", domain: "ALGORITHM", problems: [] },
        { id: "c2", name: "Two Pointer", domain: "ALGORITHM", problems: [] },
      ]);

      mockPrisma.conceptEdge.findMany.mockResolvedValue([
        { parentId: "c1", childId: "c2", relation: "prerequisite" },
      ]);

      const service = new KnowledgeGraphService(mockPrisma);
      const mermaid = await service.generateMermaidGraph();

      expect(mermaid).toContain("graph TD");
      expect(mermaid).toContain("Array[Array]");
      expect(mermaid).toContain("Two_Pointer[Two Pointer]");
      expect(mermaid).toContain("Array --> Two_Pointer");
      expect(mermaid).toContain("classDef mastered");
    });
  });
});
