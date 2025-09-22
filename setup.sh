#!/bin/bash
# setup.sh - 项目快速启动脚本

set -e

echo "🚀 AI智能知识库管理系统 - 项目初始化"
echo "=================================="

# 检查必要工具
check_requirements() {
    echo "📋 检查系统要求..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js 18+"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    echo "✅ 系统要求检查通过"
}

# 环境变量设置
setup_env() {
    echo "⚙️  设置环境变量..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "📝 已创建 .env 文件，请编辑并填入必要的配置："
        echo ""
        echo "⚠️  重要配置项："
        echo "   - OPENAI_API_KEY: 您的 OpenAI API 密钥"
        echo "   - DATABASE_URL: PostgreSQL 数据库连接字符串"
        echo ""
        read -p "是否现在编辑 .env 文件？(y/n): " edit_env
        if [ "$edit_env" = "y" ]; then
            ${EDITOR:-nano} .env
        fi
    else
        echo "✅ .env 文件已存在"
    fi
}

# 安装依赖
install_dependencies() {
    echo "📦 安装项目依赖..."
    
    echo "安装后端依赖..."
    cd backend
    npm install
    echo "✅ 后端依赖安装完成"
    
    cd ../frontend
    echo "安装前端依赖..."
    npm install
    echo "✅ 前端依赖安装完成"
    
    cd ..
}

# 数据库设置
setup_database() {
    echo "🗄️  设置数据库..."
    
    echo "启动 PostgreSQL 和 ChromaDB..."
    docker-compose up -d postgres chromadb
    
    # 等待数据库启动
    echo "等待数据库启动..."
    sleep 10
    
    cd backend
    
    echo "生成 Prisma Client..."
    npx prisma generate
    
    echo "运行数据库迁移..."
    npx prisma migrate dev --name init
    
    echo "✅ 数据库设置完成"
    cd ..
}

# 构建项目
build_project() {
    echo "🔨 构建项目..."
    
    cd backend
    npm run build
    echo "✅ 后端构建完成"
    
    cd ../frontend
    npm run build
    echo "✅ 前端构建完成"
    
    cd ..
}

# 运行测试
run_tests() {
    echo "🧪 运行测试..."
    
    cd backend
    npm test
    
    cd ../frontend  
    npm test -- --run
    
    cd ..
    echo "✅ 测试通过"
}

# 启动服务
start_services() {
    echo "🚀 启动服务..."
    
    if [ "$1" = "docker" ]; then
        echo "使用 Docker 启动所有服务..."
        docker-compose up -d
        echo ""
        echo "🎉 服务启动成功！"
        echo "前端地址: http://localhost:3000"
        echo "后端API: http://localhost:3001"
        echo "API文档: http://localhost:3001/api/docs"
    else
        echo "使用开发模式启动服务..."
        echo "请在不同的终端窗口中运行以下命令："
        echo ""
        echo "后端: cd backend && npm run start:dev"
        echo "前端: cd frontend && npm run dev"
    fi
}

# 主函数
main() {
    case "${1:-setup}" in
        "setup")
            check_requirements
            setup_env
            install_dependencies
            setup_database
            echo ""
            echo "🎉 项目初始化完成！"
            echo ""
            echo "下一步："
            echo "1. 编辑 .env 文件，确保配置正确"
            echo "2. 运行 './setup.sh start' 启动开发服务器"
            echo "3. 或运行 './setup.sh docker' 使用 Docker 启动"
            ;;
        "start")
            start_services "dev"
            ;;
        "docker")
            start_services "docker"
            ;;
        "build")
            build_project
            ;;
        "test")
            run_tests
            ;;
        "clean")
            echo "🧹 清理项目..."
            docker-compose down -v
            rm -rf backend/node_modules frontend/node_modules
            rm -rf backend/dist frontend/.next
            echo "✅ 清理完成"
            ;;