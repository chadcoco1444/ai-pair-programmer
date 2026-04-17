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

      const nodes = concepts.map((c: any) => {
        const mastery = (masteryByConceptId.get(c.id) as number) ?? 0;
        const prereqs = prereqMap.get(c.id) ?? [];
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

      const edgeList = (edges as any[]).map((e) => ({
        source: e.parentId,
        target: e.childId,
        type: e.relation as "prerequisite" | "related",
      }));

      return { nodes, edges: edgeList };
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
