import { PrismaClient } from "@prisma/client";
import { AdaptiveLearningEngine } from "../src/server/services/adaptive-learning";

async function main() {
  const prisma = new PrismaClient();
  const engine = new AdaptiveLearningEngine(prisma);

  const users = await prisma.user.findMany({ select: { id: true, name: true } });
  console.log(`Processing ${users.length} users...`);

  for (const user of users) {
    const solvedProblemIds = await prisma.submission.findMany({
      where: { userId: user.id, status: "ACCEPTED" },
      select: { problemId: true },
      distinct: ["problemId"],
    });

    if (solvedProblemIds.length === 0) continue;

    console.log(`  ${user.name ?? user.id}: ${solvedProblemIds.length} problems`);

    const links = await prisma.problemConcept.findMany({
      where: { problemId: { in: solvedProblemIds.map((s) => s.problemId) } },
      select: { conceptId: true },
      distinct: ["conceptId"],
    });

    for (const link of links) {
      await engine.updateMastery(user.id, link.conceptId);
    }

    await engine.checkLevelUp(user.id);
  }

  console.log("Backfill complete.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
