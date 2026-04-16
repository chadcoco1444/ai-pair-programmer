#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# SKILL Platform — 停止所有服務
# ============================================================

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "停止所有 Docker 服務..."
docker compose down
echo "✓ 所有服務已停止"
