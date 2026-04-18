import express from "express";
import { executionQueue, executionQueueEvents, type ExecutionJob } from "./queue";
import { startWorker } from "./worker";
import { ensureImagesExist } from "./sandbox";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "executor" });
});

// Submit code for execution
app.post("/execute", async (req, res) => {
  const { submissionId, language, code, testCases, timeout, memoryLimit } = req.body as ExecutionJob;

  if (!submissionId || !language || !code || !testCases) {
    res.status(400).json({ error: "Missing required fields: submissionId, language, code, testCases" });
    return;
  }

  const supportedLanguages = ["PYTHON", "C", "CPP", "JAVASCRIPT"];
  if (!supportedLanguages.includes(language)) {
    res.status(400).json({ error: `Unsupported language: ${language}` });
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
    message: "Job queued",
  });
});

// Query job status
app.get("/status/:jobId", async (req, res) => {
  const job = await executionQueue.getJob(req.params.jobId);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
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

// Synchronous execution (waits for result)
app.post("/execute/sync", async (req, res) => {
  const { submissionId, language, code, testCases, timeout, memoryLimit } = req.body as ExecutionJob;

  if (!submissionId || !language || !code || !testCases) {
    res.status(400).json({ error: "Missing required fields" });
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
      executionQueueEvents,
      120000
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

// Startup
async function start() {
  await ensureImagesExist();
  startWorker();

  app.listen(PORT, () => {
    console.log(`Executor service listening on port ${PORT}`);
  });
}

start().catch(console.error);
