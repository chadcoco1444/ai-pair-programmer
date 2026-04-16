import type { PrismaClient } from "@prisma/client";

export interface ConceptNode {
  id: string;
  name: string;
  domain: string;
  mastery: number;       // 0-1, 從 UserProgress 取得
  problemCount: number;  // 關聯的題目數量
}

export interface ConceptGraphData {
  nodes: ConceptNode[];
  edges: { parentId: string; childId: string; relation: string }[];
}

export class KnowledgeGraphService {
  constructor(private prisma: PrismaClient) {}

  async getFullGraph(userId?: string): Promise<ConceptGraphData> {
    const concepts = await this.prisma.concept.findMany({
      include: {
        problems: { select: { problemId: true } },
        userProgress: userId
          ? { where: { userId }, select: { mastery: true } }
          : false,
      },
    });

    const edges = await this.prisma.conceptEdge.findMany({
      select: { parentId: true, childId: true, relation: true },
    });

    const nodes: ConceptNode[] = concepts.map((c) => ({
      id: c.id,
      name: c.name,
      domain: c.domain,
      mastery: userId && c.userProgress?.length > 0
        ? c.userProgress[0].mastery
        : 0,
      problemCount: c.problems.length,
    }));

    return { nodes, edges };
  }

  async getPrerequisites(conceptId: string): Promise<ConceptNode[]> {
    const edges = await this.prisma.conceptEdge.findMany({
      where: { childId: conceptId, relation: "prerequisite" },
      include: {
        parent: {
          include: { problems: { select: { problemId: true } } },
        },
      },
    });

    return edges.map((e) => ({
      id: e.parent.id,
      name: e.parent.name,
      domain: e.parent.domain,
      mastery: 0,
      problemCount: e.parent.problems.length,
    }));
  }

  async getRelatedConcepts(conceptId: string): Promise<ConceptNode[]> {
    const edges = await this.prisma.conceptEdge.findMany({
      where: {
        OR: [
          { parentId: conceptId, relation: "related" },
          { childId: conceptId, relation: "related" },
        ],
      },
      include: {
        parent: { include: { problems: { select: { problemId: true } } } },
        child: { include: { problems: { select: { problemId: true } } } },
      },
    });

    const concepts: ConceptNode[] = [];
    const seen = new Set<string>();

    for (const edge of edges) {
      const target = edge.parentId === conceptId ? edge.child : edge.parent;
      if (!seen.has(target.id)) {
        seen.add(target.id);
        concepts.push({
          id: target.id,
          name: target.name,
          domain: target.domain,
          mastery: 0,
          problemCount: target.problems.length,
        });
      }
    }

    return concepts;
  }

  async generateMermaidGraph(userId?: string): Promise<string> {
    const { nodes, edges } = await this.getFullGraph(userId);

    const lines: string[] = ["graph TD"];

    for (const node of nodes) {
      const cls = node.mastery >= 0.8
        ? "mastered"
        : node.mastery >= 0.4
        ? "learning"
        : node.mastery > 0
        ? "weak"
        : "unexplored";
      const safeName = node.name.replace(/ /g, "_");
      lines.push(`    ${safeName}[${node.name}]:::${cls}`);
    }

    for (const edge of edges) {
      const parent = nodes.find((n) => n.id === edge.parentId);
      const child = nodes.find((n) => n.id === edge.childId);
      if (parent && child) {
        const pName = parent.name.replace(/ /g, "_");
        const cName = child.name.replace(/ /g, "_");
        const arrow = edge.relation === "prerequisite" ? "-->" : "-..->";
        lines.push(`    ${pName} ${arrow} ${cName}`);
      }
    }

    lines.push("");
    lines.push("    classDef mastered fill:#22c55e,color:#fff");
    lines.push("    classDef learning fill:#f59e0b,color:#fff");
    lines.push("    classDef unexplored fill:#6b7280,color:#fff");
    lines.push("    classDef weak fill:#ef4444,color:#fff");

    return lines.join("\n");
  }
}
