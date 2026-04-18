import { describe, it, expect, vi } from "vitest";
import { appRouter } from "@/server/router";
import { createCallerFactory } from "@/server/trpc";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    problem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    testCase: {
      findMany: vi.fn(),
    },
    user: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  handlers: {},
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({ redis: {} }));

import { prisma } from "@/lib/prisma";

const createCaller = createCallerFactory(appRouter);

describe("problem.list", () => {
  it("should return a list of problems", async () => {
    const mockProblems = [
      {
        id: "p1",
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "EASY",
        category: "ALGORITHM",
        tags: [{ tag: "array" }],
      },
    ];

    vi.mocked(prisma.problem.findMany).mockResolvedValue(mockProblems as any);

    const caller = createCaller({
      session: null,
      prisma,
      redis: {} as any,
    });

    const result = await caller.problem.list();
    expect(result).toEqual(mockProblems);
  });

  it("should support filtering by difficulty", async () => {
    vi.mocked(prisma.problem.findMany).mockResolvedValue([]);

    const caller = createCaller({
      session: null,
      prisma,
      redis: {} as any,
    });

    await caller.problem.list({ difficulty: "HARD" });

    expect(prisma.problem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ difficulty: "HARD" }),
      })
    );
  });
});

describe("problem.getBySlug", () => {
  it("should return problem details (including visible test cases)", async () => {
    const mockProblem = {
      id: "p1",
      title: "Two Sum",
      slug: "two-sum",
      description: "...",
      testCases: [{ id: "tc1", input: "[2,7]", expected: "[0,1]", isKiller: false }],
      tags: [{ tag: "array" }],
      concepts: [],
    };

    vi.mocked(prisma.problem.findUnique).mockResolvedValue(mockProblem as any);

    const caller = createCaller({
      session: null,
      prisma,
      redis: {} as any,
    });

    const result = await caller.problem.getBySlug({ slug: "two-sum" });
    expect(result?.title).toBe("Two Sum");
  });
});
