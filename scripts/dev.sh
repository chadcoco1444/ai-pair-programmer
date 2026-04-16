#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# SKILL Platform — 一鍵啟動開發環境
# 啟動 DB + Redis + Next.js dev server
# ============================================================

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "=============================="
echo "  SKILL Platform 啟動中..."
echo "=============================="
echo ""

# 1. 確認 .env 存在
if [ ! -f .env ]; then
  echo "錯誤：找不到 .env，請先執行 npm run setup"
  exit 1
fi

# 複製 .env 到 apps/web
cp .env apps/web/.env 2>/dev/null || true

# 2. 啟動 Docker 服務
echo "[1/2] 啟動 PostgreSQL 與 Redis..."
docker compose up postgres redis -d 2>/dev/null

# 等待 healthy
for i in $(seq 1 20); do
  if docker compose exec -T postgres pg_isready -U skill -d skill_platform &>/dev/null; then
    break
  fi
  sleep 1
done
echo "  ✓ 資料庫服務就緒"

# 3. 啟動 Next.js dev server
echo ""
echo "[2/2] 啟動 Next.js..."
echo ""
echo "  ➜ http://localhost:3001"
echo ""

cd apps/web
npx next dev -p 3001
