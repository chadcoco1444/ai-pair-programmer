import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { ExecutionClient } from "../services/execution-client";
import { ProblemService } from "../services/problem";

const executionClient = new ExecutionClient();

export const submissionRouter = router({
  // 提交程式碼
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

      // 取得所有測資（含隱藏）
      const testCases = await problemService.getAllTestCases(input.problemId);

      // 建立提交記錄
      const submission = await ctx.prisma.submission.create({
        data: {
          userId: ctx.user.id,
          problemId: input.problemId,
          language: input.language,
          code: input.code,
          status: "PENDING",
        },
      });

      // 呼叫執行引擎
      try {
        const result = await executionClient.executeSync({
          submissionId: submission.id,
          language: input.language,
          code: input.code,
          testCases: testCases.map((tc) => ({
            id: tc.id,
            input: tc.input,
            expected: tc.expected,
            isHidden: tc.isHidden,
            isKiller: tc.isKiller,
          })),
          timeout: 10000,
          memoryLimit: 256,
        });

        // 更新提交記錄
        await ctx.prisma.submission.update({
          where: { id: submission.id },
          data: {
            status: result.status as any,
            runtime: result.totalRuntime,
            memory: result.totalMemory,
            results: result.testResults as any,
          },
        });

        return {
          submissionId: submission.id,
          status: result.status,
          testResults: result.testResults,
          totalRuntime: result.totalRuntime,
          totalMemory: result.totalMemory,
          compileError: result.compileError,
        };
      } catch (error: any) {
        // 執行引擎不可用時
        await ctx.prisma.submission.update({
          where: { id: submission.id },
          data: {
            status: "RUNTIME_ERROR",
            aiAnalysis: `執行引擎錯誤: ${error.message}`,
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

  // 查詢提交歷史
  history: protectedProcedure
    .input(
      z.object({
        problemId: z.string().optional(),
        limit: z.number().min(1).max(50).default(10),
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

  // 查詢單一提交詳情
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
