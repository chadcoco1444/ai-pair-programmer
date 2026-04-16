# Plan 4：SKILL AI 編排器 — 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目標：** 建立 SKILL 框架的 AI 編排器 — 根據使用者程度、題目資訊、對話歷史，動態組裝 system prompt 並管理 SKILL 狀態機，透過 Claude API 串流回應。

**架構：** 在 Next.js 應用中新增 SKILLOrchestrator service，管理對話狀態與 SKILL 階段轉換。使用 Anthropic SDK 串流回應，透過 tRPC + SSE 傳送到前端。

**技術棧：** Anthropic SDK (@anthropic-ai/sdk), tRPC v11, Server-Sent Events, Vitest

---

## 檔案結構

```
apps/web/src/
├── server/
│   ├── services/
│   │   ├── skill-orchestrator.ts    # SKILL 狀態機 + prompt 組裝
│   │   └── skill-prompts.ts         # 各階段 prompt 模板
│   └── routers/
│       ├── conversation.ts          # 對話 CRUD + 串流
│       └── submission.ts            # 提交程式碼 + 呼叫執行引擎
├── lib/
│   └── anthropic.ts                 # Anthropic client 單例
└── __tests__/server/
    ├── services/
    │   └── skill-orchestrator.test.ts
    └── routers/
        └── conversation.test.ts
```

---

### Task 1：Anthropic Client 單例

**Files:**
- Create: `apps/web/src/lib/anthropic.ts`

- [ ] **Step 1: 安裝 Anthropic SDK**

```bash
cd apps/web && npm install @anthropic-ai/sdk
```

- [ ] **Step 2: 建立 apps/web/src/lib/anthropic.ts**

```typescript
import Anthropic from "@anthropic-ai/sdk";

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined;
};

export const anthropic =
  globalForAnthropic.anthropic ??
  new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

if (process.env.NODE_ENV !== "production") {
  globalForAnthropic.anthropic = anthropic;
}

export const AI_MODEL = "claude-sonnet-4-20250514";
```

- [ ] **Step 3: 提交**

```bash
git add apps/web/src/lib/anthropic.ts apps/web/package.json
git commit -m "feat: 建立 Anthropic client 單例"
```

---

### Task 2：SKILL Prompt 模板

**Files:**
- Create: `apps/web/src/server/services/skill-prompts.ts`

- [ ] **Step 1: 建立 apps/web/src/server/services/skill-prompts.ts**

```typescript
import type { Level } from "@skill/shared";

export type SKILLPhase = "SOCRATIC" | "KNOWLEDGE" | "ITERATIVE" | "LOGIC" | "EVOLUTION";

export interface StudentProfile {
  level: Level;
  weaknesses: string[];
  conceptMastery: { name: string; mastery: number }[];
}

export interface ProblemContext {
  title: string;
  category: string;
  difficulty: string;
  description: string;
  concepts: string[];
  hints: string[];
}

const SYSTEM_BASE = `## 角色
你是一位資深的程式設計導師，使用 SKILL (Systematic Knowledge & Integrated Logic Learning) 教學框架。

## 硬性規則
1. 絕對不提供完整程式碼解決方案
2. 每次最多展示 5 行程式碼或偽代碼
3. 優先用問題引導，而非直接解釋
4. 根據學生程度調整語言深度
5. 系統設計題必須強調 trade-offs
6. 系統程式設計題必須檢查記憶體安全與並發安全
7. 用繁體中文回應（技術名詞可用英文）

## 回應格式
- 回應結尾標註當前 SKILL 階段：[S] 蘇格拉底 | [K] 知識連結 | [I] 疊代優化 | [L1] 邏輯驗證 | [L2] 長期演化
- 當需要展示架構時，使用 Mermaid 語法（用 \`\`\`mermaid 區塊）
- 程式碼片段使用對應語言的語法高亮`;

