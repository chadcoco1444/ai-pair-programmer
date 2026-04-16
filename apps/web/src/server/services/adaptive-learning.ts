import type { PrismaClient, Level } from "@prisma/client";

// ===== 掌握度計算 =====

interface MasteryParams {
  passRate: number;        // 0-1
  hintsUsed: number;
  totalHints: number;
  averageAttempts: number;
  daysSinceLastPractice: number;
}

export function calculateMastery(params: MasteryParams): number {
  const { passRate, hintsUsed, totalHints, averageAttempts, daysSinceLastPractice } = params;

  const independenceScore = 1 - (hintsUsed / Math.max(totalHints, 1));
  const efficiencyScore = Math.max(0, 1 - (averageAttempts - 1) * 0.2);
  const decayFactor = Math.exp(-0.01 * daysSinceLastPractice);

  const rawMastery = (passRate * 0.4) + (independenceScore * 0.3) + (efficiencyScore * 0.3);

  return Math.min(1, Math.max(0, rawMastery * decayFactor));
}

// ===== 弱點模式 =====

export const WEAKNESS_PATTERNS = {
  "off-by-one": "迴圈邊界錯誤，差一問題",
  "missing-base-case": "遞迴缺少終止條件",
  "integer-overflow": "整數溢位未處理",
  "null-deref": "空指標存取",
  "race-condition": "多執行緒資料競爭",
  "memory-leak": "動態記憶體未釋放",
  "wrong-ds": "選擇了不適合的資料結構",
  "greedy-fallacy": "誤用貪心法（需要 DP）",
  "tle-nested-loop": "不必要的巢狀迴圈",
  "missing-edge-case": "未處理邊際條件",
} as const;

export type WeaknessPattern = keyof typeof WEAKNESS_PATTERNS;

// ===== 等級升級 =====

const LEVEL_UP_CRITERIA: Record<string, {
  minConceptsMastered: number;
  minProblemsAccepted: number;
  requiredDomains: string[];
}> = {
  BEGINNER: {
    minConceptsMastered: 10,
    minProblemsAccepted: 20,
    requiredDomains: ["ALGORITHM", "DATA_STRUCTURE"],
  },
  INTERMEDIATE: {
    minConceptsMastered: 25,
    minProblemsAccepted: 60,
    requiredDomains: ["ALGORITHM", "DATA_STRUCTURE", "SYSTEM_DESIGN"],
  },
  ADVANCED: {
    minConceptsMastered: 45,
    minProblemsAccepted: 120,
    requiredDomains: ["ALGORITHM", "DATA_STRUCTURE", "SYSTEM_DESIGN", "CONCURRENCY", "OS_KERNEL"],
  },
};

