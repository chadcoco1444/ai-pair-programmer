"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
import { CodeEditor } from "@/components/editor/code-editor";
import { ExecutionResult } from "@/components/submission/execution-result";
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

type Tab = "description" | "submissions";

export default function PracticePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [language, setLanguage] = useState<Language>("PYTHON");
  const [activeTab, setActiveTab] = useState<Tab>("description");

  const { data: problem, isLoading: problemLoading } =
    trpc.problem.getBySlug.useQuery({ slug });

  const { submit, isSubmitting, result } = useSubmission();

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
    await submit({
      problemId: problem.id,
      language,
      code,
    });
  };

  const handleRun = async (code: string) => {
    await submit({
      problemId: problem.id,
      language,
      code,
    });
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* ===== Left Panel: Problem Description ===== */}
      <div className="flex w-1/2 flex-col border-r border-gray-800">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-800 bg-gray-900 px-4">
          {(["description", "submissions"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-white text-white"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab === "description" ? "Description" : "Submissions"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "description" && (
            <div>
              {/* Title */}
              <h1 className="text-xl font-bold">{problem.title}</h1>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`text-sm font-medium ${DIFFICULTY_COLORS[problem.difficulty] ?? "text-gray-400"}`}>
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

              {/* Description */}
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
                        <code className="rounded bg-gray-800 px-1.5 py-0.5 text-sm text-emerald-400" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {problem.description}
                </ReactMarkdown>
              </div>

              {/* Hints (collapsible) */}
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

          {activeTab === "submissions" && (
            <div className="text-sm text-gray-400">
              Submission history coming soon...
            </div>
          )}
        </div>
      </div>

      {/* ===== Right Panel: Code Editor ===== */}
      <div className="flex w-1/2 flex-col">
        {/* Editor Header */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">Code</span>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Bottom Panel: Test Results */}
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
                      <code className="text-gray-300">{tc.input.slice(0, 60)}{tc.input.length > 60 ? "..." : ""}</code>
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
