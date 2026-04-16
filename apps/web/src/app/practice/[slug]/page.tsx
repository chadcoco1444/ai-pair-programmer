"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc-client";
import { CodeEditor, type CodeEditorHandle } from "@/components/editor/code-editor";
import { ExecutionResult } from "@/components/submission/execution-result";
import { SubmissionHistory } from "@/components/submission/submission-history";
import { ChatContainer } from "@/components/chat/chat-container";
import { MacWindow } from "@/components/ui/mac-window";
import { ResizableHorizontal, ResizableVertical } from "@/components/ui/resizable-panels";
import { useSubmission } from "@/hooks/use-submission";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Language } from "@skill/shared";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "PYTHON", label: "Python 3" },
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
  const editorRef = useRef<CodeEditorHandle>(null);

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
            setInitialMessages([{
              id: "initial",
              role: "ASSISTANT",
              content: res.initialMessage,
              skillPhase: res.phase,
            }]);
          }
        });
    }
  }, [activeTab, problem, status]);

  if (problemLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-[#0a0a0f]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-[#0a0a0f]">
        <div className="text-gray-500">Problem not found</div>
      </div>
    );
  }

  const starterCode =
    (problem.starterCode as Record<string, string>)?.[language] ?? "";
  const diffStyle = DIFFICULTY_STYLE[problem.difficulty] ?? { text: "text-gray-400", bg: "bg-gray-400/10" };

  const handleSubmit = async (code: string) => {
    await submit({ problemId: problem.id, language, code });
  };

  const handleTopRun = () => {
    const code = editorRef.current?.getCode() ?? starterCode;
    handleSubmit(code);
  };

  // ===== Left Panel Content =====
  const leftPanel = (
    <MacWindow title="Problem" titleColor="text-gray-400" className="h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-700/50 bg-[#252525]">
        {([
          { key: "description" as LeftTab, label: "Description" },
          { key: "ai-tutor" as LeftTab, label: "AI Tutor" },
          { key: "submissions" as LeftTab, label: "Submissions" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-[13px] font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-blue-400 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "description" && (
          <div className="p-5">
            <h1 className="text-[22px] font-bold leading-tight text-white">
              {problem.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${diffStyle.text} ${diffStyle.bg}`}>
                {problem.difficulty}
              </span>
              {problem.tags.map((t) => (
                <span key={t.tag} className="rounded-full bg-[#333] px-2 py-0.5 text-[11px] text-gray-400">
                  {t.tag}
                </span>
              ))}
            </div>
            <div className="mt-6 text-[14px] leading-[1.85] text-[#eff1f6]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p({ children }) { return <p className="mb-4">{children}</p>; },
                  strong({ children }) { return <strong className="font-bold text-white">{children}</strong>; },
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeStr = String(children).replace(/\n$/, "");
                    if (match || codeStr.includes("\n")) {
                      return (
                        <pre className="my-4 overflow-x-auto rounded-lg border border-gray-700/40 bg-[#0d1117] p-4 text-[13px] leading-[1.7]">
                          <code className="text-[#e6edf3]" {...props}>{children}</code>
                        </pre>
                      );
                    }
                    return (
                      <code className="rounded bg-[#343942] px-1.5 py-0.5 text-[13px] font-mono text-[#e06c75]" {...props}>
                        {children}
                      </code>
                    );
                  },
                  ul({ children }) { return <ul className="mb-4 ml-5 list-disc space-y-1.5">{children}</ul>; },
                  ol({ children }) { return <ol className="mb-4 ml-5 list-decimal space-y-1.5">{children}</ol>; },
                  li({ children }) { return <li className="text-[#eff1f6]">{children}</li>; },
                }}
              >
                {problem.description}
              </ReactMarkdown>
            </div>
            {problem.hints && problem.hints.length > 0 && (
              <div className="mt-6 border-t border-gray-700/40 pt-4">
                <details>
                  <summary className="cursor-pointer text-[13px] font-medium text-blue-400 hover:text-blue-300">
                    Hints ({problem.hints.length})
                  </summary>
                  <div className="mt-3 space-y-2">
                    {problem.hints.map((hint, i) => (
                      <details key={i} className="rounded-lg bg-[#252525] p-3">
                        <summary className="cursor-pointer text-[13px] text-gray-400">Hint {i + 1}</summary>
                        <p className="mt-2 text-[13px] leading-relaxed text-gray-300">{hint}</p>
                      </details>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        )}

        {activeTab === "ai-tutor" && (
          <div className="flex h-full flex-col">
            {status !== "authenticated" ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-gray-500">Please sign in to use AI Tutor</p>
              </div>
            ) : conversationId ? (
              <ChatContainer conversationId={conversationId} initialMessages={initialMessages} />
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-gray-500">Starting AI Tutor...</div>
              </div>
            )}
          </div>
        )}

        {activeTab === "submissions" && (
          <SubmissionHistory problemId={problem.id} />
        )}
      </div>
    </MacWindow>
  );

  // ===== Right Top: Code Editor =====
  const codePanel = (
    <MacWindow
      title={`</> Code — ${LANGUAGES.find((l) => l.value === language)?.label}`}
      titleColor="text-green-400"
      className="h-full"
    >
      <div className="flex items-center bg-[#252525] px-3 py-1.5">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="rounded bg-[#333] px-2 py-1 text-[12px] text-white focus:outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <CodeEditor
          ref={editorRef}
          language={language}
          initialCode={starterCode}
          disabled={isSubmitting}
        />
      </div>
    </MacWindow>
  );

  // ===== Right Bottom: Test Result =====
  const testPanel = (
    <MacWindow title="Testcase" titleColor="text-green-400" className="h-full">
      <div className="flex-1 overflow-y-auto">
        {result ? (
          <ExecutionResult
            status={result.status}
            testResults={result.testResults}
            totalRuntime={result.totalRuntime}
            totalMemory={result.totalMemory}
            compileError={result.compileError}
          />
        ) : (
          <div className="p-3">
            <div className="flex gap-3 text-[12px]">
              <span className="font-medium text-green-400">Testcase</span>
              <span className="text-gray-600">Result</span>
            </div>
            {problem.testCases && problem.testCases.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {problem.testCases.slice(0, 3).map((tc, i) => (
                  <div key={tc.id} className="rounded bg-[#252525] px-3 py-2 text-[11px]">
                    <span className="text-gray-500">Case {i + 1}: </span>
                    <code className="font-mono text-gray-300">
                      {tc.input.slice(0, 70)}{tc.input.length > 70 ? "..." : ""}
                    </code>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MacWindow>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-[#0a0a0f]">
      {/* Top Action Bar */}
      <div className="flex h-10 items-center justify-between border-b border-gray-800/60 bg-[#282828] px-4">
        <div className="flex items-center gap-3">
          <Link href="/practice" className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-white">
            <span>&#9776;</span> Problem List
          </Link>
          <span className="text-gray-600">|</span>
          <span className="text-[13px] font-medium text-white">{problem.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTopRun}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded bg-[#333] px-3.5 py-1.5 text-[12px] font-medium text-gray-200 hover:bg-[#444] disabled:opacity-50"
          >
            <span className="text-green-400">&#9654;</span> Run
          </button>
          <button
            onClick={handleTopRun}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded bg-green-600 px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-green-500 disabled:opacity-50"
          >
            <span>&#9654;</span> Submit
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-1.5">
      <ResizableHorizontal
        left={leftPanel}
        right={
          <ResizableVertical
            top={codePanel}
            bottom={testPanel}
            defaultRatio={0.6}
            minTopHeight={150}
            minBottomHeight={100}
          />
        }
        defaultRatio={0.45}
        minLeftWidth={350}
        minRightWidth={400}
      />
      </div>
    </div>
  );
}
