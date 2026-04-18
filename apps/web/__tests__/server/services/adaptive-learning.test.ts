import { describe, it, expect } from "vitest";
import { calculateMastery } from "@/server/services/adaptive-learning";

describe("calculateMastery", () => {
  it("should be close to 1.0 with full pass rate, no hints, one-shot AC", () => {
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

  it("should be close to 0 when pass rate is 0", () => {
    const mastery = calculateMastery({
      passRate: 0,
      hintsUsed: 3,
      totalHints: 3,
      averageAttempts: 5,
      daysSinceLastPractice: 0,
    });
    expect(mastery).toBeLessThan(0.1);
  });

  it("using all hints should lower mastery", () => {
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

  it("more attempts should lower mastery", () => {
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

  it("time decay should lower mastery", () => {
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

  it("mastery should roughly halve after 70 days", () => {
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

  it("mastery should never exceed 1.0", () => {
    const mastery = calculateMastery({
      passRate: 1.0,
      hintsUsed: 0,
      totalHints: 0,
      averageAttempts: 1,
      daysSinceLastPractice: 0,
    });
    expect(mastery).toBeLessThanOrEqual(1.0);
  });

  it("mastery should never go below 0", () => {
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
