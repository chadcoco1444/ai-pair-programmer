# Plan 3：沙盒執行引擎 — 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目標：** 將 `services/executor` 從佔位服務升級為完整的程式碼沙盒執行引擎，支援 Python、C、C++、JavaScript 四種語言，在隔離的 Docker 容器中安全執行使用者程式碼。

**架構：** Express HTTP API 接收程式碼提交，透過 BullMQ 佇列管理任務，使用 Dockerode 建立隔離容器執行程式碼，將結果回傳。每個語言有預建的 Docker 映像。

**技術棧：** Express 5, BullMQ, Dockerode, Docker, Vitest

---

## 檔案結構

```
services/executor/
├── package.json                    # 更新依賴
├── Dockerfile                      # 更新
├── src/
│   ├── server.ts                   # 重寫：完整 API
│   ├── queue.ts                    # BullMQ 佇列設定
│   ├── worker.ts                   # BullMQ worker
│   ├── sandbox.ts                  # Docker 容器管理
│   ├── runners/
│   │   ├── types.ts                # Runner 介面定義
│   │   ├── python.ts               # Python runner
│   │   ├── c.ts                    # C runner
│   │   ├── cpp.ts                  # C++ runner
│   │   └── javascript.ts           # JavaScript runner
│   └── judge.ts                    # 判題邏輯（比對輸出）
├── images/
│   ├── python/Dockerfile           # Python 執行環境
│   ├── c-cpp/Dockerfile            # C/C++ 執行環境
│   └── javascript/Dockerfile       # JavaScript 執行環境
└── __tests__/
    ├── judge.test.ts               # 判題邏輯測試
    └── runners.test.ts             # Runner 整合測試
apps/web/
└── src/server/services/
    └── execution-client.ts         # Web 端呼叫執行引擎的 client
```

---

### Task 1：語言執行環境 Docker 映像

**Files:**
- Create: `services/executor/images/python/Dockerfile`
- Create: `services/executor/images/c-cpp/Dockerfile`
- Create: `services/executor/images/javascript/Dockerfile`

- [ ] **Step 1: 建立 services/executor/images/python/Dockerfile**

```dockerfile
FROM python:3.12-slim

RUN useradd -m -s /bin/bash runner

WORKDIR /home/runner

USER runner
```

- [ ] **Step 2: 建立 services/executor/images/c-cpp/Dockerfile**

```dockerfile
FROM gcc:13-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    time \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash runner

WORKDIR /home/runner

USER runner
```

- [ ] **Step 3: 建立 services/executor/images/javascript/Dockerfile**

```dockerfile
FROM node:20-slim

RUN useradd -m -s /bin/bash runner

WORKDIR /home/runner

USER runner
```

- [ ] **Step 4: 提交**

```bash
git add services/executor/images/
git commit -m "feat: 新增語言執行環境 Docker 映像 — Python、C/C++、JavaScript"
```

---

### Task 2：Runner 型別定義與判題邏輯

**Files:**
- Create: `services/executor/src/runners/types.ts`
- Create: `services/executor/src/judge.ts`

- [ ] **Step 1: 建立 services/executor/src/runners/types.ts**

```typescript
export interface RunConfig {
  language: "PYTHON" | "C" | "CPP" | "JAVASCRIPT";
  code: string;
  input: string;
  timeout: number;  // 毫秒
  memoryLimit: number;  // MB
}

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  runtime: number;   // 毫秒
  memory: number;    // KB
  timedOut: boolean;
  oomKilled: boolean;
}

export interface TestCaseInput {
  id: string;
  input: string;
  expected: string;
  isHidden: boolean;
  isKiller: boolean;
}

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  runtime: number;
  memory: number;
}

export type SubmissionStatus =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT"
  | "MEMORY_LIMIT"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR";

export interface JudgeResult {
  status: SubmissionStatus;
  testResults: TestCaseResult[];
  totalRuntime: number;
  totalMemory: number;
  compileError?: string;
}

export const LANGUAGE_CONFIG = {
  PYTHON: {
    image: "skill-runner-python",
    extension: ".py",
    needsCompile: false,
    compileCmd: null,
    runCmd: (file: string) => `python3 ${file}`,
  },
  C: {
    image: "skill-runner-c-cpp",
    extension: ".c",
    needsCompile: true,
    compileCmd: (file: string) => `gcc -O2 -Wall -pthread -lm -o /tmp/solution ${file}`,
    runCmd: () => "/tmp/solution",
  },
  CPP: {
    image: "skill-runner-c-cpp",
    extension: ".cpp",
    needsCompile: true,
    compileCmd: (file: string) => `g++ -O2 -std=c++20 -Wall -pthread -o /tmp/solution ${file}`,
    runCmd: () => "/tmp/solution",
  },
  JAVASCRIPT: {
    image: "skill-runner-javascript",
    extension: ".js",
    needsCompile: false,
    compileCmd: null,
    runCmd: (file: string) => `node ${file}`,
  },
} as const;
```

