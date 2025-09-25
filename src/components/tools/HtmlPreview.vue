<template>
  <div class="tool-container">
    <div class="tool-header">
      <div class="header-icon">🌐</div>
      <h2>HTML 实时预览</h2>
      <p>编写HTML代码并实时预览效果，支持完整的HTML/CSS/JavaScript</p>
      
      <div class="example-section">
        <span class="example-label">快速开始：</span>
        <button @click="loadExample('basic')" class="example-btn">
          <i class="fas fa-code"></i> 基础HTML
        </button>
        <button @click="loadExample('css')" class="example-btn">
          <i class="fas fa-paint-brush"></i> CSS样式
        </button>
        <button @click="loadExample('js')" class="example-btn">
          <i class="fab fa-js-square"></i> JavaScript
        </button>
      </div>
    </div>

    <div class="editor-layout">
      <div class="editor-card">
        <div class="card-header">
          <h3><i class="fas fa-code"></i> HTML 编辑器</h3>
          <div class="editor-actions">
            <button @click="formatCode" class="action-btn">
              <i class="fas fa-magic"></i> 格式化
            </button>
            <button @click="clearCode" class="action-btn">
              <i class="fas fa-trash"></i> 清空
            </button>
            <button @click="downloadHtml" class="action-btn">
              <i class="fas fa-download"></i> 下载
            </button>
          </div>
        </div>

        <div class="editor-section">
          <div class="editor-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              :class="['editor-tab', { active: activeTab === tab.key }]"
            >
              <i :class="tab.icon"></i>
              {{ tab.name }}
            </button>
          </div>

          <textarea
            v-model="htmlCode"
            v-show="activeTab === 'html'"
            class="code-editor"
            placeholder="输入HTML代码..."
            @input="debouncedUpdate"
          ></textarea>

          <textarea
            v-model="cssCode"
            v-show="activeTab === 'css'"
            class="code-editor"
            placeholder="输入CSS样式..."
            @input="debouncedUpdate"
          ></textarea>

          <textarea
            v-model="jsCode"
            v-show="activeTab === 'js'"
            class="code-editor"
            placeholder="输入JavaScript代码..."
            @input="debouncedUpdate"
          ></textarea>

          <div class="editor-info">
            <div class="code-stats">
              <span>{{ activeTabName }}:</span>
              <span>{{ currentCodeLength }} 字符</span>
              <span>{{ currentCodeLines }} 行</span>
            </div>
            <div class="auto-update-toggle">
              <label class="toggle-label">
                <input type="checkbox" v-model="autoUpdate" />
                <span class="toggle-slider"></span>
                自动更新
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="preview-card">
        <div class="card-header">
          <h3><i class="fas fa-eye"></i> 实时预览</h3>
          <div class="preview-controls">
            <button @click="refreshPreview" class="action-btn">
              <i class="fas fa-sync"></i> 刷新
            </button>
            <button @click="openInNewWindow" class="action-btn">
              <i class="fas fa-external-link-alt"></i> 新窗口
            </button>
            <button @click="toggleFullscreen" class="action-btn">
              <i class="fas fa-expand"></i> 全屏
            </button>
          </div>
        </div>

        <div class="device-selector">
          <select v-model="selectedDevice" class="device-select">
            <option v-for="device in devices" :key="device.key" :value="device.key">
              {{ device.name }}
            </option>
          </select>
        </div>

        <div class="preview-section" :class="{ fullscreen: isFullscreen }">
          <iframe
            :srcdoc="compiledHtml"
            class="preview-iframe"
            :style="{ width: selectedDeviceWidth }"
            sandbox="allow-scripts allow-same-origin allow-forms"
          ></iframe>
          
          <div v-if="isFullscreen" class="fullscreen-exit">
            <button @click="exitFullscreen" class="exit-btn">
              <i class="fas fa-times"></i> 退出全屏
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="success" class="success-card">
      <i class="fas fa-check-circle"></i> {{ success }}
    </div>

    <div class="help-card">
      <h4><i class="fas fa-info-circle"></i> 使用说明</h4>
      <ul>
        <li>在HTML标签页中编写HTML结构</li>
        <li>在CSS标签页中添加样式</li>
        <li>在JavaScript标签页中添加交互功能</li>
        <li>预览会实时更新（可关闭自动更新）</li>
        <li>支持响应式预览和全屏查看</li>
        <li>可以下载完整的HTML文件</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'HtmlPreview',
  setup() {
    const htmlCode = ref('')
    const cssCode = ref('')
    const jsCode = ref('')
    const activeTab = ref('html')
    const autoUpdate = ref(true)
    const isFullscreen = ref(false)
    const selectedDevice = ref('desktop')
    const success = ref('')

    const tabs = [
      { key: 'html', name: 'HTML', icon: 'fas fa-code' },
      { key: 'css', name: 'CSS', icon: 'fab fa-css3-alt' },
      { key: 'js', name: 'JS', icon: 'fab fa-js-square' }
    ]

    const devices = [
      { key: 'desktop', name: '🖥️ 桌面 (100%)', width: '100%' },
      { key: 'tablet', name: '📱 平板 (768px)', width: '768px' },
      { key: 'mobile', name: '📱 手机 (375px)', width: '375px' }
    ]

    const activeTabName = computed(() => {
      const tab = tabs.find(t => t.key === activeTab.value)
      return tab ? tab.name : 'HTML'
    })

    const currentCode = computed(() => {
      switch (activeTab.value) {
        case 'html': return htmlCode.value
        case 'css': return cssCode.value
        case 'js': return jsCode.value
        default: return ''
      }
    })

    const currentCodeLength = computed(() => currentCode.value.length)
    const currentCodeLines = computed(() => currentCode.value.split('\n').length)

    const selectedDeviceWidth = computed(() => {
      const device = devices.find(d => d.key === selectedDevice.value)
      return device ? device.width : '100%'
    })

    const compiledHtml = computed(() => {
      const html = htmlCode.value || ''
      const css = cssCode.value ? `<style>${cssCode.value}</style>` : ''
      const js = jsCode.value ? `<script>${jsCode.value}</scr` + `ipt>` : ''

      // 避免直接写HTML标签，使用字符串拼接
      const htmlTag = '<' + 'html'
      const doctypeTag = '<' + '!DOCTYPE'
      const headCloseTag = '<' + '/head>'
      const bodyCloseTag = '<' + '/body>'

      // 检查是否包含完整的文档结构
      if (html.includes(htmlTag) || html.includes(doctypeTag)) {
        return html
          .replace(headCloseTag, css + headCloseTag)
          .replace(bodyCloseTag, js + bodyCloseTag)
      }

      // 创建完整的HTML文档
      return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML预览</title>
  ${css}
</head>
<body>
  ${html}
  ${js}
</body>
</html>`
    })

    // 防抖更新
    let updateTimeout = null
    const debouncedUpdate = () => {
      if (!autoUpdate.value) return
      
      clearTimeout(updateTimeout)
      updateTimeout = setTimeout(() => {
        // 触发重新计算
      }, 300)
    }

    // 使用字符串拼接避免HTML标签解析错误
    const createExampleHtml = (tagName, content = '', className = '') => {
      const classAttr = className ? ` class="${className}"` : ''
      return content ? 
        `<${tagName}${classAttr}>${content}</${tagName}>` : 
        `<${tagName}${classAttr}>`
    }

    // 示例数据
    const examples = {
      basic: {
        html: `${createExampleHtml('div', '', 'container')}
  ${createExampleHtml('h1', '欢迎使用HTML预览')}
  ${createExampleHtml('p', '这是一个基础的HTML示例')}
  ${createExampleHtml('button', '点击我')} onclick="sayHello()"
  ${createExampleHtml('div', '', 'message')} id="message"
${'</' + 'div>'}`,
        css: `.container {
  max-width: 600px;
  margin: 50px auto;
  padding: 10px;
  text-align: center;
  font-family: Arial, sans-serif;
}

h1 {
  color: #333;
  margin-bottom: 10px;
}

button {
  background: #007cba;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #005a87;
}

.message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 5px;
}`,
        js: `function sayHello() {
  const message = document.getElementById('message');
  message.innerHTML = '你好！欢迎使用HTML预览工具！';
  message.style.background = '#d4edda';
  message.style.color = '#155724';
  message.style.border = '1px solid #c3e6cb';
}`
      },
      css: {
        html: `${createExampleHtml('div', '', 'card')}
  ${createExampleHtml('div', '', 'card-header')}
    ${createExampleHtml('h2', 'CSS动画示例')}
  ${'</' + 'div>'}
  ${createExampleHtml('div', '', 'card-body')}
    ${createExampleHtml('div', '', 'spinner')}
    ${createExampleHtml('p', 'CSS动画和过渡效果')}
  ${'</' + 'div>'}
${'</' + 'div>'}`,
        css: `.card {
  max-width: 400px;
  margin: 50px auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  overflow: hidden;
  animation: slideIn 0.5s ease-out;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px;
  text-align: center;
}

.card-body {
  padding: 10px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}`,
        js: ''
      },
      js: {
        html: `${createExampleHtml('div', '', 'app')}
  ${createExampleHtml('h2', 'JavaScript 交互示例')}
  ${createExampleHtml('div', '', 'counter')}
    ${createExampleHtml('button', '-')} onclick="changeCount(-1)"
    ${createExampleHtml('span', '0')} id="count"
    ${createExampleHtml('button', '+')} onclick="changeCount(1)"
  ${'</' + 'div>'}
  ${createExampleHtml('div', '', 'todo')}
    ${createExampleHtml('input', '')} type="text" id="todoInput" placeholder="添加待办事项"
    ${createExampleHtml('button', '添加')} onclick="addTodo()"
    ${createExampleHtml('ul', '')} id="todoList"
  ${'</' + 'div>'}
${'</' + 'div>'}`,
        css: `.app {
  max-width: 500px;
  margin: 30px auto;
  padding: 10px;
  font-family: Arial, sans-serif;
}

.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 30px 0;
}

.counter button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #007cba;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.counter span {
  font-size: 24px;
  font-weight: bold;
  min-width: 30px;
  text-align: center;
}

