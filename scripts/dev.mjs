#!/usr/bin/env node

// ============================================================
// SKILL Platform — 一鍵啟動開發環境
// 啟動 DB + Redis + Next.js dev server
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
  console.log("[1/2] 啟動 PostgreSQL 與 Redis...");
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

  // 啟動 Next.js
  console.log("[2/2] 啟動 Next.js...\n");
  console.log("  ➜ http://localhost:3001\n");

  const child = spawn("npx", ["next", "dev", "-p", "3001"], {
    cwd: resolve(ROOT, "apps/web"),
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => process.exit(code ?? 0));

  // 優雅關閉
  for (const sig of ["SIGINT", "SIGTERM"]) {
    process.on(sig, () => {
      child.kill(sig);
      process.exit(0);
    });
  }
}

main().catch((err) => {
  console.error("啟動失敗:", err.message);
  process.exit(1);
});