- [ ] **Step 2: 建立 services/executor/src/judge.ts**

```typescript
import type { TestCaseInput, TestCaseResult, JudgeResult, RunResult } from "./runners/types";

function normalizeOutput(output: string): string {
  return output.trim().replace(/\r\n/g, "\n");
}

export function judgeTestCase(
  testCase: TestCaseInput,
  runResult: RunResult
): TestCaseResult {
  const actual = normalizeOutput(runResult.stdout);
  const expected = normalizeOutput(testCase.expected);

  return {
    testCaseId: testCase.id,
    passed: actual === expected,
    input: testCase.isHidden ? "[隱藏]" : testCase.input,
    expected: testCase.isHidden ? "[隱藏]" : testCase.expected,
    actual: testCase.isHidden ? (actual === expected ? "[正確]" : "[錯誤]") : actual,
    runtime: runResult.runtime,
    memory: runResult.memory,
  };
}

export function judgeSubmission(
  testCaseResults: { testCase: TestCaseInput; runResult: RunResult }[],
  compileError?: string
): JudgeResult {
  if (compileError) {
    return {
      status: "COMPILE_ERROR",
      testResults: [],
      totalRuntime: 0,
      totalMemory: 0,
      compileError,
    };
  }

  const results: TestCaseResult[] = [];
  let totalRuntime = 0;
  let totalMemory = 0;
  let status: JudgeResult["status"] = "ACCEPTED";

  for (const { testCase, runResult } of testCaseResults) {
    const result = judgeTestCase(testCase, runResult);
    results.push(result);
    totalRuntime += result.runtime;
    totalMemory = Math.max(totalMemory, result.memory);

    if (runResult.timedOut) {
      status = "TIME_LIMIT";
      break;
    }
    if (runResult.oomKilled) {
      status = "MEMORY_LIMIT";
      break;
    }
    if (runResult.exitCode !== 0) {
      status = "RUNTIME_ERROR";
      break;
    }
    if (!result.passed) {
      status = "WRONG_ANSWER";
    }
  }

  return { status, testResults: results, totalRuntime, totalMemory };
}
```

- [ ] **Step 3: 提交**

```bash
git add services/executor/src/runners/types.ts services/executor/src/judge.ts
git commit -m "feat: 定義 Runner 型別與判題邏輯"
```

---

### Task 3：沙盒容器管理

**Files:**
- Create: `services/executor/src/sandbox.ts`

- [ ] **Step 1: 建立 services/executor/src/sandbox.ts**