const PHASE_PROMPTS: Record<SKILLPhase, string> = {
  SOCRATIC: `## 當前階段：S — 蘇格拉底式引導

你的任務是透過提問來了解學生的思考方向，而非直接告訴他們答案。

行為指引：
- 先了解學生對這題的初步想法
- 如果學生卡住，詢問他們卡在哪裡（時間複雜度？空間複雜度？邊界條件？）
- 使用規模擴展問題：「如果 N 從 100 變成 10^9 會怎樣？」
- 系統設計題：從需求釐清開始
- 不要自行假設學生的困難點`,

  KNOWLEDGE: `## 當前階段：K — 知識圖譜連結

學生已提出一個解法方向。你的任務是幫助他們連結到已知的演算法模式。

行為指引：
- 識別這題背後的演算法原型（如 Monotonic Stack、Sliding Window、DP）
- 漸進式揭示，引導學生自己發現模式，而非直接告知
- 系統設計題：強調 trade-offs（CAP 定理、延遲 vs 吞吐量）
- 連結相關概念：「這和你之前學的 X 有什麼關係？」`,

  ITERATIVE: `## 當前階段：I — 疊代優化

學生正在實作解法。使用三步走策略引導。

行為指引：
- 第一步（暴力解）：確保邏輯正確，先不管效率
- 第二步（瓶頸分析）：找出重複計算、不必要的迭代
- 第三步（最佳化）：引導使用適當的資料結構/演算法優化

系統程式設計額外檢查：
- 記憶體分析：「哪些 malloc 沒有對應的 free？」
- 並發安全：「兩個 thread 同時呼叫這個函數會怎樣？」
- 快取感知：「資料存取模式對 CPU Cache 友善嗎？」`,

  LOGIC: `## 當前階段：L1 — 邏輯驗證

學生準備提交程式碼。你的任務是在提交前幫助他們找到潛在問題。

行為指引：
- 生成一組邊界條件測資，要求學生手動推演結果
- 詢問時間複雜度和空間複雜度，要求學生自己分析
- 系統程式設計：檢查 race condition、deadlock、鎖定順序
- 不要直接指出 bug，而是引導學生自己發現`,

  EVOLUTION: `## 當前階段：L2 — 長期演化

學生已完成這題。提供總結與未來方向。

行為指引：
- 總結這題學到的核心概念
- 指出學生在過程中表現好的地方
- 如果有反覆出現的錯誤模式，溫和地指出
- 推薦下一道相關題目（說明為什麼這題是好的下一步）
- 用 Mermaid 圖表展示知識圖譜中這題的位置`,
};

const LEVEL_CONTEXT: Record<Level, string> = {
  BEGINNER: `學生程度：初學者。使用簡單的類比和日常用語解釋概念。從最基本的問題開始。`,
  INTERMEDIATE: `學生程度：中級。可以使用技術術語，但需要解釋較進階的概念。引導他們思考多種解法。`,
  ADVANCED: `學生程度：高級。直接使用技術術語。挑戰他們思考最優解的瓶頸和理論下界。`,
  EXPERT: `學生程度：專家。討論工業級實作、分散式環境挑戰、硬體層面的最佳化（cache line、SIMD）。`,
};

export function buildSKILLPrompt(params: {
  phase: SKILLPhase;
  student: StudentProfile;
  problem?: ProblemContext;
}): string {
  const { phase, student, problem } = params;

  const parts: string[] = [SYSTEM_BASE];

  // 階段規則
  parts.push(PHASE_PROMPTS[phase]);

  // 學生程度
  parts.push(LEVEL_CONTEXT[student.level]);

  // 弱點
  if (student.weaknesses.length > 0) {
    parts.push(`已知弱點：${student.weaknesses.join("、")}。在引導過程中注意這些弱點。`);
  }

  // 概念掌握度
  if (student.conceptMastery.length > 0) {
    const masteryStr = student.conceptMastery
      .map((c) => `${c.name}: ${Math.round(c.mastery * 100)}%`)
      .join(", ");
    parts.push(`相關概念掌握度：${masteryStr}`);
  }

  // 題目資訊
  if (problem) {
    parts.push(`## 題目資訊
- 標題：${problem.title}
- 分類：${problem.category}
- 難度：${problem.difficulty}
- 相關概念：${problem.concepts.join(", ")}

題目描述：
${problem.description}`);
  }

  return parts.join("\n\n");
}

