#!/usr/bin/env node

// ============================================================
// SKILL Platform — 停止所有服務
// ============================================================

import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

console.log("停止所有 Docker 服務...");
execSync("docker compose down", { cwd: ROOT, stdio: "inherit" });
console.log("✓ 所有服務已停止");
