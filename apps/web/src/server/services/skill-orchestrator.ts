import type { PrismaClient } from "@prisma/client";
import { genai, AI_MODEL, AI_AVAILABLE } from "@/lib/ai";
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

function formatAIError(error: any): string {
  const msg = error?.message || String(error);
  if (msg.includes("429") || msg.includes("Quota exceeded")) {
    return "服務呼叫次數已達上限 (Rate Limit)，請稍候大約一分鐘後再試一次。";
  }
  if (msg.includes("503") || msg.includes("Service Unavailable")) {
    return "AI 模型伺服器目前較為繁忙，請稍待片刻後重試。";
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

  private buildGeminiHistory(messages: ConversationMessage[]): { role: "user" | "model"; parts: { text: string }[] }[] {
    return messages.map((m) => ({
      role: m.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: m.content }],
    }));
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

    // 如果有題目，生成開場白
    if (params.problemId) {
      const problem = await this.getProblemContext(params.problemId);

      if (!AI_AVAILABLE) {
        const fallback = "⚠️ AI Tutor unavailable. Set `GEMINI_API_KEY` in `.env`.";

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
        const model = genai.getGenerativeModel({
          model: AI_MODEL,
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContent("Greet the student briefly (1-2 sentences). Do NOT repeat the problem description — they can already see it. Instead, ask them ONE thought-provoking question to get them thinking about their approach. Keep it short.");
        assistantMessage = result.response.text();
      } catch (error: any) {
        assistantMessage = `⚠️ 系統提示：${formatAIError(error)}`;
      }

      // 儲存系統訊息
      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "SYSTEM",
          content: "SKILL system prompt",
          skillPhase: "SOCRATIC",
        },
      });

      // 儲存 AI 回應
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

    if (!conversation) throw new Error("找不到對話");

    // 取得當前階段
    const lastPhase =
      (conversation.messages.findLast((m) => m.skillPhase)?.skillPhase as SKILLPhase) ??
      "SOCRATIC";

    // 偵測階段轉換
    const newPhase = detectPhaseTransition(
      lastPhase,
      params.content,
      params.submissionStatus
    );

    // 儲存使用者訊息
    await this.prisma.message.create({
      data: {
        conversationId: params.conversationId,
        role: "USER",
        content: params.content,
        skillPhase: newPhase,
      },
    });

    // 組裝 prompt
    const student = await this.getStudentProfile(params.userId);
    const problem = conversation.problemId
      ? await this.getProblemContext(conversation.problemId)
      : undefined;

    const systemPrompt = buildSKILLPrompt({
      phase: newPhase,
      student,
      problem,
    });

    // 組裝對話歷史（排除 SYSTEM 訊息）
    const messages: ConversationMessage[] = conversation.messages
      .filter((m) => m.role !== "SYSTEM")
      .map((m) => ({
        role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      }));

    // 加入當前訊息
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
      const fallback = "⚠️ AI Tutor is offline. Set `GEMINI_API_KEY` in `.env` to enable it.\n\nYou can still write code and submit!";
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
      const model = genai.getGenerativeModel({
        model: AI_MODEL,
        systemInstruction: params.systemPrompt,
      });

      // 組裝 Gemini 對話歷史（排除最後一條 user message）
      const history = this.buildGeminiHistory(params.messages.slice(0, -1));
      
      // Gemini API 規定 history 第一筆必須是 'user'，如果不符合則塞入一個 dummy 訊息
      if (history.length > 0 && history[0].role === "model") {
        history.unshift({ role: "user" as const, parts: [{ text: "Start conversation" }] });
      }

      const lastMessage = params.messages[params.messages.length - 1].content;

      const chat = model.startChat({ history });
      const result = await chat.sendMessageStream(lastMessage);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          fullResponse += text;
          yield text;
        }
      }
    } catch (error: any) {
      const errorMsg = `\n\n---\n⚠️ 系統提示：${formatAIError(error)}`;
      fullResponse += errorMsg;
      yield errorMsg;
    }

    // 儲存完整回應
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