.todo {
  margin-top: 30px;
}

.todo input {
  width: 70%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.todo button {
  padding: 10px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.todo ul {
  list-style: none;
  padding: 0;
  margin-top: 20px;
}

.todo li {
  background: #f8f9fa;
  padding: 10px;
  margin: 5px 0;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}`,
        js: `let count = 0;

function changeCount(delta) {
  count += delta;
  document.getElementById('count').textContent = count;
}

function addTodo() {
  const input = document.getElementById('todoInput');
  const list = document.getElementById('todoList');
  
  if (input.value.trim()) {
    const li = document.createElement('li');
    li.innerHTML = input.value + ' <button onclick="this.parentElement.remove()">删除</button>';
    list.appendChild(li);
    input.value = '';
  }
}`
      }
    }

    const loadExample = (type) => {
      const example = examples[type]
      if (example) {
        htmlCode.value = example.html
        cssCode.value = example.css
        jsCode.value = example.js
        success.value = `已加载${type === 'basic' ? '基础' : type === 'css' ? 'CSS' : 'JavaScript'}示例`
        setTimeout(() => success.value = '', 3000)
      }
    }

    const formatCode = () => {
      switch (activeTab.value) {
        case 'html':
          htmlCode.value = formatHtml(htmlCode.value)
          break
        case 'css':
          cssCode.value = formatCss(cssCode.value)
          break
        case 'js':
          jsCode.value = formatJs(jsCode.value)
          break
      }
      success.value = '代码已格式化'
      setTimeout(() => success.value = '', 3000)
    }

    const formatHtml = (html) => {
      return html
        .replace(/></g, '>\n<')
        .replace(/^\s+|\s+$/gm, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .join('\n')
    }

    const formatCss = (css) => {
      return css
        .replace(/{\s*/g, ' {\n  ')
        .replace(/;\s*/g, ';\n  ')
        .replace(/}\s*/g, '\n}\n\n')
        .replace(/,\s*/g, ',\n')
        .trim()
    }

    const formatJs = (js) => {
      return js
        .replace(/{\s*/g, ' {\n  ')
        .replace(/;\s*/g, ';\n  ')
        .replace(/}\s*/g, '\n}\n\n')
        .trim()
    }

    const clearCode = () => {
      switch (activeTab.value) {
        case 'html':
          htmlCode.value = ''
          break
        case 'css':
          cssCode.value = ''
          break
        case 'js':
          jsCode.value = ''
          break
      }
    }

    const refreshPreview = () => {
      const iframe = document.querySelector('.preview-iframe')
      if (iframe) {
        iframe.src = iframe.src
      }
      success.value = '预览已刷新'
      setTimeout(() => success.value = '', 3000)
    }

    const downloadHtml = () => {
      const blob = new Blob([compiledHtml.value], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'preview.html'
      a.click()
      URL.revokeObjectURL(url)
      
      success.value = 'HTML文件已下载'
      setTimeout(() => success.value = '', 3000)
    }

    const openInNewWindow = () => {
      const newWindow = window.open('', '_blank')
      newWindow.document.write(compiledHtml.value)
      newWindow.document.close()
    }

    const toggleFullscreen = () => {
      isFullscreen.value = !isFullscreen.value
    }

    const exitFullscreen = () => {
      isFullscreen.value = false
    }

    return {
      htmlCode,
      cssCode,
      jsCode,
      activeTab,
      autoUpdate,
      isFullscreen,
      selectedDevice,
      success,
      tabs,
      devices,
      activeTabName,
      currentCodeLength,
      currentCodeLines,
      selectedDeviceWidth,
      compiledHtml,
      loadExample,
      debouncedUpdate,
      formatCode,
      clearCode,
      refreshPreview,
      downloadHtml,
      openInNewWindow,
      toggleFullscreen,
      exitFullscreen
    }
  }
}
</script>

<style scoped>
.tool-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tool-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.header-icon {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.9;
}

.tool-header h2 {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
}

.tool-header p {
  margin: 0 0 24px 0;
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.5;
}

.example-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.example-label {
  font-size: 14px;
  opacity: 0.8;
}

.example-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.example-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.editor-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 10px;
}

.editor-card, .preview-card, .help-card, .success-card {
  background: white;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.editor-card:hover, .preview-card:hover, .help-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f8fafc;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-actions, .preview-controls {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  font-weight: 500;
}

.action-btn:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.editor-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.editor-tab {
  padding: 10px;
  border: none;
  background: #f8fafc;
  color: #4a5568;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.editor-tab.active {
  background: #667eea;
  color: white;
}

.code-editor {
  width: 100%;
  height: 300px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  background: #f8fafc;
}

.code-editor:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.editor-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 12px;
  color: #6b7280;
}

.code-stats {
  display: flex;
  gap: 16px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle-slider {
  position: relative;
  width: 40px;
  height: 20px;
  background: #cbd5e0;
  border-radius: 10px;
  transition: background 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

input[type="checkbox"] {
  width: 20px;
  margin-bottom: 0px;
}

input[type="checkbox"]:checked + .toggle-slider {
  background: #667eea;
}

input[type="checkbox"]:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.device-selector {
  margin-bottom: 10px;
}

.device-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
}

.preview-section {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.preview-section.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  background: white;
  border: none;
  border-radius: 0;
}

.preview-iframe {
  width: 100%;
  height: 400px;
  border: none;
  background: white;
}

.fullscreen .preview-iframe {
  height: calc(100vh - 60px);
}

.fullscreen-exit {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1001;
}

.exit-btn {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.success-card {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  margin-bottom: 10px;
}

.help-card h4 {
  margin: 0 0 16px 0;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-card ul {
  margin: 0;
  padding-left: 20px;
}

.help-card li {
  margin-bottom: 10px;
  color: #4a5568;
  line-height: 1.5;
}

@media (max-width: 1200px) {
  .editor-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .tool-container {
    padding: 10px;
  }
  
  .example-section {
    flex-direction: column;
    gap: 8px;
  }
  
  .editor-actions, .preview-controls {
    flex-wrap: wrap;
  }
  
  .code-editor {
    height: 200px;
  }
}
</style> 