# Python HTTP 服务器配置

## 🚀 启动方式

### 方式一：使用 npm 脚本（推荐）

```bash
# 1. 构建项目
npm run build

# 2. 启动 Python HTTP 服务器
npm run serve
```

### 方式二：使用启动脚本

```bash
# 1. 构建项目
npm run build

# 2. 运行启动脚本
./start-server.sh
```

### 方式三：使用 Python 脚本

```bash
# 1. 构建项目
npm run build

# 2. 运行 Python 服务器脚本
python3 server.py
```

### 方式四：直接使用 Python 命令

```bash
# 1. 构建项目
npm run build

# 2. 切换到 dist 目录并启动服务器
cd dist && python3 -m http.server 8080
```

## 📋 服务器信息

- **端口**: 8080
- **服务目录**: `dist/`
- **主页面**: http://localhost:8080/index.html
- **访问地址**: http://localhost:8080

## 🛑 停止服务器

按 `Ctrl+C` 停止服务器，或运行：

```bash
pkill -f "python3.*http.server"
```

## 📝 注意事项

1. 确保已运行 `npm run build` 构建项目
2. 确保 `dist/index.html` 文件存在
3. 如果端口 8080 被占用，可以修改端口号
4. 服务器会自动处理 CORS 和路由重定向
