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
  ACCEPTED: { label: "Accepted", color: "text-green-400" },
  WRONG_ANSWER: { label: "Wrong Answer", color: "text-red-400" },
  TIME_LIMIT: { label: "Time Limit Exceeded", color: "text-yellow-400" },
  MEMORY_LIMIT: { label: "Memory Limit Exceeded", color: "text-yellow-400" },
  RUNTIME_ERROR: { label: "Runtime Error", color: "text-red-400" },
  COMPILE_ERROR: { label: "Compile Error", color: "text-red-400" },
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
    <div className="rounded-lg bg-[#1e1e1e]">
      <div className="flex items-center justify-between border-b border-gray-700/40 px-4 py-3">
        <span className={`text-[14px] font-semibold ${config.color}`}>{config.label}</span>
        <span className="text-[12px] text-gray-500">
          {totalRuntime}ms | {(totalMemory / 1024).toFixed(1)}MB
        </span>
      </div>

      {compileError && (
        <pre className="overflow-x-auto p-4 text-[13px] text-red-400">{compileError}</pre>
      )}

      {testResults.length > 0 && (
        <div className="divide-y divide-gray-700/30">
          {testResults.map((tr, i) => (
            <div key={tr.testCaseId} className="px-4 py-2.5 text-[13px]">
              <div className="flex items-center gap-2">
                <span>{tr.passed ? "✅" : "❌"}</span>
                <span className="text-gray-300">Case {i + 1}</span>
                <span className="text-[11px] text-gray-500">{tr.runtime}ms</span>
              </div>
              {!tr.passed && tr.input !== "[隱藏]" && (
                <div className="mt-1.5 space-y-1 pl-6 text-[12px] text-gray-400">
                  <div>Input: <code className="font-mono text-gray-300">{tr.input}</code></div>
                  <div>Expected: <code className="font-mono text-green-400">{tr.expected}</code></div>
                  <div>Output: <code className="font-mono text-red-400">{tr.actual}</code></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
