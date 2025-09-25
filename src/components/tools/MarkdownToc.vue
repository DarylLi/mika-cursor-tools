<template>
  <div class="tool-container">
    <div class="tool-header">
      <div class="header-icon">
        <i class="fab fa-markdown"></i>
      </div>
      <h2>Markdown 目录生成器</h2>
      <p>自动解析Markdown文档标题，生成层级化目录结构，支持多种输出格式</p>
      
      <!-- 快速示例按钮 -->
      <div class="example-section">
        <span class="example-label">快速开始：</span>
        <button @click="loadExample" class="example-btn">
          <i class="fas fa-magic"></i> 加载示例文档
        </button>
      </div>
    </div>

    <div class="tool-content">
      <!-- 配置选项卡片 -->
      <div class="config-card">
        <h3><i class="fas fa-cog"></i> 配置选项</h3>
        <div class="options-grid">
          <div class="option-item">
            <label>目录格式</label>
            <select v-model="tocFormat" class="styled-select">
              <option value="md">Markdown链接</option>
              <option value="html">HTML列表</option>
              <option value="plain">纯文本</option>
              <option value="numbered">带编号</option>
            </select>
          </div>
          <div class="option-item">
            <label>最大深度</label>
            <select v-model="maxDepth" class="styled-select">
              <option value="2">H1-H2</option>
              <option value="3">H1-H3</option>
              <option value="4">H1-H4</option>
              <option value="5">H1-H5</option>
              <option value="6">H1-H6</option>
            </select>
          </div>
          <div class="option-item">
            <label class="checkbox-label">
              <input type="checkbox" v-model="includeNumbers" />
              <span class="checkmark"></span>
              包含编号
            </label>
          </div>
          <div class="option-item">
            <label class="checkbox-label">
              <input type="checkbox" v-model="smoothScroll" />
              <span class="checkmark"></span>
              平滑滚动
            </label>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-card">
        <div class="card-header">
          <h3><i class="fas fa-edit"></i> Markdown 文档输入</h3>
          <div class="upload-area">
            <input
              type="file"
              ref="fileInput"
              @change="handleFileUpload"
              accept=".md,.txt,.markdown"
              style="display: none"
            />
            <button @click="$refs.fileInput.click()" class="upload-btn">
              <i class="fas fa-file-upload"></i>
              选择文件
            </button>
            <span class="file-info" v-if="fileName">
              <i class="fab fa-markdown"></i>
              {{ fileName }}
            </span>
          </div>
        </div>
        
        <div class="input-area">
          <textarea
            v-model="markdownText"
            placeholder="在此粘贴或输入Markdown文档内容...

