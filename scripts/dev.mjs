#!/usr/bin/env node

// ============================================================
// SKILL Platform — 一鍵啟動開發環境
// 啟動 DB + Redis + Executor + Next.js dev server
// ============================================================

import { execSync, spawn } from "child_process";
import { existsSync, copyFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function run(cmd, opts = {}) {
  execSync(cmd, { cwd: ROOT, stdio: "inherit", ...opts });
}

function runSilent(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf-8" }).trim();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const children = [];

function cleanup() {
  for (const child of children) {
    try { child.kill(); } catch {}
  }
  process.exit(0);
}

async function main() {
  console.log("==============================");
  console.log("  SKILL Platform 啟動中...");
  console.log("==============================\n");

  // 確認 .env
  if (!existsSync(resolve(ROOT, ".env"))) {
    console.error("錯誤：找不到 .env，請先執行 npm run setup");
    process.exit(1);
  }
  copyFileSync(resolve(ROOT, ".env"), resolve(ROOT, "apps/web/.env"));

  // 啟動 Docker
  console.log("[1/3] 啟動 PostgreSQL 與 Redis...");
  run("docker compose up postgres redis -d");

  for (let i = 0; i < 20; i++) {
    try {
      runSilent("docker compose exec -T postgres pg_isready -U skill -d skill_platform");
      break;
    } catch {
      await sleep(1000);
    }
  }
  console.log("  ✓ 資料庫服務就緒\n");

  // 啟動 Executor
  console.log("[2/3] 啟動執行引擎 (port 4000)...");
  const executor = spawn("npx", ["tsx", "watch", "src/server.ts"], {
    cwd: resolve(ROOT, "services/executor"),
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
    env: { ...process.env, PORT: "4000", REDIS_URL: "redis://localhost:6379" },
  });
  children.push(executor);

  executor.stdout.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg) console.log(`  [executor] ${msg}`);
  });
  executor.stderr.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg && !msg.includes("ExperimentalWarning")) {
      console.error(`  [executor] ${msg}`);
    }
  });

  // 等一下讓 executor 啟動
  await sleep(2000);
  console.log("  ✓ 執行引擎已啟動\n");

  // 啟動 Next.js
  console.log("[3/3] 啟動 Next.js (port 3001)...\n");
  console.log("  ➜ http://localhost:3001\n");

  const next = spawn("npx", ["next", "dev", "-p", "3001"], {
    cwd: resolve(ROOT, "apps/web"),
    stdio: "inherit",
    shell: true,
  });
  children.push(next);

  next.on("exit", (code) => {
    cleanup();
  });

  // 優雅關閉
  for (const sig of ["SIGINT", "SIGTERM"]) {
    process.on(sig, cleanup);
  }
}

main().catch((err) => {
  console.error("啟動失敗:", err.message);
  cleanup();
});