```typescript
import Docker from "dockerode";
import { Readable } from "stream";
import type { RunConfig, RunResult, LANGUAGE_CONFIG } from "./runners/types";

const docker = new Docker();

interface SandboxOptions {
  image: string;
  command: string[];
  stdin: string;
  timeout: number;
  memoryLimit: number;
}

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export async function runInSandbox(options: SandboxOptions): Promise<RunResult> {
  const { image, command, stdin, timeout, memoryLimit } = options;

  const startTime = Date.now();

  const container = await docker.createContainer({
    Image: image,
    Cmd: command,
    OpenStdin: true,
    StdinOnce: true,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    NetworkDisabled: true,
    HostConfig: {
      Memory: memoryLimit * 1024 * 1024,
      MemorySwap: memoryLimit * 1024 * 1024,
      PidsLimit: 50,
      ReadonlyRootfs: false,
      CapDrop: ["ALL"],
      SecurityOpt: ["no-new-privileges"],
    },
    User: "runner",
  });

  let timedOut = false;
  let oomKilled = false;

  try {
    const stream = await container.attach({
      stream: true,
      stdin: true,
      stdout: true,
      stderr: true,
      hijack: true,
    });

    await container.start();

    // 寫入 stdin
    const stdinStream = new Readable();
    stdinStream.push(stdin);
    stdinStream.push(null);
    stdinStream.pipe(stream);

    // 設定超時
    const timeoutId = setTimeout(async () => {
      timedOut = true;
      try {
        await container.kill();
      } catch {
        // 容器可能已經停止
      }
    }, timeout);

    // 等待容器結束
    const waitResult = await container.wait();
    clearTimeout(timeoutId);

    // 取得輸出
    const logs = await container.logs({ stdout: true, stderr: true });
    const output = logs.toString("utf-8");

    // 分離 stdout 和 stderr（簡化處理）
    const stdout = output;
    const stderr = "";

    // 檢查 OOM
    const inspectResult = await container.inspect();
    oomKilled = inspectResult.State.OOMKilled || false;

    const runtime = Date.now() - startTime;
    const memoryUsage = inspectResult.HostConfig?.Memory
      ? Math.round((inspectResult.HostConfig.Memory || 0) / 1024)
      : 0;

    return {
      stdout,
      stderr,
      exitCode: waitResult.StatusCode,
      runtime,
      memory: memoryUsage,
      timedOut,
      oomKilled,
    };
  } finally {
    try {
      await container.remove({ force: true });
    } catch {
      // 忽略移除失敗
    }
  }
}

export async function compileInSandbox(
  image: string,
  code: string,
  filename: string,
  compileCmd: string,
  timeout: number
): Promise<{ success: boolean; error?: string; compiledImage?: string }> {
  const container = await docker.createContainer({
    Image: image,
    Cmd: ["sh", "-c", `cat > /tmp/${filename} && ${compileCmd}`],
    OpenStdin: true,
    StdinOnce: true,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    NetworkDisabled: true,
    HostConfig: {
      Memory: 512 * 1024 * 1024,
      PidsLimit: 50,
    },
  });

  try {
    const stream = await container.attach({
      stream: true,
      stdin: true,
      stdout: true,
      stderr: true,
      hijack: true,
    });

    await container.start();

    const stdinStream = new Readable();
    stdinStream.push(code);
    stdinStream.push(null);
    stdinStream.pipe(stream);

    const timeoutId = setTimeout(async () => {
      try { await container.kill(); } catch {}
    }, timeout);

    const waitResult = await container.wait();
    clearTimeout(timeoutId);

    if (waitResult.StatusCode !== 0) {
      const logs = await container.logs({ stdout: true, stderr: true });
      return { success: false, error: logs.toString("utf-8") };
    }

    // 將編譯好的容器 commit 為新映像
    const committedImage = await container.commit({
      repo: "skill-compiled",
      tag: Date.now().toString(),
    });

    return { success: true, compiledImage: `skill-compiled:${Date.now()}` };
  } finally {
    try {
      await container.remove({ force: true });
    } catch {}
  }
}

export async function ensureImagesExist(): Promise<void> {
  const images = ["skill-runner-python", "skill-runner-c-cpp", "skill-runner-javascript"];

  for (const imageName of images) {
    try {
      await docker.getImage(imageName).inspect();
    } catch {
      console.warn(`映像 ${imageName} 不存在。請先建置語言映像。`);
    }
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add services/executor/src/sandbox.ts
git commit -m "feat: 建立沙盒容器管理 — Docker 容器建立、執行、清理"
```

---

### Task 4：各語言 Runner 實作

**Files:**
- Create: `services/executor/src/runners/python.ts`
- Create: `services/executor/src/runners/c.ts`
- Create: `services/executor/src/runners/cpp.ts`
- Create: `services/executor/src/runners/javascript.ts`

- [ ] **Step 1: 建立 services/executor/src/runners/python.ts**

```typescript
import { runInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";

export async function runPython(config: RunConfig): Promise<RunResult> {
  const lang = LANGUAGE_CONFIG.PYTHON;

  return runInSandbox({
    image: lang.image,
    command: ["sh", "-c", `cat > /tmp/solution.py && ${lang.runCmd("/tmp/solution.py")}`],
    stdin: config.code + "\n---STDIN---\n" + config.input,
    timeout: config.timeout,
    memoryLimit: config.memoryLimit,
  });
}
```

