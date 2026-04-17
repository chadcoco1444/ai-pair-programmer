import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { AdaptiveLearningEngine } from "../services/adaptive-learning";

export const learningRouter = router({
  // 取得推薦題目
  recommendations: protectedProcedure.query(async ({ ctx }) => {
    const engine = new AdaptiveLearningEngine(ctx.prisma);
    const today = new Date().toISOString().slice(0, 10);

    const cached = await engine.getDailyRecommendation(ctx.user.id, today);
    if (cached.problemIds.length === 0) return [];

    const problems = await ctx.prisma.problem.findMany({
      where: { id: { in: cached.problemIds } },
      select: { id: true, slug: true, title: true, difficulty: true, category: true },
    });

    const reasonByProblemId = new Map(cached.reasons.map((r: any) => [r.problemId, r]));

    return cached.problemIds
      .map((pid: string) => {
        const problem = problems.find((p: any) => p.id === pid);
        const reason = reasonByProblemId.get(pid) as any;
        if (!problem || !reason) return null;
        return { problem, reason: reason.reason, score: reason.score };
      })
      .filter((x: any) => x !== null);
  }),

  // 取得學習統計
  stats: protectedProcedure
    .query(async ({ ctx }) => {
      const engine = new AdaptiveLearningEngine(ctx.prisma);
      return engine.getLearningStats(ctx.user.id);
    }),

  // 檢查升級
  checkLevelUp: protectedProcedure
    .mutation(async ({ ctx }) => {
      const engine = new AdaptiveLearningEngine(ctx.prisma);
      return engine.checkLevelUp(ctx.user.id);
    }),

  // 更新概念掌握度
  updateMastery: protectedProcedure
    .input(z.object({ conceptId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const engine = new AdaptiveLearningEngine(ctx.prisma);
      const mastery = await engine.updateMastery(ctx.user.id, input.conceptId);
      return { mastery };
    }),

  // 記錄弱點
  recordWeakness: protectedProcedure
    .input(z.object({ pattern: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const engine = new AdaptiveLearningEngine(ctx.prisma);
      await engine.recordWeakness(ctx.user.id, input.pattern as any);
      return { success: true };
    }),

  // 標記弱點已解決
  resolveWeakness: protectedProcedure
    .input(z.object({ pattern: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const engine = new AdaptiveLearningEngine(ctx.prisma);
      await engine.resolveWeakness(ctx.user.id, input.pattern);
      return { success: true };
    }),
});
