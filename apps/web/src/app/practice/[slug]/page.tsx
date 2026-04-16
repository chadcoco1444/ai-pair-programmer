"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  const { status } = useSession();
  const params = useParams();
  const slug = params.slug as string;

  const [language, setLanguage] = useState<Language>("PYTHON");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);

  const { data: problem, isLoading: problemLoading } =
    trpc.problem.getBySlug.useQuery({ slug });

  const startConversation = trpc.conversation.start.useMutation();
  const { submit, isSubmitting, result } = useSubmission();

  // 開始對話（需要登入）
  useEffect(() => {
    if (problem && !conversationId && status === "authenticated") {
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