export function detectPhaseTransition(
  currentPhase: SKILLPhase,
  messageContent: string,
  submissionStatus?: string
): SKILLPhase {
  // 根據對話內容和提交狀態判斷是否需要轉換階段
  
  if (submissionStatus === "ACCEPTED") {
    return "EVOLUTION";
  }

  if (submissionStatus === "WRONG_ANSWER" || submissionStatus === "RUNTIME_ERROR") {
    return "ITERATIVE";
  }

  if (submissionStatus === "TIME_LIMIT" || submissionStatus === "MEMORY_LIMIT") {
    return "ITERATIVE";
  }

  // 基於關鍵字的簡單階段偵測
  const lower = messageContent.toLowerCase();

  switch (currentPhase) {
    case "SOCRATIC":
      // 當學生提出具體解法方向時，進入 Knowledge 階段
      if (
        lower.includes("我想用") ||
        lower.includes("可以用") ||
        lower.includes("我的想法是") ||
        lower.includes("我覺得可以")
      ) {
        return "KNOWLEDGE";
      }
      break;

    case "KNOWLEDGE":
      // 當學生開始寫程式碼時，進入 Iterative 階段
      if (
        lower.includes("def ") ||
        lower.includes("function ") ||
        lower.includes("int ") ||
        lower.includes("class ") ||
        lower.includes("我寫了") ||
        lower.includes("程式碼")
      ) {
        return "ITERATIVE";
      }
      break;

    case "ITERATIVE":
      // 當學生表示要提交時，進入 Logic 階段
      if (
        lower.includes("提交") ||
        lower.includes("submit") ||
        lower.includes("我覺得完成了") ||
        lower.includes("應該可以了")
      ) {
        return "LOGIC";
      }
      break;

    case "LOGIC":
      // 保持在 Logic 直到提交結果觸發轉換
      break;

    case "EVOLUTION":
      // 保持在 Evolution
      break;
  }

  return currentPhase;
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/server/services/skill-prompts.ts
git commit -m "feat: 建立 SKILL prompt 模板 — 五階段規則與階段轉換偵測"
```

---

### Task 3：SKILL Orchestrator Service

**Files:**
- Create: `apps/web/src/server/services/skill-orchestrator.ts`

- [ ] **Step 1: 建立 apps/web/src/server/services/skill-orchestrator.ts**

```typescript
import type { PrismaClient } from "@prisma/client";
import { anthropic, AI_MODEL } from "@/lib/anthropic";
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
      const student = await this.getStudentProfile(params.userId);
      const problem = await this.getProblemContext(params.problemId);

      const systemPrompt = buildSKILLPrompt({
        phase: "SOCRATIC",
        student,
        problem,
      });

      const response = await anthropic.messages.create({
        model: AI_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: "請開始引導我解這道題。",
          },
        ],
      });

      const assistantMessage =
        response.content[0].type === "text" ? response.content[0].text : "";

      // 儲存系統訊息
      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "SYSTEM",
          content: systemPrompt,
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
    const stream = anthropic.messages.stream({
      model: AI_MODEL,
      max_tokens: 2048,
      system: params.systemPrompt,
      messages: params.messages,
    });

    let fullResponse = "";

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        fullResponse += event.delta.text;
        yield event.delta.text;
      }
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
```

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/server/services/skill-orchestrator.ts
git commit -m "feat: 建立 SKILLOrchestrator — 狀態機、prompt 組裝、串流回應"
```

---

### Task 4：Conversation tRPC Router

**Files:**
- Create: `apps/web/src/server/routers/conversation.ts`

- [ ] **Step 1: 建立 apps/web/src/server/routers/conversation.ts**

```typescript
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
```

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/server/routers/conversation.ts
git commit -m "feat: 建立對話 tRPC router — 開始、發送訊息、歷史記錄"
```

---

### Task 5：Submission tRPC Router

**Files:**
- Create: `apps/web/src/server/routers/submission.ts`

- [ ] **Step 1: 建立 apps/web/src/server/routers/submission.ts**

```typescript
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
```

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/server/routers/submission.ts
git commit -m "feat: 建立提交 tRPC router — 提交程式碼、歷史、詳情"
```

---

### Task 6：更新根 Router

**Files:**
- Modify: `apps/web/src/server/router.ts`

- [ ] **Step 1: 更新 apps/web/src/server/router.ts**

```typescript
import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { problemRouter } from "./routers/problem";
import { conceptRouter } from "./routers/concept";
import { conversationRouter } from "./routers/conversation";
import { submissionRouter } from "./routers/submission";

export const appRouter = router({
  user: userRouter,
  problem: problemRouter,
  concept: conceptRouter,
  conversation: conversationRouter,
  submission: submissionRouter,
});

export type AppRouter = typeof appRouter;
```

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/server/router.ts
git commit -m "feat: 更新根 router — 掛載 conversation 與 submission routers"
```

---

### Task 7：SSE 串流端點

**Files:**
- Create: `apps/web/src/app/api/chat/route.ts`

- [ ] **Step 1: 建立 apps/web/src/app/api/chat/route.ts**

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SKILLOrchestrator } from "@/server/services/skill-orchestrator";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { conversationId, content, submissionStatus } = body;

  if (!conversationId || !content) {
    return new Response("Missing conversationId or content", { status: 400 });
  }

  const orchestrator = new SKILLOrchestrator(prisma);

  const { systemPrompt, messages, phase } = await orchestrator.sendMessage({
    conversationId,
    userId: session.user.id,
    content,
    submissionStatus,
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 先送出階段資訊
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "phase", phase })}\n\n`)
        );

        for await (const chunk of orchestrator.streamResponse({
          systemPrompt,
          messages,
          conversationId,
          phase,
        })) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "text", text: chunk })}\n\n`)
          );
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        controller.close();
      } catch (error: any) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/app/api/chat/route.ts
git commit -m "feat: 建立 SSE 串流端點 — /api/chat 即時串流 AI 回應"
```

