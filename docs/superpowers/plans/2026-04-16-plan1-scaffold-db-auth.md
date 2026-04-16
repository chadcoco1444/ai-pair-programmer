# Plan 1：專案骨架 + 資料庫 + 認證 — 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目標：** 建立 SKILL 平台的基礎架構 — 可運行的 Next.js 全棧應用 + PostgreSQL + Redis + NextAuth OAuth 登入，全部透過 Docker Compose 啟動。

**架構：** Monolith-First。Next.js 15 App Router 作為主應用，Prisma ORM 連接 PostgreSQL，Redis 用於 session 與快取。沙盒執行引擎在此計畫中僅建立空白服務佔位。

**技術棧：** Next.js 15, React 19, TypeScript, Tailwind CSS, tRPC v11, Prisma, PostgreSQL 16, Redis 7, NextAuth.js v5, Docker Compose

---

## 檔案結構

```
ai-pair-programmer/
├── docker-compose.yml                    # 所有服務定義
├── .env.example                          # 環境變數範本
├── .gitignore
├── package.json                          # 根層 workspace 設定
├── turbo.json                            # Turborepo 設定
├── apps/
│   └── web/
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── Dockerfile
│       ├── prisma/
│       │   └── schema.prisma             # 完整資料模型
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx            # 根佈局
│       │   │   ├── page.tsx              # 首頁
│       │   │   ├── api/
│       │   │   │   ├── auth/
│       │   │   │   │   └── [...nextauth]/
│       │   │   │   │       └── route.ts  # NextAuth 路由
│       │   │   │   └── trpc/
│       │   │   │       └── [trpc]/
│       │   │   │           └── route.ts  # tRPC 路由
│       │   │   └── dashboard/
│       │   │       └── page.tsx          # 儀表板佔位頁
│       │   ├── components/
│       │   │   ├── auth-button.tsx       # 登入/登出按鈕
│       │   │   └── providers.tsx         # SessionProvider + tRPC Provider
│       │   ├── server/
│       │   │   ├── trpc.ts              # tRPC 初始化
│       │   │   ├── context.ts           # tRPC context（含 session）
│       │   │   ├── router.ts            # 根 router
│       │   │   └── routers/
│       │   │       └── user.ts          # 使用者 router
│       │   ├── lib/
│       │   │   ├── auth.ts              # NextAuth 設定
│       │   │   ├── prisma.ts            # Prisma client 單例
│       │   │   ├── redis.ts             # Redis client
│       │   │   └── trpc-client.ts       # tRPC React client
│       │   └── types/
│       │       └── index.ts             # 共用型別
│       └── __tests__/
│           ├── lib/
│           │   └── prisma.test.ts       # Prisma 連線測試
│           └── server/
│               └── routers/
│                   └── user.test.ts     # 使用者 router 測試
├── services/
│   └── executor/
│       ├── Dockerfile                    # 執行引擎佔位
│       ├── package.json
│       └── src/
│           └── server.ts                 # 健康檢查端點
└── packages/
    └── shared/
        ├── package.json
        ├── tsconfig.json
        └── src/
            └── index.ts                  # 共享常數與型別
```

---

### Task 1：初始化 Monorepo 與根設定

**Files:**
- Create: `package.json`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: 初始化 Git 倉庫**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer"
git init
```

- [ ] **Step 2: 建立根 package.json**

```json
{
  "name": "ai-pair-programmer",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*",
    "services/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "db:push": "cd apps/web && npx prisma db push",
    "db:generate": "cd apps/web && npx prisma generate",
    "db:studio": "cd apps/web && npx prisma studio"
  },
  "devDependencies": {
    "turbo": "^2.5.0"
  },
  "packageManager": "npm@10.9.0"
}
```

- [ ] **Step 3: 建立 turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {
      "dependsOn": ["^build"]
    }
  }
}
```

- [ ] **Step 4: 建立 .gitignore**

```
node_modules/
.next/
dist/
.env
.env.local
*.log
.turbo/
coverage/
```

