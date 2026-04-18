#!/usr/bin/env node

// ============================================================
// SKILL Platform — Stop all services
// ============================================================

import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

console.log("Stopping all Docker services...");
execSync("docker compose down", { cwd: ROOT, stdio: "inherit" });
console.log("✓ All services stopped");
