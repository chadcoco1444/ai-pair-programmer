import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

const prisma = new PrismaClient();

interface ConceptSeed {
  name: string;
  domain: string;
  description: string;
}

interface EdgeSeed {
  parent: string;
  child: string;
  relation: string;
}

interface ConceptsFile {
  concepts: ConceptSeed[];
  edges: EdgeSeed[];
}

interface ProblemSeed {
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  tags: string[];
  concepts: { name: string; relevance: number }[];
  description: string;
  hints: string[];
  starterCode: Record<string, string>;
  testCases: {
    input: string;
    expected: string;
    isHidden: boolean;
    isKiller: boolean;
  }[];
}

async function seedConcepts() {
  const filePath = path.resolve(__dirname, "../../../seed/knowledge-graph/concepts.yaml");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = yaml.load(raw) as ConceptsFile;

  console.log(`Importing ${data.concepts.length} concepts...`);

  for (const concept of data.concepts) {
    await prisma.concept.upsert({
      where: { name: concept.name },
      update: { domain: concept.domain as any, description: concept.description },
      create: { name: concept.name, domain: concept.domain as any, description: concept.description },
    });
  }

  console.log(`Importing ${data.edges.length} edges...`);

  for (const edge of data.edges) {
    const parent = await prisma.concept.findUnique({ where: { name: edge.parent } });
    const child = await prisma.concept.findUnique({ where: { name: edge.child } });

    if (!parent || !child) {
      console.warn(`Skipping edge ${edge.parent} -> ${edge.child}: concept not found`);
      continue;
    }

    await prisma.conceptEdge.upsert({
      where: { parentId_childId: { parentId: parent.id, childId: child.id } },
      update: { relation: edge.relation },
      create: { parentId: parent.id, childId: child.id, relation: edge.relation },
    });
  }
}

async function seedProblems() {
  const baseDir = path.resolve(__dirname, "../../../seed/problems");
  const categories = fs.readdirSync(baseDir);

  for (const category of categories) {
    const categoryPath = path.join(baseDir, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".yaml"));

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = yaml.load(raw) as ProblemSeed;

      console.log(`Importing problem: ${data.title}`);

      const problem = await prisma.problem.upsert({
        where: { slug: data.slug },
        update: {
          title: data.title,
          description: data.description,
          difficulty: data.difficulty as any,
          category: data.category as any,
          starterCode: data.starterCode || {},
          hints: (data.hints || []).map((h: any) => typeof h === "string" ? h : JSON.stringify(h)),
        },
        create: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          difficulty: data.difficulty as any,
          category: data.category as any,
          starterCode: data.starterCode || {},
          hints: (data.hints || []).map((h: any) => typeof h === "string" ? h : JSON.stringify(h)),
        },
      });

      // Tags
      if (data.tags) {
        for (const tag of data.tags) {
          await prisma.problemTag.upsert({
            where: { problemId_tag: { problemId: problem.id, tag } },
            update: {},
            create: { problemId: problem.id, tag },
          });
        }
      }

      // Test cases
      if (data.testCases && data.testCases.length > 0) {
        await prisma.testCase.deleteMany({ where: { problemId: problem.id } });
        for (const tc of data.testCases) {
          await prisma.testCase.create({
            data: {
              problemId: problem.id,
              input: tc.input,
              expected: tc.expected,
              isHidden: tc.isHidden,
              isKiller: tc.isKiller,
            },
          });
        }
      }

      // Concept links
      if (data.concepts) {
        for (const conceptRef of data.concepts) {
          const concept = await prisma.concept.findUnique({ where: { name: conceptRef.name } });
          if (!concept) {
            console.warn(`Skipping concept link ${conceptRef.name}: concept not found`);
            continue;
          }
          await prisma.problemConcept.upsert({
            where: { problemId_conceptId: { problemId: problem.id, conceptId: concept.id } },
            update: { relevance: conceptRef.relevance },
            create: { problemId: problem.id, conceptId: concept.id, relevance: conceptRef.relevance },
          });
        }
      }
    }
  }
}

async function main() {
  console.log("Seeding database...\n");

  await seedConcepts();
  console.log("");
  await seedProblems();

  console.log("\nSeed data imported successfully.");
}

main()
  .catch((e) => {
    console.error("Seed data import failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
