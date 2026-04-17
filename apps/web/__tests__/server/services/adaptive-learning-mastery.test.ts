import { describe, it, expect, beforeEach, vi } from "vitest";
import { AdaptiveLearningEngine } from "@/server/services/adaptive-learning";
import type { PrismaClient } from "@prisma/client";

describe("AdaptiveLearningEngine.recalculateMasteryForProblem", () => {
  let engine: AdaptiveLearningEngine;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      problemConcept: {
        findMany: vi.fn().mockResolvedValue([
          { conceptId: "c1", relevance: 0.9 },
          { conceptId: "c2", relevance: 0.6 },
        ]),
      },
      submission: { findMany: vi.fn().mockResolvedValue([]) },
      userProgress: {
        upsert: vi.fn().mockResolvedValue({}),
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };
    engine = new AdaptiveLearningEngine(mockPrisma as PrismaClient);
    vi.spyOn(engine, "updateMastery").mockResolvedValue(0.5);
  });

  it("calls updateMastery for every ProblemConcept", async () => {
    await engine.recalculateMasteryForProblem("user1", "prob1");
    expect(mockPrisma.problemConcept.findMany).toHaveBeenCalledWith({
      where: { problemId: "prob1" },
      select: { conceptId: true },
    });
    expect(engine.updateMastery).toHaveBeenCalledTimes(2);
    expect(engine.updateMastery).toHaveBeenCalledWith("user1", "c1");
    expect(engine.updateMastery).toHaveBeenCalledWith("user1", "c2");
  });

  it("does nothing when problem has no linked concepts", async () => {
    mockPrisma.problemConcept.findMany.mockResolvedValueOnce([]);
    await engine.recalculateMasteryForProblem("user1", "prob1");
    expect(engine.updateMastery).not.toHaveBeenCalled();
  });
});

describe("AdaptiveLearningEngine.getDailyRecommendation", () => {
  let engine: AdaptiveLearningEngine;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      dailyRecommendation: {
        findUnique: vi.fn(),
        create: vi.fn().mockResolvedValue({
          id: "rec1", userId: "u1", date: "2026-04-17",
          problemIds: ["p1", "p2"],
          reasons: [{ problemId: "p1", reason: "basics", score: 100 }],
          createdAt: new Date(),
        }),
      },
    };
    engine = new AdaptiveLearningEngine(mockPrisma as PrismaClient);
    vi.spyOn(engine, "getRecommendations").mockResolvedValue([
      { problem: { id: "p1", title: "T", slug: "s", difficulty: "EASY", category: "ARRAY" }, score: 100, reason: "basics" },
      { problem: { id: "p2", title: "T2", slug: "s2", difficulty: "EASY", category: "ARRAY" }, score: 80, reason: "next" },
    ] as any);
  });

  it("returns cached row when present", async () => {
    const cached = {
      id: "rec1", userId: "u1", date: "2026-04-17",
      problemIds: ["cached-p1"],
      reasons: [{ problemId: "cached-p1", reason: "cached", score: 99 }],
      createdAt: new Date(),
    };
    mockPrisma.dailyRecommendation.findUnique.mockResolvedValueOnce(cached);
    const result = await engine.getDailyRecommendation("u1", "2026-04-17");
    expect(result.problemIds).toEqual(["cached-p1"]);
    expect(mockPrisma.dailyRecommendation.create).not.toHaveBeenCalled();
  });

  it("computes and caches when miss", async () => {
    mockPrisma.dailyRecommendation.findUnique.mockResolvedValueOnce(null);
    const result = await engine.getDailyRecommendation("u1", "2026-04-17");
    expect(engine.getRecommendations).toHaveBeenCalledWith("u1");
    expect(mockPrisma.dailyRecommendation.create).toHaveBeenCalledWith({
      data: {
        userId: "u1",
        date: "2026-04-17",
        problemIds: ["p1", "p2"],
        reasons: [
          { problemId: "p1", reason: "basics", score: 100 },
          { problemId: "p2", reason: "next", score: 80 },
        ],
      },
    });
    expect(result.problemIds).toEqual(["p1", "p2"]);
  });
});
