export interface RunConfig {
  language: "PYTHON" | "C" | "CPP" | "JAVASCRIPT";
  code: string;
  input: string;
  args: any[];
  timeout: number;  // 毫秒
  memoryLimit: number;  // MB
}

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  runtime: number;   // 毫秒
  memory: number;    // KB
  timedOut: boolean;
  oomKilled: boolean;
}

export interface TestCaseInput {
  id: string;
  input: string;
  args: any[];
  expected: string;
  isHidden: boolean;
  isKiller: boolean;
}

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  stderr: string;
  runtime: number;
  memory: number;
}

export type SubmissionStatus =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT"
  | "MEMORY_LIMIT"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR";

export interface JudgeResult {
  status: SubmissionStatus;
  testResults: TestCaseResult[];
  totalRuntime: number;
  totalMemory: number;
  compileError?: string;
}

export const LANGUAGE_CONFIG = {
  PYTHON: {
    image: "skill-runner-python",
    extension: ".py",
    needsCompile: false,
    compileCmd: null,
    runCmd: (file: string) => `python3 ${file}`,
  },
  C: {
    image: "skill-runner-c-cpp",
    extension: ".c",
    needsCompile: true,
    compileCmd: (file: string) => `gcc -O2 -Wall -pthread -lm -o /tmp/solution ${file}`,
    runCmd: () => "/tmp/solution",
  },
  CPP: {
    image: "skill-runner-c-cpp",
    extension: ".cpp",
    needsCompile: true,
    compileCmd: (file: string) => `g++ -O2 -std=c++20 -Wall -pthread -o /tmp/solution ${file}`,
    runCmd: () => "/tmp/solution",
  },
  JAVASCRIPT: {
    image: "skill-runner-javascript",
    extension: ".js",
    needsCompile: false,
    compileCmd: null,
    runCmd: (file: string) => `node ${file}`,
  },
} as const;