const LEVEL_ORDER: Level[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

const DIFFICULTY_BY_LEVEL: Record<Level, string[]> = {
  BEGINNER: ["EASY"],
  INTERMEDIATE: ["EASY", "MEDIUM"],
  ADVANCED: ["MEDIUM", "HARD"],
  EXPERT: ["HARD", "EXPERT"],
};

// ===== 推薦結果 =====

export interface RecommendedProblem {
  problem: {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    category: string;
  };
  score: number;
  reason: string;
}

export interface LearningStats {
  totalSolved: number;
  passRate: number;
  currentLevel: Level;
  nextLevelProgress: {
    conceptsMastered: number;
    conceptsRequired: number;
    problemsAccepted: number;
    problemsRequired: number;
    missingDomains: string[];
  } | null;
  topWeaknesses: { pattern: string; description: string; frequency: number }[];
  recentActivity: number; // 最近 7 天解題數
}

// ===== 自適應學習引擎 =====

export class AdaptiveLearningEngine {
  constructor(private prisma: PrismaClient) {}

  // 更新概念掌握度
  async updateMastery(userId: string, conceptId: string): Promise<number> {
    // 取得與該概念相關的提交
    const submissions = await this.prisma.submission.findMany({
      where: {
        userId,
        status: { not: "PENDING" },
        problem: {
          concepts: { some: { conceptId } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    if (submissions.length === 0) return 0;

    const accepted = submissions.filter((s) => s.status === "ACCEPTED").length;
    const passRate = accepted / submissions.length;

    const lastPractice = submissions[0]?.createdAt ?? new Date();
    const daysSince = Math.floor(
      (Date.now() - lastPractice.getTime()) / (1000 * 60 * 60 * 24)
    );

    const mastery = calculateMastery({
      passRate,
      hintsUsed: 0,
      totalHints: 3,
      averageAttempts: submissions.length / Math.max(accepted, 1),
      daysSinceLastPractice: daysSince,
    });

    await this.prisma.userProgress.upsert({
      where: { userId_conceptId: { userId, conceptId } },
      update: {
        mastery,
        attempts: { increment: 1 },
        lastPracticed: new Date(),
      },
      create: {
        userId,
        conceptId,
        mastery,
        attempts: 1,
        lastPracticed: new Date(),
      },
    });

    return mastery;
  }

  // 記錄弱點
  async recordWeakness(userId: string, pattern: WeaknessPattern): Promise<void> {
    const existing = await this.prisma.userWeakness.findFirst({
      where: { userId, pattern, resolved: false },
    });

    if (existing) {
      await this.prisma.userWeakness.update({
        where: { id: existing.id },
        data: { frequency: { increment: 1 }, lastSeen: new Date() },
      });
    } else {
      await this.prisma.userWeakness.create({
        data: { userId, pattern, frequency: 1 },
      });
    }
  }

  // 標記弱點已解決
  async resolveWeakness(userId: string, pattern: string): Promise<void> {
    await this.prisma.userWeakness.updateMany({
      where: { userId, pattern, resolved: false },
      data: { resolved: true },
    });
  }

  // 取得推薦題目
  async getRecommendations(userId: string): Promise<RecommendedProblem[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { level: true },
    });

    if (!user) return [];

    const progress = await this.prisma.userProgress.findMany({
      where: { userId },
      include: { concept: true },
    });

    const weaknesses = await this.prisma.userWeakness.findMany({
      where: { userId, resolved: false },
      orderBy: { frequency: "desc" },
    });

    const solvedProblemIds = (
      await this.prisma.submission.findMany({
        where: { userId, status: "ACCEPTED" },
        select: { problemId: true },
        distinct: ["problemId"],
      })
    ).map((s) => s.problemId);

    const candidates: RecommendedProblem[] = [];

    // 優先級 1：補基礎（mastery < 0.4）
    const weakPrereqs = progress.filter((p) => p.mastery < 0.4);
    for (const prereq of weakPrereqs) {
      const problems = await this.prisma.problem.findMany({
        where: {
          id: { notIn: solvedProblemIds },
          concepts: { some: { conceptId: prereq.conceptId } },
        },
        select: { id: true, title: true, slug: true, difficulty: true, category: true },
        take: 3,
      });

      for (const p of problems) {
        candidates.push({
          problem: p,
          score: 100 + (0.4 - prereq.mastery) * 50,
          reason: `基礎概念「${prereq.concept.name}」需要加強（掌握度 ${Math.round(prereq.mastery * 100)}%）`,
        });
      }
    }

    // 優先級 2：弱點強化（frequency >= 3）
    const significantWeaknesses = weaknesses.filter((w) => w.frequency >= 3);
    if (significantWeaknesses.length > 0) {
      const weaknessProblems = await this.prisma.problem.findMany({
        where: {
          id: { notIn: solvedProblemIds },
          difficulty: { in: DIFFICULTY_BY_LEVEL[user.level] as any },
        },
        select: { id: true, title: true, slug: true, difficulty: true, category: true },
        take: 5,
      });

      for (const p of weaknessProblems) {
        candidates.push({
          problem: p,
          score: 80 + significantWeaknesses[0].frequency * 5,
          reason: `你經常出現「${significantWeaknesses[0].pattern}」錯誤，這題可以幫你克服`,
        });
      }
    }

    // 優先級 3：正常推進
    const masteredConcepts = progress.filter((p) => p.mastery >= 0.8);
    const masteredIds = new Set(masteredConcepts.map((p) => p.conceptId));

    const frontierConcepts = await this.prisma.conceptEdge.findMany({
      where: {
        parentId: { in: Array.from(masteredIds) },
        relation: "prerequisite",
        childId: { notIn: Array.from(masteredIds) },
      },
      include: {
        child: true,
      },
    });

    for (const edge of frontierConcepts) {
      const problems = await this.prisma.problem.findMany({
        where: {
          id: { notIn: solvedProblemIds },
          concepts: { some: { conceptId: edge.childId } },
          difficulty: { in: DIFFICULTY_BY_LEVEL[user.level] as any },
        },
        select: { id: true, title: true, slug: true, difficulty: true, category: true },
        take: 2,
      });

      for (const p of problems) {
        candidates.push({
          problem: p,
          score: 50,
          reason: `下一個建議學習的概念：「${edge.child.name}」`,
        });
      }
    }

    // 去重、排序、取前 5
    const seen = new Set<string>();
    return candidates
      .filter((c) => {
        if (seen.has(c.problem.id)) return false;
        seen.add(c.problem.id);
        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  // 檢查是否可以升級
  async checkLevelUp(userId: string): Promise<{
    canLevelUp: boolean;
    currentLevel: Level;
    nextLevel: Level | null;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { level: true },
    });

    if (!user) return { canLevelUp: false, currentLevel: "BEGINNER", nextLevel: null };

    const currentIndex = LEVEL_ORDER.indexOf(user.level);
    if (currentIndex >= LEVEL_ORDER.length - 1) {
      return { canLevelUp: false, currentLevel: user.level, nextLevel: null };
    }

    const nextLevel = LEVEL_ORDER[currentIndex + 1];
    const criteria = LEVEL_UP_CRITERIA[user.level];

    if (!criteria) {
      return { canLevelUp: false, currentLevel: user.level, nextLevel };
    }

    // 檢查掌握的概念數
    const masteredConcepts = await this.prisma.userProgress.count({
      where: { userId, mastery: { gte: 0.7 } },
    });

    // 檢查通過的題目數
    const acceptedProblems = await this.prisma.submission.findMany({
      where: { userId, status: "ACCEPTED" },
      select: { problemId: true },
      distinct: ["problemId"],
    });

    // 檢查涉及的領域
    const coveredDomains = await this.prisma.userProgress.findMany({
      where: { userId, mastery: { gte: 0.5 } },
      include: { concept: { select: { domain: true } } },
    });

    const domains = new Set(coveredDomains.map((p) => p.concept.domain));
    const missingDomains = criteria.requiredDomains.filter((d) => !domains.has(d as any));

    const canLevelUp =
      masteredConcepts >= criteria.minConceptsMastered &&
      acceptedProblems.length >= criteria.minProblemsAccepted &&
      missingDomains.length === 0;

    if (canLevelUp) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { level: nextLevel },
      });
    }

    return { canLevelUp, currentLevel: user.level, nextLevel };
  }

  // 取得學習統計
  async getLearningStats(userId: string): Promise<LearningStats> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { level: true },
    });

    if (!user) throw new Error("使用者不存在");

    const allSubmissions = await this.prisma.submission.findMany({
      where: { userId },
      select: { status: true, problemId: true, createdAt: true },
    });

    const acceptedIds = new Set(
      allSubmissions.filter((s) => s.status === "ACCEPTED").map((s) => s.problemId)
    );

    const totalSolved = acceptedIds.size;
    const passRate = allSubmissions.length > 0
      ? allSubmissions.filter((s) => s.status === "ACCEPTED").length / allSubmissions.length
      : 0;

    // 最近 7 天
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = new Set(
      allSubmissions
        .filter((s) => s.status === "ACCEPTED" && s.createdAt >= sevenDaysAgo)
        .map((s) => s.problemId)
    ).size;

    // 弱點
    const weaknesses = await this.prisma.userWeakness.findMany({
      where: { userId, resolved: false },
      orderBy: { frequency: "desc" },
      take: 5,
    });

    const topWeaknesses = weaknesses.map((w) => ({
      pattern: w.pattern,
      description: WEAKNESS_PATTERNS[w.pattern as WeaknessPattern] ?? w.pattern,
      frequency: w.frequency,
    }));

    // 升級進度
    const currentIndex = LEVEL_ORDER.indexOf(user.level);
    let nextLevelProgress: LearningStats["nextLevelProgress"] = null;

    if (currentIndex < LEVEL_ORDER.length - 1) {
      const criteria = LEVEL_UP_CRITERIA[user.level];
      if (criteria) {
        const conceptsMastered = await this.prisma.userProgress.count({
          where: { userId, mastery: { gte: 0.7 } },
        });

        const coveredDomains = await this.prisma.userProgress.findMany({
          where: { userId, mastery: { gte: 0.5 } },
          include: { concept: { select: { domain: true } } },
        });
        const domains = new Set(coveredDomains.map((p) => p.concept.domain));

        nextLevelProgress = {
          conceptsMastered,
          conceptsRequired: criteria.minConceptsMastered,
          problemsAccepted: totalSolved,
          problemsRequired: criteria.minProblemsAccepted,
          missingDomains: criteria.requiredDomains.filter((d) => !domains.has(d as any)),
        };
      }
    }

    return {
      totalSolved,
      passRate,
      currentLevel: user.level,
      nextLevelProgress,
      topWeaknesses,
      recentActivity,
    };
  }
}
