# Plan 6：前端 UI — 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目標：** 建立完整的前端介面 — 題庫瀏覽、解題對話頁（核心體驗）、儀表板、個人檔案，並整合 Monaco Editor、Mermaid 圖表渲染、SSE 串流。

**架構：** 基於 Plan 1 已建立的 Next.js 15 App Router，使用 React 19 + Tailwind CSS + tRPC React Query。對話式 UI 為核心，程式碼編輯器與執行結果內嵌在聊天流中。

**技術棧：** Next.js 15, React 19, Tailwind CSS, Monaco Editor, react-markdown, mermaid, tRPC React Query

---

## 檔案結構

```
apps/web/src/
├── app/
│   ├── layout.tsx                    # 已存在，更新導航
│   ├── page.tsx                      # 已存在，更新首頁
│   ├── practice/
│   │   ├── page.tsx                  # 題庫瀏覽
│   │   └── [slug]/
│   │       └── page.tsx              # 解題對話頁（核心）
│   ├── dashboard/
│   │   └── page.tsx                  # 已存在，重寫儀表板
│   └── profile/
│       └── page.tsx                  # 個人檔案
├── components/
│   ├── providers.tsx                 # 已存在
│   ├── auth-button.tsx               # 已存在
│   ├── nav-bar.tsx                   # 頂部導航列
│   ├── chat/
│   │   ├── chat-container.tsx        # 對話容器
│   │   ├── chat-message.tsx          # 單則訊息（支援 Markdown/Mermaid/Code）
│   │   ├── chat-input.tsx            # 輸入框
│   │   └── skill-phase-badge.tsx     # SKILL 階段標籤
│   ├── editor/
│   │   └── code-editor.tsx           # Monaco Editor 封裝
│   ├── practice/
│   │   ├── problem-card.tsx          # 題目卡片
│   │   └── problem-filters.tsx       # 篩選器
│   ├── dashboard/
│   │   ├── stats-overview.tsx        # 統計概覽
│   │   ├── recommendations.tsx       # 推薦題目
│   │   └── knowledge-graph-viz.tsx   # 知識圖譜視覺化
│   └── submission/
│       └── execution-result.tsx      # 執行結果顯示
└── hooks/
    ├── use-chat.ts                   # SSE 串流 hook
    └── use-submission.ts             # 提交程式碼 hook
```

---

### Task 1：安裝前端依賴與共用元件

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/src/components/nav-bar.tsx`

- [ ] **Step 1: 安裝依賴**

```bash
cd apps/web && npm install @monaco-editor/react react-markdown remark-gfm rehype-highlight mermaid
```

- [ ] **Step 2: 建立 apps/web/src/components/nav-bar.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButton } from "./auth-button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "儀表板" },
  { href: "/practice", label: "題庫" },
  { href: "/profile", label: "個人檔案" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-800 bg-gray-950">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold">
            SKILL
          </Link>
          <div className="flex gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  pathname === item.href
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <AuthButton />
      </nav>
    </header>
  );
}
```

- [ ] **Step 3: 更新 apps/web/src/app/layout.tsx**

```tsx
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

export const metadata: Metadata = {
  title: "SKILL Platform — AI 程式解題導師",
  description: "透過 AI 導師的蘇格拉底式引導，精進你的演算法與系統設計能力",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-gray-950 text-white">
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: 提交**

```bash
git add apps/web/src/components/nav-bar.tsx apps/web/src/app/layout.tsx apps/web/package.json
git commit -m "feat: 新增導航列與前端依賴 — Monaco Editor、react-markdown、Mermaid"
```

---

### Task 2：SKILL 階段標籤與聊天訊息元件

**Files:**
- Create: `apps/web/src/components/chat/skill-phase-badge.tsx`
- Create: `apps/web/src/components/chat/chat-message.tsx`

- [ ] **Step 1: 建立 apps/web/src/components/chat/skill-phase-badge.tsx**

```tsx
const PHASE_CONFIG: Record<string, { label: string; color: string }> = {
  SOCRATIC: { label: "S 蘇格拉底", color: "bg-blue-600" },
  KNOWLEDGE: { label: "K 知識連結", color: "bg-purple-600" },
  ITERATIVE: { label: "I 疊代優化", color: "bg-amber-600" },
  LOGIC: { label: "L1 邏輯驗證", color: "bg-emerald-600" },
  EVOLUTION: { label: "L2 長期演化", color: "bg-rose-600" },
};

