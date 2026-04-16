"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc-client";
import { CodeEditor, type CodeEditorHandle } from "@/components/editor/code-editor";
import { ExecutionResult } from "@/components/submission/execution-result";
import { SubmissionHistory } from "@/components/submission/submission-history";
import { ChatContainer } from "@/components/chat/chat-container";
import { MacWindow } from "@/components/ui/mac-window";
import { ResizableHorizontal, ResizableVertical } from "@/components/ui/resizable-panels";
import { useSubmission } from "@/hooks/use-submission";
import { ProblemListPanel } from "@/components/practice/problem-list-panel";
import { AuthButton } from "@/components/auth-button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PricingModal } from "@/components/pricing-modal";
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
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [language, setLanguage] = useState<Language>("PYTHON");
  const [activeTab, setActiveTab] = useState<LeftTab>("description");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const editorRef = useRef<CodeEditorHandle>(null);
  const [showProblemList, setShowProblemList] = useState(false);
  const [maximized, setMaximized] = useState<"none" | "problem" | "code" | "testcase">("none");
  const [codeFolded, setCodeFolded] = useState(false);
  const [testFolded, setTestFolded] = useState(false);
  const [problemFolded, setProblemFolded] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const { data: problem, isLoading: problemLoading } =
    trpc.problem.getBySlug.useQuery({ slug });

  // All problems for prev/next/random navigation
  const { data: allProblems } = trpc.problem.list.useQuery({});

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

  const currentIndex = allProblems?.findIndex((p) => p.slug === slug) ?? -1;

  const goToPrev = () => {
    if (!allProblems || currentIndex <= 0) return;
    router.push(`/practice/${allProblems[currentIndex - 1].slug}`);
  };

  const goToNext = () => {
    if (!allProblems || currentIndex >= allProblems.length - 1) return;
    router.push(`/practice/${allProblems[currentIndex + 1].slug}`);
  };

  const goToRandom = () => {
    if (!allProblems || allProblems.length === 0) return;
    const candidates = allProblems.filter((p) => p.slug !== slug);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    if (pick) router.push(`/practice/${pick.slug}`);
  };

  // ===== Left Panel Content =====
  const leftPanel = (
    <MacWindow
      title="Problem"
      titleColor="text-gray-400"
      className="h-full"
      folded={problemFolded}
      onFold={() => setProblemFolded(!problemFolded)}
      onMaximize={() => setMaximized(maximized === "problem" ? "none" : "problem")}
    >
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

      <div className="flex-1 overflow-hidden">
        {activeTab === "description" && (
          <div className="h-full overflow-y-auto p-5">
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

        <div className={`h-full flex-col ${activeTab === "ai-tutor" ? "flex" : "hidden"}`}>
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

        {activeTab === "submissions" && (
          <div className="h-full overflow-y-auto">
            <SubmissionHistory problemId={problem.id} />
          </div>
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
      folded={codeFolded}
      onFold={() => setCodeFolded(!codeFolded)}
      onMaximize={() => setMaximized(maximized === "code" ? "none" : "code")}
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
          storageKey={`${slug}-${language}`}
          disabled={isSubmitting}
        />
      </div>
    </MacWindow>
  );

  // ===== Right Bottom: Test Result =====
  const testPanel = (
    <MacWindow
      title="Testcase"
      titleColor="text-green-400"
      className="h-full"
      folded={testFolded}
      onFold={() => setTestFolded(!testFolded)}
      onMaximize={() => setMaximized(maximized === "testcase" ? "none" : "testcase")}
    >
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

  // Maximize overlay
  if (maximized !== "none") {
    const panel = maximized === "problem" ? leftPanel : maximized === "code" ? codePanel : testPanel;
    return (
      <div className="flex h-screen flex-col bg-[#0a0a0f]">
        <div className="flex h-10 items-center justify-between border-b border-gray-800/60 bg-[#1a1a1a] px-4">
          <span className="text-[13px] text-gray-400">Maximized — click □ to restore</span>
          <button
            onClick={() => setMaximized("none")}
            className="rounded px-3 py-1 text-[12px] text-gray-400 hover:bg-[#333] hover:text-white"
          >
            ✕ Exit
          </button>
        </div>
        <div className="flex-1 p-1.5">{panel}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0f]">
      {/* Unified Top Bar — LeetCode style */}
      <div className="flex h-[42px] shrink-0 items-center justify-between border-b border-gray-800/60 bg-[#1a1a1a] px-3">
        {/* Left: Logo + Problem List + Arrows */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[16px] font-bold text-orange-400 hover:text-orange-300">
            S
          </Link>
          <div className="h-4 w-px bg-gray-700" />
          <button
            onClick={() => setShowProblemList(!showProblemList)}
            className="flex items-center gap-1 text-[13px] text-gray-400 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h12v1.5H2zm0 3.25h12v1.5H2zm0 3.25h12V12H2z"/></svg>
            Problem List
          </button>
          <div className="flex items-center gap-0.5 text-gray-600">
            <button
              onClick={goToPrev}
              disabled={currentIndex <= 0}
              className="rounded p-1 hover:bg-[#333] hover:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Previous Problem"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="8,3 4,7 8,11"/></svg>
            </button>
            <button
              onClick={goToNext}
              disabled={!allProblems || currentIndex >= allProblems.length - 1}
              className="rounded p-1 hover:bg-[#333] hover:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Next Problem"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6,3 10,7 6,11"/></svg>
            </button>
            <button
              onClick={goToRandom}
              className="rounded p-1 hover:bg-[#333] hover:text-gray-300"
              title="Random Problem"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 10l3-3 2 2 5-5M9 4h3v3"/></svg>
            </button>
          </div>
        </div>

        {/* Center: Run / Submit */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTopRun}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-[13px] text-gray-300 hover:bg-[#333] disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#4ade80"><polygon points="4,2 14,8 4,14"/></svg>
          </button>
          <button
            onClick={handleTopRun}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded bg-[#2cbb5d]/20 px-3 py-1 text-[13px] font-medium text-[#2cbb5d] hover:bg-[#2cbb5d]/30 disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="2,7 5.5,10.5 12,4"/></svg>
            Submit
          </button>
        </div>

        {/* Right: Nav links + Auth */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPricing(true)}
            className="flex items-center gap-1 rounded bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1.5 text-[12px] font-bold text-white shadow hover:opacity-90 transition-opacity"
          >
            ✨ Upgrade
          </button>
          <div className="h-4 w-px bg-gray-700 mx-1" />
          <Link href="/dashboard" className="text-[12px] text-gray-500 hover:text-gray-300">
            Dashboard
          </Link>
          <Link href="/practice" className="text-[12px] text-gray-500 hover:text-gray-300">
            Problems
          </Link>
          <Link href="/profile" className="text-[12px] text-gray-500 hover:text-gray-300">
            Profile
          </Link>
          <div className="h-4 w-px bg-gray-700" />
          <AuthButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-1.5 min-h-0 overflow-hidden">
        <ResizableHorizontal
          left={leftPanel}
          right={
            <ResizableVertical
              top={codePanel}
              bottom={testPanel}
              defaultRatio={codeFolded ? 0.05 : testFolded ? 0.95 : 0.6}
              minTopHeight={codeFolded ? 36 : 150}
              minBottomHeight={testFolded ? 36 : 100}
            />
          }
          defaultRatio={problemFolded ? 0.03 : 0.45}
          minLeftWidth={problemFolded ? 40 : 350}
          minRightWidth={400}
        />
      </div>

      {/* Problem List Sidebar */}
      {showProblemList && (
        <ProblemListPanel
          currentSlug={slug}
          onClose={() => setShowProblemList(false)}
        />
      )}

      {/* Pricing Modal */}
      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </div>
  );
}
