import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { SKILLOrchestrator } from "../services/skill-orchestrator";

export const conversationRouter = router({
  // Start a new conversation
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

  // Send a message (non-streaming; returns the full response)
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

      // Collect the full streamed response
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

  // Fetch conversation history
  history: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const orchestrator = new SKILLOrchestrator(ctx.prisma);
      return orchestrator.getConversationHistory(input.conversationId);
    }),

  // List the user's conversations
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