export function SKILLPhaseBadge({ phase }: { phase: string }) {
  const config = PHASE_CONFIG[phase] ?? { label: phase, color: "bg-gray-600" };

  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium text-white ${config.color}`}
    >
      {config.label}
    </span>
  );
}
```

- [ ] **Step 2: 建立 apps/web/src/components/chat/chat-message.tsx**

```tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef } from "react";
import { SKILLPhaseBadge } from "./skill-phase-badge";

interface ChatMessageProps {
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  skillPhase?: string | null;
  isStreaming?: boolean;
}

function MermaidBlock({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("mermaid").then((mermaid) => {
      if (cancelled || !ref.current) return;
      mermaid.default.initialize({ startOnLoad: false, theme: "dark" });
      mermaid.default
        .render(`mermaid-${Date.now()}`, chart)
        .then(({ svg }) => {
          if (ref.current && !cancelled) {
            ref.current.innerHTML = svg;
          }
        })
        .catch(() => {
          if (ref.current && !cancelled) {
            ref.current.textContent = chart;
          }
        });
    });
    return () => { cancelled = true; };
  }, [chart]);

  return <div ref={ref} className="my-4 flex justify-center" />;
}

export function ChatMessage({ role, content, skillPhase, isStreaming }: ChatMessageProps) {
  if (role === "SYSTEM") return null;

  const isUser = role === "USER";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-800 text-gray-100"
        }`}
      >
        {!isUser && skillPhase && (
          <div className="mb-2">
            <SKILLPhaseBadge phase={skillPhase} />
          </div>
        )}
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeStr = String(children).replace(/\n$/, "");

                if (match?.[1] === "mermaid") {
                  return <MermaidBlock chart={codeStr} />;
                }

                if (match) {
                  return (
                    <pre className="overflow-x-auto rounded bg-gray-900 p-3">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                }

                return (
                  <code className="rounded bg-gray-900 px-1 py-0.5 text-sm" {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        {isStreaming && (
          <span className="mt-1 inline-block h-4 w-1 animate-pulse bg-gray-400" />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add apps/web/src/components/chat/
git commit -m "feat: 建立 SKILL 階段標籤與聊天訊息元件 — Markdown + Mermaid 渲染"
```

---

### Task 3：聊天輸入框與 SSE Hook

**Files:**
- Create: `apps/web/src/components/chat/chat-input.tsx`
- Create: `apps/web/src/hooks/use-chat.ts`

- [ ] **Step 1: 建立 apps/web/src/components/chat/chat-input.tsx**

```tsx
"use client";

import { useState, useRef } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  };

  return (
    <div className="border-t border-gray-800 bg-gray-900 p-4">
      <div className="mx-auto flex max-w-4xl gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          placeholder={placeholder ?? "輸入你的想法...（Shift+Enter 換行）"}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600"
        >
          發送
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 建立 apps/web/src/hooks/use-chat.ts**

```typescript
"use client";

import { useState, useCallback } from "react";

interface Message {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  skillPhase?: string;
  isStreaming?: boolean;
}

interface UseChatOptions {
  conversationId: string;
}

export function useChat({ conversationId }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>("SOCRATIC");

  const sendMessage = useCallback(
    async (content: string, submissionStatus?: string) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "USER",
        content,
      };

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "ASSISTANT",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, content, submissionStatus }),
        });

        if (!response.ok) throw new Error("串流連線失敗");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("無法讀取回應串流");

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = JSON.parse(line.slice(6));

            if (data.type === "phase") {
              setCurrentPhase(data.phase);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, skillPhase: data.phase }
                    : m
                )
              );
            } else if (data.type === "text") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, content: m.content + data.text }
                    : m
                )
              );
            } else if (data.type === "done") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, isStreaming: false }
                    : m
                )
              );
            } else if (data.type === "error") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, content: `錯誤：${data.error}`, isStreaming: false }
                    : m
                )
              );
            }
          }
        }
      } catch (error: any) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: `連線錯誤：${error.message}`, isStreaming: false }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId]
  );

  const loadHistory = useCallback((history: {
    id: string;
    role: string;
    content: string;
    skillPhase?: string | null;
  }[]) => {
    setMessages(
      history
        .filter((m) => m.role !== "SYSTEM")
        .map((m) => ({
          id: m.id,
          role: m.role as "USER" | "ASSISTANT",
          content: m.content,
          skillPhase: m.skillPhase ?? undefined,
        }))
    );
    const lastPhase = history.findLast((m) => m.skillPhase)?.skillPhase;
    if (lastPhase) setCurrentPhase(lastPhase);
  }, []);

  return { messages, isLoading, currentPhase, sendMessage, loadHistory };
}
```

- [ ] **Step 3: 提交**

```bash
git add apps/web/src/components/chat/chat-input.tsx apps/web/src/hooks/use-chat.ts
git commit -m "feat: 建立聊天輸入框與 SSE 串流 hook"
```

---

### Task 4：程式碼編輯器與執行結果元件

**Files:**
- Create: `apps/web/src/components/editor/code-editor.tsx`
- Create: `apps/web/src/components/submission/execution-result.tsx`
- Create: `apps/web/src/hooks/use-submission.ts`

- [ ] **Step 1: 建立 apps/web/src/components/editor/code-editor.tsx**

```tsx
"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

const LANGUAGE_MAP: Record<string, string> = {
  PYTHON: "python",
  C: "c",
  CPP: "cpp",
  JAVASCRIPT: "javascript",
};

interface CodeEditorProps {
  language: string;
  initialCode?: string;
  onSubmit: (code: string) => void;
  onRun?: (code: string) => void;
  disabled?: boolean;
}

export function CodeEditor({
  language,
  initialCode,
  onSubmit,
  onRun,
  disabled,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode ?? "");

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-gray-700">
      <div className="flex items-center justify-between bg-gray-800 px-3 py-2">
        <span className="text-xs text-gray-400">
          {LANGUAGE_MAP[language] ?? language}
        </span>
        <div className="flex gap-2">
          {onRun && (
            <button
              onClick={() => onRun(code)}
              disabled={disabled}
              className="rounded bg-gray-700 px-3 py-1 text-xs text-white hover:bg-gray-600 disabled:opacity-50"
            >
              執行
            </button>
          )}
          <button
            onClick={() => onSubmit(code)}
            disabled={disabled}
            className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-500 disabled:opacity-50"
          >
            提交
          </button>
        </div>
      </div>
      <Editor
        height="300px"
        language={LANGUAGE_MAP[language] ?? "plaintext"}
        value={code}
        onChange={(value) => setCode(value ?? "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: "on",
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: 建立 apps/web/src/components/submission/execution-result.tsx**

```tsx
interface TestResult {
  testCaseId: string;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  runtime: number;
  memory: number;
}

interface ExecutionResultProps {
  status: string;
  testResults: TestResult[];
  totalRuntime: number;
  totalMemory: number;
  compileError?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACCEPTED: { label: "通過", color: "text-green-400" },
  WRONG_ANSWER: { label: "答案錯誤", color: "text-red-400" },
  TIME_LIMIT: { label: "超時", color: "text-yellow-400" },
  MEMORY_LIMIT: { label: "記憶體超限", color: "text-yellow-400" },
  RUNTIME_ERROR: { label: "執行時錯誤", color: "text-red-400" },
  COMPILE_ERROR: { label: "編譯錯誤", color: "text-red-400" },
};

export function ExecutionResult({
  status,
  testResults,
  totalRuntime,
  totalMemory,
  compileError,
}: ExecutionResultProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: "text-gray-400" };

  return (
    <div className="my-4 rounded-lg border border-gray-700 bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
        <span className={`font-medium ${config.color}`}>{config.label}</span>
        <span className="text-xs text-gray-400">
          {totalRuntime}ms | {(totalMemory / 1024).toFixed(1)}MB
        </span>
      </div>

      {compileError && (
        <pre className="overflow-x-auto p-4 text-sm text-red-400">{compileError}</pre>
      )}

      {testResults.length > 0 && (
        <div className="divide-y divide-gray-700">
          {testResults.map((tr, i) => (
            <div key={tr.testCaseId} className="px-4 py-2 text-sm">
              <div className="flex items-center gap-2">
                <span>{tr.passed ? "✅" : "❌"}</span>
                <span className="text-gray-300">測資 {i + 1}</span>
                <span className="text-xs text-gray-500">{tr.runtime}ms</span>
              </div>
              {!tr.passed && tr.input !== "[隱藏]" && (
                <div className="mt-1 space-y-1 pl-6 text-xs text-gray-400">
                  <div>輸入: <code className="text-gray-300">{tr.input}</code></div>
                  <div>預期: <code className="text-green-400">{tr.expected}</code></div>
                  <div>實際: <code className="text-red-400">{tr.actual}</code></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 建立 apps/web/src/hooks/use-submission.ts**

```typescript
"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";

interface SubmissionResult {
  submissionId: string;
  status: string;
  testResults: any[];
  totalRuntime: number;
  totalMemory: number;
  compileError?: string;
}

export function useSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const submitMutation = trpc.submission.submit.useMutation();

  const submit = async (params: {
    problemId: string;
    language: "PYTHON" | "C" | "CPP" | "JAVASCRIPT";
    code: string;
    conversationId?: string;
  }) => {
    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await submitMutation.mutateAsync(params);
      setResult(res);
      return res;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, result };
}
```

- [ ] **Step 4: 提交**

```bash
git add apps/web/src/components/editor/ apps/web/src/components/submission/ apps/web/src/hooks/use-submission.ts
git commit -m "feat: 建立程式碼編輯器、執行結果元件與提交 hook"
```

---

### Task 5：聊天容器與解題頁面

**Files:**
- Create: `apps/web/src/components/chat/chat-container.tsx`
- Create: `apps/web/src/app/practice/[slug]/page.tsx`

- [ ] **Step 1: 建立 apps/web/src/components/chat/chat-container.tsx**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { useChat } from "@/hooks/use-chat";

interface ChatContainerProps {
  conversationId: string;
  initialMessages?: {
    id: string;
    role: string;
    content: string;
    skillPhase?: string | null;
  }[];
}

export function ChatContainer({ conversationId, initialMessages }: ChatContainerProps) {
  const { messages, isLoading, currentPhase, sendMessage, loadHistory } =
    useChat({ conversationId });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessages) {
      loadHistory(initialMessages);
    }
  }, [initialMessages, loadHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-4xl">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              skillPhase={msg.skillPhase}
              isStreaming={msg.isStreaming}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
```

- [ ] **Step 2: 建立 apps/web/src/app/practice/[slug]/page.tsx**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
import { ChatContainer } from "@/components/chat/chat-container";
import { CodeEditor } from "@/components/editor/code-editor";
import { ExecutionResult } from "@/components/submission/execution-result";
import { useSubmission } from "@/hooks/use-submission";
import type { Language } from "@skill/shared";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "PYTHON", label: "Python" },
  { value: "C", label: "C" },
  { value: "CPP", label: "C++" },
  { value: "JAVASCRIPT", label: "JavaScript" },
];

export default function PracticePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [language, setLanguage] = useState<Language>("PYTHON");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);

  const { data: problem, isLoading: problemLoading } =
    trpc.problem.getBySlug.useQuery({ slug });

  const startConversation = trpc.conversation.start.useMutation();
  const { submit, isSubmitting, result } = useSubmission();

  // 開始對話
  useEffect(() => {
    if (problem && !conversationId) {
      startConversation
        .mutateAsync({
          problemId: problem.id,
          mode: "GUIDED_PRACTICE",
        })
        .then((res) => {
          setConversationId(res.conversation.id);
          if (res.initialMessage) {
            setInitialMessages([
              {
                id: "initial",
                role: "ASSISTANT",
                content: res.initialMessage,
                skillPhase: res.phase,
              },
            ]);
          }
        });
    }
  }, [problem]);

  if (problemLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-gray-400">載入中...</div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-gray-400">找不到題目</div>
      </div>
    );
  }

  const starterCode =
    (problem.starterCode as Record<string, string>)?.[language] ?? "";

  const handleSubmit = async (code: string) => {
    const res = await submit({
      problemId: problem.id,
      language,
      code,
      conversationId: conversationId ?? undefined,
    });
    return res;
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* 頂部：題目資訊 */}
      <div className="border-b border-gray-800 bg-gray-900 px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{problem.title}</h1>
            <div className="mt-1 flex gap-2">
              <span className="rounded bg-gray-700 px-2 py-0.5 text-xs">
                {problem.difficulty}
              </span>
              <span className="rounded bg-gray-700 px-2 py-0.5 text-xs">
                {problem.category}
              </span>
              {problem.tags.map((t) => (
                <span
                  key={t.tag}
                  className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400"
                >
                  {t.tag}
                </span>
              ))}
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 主內容：對話 + 編輯器 */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl p-4">
          {/* 對話區域 */}
          {conversationId && (
            <ChatContainer
              conversationId={conversationId}
              initialMessages={initialMessages}
            />
          )}

          {/* 程式碼編輯器 */}
          <CodeEditor
            language={language}
            initialCode={starterCode}
            onSubmit={handleSubmit}
            disabled={isSubmitting}
          />

          {/* 執行結果 */}
          {result && (
            <ExecutionResult
              status={result.status}
              testResults={result.testResults}
              totalRuntime={result.totalRuntime}
              totalMemory={result.totalMemory}
              compileError={result.compileError}
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add apps/web/src/components/chat/chat-container.tsx apps/web/src/app/practice/
git commit -m "feat: 建立解題對話頁 — 聊天容器 + 程式碼編輯器 + 執行結果"
```

---

### Task 6：題庫瀏覽頁

**Files:**
- Create: `apps/web/src/components/practice/problem-card.tsx`
- Create: `apps/web/src/components/practice/problem-filters.tsx`
- Create: `apps/web/src/app/practice/page.tsx`

- [ ] **Step 1: 建立 apps/web/src/components/practice/problem-card.tsx**

```tsx
import Link from "next/link";

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "text-green-400",
  MEDIUM: "text-amber-400",
  HARD: "text-red-400",
  EXPERT: "text-purple-400",
};

interface ProblemCardProps {
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  tags: { tag: string }[];
}

export function ProblemCard({ title, slug, difficulty, category, tags }: ProblemCardProps) {
  return (
    <Link
      href={`/practice/${slug}`}
      className="block rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-600"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-medium text-white">{title}</h3>
        <span className={`text-sm font-medium ${DIFFICULTY_COLORS[difficulty] ?? "text-gray-400"}`}>
          {difficulty}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
          {category}
        </span>
        {tags.map((t) => (
          <span
            key={t.tag}
            className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400"
          >
            {t.tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: 建立 apps/web/src/components/practice/problem-filters.tsx**

```tsx
"use client";

interface ProblemFiltersProps {
  difficulty: string;
  category: string;
  search: string;
  onDifficultyChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onSearchChange: (v: string) => void;
}

export function ProblemFilters({
  difficulty,
  category,
  search,
  onDifficultyChange,
  onCategoryChange,
  onSearchChange,
}: ProblemFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="搜尋題目..."
        className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
      />
      <select
        value={difficulty}
        onChange={(e) => onDifficultyChange(e.target.value)}
        className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
      >
        <option value="">所有難度</option>
        <option value="EASY">Easy</option>
        <option value="MEDIUM">Medium</option>
        <option value="HARD">Hard</option>
        <option value="EXPERT">Expert</option>
      </select>
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
      >
        <option value="">所有分類</option>
        <option value="ALGORITHM">演算法</option>
        <option value="DATA_STRUCTURE">資料結構</option>
        <option value="SYSTEM_DESIGN">系統設計</option>
        <option value="SYSTEM_PROGRAMMING">系統程式設計</option>
        <option value="CONCURRENCY">併發</option>
      </select>
    </div>
  );
}
```

- [ ] **Step 3: 建立 apps/web/src/app/practice/page.tsx**

```tsx
"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { ProblemCard } from "@/components/practice/problem-card";
import { ProblemFilters } from "@/components/practice/problem-filters";

export default function PracticeListPage() {
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const { data: problems, isLoading } = trpc.problem.list.useQuery({
    difficulty: difficulty || undefined,
    category: category || undefined,
    search: search || undefined,
  } as any);

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">題庫</h1>

      <div className="mb-6">
        <ProblemFilters
          difficulty={difficulty}
          category={category}
          search={search}
          onDifficultyChange={setDifficulty}
          onCategoryChange={setCategory}
          onSearchChange={setSearch}
        />
      </div>

      {isLoading ? (
        <div className="text-gray-400">載入中...</div>
      ) : (
        <div className="space-y-3">
          {problems?.map((p) => (
            <ProblemCard
              key={p.id}
              title={p.title}
              slug={p.slug}
              difficulty={p.difficulty}
              category={p.category}
              tags={p.tags}
            />
          ))}
          {problems?.length === 0 && (
            <div className="text-gray-400">沒有找到符合條件的題目</div>
          )}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 4: 提交**

```bash
git add apps/web/src/components/practice/ apps/web/src/app/practice/page.tsx
git commit -m "feat: 建立題庫瀏覽頁 — 搜尋、篩選、題目卡片"
```

---

### Task 7：儀表板頁面

**Files:**
- Create: `apps/web/src/components/dashboard/stats-overview.tsx`
- Create: `apps/web/src/components/dashboard/recommendations.tsx`
- Create: `apps/web/src/components/dashboard/knowledge-graph-viz.tsx`
- Modify: `apps/web/src/app/dashboard/page.tsx`

- [ ] **Step 1: 建立 apps/web/src/components/dashboard/stats-overview.tsx**

```tsx
interface StatsOverviewProps {
  totalSolved: number;
  passRate: number;
  currentLevel: string;
  recentActivity: number;
}

export function StatsOverview({ totalSolved, passRate, currentLevel, recentActivity }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {[
        { label: "已解題數", value: totalSolved },
        { label: "通過率", value: `${Math.round(passRate * 100)}%` },
        { label: "目前等級", value: currentLevel },
        { label: "本週解題", value: recentActivity },
      ].map((stat) => (
        <div key={stat.label} className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-400">{stat.label}</div>
          <div className="mt-1 text-2xl font-bold">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 建立 apps/web/src/components/dashboard/recommendations.tsx**

```tsx
import Link from "next/link";

interface Recommendation {
  problem: {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    category: string;
  };
  reason: string;
}

export function Recommendations({ items }: { items: Recommendation[] }) {
  if (items.length === 0) {
    return <div className="text-gray-400">暫無推薦，繼續解題吧！</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link
          key={item.problem.id}
          href={`/practice/${item.problem.slug}`}
          className="block rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-600"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{item.problem.title}</span>
            <span className="text-sm text-gray-400">{item.problem.difficulty}</span>
          </div>
          <p className="mt-1 text-sm text-gray-400">{item.reason}</p>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 建立 apps/web/src/components/dashboard/knowledge-graph-viz.tsx**

```tsx
"use client";

import { useEffect, useRef } from "react";

export function KnowledgeGraphViz({ mermaidCode }: { mermaidCode: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("mermaid").then((mermaid) => {
      if (cancelled || !ref.current) return;
      mermaid.default.initialize({ startOnLoad: false, theme: "dark" });
      mermaid.default
        .render(`kg-${Date.now()}`, mermaidCode)
        .then(({ svg }) => {
          if (ref.current && !cancelled) {
            ref.current.innerHTML = svg;
          }
        })
        .catch(() => {
          if (ref.current && !cancelled) {
            ref.current.innerHTML = `<pre class="text-xs text-gray-400">${mermaidCode}</pre>`;
          }
        });
    });
    return () => { cancelled = true; };
  }, [mermaidCode]);

  return (
    <div
      ref={ref}
      className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-800 bg-gray-900 p-4"
    />
  );
}
```

- [ ] **Step 4: 重寫 apps/web/src/app/dashboard/page.tsx**

```tsx
"use client";

import { trpc } from "@/lib/trpc-client";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { Recommendations } from "@/components/dashboard/recommendations";
import { KnowledgeGraphViz } from "@/components/dashboard/knowledge-graph-viz";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = trpc.learning.stats.useQuery();
  const { data: recommendations, isLoading: recsLoading } = trpc.learning.recommendations.useQuery();
  const { data: mermaid } = trpc.concept.mermaid.useQuery();

  if (statsLoading) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <div className="text-gray-400">載入中...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">儀表板</h1>
        <p className="mt-1 text-gray-400">你的學習進度一覽</p>
      </div>

      {/* 統計概覽 */}
      {stats && (
        <StatsOverview
          totalSolved={stats.totalSolved}
          passRate={stats.passRate}
          currentLevel={stats.currentLevel}
          recentActivity={stats.recentActivity}
        />
      )}

      {/* 升級進度 */}
      {stats?.nextLevelProgress && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <h2 className="mb-3 text-lg font-bold">升級進度</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">掌握概念</span>
              <span>{stats.nextLevelProgress.conceptsMastered} / {stats.nextLevelProgress.conceptsRequired}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-700">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{
                  width: `${Math.min(100, (stats.nextLevelProgress.conceptsMastered / stats.nextLevelProgress.conceptsRequired) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">通過題數</span>
              <span>{stats.nextLevelProgress.problemsAccepted} / {stats.nextLevelProgress.problemsRequired}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-700">
              <div
                className="h-full rounded-full bg-green-500"
                style={{
                  width: `${Math.min(100, (stats.nextLevelProgress.problemsAccepted / stats.nextLevelProgress.problemsRequired) * 100)}%`,
                }}
              />
            </div>
            {stats.nextLevelProgress.missingDomains.length > 0 && (
              <div className="text-gray-400">
                需探索領域：{stats.nextLevelProgress.missingDomains.join("、")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 弱點 */}
      {stats?.topWeaknesses && stats.topWeaknesses.length > 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <h2 className="mb-3 text-lg font-bold">需要加強的地方</h2>
          <div className="space-y-2">
            {stats.topWeaknesses.map((w) => (
              <div key={w.pattern} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-red-400">{w.pattern}</span>
                  <span className="ml-2 text-gray-400">{w.description}</span>
                </div>
                <span className="text-gray-500">出現 {w.frequency} 次</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 推薦題目 */}
      <div>
        <h2 className="mb-3 text-lg font-bold">今日推薦</h2>
        {recsLoading ? (
          <div className="text-gray-400">載入中...</div>
        ) : (
          <Recommendations items={recommendations ?? []} />
        )}
      </div>

      {/* 知識圖譜 */}
      {mermaid && (
        <div>
          <h2 className="mb-3 text-lg font-bold">知識圖譜</h2>
          <KnowledgeGraphViz mermaidCode={mermaid} />
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 5: 提交**

```bash
git add apps/web/src/components/dashboard/ apps/web/src/app/dashboard/
git commit -m "feat: 重寫儀表板 — 統計、升級進度、弱點、推薦、知識圖譜"
```

---

### Task 8：個人檔案頁與首頁更新

**Files:**
- Create: `apps/web/src/app/profile/page.tsx`
- Modify: `apps/web/src/app/page.tsx`

- [ ] **Step 1: 建立 apps/web/src/app/profile/page.tsx**

```tsx
"use client";

import { trpc } from "@/lib/trpc-client";

export default function ProfilePage() {
  const { data: user } = trpc.user.me.useQuery();
  const { data: stats } = trpc.learning.stats.useQuery();
  const { data: submissions } = trpc.submission.history.useQuery({ limit: 10 });

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <div className="text-gray-400">載入中...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-8">
      {/* 個人資訊 */}
      <div className="flex items-center gap-4">
        {user.image && (
          <img src={user.image} alt="" className="h-16 w-16 rounded-full" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
          <div className="mt-1 flex gap-2">
            <span className="rounded bg-blue-600 px-2 py-0.5 text-xs">{user.level}</span>
            <span className="text-sm text-gray-400">{user.xp} XP</span>
          </div>
        </div>
      </div>

      {/* 統計 */}
      {stats && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <h2 className="mb-3 text-lg font-bold">學習統計</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.totalSolved}</div>
              <div className="text-sm text-gray-400">已解題數</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{Math.round(stats.passRate * 100)}%</div>
              <div className="text-sm text-gray-400">通過率</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.recentActivity}</div>
              <div className="text-sm text-gray-400">本週解題</div>
            </div>
          </div>
        </div>
      )}

      {/* 最近提交 */}
      <div>
        <h2 className="mb-3 text-lg font-bold">最近提交</h2>
        {submissions && submissions.length > 0 ? (
          <div className="space-y-2">
            {submissions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm"
              >
                <div>
                  <span className="font-medium">{s.problem.title}</span>
                  <span className="ml-2 text-gray-400">{s.language}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      s.status === "ACCEPTED" ? "text-green-400" : "text-red-400"
                    }
                  >
                    {s.status}
                  </span>
                  {s.runtime && (
                    <span className="text-gray-500">{s.runtime}ms</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400">還沒有提交記錄</div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 更新 apps/web/src/app/page.tsx**

```tsx
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">SKILL Platform</h1>
        <p className="mt-4 text-lg text-gray-400">
          AI 驅動的程式解題與系統設計導師
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Systematic Knowledge & Integrated Logic Learning
        </p>
      </div>

      <AuthButton />

      <div className="mt-8 grid max-w-2xl grid-cols-3 gap-4 text-center">
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div className="text-2xl font-bold text-blue-400">SKILL</div>
          <div className="mt-2 text-sm text-gray-400">
            蘇格拉底式引導，不餵答案
          </div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div className="text-2xl font-bold text-green-400">4 語言</div>
          <div className="mt-2 text-sm text-gray-400">
            Python、C、C++、JavaScript
          </div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div className="text-2xl font-bold text-purple-400">自適應</div>
          <div className="mt-2 text-sm text-gray-400">
            知識圖譜驅動的學習路徑
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-4">
        <Link
          href="/practice"
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-500"
        >
          開始練習
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-gray-700 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800"
        >
          我的進度
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add apps/web/src/app/profile/ apps/web/src/app/page.tsx
git commit -m "feat: 建立個人檔案頁並更新首頁 — 特色展示與 CTA"
```
