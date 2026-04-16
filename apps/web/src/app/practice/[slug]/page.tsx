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

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "text-green-400",
  MEDIUM: "text-amber-400",
  HARD: "text-red-400",
  EXPERT: "text-purple-400",
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

  // Start AI conversation when switching to AI Tutor tab
  useEffect(() => {
    if (
      activeTab === "ai-tutor" &&
      problem &&
      !conversationId &&
      status === "authenticated"
    ) {
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
  }, [activeTab, problem, status]);

  if (problemLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
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

  const TAB_CONFIG: { key: LeftTab; label: string; icon: string }[] = [
    { key: "description", label: "Description", icon: "📋" },
    { key: "ai-tutor", label: "AI Tutor", icon: "🤖" },
    { key: "submissions", label: "Submissions", icon: "📊" },
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* ===== Left Panel ===== */}
      <div className="flex w-1/2 flex-col border-r border-gray-800">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-800 bg-gray-900 px-2">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-white text-white"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Description Tab */}
          {activeTab === "description" && (
            <div className="p-6">
              <h1 className="text-xl font-bold">{problem.title}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`text-sm font-medium ${DIFFICULTY_COLORS[problem.difficulty] ?? "text-gray-400"}`}
                >
                  {problem.difficulty}
                </span>
                {problem.tags.map((t) => (
                  <span
                    key={t.tag}
                    className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-300"
                  >
                    {t.tag}
                  </span>
                ))}
              </div>

              <div className="prose prose-invert prose-sm mt-6 max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      if (match) {
                        return (
                          <pre className="overflow-x-auto rounded bg-gray-800 p-3">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        );
                      }
                      return (
                        <code
                          className="rounded bg-gray-800 px-1.5 py-0.5 text-sm text-emerald-400"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {problem.description}
                </ReactMarkdown>
              </div>

              {problem.hints && problem.hints.length > 0 && (
                <details className="mt-8">
                  <summary className="cursor-pointer text-sm font-medium text-blue-400 hover:text-blue-300">
                    Hints ({problem.hints.length})
                  </summary>
                  <div className="mt-3 space-y-2">
                    {problem.hints.map((hint, i) => (
                      <details key={i} className="rounded-lg bg-gray-800/50 p-3">
                        <summary className="cursor-pointer text-sm text-gray-300">
                          Hint {i + 1}
                        </summary>
                        <p className="mt-2 text-sm text-gray-400">{hint}</p>
                      </details>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          {/* AI Tutor Tab */}
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

          {/* Submissions Tab */}
          {activeTab === "submissions" && (
            <div className="p-6 text-sm text-gray-400">
              Submission history coming soon...
            </div>
          )}
        </div>
      </div>

      {/* ===== Right Panel: Code Editor ===== */}
      <div className="flex w-1/2 flex-col">
        {/* Editor Header */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2">
          <span className="text-sm font-medium text-gray-300">Code</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-white"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Editor */}
        <div className="flex-1">
          <CodeEditor
            language={language}
            initialCode={starterCode}
            onSubmit={handleSubmit}
            onRun={handleRun}
            disabled={isSubmitting}
          />
        </div>

        {/* Bottom: Test Results */}
        <div className="border-t border-gray-800">
          {result ? (
            <ExecutionResult
              status={result.status}
              testResults={result.testResults}
              totalRuntime={result.totalRuntime}
              totalMemory={result.totalMemory}
              compileError={result.compileError}
            />
          ) : (
            <div className="bg-gray-900 px-4 py-3">
              <div className="flex gap-4 text-sm">
                <span className="font-medium text-gray-300">Testcase</span>
                <span className="text-gray-500">Test Result</span>
              </div>
              {problem.testCases && problem.testCases.length > 0 && (
                <div className="mt-2 space-y-1">
                  {problem.testCases.slice(0, 3).map((tc, i) => (
                    <div key={tc.id} className="text-xs text-gray-400">
                      <span className="text-gray-500">Case {i + 1}:</span>{" "}
                      <code className="text-gray-300">
                        {tc.input.slice(0, 60)}
                        {tc.input.length > 60 ? "..." : ""}
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
