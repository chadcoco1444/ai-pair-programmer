import type { PrismaClient } from "@prisma/client";
import { streamText, generateText, type ModelMessage } from "ai";
import { getModel, AI_AVAILABLE, AI_PROVIDER } from "@/lib/ai";
import {
  buildSKILLPrompt,
  detectPhaseTransition,
  type SKILLPhase,
  type StudentProfile,
  type ProblemContext,
} from "./skill-prompts";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

const AI_KEY_HINT =
  "Set ANTHROPIC_API_KEY (default), GOOGLE_GENERATIVE_AI_API_KEY, or OPENAI_API_KEY in .env. Switch provider via AI_PROVIDER=anthropic|google|openai.";

function formatAIError(error: any): string {
  const msg = error?.message || String(error);
  if (msg.includes("429") || /rate.?limit/i.test(msg) || msg.includes("Quota exceeded")) {
    return "Rate limit reached. Please try again in about a minute.";
  }
  if (msg.includes("503") || /overloaded/i.test(msg) || msg.includes("Service Unavailable")) {
    return "The AI model is currently busy. Please wait a moment and retry.";
  }
  if (msg.includes("401") || /invalid.*api.*key/i.test(msg) || /authentication/i.test(msg)) {
    return `AI API key rejected for provider "${AI_PROVIDER}". ${AI_KEY_HINT}`;
  }
  return msg;
}

export class SKILLOrchestrator {
  constructor(private prisma: PrismaClient) {}

  async getStudentProfile(userId: string): Promise<StudentProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { level: true },
    });

    const weaknesses = await this.prisma.userWeakness.findMany({
      where: { userId, resolved: false },
      select: { pattern: true },
      orderBy: { frequency: "desc" },
      take: 5,
    });

    const progress = await this.prisma.userProgress.findMany({
      where: { userId },
      include: { concept: { select: { name: true } } },
      orderBy: { mastery: "asc" },
      take: 10,
    });

    return {
      level: (user?.level as any) ?? "BEGINNER",
      weaknesses: weaknesses.map((w) => w.pattern),
      conceptMastery: progress.map((p) => ({
        name: p.concept.name,
        mastery: p.mastery,
      })),
    };
  }

  async getProblemContext(problemId: string): Promise<ProblemContext | undefined> {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        concepts: {
          include: { concept: { select: { name: true } } },
        },
      },
    });

    if (!problem) return undefined;

    return {
      title: problem.title,
      category: problem.category,
      difficulty: problem.difficulty,
      description: problem.description,
      concepts: problem.concepts.map((c) => c.concept.name),
      hints: problem.hints,
    };
  }

  async startConversation(params: {
    userId: string;
    problemId?: string;
    mode: "GUIDED_PRACTICE" | "SYSTEM_DESIGN" | "FREE_DISCUSSION" | "CODE_REVIEW";
  }) {
    const conversation = await this.prisma.conversation.create({
      data: {
        userId: params.userId,
        problemId: params.problemId ?? null,
        mode: params.mode,
      },
    });

    // If a problem is attached, generate an opening message
    if (params.problemId) {
      const problem = await this.getProblemContext(params.problemId);

      if (!AI_AVAILABLE) {
        const fallback = `⚠️ AI Tutor unavailable. ${AI_KEY_HINT}`;

        await this.prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: "ASSISTANT",
            content: fallback,
            skillPhase: "SOCRATIC",
          },
        });

        return {
          conversation,
          initialMessage: fallback,
          phase: "SOCRATIC" as SKILLPhase,
        };
      }

      const student = await this.getStudentProfile(params.userId);

      const systemPrompt = buildSKILLPrompt({
        phase: "SOCRATIC",
        student,
        problem,
      });

      let assistantMessage: string;
      try {
        const { text } = await generateText({
          model: getModel(),
          system: systemPrompt,
          prompt:
            "Greet the student briefly (1-2 sentences). Do NOT repeat the problem description — they can already see it. Instead, ask them ONE thought-provoking question to get them thinking about their approach. Keep it short.",
        });
        assistantMessage = text;
      } catch (error: any) {
        assistantMessage = `⚠️ System notice: ${formatAIError(error)}`;
      }

      // Save system message
      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "SYSTEM",
          content: "SKILL system prompt",
          skillPhase: "SOCRATIC",
        },
      });

      // Save AI response
      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "ASSISTANT",
          content: assistantMessage,
          skillPhase: "SOCRATIC",
        },
      });

      return {
        conversation,
        initialMessage: assistantMessage,
        phase: "SOCRATIC" as SKILLPhase,
      };
    }

    return { conversation, initialMessage: null, phase: "SOCRATIC" as SKILLPhase };
  }

  async sendMessage(params: {
    conversationId: string;
    userId: string;
    content: string;
    submissionStatus?: string;
  }) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: params.conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: { role: true, content: true, skillPhase: true },
        },
      },
    });

    if (!conversation) throw new Error("Conversation not found");

    // Get the current phase
    const lastPhase =
      (conversation.messages.findLast((m) => m.skillPhase)?.skillPhase as SKILLPhase) ??
      "SOCRATIC";

    // Detect phase transition
    const newPhase = detectPhaseTransition(
      lastPhase,
      params.content,
      params.submissionStatus
    );

    // Save user message
    await this.prisma.message.create({
      data: {
        conversationId: params.conversationId,
        role: "USER",
        content: params.content,
        skillPhase: newPhase,
      },
    });

    // Build the prompt
    const student = await this.getStudentProfile(params.userId);
    const problem = conversation.problemId
      ? await this.getProblemContext(conversation.problemId)
      : undefined;

    const systemPrompt = buildSKILLPrompt({
      phase: newPhase,
      student,
      problem,
    });

    // Build conversation history (excluding SYSTEM messages)
    const messages: ConversationMessage[] = conversation.messages
      .filter((m) => m.role !== "SYSTEM")
      .map((m) => ({
        role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      }));

    // Append the current message
    messages.push({ role: "user", content: params.content });

    return { systemPrompt, messages, phase: newPhase };
  }

  async *streamResponse(params: {
    systemPrompt: string;
    messages: ConversationMessage[];
    conversationId: string;
    phase: SKILLPhase;
  }): AsyncGenerator<string> {
    if (!AI_AVAILABLE) {
      const fallback = `⚠️ AI Tutor is offline. ${AI_KEY_HINT}\n\nYou can still write code and submit!`;
      yield fallback;
      await this.prisma.message.create({
        data: {
          conversationId: params.conversationId,
          role: "ASSISTANT",
          content: fallback,
          skillPhase: params.phase,
        },
      });
      return;
    }

    let fullResponse = "";

    try {
      const modelMessages: ModelMessage[] = params.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = streamText({
        model: getModel(),
        system: params.systemPrompt,
        messages: modelMessages,
      });

      for await (const delta of result.textStream) {
        if (delta) {
          fullResponse += delta;
          yield delta;
        }
      }
    } catch (error: any) {
      const errorMsg = `\n\n---\n⚠️ System notice: ${formatAIError(error)}`;
      fullResponse += errorMsg;
      yield errorMsg;
    }

    // Save the full response
    await this.prisma.message.create({
      data: {
        conversationId: params.conversationId,
        role: "ASSISTANT",
        content: fullResponse,
        skillPhase: params.phase,
      },
    });
  }

  async getConversationHistory(conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        content: true,
        skillPhase: true,
        metadata: true,
        createdAt: true,
      },
    });
  }
}
