#!/bin/bash

echo "🧹 清理端口中..."

# 杀死vite、npm和python服务器进程
echo "停止开发服务器进程..."
pkill -f "vite\|npm.*dev\|python3.*http.server" 2>/dev/null

# 等待进程完全停止
sleep 2

# 强制清理占用的端口
echo "清理端口 3000-3004, 8000, 8080..."
lsof -ti:3000,3001,3002,3003,3004,8000,8080 | xargs kill -9 2>/dev/null

# 再次等待
sleep 1

echo "✅ 端口清理完成！"
echo "🚀 重新启动开发服务器..."

# 重新启动开发服务器
npm run dev
