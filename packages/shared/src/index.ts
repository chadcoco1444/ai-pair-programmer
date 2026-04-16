// ===== 語言 =====
export const LANGUAGES = ["PYTHON", "C", "CPP", "JAVASCRIPT"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_DISPLAY: Record<Language, string> = {
  PYTHON: "Python 3",
  C: "C",
  CPP: "C++",
  JAVASCRIPT: "JavaScript",
};

// ===== 難度 =====
export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD", "EXPERT"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

// ===== 分類 =====
export const CATEGORIES = [
  "ALGORITHM",
  "DATA_STRUCTURE",
  "SYSTEM_DESIGN",
  "SYSTEM_PROGRAMMING",
  "CONCURRENCY",
] as const;
export type Category = (typeof CATEGORIES)[number];

// ===== 使用者等級 =====
export const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;
export type Level = (typeof LEVELS)[number];

// ===== 提交狀態 =====
export const SUBMISSION_STATUSES = [
  "PENDING",
  "RUNNING",
  "ACCEPTED",
  "WRONG_ANSWER",
  "TIME_LIMIT",
  "MEMORY_LIMIT",
  "RUNTIME_ERROR",
  "COMPILE_ERROR",
] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

// ===== SKILL 階段 =====
export const SKILL_PHASES = [
  "SOCRATIC",
  "KNOWLEDGE",
  "ITERATIVE",
  "LOGIC",
  "EVOLUTION",
] as const;
export type SKILLPhase = (typeof SKILL_PHASES)[number];

export const SKILL_PHASE_LABELS: Record<SKILLPhase, string> = {
  SOCRATIC: "S - 蘇格拉底式引導",
  KNOWLEDGE: "K - 知識圖譜連結",
  ITERATIVE: "I - 疊代優化",
  LOGIC: "L1 - 邏輯驗證",
  EVOLUTION: "L2 - 長期演化",
};

// ===== 執行結果 =====
export interface TestResult {
  testCaseId: string;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  runtime: number;
  memory: number;
}

export interface ExecutionResult {
  submissionId: string;
  status: SubmissionStatus;
  testResults: TestResult[];
  totalRuntime: number;
  totalMemory: number;
  compileError?: string;
}