- [ ] **Step 5: 建立 .env.example**

```env
# 資料庫
DATABASE_URL="postgresql://skill:skill_password@localhost:5432/skill_platform?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# GitHub OAuth
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Anthropic
ANTHROPIC_API_KEY=""

# 執行引擎
EXECUTOR_URL="http://localhost:4000"
```

- [ ] **Step 6: 複製 .env.example 為 .env**

```bash
cp .env.example .env
```

- [ ] **Step 7: 提交**

```bash
git add package.json turbo.json .gitignore .env.example
git commit -m "chore: 初始化 monorepo 骨架與根設定"
```

---

### Task 2：建立 shared package

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: 建立 packages/shared/package.json**

```json
{
  "name": "@skill/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "test": "echo \"no tests yet\""
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: 建立 packages/shared/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: 建立 packages/shared/src/index.ts**

```typescript
// ===== 語言 =====
export const LANGUAGES = ["PYTHON", "C", "CPP", "JAVASCRIPT"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_DISPLAY: Record<Language, string> = {
  PYTHON: "Python",
  C: "C",
  CPP: "C++",
  JAVASCRIPT: "JavaScript",
};

// ===== 難度 =====
export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD", "EXPERT"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

// ===== 分類 =====
export const CATEGORIES = [
  "ALGORITHM",
  "DATA_STRUCTURE",
  "SYSTEM_DESIGN",
  "SYSTEM_PROGRAMMING",
  "CONCURRENCY",
] as const;
export type Category = (typeof CATEGORIES)[number];

// ===== 使用者等級 =====
export const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;
export type Level = (typeof LEVELS)[number];

// ===== 提交狀態 =====
export const SUBMISSION_STATUSES = [
  "PENDING",
  "RUNNING",
  "ACCEPTED",
  "WRONG_ANSWER",
  "TIME_LIMIT",
  "MEMORY_LIMIT",
  "RUNTIME_ERROR",
  "COMPILE_ERROR",
] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

// ===== SKILL 階段 =====
export const SKILL_PHASES = [
  "SOCRATIC",
  "KNOWLEDGE",
  "ITERATIVE",
  "LOGIC",
  "EVOLUTION",
] as const;
export type SKILLPhase = (typeof SKILL_PHASES)[number];

export const SKILL_PHASE_LABELS: Record<SKILLPhase, string> = {
  SOCRATIC: "S - 蘇格拉底式引導",
  KNOWLEDGE: "K - 知識圖譜連結",
  ITERATIVE: "I - 疊代優化",
  LOGIC: "L1 - 邏輯驗證",
  EVOLUTION: "L2 - 長期演化",
};

// ===== 執行結果 =====
export interface TestResult {
  testCaseId: string;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  runtime: number;
  memory: number;
}

export interface ExecutionResult {
  submissionId: string;
  status: SubmissionStatus;
  testResults: TestResult[];
  totalRuntime: number;
  totalMemory: number;
  compileError?: string;
}
```

- [ ] **Step 4: 提交**

```bash
git add packages/shared/
git commit -m "feat: 建立 shared package — 共享型別與常數"
```

---

### Task 3：建立 Next.js 應用骨架

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/postcss.config.js`

- [ ] **Step 1: 建立 apps/web/package.json**

```json
{
  "name": "@skill/web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^15.3.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "@trpc/server": "^11.0.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@tanstack/react-query": "^5.75.0",
    "@prisma/client": "^6.5.0",
    "next-auth": "^5.0.0",
    "@auth/prisma-adapter": "^2.9.0",
    "ioredis": "^5.6.0",
    "zod": "^3.24.0",
    "@skill/shared": "*"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@types/node": "^22.0.0",
    "tailwindcss": "^4.1.0",
    "@tailwindcss/postcss": "^4.1.0",
    "prisma": "^6.5.0",
    "vitest": "^3.1.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.3.0"
  }
}
```

- [ ] **Step 2: 建立 apps/web/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: 建立 apps/web/next.config.ts**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@skill/shared"],
};

