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
        const fallbackMessage = problem
          ? `歡迎挑戰「${problem.title}」！\n\n**題目描述：**\n${problem.description}\n\n---\n⚠️ AI 導師目前不可用（請在 .env 中設定 GEMINI_API_KEY）。你仍然可以瀏覽題目、撰寫程式碼並提交。\n\n[S] 蘇格拉底`
          : "⚠️ AI 導師目前不可用。請在 .env 中設定 GEMINI_API_KEY。";

        await this.prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: "ASSISTANT",
            content: fallbackMessage,
            skillPhase: "SOCRATIC",
          },
        });

        return {
          conversation,
          initialMessage: fallbackMessage,
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

        const result = await model.generateContent("請開始引導我解這道題。");
        assistantMessage = result.response.text();
      } catch (error: any) {
        assistantMessage = problem
          ? `歡迎挑戰「${problem.title}」！\n\n**題目描述：**\n${problem.description}\n\n---\n⚠️ AI 導師暫時無法連線（${error.message}）。你仍然可以撰寫程式碼並提交。\n\n[S] 蘇格拉底`
          : `⚠️ AI 導師暫時無法連線：${error.message}`;
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
      const fallback = "⚠️ AI 導師目前不可用。請在 .env 中設定 GEMINI_API_KEY。\n\n你仍然可以撰寫程式碼並提交測試。";
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
      const errorMsg = `\n\n---\n⚠️ AI 回應中斷：${error.message}`;
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