- [ ] **Step 2: 建立 services/executor/src/runners/c.ts**

```typescript
import { runInSandbox, compileInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";

export async function runC(config: RunConfig): Promise<RunResult & { compileError?: string }> {
  const lang = LANGUAGE_CONFIG.C;
  const filename = `solution${lang.extension}`;
  const compileCmd = lang.compileCmd!(filename);

  // 編譯階段
  const compileResult = await compileInSandbox(
    lang.image,
    config.code,
    filename,
    compileCmd,
    30000
  );

  if (!compileResult.success) {
    return {
      stdout: "",
      stderr: compileResult.error || "編譯失敗",
      exitCode: 1,
      runtime: 0,
      memory: 0,
      timedOut: false,
      oomKilled: false,
      compileError: compileResult.error,
    };
  }

  // 執行階段
  const result = await runInSandbox({
    image: compileResult.compiledImage!,
    command: ["sh", "-c", lang.runCmd()],
    stdin: config.input,
    timeout: config.timeout,
    memoryLimit: config.memoryLimit,
  });

  return result;
}
```

- [ ] **Step 3: 建立 services/executor/src/runners/cpp.ts**

```typescript
import { runInSandbox, compileInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";

export async function runCpp(config: RunConfig): Promise<RunResult & { compileError?: string }> {
  const lang = LANGUAGE_CONFIG.CPP;
  const filename = `solution${lang.extension}`;
  const compileCmd = lang.compileCmd!(filename);

  const compileResult = await compileInSandbox(
    lang.image,
    config.code,
    filename,
    compileCmd,
    30000
  );

  if (!compileResult.success) {
    return {
      stdout: "",
      stderr: compileResult.error || "編譯失敗",
      exitCode: 1,
      runtime: 0,
      memory: 0,
      timedOut: false,
      oomKilled: false,
      compileError: compileResult.error,
    };
  }

  const result = await runInSandbox({
    image: compileResult.compiledImage!,
    command: ["sh", "-c", lang.runCmd()],
    stdin: config.input,
    timeout: config.timeout,
    memoryLimit: config.memoryLimit,
  });

  return result;
}
```

- [ ] **Step 4: 建立 services/executor/src/runners/javascript.ts**

```typescript
import { runInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";

export async function runJavaScript(config: RunConfig): Promise<RunResult> {
  const lang = LANGUAGE_CONFIG.JAVASCRIPT;

  return runInSandbox({
    image: lang.image,
    command: ["sh", "-c", `cat > /tmp/solution.js && ${lang.runCmd("/tmp/solution.js")}`],
    stdin: config.code + "\n---STDIN---\n" + config.input,
    timeout: config.timeout,
    memoryLimit: config.memoryLimit,
  });
}
```

- [ ] **Step 5: 提交**

```bash
git add services/executor/src/runners/
git commit -m "feat: 實作四語言 Runner — Python、C、C++、JavaScript"
```

---

### Task 5：BullMQ 佇列與 Worker

**Files:**
- Create: `services/executor/src/queue.ts`
- Create: `services/executor/src/worker.ts`

- [ ] **Step 1: 更新 services/executor/package.json**

新增依賴：

```json
"dependencies": {
  "express": "^5.1.0",
  "bullmq": "^5.40.0",
  "dockerode": "^4.0.0",
  "ioredis": "^5.6.0"
},
"devDependencies": {
  "typescript": "^5.7.0",
  "@types/express": "^5.0.0",
  "@types/dockerode": "^3.3.0",
  "@types/node": "^22.0.0",
  "tsx": "^4.19.0",
  "vitest": "^3.1.0"
}
```

- [ ] **Step 2: 建立 services/executor/src/queue.ts**

```typescript
import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export interface ExecutionJob {
  submissionId: string;
  language: "PYTHON" | "C" | "CPP" | "JAVASCRIPT";
  code: string;
  testCases: {
    id: string;
    input: string;
    expected: string;
    isHidden: boolean;
    isKiller: boolean;
  }[];
  timeout: number;
  memoryLimit: number;
}

export const executionQueue = new Queue<ExecutionJob>("execution", {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
    attempts: 1,
  },
});
```

- [ ] **Step 3: 建立 services/executor/src/worker.ts**

