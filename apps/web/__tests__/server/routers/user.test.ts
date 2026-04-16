import { describe, it, expect, vi } from "vitest";
import { appRouter } from "@/server/router";
import { createCallerFactory } from "@/server/trpc";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  handlers: {},
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock redis
vi.mock("@/lib/redis", () => ({
  redis: {},
}));

import { prisma } from "@/lib/prisma";

const createCaller = createCallerFactory(appRouter);

describe("user.me", () => {
  it("未登入時應回傳 UNAUTHORIZED", async () => {
    const caller = createCaller({
      session: null,
      prisma,
      redis: {} as any,
    });

    await expect(caller.user.me()).rejects.toThrow("UNAUTHORIZED");
  });

  it("已登入時應回傳使用者資料", async () => {
    const mockUser = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      image: null,
      level: "BEGINNER" as const,
      xp: 0,
      createdAt: new Date(),
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

    const caller = createCaller({
      session: { user: { id: "user-1" }, expires: "" } as any,
      prisma,
      redis: {} as any,
    });

    const result = await caller.user.me();
    expect(result).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        level: true,
        xp: true,
        createdAt: true,
      },
    });
  });
});
