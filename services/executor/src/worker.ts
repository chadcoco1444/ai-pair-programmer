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
