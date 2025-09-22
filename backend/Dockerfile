# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./
COPY src/prisma ./prisma/

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 生成 Prisma Client
RUN npx prisma generate

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产环境
FROM node:18-alpine AS production

WORKDIR /app

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

# 复制构建产物和必要文件
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# 创建上传目录
RUN mkdir -p /app/uploads

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["npm", "run", "start:prod"]