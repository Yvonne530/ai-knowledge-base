# AI智能知识库管理系统

> 基于RAG技术的文档问答系统 - 全栈开发实习生考察项目

[![CI/CD](https://github.com/your-username/ai-knowledge-base/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/ai-knowledge-base/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎯 项目概述

这是一个基于最新RAG(Retrieval-Augmented Generation)技术的智能知识库管理系统，支持多种文档格式上传、智能文本分块、向量化存储，并提供自然语言问答功能。

### ✨ 核心功能

- 📄 **多格式文档上传**: 支持PDF、TXT、Markdown文件
- 🧠 **智能文档处理**: 自动文本提取、分块和向量化
- 💬 **AI问答系统**: 基于文档内容的自然语言问答
- 🗂️ **文档管理**: 文档列表、删除、元数据查看
- 🔍 **语义搜索**: 基于向量相似度的精准内容检索

### 🚀 在线演示

- **前端地址**: [https://your-app.vercel.app](https://your-app.vercel.app)
- **API文档**: [https://your-api.railway.app/api/docs](https://your-api.railway.app/api/docs)

## 🏗️ 技术架构

### 架构图

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   用户界面   │ ─→ │   Next.js   │ ─→ │   Nest.js   │
│  (Browser)  │    │ (Frontend)  │    │  (Backend)  │
└─────────────┘    └─────────────┘    └─────────────┘
                                             │
                           ┌─────────────────┼─────────────────┐
                           │                 │                 │
                    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
                    │ PostgreSQL  │  │  ChromaDB   │  │  OpenAI     │
                    │   (主数据)   │  │  (向量DB)   │  │   (LLM)     │
                    └─────────────┘  └─────────────┘  └─────────────┘
```

### 数据流图

```
文档上传 → 文本提取 → 分块处理 → 向量化 → 存储
                                    ↓
用户提问 → 问题向量化 → 相似性搜索 → 构建上下文 → LLM生成答案
```

### 技术栈

#### 前端技术栈
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: Shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **HTTP Client**: Axios

#### 后端技术栈
- **Framework**: Nest.js
- **Language**: TypeScript  
- **Database**: PostgreSQL + Prisma ORM
- **Vector DB**: ChromaDB
- **AI Service**: OpenAI GPT-3.5 + Embeddings
- **File Processing**: pdf-parse, multer
- **API Documentation**: Swagger/OpenAPI

#### DevOps & 部署
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Frontend Deployment**: Vercel
- **Backend Deployment**: Railway
- **Database**: PostgreSQL (Railway/Supabase)

## 🛠️ 本地开发指南

### 前提条件

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- OpenAI API Key

### 快速开始

#### 1. 克隆项目

```bash
git clone https://github.com/your-username/ai-knowledge-base.git
cd ai-knowledge-base
```

#### 2. 环境配置

```bash
# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，填入必要的配置
# 重要：必须配置 OPENAI_API_KEY
```

**关键配置项说明：**

```bash
# 📍 重要！请在 .env 文件的第 13 行填入您的 OpenAI API Key
OPENAI_API_KEY=sk-your-api-key-here

# 📍 数据库配置 (第 2-6 行)
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_knowledge_base"

# 📍 ChromaDB 配置 (第 19 行)  
CHROMA_URL=http://localhost:8000
```

#### 3. 使用Docker启动 (推荐)

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

访问地址：
- 前端: http://localhost:3000
- 后端API: http://localhost:3001
- API文档: http://localhost:3001/api/docs

#### 4. 手动启动开发环境

##### 启动数据库服务

```bash
# 启动 PostgreSQL 和 ChromaDB
docker-compose up -d postgres chromadb
```

##### 后端开发

```bash
cd backend

# 安装依赖
npm install

# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 启动开发服务器
npm run start:dev
```

##### 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📚 API接口文档

### 文档管理 API

#### 上传文档
```http
POST /api/documents/upload
Content-Type: multipart/form-data

# 参数
file: File (PDF/TXT/MD, max 10MB)
```

#### 获取文档列表
```http
GET /api/documents
```

#### 删除文档
```http
DELETE /api/documents/{id}
```

### AI问答 API

#### 发送问题
```http
POST /api/chat
Content-Type: application/json

{
  "message": "用户问题",
  "conversationId": "对话ID(可选)"
}
```

#### 响应格式
```json
{
  "answer": "AI回答内容",
  "sources": [
    {
      "id": "chunk_id",
      "documentId": "doc_id", 
      "content": "相关文档内容",
      "chunkIndex": 0,
      "similarity": 0.85
    }
  ],
  "conversationId": "conversation_id"
}
```

完整API文档：http://localhost:3001/api/docs

## 🧪 测试

### 运行测试

```bash
# 后端测试
cd backend
npm test

# 前端测试  
cd frontend
npm test

# E2E测试
npm run test:e2e
```

### 测试覆盖率

```bash
# 生成测试覆盖率报告
npm run test:cov
```

## 🚀 部署指南

### Docker部署 (推荐)

```bash
# 构建和启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 查看运行状态
docker-compose ps
```

### 云平台部署

#### Vercel (前端)

1. 连接GitHub仓库到Vercel
2. 配置环境变量：
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-api-url.railway.app
   ```
3. 部署完成

#### Railway (后端)

1. 连接GitHub仓库到Railway
2. 配置环境变量：
   ```
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   CHROMA_URL=http://chromadb:8000
   ```
3. 部署完成

### 环境变量配置

生产环境必须配置的变量：

```bash
# AI服务
OPENAI_API_KEY=your_openai_api_key

# 数据库
DATABASE_URL=postgresql://...

# 跨域配置
FRONTEND_URL=https://your-frontend-url.vercel.app
BACKEND_URL=https://your-backend-url.railway.app
```

## 🎨 UI/UX设计

### 设计理念

本项目采用现代化的Material Design设计语言，注重用户体验和交互流畅性。

#### 设计稿链接
- **Figma设计稿**: [AI Knowledge Base Design](https://figma.com/your-design-link)
- **线框图**: 包含在设计稿中

#### 关键设计决策

1. **布局设计**: 
   - 采用侧边导航 + 主内容区域的经典布局
   - 响应式设计，支持移动端和桌面端

2. **交互流程**:
   - 文档上传：拖拽上传 + 进度显示 + 即时反馈
   - AI问答：流式对话界面 + 来源引用显示

3. **色彩方案**:
   - 主色调：蓝色系 (#3B82F6) - 体现科技感
   - 辅助色：灰色系 - 保证内容可读性
   - 强调色：绿色(成功)、红色(错误)、橙色(警告)

## 🧠 RAG技术实现

### 工作原理

```mermaid
graph LR
    A[文档上传] --> B[文本提取]
    B --> C[分块处理]  
    C --> D[向量化]
    D --> E[存储到向量DB]
    
    F[用户提问] --> G[问题向量化]
    G --> H[相似性搜索]
    H --> I[检索相关块]
    I --> J[构建Prompt]
    J --> K[LLM生成答案]
```

### 核心算法

#### 1. 文档分块策略
```typescript
chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  // 智能分块，在句子边界切分，保持语义完整性
}
```

#### 2. 向量相似性搜索
```typescript
async searchSimilarChunks(query: string, topK = 5): Promise<DocumentChunk[]> {
  // 基于cosine similarity的向量搜索
}
```

#### 3. Prompt工程
```typescript
buildPrompt(question: string, context: string): string {
  // 精心设计的Prompt模板，包含角色定义和回答指令
}
```

## 📈 性能优化

### 前端优化
- **代码分割**: 使用Next.js动态导入
- **图片优化**: Next.js Image组件
- **缓存策略**: React Query缓存
- **Bundle优化**: Tree shaking + 代码压缩

### 后端优化  
- **数据库索引**: 针对查询模式优化索引
- **连接池**: PostgreSQL连接池管理
- **缓存策略**: Redis缓存热点数据
- **异步处理**: 文档处理异步化

### 向量检索优化
- **HNSW算法**: ChromaDB默认使用高性能近似搜索
- **批量操作**: 向量批量插入和查询
- **预过滤**: 基于元数据预过滤减少搜索空间

## 🔒 安全考虑

### 数据安全
- **文件上传验证**: 文件类型、大小限制
- **SQL注入防护**: Prisma ORM参数化查询  
- **XSS防护**: 内容过滤和转义
- **CORS配置**: 严格的跨域访问控制

### API安全
- **输入验证**: class-validator数据验证
- **错误处理**: 统一错误响应，不泄露敏感信息
- **限流**: 防止API滥用

## 🤝 贡献指南

### 开发规范

#### Git提交规范
```
feat: 新功能
fix: Bug修复  
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建配置等
```

#### 代码规范
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **TypeScript**: 严格类型检查
- **命名约定**: camelCase (变量) + PascalCase (组件/类)

### 提交流程

1. Fork项目
2. 创建特性分支: `git checkout -b feature/new-feature`
3. 提交代码: `git commit -m 'feat: add new feature'`
4. 推送分支: `git push origin feature/new-feature`  
5. 创建Pull Request

## 🗺️ 项目路线图

### 已完成 ✅
- [x] 基础文档上传和管理
- [x] RAG问答系统
- [x] Docker容器化
- [x] CI/CD流水线

### 进行中 🚧  
- [ ] 用户认证系统
- [ ] 多语言文档支持
- [ ] 实时协作功能

### 计划中 📋
- [ ] 移动端App
- [ ] 企业级权限管理
- [ ] 高级分析功能
- [ ] 插件系统

## 📞 联系方式

- **项目作者**: [Your Name]
- **邮箱**: your.email@example.com
- **GitHub**: [@your-username](https://github.com/your-username)

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

感谢以下开源项目和技术：

- [Next.js](https://nextjs.org/) - React全栈框架
- [Nest.js](https://nestjs.com/) - Node.js企业级框架  
- [OpenAI](https://openai.com/) - AI服务支持
- [ChromaDB](https://www.trychroma.com/) - 向量数据库
- [Prisma](https://www.prisma.io/) - 现代化ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架

---

<div align="center">
  <p>如果这个项目对您有帮助，请给个 ⭐️ 支持一下！</p>
  <img src="https://img.shields.io/github/stars/your-username/ai-knowledge-base?style=social" alt="GitHub stars">
</div>