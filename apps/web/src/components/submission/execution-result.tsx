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
