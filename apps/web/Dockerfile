FROM node:20-slim

WORKDIR /app

# 安裝根層依賴
COPY package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

RUN npm install --workspace=@skill/web

# 複製原始碼
COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

# 生成 Prisma client
RUN cd apps/web && npx prisma generate

# 建置
RUN cd apps/web && npm run build

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=@skill/web"]
