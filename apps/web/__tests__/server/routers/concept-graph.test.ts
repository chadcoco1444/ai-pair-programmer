import { describe, it, expect, beforeEach, vi } from "vitest";
import { conceptRouter } from "@/server/routers/concept";

describe("concept.graph", () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      concept: {
        findMany: vi.fn().mockResolvedValue([
          { id: "c1", name: "Array", domain: "ALGORITHM", description: "..." },
          { id: "c2", name: "Two Pointer", domain: "ALGORITHM", description: "..." },
        ]),
      },
      conceptEdge: {
        findMany: vi.fn().mockResolvedValue([
          { parentId: "c1", childId: "c2", relation: "prerequisite" },
        ]),
      },
      userProgress: {
        findMany: vi.fn().mockResolvedValue([
          { userId: "u1", conceptId: "c1", mastery: 0.8 },
        ]),
      },
      problemConcept: {
        groupBy: vi.fn().mockResolvedValue([
          { conceptId: "c1", _count: { problemId: 5 } },
          { conceptId: "c2", _count: { problemId: 3 } },
        ]),
      },
      submission: {
        findMany: vi.fn().mockResolvedValue([
          { problemId: "p1", problem: { concepts: [{ conceptId: "c1" }] } },
        ]),
      },
    };
  });

  it("returns nodes with mastery, prereqsMet, problemCount, solvedCount", async () => {
    const caller = conceptRouter.createCaller({ prisma: mockPrisma, user: { id: "u1" } } as any);
    const result = await caller.graph({});

    expect(result.nodes).toHaveLength(2);
    const arrayNode = result.nodes.find((n: any) => n.id === "c1")!;
    expect(arrayNode.mastery).toBe(0.8);
    expect(arrayNode.prereqsMet).toBe(true);
    expect(arrayNode.problemCount).toBe(5);

    const twoPointerNode = result.nodes.find((n: any) => n.id === "c2")!;
    expect(twoPointerNode.mastery).toBe(0);
    expect(twoPointerNode.prereqsMet).toBe(true);
  });

  it("marks prereqsMet false when prereq mastery < 0.7", async () => {
    mockPrisma.userProgress.findMany.mockResolvedValueOnce([
      { userId: "u1", conceptId: "c1", mastery: 0.5 },
    ]);
    const caller = conceptRouter.createCaller({ prisma: mockPrisma, user: { id: "u1" } } as any);
    const result = await caller.graph({});

    const twoPointerNode = result.nodes.find((n: any) => n.id === "c2")!;
    expect(twoPointerNode.prereqsMet).toBe(false);
  });

  it("includes all edges with their relation type", async () => {
    const caller = conceptRouter.createCaller({ prisma: mockPrisma, user: { id: "u1" } } as any);
    const result = await caller.graph({});

    expect(result.edges).toEqual([
      { source: "c1", target: "c2", type: "prerequisite" },
    ]);
  });
});