# 示例标题 1
## 子标题 1.1  
### 子标题 1.1.1
## 子标题 1.2
# 示例标题 2"
            class="styled-textarea"
            rows="12"
          ></textarea>
          
          <!-- 输入提示 -->
          <div class="input-hints" v-if="!markdownText.trim()">
            <div class="hint-item">
              <i class="fas fa-lightbulb"></i>
              <span>支持 H1-H6 所有标题级别</span>
            </div>
            <div class="hint-item">
              <i class="fas fa-info-circle"></i>
              <span>自动识别 # 和 --- 格式标题</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button 
          @click="generateToc" 
          class="primary-btn"
          :disabled="!markdownText.trim()"
          :class="{ 'loading': isGenerating }"
        >
          <i :class="isGenerating ? 'fas fa-spinner fa-spin' : 'fas fa-list'"></i>
          {{ isGenerating ? '生成中...' : '生成目录' }}
        </button>
        <button @click="clearAll" class="secondary-btn">
          <i class="fas fa-trash"></i>
          清空
        </button>
      </div>

      <!-- 输出区域 -->
      <div class="output-card" v-if="tocResult">
        <div class="card-header">
          <h3><i class="fas fa-list-ul"></i> 目录结果</h3>
          <div class="output-actions">
            <span class="result-info">
              <i class="fas fa-check-circle"></i>
              发现 {{ headingCount }} 个标题
            </span>
            <button @click="copyToc" class="action-btn" :class="{ 'success': copyText === '已复制!' }">
              <i :class="copyText === '已复制!' ? 'fas fa-check' : 'fas fa-copy'"></i>
              {{ copyText }}
            </button>
            <button @click="downloadToc" class="action-btn">
              <i class="fas fa-download"></i>
              下载
            </button>
          </div>
        </div>
        
        <div class="output-content">
          <div class="format-tabs">
            <button 
              v-for="format in formats" 
              :key="format.key"
              @click="activeFormat = format.key"
              class="format-tab"
              :class="{ 'active': activeFormat === format.key }"
            >
              <i :class="format.icon"></i>
              {{ format.name }}
            </button>
          </div>
          
          <pre class="toc-output">{{ getFormattedToc() }}</pre>
          
          <!-- 可视化预览 -->
          <div class="preview-section" v-if="headings.length > 0">
            <h4><i class="fas fa-eye"></i> 可视化预览</h4>
            <div class="toc-preview">
              <div 
                v-for="(heading, index) in headings" 
                :key="index"
                class="toc-item"
                :class="`level-${heading.level}`"
                @click="scrollToHeading(heading)"
              >
                <span class="toc-number" v-if="includeNumbers">{{ heading.number }}</span>
                <span class="toc-text">{{ heading.text }}</span>
                <span class="toc-level">H{{ heading.level }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-card">
        <i class="fas fa-exclamation-triangle"></i>
        <div>
          <strong>处理失败</strong>
          <p>{{ error }}</p>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="help-card">
        <h3><i class="fas fa-question-circle"></i> 使用说明</h3>
        <div class="help-grid">
          <div class="help-item">
            <div class="help-icon">
              <i class="fab fa-markdown"></i>
            </div>
            <div class="help-content">
              <h4>标题格式</h4>
              <p>支持 # 语法和 === 下划线</p>
            </div>
          </div>
          <div class="help-item">
            <div class="help-icon">
              <i class="fas fa-layer-group"></i>
            </div>
            <div class="help-content">
              <h4>多级目录</h4>
              <p>自动处理1-6级标题层次</p>
            </div>
          </div>
          <div class="help-item">
            <div class="help-icon">
              <i class="fas fa-code"></i>
            </div>
            <div class="help-content">
              <h4>多种格式</h4>
              <p>输出Markdown、HTML等格式</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'MarkdownToc',
  setup() {
    const markdownText = ref('')
    const tocResult = ref('')
    const fileName = ref('')
    const tocFormat = ref('md')
    const maxDepth = ref('6')
    const includeNumbers = ref(true)
    const smoothScroll = ref(true)
    const error = ref('')
    const copyText = ref('复制')
    const isGenerating = ref(false)
    const headings = ref([])
    const activeFormat = ref('md')

    const formats = [
      { key: 'md', name: 'Markdown', icon: 'fab fa-markdown' },
      { key: 'html', name: 'HTML', icon: 'fab fa-html5' },
      { key: 'plain', name: '纯文本', icon: 'fas fa-align-left' },
      { key: 'numbered', name: '编号', icon: 'fas fa-list-ol' }
    ]

    const headingCount = computed(() => headings.value.length)

    const loadExample = () => {
      markdownText.value = `# Vue.js 开发指南

## 介绍
Vue.js 是一个用于构建用户界面的渐进式框架。

### 什么是 Vue.js
Vue.js 是一个开源的 JavaScript 框架。

### 为什么选择 Vue.js
- 易学易用
- 渐进式框架
- 社区活跃

## 安装和配置

### 通过 CDN 引入
可以通过 CDN 快速开始使用 Vue.js。

### 通过 npm 安装
\`\`\`bash
npm install vue@next
\`\`\`

### 使用 Vue CLI
Vue CLI 是官方提供的标准工具。

## 基础概念

### 模板语法
Vue.js 使用基于 HTML 的模板语法。

#### 插值
使用双大括号语法进行文本插值。

#### 指令
指令是带有 v- 前缀的特殊 attribute。

### 响应式原理
Vue.js 的响应式系统是其核心特性。

## 组件开发

### 单文件组件
.vue 文件是 Vue.js 特有的文件格式。

### 组件通信
- Props
- Events  
- Slots

### 生命周期
了解组件的生命周期钩子函数。

## 状态管理

### Vuex
Vuex 是 Vue.js 的状态管理模式。

### Pinia
Pinia 是新的状态管理库。

## 路由管理

### Vue Router
Vue Router 是 Vue.js 的官方路由管理器。

# 总结
Vue.js 是一个功能强大且易于学习的前端框架。`

      tocFormat.value = 'md'
      maxDepth.value = '6'
      includeNumbers.value = true
      error.value = ''
      tocResult.value = ''
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        fileName.value = file.name
        const reader = new FileReader()
        reader.onload = (e) => {
          markdownText.value = e.target.result
        }
        reader.readAsText(file)
      }
    }

    const parseHeadings = (markdown) => {
      const lines = markdown.split('\n')
      const headingRegex = /^(#{1,6})\s+(.+)$/
      const altHeadingRegex = /^(.+)$/
      const headingList = []
      let numbers = [0, 0, 0, 0, 0, 0] // 6级标题计数

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        const match = line.match(headingRegex)
        
        if (match) {
          const level = match[1].length
          const text = match[2].trim()
          
          if (level <= parseInt(maxDepth.value)) {
            // 更新编号
            numbers[level - 1]++
            for (let j = level; j < 6; j++) {
              numbers[j] = 0
            }
            
            const number = includeNumbers.value ? 
              numbers.slice(0, level).filter(n => n > 0).join('.') : ''
            
            headingList.push({
              level,
              text,
              number,
              line: i + 1,
              id: text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            })
          }
        } else if (i + 1 < lines.length) {
          // 检查下划线样式标题
          const nextLine = lines[i + 1].trim()
          if (nextLine.match(/^=+$/) || nextLine.match(/^-+$/)) {
            const level = nextLine[0] === '=' ? 1 : 2
            const text = line
            
            if (level <= parseInt(maxDepth.value)) {
              numbers[level - 1]++
              for (let j = level; j < 6; j++) {
                numbers[j] = 0
              }
              
              const number = includeNumbers.value ? 
                numbers.slice(0, level).filter(n => n > 0).join('.') : ''
              
              headingList.push({
                level,
                text,
                number,
                line: i + 1,
                id: text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
              })
            }
            i++ // 跳过下划线
          }
        }
      }

      return headingList
    }

    const generateMarkdownToc = (headingList) => {
      return headingList.map(heading => {
        const indent = '  '.repeat(heading.level - 1)
        const number = heading.number ? `${heading.number} ` : ''
        return `${indent}- [${number}${heading.text}](#${heading.id})`
      }).join('\n')
    }

    const generateHtmlToc = (headingList) => {
      let html = '<ul class="toc">\n'
      let currentLevel = 0
      
      headingList.forEach(heading => {
        const number = heading.number ? `${heading.number} ` : ''
        
        if (heading.level > currentLevel) {
          for (let i = currentLevel; i < heading.level - 1; i++) {
            html += '  <li><ul>\n'
          }
          html += `  <li><a href="#${heading.id}">${number}${heading.text}</a>`
        } else if (heading.level < currentLevel) {
          for (let i = currentLevel; i > heading.level; i--) {
            html += '  </ul></li>\n'
          }
          html += `  <li><a href="#${heading.id}">${number}${heading.text}</a>`
        } else {
          html += `  <li><a href="#${heading.id}">${number}${heading.text}</a>`
        }
        
        currentLevel = heading.level
      })
      
      for (let i = currentLevel; i > 0; i--) {
        html += '  </li>\n'
        if (i > 1) html += '</ul>'
      }
      html += '</ul>'
      
      return html
    }

    const generatePlainToc = (headingList) => {
      return headingList.map(heading => {
        const indent = '  '.repeat(heading.level - 1)
        const number = heading.number ? `${heading.number} ` : ''
        return `${indent}${number}${heading.text}`
      }).join('\n')
    }

    const generateNumberedToc = (headingList) => {
      return headingList.map((heading, index) => {
        const indent = '  '.repeat(heading.level - 1)
        return `${indent}${index + 1}. ${heading.text}`
      }).join('\n')
    }

    const getFormattedToc = () => {
      if (!headings.value.length) return ''
      
      switch (activeFormat.value) {
        case 'html':
          return generateHtmlToc(headings.value)
        case 'plain':
          return generatePlainToc(headings.value)
        case 'numbered':
          return generateNumberedToc(headings.value)
        default:
          return generateMarkdownToc(headings.value)
      }
    }

    const generateToc = () => {
      try {
        isGenerating.value = true
        error.value = ''
        
        setTimeout(() => {
          try {
            headings.value = parseHeadings(markdownText.value)
            
            if (headings.value.length === 0) {
              error.value = '未发现任何标题，请检查Markdown格式'
              tocResult.value = ''
            } else {
              tocResult.value = getFormattedToc()
            }
          } catch (err) {
            error.value = '生成目录失败: ' + err.message
            tocResult.value = ''
          } finally {
            isGenerating.value = false
          }
        }, 300)
      } catch (err) {
        error.value = '生成目录失败: ' + err.message
        tocResult.value = ''
        isGenerating.value = false
      }
    }

    const copyToc = () => {
      const textToCopy = getFormattedToc()
      navigator.clipboard.writeText(textToCopy).then(() => {
        copyText.value = '已复制!'
        setTimeout(() => copyText.value = '复制', 2000)
      })
    }

    const downloadToc = () => {
      const content = getFormattedToc()
      const extension = activeFormat.value === 'html' ? 'html' : 'txt'
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `toc.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    const scrollToHeading = (heading) => {
      if (smoothScroll.value) {
        console.log(`滚动到标题: ${heading.text} (第${heading.line}行)`)
      }
    }

    const clearAll = () => {
      markdownText.value = ''
      tocResult.value = ''
      fileName.value = ''
      error.value = ''
      copyText.value = '复制'
      headings.value = []
    }

    return {
      markdownText,
      tocResult,
      fileName,
      tocFormat,
      maxDepth,
      includeNumbers,
      smoothScroll,
      error,
      copyText,
      isGenerating,
      headings,
      headingCount,
      activeFormat,
      formats,
      loadExample,
      handleFileUpload,
      generateToc,
      getFormattedToc,
      copyToc,
      downloadToc,
      scrollToHeading,
      clearAll
    }
  }
}
</script>

<style scoped>
.tool-container {
  max-width: 1200px;
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

/* 卡片样式 */
.config-card, .input-card, .output-card, .help-card, .error-card {
  background: white;
  border-radius: 16px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.config-card:hover, .input-card:hover, .output-card:hover, .help-card:hover {
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

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.option-item label {
  display: block;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 10px;
}

.styled-select {
  width: 100%;
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #2d3748;
  font-size: 14px;
  transition: all 0.3s ease;
}

.styled-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 自定义复选框 */
.checkbox-label {
  display: flex !important;
  align-items: center;
  cursor: pointer;
  font-weight: 500 !important;
  color: #4a5568 !important;
  margin: 0 !important;
}

input[type="checkbox"] {
  width: 20px;
  margin-bottom: 0px;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  margin-right: 12px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.upload-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.upload-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.file-info {
  color: #10b981;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.styled-textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.styled-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.input-hints {
  margin-top: 16px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 14px;
}

.hint-item i {
  color: #a0aec0;
}

.action-section {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 32px 0;
}

.primary-btn, .secondary-btn {
  padding: 10px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  cursor: pointer;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.primary-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.primary-btn.loading {
  opacity: 0.8;
}

.secondary-btn {
  background: #f3f4f6;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.secondary-btn:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.output-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-info {
  color: #10b981;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  padding: 10px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.action-btn.success {
  border-color: #10b981;
  color: #10b981;
  background: #f0fdf4;
}

.format-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 16px;
}

.format-tab {
  padding: 10px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.format-tab:hover {
  background: #f1f5f9;
  border-color: #cbd5e0;
}

.format-tab.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.toc-output {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.preview-section h4 {
  margin: 0 0 16px 0;
  color: #4a5568;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toc-preview {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.toc-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin: 2px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.toc-item:hover {
  background: #e2e8f0;
}

.toc-item.level-1 {
  margin-left: 0;
  font-weight: 600;
  color: #2d3748;
}

.toc-item.level-2 {
  margin-left: 20px;
  font-weight: 500;
  color: #4a5568;
}

.toc-item.level-3 {
  margin-left: 40px;
  color: #6b7280;
}

.toc-item.level-4 {
  margin-left: 60px;
  color: #6b7280;
}

.toc-item.level-5 {
  margin-left: 80px;
  color: #9ca3af;
}

.toc-item.level-6 {
  margin-left: 100px;
  color: #9ca3af;
}

.toc-number {
  background: #667eea;
  color: white;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
  min-width: 24px;
  text-align: center;
}

.toc-text {
  flex: 1;
}

.toc-level {
  background: #e2e8f0;
  color: #6b7280;
  padding: 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.error-card {
  background: #fef2f2 !important;
  border-color: #fecaca !important;
  color: #dc2626;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.error-card i {
  font-size: 20px;
  margin-top: 2px;
}

.error-card strong {
  display: block;
  margin-bottom: 10px;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.help-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.help-item:hover {
  background: #f1f5f9;
}

.help-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
}

.help-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.help-content p {
  margin: 0;
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .tool-container {
    padding: 10px;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .output-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .format-tabs {
    flex-direction: column;
  }
  
  .help-grid {
    grid-template-columns: 1fr;
  }
}
</style> 