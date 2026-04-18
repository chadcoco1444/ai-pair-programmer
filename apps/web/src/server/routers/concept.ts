import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../trpc";
import { KnowledgeGraphService } from "../services/knowledge-graph";

export const conceptRouter = router({
  graph: publicProcedure
    .input(z.object({ userId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const userId =
        input?.userId ?? (ctx as any).user?.id ?? ctx.session?.user?.id;

      const [concepts, edges, userProgress, problemCounts, acceptedSubs] = await Promise.all([
        ctx.prisma.concept.findMany(),
        ctx.prisma.conceptEdge.findMany(),
        userId
          ? ctx.prisma.userProgress.findMany({ where: { userId } })
          : Promise.resolve([]),
        ctx.prisma.problemConcept.groupBy({
          by: ["conceptId"],
          _count: { problemId: true },
        }),
        userId
          ? ctx.prisma.submission.findMany({
              where: { userId, status: "ACCEPTED" },
              select: { problemId: true, problem: { select: { concepts: { select: { conceptId: true } } } } },
              distinct: ["problemId"],
            })
          : Promise.resolve([]),
      ]);

      const masteryByConceptId = new Map(
        userProgress.map((p: any) => [p.conceptId, p.mastery])
      );
      const problemCountByConceptId = new Map(
        problemCounts.map((p: any) => [p.conceptId, p._count.problemId])
      );

      const solvedCountByConceptId = new Map<string, number>();
      for (const sub of acceptedSubs) {
        for (const link of (sub as any).problem.concepts) {
          solvedCountByConceptId.set(
            link.conceptId,
            (solvedCountByConceptId.get(link.conceptId) ?? 0) + 1
          );
        }
      }

      const prereqMap = new Map<string, string[]>();
      for (const e of edges as any[]) {
        if (e.relation === "prerequisite") {
          const arr = prereqMap.get(e.childId) ?? [];
          arr.push(e.parentId);
          prereqMap.set(e.childId, arr);
        }
      }

      // Hide concepts without linked problems (e.g. system-design topics awaiting content)
      const visibleConceptIds = new Set(
        concepts
          .filter((c: any) => ((problemCountByConceptId.get(c.id) as number) ?? 0) > 0)
          .map((c: any) => c.id)
      );

      const nodes = concepts
        .filter((c: any) => visibleConceptIds.has(c.id))
        .map((c: any) => {
          const mastery = (masteryByConceptId.get(c.id) as number) ?? 0;
          const prereqs = (prereqMap.get(c.id) ?? []).filter((pid) => visibleConceptIds.has(pid));
          const prereqsMet = prereqs.every(
            (pid) => ((masteryByConceptId.get(pid) as number) ?? 0) >= 0.7
          );
          return {
            id: c.id,
            name: c.name,
            domain: c.domain,
            mastery,
            prereqsMet,
            problemCount: (problemCountByConceptId.get(c.id) as number) ?? 0,
            solvedCount: solvedCountByConceptId.get(c.id) ?? 0,
          };
        });

      const edgeList = (edges as any[])
        .filter((e) => visibleConceptIds.has(e.parentId) && visibleConceptIds.has(e.childId))
        .map((e) => ({
          source: e.parentId,
          target: e.childId,
          type: e.relation as "prerequisite" | "related",
        }));

      return { nodes, edges: edgeList };
    }),

  detail: publicProcedure
    .input(z.object({ conceptId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = (ctx as any).user?.id ?? ctx.session?.user?.id;

      const [concept, userProgress, problemLinks, prereqEdges, followUpEdges] = await Promise.all([
        ctx.prisma.concept.findUnique({ where: { id: input.conceptId } }),
        userId
          ? ctx.prisma.userProgress.findUnique({
              where: { userId_conceptId: { userId, conceptId: input.conceptId } },
            })
          : Promise.resolve(null),
        ctx.prisma.problemConcept.findMany({
          where: { conceptId: input.conceptId },
          include: { problem: { select: { id: true, slug: true, title: true, difficulty: true } } },
          orderBy: { relevance: "desc" },
        }),
        ctx.prisma.conceptEdge.findMany({
          where: { childId: input.conceptId, relation: "prerequisite" },
          include: { parent: { select: { id: true, name: true } } },
        }),
        ctx.prisma.conceptEdge.findMany({
          where: { parentId: input.conceptId, relation: "prerequisite" },
          include: { child: { select: { id: true, name: true } } },
        }),
      ]);

      if (!concept) {
        throw new Error(`Concept ${input.conceptId} not found`);
      }

      const problemIds = (problemLinks as any[]).map((l) => l.problem.id);

      const [solvedSubs, recentSubs, weaknesses, prereqProgress, followUpProgress] = await Promise.all([
        userId && problemIds.length > 0
          ? ctx.prisma.submission.findMany({
              where: { userId, problemId: { in: problemIds }, status: "ACCEPTED" },
              select: { problemId: true },
              distinct: ["problemId"],
            })
          : Promise.resolve([]),
        userId && problemIds.length > 0
          ? ctx.prisma.submission.findMany({
              where: { userId, problemId: { in: problemIds } },
              orderBy: { createdAt: "desc" },
              take: 3,
              select: { id: true, status: true, createdAt: true, problem: { select: { slug: true, title: true } } },
            })
          : Promise.resolve([]),
        userId
          ? ctx.prisma.userWeakness.findMany({
              where: { userId },
              orderBy: { frequency: "desc" },
              take: 3,
              select: { pattern: true, frequency: true },
            })
          : Promise.resolve([]),
        userId && (prereqEdges as any[]).length > 0
          ? ctx.prisma.userProgress.findMany({
              where: { userId, conceptId: { in: (prereqEdges as any[]).map((e) => e.parentId) } },
            })
          : Promise.resolve([]),
        userId && (followUpEdges as any[]).length > 0
          ? ctx.prisma.userProgress.findMany({
              where: { userId, conceptId: { in: (followUpEdges as any[]).map((e) => e.childId) } },
            })
          : Promise.resolve([]),
      ]);

      const solvedSet = new Set((solvedSubs as any[]).map((s) => s.problemId));
      const prereqMastery = new Map((prereqProgress as any[]).map((p) => [p.conceptId, p.mastery]));
      const followUpMastery = new Map((followUpProgress as any[]).map((p) => [p.conceptId, p.mastery]));

      return {
        concept: { id: concept.id, name: concept.name, domain: concept.domain, description: concept.description },
        mastery: userProgress?.mastery ?? 0,
        problems: (problemLinks as any[]).map((l) => ({
          slug: l.problem.slug,
          title: l.problem.title,
          difficulty: l.problem.difficulty as "EASY" | "MEDIUM" | "HARD",
          relevance: l.relevance,
          solved: solvedSet.has(l.problem.id),
        })),
        prerequisites: (prereqEdges as any[]).map((e) => ({
          id: e.parent.id,
          name: e.parent.name,
          mastery: prereqMastery.get(e.parent.id) ?? 0,
        })),
        followUps: (followUpEdges as any[]).map((e) => ({
          id: e.child.id,
          name: e.child.name,
          mastery: followUpMastery.get(e.child.id) ?? 0,
        })),
        recentSubmissions: (recentSubs as any[]).map((s) => ({
          problemSlug: s.problem.slug,
          problemTitle: s.problem.title,
          status: s.status,
          createdAt: s.createdAt,
        })),
        weaknessStats: weaknesses,
      };
    }),

  prerequisites: publicProcedure
    .input(z.object({ conceptId: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = new KnowledgeGraphService(ctx.prisma);
      return service.getPrerequisites(input.conceptId);
    }),

  related: publicProcedure
    .input(z.object({ conceptId: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = new KnowledgeGraphService(ctx.prisma);
      return service.getRelatedConcepts(input.conceptId);
    }),

  mermaid: protectedProcedure
    .query(async ({ ctx }) => {
      const service = new KnowledgeGraphService(ctx.prisma);
      return service.generateMermaidGraph(ctx.user.id);
    }),
});