export default nextConfig;
```

- [ ] **Step 4: 建立 apps/web/tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        skill: {
          green: "#22c55e",
          yellow: "#f59e0b",
          red: "#ef4444",
          gray: "#6b7280",
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: 建立 apps/web/postcss.config.js**

```javascript
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 6: 提交**

```bash
git add apps/web/package.json apps/web/tsconfig.json apps/web/next.config.ts apps/web/tailwind.config.ts apps/web/postcss.config.js
git commit -m "feat: 建立 Next.js 15 應用骨架與設定"
```

---

### Task 4：Prisma Schema 與資料庫模型

**Files:**
- Create: `apps/web/prisma/schema.prisma`

- [ ] **Step 1: 建立 apps/web/prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===== NextAuth.js 所需 =====
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ===== 使用者 =====
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  level         Level     @default(BEGINNER)
  xp            Int       @default(0)
  createdAt     DateTime  @default(now())

  accounts      Account[]
  sessions      Session[]
  submissions   Submission[]
  conversations Conversation[]
  progress      UserProgress[]
  weaknesses    UserWeakness[]
}

enum Level {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}

// ===== 題目 =====
model Problem {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  description String     @db.Text
  difficulty  Difficulty
  category    Category
  starterCode Json       @default("{}")
  hints       String[]
  isGenerated Boolean    @default(false)
  createdAt   DateTime   @default(now())

  tags          ProblemTag[]
  testCases     TestCase[]
  concepts      ProblemConcept[]
  prerequisites ProblemPrereq[]
  submissions   Submission[]
}

model ProblemTag {
  id        String  @id @default(cuid())
  problemId String
  problem   Problem @relation(fields: [problemId], references: [id], onDelete: Cascade)
  tag       String

  @@unique([problemId, tag])
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
  EXPERT
}

enum Category {
  ALGORITHM
  DATA_STRUCTURE
  SYSTEM_DESIGN
  SYSTEM_PROGRAMMING
  CONCURRENCY
}

model TestCase {
  id        String  @id @default(cuid())
  problemId String
  problem   Problem @relation(fields: [problemId], references: [id], onDelete: Cascade)
  input     String  @db.Text
  expected  String  @db.Text
  isHidden  Boolean @default(false)
  isKiller  Boolean @default(false)
}

// ===== 知識圖譜 =====
model Concept {
  id          String   @id @default(cuid())
  name        String   @unique
  domain      Domain
  description String   @db.Text

  problems     ProblemConcept[]
  parents      ConceptEdge[]  @relation("child")
  children     ConceptEdge[]  @relation("parent")
  userProgress UserProgress[]
}

enum Domain {
  ALGORITHM
  DATA_STRUCTURE
  SYSTEM_DESIGN
  OS_KERNEL
  CONCURRENCY
  NETWORKING
  MEMORY_MANAGEMENT
}

model ConceptEdge {
  id       String  @id @default(cuid())
  parentId String
  childId  String
  parent   Concept @relation("parent", fields: [parentId], references: [id], onDelete: Cascade)
  child    Concept @relation("child", fields: [childId], references: [id], onDelete: Cascade)
  relation String

  @@unique([parentId, childId])
}

model ProblemConcept {
  problemId String
  conceptId String
  problem   Problem @relation(fields: [problemId], references: [id], onDelete: Cascade)
  concept   Concept @relation(fields: [conceptId], references: [id], onDelete: Cascade)
  relevance Float

  @@id([problemId, conceptId])
}

model ProblemPrereq {
  id              String  @id @default(cuid())
  problemId       String
  problem         Problem @relation(fields: [problemId], references: [id], onDelete: Cascade)
  prereqProblemId String
}

// ===== 使用者進度 =====
model UserProgress {
  id            String    @id @default(cuid())
  userId        String
  conceptId     String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  concept       Concept   @relation(fields: [conceptId], references: [id], onDelete: Cascade)
  mastery       Float     @default(0)
  attempts      Int       @default(0)
  lastPracticed DateTime?

  @@unique([userId, conceptId])
}