---

### Task 8：單元測試

**Files:**
- Create: `apps/web/__tests__/server/services/skill-orchestrator.test.ts`

- [ ] **Step 1: 建立 apps/web/__tests__/server/services/skill-orchestrator.test.ts**

```typescript
import { describe, it, expect } from "vitest";
import {
  buildSKILLPrompt,
  detectPhaseTransition,
  type SKILLPhase,
} from "@/server/services/skill-prompts";

describe("buildSKILLPrompt", () => {
  it("應包含基礎系統角色", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "BEGINNER", weaknesses: [], conceptMastery: [] },
    });

    expect(prompt).toContain("程式設計導師");
    expect(prompt).toContain("SKILL");
    expect(prompt).toContain("絕對不提供完整程式碼");
  });

  it("應包含對應階段的規則", () => {
    const prompt = buildSKILLPrompt({
      phase: "ITERATIVE",
      student: { level: "INTERMEDIATE", weaknesses: [], conceptMastery: [] },
    });

    expect(prompt).toContain("疊代優化");
    expect(prompt).toContain("暴力解");
    expect(prompt).toContain("瓶頸分析");
  });

  it("應根據程度調整語言", () => {
    const beginner = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "BEGINNER", weaknesses: [], conceptMastery: [] },
    });

    const expert = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "EXPERT", weaknesses: [], conceptMastery: [] },
    });

    expect(beginner).toContain("初學者");
    expect(expert).toContain("專家");
  });

  it("應包含弱點資訊", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: {
        level: "INTERMEDIATE",
        weaknesses: ["off-by-one", "missing-base-case"],
        conceptMastery: [],
      },
    });

    expect(prompt).toContain("off-by-one");
    expect(prompt).toContain("missing-base-case");
  });

  it("應包含題目資訊", () => {
    const prompt = buildSKILLPrompt({
      phase: "KNOWLEDGE",
      student: { level: "ADVANCED", weaknesses: [], conceptMastery: [] },
      problem: {
        title: "Two Sum",
        category: "ALGORITHM",
        difficulty: "EASY",
        description: "找出兩個數字的和",
        concepts: ["Array", "Hash Table"],
        hints: ["用 hash map"],
      },
    });

    expect(prompt).toContain("Two Sum");
    expect(prompt).toContain("Array");
    expect(prompt).toContain("Hash Table");
  });
});

describe("detectPhaseTransition", () => {
  it("ACCEPTED 應轉換到 EVOLUTION", () => {
    const phase = detectPhaseTransition("LOGIC", "結果出來了", "ACCEPTED");
    expect(phase).toBe("EVOLUTION");
  });

  it("WRONG_ANSWER 應轉換到 ITERATIVE", () => {
    const phase = detectPhaseTransition("LOGIC", "有測資沒過", "WRONG_ANSWER");
    expect(phase).toBe("ITERATIVE");
  });

  it("TIME_LIMIT 應轉換到 ITERATIVE", () => {
    const phase = detectPhaseTransition("LOGIC", "超時了", "TIME_LIMIT");
    expect(phase).toBe("ITERATIVE");
  });

  it("學生提出解法時應從 SOCRATIC 轉到 KNOWLEDGE", () => {
    const phase = detectPhaseTransition("SOCRATIC", "我想用 hash map 來解", undefined);
    expect(phase).toBe("KNOWLEDGE");
  });

  it("學生寫程式碼時應從 KNOWLEDGE 轉到 ITERATIVE", () => {
    const phase = detectPhaseTransition("KNOWLEDGE", "我寫了一個 function", undefined);
    expect(phase).toBe("ITERATIVE");
  });

  it("學生要提交時應從 ITERATIVE 轉到 LOGIC", () => {
    const phase = detectPhaseTransition("ITERATIVE", "我覺得可以提交了", undefined);
    expect(phase).toBe("LOGIC");
  });

  it("無匹配時應保持當前階段", () => {
    const phase = detectPhaseTransition("SOCRATIC", "你好", undefined);
    expect(phase).toBe("SOCRATIC");
  });
});
```

- [ ] **Step 2: 執行測試**

```bash
cd apps/web && npx vitest run
```

預期：所有測試通過。

- [ ] **Step 3: 提交**

```bash
git add apps/web/__tests__/server/services/skill-orchestrator.test.ts
git commit -m "test: 新增 SKILL prompt 與階段轉換單元測試"
```
