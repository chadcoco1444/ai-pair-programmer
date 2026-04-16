import { describe, it, expect } from "vitest";
import {
  buildSKILLPrompt,
  detectPhaseTransition,
  type SKILLPhase,
} from "@/server/services/skill-prompts";

describe("buildSKILLPrompt", () => {
  it("應包含基礎系統角色", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "BEGINNER", weaknesses: [], conceptMastery: [] },
    });

    expect(prompt).toContain("程式設計導師");
    expect(prompt).toContain("SKILL");
    expect(prompt).toContain("絕對不提供完整程式碼");
  });

  it("應包含對應階段的規則", () => {
    const prompt = buildSKILLPrompt({
      phase: "ITERATIVE",
      student: { level: "INTERMEDIATE", weaknesses: [], conceptMastery: [] },
    });

    expect(prompt).toContain("疊代優化");
    expect(prompt).toContain("暴力解");
    expect(prompt).toContain("瓶頸分析");
  });

  it("應根據程度調整語言", () => {
    const beginner = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "BEGINNER", weaknesses: [], conceptMastery: [] },
    });

    const expert = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "EXPERT", weaknesses: [], conceptMastery: [] },
    });

    expect(beginner).toContain("初學者");
    expect(expert).toContain("專家");
  });

  it("應包含弱點資訊", () => {
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

  it("應包含題目資訊", () => {
    const prompt = buildSKILLPrompt({
      phase: "KNOWLEDGE",
      student: { level: "ADVANCED", weaknesses: [], conceptMastery: [] },
      problem: {
        title: "Two Sum",
        category: "ALGORITHM",
        difficulty: "EASY",
        description: "找出兩個數字的和",
        concepts: ["Array", "Hash Table"],
        hints: ["用 hash map"],
      },
    });

    expect(prompt).toContain("Two Sum");
    expect(prompt).toContain("Array");
    expect(prompt).toContain("Hash Table");
  });
});

describe("detectPhaseTransition", () => {
  it("ACCEPTED 應轉換到 EVOLUTION", () => {
    const phase = detectPhaseTransition("LOGIC", "結果出來了", "ACCEPTED");
    expect(phase).toBe("EVOLUTION");
  });

  it("WRONG_ANSWER 應轉換到 ITERATIVE", () => {
    const phase = detectPhaseTransition("LOGIC", "有測資沒過", "WRONG_ANSWER");
    expect(phase).toBe("ITERATIVE");
  });

  it("TIME_LIMIT 應轉換到 ITERATIVE", () => {
    const phase = detectPhaseTransition("LOGIC", "超時了", "TIME_LIMIT");
    expect(phase).toBe("ITERATIVE");
  });

  it("學生提出解法時應從 SOCRATIC 轉到 KNOWLEDGE", () => {
    const phase = detectPhaseTransition("SOCRATIC", "我想用 hash map 來解", undefined);
    expect(phase).toBe("KNOWLEDGE");
  });

  it("學生寫程式碼時應從 KNOWLEDGE 轉到 ITERATIVE", () => {
    const phase = detectPhaseTransition("KNOWLEDGE", "我寫了一個 function", undefined);
    expect(phase).toBe("ITERATIVE");
  });

  it("學生要提交時應從 ITERATIVE 轉到 LOGIC", () => {
    const phase = detectPhaseTransition("ITERATIVE", "我覺得可以提交了", undefined);
    expect(phase).toBe("LOGIC");
  });

  it("無匹配時應保持當前階段", () => {
    const phase = detectPhaseTransition("SOCRATIC", "你好", undefined);
    expect(phase).toBe("SOCRATIC");
  });
});
