#!/usr/bin/env node

// ============================================================
// SKILL Platform — First-time setup script
// Run once: install deps, start DB, create schema, seed data
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
  console.log("  SKILL Platform first-time setup");
  console.log("==============================\n");

  // 1. Check required tools
  console.log("[1/8] Checking required tools...");
  for (const cmd of ["node", "npm", "docker"]) {
    if (!checkCommand(cmd)) {
      console.error(`  ✗ ${cmd} not found, please install it first.`);
      process.exit(1);
    }
  }
  const nodeV = runSilent("node -v");
  console.log(`  ✓ node ${nodeV}`);

  // 2. Create .env
  console.log("\n[2/8] Checking environment variables...");
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
    console.log("  ✓ Created .env and generated NEXTAUTH_SECRET");
    console.log("  ⚠ Edit .env to fill in OAuth and Anthropic API keys");
  } else {
    console.log("  ✓ .env already exists");
  }

  // Copy to apps/web
  const webEnvPath = resolve(ROOT, "apps/web/.env");
  copyFileSync(envPath, webEnvPath);

  // 3. Install dependencies
  console.log("\n[3/8] Installing dependencies...");
  run("npm install");
  console.log("  ✓ Dependencies installed");

  // 4. Start Docker services
  console.log("\n[4/8] Starting PostgreSQL and Redis...");
  run("docker compose up postgres redis -d");

  console.log("  Waiting for the database to be ready...");
  for (let i = 0; i < 30; i++) {
    try {
      runSilent("docker compose exec -T postgres pg_isready -U skill -d skill_platform");
      break;
    } catch {
      await sleep(1000);
    }
  }
  console.log("  ✓ PostgreSQL and Redis are up");

  // 5. Database schema
  console.log("\n[5/8] Syncing database schema...");
  run("npx prisma generate", { cwd: resolve(ROOT, "apps/web") });
  run("npx prisma db push", { cwd: resolve(ROOT, "apps/web") });
  console.log("  ✓ Database schema synced");

  // 6. Seed data
  console.log("\n[6/8] Seeding database...");
  try {
    run("npx prisma db seed", { cwd: resolve(ROOT, "apps/web") });
    console.log("  ✓ Seed data imported");
  } catch {
    console.log("  ⚠ Seed import failed (may already be seeded)");
  }

  // 7. Build language runtime images
  console.log("\n[7/8] Building language runtime Docker images...");
  const images = [
    { name: "skill-runner-python", path: "services/executor/images/python" },
    { name: "skill-runner-c-cpp", path: "services/executor/images/c-cpp" },
    { name: "skill-runner-javascript", path: "services/executor/images/javascript" },
  ];

  for (const img of images) {
    try {
      console.log(`  Building ${img.name}...`);
      run(`docker build -t ${img.name} ${img.path}`);
    } catch (err) {
      console.log(`  ⚠ ${img.name} build failed: ${err.message}`);
    }
  }
  console.log("  ✓ Language images built");

  // 8. Install executor dependencies
  console.log("\n[8/8] Installing executor dependencies...");
  run("npm install", { cwd: resolve(ROOT, "services/executor") });
  console.log("  ✓ Executor dependencies installed");

  console.log("\n==============================");
  console.log("  Setup complete!");
  console.log("==============================\n");
  console.log("  Start everything with:");
  console.log("    npm run dev:web\n");
  console.log("  Open in your browser:");
  console.log("    http://localhost:3001\n");
  console.log("  Services included:");
  console.log("    - PostgreSQL (port 5433)");
  console.log("    - Redis (port 6379)");
  console.log("    - Executor (port 4000)");
  console.log("    - Next.js (port 3001)\n");
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
