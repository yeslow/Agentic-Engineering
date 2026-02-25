#!/bin/bash
# Deployment script for Go Joseki Learning App
# Usage: ./deploy.sh [server-user@server-host] [remote-path]

set -e

echo "🎯 开始构建围棋定式学习应用..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}错误: 未安装 pnpm${NC}"
    echo "请先安装 pnpm: npm install -g pnpm"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📦 安装依赖...${NC}"
pnpm install

# Run tests
echo -e "${YELLOW}🧪 运行测试...${NC}"
pnpm test -- --run

# Build for production
echo -e "${YELLOW}🔨 构建生产版本...${NC}"
pnpm run build

# Check if build succeeded
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ 构建失败: dist 目录不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 构建成功!${NC}"

# Deploy to remote server if arguments provided
if [ "$#" -eq 2 ]; then
    SERVER="$1"
    REMOTE_PATH="$2"

    echo -e "${YELLOW}🚀 部署到服务器: $SERVER...${NC}"

    # Create remote directory if not exists
    ssh "$SERVER" "mkdir -p $REMOTE_PATH"

    # Sync files
    rsync -avz --delete dist/ "$SERVER:$REMOTE_PATH/"

    # Reload nginx (optional - requires sudo access)
    # ssh "$SERVER" "sudo systemctl reload nginx"

    echo -e "${GREEN}✅ 部署完成!${NC}"
    echo -e "${GREEN}🌐 应用已部署到: http://$SERVER${NC}"
else
    echo -e "${GREEN}📁 构建文件位于: ./dist/${NC}"
    echo ""
    echo "手动部署命令示例:"
    echo "  1. 使用 Docker: docker-compose up -d"
    echo "  2. 使用 Nginx: 将 dist/ 目录复制到 /var/www/go-joseki/"
    echo "  3. 使用脚本:    ./deploy.sh user@your-server.com /var/www/go-joseki"
fi

echo -e "${GREEN}🎉 完成!${NC}"
