import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function createContext() {
  const session = await auth();
  return {
    session,
    prisma,
    redis,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