model UserWeakness {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  pattern   String
  frequency Int      @default(1)
  lastSeen  DateTime @default(now())
  resolved  Boolean  @default(false)
}

// ===== 對話 =====
model Conversation {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  problemId String?
  mode      ConversationMode
  messages  Message[]
  createdAt DateTime         @default(now())
}

enum ConversationMode {
  GUIDED_PRACTICE
  SYSTEM_DESIGN
  FREE_DISCUSSION
  CODE_REVIEW
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           Role
  content        String       @db.Text
  metadata       Json?
  skillPhase     String?
  createdAt      DateTime     @default(now())
}

enum Role {
  USER
  ASSISTANT
  SYSTEM
}

// ===== 提交 =====
model Submission {
  id         String           @id @default(cuid())
  userId     String
  problemId  String
  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  problem    Problem          @relation(fields: [problemId], references: [id], onDelete: Cascade)
  language   Language
  code       String           @db.Text
  status     SubmissionStatus
  runtime    Int?
  memory     Int?
  results    Json?
  aiAnalysis String?          @db.Text
  createdAt  DateTime         @default(now())
}

enum Language {
  PYTHON
  C
  CPP
  JAVASCRIPT
}

enum SubmissionStatus {
  PENDING
  RUNNING
  ACCEPTED
  WRONG_ANSWER
  TIME_LIMIT
  MEMORY_LIMIT
  RUNTIME_ERROR
  COMPILE_ERROR
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/web/prisma/schema.prisma
git commit -m "feat: 建立完整 Prisma schema — 使用者、題目、知識圖譜、對話、提交"
```

---

### Task 5：Prisma Client 與 Redis Client

**Files:**
- Create: `apps/web/src/lib/prisma.ts`
- Create: `apps/web/src/lib/redis.ts`

- [ ] **Step 1: 建立 apps/web/src/lib/prisma.ts**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 2: 建立 apps/web/src/lib/redis.ts**

```typescript
import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
```

- [ ] **Step 3: 提交**

```bash
git add apps/web/src/lib/prisma.ts apps/web/src/lib/redis.ts
git commit -m "feat: 建立 Prisma 與 Redis client 單例"
```

---

### Task 6：NextAuth.js 設定

**Files:**
- Create: `apps/web/src/lib/auth.ts`

- [ ] **Step 1: 建立 apps/web/src/lib/auth.ts**

```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
```

- [ ] **Step 2: 建立 NextAuth API 路由**

Create: `apps/web/src/app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 3: 提交**

```bash
git add apps/web/src/lib/auth.ts apps/web/src/app/api/auth/
git commit -m "feat: 設定 NextAuth.js v5 — Google 與 GitHub OAuth"
```

---

### Task 7：tRPC 初始化

**Files:**
- Create: `apps/web/src/server/trpc.ts`
- Create: `apps/web/src/server/context.ts`
- Create: `apps/web/src/server/routers/user.ts`
- Create: `apps/web/src/server/router.ts`
- Create: `apps/web/src/app/api/trpc/[trpc]/route.ts`
- Create: `apps/web/src/lib/trpc-client.ts`

- [ ] **Step 1: 建立 apps/web/src/server/trpc.ts**

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});
```

- [ ] **Step 2: 建立 apps/web/src/server/context.ts**

```typescript
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
```

- [ ] **Step 3: 建立 apps/web/src/server/routers/user.ts**

```typescript
import { protectedProcedure, router } from "../trpc";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
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
    return user;
  }),
});
```

- [ ] **Step 4: 建立 apps/web/src/server/router.ts**

```typescript
import { router } from "./trpc";
import { userRouter } from "./routers/user";

export const appRouter = router({
  user: userRouter,
});

