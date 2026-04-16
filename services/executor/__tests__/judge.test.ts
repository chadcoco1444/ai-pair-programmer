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
  it("輸出正確時應通過", () => {
    const result = judgeTestCase(makeTestCase(), makeRunResult());
    expect(result.passed).toBe(true);
  });

  it("輸出錯誤時應不通過", () => {
    const result = judgeTestCase(
      makeTestCase(),
      makeRunResult({ stdout: "wrong output" })
    );
    expect(result.passed).toBe(false);
  });

  it("應忽略尾部空白", () => {
    const result = judgeTestCase(
      makeTestCase({ expected: "hello\n" }),
      makeRunResult({ stdout: "hello  \n  " })
    );
    expect(result.passed).toBe(true);
  });

  it("隱藏測資不應顯示 input/expected", () => {
    const result = judgeTestCase(
      makeTestCase({ isHidden: true }),
      makeRunResult()
    );
    expect(result.input).toBe("[hidden]");
    expect(result.expected).toBe("[hidden]");
    expect(result.actual).toBe("[correct]");
  });

  it("隱藏測資答案錯誤時應顯示 [wrong]", () => {
    const result = judgeTestCase(
      makeTestCase({ isHidden: true }),
      makeRunResult({ stdout: "wrong" })
    );
    expect(result.actual).toBe("[wrong]");
  });
});

describe("judgeSubmission", () => {
  it("所有測資通過時應為 ACCEPTED", () => {
    const result = judgeSubmission([
      { testCase: makeTestCase(), runResult: makeRunResult() },
      { testCase: makeTestCase({ id: "tc-2" }), runResult: makeRunResult() },
    ]);
    expect(result.status).toBe("ACCEPTED");
  });

  it("有測資不通過時應為 WRONG_ANSWER", () => {
    const result = judgeSubmission([
      { testCase: makeTestCase(), runResult: makeRunResult() },
      { testCase: makeTestCase({ id: "tc-2" }), runResult: makeRunResult({ stdout: "wrong" }) },
    ]);
    expect(result.status).toBe("WRONG_ANSWER");
  });

  it("超時應為 TIME_LIMIT", () => {
    const result = judgeSubmission([
      { testCase: makeTestCase(), runResult: makeRunResult({ timedOut: true }) },
    ]);
    expect(result.status).toBe("TIME_LIMIT");
  });

  it("OOM 應為 MEMORY_LIMIT", () => {
    const result = judgeSubmission([
      { testCase: makeTestCase(), runResult: makeRunResult({ oomKilled: true }) },
    ]);
    expect(result.status).toBe("MEMORY_LIMIT");
  });

  it("非零 exit code 應為 RUNTIME_ERROR", () => {
    const result = judgeSubmission([
      { testCase: makeTestCase(), runResult: makeRunResult({ exitCode: 1 }) },
    ]);
    expect(result.status).toBe("RUNTIME_ERROR");
  });

  it("編譯錯誤應為 COMPILE_ERROR", () => {
    const result = judgeSubmission([], "error: undeclared identifier");
    expect(result.status).toBe("COMPILE_ERROR");
    expect(result.compileError).toContain("undeclared identifier");
  });
});
