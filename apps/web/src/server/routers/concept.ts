import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../trpc";
import { KnowledgeGraphService } from "../services/knowledge-graph";

export const conceptRouter = router({
  graph: publicProcedure
    .input(z.object({ userId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const service = new KnowledgeGraphService(ctx.prisma);
      const userId = input?.userId ?? ctx.session?.user?.id;
      return service.getFullGraph(userId);
    }),

  prerequisites: publicProcedure
    .input(z.object({ conceptId: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = new KnowledgeGraphService(ctx.prisma);
      return service.getPrerequisites(input.conceptId);
    }),

  related: publicProcedure
    .input(z.object({ conceptId: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = new KnowledgeGraphService(ctx.prisma);
      return service.getRelatedConcepts(input.conceptId);
    }),

  mermaid: protectedProcedure
    .query(async ({ ctx }) => {
      const service = new KnowledgeGraphService(ctx.prisma);
      return service.generateMermaidGraph(ctx.user.id);
    }),
});
