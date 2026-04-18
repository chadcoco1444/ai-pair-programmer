// ===== Languages =====
export const LANGUAGES = ["PYTHON", "C", "CPP", "JAVASCRIPT"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_DISPLAY: Record<Language, string> = {
  PYTHON: "Python 3",
  C: "C",
  CPP: "C++",
  JAVASCRIPT: "JavaScript",
};

// ===== Difficulty =====
export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD", "EXPERT"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

// ===== Categories =====
export const CATEGORIES = [
  "ALGORITHM",
  "DATA_STRUCTURE",
  "SYSTEM_DESIGN",
  "SYSTEM_PROGRAMMING",
  "CONCURRENCY",
] as const;
export type Category = (typeof CATEGORIES)[number];

// ===== User levels =====
export const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;
export type Level = (typeof LEVELS)[number];

// ===== Submission status =====
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

// ===== SKILL phases =====
export const SKILL_PHASES = [
  "SOCRATIC",
  "KNOWLEDGE",
  "ITERATIVE",
  "LOGIC",
  "EVOLUTION",
] as const;
export type SKILLPhase = (typeof SKILL_PHASES)[number];

export const SKILL_PHASE_LABELS: Record<SKILLPhase, string> = {
  SOCRATIC: "S - Socratic guidance",
  KNOWLEDGE: "K - Knowledge graph linking",
  ITERATIVE: "I - Iterative optimization",
  LOGIC: "L1 - Logic verification",
  EVOLUTION: "L2 - Long-term evolution",
};

// ===== Execution results =====
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
