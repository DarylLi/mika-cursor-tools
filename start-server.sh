#!/bin/bash

# Python HTTP 服务器启动脚本
# 用于启动 dist/index.html

echo "🚀 启动 Python HTTP 服务器..."
echo "📁 服务目录: $(pwd)/dist"
echo "🌐 访问地址: http://localhost:8080"
echo "📄 主页面: http://localhost:8080/index.html"
echo "⏹️  按 Ctrl+C 停止服务器"
echo "----------------------------------------"

# 检查 dist 目录是否存在
if [ ! -d "dist" ]; then
    echo "❌ 错误: dist 目录不存在"
    echo "请先运行 'npm run build' 构建项目"
    exit 1
fi

# 检查 index.html 是否存在
if [ ! -f "dist/index.html" ]; then
    echo "❌ 错误: dist/index.html 文件不存在"
    echo "请先运行 'npm run build' 构建项目"
    exit 1
fi

# 切换到 dist 目录并启动 Python HTTP 服务器
cd dist && python3 -m http.server 8080
