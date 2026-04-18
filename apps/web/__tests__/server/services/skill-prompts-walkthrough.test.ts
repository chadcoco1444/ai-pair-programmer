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

describe("buildSKILLPrompt — language mirroring", () => {
  it("instructs the AI to mirror the student's language (not hard-coded English)", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "BEGINNER", weaknesses: [], conceptMastery: [] },
      problem,
    });
    expect(prompt).toMatch(/mirror|match the student's language|same language/i);
    expect(prompt).not.toMatch(/respond in English \(technical terms stay in English\)/i);
  });

  it("uses imperative wording (CRITICAL / MUST) so Gemini does not soft-ignore it", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "BEGINNER", weaknesses: [], conceptMastery: [] },
      problem,
    });
    expect(prompt).toMatch(/CRITICAL/);
    expect(prompt).toMatch(/\bMUST\b/);
    expect(prompt).toMatch(/OVERRIDES/);
  });

  it("includes a final language-check reminder at the end (recency bias)", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "BEGINNER", weaknesses: [], conceptMastery: [] },
      problem,
    });
    expect(prompt).toMatch(/Final language check/i);
    expect(prompt).toMatch(/MOST RECENT message/);
  });

  it("preserves the instruction to keep technical terms in English", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "ADVANCED", weaknesses: [], conceptMastery: [] },
      problem,
    });
    expect(prompt).toMatch(/technical terms.+English/i);
  });
});
