import { describe, it, expect } from "vitest";
import { buildSKILLPrompt } from "@/server/services/skill-prompts";

const problem = {
  title: "Two Sum",
  category: "ARRAY",
  difficulty: "EASY",
  description: "Given an array and a target, return indices of two numbers that sum to target.",
  concepts: ["Array", "Hash Table"],
  hints: [],
};

describe("buildSKILLPrompt — walkthrough directive", () => {
  it("injects walkthrough directive for BEGINNER in Socratic phase", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "BEGINNER", weaknesses: [], conceptMastery: [] },
      problem,
    });
    expect(prompt).toContain("BEFORE discussing algorithms");
    expect(prompt).toContain("force a concrete walk-through");
  });

  it("injects walkthrough directive for INTERMEDIATE in Socratic phase", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "INTERMEDIATE", weaknesses: [], conceptMastery: [] },
      problem,
    });
    expect(prompt).toContain("BEFORE discussing algorithms");
  });

  it("does NOT inject walkthrough directive for ADVANCED", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "ADVANCED", weaknesses: [], conceptMastery: [] },
      problem,
    });
    expect(prompt).not.toContain("BEFORE discussing algorithms");
  });

  it("does NOT inject walkthrough directive for EXPERT", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "EXPERT", weaknesses: [], conceptMastery: [] },
      problem,
    });
    expect(prompt).not.toContain("BEFORE discussing algorithms");
  });

  it("does NOT inject walkthrough directive in non-Socratic phases (BEGINNER)", () => {
    const prompt = buildSKILLPrompt({
      phase: "KNOWLEDGE",
      student: { level: "BEGINNER", weaknesses: [], conceptMastery: [] },
      problem,
    });
    expect(prompt).not.toContain("BEFORE discussing algorithms");
  });
});
