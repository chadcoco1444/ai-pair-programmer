import type { TestCaseInput, TestCaseResult, JudgeResult, RunResult } from "./runners/types";

function normalizeOutput(output: string): string {
  return output.trim().replace(/\r\n/g, "\n");
}

export function judgeTestCase(
  testCase: TestCaseInput,
  runResult: RunResult
): TestCaseResult {
  const actual = normalizeOutput(runResult.stdout);
  const expected = normalizeOutput(testCase.expected);

  return {
    testCaseId: testCase.id,
    passed: actual === expected,
    input: testCase.isHidden ? "[hidden]" : testCase.input,
    expected: testCase.isHidden ? "[hidden]" : testCase.expected,
    actual: testCase.isHidden ? (actual === expected ? "[correct]" : "[wrong]") : actual,
    stderr: runResult.stderr || "",
    runtime: runResult.runtime,
    memory: runResult.memory,
  };
}

export function judgeSubmission(
  testCaseResults: { testCase: TestCaseInput; runResult: RunResult }[],
  compileError?: string
): JudgeResult {
  if (compileError) {
    return {
      status: "COMPILE_ERROR",
      testResults: [],
      totalRuntime: 0,
      totalMemory: 0,
      compileError,
    };
  }

  const results: TestCaseResult[] = [];
  let totalRuntime = 0;
  let totalMemory = 0;
  let status: JudgeResult["status"] = "ACCEPTED";

  for (const { testCase, runResult } of testCaseResults) {
    const result = judgeTestCase(testCase, runResult);
    results.push(result);
    totalRuntime += result.runtime;
    totalMemory = Math.max(totalMemory, result.memory);

    if (runResult.timedOut) {
      status = "TIME_LIMIT";
      break;
    }
    if (runResult.oomKilled) {
      status = "MEMORY_LIMIT";
      break;
    }
    if (runResult.exitCode !== 0) {
      status = "RUNTIME_ERROR";
      break;
    }
    if (!result.passed) {
      status = "WRONG_ANSWER";
    }
  }

  return { status, testResults: results, totalRuntime, totalMemory };
}
