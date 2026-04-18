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
import { ExampleVisualizations } from "@/components/practice/ExampleVisualizations";
import type { Language } from "@skill/shared";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "PYTHON", label: "Python 3" },
  { value: "C", label: "C" },
  { value: "CPP", label: "C++" },
  { value: "JAVASCRIPT", label: "JavaScript" },
];

const DIFFICULTY_BADGE: Record<string, string> = {
  EASY: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
  MEDIUM: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  HARD: "bg-red-500/10 text-red-400 border border-red-500/30",
  EXPERT: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
};

type LeftTab = "description" | "ai-tutor" | "submissions";

// Heroicon outline helpers ---------------------------------------------------
function ChevronLeftIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function ShuffleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 3h5v5M21 3l-7 7M21 21h-5v-5M3 21h5v-5M3 3l6 6"
      />
    </svg>
  );
}

function ListIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
      />
    </svg>
  );
}

function PlayIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function SparkleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
      />
    </svg>
  );
}

function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

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
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-900">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-900">
        <div className="text-slate-500 text-sm">Problem not found</div>
      </div>
    );
  }

  const starterCode =
    (problem.starterCode as Record<string, string>)?.[language] ?? "";
  const diffClass =
    DIFFICULTY_BADGE[problem.difficulty] ??
    "bg-slate-700/50 text-slate-400";

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
      titleColor="text-slate-400"
      className="h-full"
      folded={problemFolded}
      onFold={() => setProblemFolded(!problemFolded)}
      onMaximize={() => setMaximized(maximized === "problem" ? "none" : "problem")}
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-800/50">
        {([
          { key: "description" as LeftTab, label: "Description" },
          { key: "ai-tutor" as LeftTab, label: "AI Tutor" },
          { key: "submissions" as LeftTab, label: "Submissions" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`cursor-pointer px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.key
                ? "border-b-2 border-emerald-400 text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "description" && (
          <div className="h-full overflow-y-auto p-6">
            <h1 className="font-mono text-2xl font-bold leading-tight text-white">
              {problem.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${diffClass}`}
              >
                {problem.difficulty}
              </span>
              {problem.tags.map((t) => (
                <span
                  key={t.tag}
                  className="rounded-full bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 text-xs"
                >
                  {t.tag}
                </span>
              ))}
            </div>
            <div className="mt-6 text-[14px] leading-[1.85] text-slate-300">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p({ children }) {
                    return <p className="mb-4 text-slate-300">{children}</p>;
                  },
                  strong({ children }) {
                    return <strong className="font-semibold text-white">{children}</strong>;
                  },
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeStr = String(children).replace(/\n$/, "");
                    if (match || codeStr.includes("\n")) {
                      return (
                        <pre className="my-4 overflow-x-auto rounded-md border border-slate-800 bg-slate-950 p-4 text-[13px] leading-[1.7]">
                          <code className="font-mono text-slate-200" {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    }
                    return (
                      <code
                        className="rounded bg-slate-800/50 px-1.5 py-0.5 text-[13px] font-mono text-emerald-400"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  ul({ children }) {
                    return <ul className="mb-4 ml-5 list-disc space-y-1.5 text-slate-300">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="mb-4 ml-5 list-decimal space-y-1.5 text-slate-300">{children}</ol>;
                  },
                  li({ children }) {
                    return <li className="text-slate-300">{children}</li>;
                  },
                  h2({ children }) {
                    return <h2 className="font-mono text-lg font-semibold text-white mt-6 mb-3">{children}</h2>;
                  },
                  h3({ children }) {
                    return <h3 className="font-mono text-base font-semibold text-white mt-5 mb-2">{children}</h3>;
                  },
                }}
              >
                {problem.description}
              </ReactMarkdown>
            </div>
            {problem.testCases && problem.testCases.length > 0 && (
              <ExampleVisualizations testCases={problem.testCases} />
            )}
            {problem.hints && problem.hints.length > 0 && (
              <div className="mt-6 border-t border-slate-800 pt-4">
                <details>
                  <summary className="cursor-pointer text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-200">
                    Hints ({problem.hints.length})
                  </summary>
                  <div className="mt-3 space-y-2">
                    {problem.hints.map((hint, i) => (
                      <details
                        key={i}
                        className="rounded-md bg-slate-800/50 border border-slate-800 p-3"
                      >
                        <summary className="cursor-pointer text-sm text-slate-400">
                          Hint {i + 1}
                        </summary>
                        <p className="mt-2 text-sm leading-relaxed text-slate-300">
                          {hint}
                        </p>
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
              <p className="text-slate-500 text-sm">Please sign in to use AI Tutor</p>
            </div>
          ) : conversationId ? (
            <ChatContainer
              conversationId={conversationId}
              initialMessages={initialMessages}
              getCurrentCode={() => editorRef.current?.getCode() ?? ""}
              currentLanguage={language.toLowerCase()}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-slate-500 text-sm">Starting AI Tutor...</div>
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
      title={`Code — ${LANGUAGES.find((l) => l.value === language)?.label}`}
      titleColor="text-emerald-400"
      className="h-full"
      folded={codeFolded}
      onFold={() => setCodeFolded(!codeFolded)}
      onMaximize={() => setMaximized(maximized === "code" ? "none" : "code")}
    >
      <div className="flex items-center gap-2 bg-slate-800/50 border-b border-slate-800 px-3 py-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="cursor-pointer rounded-md bg-slate-800 text-sm text-slate-100 px-2 py-1 border border-slate-700 hover:border-slate-600 focus:outline-none focus:border-emerald-500 transition-colors duration-200"
          aria-label="Select language"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <span className="font-mono text-xs text-slate-500 ml-auto">vs-dark</span>
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
      titleColor="text-emerald-400"
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
          <div className="p-4">
            <div className="flex gap-3 text-xs font-mono uppercase tracking-wide">
              <span className="font-semibold text-emerald-400">Testcase</span>
              <span className="text-slate-600">Result</span>
            </div>
            {problem.testCases && problem.testCases.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {problem.testCases.slice(0, 3).map((tc, i) => (
                  <div
                    key={tc.id}
                    className="rounded-md bg-slate-800/50 border border-slate-800 px-3 py-2 text-xs"
                  >
                    <span className="text-slate-500 font-mono">
                      Case {i + 1}:{" "}
                    </span>
                    <code className="font-mono text-slate-300">
                      {tc.input.slice(0, 70)}
                      {tc.input.length > 70 ? "..." : ""}
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
      <div className="flex h-screen flex-col bg-slate-900">
        <div className="flex h-10 items-center justify-between border-b border-slate-800 bg-slate-800/50 px-4">
          <span className="text-sm text-slate-400">
            Maximized — click restore to return
          </span>
          <button
            onClick={() => setMaximized("none")}
            className="cursor-pointer rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 px-3 py-1 text-xs transition-colors duration-200 inline-flex items-center gap-1"
            aria-label="Exit maximized view"
          >
            <XIcon className="w-3.5 h-3.5" />
            Exit
          </button>
        </div>
        <div className="flex-1 p-1.5">{panel}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-900">
      {/* Unified Top Bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-800/50 px-3">
        {/* Left: Back + Problem List + Arrows + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/practice"
            className="cursor-pointer inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors duration-200"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back
          </Link>
          <div className="h-4 w-px bg-slate-700" />
          <button
            onClick={() => setShowProblemList(!showProblemList)}
            className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors duration-200"
            aria-label="Toggle problem list"
          >
            <ListIcon className="w-4 h-4" />
            List
          </button>
          <div className="flex items-center gap-0.5">
            <button
              onClick={goToPrev}
              disabled={currentIndex <= 0}
              className="cursor-pointer rounded-md p-1 text-slate-500 hover:bg-slate-700 hover:text-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-200"
              title="Previous problem"
              aria-label="Previous problem"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button
              onClick={goToNext}
              disabled={!allProblems || currentIndex >= allProblems.length - 1}
              className="cursor-pointer rounded-md p-1 text-slate-500 hover:bg-slate-700 hover:text-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-200"
              title="Next problem"
              aria-label="Next problem"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
            <button
              onClick={goToRandom}
              className="cursor-pointer rounded-md p-1 text-slate-500 hover:bg-slate-700 hover:text-slate-100 transition-colors duration-200"
              title="Random problem"
              aria-label="Random problem"
            >
              <ShuffleIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2 min-w-0 ml-2">
            <span className="font-mono font-semibold text-sm text-white truncate">
              {problem.title}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${diffClass}`}
            >
              {problem.difficulty}
            </span>
          </div>
        </div>

        {/* Center: Run / Submit */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTopRun}
            disabled={isSubmitting}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 px-3 py-1.5 text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Run"
          >
            <PlayIcon className="w-4 h-4 text-emerald-400" />
            Run
          </button>
          <button
            onClick={handleTopRun}
            disabled={isSubmitting}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-md bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="w-4 h-4" />
            Submit
          </button>
        </div>

        {/* Right: Nav + Auth */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPricing(true)}
            className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 text-xs font-medium hover:bg-emerald-500/20 transition-colors duration-200"
          >
            <SparkleIcon className="w-3.5 h-3.5" />
            Upgrade
          </button>
          <div className="hidden md:flex items-center gap-3">
            <div className="h-4 w-px bg-slate-700" />
            <Link
              href="/dashboard"
              className="cursor-pointer text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              href="/practice"
              className="cursor-pointer text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200"
            >
              Problems
            </Link>
            <Link
              href="/profile"
              className="cursor-pointer text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200"
            >
              Profile
            </Link>
          </div>
          <div className="h-4 w-px bg-slate-700" />
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
