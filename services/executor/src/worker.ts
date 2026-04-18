import { Worker } from "bullmq";
import Redis from "ioredis";
import Docker from "dockerode";
import type { ExecutionJob } from "./queue";
import type { RunConfig, RunResult, JudgeResult, TestCaseInput } from "./runners/types";
import { runPython } from "./runners/python";
import { runC, compileC, runCCompiled } from "./runners/c";
import { runCpp, compileCpp, runCppCompiled } from "./runners/cpp";
import { runJavaScript } from "./runners/javascript";
import { judgeSubmission } from "./judge";

const docker = new Docker();

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
      compileError: `Unsupported language: ${language}`,
    };
  }

  const results: { testCase: TestCaseInput; runResult: RunResult }[] = [];

  // Compile once for C/C++ (reuse image across all test cases)
  let cachedImage: string | undefined;
  if (language === "CPP") {
    const compile = await compileCpp(code);
    if (!compile.success) return judgeSubmission([], compile.error);
    cachedImage = compile.image;
  } else if (language === "C") {
    const compile = await compileC(code);
    if (!compile.success) return judgeSubmission([], compile.error);
    cachedImage = compile.image;
  }

  for (const tc of testCases) {
    const config: RunConfig = {
      language,
      code,
      input: tc.input,
      args: tc.args ?? [],
      timeout,
      memoryLimit,
    };

    let runResult: RunResult & { compileError?: string };
    if (language === "CPP" && cachedImage) {
      runResult = await runCppCompiled(cachedImage, config.args, timeout, memoryLimit);
    } else if (language === "C" && cachedImage) {
      runResult = await runCCompiled(cachedImage, config.args, timeout, memoryLimit);
    } else {
      runResult = await runner(config);
    }

    // Check for a compile error
    if ("compileError" in runResult && runResult.compileError) {
      return judgeSubmission([], runResult.compileError);
    }

    results.push({ testCase: tc, runResult });

    // Stop running remaining test cases on timeout or OOM
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
      concurrency: 1,
      limiter: {
        max: 5,
        duration: 1000,
      },
    }
  );

  worker.on("completed", (job, result) => {
    console.log(`Job ${job.id} completed: ${result.status}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  console.log("Executor worker started, waiting for jobs...");

  return worker;
}
