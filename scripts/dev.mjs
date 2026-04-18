#!/usr/bin/env node

// ============================================================
// SKILL Platform — One-shot dev environment launcher
// Starts DB + Redis + Executor + Next.js dev server
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
  console.log("  SKILL Platform starting...");
  console.log("==============================\n");

  // Verify .env
  if (!existsSync(resolve(ROOT, ".env"))) {
    console.error("Error: .env not found. Run `npm run setup` first.");
    process.exit(1);
  }
  copyFileSync(resolve(ROOT, ".env"), resolve(ROOT, "apps/web/.env"));

  // Start Docker
  console.log("[1/3] Starting PostgreSQL and Redis...");
  run("docker compose up postgres redis -d");

  for (let i = 0; i < 20; i++) {
    try {
      runSilent("docker compose exec -T postgres pg_isready -U skill -d skill_platform");
      break;
    } catch {
      await sleep(1000);
    }
  }
  console.log("  ✓ Database services ready\n");

  // Start executor
  console.log("[2/3] Starting executor (port 4000)...");
  const executorDir = resolve(ROOT, "services/executor");
  const tsxCmd = resolve(ROOT, "node_modules", ".bin", process.platform === "win32" ? "tsx.cmd" : "tsx");
  const serverTs = resolve(executorDir, "src", "server.ts");
  const executor = spawn(
    `"${tsxCmd}"`,
    [`"${serverTs}"`],
    {
      cwd: executorDir,
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      env: { ...process.env, PORT: "4000", REDIS_URL: "redis://localhost:6379" },
    }
  );
  children.push(executor);

  executor.stdout.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg) console.log(`  [executor] ${msg}`);
  });
  executor.stderr.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg && !msg.includes("ExperimentalWarning") && !msg.includes("DeprecationWarning")) {
      console.error(`  [executor] ${msg}`);
    }
  });

  // Wait for executor to come up
  let executorReady = false;
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    try {
      const res = await fetch("http://localhost:4000/health");
      if (res.ok) {
        executorReady = true;
        break;
      }
    } catch {}
  }
  if (executorReady) {
    console.log("  ✓ Executor is up\n");
  } else {
    console.log("  ⚠ Executor startup timed out; submissions may be unavailable\n");
  }

  // Start Next.js
  console.log("[3/3] Starting Next.js (port 3001)...\n");
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

  // Graceful shutdown
  for (const sig of ["SIGINT", "SIGTERM"]) {
    process.on(sig, cleanup);
  }
}

main().catch((err) => {
  console.error("Startup failed:", err.message);
  cleanup();
});