```typescript
import { Worker } from "bullmq";
import Redis from "ioredis";
import type { ExecutionJob } from "./queue";
import type { RunConfig, RunResult, JudgeResult, TestCaseInput } from "./runners/types";
import { runPython } from "./runners/python";
import { runC } from "./runners/c";
import { runCpp } from "./runners/cpp";
import { runJavaScript } from "./runners/javascript";
import { judgeSubmission } from "./judge";

const connection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

type RunnerFn = (config: RunConfig) => Promise<RunResult & { compileError?: string }>;

const runners: Record<string, RunnerFn> = {
  PYTHON: runPython as RunnerFn,
  C: runC,
  CPP: runCpp,
  JAVASCRIPT: runJavaScript as RunnerFn,
};

async function processJob(job: { data: ExecutionJob }): Promise<JudgeResult> {
  const { language, code, testCases, timeout, memoryLimit } = job.data;

  const runner = runners[language];
  if (!runner) {
    return {
      status: "COMPILE_ERROR",
      testResults: [],
      totalRuntime: 0,
      totalMemory: 0,
      compileError: `不支援的語言: ${language}`,
    };
  }

  const results: { testCase: TestCaseInput; runResult: RunResult }[] = [];

  for (const tc of testCases) {
    const config: RunConfig = {
      language,
      code,
      input: tc.input,
      timeout,
      memoryLimit,
    };

    const runResult = await runner(config);

    // 檢查是否有編譯錯誤
    if ("compileError" in runResult && runResult.compileError) {
      return judgeSubmission([], runResult.compileError);
    }

    results.push({ testCase: tc, runResult });

    // 如果超時或 OOM，停止執行後續測資
    if (runResult.timedOut || runResult.oomKilled || runResult.exitCode !== 0) {
      break;
    }
  }

  return judgeSubmission(results);
}

export function startWorker(): Worker {
  const worker = new Worker<ExecutionJob, JudgeResult>(
    "execution",
    async (job) => processJob(job),
    {
      connection,
      concurrency: 3,
      limiter: {
        max: 5,
        duration: 1000,
      },
    }
  );

  worker.on("completed", (job, result) => {
    console.log(`任務 ${job.id} 完成: ${result.status}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`任務 ${job?.id} 失敗:`, err.message);
  });

  console.log("執行 Worker 已啟動，等待任務...");

  return worker;
}
```

- [ ] **Step 4: 提交**

```bash
git add services/executor/src/queue.ts services/executor/src/worker.ts services/executor/package.json
git commit -m "feat: 建立 BullMQ 佇列與 Worker — 任務排程與執行"
```

---

### Task 6：重寫 Server API

**Files:**
- Modify: `services/executor/src/server.ts`

- [ ] **Step 1: 重寫 services/executor/src/server.ts**

```typescript
import express from "express";
import { executionQueue, type ExecutionJob } from "./queue";
import { startWorker } from "./worker";
import { ensureImagesExist } from "./sandbox";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(express.json({ limit: "1mb" }));

// 健康檢查
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "executor" });
});

// 提交程式碼執行
app.post("/execute", async (req, res) => {
  const { submissionId, language, code, testCases, timeout, memoryLimit } = req.body as ExecutionJob;

  if (!submissionId || !language || !code || !testCases) {
    res.status(400).json({ error: "缺少必要欄位: submissionId, language, code, testCases" });
    return;
  }

  const supportedLanguages = ["PYTHON", "C", "CPP", "JAVASCRIPT"];
  if (!supportedLanguages.includes(language)) {
    res.status(400).json({ error: `不支援的語言: ${language}` });
    return;
  }

  const job = await executionQueue.add("execute", {
    submissionId,
    language,
    code,
    testCases,
    timeout: timeout ?? 10000,
    memoryLimit: memoryLimit ?? 256,
  });

  res.json({
    jobId: job.id,
    submissionId,
    message: "任務已加入佇列",
  });
});

// 查詢任務狀態
app.get("/status/:jobId", async (req, res) => {
  const job = await executionQueue.getJob(req.params.jobId);

  if (!job) {
    res.status(404).json({ error: "找不到任務" });
    return;
  }

  const state = await job.getState();
  const result = job.returnvalue;

  res.json({
    jobId: job.id,
    state,
    result: state === "completed" ? result : null,
    failedReason: state === "failed" ? job.failedReason : null,
  });
});

