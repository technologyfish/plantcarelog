# PlantCareLog 植物养护日记

植物养护记录应用：微信小程序端 + Laravel API 后端 + 管理后台。

## 目录结构

| 目录 | 说明 | 技术栈 |
|---|---|---|
| `backend/` | API 后端 | Laravel（PHP 8+） |
| `frontend/` | 微信小程序（用户端） | Taro + React |
| `admin/` | 管理后台 | Vite |
| `首页/` `下载/` | UI 设计稿 | — |
| `start-dev.command` | 一键启动开发环境脚本 | — |

## 环境要求

- PHP 8+ / Composer
- Node.js / npm
- MySQL（本机使用 ServBay 管理）
- 微信开发者工具（运行小程序）

## 快速开始

### 1. 安装依赖

```bash
cd backend && composer install
cd frontend && npm install
cd admin && npm install
```

### 2. 配置后端环境变量

```bash
cd backend
cp .env.example .env
php artisan key:generate
# 编辑 .env，配置数据库连接后执行迁移
php artisan migrate
```

### 3. 一键启动开发环境

双击 `start-dev.command`，或在终端执行：

```bash
./start-dev.command
```

脚本会自动：检查 MySQL（需先打开 ServBay）→ 启动后端 API（`http://127.0.0.1:8000`）→ 启动小程序 watch 编译。

之后用微信开发者工具打开 `frontend/dist` 目录预览小程序。

### 4. 启动管理后台（可选）

```bash
cd admin
npm run dev
```

## 常用命令

```bash
# 后端
php artisan serve              # 手动启动后端
php artisan migrate            # 执行数据库迁移

# 前端小程序
npm run dev:weapp              # watch 模式编译小程序
npm run build:weapp            # 正式构建

# 管理后台
npm run dev                    # 开发模式
npm run build                  # 构建
```
