#!/bin/zsh
# PlantCareLog 一键启动开发环境
# 使用方法：双击本文件，或在终端执行 ./start-dev.command
# 前提：ServBay 已打开（MySQL 在运行）

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=============================="
echo "  PlantCareLog 开发环境启动"
echo "=============================="

# 检查 MySQL 是否在运行（依赖 ServBay）
if ! nc -z 127.0.0.1 3306 2>/dev/null; then
    echo "❌ MySQL 未运行，请先打开 ServBay 应用再运行本脚本"
    open -a ServBay
    echo "   已帮你打开 ServBay，等服务启动后（卡片变绿）重新双击本脚本"
    exit 1
fi
echo "✅ MySQL 正常"

# 启动后端 API（8000 端口），若已在运行则跳过
if nc -z 127.0.0.1 8000 2>/dev/null; then
    echo "✅ 后端已在运行 (http://127.0.0.1:8000)"
else
    cd "$ROOT/backend"
    nohup php -S 127.0.0.1:8000 -t public > /tmp/plantcare-backend.log 2>&1 &
    sleep 1
    if nc -z 127.0.0.1 8000 2>/dev/null; then
        echo "✅ 后端已启动 (http://127.0.0.1:8000)，日志: /tmp/plantcare-backend.log"
    else
        echo "❌ 后端启动失败，查看日志: cat /tmp/plantcare-backend.log"
        exit 1
    fi
fi

# 启动小程序热编译（前台运行，改代码自动重新编译）
echo "✅ 启动小程序 watch 编译（保持本窗口开启；改 src 代码会自动重新编译）"
echo "   停止编译: 按 Ctrl+C（后端不受影响，关闭本窗口则后端也会停止）"
echo "=============================="
cd "$ROOT/frontend"
ulimit -n 10240
npm run dev:weapp
