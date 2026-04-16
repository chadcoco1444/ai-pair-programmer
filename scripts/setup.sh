#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# SKILL Platform — 首次設定腳本
# 執行一次即可：安裝依賴、啟動 DB、建立 schema、匯入種子資料
# ============================================================

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "=============================="
echo "  SKILL Platform 首次設定"
echo "=============================="
echo ""

# 1. 檢查必要工具
echo "[1/6] 檢查必要工具..."
for cmd in node npm docker; do
  if ! command -v $cmd &>/dev/null; then
    echo "錯誤：找不到 $cmd，請先安裝。"
    exit 1
  fi
done
echo "  ✓ node $(node -v), npm $(npm -v), docker $(docker --version | cut -d' ' -f3)"

# 2. 建立 .env（如果不存在）
echo ""
echo "[2/6] 檢查環境變數..."
if [ ! -f .env ]; then
  cp .env.example .env
  # 自動生成 NEXTAUTH_SECRET
  SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|your-secret-here-generate-with-openssl-rand-base64-32|${SECRET}|" .env
  else
    sed -i "s|your-secret-here-generate-with-openssl-rand-base64-32|${SECRET}|" .env
  fi
  echo "  ✓ 已建立 .env 並自動生成 NEXTAUTH_SECRET"
  echo "  ⚠ 請編輯 .env 填入 OAuth 和 Anthropic API Key"
else
  echo "  ✓ .env 已存在"
fi

# 複製 .env 到 apps/web（Prisma 需要）
cp .env apps/web/.env 2>/dev/null || true

# 3. 安裝依賴
echo ""
echo "[3/6] 安裝依賴..."
npm install --silent
echo "  ✓ 依賴安裝完成"

# 4. 啟動 Docker 服務（PostgreSQL + Redis）
echo ""
echo "[4/6] 啟動 PostgreSQL 與 Redis..."
docker compose up postgres redis -d --wait 2>/dev/null || docker compose up postgres redis -d
# 等待 healthy
echo "  等待資料庫就緒..."
for i in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U skill -d skill_platform &>/dev/null; then
    break
  fi
  sleep 1
done
echo "  ✓ PostgreSQL 與 Redis 已啟動"

# 5. 資料庫 schema + Prisma client
echo ""
echo "[5/6] 同步資料庫 schema..."
cd apps/web
npx prisma generate --no-hints 2>/dev/null || npx prisma generate
npx prisma db push --skip-generate 2>/dev/null || npx prisma db push
echo "  ✓ 資料庫 schema 已同步"

# 6. 匯入種子資料
echo ""
echo "[6/6] 匯入種子資料..."
npx prisma db seed 2>/dev/null || echo "  ⚠ 種子資料匯入失敗（可能已匯入過）"
echo "  ✓ 種子資料匯入完成"

cd "$ROOT_DIR"

echo ""
echo "=============================="
echo "  設定完成！"
echo "=============================="
echo ""
echo "  啟動開發伺服器："
echo "    npm run dev:web"
echo ""
echo "  開啟瀏覽器："
echo "    http://localhost:3001"
echo ""
echo "  ⚠ 記得在 .env 中填入："
echo "    - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET"
echo "    - GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET"
echo "    - ANTHROPIC_API_KEY"
echo ""
