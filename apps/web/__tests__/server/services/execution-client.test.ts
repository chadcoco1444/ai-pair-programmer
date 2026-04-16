import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExecutionClient } from "@/server/services/execution-client";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("ExecutionClient", () => {
  let client: ExecutionClient;

  beforeEach(() => {
    client = new ExecutionClient();
    vi.clearAllMocks();
  });

  const sampleRequest = {
    submissionId: "sub-1",
    language: "PYTHON" as const,
    code: 'print("hello")',
    testCases: [
      {
        id: "tc-1",
        input: "hello",
        expected: "hello",
        isHidden: false,
        isKiller: false,
      },
    ],
  };

  describe("executeSync", () => {
    it("should return result on success", async () => {
      const mockResult = {
        submissionId: "sub-1",
        status: "ACCEPTED",
        testResults: [
          {
            testCaseId: "tc-1",
            passed: true,
            input: "hello",
            expected: "hello",
            actual: "hello",
            runtime: 50,
            memory: 1024,
          },
        ],
        totalRuntime: 50,
        totalMemory: 1024,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const result = await client.executeSync(sampleRequest);
      expect(result.status).toBe("ACCEPTED");
      expect(result.testResults).toHaveLength(1);
      expect(result.testResults[0].passed).toBe(true);
    });

    it("should throw descriptive error when executor is unreachable", async () => {
      mockFetch.mockRejectedValue(new Error("fetch failed"));

      await expect(client.executeSync(sampleRequest)).rejects.toThrow(
        "Cannot connect to execution engine"
      );
    });

    it("should throw error on non-OK response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "Invalid language" }),
      });

      await expect(client.executeSync(sampleRequest)).rejects.toThrow(
        "Invalid language"
      );
    });
  });

  describe("healthCheck", () => {
    it("should return true when executor is healthy", async () => {
      mockFetch.mockResolvedValue({ ok: true });
      expect(await client.healthCheck()).toBe(true);
    });

    it("should return false when executor is down", async () => {
      mockFetch.mockRejectedValue(new Error("connection refused"));
      expect(await client.healthCheck()).toBe(false);
    });
  });
});
