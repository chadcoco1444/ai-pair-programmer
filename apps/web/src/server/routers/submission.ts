import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { ExecutionClient } from "../services/execution-client";
import { ProblemService } from "../services/problem";
import { parseTestInput } from "../services/input-parser";
import { AdaptiveLearningEngine } from "../services/adaptive-learning";

function getExecutionClient() {
  return new ExecutionClient();
}

export const submissionRouter = router({
  // Submit code
  submit: protectedProcedure
    .input(
      z.object({
        problemId: z.string(),
        language: z.enum(["PYTHON", "C", "CPP", "JAVASCRIPT"]),
        code: z.string().min(1).max(50000),
        conversationId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const problemService = new ProblemService(ctx.prisma);

      // Fetch all test cases (including hidden)
      const testCases = await problemService.getAllTestCases(input.problemId);

      // Build a helper to strip null bytes that Postgres doesn't accept
      const sanitizeDeep = (obj: any): any => {
        if (typeof obj === 'string') return obj.replace(/\0/g, '');
        if (Array.isArray(obj)) return obj.map(sanitizeDeep);
        if (obj !== null && typeof obj === 'object') {
          return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, sanitizeDeep(v)]));
        }
        return obj;
      };

      // Create submission record
      const submission = await ctx.prisma.submission.create({
        data: {
          userId: ctx.user.id,
          problemId: input.problemId,
          language: input.language,
          code: input.code.replace(/\0/g, ''),
          status: "PENDING",
        },
      });

      // Call execution engine
      try {
        const result = await getExecutionClient().executeSync({
          submissionId: submission.id,
          language: input.language,
          code: input.code,
          testCases: testCases.map((tc) => ({
            id: tc.id,
            input: tc.input,
            args: parseTestInput(tc.input),
            expected: tc.expected,
            isHidden: tc.isHidden,
            isKiller: tc.isKiller,
          })),
          timeout: 10000,
          memoryLimit: 256,
        });

        // Update submission record
        await ctx.prisma.submission.update({
          where: { id: submission.id },
          data: {
            status: result.status as any,
            runtime: result.totalRuntime,
            memory: result.totalMemory,
            results: sanitizeDeep(result.testResults) as any,
          },
        });

        // Auto-update mastery + check level-up for linked concepts on accepted submission
        if (result.status === "ACCEPTED") {
          try {
            const engine = new AdaptiveLearningEngine(ctx.prisma);
            await engine.recalculateMasteryForProblem(ctx.user.id, input.problemId);
            await engine.checkLevelUp(ctx.user.id);
          } catch (err) {
            console.error("post-submit progression update failed", err);
          }
        }

        return {
          submissionId: submission.id,
          status: result.status,
          testResults: result.testResults,
          totalRuntime: result.totalRuntime,
          totalMemory: result.totalMemory,
          compileError: result.compileError,
        };
      } catch (error: any) {
        // Handle executor service unavailable
        await ctx.prisma.submission.update({
          where: { id: submission.id },
          data: {
            status: "RUNTIME_ERROR",
            aiAnalysis: `Executor error: ${error.message}`.replace(/\0/g, ""),
          },
        });

        return {
          submissionId: submission.id,
          status: "RUNTIME_ERROR",
          testResults: [],
          totalRuntime: 0,
          totalMemory: 0,
          compileError: error.message,
        };
      }
    }),

  // Fetch submission history
  history: protectedProcedure
    .input(
      z.object({
        problemId: z.string().optional(),
        limit: z.number().min(1).max(500).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.submission.findMany({
        where: {
          userId: ctx.user.id,
          ...(input.problemId ? { problemId: input.problemId } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        select: {
          id: true,
          language: true,
          status: true,
          runtime: true,
          memory: true,
          createdAt: true,
          problem: {
            select: { title: true, slug: true },
          },
        },
      });
    }),

  // Fetch a single submission
  get: protectedProcedure
    .input(z.object({ submissionId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.submission.findFirst({
        where: {
          id: input.submissionId,
          userId: ctx.user.id,
        },
        include: {
          problem: {
            select: { title: true, slug: true },
          },
        },
      });
    }),
});
