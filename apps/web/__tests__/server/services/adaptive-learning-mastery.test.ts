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
