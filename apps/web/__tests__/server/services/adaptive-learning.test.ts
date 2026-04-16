import { describe, it, expect } from "vitest";
import { calculateMastery } from "@/server/services/adaptive-learning";

describe("calculateMastery", () => {
  it("全部通過、無提示、一次 AC 應接近 1.0", () => {
    const mastery = calculateMastery({
      passRate: 1.0,
      hintsUsed: 0,
      totalHints: 3,
      averageAttempts: 1,
      daysSinceLastPractice: 0,
    });
    expect(mastery).toBeGreaterThan(0.9);
    expect(mastery).toBeLessThanOrEqual(1.0);
  });

  it("通過率 0 應接近 0", () => {
    const mastery = calculateMastery({
      passRate: 0,
      hintsUsed: 3,
      totalHints: 3,
      averageAttempts: 5,
      daysSinceLastPractice: 0,
    });
    expect(mastery).toBeLessThan(0.1);
  });

  it("使用全部提示應降低掌握度", () => {
    const withHints = calculateMastery({
      passRate: 1.0,
      hintsUsed: 3,
      totalHints: 3,
      averageAttempts: 1,
      daysSinceLastPractice: 0,
    });
    const withoutHints = calculateMastery({
      passRate: 1.0,
      hintsUsed: 0,
      totalHints: 3,
      averageAttempts: 1,
      daysSinceLastPractice: 0,
    });
    expect(withHints).toBeLessThan(withoutHints);
  });

  it("多次嘗試應降低掌握度", () => {
    const oneAttempt = calculateMastery({
      passRate: 1.0,
      hintsUsed: 0,
      totalHints: 3,
      averageAttempts: 1,
      daysSinceLastPractice: 0,
    });
    const fiveAttempts = calculateMastery({
      passRate: 1.0,
      hintsUsed: 0,
      totalHints: 3,
      averageAttempts: 5,
      daysSinceLastPractice: 0,
    });
    expect(fiveAttempts).toBeLessThan(oneAttempt);
  });

  it("時間衰減應降低掌握度", () => {
    const recent = calculateMastery({
      passRate: 1.0,
      hintsUsed: 0,
      totalHints: 3,
      averageAttempts: 1,
      daysSinceLastPractice: 0,
    });
    const old = calculateMastery({
      passRate: 1.0,
      hintsUsed: 0,
      totalHints: 3,
      averageAttempts: 1,
      daysSinceLastPractice: 100,
    });
    expect(old).toBeLessThan(recent);
  });

  it("70 天後掌握度應大約降低一半", () => {
    const initial = calculateMastery({
      passRate: 1.0,
      hintsUsed: 0,
      totalHints: 3,
      averageAttempts: 1,
      daysSinceLastPractice: 0,
    });
    const after70days = calculateMastery({
      passRate: 1.0,
      hintsUsed: 0,
      totalHints: 3,
      averageAttempts: 1,
      daysSinceLastPractice: 70,
    });
    const ratio = after70days / initial;
    expect(ratio).toBeGreaterThan(0.4);
    expect(ratio).toBeLessThan(0.6);
  });

  it("掌握度不應超過 1.0", () => {
    const mastery = calculateMastery({
      passRate: 1.0,
      hintsUsed: 0,
      totalHints: 0,
      averageAttempts: 1,
      daysSinceLastPractice: 0,
    });
    expect(mastery).toBeLessThanOrEqual(1.0);
  });

  it("掌握度不應低於 0", () => {
    const mastery = calculateMastery({
      passRate: 0,
      hintsUsed: 10,
      totalHints: 3,
      averageAttempts: 10,
      daysSinceLastPractice: 365,
    });
    expect(mastery).toBeGreaterThanOrEqual(0);
  });
});
