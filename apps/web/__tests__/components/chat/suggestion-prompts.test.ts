import { describe, it, expect } from "vitest";
import { SUGGESTION_PROMPTS } from "@/components/chat/suggestion-prompts";

describe("SUGGESTION_PROMPTS", () => {
  it("exports exactly 6 prompts", () => {
    expect(SUGGESTION_PROMPTS).toHaveLength(6);
  });

  it("each prompt has required fields", () => {
    for (const p of SUGGESTION_PROMPTS) {
      expect(p.id).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.prompt).toBeTruthy();
      expect(typeof p.icon).toBe("function");
    }
  });

  it("all ids are unique", () => {
    const ids = SUGGESTION_PROMPTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("review and complexity prompts need code", () => {
    const review = SUGGESTION_PROMPTS.find((p) => p.id === "review");
    const complexity = SUGGESTION_PROMPTS.find((p) => p.id === "complexity");
    expect(review?.needsCode).toBe(true);
    expect(complexity?.needsCode).toBe(true);
  });

  it("other prompts do not need code", () => {
    const others = SUGGESTION_PROMPTS.filter(
      (p) => !["review", "complexity"].includes(p.id)
    );
    for (const p of others) {
      expect(p.needsCode).toBeFalsy();
    }
  });

  it("contains approach, review, hint, explain, complexity, edge-cases", () => {
    const ids = SUGGESTION_PROMPTS.map((p) => p.id).sort();
    expect(ids).toEqual(
      ["approach", "complexity", "edge-cases", "explain", "hint", "review"].sort()
    );
  });
});
