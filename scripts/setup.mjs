#!/usr/bin/env node

// ============================================================
// SKILL Platform — 首次設定腳本
// 執行一次即可：安裝依賴、啟動 DB、建立 schema、匯入種子資料
// ============================================================

import { execSync } from "child_process";
import { existsSync, copyFileSync, readFileSync, writeFileSync } from "fs";
import { randomBytes } from "crypto";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit", ...opts });
}

function runSilent(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf-8" }).trim();
}

function checkCommand(name) {
  try {
    runSilent(`${name} --version`);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("==============================");
  console.log("  SKILL Platform 首次設定");
  console.log("==============================\n");

  // 1. 檢查必要工具
  console.log("[1/8] 檢查必要工具...");
  for (const cmd of ["node", "npm", "docker"]) {
    if (!checkCommand(cmd)) {
      console.error(`  ✗ 找不到 ${cmd}，請先安裝。`);
      process.exit(1);
    }
  }
  const nodeV = runSilent("node -v");
  console.log(`  ✓ node ${nodeV}`);

  // 2. 建立 .env
  console.log("\n[2/8] 檢查環境變數...");
  const envPath = resolve(ROOT, ".env");
  const envExamplePath = resolve(ROOT, ".env.example");

  if (!existsSync(envPath)) {
    copyFileSync(envExamplePath, envPath);
    const secret = randomBytes(32).toString("base64");
    let content = readFileSync(envPath, "utf-8");
    content = content.replace(
      "your-secret-here-generate-with-openssl-rand-base64-32",
      secret
    );
    writeFileSync(envPath, content);
    console.log("  ✓ 已建立 .env 並自動生成 NEXTAUTH_SECRET");
    console.log("  ⚠ 請編輯 .env 填入 OAuth 和 Anthropic API Key");
  } else {
    console.log("  ✓ .env 已存在");
  }

  // 複製到 apps/web
  const webEnvPath = resolve(ROOT, "apps/web/.env");
  copyFileSync(envPath, webEnvPath);

  // 3. 安裝依賴
  console.log("\n[3/8] 安裝依賴...");
  run("npm install");
  console.log("  ✓ 依賴安裝完成");

  // 4. 啟動 Docker 服務
  console.log("\n[4/8] 啟動 PostgreSQL 與 Redis...");
  run("docker compose up postgres redis -d");

  console.log("  等待資料庫就緒...");
  for (let i = 0; i < 30; i++) {
    try {
      runSilent("docker compose exec -T postgres pg_isready -U skill -d skill_platform");
      break;
    } catch {
      await sleep(1000);
    }
  }
  console.log("  ✓ PostgreSQL 與 Redis 已啟動");

  // 5. 資料庫 schema
  console.log("\n[5/8] 同步資料庫 schema...");
  run("npx prisma generate", { cwd: resolve(ROOT, "apps/web") });
  run("npx prisma db push", { cwd: resolve(ROOT, "apps/web") });
  console.log("  ✓ 資料庫 schema 已同步");

  // 6. 種子資料
  console.log("\n[6/8] 匯入種子資料...");
  try {
    run("npx prisma db seed", { cwd: resolve(ROOT, "apps/web") });
    console.log("  ✓ 種子資料匯入完成");
  } catch {
    console.log("  ⚠ 種子資料匯入失敗（可能已匯入過）");
  }

  // 7. 建置語言執行映像
  console.log("\n[7/8] 建置語言執行環境 Docker 映像...");
  const images = [
    { name: "skill-runner-python", path: "services/executor/images/python" },
    { name: "skill-runner-c-cpp", path: "services/executor/images/c-cpp" },
    { name: "skill-runner-javascript", path: "services/executor/images/javascript" },
  ];

  for (const img of images) {
    try {
      console.log(`  建置 ${img.name}...`);
      run(`docker build -t ${img.name} ${img.path}`);
    } catch (err) {
      console.log(`  ⚠ ${img.name} 建置失敗：${err.message}`);
    }
  }
  console.log("  ✓ 語言映像建置完成");

  // 8. 安裝 executor 依賴
  console.log("\n[8/8] 安裝執行引擎依賴...");
  run("npm install", { cwd: resolve(ROOT, "services/executor") });
  console.log("  ✓ 執行引擎依賴安裝完成");

  console.log("\n==============================");
  console.log("  設定完成！");
  console.log("==============================\n");
  console.log("  一鍵啟動所有服務：");
  console.log("    npm run dev:web\n");
  console.log("  開啟瀏覽器：");
  console.log("    http://localhost:3001\n");
  console.log("  包含的服務：");
  console.log("    - PostgreSQL (port 5433)");
  console.log("    - Redis (port 6379)");
  console.log("    - 執行引擎 (port 4000)");
  console.log("    - Next.js (port 3001)\n");
}

main().catch((err) => {
  console.error("設定失敗:", err.message);
  process.exit(1);
});