// 同步執行（等待結果）
app.post("/execute/sync", async (req, res) => {
  const { submissionId, language, code, testCases, timeout, memoryLimit } = req.body as ExecutionJob;

  if (!submissionId || !language || !code || !testCases) {
    res.status(400).json({ error: "缺少必要欄位" });
    return;
  }

  const job = await executionQueue.add("execute", {
    submissionId,
    language,
    code,
    testCases,
    timeout: timeout ?? 10000,
    memoryLimit: memoryLimit ?? 256,
  });

  try {
    const result = await job.waitUntilFinished(
      executionQueue.events,
      30000
    );
    res.json({ submissionId, ...result });
  } catch (err: any) {
    res.status(500).json({
      submissionId,
      status: "RUNTIME_ERROR",
      error: err.message,
    });
  }
});

// 啟動
async function start() {
  await ensureImagesExist();
  startWorker();

  app.listen(PORT, () => {
    console.log(`執行引擎服務啟動於 port ${PORT}`);
  });
}

start().catch(console.error);
```

- [ ] **Step 2: 提交**

```bash
git add services/executor/src/server.ts
git commit -m "feat: 重寫執行引擎 API — /execute、/execute/sync、/status"
```

---

### Task 7：Web 端 Execution Client

**Files:**
- Create: `apps/web/src/server/services/execution-client.ts`

- [ ] **Step 1: 建立 apps/web/src/server/services/execution-client.ts**

```typescript
const EXECUTOR_URL = process.env.EXECUTOR_URL ?? "http://localhost:4000";

export interface ExecuteRequest {
  submissionId: string;
  language: "PYTHON" | "C" | "CPP" | "JAVASCRIPT";
  code: string;
  testCases: {
    id: string;
    input: string;
    expected: string;
    isHidden: boolean;
    isKiller: boolean;
  }[];
  timeout?: number;
  memoryLimit?: number;
}

export interface ExecuteResult {
  submissionId: string;
  status: string;
  testResults: {
    testCaseId: string;
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    runtime: number;
    memory: number;
  }[];
  totalRuntime: number;
  totalMemory: number;
  compileError?: string;
}

export class ExecutionClient {
  // 同步執行（等待結果）
  async executeSync(request: ExecuteRequest): Promise<ExecuteResult> {
    const response = await fetch(`${EXECUTOR_URL}/execute/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `執行引擎錯誤: ${response.status}`);
    }

    return response.json();
  }

  // 非同步執行（放入佇列）
  async executeAsync(request: ExecuteRequest): Promise<{ jobId: string }> {
    const response = await fetch(`${EXECUTOR_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `執行引擎錯誤: ${response.status}`);
    }

    return response.json();
  }

  // 查詢任務狀態
  async getStatus(jobId: string): Promise<{
    jobId: string;
    state: string;
    result: ExecuteResult | null;
    failedReason: string | null;
  }> {
    const response = await fetch(`${EXECUTOR_URL}/status/${jobId}`);

    if (!response.ok) {
      throw new Error(`查詢失敗: ${response.status}`);
    }

    return response.json();
  }

