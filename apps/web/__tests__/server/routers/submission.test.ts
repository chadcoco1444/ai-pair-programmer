import { describe, it, expect, vi, beforeEach } from "vitest";

// Must define mock BEFORE vi.mock call
const mockExecuteSync = vi.fn();

vi.mock("@/server/services/execution-client", () => {
  return {
    ExecutionClient: class {
      executeSync = mockExecuteSync;
      healthCheck = vi.fn().mockResolvedValue(true);
    },
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    problem: { findUnique: vi.fn(), findMany: vi.fn() },
    testCase: { findMany: vi.fn() },
    submission: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    conversation: { findMany: vi.fn(), create: vi.fn() },
    message: { findMany: vi.fn(), create: vi.fn() },
    userWeakness: { findMany: vi.fn() },
    userProgress: { findMany: vi.fn(), count: vi.fn() },
    conceptEdge: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  handlers: {},
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({ redis: {} }));

vi.mock("@/lib/ai", () => ({
  genai: { getGenerativeModel: vi.fn() },
  AI_MODEL: "test-model",
  AI_AVAILABLE: false,
}));

import { prisma } from "@/lib/prisma";
import { appRouter } from "@/server/router";
import { createCallerFactory } from "@/server/trpc";

const createCaller = createCallerFactory(appRouter);

function makeCaller() {
  return createCaller({
    session: { user: { id: "user-1" }, expires: "" } as any,
    prisma,
    redis: {} as any,
  });
}

describe("submission.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(prisma.testCase.findMany).mockResolvedValue([
      {
        id: "tc-1",
        problemId: "p-1",
        input: "[2,7,11,15]\n9",
        expected: "[0,1]",
        isHidden: false,
        isKiller: false,
      } as any,
    ]);

    vi.mocked(prisma.submission.create).mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      problemId: "p-1",
      language: "PYTHON",
      code: "test",
      status: "PENDING",
    } as any);

    vi.mocked(prisma.submission.update).mockResolvedValue({} as any);
  });

  it("should return ACCEPTED when executor returns ACCEPTED", async () => {
    mockExecuteSync.mockResolvedValue({
      submissionId: "sub-1",
      status: "ACCEPTED",
      testResults: [
        { testCaseId: "tc-1", passed: true, input: "[2,7]", expected: "[0,1]", actual: "[0,1]", runtime: 50, memory: 1024 },
      ],
      totalRuntime: 50,
      totalMemory: 1024,
    });

    const result = await makeCaller().submission.submit({
      problemId: "p-1",
      language: "PYTHON",
      code: "def twoSum(nums, target): pass",
    });

    expect(result.status).toBe("ACCEPTED");
    expect(result.testResults[0].passed).toBe(true);
    expect(prisma.submission.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "ACCEPTED" }) })
    );
  });

  it("should return WRONG_ANSWER when test fails", async () => {
    mockExecuteSync.mockResolvedValue({
      submissionId: "sub-1",
      status: "WRONG_ANSWER",
      testResults: [
        { testCaseId: "tc-1", passed: false, input: "[2,7]", expected: "[0,1]", actual: "[1,0]", runtime: 30, memory: 1024 },
      ],
      totalRuntime: 30,
      totalMemory: 1024,
    });

    const result = await makeCaller().submission.submit({
      problemId: "p-1",
      language: "PYTHON",
      code: "def twoSum(nums, target): return [1,0]",
    });

    expect(result.status).toBe("WRONG_ANSWER");
    expect(result.testResults[0].passed).toBe(false);
  });

  it("REGRESSION: executor unreachable → RUNTIME_ERROR (not throw)", async () => {
    mockExecuteSync.mockRejectedValue(
      new Error("Cannot connect to execution engine (http://localhost:4000). Make sure to start with: npm run dev:web")
    );

    const result = await makeCaller().submission.submit({
      problemId: "p-1",
      language: "PYTHON",
      code: "def twoSum(nums, target): pass",
    });

    expect(result.status).toBe("RUNTIME_ERROR");
    expect(result.compileError).toContain("Cannot connect to execution engine");
    expect(result.testResults).toEqual([]);
    expect(prisma.submission.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "RUNTIME_ERROR" }) })
    );
  });

  it("should handle TIME_LIMIT from executor", async () => {
    mockExecuteSync.mockResolvedValue({
      submissionId: "sub-1",
      status: "TIME_LIMIT",
      testResults: [],
      totalRuntime: 10000,
      totalMemory: 0,
    });

    const result = await makeCaller().submission.submit({
      problemId: "p-1",
      language: "CPP",
      code: "while(true){}",
    });

    expect(result.status).toBe("TIME_LIMIT");
  });

  it("should handle COMPILE_ERROR from executor", async () => {
    mockExecuteSync.mockResolvedValue({
      submissionId: "sub-1",
      status: "COMPILE_ERROR",
      testResults: [],
      totalRuntime: 0,
      totalMemory: 0,
      compileError: "error: expected ';'",
    });

    const result = await makeCaller().submission.submit({
      problemId: "p-1",
      language: "C",
      code: "int main() { return 0 }",
    });

    expect(result.status).toBe("COMPILE_ERROR");
    expect(result.compileError).toContain("expected ';'");
  });
});
