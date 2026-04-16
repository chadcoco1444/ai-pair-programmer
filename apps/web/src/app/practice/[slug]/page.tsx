"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
import { CodeEditor } from "@/components/editor/code-editor";
import { ExecutionResult } from "@/components/submission/execution-result";
import { ChatContainer } from "@/components/chat/chat-container";
import { useSubmission } from "@/hooks/use-submission";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Language } from "@skill/shared";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "PYTHON", label: "Python" },
  { value: "C", label: "C" },
  { value: "CPP", label: "C++" },
  { value: "JAVASCRIPT", label: "JavaScript" },
];

const DIFFICULTY_STYLE: Record<string, { text: string; bg: string }> = {
  EASY: { text: "text-emerald-400", bg: "bg-emerald-400/10" },
  MEDIUM: { text: "text-amber-400", bg: "bg-amber-400/10" },
  HARD: { text: "text-red-400", bg: "bg-red-400/10" },
  EXPERT: { text: "text-purple-400", bg: "bg-purple-400/10" },
};

type LeftTab = "description" | "ai-tutor" | "submissions";

export default function PracticePage() {
  const { status } = useSession();
  const params = useParams();
  const slug = params.slug as string;

  const [language, setLanguage] = useState<Language>("PYTHON");
  const [activeTab, setActiveTab] = useState<LeftTab>("description");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);

  const { data: problem, isLoading: problemLoading } =
    trpc.problem.getBySlug.useQuery({ slug });

  const startConversation = trpc.conversation.start.useMutation();
  const { submit, isSubmitting, result } = useSubmission();

  useEffect(() => {
    if (
      activeTab === "ai-tutor" &&
      problem &&
      !conversationId &&
      status === "authenticated"
    ) {
      startConversation
        .mutateAsync({ problemId: problem.id, mode: "GUIDED_PRACTICE" })
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
  }, [activeTab, problem, status]);

  if (problemLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-[#1a1a2e]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-[#1a1a2e]">
        <div className="text-gray-400">Problem not found</div>
      </div>
    );
  }

  const starterCode =
    (problem.starterCode as Record<string, string>)?.[language] ?? "";

  const handleSubmit = async (code: string) => {
    await submit({ problemId: problem.id, language, code });
  };

  const handleRun = async (code: string) => {
    await submit({ problemId: problem.id, language, code });
  };

  const diffStyle = DIFFICULTY_STYLE[problem.difficulty] ?? { text: "text-gray-400", bg: "bg-gray-400/10" };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#1a1a2e]">
      {/* ===== Left Panel ===== */}
      <div className="flex w-1/2 flex-col border-r border-gray-800/60">
        {/* Tabs */}
        <div className="flex items-center border-b border-gray-800/60 bg-[#282828]">
          {([
            { key: "description" as LeftTab, label: "Description" },
            { key: "ai-tutor" as LeftTab, label: "AI Tutor" },
            { key: "submissions" as LeftTab, label: "Submissions" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-white text-white"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto bg-[#1a1a2e]">
          {/* Description */}
          {activeTab === "description" && (
            <div className="p-5">
              {/* Title */}
              <h1 className="text-[22px] font-semibold leading-tight text-white">
                {problem.title}
              </h1>

              {/* Difficulty + Tags */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${diffStyle.text} ${diffStyle.bg}`}>
                  {problem.difficulty}
                </span>
                {problem.tags.map((t) => (
                  <span
                    key={t.tag}
                    className="rounded-full bg-gray-700/40 px-2.5 py-1 text-xs text-gray-400"
                  >
                    {t.tag}
                  </span>
                ))}
              </div>

              {/* Problem Description - LeetCode Style */}
              <div className="leetcode-description mt-6 text-[14px] leading-[1.8] text-gray-300">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p({ children }) {
                      return <p className="mb-4">{children}</p>;
                    },
                    strong({ children }) {
                      return <strong className="font-semibold text-white">{children}</strong>;
                    },
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const codeStr = String(children).replace(/\n$/, "");

                      // Code block
                      if (match || codeStr.includes("\n")) {
                        return (
                          <pre className="my-4 overflow-x-auto rounded-lg bg-[#282828] p-4 text-[13px] leading-[1.6]">
                            <code className="text-gray-300" {...props}>
                              {children}
                            </code>
                          </pre>
                        );
                      }

                      // Inline code
                      return (
                        <code
                          className="rounded bg-gray-700/60 px-1.5 py-0.5 text-[13px] font-mono text-rose-300"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    ul({ children }) {
                      return <ul className="mb-4 ml-5 list-disc space-y-1">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="mb-4 ml-5 list-decimal space-y-1">{children}</ol>;
                    },
                    li({ children }) {
                      return <li className="text-gray-300">{children}</li>;
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="my-3 border-l-2 border-gray-600 pl-4 text-gray-400">
                          {children}
                        </blockquote>
                      );
                    },
                  }}
                >
                  {problem.description}
                </ReactMarkdown>
              </div>

              {/* Hints */}
              {problem.hints && problem.hints.length > 0 && (
                <div className="mt-6 border-t border-gray-800/60 pt-4">
                  <details>
                    <summary className="cursor-pointer text-[13px] font-medium text-gray-400 hover:text-gray-200">
                      Hints ({problem.hints.length})
                    </summary>
                    <div className="mt-3 space-y-2">
                      {problem.hints.map((hint, i) => (
                        <details key={i} className="rounded-lg bg-[#282828] p-3">
                          <summary className="cursor-pointer text-[13px] text-gray-400 hover:text-gray-200">
                            Hint {i + 1}
                          </summary>
                          <p className="mt-2 text-[13px] leading-relaxed text-gray-300">{hint}</p>
                        </details>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}

          {/* AI Tutor */}
          {activeTab === "ai-tutor" && (
            <div className="flex h-full flex-col">
              {status !== "authenticated" ? (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-gray-400">Please sign in to use AI Tutor</p>
                </div>
              ) : conversationId ? (
                <ChatContainer
                  conversationId={conversationId}
                  initialMessages={initialMessages}
                />
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <div className="text-gray-400">Starting AI Tutor...</div>
                </div>
              )}
            </div>
          )}

          {/* Submissions */}
          {activeTab === "submissions" && (
            <div className="p-5 text-sm text-gray-500">
              No submissions yet. Submit your solution to see results here.
            </div>
          )}
        </div>
      </div>

      {/* ===== Right Panel: Code Editor ===== */}
      <div className="flex w-1/2 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800/60 bg-[#282828] px-4 py-2">
          <span className="text-[13px] font-medium text-green-400">&lt;/&gt; Code</span>
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="rounded border border-gray-700 bg-[#333] px-2 py-1 text-[13px] text-white focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-[#1e1e1e]">
          <CodeEditor
            language={language}
            initialCode={starterCode}
            onSubmit={handleSubmit}
            onRun={handleRun}
            disabled={isSubmitting}
          />
        </div>

        {/* Bottom: Test Results */}
        <div className="border-t border-gray-800/60">
          {result ? (
            <ExecutionResult
              status={result.status}
              testResults={result.testResults}
              totalRuntime={result.totalRuntime}
              totalMemory={result.totalMemory}
              compileError={result.compileError}
            />
          ) : (
            <div className="bg-[#282828] px-4 py-3">
              <div className="flex gap-4 text-[13px]">
                <span className="font-medium text-green-400">Testcase</span>
                <span className="text-gray-500">Test Result</span>
              </div>
              {problem.testCases && problem.testCases.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {problem.testCases.slice(0, 3).map((tc, i) => (
                    <div key={tc.id} className="rounded bg-[#333] px-3 py-2 text-[12px]">
                      <span className="text-gray-500">Case {i + 1}: </span>
                      <code className="font-mono text-gray-300">
                        {tc.input.slice(0, 80)}{tc.input.length > 80 ? "..." : ""}
                      </code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
