import type { TestCaseInput, TestCaseResult, JudgeResult, RunResult } from "./runners/types";

function normalizeOutput(output: string): string {
  return output.trim().replace(/\r\n/g, "\n");
}

/**
 * Compare two values, handling order-insensitive arrays.
 * If both values are JSON arrays, compare sorted versions.
 * Otherwise, compare as strings.
 */
function deepSort(val: any): any {
  if (!Array.isArray(val)) return val;
  const sorted = val.map(deepSort);
  sorted.sort((a: any, b: any) => JSON.stringify(a) < JSON.stringify(b) ? -1 : 1);
  return sorted;
}

function compareOutput(actual: string, expected: string): boolean {
  if (actual === expected) return true;

  // Try order-insensitive array comparison (deep sort for nested arrays)
  try {
    const a = JSON.parse(actual);
    const e = JSON.parse(expected);
    if (Array.isArray(a) && Array.isArray(e)) {
      if (a.length !== e.length) return false;
      return JSON.stringify(deepSort(a)) === JSON.stringify(deepSort(e));
    }
  } catch {
    // Not JSON, fall through to string comparison
  }

  return false;
}

export function judgeTestCase(
  testCase: TestCaseInput,
  runResult: RunResult
): TestCaseResult {
  const actual = normalizeOutput(runResult.stdout);
  const expected = normalizeOutput(testCase.expected);
  const passed = compareOutput(actual, expected);

  return {
    testCaseId: testCase.id,
    passed,
    input: testCase.isHidden ? "[hidden]" : testCase.input,
    expected: testCase.isHidden ? "[hidden]" : testCase.expected,
    actual: testCase.isHidden ? (passed ? "[correct]" : "[wrong]") : actual,
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
