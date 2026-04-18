import { describe, it, expect } from "vitest";
import { judgeTestCase, judgeSubmission } from "../src/judge";
import type { TestCaseInput, RunResult } from "../src/runners/types";

const makeTestCase = (overrides: Partial<TestCaseInput> = {}): TestCaseInput => ({
  id: "tc-1",
  input: "test input",
  expected: "expected output",
  isHidden: false,
  isKiller: false,
  ...overrides,
});

const makeRunResult = (overrides: Partial<RunResult> = {}): RunResult => ({
  stdout: "expected output",
  stderr: "",
  exitCode: 0,
  runtime: 50,
  memory: 1024,
  timedOut: false,
  oomKilled: false,
  ...overrides,
});

describe("judgeTestCase", () => {
  it("should pass when output is correct", () => {
    const result = judgeTestCase(makeTestCase(), makeRunResult());
    expect(result.passed).toBe(true);
    expect(result.stderr).toBe("");
  });

  it("REGRESSION: should include stderr in result for runtime errors", () => {
    const result = judgeTestCase(
      makeTestCase(),
      makeRunResult({
        stdout: "",
        stderr: "NameError: name 'collections' is not defined",
        exitCode: 1,
      })
    );
    expect(result.passed).toBe(false);
    expect(result.stderr).toContain("NameError");
  });

  it("REGRESSION: order-insensitive array comparison (Word Search II)", () => {
    const result = judgeTestCase(
      makeTestCase({ expected: '["oath","eat"]' }),
      makeRunResult({ stdout: '["eat","oath"]\n' })
    );
    expect(result.passed).toBe(true);
  });

  it("REGRESSION: same elements different order should pass", () => {
    const result = judgeTestCase(
      makeTestCase({ expected: '[1,2,3]' }),
      makeRunResult({ stdout: '[3,1,2]\n' })
    );
    expect(result.passed).toBe(true);
  });

  it("should fail when arrays have different elements", () => {
    const result = judgeTestCase(
      makeTestCase({ expected: '[1,2,3]' }),
      makeRunResult({ stdout: '[1,2,4]\n' })
    );
    expect(result.passed).toBe(false);
  });

  it("should fail when arrays have different lengths", () => {
    const result = judgeTestCase(
      makeTestCase({ expected: '[1,2,3]' }),
      makeRunResult({ stdout: '[1,2]\n' })
    );
    expect(result.passed).toBe(false);
  });

  it("should still do exact match for non-array outputs", () => {
    const result = judgeTestCase(
      makeTestCase({ expected: "true" }),
      makeRunResult({ stdout: "true\n" })
    );
    expect(result.passed).toBe(true);
  });

  it("should fail when output is wrong", () => {
    const result = judgeTestCase(
      makeTestCase(),
      makeRunResult({ stdout: "wrong output" })
    );
    expect(result.passed).toBe(false);
  });

  it("should ignore trailing whitespace", () => {
    const result = judgeTestCase(
      makeTestCase({ expected: "hello\n" }),
      makeRunResult({ stdout: "hello  \n  " })
    );
    expect(result.passed).toBe(true);
  });

  it("should not reveal input/expected for hidden test cases", () => {
    const result = judgeTestCase(
      makeTestCase({ isHidden: true }),
      makeRunResult()
    );
    expect(result.input).toBe("[hidden]");
    expect(result.expected).toBe("[hidden]");
    expect(result.actual).toBe("[correct]");
  });

  it("should show [wrong] when a hidden test case answer is incorrect", () => {
    const result = judgeTestCase(
      makeTestCase({ isHidden: true }),
      makeRunResult({ stdout: "wrong" })
    );
    expect(result.actual).toBe("[wrong]");
  });
});

describe("judgeSubmission", () => {
  it("should be ACCEPTED when all test cases pass", () => {
    const result = judgeSubmission([
      { testCase: makeTestCase(), runResult: makeRunResult() },
      { testCase: makeTestCase({ id: "tc-2" }), runResult: makeRunResult() },
    ]);
    expect(result.status).toBe("ACCEPTED");
  });

  it("should be WRONG_ANSWER when any test case fails", () => {
    const result = judgeSubmission([
      { testCase: makeTestCase(), runResult: makeRunResult() },
      { testCase: makeTestCase({ id: "tc-2" }), runResult: makeRunResult({ stdout: "wrong" }) },
    ]);
    expect(result.status).toBe("WRONG_ANSWER");
  });

  it("timeout should be TIME_LIMIT", () => {
    const result = judgeSubmission([
      { testCase: makeTestCase(), runResult: makeRunResult({ timedOut: true }) },
    ]);
    expect(result.status).toBe("TIME_LIMIT");
  });

  it("OOM should be MEMORY_LIMIT", () => {
    const result = judgeSubmission([
      { testCase: makeTestCase(), runResult: makeRunResult({ oomKilled: true }) },
    ]);
    expect(result.status).toBe("MEMORY_LIMIT");
  });

  it("non-zero exit code should be RUNTIME_ERROR", () => {
    const result = judgeSubmission([
      { testCase: makeTestCase(), runResult: makeRunResult({ exitCode: 1 }) },
    ]);
    expect(result.status).toBe("RUNTIME_ERROR");
  });

  it("compile error should be COMPILE_ERROR", () => {
    const result = judgeSubmission([], "error: undeclared identifier");
    expect(result.status).toBe("COMPILE_ERROR");
    expect(result.compileError).toContain("undeclared identifier");
  });
});
