import { describe, it, expect } from "vitest";
import {
  buildSKILLPrompt,
  detectPhaseTransition,
  type SKILLPhase,
} from "@/server/services/skill-prompts";

describe("buildSKILLPrompt", () => {
  it("should include the base system role", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "BEGINNER", weaknesses: [], conceptMastery: [] },
    });

    expect(prompt).toContain("programming mentor");
    expect(prompt).toContain("SKILL");
    expect(prompt).toContain("Never provide a complete code solution");
  });

  it("should include the rules for the corresponding phase", () => {
    const prompt = buildSKILLPrompt({
      phase: "ITERATIVE",
      student: { level: "INTERMEDIATE", weaknesses: [], conceptMastery: [] },
    });

    expect(prompt).toContain("Iterative optimization");
    expect(prompt).toContain("brute force");
    expect(prompt).toContain("bottleneck");
  });

  it("should adjust language to the student's level", () => {
    const beginner = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "BEGINNER", weaknesses: [], conceptMastery: [] },
    });

    const expert = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "EXPERT", weaknesses: [], conceptMastery: [] },
    });

    expect(beginner).toContain("Beginner");
    expect(expert).toContain("Expert");
  });

  it("should include weakness information", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: {
        level: "INTERMEDIATE",
        weaknesses: ["off-by-one", "missing-base-case"],
        conceptMastery: [],
      },
    });

    expect(prompt).toContain("off-by-one");
    expect(prompt).toContain("missing-base-case");
  });

  it("should include problem info", () => {
    const prompt = buildSKILLPrompt({
      phase: "KNOWLEDGE",
      student: { level: "ADVANCED", weaknesses: [], conceptMastery: [] },
      problem: {
        title: "Two Sum",
        category: "ALGORITHM",
        difficulty: "EASY",
        description: "Find two numbers that sum to the target",
        concepts: ["Array", "Hash Table"],
        hints: ["Use a hash map"],
      },
    });

    expect(prompt).toContain("Two Sum");
    expect(prompt).toContain("Array");
    expect(prompt).toContain("Hash Table");
  });
});

describe("detectPhaseTransition", () => {
  it("ACCEPTED should transition to EVOLUTION", () => {
    const phase = detectPhaseTransition("LOGIC", "result is in", "ACCEPTED");
    expect(phase).toBe("EVOLUTION");
  });

  it("WRONG_ANSWER should transition to ITERATIVE", () => {
    const phase = detectPhaseTransition("LOGIC", "a test case failed", "WRONG_ANSWER");
    expect(phase).toBe("ITERATIVE");
  });

  it("TIME_LIMIT should transition to ITERATIVE", () => {
    const phase = detectPhaseTransition("LOGIC", "timed out", "TIME_LIMIT");
    expect(phase).toBe("ITERATIVE");
  });

  it("should move SOCRATIC to KNOWLEDGE when student proposes a solution", () => {
    const phase = detectPhaseTransition("SOCRATIC", "I want to use a hash map to solve it", undefined);
    expect(phase).toBe("KNOWLEDGE");
  });

  it("should move KNOWLEDGE to ITERATIVE when student writes code", () => {
    const phase = detectPhaseTransition("KNOWLEDGE", "I wrote a function", undefined);
    expect(phase).toBe("ITERATIVE");
  });

  it("should move ITERATIVE to LOGIC when student wants to submit", () => {
    const phase = detectPhaseTransition("ITERATIVE", "I think I'm done, ready to submit", undefined);
    expect(phase).toBe("LOGIC");
  });

  it("should keep the current phase when nothing matches", () => {
    const phase = detectPhaseTransition("SOCRATIC", "hello", undefined);
    expect(phase).toBe("SOCRATIC");
  });
});