export type AppRouter = typeof appRouter;
```

- [ ] **Step 5: 建立 tRPC API 路由**

Create: `apps/web/src/app/api/trpc/[trpc]/route.ts`

```typescript
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/router";
import { createContext } from "@/server/context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
```

- [ ] **Step 6: 建立 apps/web/src/lib/trpc-client.ts**

```typescript
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/router";

export const trpc = createTRPCReact<AppRouter>();
```

- [ ] **Step 7: 提交**

```bash
git add apps/web/src/server/ apps/web/src/app/api/trpc/ apps/web/src/lib/trpc-client.ts
git commit -m "feat: 初始化 tRPC v11 — context、router、使用者端點"
```

---

### Task 8：前端 Providers 與根佈局

**Files:**
- Create: `apps/web/src/components/providers.tsx`
- Create: `apps/web/src/components/auth-button.tsx`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/globals.css`
- Create: `apps/web/src/app/dashboard/page.tsx`

- [ ] **Step 1: 建立 apps/web/src/components/providers.tsx**

```tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "@/lib/trpc-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
        }),
      ],
    })
  );

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
}
```

- [ ] **Step 2: 建立 apps/web/src/components/auth-button.tsx**

```tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-10 w-24 animate-pulse rounded bg-gray-700" />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300">{session.user.name}</span>
        <button
          onClick={() => signOut()}
          className="rounded bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
        >
          登出
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => signIn("google")}
        className="rounded bg-white px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
      >
        Google 登入
      </button>
      <button
        onClick={() => signIn("github")}
        className="rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
      >
        GitHub 登入
      </button>
    </div>
  );
}
```

- [ ] **Step 3: 建立 apps/web/src/app/globals.css**

```css
@import "tailwindcss";
```

- [ ] **Step 4: 建立 apps/web/src/app/layout.tsx**

```tsx
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SKILL Platform — AI 程式解題導師",
  description: "透過 AI 導師的蘇格拉底式引導，精進你的演算法與系統設計能力",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-gray-950 text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: 建立 apps/web/src/app/page.tsx**

```tsx
import { AuthButton } from "@/components/auth-button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          SKILL Platform
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          AI 驅動的程式解題與系統設計導師
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Systematic Knowledge & Integrated Logic Learning
        </p>
      </div>
      <AuthButton />
    </main>
  );
}
```

- [ ] **Step 6: 建立 apps/web/src/app/dashboard/page.tsx**

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold">
        歡迎回來，{session.user.name}
      </h1>
      <p className="mt-2 text-gray-400">
        你的個人儀表板（建置中）
      </p>
    </main>
  );
}
```

- [ ] **Step 7: 提交**

```bash
git add apps/web/src/components/ apps/web/src/app/
git commit -m "feat: 建立前端骨架 — Providers、認證按鈕、首頁、儀表板佔位"
```

---

### Task 9：執行引擎佔位服務

**Files:**
- Create: `services/executor/package.json`
- Create: `services/executor/tsconfig.json`
- Create: `services/executor/src/server.ts`
- Create: `services/executor/Dockerfile`

- [ ] **Step 1: 建立 services/executor/package.json**

```json
{
  "name": "@skill/executor",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "echo \"no tests yet\""
  },
  "dependencies": {
    "express": "^5.1.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0"
  }
}
```

- [ ] **Step 2: 建立 services/executor/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: 建立 services/executor/src/server.ts**

```typescript
import express from "express";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "executor" });
});

app.post("/execute", (_req, res) => {
  res.status(501).json({
    error: "尚未實作。將在 Plan 3（沙盒執行引擎）中建置。",
  });
});

app.listen(PORT, () => {
  console.log(`執行引擎服務啟動於 port ${PORT}`);
});
```

- [ ] **Step 4: 建立 services/executor/Dockerfile**

```dockerfile
FROM node:20-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/

RUN npx tsc

EXPOSE 4000

CMD ["node", "dist/server.js"]
```

- [ ] **Step 5: 提交**

```bash
git add services/executor/
git commit -m "feat: 建立執行引擎佔位服務 — 健康檢查端點"
```

