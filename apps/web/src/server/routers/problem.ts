import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../trpc";
import { ProblemService } from "../services/problem";

export const problemRouter = router({
  list: publicProcedure
    .input(
      z.object({
        difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"]).optional(),
        category: z.enum(["ALGORITHM", "DATA_STRUCTURE", "SYSTEM_DESIGN", "SYSTEM_PROGRAMMING", "CONCURRENCY"]).optional(),
        tag: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const service = new ProblemService(ctx.prisma);
      return service.list(input ?? {});
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = new ProblemService(ctx.prisma);
      return service.getBySlug(input.slug);
    }),

  getTestCases: protectedProcedure
    .input(z.object({ problemId: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = new ProblemService(ctx.prisma);
      return service.getAllTestCases(input.problemId);
    }),
});
