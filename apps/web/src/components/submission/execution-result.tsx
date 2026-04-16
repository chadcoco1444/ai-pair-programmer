"use client";

import { useState } from "react";

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
  ACCEPTED: { label: "Accepted", color: "text-green-500" },
  WRONG_ANSWER: { label: "Wrong Answer", color: "text-red-500" },
  TIME_LIMIT: { label: "Time Limit Exceeded", color: "text-yellow-500" },
  MEMORY_LIMIT: { label: "Memory Limit Exceeded", color: "text-yellow-500" },
  RUNTIME_ERROR: { label: "Runtime Error", color: "text-red-500" },
  COMPILE_ERROR: { label: "Compile Error", color: "text-red-500" },
};

export function ExecutionResult({
  status,
  testResults,
  totalRuntime,
  totalMemory,
  compileError,
}: ExecutionResultProps) {
  const [selectedCase, setSelectedCase] = useState(0);
  const config = STATUS_CONFIG[status] ?? { label: status, color: "text-gray-400" };

  const currentResult = testResults[selectedCase];

  return (
    <div className="bg-[#1e1e1e]">
      {/* Header: Status + Runtime */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <span className={`text-[18px] font-bold ${config.color}`}>
          {config.label}
        </span>
        <span className="text-[13px] text-gray-500">
          Runtime: {totalRuntime} ms
        </span>
      </div>

      {/* Compile Error */}
      {compileError && (
        <pre className="mx-4 mb-3 overflow-x-auto rounded-lg bg-[#282828] p-3 text-[13px] text-red-400">
          {compileError}
        </pre>
      )}

      {/* Case Tabs */}
      {testResults.length > 0 && (
        <>
          <div className="flex items-center gap-1 px-4 pb-3">
            {testResults.map((tr, i) => (
              <button
                key={tr.testCaseId}
                onClick={() => setSelectedCase(i)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium transition-colors ${
                  selectedCase === i
                    ? "bg-[#333] text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <span className={`text-[10px] ${tr.passed ? "text-green-500" : "text-red-500"}`}>
                  {tr.passed ? "✅" : "❌"}
                </span>
                Case {i + 1}
              </button>
            ))}
          </div>

          {/* Selected Case Detail */}
          {currentResult && (
            <div className="space-y-3 px-4 pb-4">
              {/* Input */}
              <div>
                <div className="mb-1.5 text-[12px] font-medium text-gray-500">Input</div>
                <div className="rounded-lg bg-[#282828] px-4 py-3">
                  <pre className="text-[14px] font-mono text-white whitespace-pre-wrap">
                    {currentResult.input}
                  </pre>
                </div>
              </div>

              {/* Output */}
              <div>
                <div className="mb-1.5 text-[12px] font-medium text-gray-500">Output</div>
                <div className="rounded-lg bg-[#282828] px-4 py-3">
                  <pre className={`text-[14px] font-mono whitespace-pre-wrap ${currentResult.passed ? "text-green-400" : "text-red-400"}`}>
                    {currentResult.actual || "(empty)"}
                  </pre>
                </div>
              </div>

              {/* Expected */}
              <div>
                <div className="mb-1.5 text-[12px] font-medium text-gray-500">Expected</div>
                <div className="rounded-lg bg-[#282828] px-4 py-3">
                  <pre className="text-[14px] font-mono text-green-400 whitespace-pre-wrap">
                    {currentResult.expected}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