---

### Task 10：Docker Compose 設定

**Files:**
- Create: `docker-compose.yml`
- Create: `apps/web/Dockerfile`

- [ ] **Step 1: 建立 docker-compose.yml**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: skill
      POSTGRES_PASSWORD: skill_password
      POSTGRES_DB: skill_platform
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U skill -d skill_platform"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://skill:skill_password@postgres:5432/skill_platform?schema=public"
      REDIS_URL: "redis://redis:6379"
      NEXTAUTH_URL: "http://localhost:3000"
      NEXTAUTH_SECRET: "${NEXTAUTH_SECRET}"
      GOOGLE_CLIENT_ID: "${GOOGLE_CLIENT_ID}"
      GOOGLE_CLIENT_SECRET: "${GOOGLE_CLIENT_SECRET}"
      GITHUB_CLIENT_ID: "${GITHUB_CLIENT_ID}"
      GITHUB_CLIENT_SECRET: "${GITHUB_CLIENT_SECRET}"
      ANTHROPIC_API_KEY: "${ANTHROPIC_API_KEY}"
      EXECUTOR_URL: "http://executor:4000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  executor:
    build:
      context: ./services/executor
      dockerfile: Dockerfile
    ports:
      - "4000:4000"

volumes:
  postgres_data:
  redis_data:
```

- [ ] **Step 2: 建立 apps/web/Dockerfile**

```dockerfile
FROM node:20-slim

WORKDIR /app

# 安裝根層依賴
COPY package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

RUN npm install --workspace=@skill/web

# 複製原始碼
COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

# 生成 Prisma client
RUN cd apps/web && npx prisma generate

# 建置
RUN cd apps/web && npm run build

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=@skill/web"]
```

- [ ] **Step 3: 提交**

```bash
git add docker-compose.yml apps/web/Dockerfile
git commit -m "feat: 建立 Docker Compose — PostgreSQL、Redis、Web、Executor"
```

---

### Task 11：安裝依賴並驗證啟動

- [ ] **Step 1: 安裝所有依賴**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer"
npm install
```

- [ ] **Step 2: 生成 Prisma client**

```bash
cd apps/web && npx prisma generate
```

- [ ] **Step 3: 啟動 Docker Compose 基礎服務（僅 DB + Redis）**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer"
docker compose up postgres redis -d
```

- [ ] **Step 4: 推送資料庫 schema**

```bash
cd apps/web && npx prisma db push
```

預期輸出：`Your database is now in sync with your Prisma schema.`

- [ ] **Step 5: 啟動 Next.js dev server 驗證**

```bash
cd apps/web && npm run dev
```

開啟 `http://localhost:3000`，預期看到 SKILL Platform 首頁與登入按鈕。

- [ ] **Step 6: 驗證 tRPC 健康（瀏覽器開發工具）**

開啟 `http://localhost:3000/api/trpc/user.me`，預期回傳 UNAUTHORIZED 錯誤（因為未登入），表示 tRPC 路由正常運作。

- [ ] **Step 7: 提交任何因安裝產生的變更**

```bash
git add package-lock.json
git commit -m "chore: 鎖定依賴版本"
```

---

### Task 12：使用者 Router 測試

**Files:**
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/__tests__/server/routers/user.test.ts`

- [ ] **Step 1: 建立 apps/web/vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 2: 寫失敗測試**

Create: `apps/web/__tests__/server/routers/user.test.ts`

```typescript
import { describe, it, expect, vi } from "vitest";
import { appRouter } from "@/server/router";
import { createCallerFactory } from "@trpc/server";

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
```

- [ ] **Step 3: 執行測試確認通過**

```bash
cd apps/web && npx vitest run
```

預期輸出：2 個測試全部通過。

- [ ] **Step 4: 提交**

```bash
git add apps/web/vitest.config.ts apps/web/__tests__/
git commit -m "test: 新增使用者 router 單元測試 — 未登入與已登入情境"
```
