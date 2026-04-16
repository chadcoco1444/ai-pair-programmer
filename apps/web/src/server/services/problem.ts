import type { PrismaClient, Difficulty, Category } from "@prisma/client";

export interface ProblemFilters {
  difficulty?: Difficulty;
  category?: Category;
  tag?: string;
  search?: string;
}

export interface ProblemListItem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  category: Category;
  tags: { tag: string }[];
}

export class ProblemService {
  constructor(private prisma: PrismaClient) {}

  async list(filters: ProblemFilters = {}): Promise<ProblemListItem[]> {
    const where: any = {};

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.tag) {
      where.tags = { some: { tag: filters.tag } };
    }
    if (filters.search) {
      where.title = { contains: filters.search, mode: "insensitive" };
    }

    return this.prisma.problem.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        category: true,
        tags: { select: { tag: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getBySlug(slug: string) {
    return this.prisma.problem.findUnique({
      where: { slug },
      include: {
        tags: { select: { tag: true } },
        testCases: {
          where: { isHidden: false },
          select: {
            id: true,
            input: true,
            expected: true,
            isKiller: true,
          },
        },
        concepts: {
          include: {
            concept: { select: { id: true, name: true, domain: true } },
          },
        },
      },
    });
  }

  async getAllTestCases(problemId: string) {
    return this.prisma.testCase.findMany({
      where: { problemId },
      select: {
        id: true,
        input: true,
        expected: true,
        isHidden: true,
        isKiller: true,
      },
    });
  }
}