  // 健康檢查
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${EXECUTOR_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/server/services/execution-client.ts
git commit -m "feat: 建立 ExecutionClient — Web 端呼叫執行引擎"
```

---

### Task 8：判題邏輯單元測試

**Files:**
- Create: `services/executor/__tests__/judge.test.ts`

- [ ] **Step 1: 建立 services/executor/vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
});
```

- [ ] **Step 2: 建立 services/executor/__tests__/judge.test.ts**

```typescript
import { describe, it, expect } from "vitest";
import { judgeTestCase, judgeSubmission } from "../src/judge";
import type { TestCaseInput, RunResult } from "../src/runners/types";

const makeTestCase = (overrides: Partial<TestCaseInput> = {}): TestCaseInput => ({
  id: "tc-1",
  input: "test input",
  expected: "expected output",
  isHidden: false,
  isKiller: false,
  ...overrides,
});

const makeRunResult = (overrides: Partial<RunResult> = {}): RunResult => ({
  stdout: "expected output",
  stderr: "",
  exitCode: 0,
  runtime: 50,
  memory: 1024,
  timedOut: false,
  oomKilled: false,
  ...overrides,
});

describe("judgeTestCase", () => {
  it("輸出正確時應通過", () => {
    const result = judgeTestCase(makeTestCase(), makeRunResult());
    expect(result.passed).toBe(true);
  });

  it("輸出錯誤時應不通過", () => {
    const result = judgeTestCase(
      makeTestCase(),
      makeRunResult({ stdout: "wrong output" })
    );
    expect(result.passed).toBe(false);
  });

  it("應忽略尾部空白", () => {
    const result = judgeTestCase(
      makeTestCase({ expected: "hello\n" }),
      makeRunResult({ stdout: "hello  \n  " })
    );
    expect(result.passed).toBe(true);
  });

  it("隱藏測資不應顯示 input/expected", () => {
    const result = judgeTestCase(
      makeTestCase({ isHidden: true }),
      makeRunResult()
    );
    expect(result.input).toBe("[隱藏]");
    expect(result.expected).toBe("[隱藏]");
    expect(result.actual).toBe("[正確]");
  });

  it("隱藏測資答案錯誤時應顯示 [錯誤]", () => {
    const result = judgeTestCase(
      makeTestCase({ isHidden: true }),
      makeRunResult({ stdout: "wrong" })
    );
    expect(result.actual).toBe("[錯誤]");
  });
});

describe("judgeSubmission", () => {
  it("所有測資通過時應為 ACCEPTED", () => {
    const result = judgeSubmission([
      { testCase: makeTestCase(), runResult: makeRunResult() },
      { testCase: makeTestCase({ id: "tc-2" }), runResult: makeRunResult() },
    ]);
    expect(result.status).toBe("ACCEPTED");
  });

  it("有測資不通過時應為 WRONG_ANSWER", () => {
    const result = judgeSubmission([
      { testCase: makeTestCase(), runResult: makeRunResult() },
      { testCase: makeTestCase({ id: "tc-2" }), runResult: makeRunResult({ stdout: "wrong" }) },
    ]);
    expect(result.status).toBe("WRONG_ANSWER");
  });

  it("超時應為 TIME_LIMIT", () => {
    const result = judgeSubmission([
      { testCase: makeTestCase(), runResult: makeRunResult({ timedOut: true }) },
    ]);
    expect(result.status).toBe("TIME_LIMIT");
  });

  it("OOM 應為 MEMORY_LIMIT", () => {
    const result = judgeSubmission([
      { testCase: makeTestCase(), runResult: makeRunResult({ oomKilled: true }) },
    ]);
    expect(result.status).toBe("MEMORY_LIMIT");
  });

  it("非零 exit code 應為 RUNTIME_ERROR", () => {
    const result = judgeSubmission([
      { testCase: makeTestCase(), runResult: makeRunResult({ exitCode: 1 }) },
    ]);
    expect(result.status).toBe("RUNTIME_ERROR");
  });

  it("編譯錯誤應為 COMPILE_ERROR", () => {
    const result = judgeSubmission([], "error: undeclared identifier");
    expect(result.status).toBe("COMPILE_ERROR");
    expect(result.compileError).toContain("undeclared identifier");
  });
});
```

- [ ] **Step 3: 執行測試**

```bash
cd services/executor && npx vitest run
```

預期：所有測試通過。

- [ ] **Step 4: 提交**

```bash
git add services/executor/vitest.config.ts services/executor/__tests__/
git commit -m "test: 新增判題邏輯單元測試 — 11 個測試案例"
```

---

### Task 9：更新 Docker Compose 與建置映像

**Files:**
- Modify: `docker-compose.yml`
- Modify: `services/executor/Dockerfile`

- [ ] **Step 1: 更新 docker-compose.yml 中的 executor 服務**

將 executor 服務改為：

```yaml
  executor:
    build:
      context: ./services/executor
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      REDIS_URL: "redis://redis:6379"
      PORT: "4000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      redis:
        condition: service_healthy
```

- [ ] **Step 2: 更新 services/executor/Dockerfile**

```dockerfile
FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/

RUN npx tsc

EXPOSE 4000

CMD ["node", "dist/server.js"]
```

- [ ] **Step 3: 提交**

```bash
git add docker-compose.yml services/executor/Dockerfile
git commit -m "feat: 更新 Docker Compose — executor 掛載 Docker socket 並連接 Redis"
```
