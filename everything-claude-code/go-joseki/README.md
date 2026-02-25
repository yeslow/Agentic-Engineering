# 围棋定式学习 (Go Joseki Learning)

基于 React + TypeScript + Vite 的围棋定式学习应用，风格参考 [OGS (Online Go Server)](https://online-go.com/)。

## 功能特性

- **20个经典定式**：包含小目、星位、三三、高目/目外定式
- **练习模式**：跟随定式顺序下棋，实时反馈正确性
- **测验模式**：随机出题，四选一答题
- **进度追踪**：本地存储学习进度，显示掌握程度
- **响应式设计**：支持桌面和移动端访问

## 技术栈

- **前端**：React 19 + TypeScript + Tailwind CSS
- **构建工具**：Vite 7
- **状态管理**：Zustand + Persist (本地存储)
- **路由**：React Router v7
- **测试**：Vitest + React Testing Library

## 快速开始

### 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 构建生产版本
pnpm run build
```

### 部署方式

#### 方式一：Docker 部署 (推荐)

```bash
# 构建并启动
docker-compose up -d

# 应用将在 http://localhost:8080 运行
```

#### 方式二：Nginx 部署

```bash
# 1. 构建项目
pnpm run build

# 2. 复制构建文件到服务器
scp -r dist/* user@your-server:/var/www/go-joseki/

# 3. 配置 Nginx (参考 nginx.conf)
sudo cp nginx.conf /etc/nginx/sites-available/go-joseki
sudo ln -s /etc/nginx/sites-available/go-joseki /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

#### 方式三：自动部署脚本

```bash
# 配置好 SSH 免密登录后
./deploy.sh user@your-server.com /var/www/go-joseki
```

## 项目结构

```
src/
├── components/       # UI 组件
│   ├── board/       # 棋盘渲染组件
│   ├── dashboard/   # 学习进度面板
│   ├── joseki/      # 定式列表和详情
│   ├── practice/    # 练习模式
│   └── quiz/        # 测验模式
├── data/            # 定式数据
│   └── joseki/      # 20个定式定义
├── lib/             # 核心逻辑
│   ├── goLogic.ts       # 围棋规则引擎
│   ├── boardRenderer.ts # 棋盘渲染
│   ├── practiceEngine.ts # 练习模式逻辑
│   └── quizEngine.ts     # 测验模式逻辑
├── store/           # 状态管理
├── pages/           # 页面组件
└── types/           # TypeScript 类型
```

## 数据说明

所有围棋数据存储在浏览器 LocalStorage 中，包括：
- 定式浏览进度
- 练习模式准确率
- 测验成绩

无需后端服务器，纯前端应用。

## 浏览器支持

- Chrome / Edge 90+
- Firefox 90+
- Safari 15+

## 许可证

MIT License
