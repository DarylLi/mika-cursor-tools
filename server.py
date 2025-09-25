#!/usr/bin/env python3
"""
Python HTTP 服务器，用于启动 dist/index.html
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

def main():
    # 设置服务器配置
    PORT = 8080
    DIST_DIR = Path(__file__).parent / "dist"
    
    # 检查 dist 目录是否存在
    if not DIST_DIR.exists():
        print(f"❌ 错误: {DIST_DIR} 目录不存在")
        print("请先运行 'npm run build' 构建项目")
        sys.exit(1)
    
    # 检查 index.html 是否存在
    index_file = DIST_DIR / "index.html"
    if not index_file.exists():
        print(f"❌ 错误: {index_file} 文件不存在")
        print("请先运行 'npm run build' 构建项目")
        sys.exit(1)
    
    # 切换到 dist 目录
    os.chdir(DIST_DIR)
    
    # 创建自定义处理器
    class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            # 添加 CORS 头
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            super().end_headers()
        
        def do_GET(self):
            # 如果请求根路径，重定向到 index.html
            if self.path == '/':
                self.path = '/index.html'
            return super().do_GET()
    
    # 启动服务器
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"🚀 Python HTTP 服务器已启动")
            print(f"📁 服务目录: {DIST_DIR.absolute()}")
            print(f"🌐 访问地址: http://localhost:{PORT}")
            print(f"📄 主页面: http://localhost:{PORT}/index.html")
            print(f"⏹️  按 Ctrl+C 停止服务器")
            print("-" * 50)
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 服务器已停止")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ 错误: 端口 {PORT} 已被占用")
            print(f"请尝试使用其他端口或停止占用该端口的进程")
        else:
            print(f"❌ 服务器启动失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
