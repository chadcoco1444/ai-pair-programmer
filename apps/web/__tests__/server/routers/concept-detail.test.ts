import { describe, it, expect, beforeEach, vi } from "vitest";
import { conceptRouter } from "@/server/routers/concept";

describe("concept.detail", () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      concept: {
        findUnique: vi.fn().mockResolvedValue({
          id: "c1", name: "Dynamic Programming", domain: "ALGORITHM", description: "DP problems ...",
        }),
      },
      userProgress: {
        findUnique: vi.fn().mockResolvedValue({ mastery: 0.6 }),
        findMany: vi.fn().mockResolvedValue([]),
      },
      problemConcept: {
        findMany: vi.fn().mockResolvedValue([
          { conceptId: "c1", relevance: 0.9, problem: { id: "p1", slug: "coin-change", title: "Coin Change", difficulty: "MEDIUM" } },
          { conceptId: "c1", relevance: 0.8, problem: { id: "p2", slug: "house-robber", title: "House Robber", difficulty: "MEDIUM" } },
        ]),
      },
      conceptEdge: {
        findMany: vi.fn()
          .mockResolvedValueOnce([{ parentId: "c0", parent: { id: "c0", name: "Recursion" }, relation: "prerequisite" }])
          .mockResolvedValueOnce([{ childId: "c2", child: { id: "c2", name: "Greedy" }, relation: "prerequisite" }]),
      },
      submission: {
        findMany: vi.fn()
          .mockResolvedValueOnce([{ id: "s1", problemId: "p1", status: "ACCEPTED" }])
          .mockResolvedValueOnce([{ id: "s1", status: "ACCEPTED", createdAt: new Date("2026-04-17"), problem: { slug: "coin-change", title: "Coin Change" } }]),
      },
      userWeakness: {
        findMany: vi.fn().mockResolvedValue([{ pattern: "off-by-one", frequency: 3 }]),
      },
    };
  });

  it("returns full concept detail", async () => {
    const caller = conceptRouter.createCaller({ prisma: mockPrisma, user: { id: "u1" } } as any);
    const result = await caller.detail({ conceptId: "c1" });

    expect(result.concept.name).toBe("Dynamic Programming");
    expect(result.mastery).toBe(0.6);
    expect(result.problems).toHaveLength(2);
    expect(result.problems[0].solved).toBe(true);
    expect(result.problems[1].solved).toBe(false);
    expect(result.prerequisites).toEqual([{ id: "c0", name: "Recursion", mastery: 0 }]);
    expect(result.followUps).toEqual([{ id: "c2", name: "Greedy", mastery: 0 }]);
    expect(result.recentSubmissions).toHaveLength(1);
    expect(result.weaknessStats).toEqual([{ pattern: "off-by-one", frequency: 3 }]);
  });

  it("handles unauthenticated user", async () => {
    const caller = conceptRouter.createCaller({ prisma: mockPrisma, user: null } as any);
    const result = await caller.detail({ conceptId: "c1" });

    expect(result.mastery).toBe(0);
    expect(result.problems.every((p: any) => p.solved === false)).toBe(true);
    expect(result.recentSubmissions).toEqual([]);
    expect(result.weaknessStats).toEqual([]);
  });
});
