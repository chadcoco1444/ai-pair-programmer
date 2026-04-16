import express from "express";
import { executionQueue, executionQueueEvents, type ExecutionJob } from "./queue";
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
      executionQueueEvents,
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
