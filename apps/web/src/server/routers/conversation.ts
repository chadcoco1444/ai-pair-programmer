import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { SKILLOrchestrator } from "../services/skill-orchestrator";

export const conversationRouter = router({
  // 開始新對話
  start: protectedProcedure
    .input(
      z.object({
        problemId: z.string().optional(),
        mode: z.enum(["GUIDED_PRACTICE", "SYSTEM_DESIGN", "FREE_DISCUSSION", "CODE_REVIEW"]).default("GUIDED_PRACTICE"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const orchestrator = new SKILLOrchestrator(ctx.prisma);
      return orchestrator.startConversation({
        userId: ctx.user.id,
        problemId: input.problemId,
        mode: input.mode,
      });
    }),

  // 發送訊息（非串流，回傳完整回應）
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string().min(1).max(10000),
        submissionStatus: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const orchestrator = new SKILLOrchestrator(ctx.prisma);

      const { systemPrompt, messages, phase } = await orchestrator.sendMessage({
        conversationId: input.conversationId,
        userId: ctx.user.id,
        content: input.content,
        submissionStatus: input.submissionStatus,
      });

      // 收集完整串流回應
      let fullResponse = "";
      for await (const chunk of orchestrator.streamResponse({
        systemPrompt,
        messages,
        conversationId: input.conversationId,
        phase,
      })) {
        fullResponse += chunk;
      }

      return { response: fullResponse, phase };
    }),

  // 取得對話歷史
  history: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const orchestrator = new SKILLOrchestrator(ctx.prisma);
      return orchestrator.getConversationHistory(input.conversationId);
    }),

  // 列出使用者的對話
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.conversation.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          mode: true,
          problemId: true,
          createdAt: true,
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: { content: true, createdAt: true },
          },
        },
      });
    }),
});
