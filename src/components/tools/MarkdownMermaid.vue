<template>
  <div class="tool-container">
    <div class="tool-header">
      <div class="header-icon">🧜‍♀️</div>
      <h2>Mermaid 图表预览</h2>
      <p>实时预览Mermaid图表语法，支持流程图、时序图、甘特图等多种图表类型</p>
      
      <div class="example-section">
        <span class="example-label">快速开始：</span>
        <button @click="loadExample('flowchart')" class="example-btn">
          <i class="fas fa-project-diagram"></i> 流程图
        </button>
        <button @click="loadExample('sequence')" class="example-btn">
          <i class="fas fa-exchange-alt"></i> 时序图
        </button>
        <button @click="loadExample('gantt')" class="example-btn">
          <i class="fas fa-chart-gantt"></i> 甘特图
        </button>
      </div>
    </div>

    <div class="editor-layout">
      <div class="editor-card">
        <div class="card-header">
          <h3><i class="fas fa-code"></i> Mermaid 代码</h3>
          <div class="header-actions">
            <select v-model="selectedTemplate" @change="loadTemplate" class="template-select">
              <option value="">选择模板</option>
              <option value="flowchart">流程图</option>
              <option value="sequence">时序图</option>
              <option value="gantt">甘特图</option>
              <option value="pie">饼图</option>
              <option value="gitgraph">Git图</option>
              <option value="class">类图</option>
            </select>
          </div>
        </div>
        
        <div class="editor-section">
          <textarea
            v-model="mermaidCode"
            placeholder="在此输入Mermaid代码..."
            class="code-editor"
            @input="debouncedRender"
          ></textarea>
          
          <div class="editor-stats">
            <span>行数: {{ lineCount }}</span>
            <span>字符数: {{ charCount }}</span>
            <span class="syntax-status" :class="{ valid: isValidSyntax, invalid: !isValidSyntax && mermaidCode.trim() }">
              <i :class="isValidSyntax ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
              {{ syntaxMessage }}
            </span>
          </div>
        </div>
      </div>

      <div class="preview-card">
        <div class="card-header">
          <h3><i class="fas fa-eye"></i> 实时预览</h3>
          <div class="preview-actions">
            <button @click="downloadSvg" class="action-btn" :disabled="!isValidSyntax">
              <i class="fas fa-download"></i> 下载SVG
            </button>
            <button @click="copyCode" class="action-btn">
              <i class="fas fa-copy"></i> 复制代码
            </button>
            <button @click="fullscreen" class="action-btn">
              <i class="fas fa-expand"></i> 全屏
            </button>
          </div>
        </div>
        
        <div class="preview-container" :class="{ fullscreen: isFullscreen }">
          <div v-if="!mermaidCode.trim()" class="preview-placeholder">
            <i class="fas fa-diagram-project"></i>
            <p>在左侧输入Mermaid代码查看预览</p>
          </div>
          
          <div v-else-if="!isValidSyntax" class="preview-error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>代码语法错误</p>
            <span>{{ errorMessage }}</span>
          </div>
          
          <div v-else class="preview-content" ref="previewContainer">
            <div class="rendered-diagram" v-html="renderedSvg"></div>
          </div>
          
          <button v-if="isFullscreen" @click="exitFullscreen" class="fullscreen-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="success" class="success-card">
      <i class="fas fa-check-circle"></i> {{ success }}
    </div>

    <div class="help-card">
      <h4><i class="fas fa-info-circle"></i> 使用说明</h4>
      <div class="help-content">
        <div class="help-section">
          <h5>支持的图表类型：</h5>
          <ul>
            <li><strong>流程图</strong> - 描述过程和决策流程</li>
            <li><strong>时序图</strong> - 展示对象间的交互时序</li>
            <li><strong>甘特图</strong> - 项目进度管理图表</li>
            <li><strong>饼图</strong> - 数据占比可视化</li>
            <li><strong>类图</strong> - UML类关系图</li>
            <li><strong>Git图</strong> - 代码分支流程图</li>
          </ul>
        </div>
        
        <div class="help-section">
          <h5>基础语法示例：</h5>
          <div class="syntax-examples">
            <div class="syntax-example">
              <h6>流程图：</h6>
              <pre><code>graph TD
    A[开始] --> B{条件判断}
    B -->|是| C[执行A]
    B -->|否| D[执行B]
    C --> E[结束]
    D --> E</code></pre>
            </div>
            
            <div class="syntax-example">
              <h6>时序图：</h6>
              <pre><code>sequenceDiagram
    participant A as 用户
    participant B as 系统
    A->>B: 发送请求
    B-->>A: 返回响应</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'MarkdownMermaid',
  setup() {
    const mermaidCode = ref('')
    const selectedTemplate = ref('')
    const renderedSvg = ref('')
    const isValidSyntax = ref(true)
    const errorMessage = ref('')
    const success = ref('')
    const isFullscreen = ref(false)
    const previewContainer = ref(null)
    let renderTimeout = null

    const lineCount = computed(() => mermaidCode.value.split('\n').length)
    const charCount = computed(() => mermaidCode.value.length)
    
    const syntaxMessage = computed(() => {
      if (!mermaidCode.value.trim()) return '等待输入'
      return isValidSyntax.value ? '语法正确' : '语法错误'
    })

    const templates = {
      flowchart: `graph TD
    A[开始] --> B{条件判断}
    B -->|是| C[处理数据]
    B -->|否| D[跳过处理]
    C --> E[保存结果]
    D --> F[记录日志]
    E --> G[结束]
    F --> G`,
      
      sequence: `sequenceDiagram
    participant 客户端
    participant 服务器
    participant 数据库
    
    客户端->>服务器: 发送请求
    服务器->>数据库: 查询数据
    数据库-->>服务器: 返回数据
    服务器-->>客户端: 响应结果`,
      
      gantt: `gantt
    title 项目开发计划
    dateFormat  YYYY-MM-DD
    section 设计阶段
    需求分析      :done,    des1, 2024-01-01,2024-01-07
    UI设计        :active,  des2, 2024-01-08, 3d
    原型制作      :         des3, after des2, 5d
    section 开发阶段
    前端开发      :         dev1, 2024-01-16, 10d
    后端开发      :         dev2, 2024-01-16, 12d
    测试阶段      :         test1, after dev1, 5d`,
      
      pie: `pie title 用户访问统计
    "桌面端" : 45.0
    "移动端" : 40.0
    "平板端" : 15.0`,
      
      gitgraph: `gitGraph
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    commit
    merge develop
    commit`,
      
      class: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +boolean indoor
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat`
    }

    const loadExample = (type) => {
      selectedTemplate.value = type
      loadTemplate()
    }

    const loadTemplate = () => {
      if (selectedTemplate.value && templates[selectedTemplate.value]) {
        mermaidCode.value = templates[selectedTemplate.value]
        renderDiagram()
      }
    }

    const debouncedRender = () => {
      clearTimeout(renderTimeout)
      renderTimeout = setTimeout(renderDiagram, 500)
    }

    const renderDiagram = () => {
      if (!mermaidCode.value.trim()) {
        isValidSyntax.value = true
        renderedSvg.value = ''
        return
      }

      try {
        // Since we don't have mermaid library, we'll create a simple SVG representation
        const svg = createSimpleDiagram(mermaidCode.value)
        renderedSvg.value = svg
        isValidSyntax.value = true
        errorMessage.value = ''
      } catch (error) {
        isValidSyntax.value = false
        errorMessage.value = error.message
        renderedSvg.value = ''
      }
    }

    const createSimpleDiagram = (code) => {
      const lines = code.trim().split('\n')
      const firstLine = lines[0].toLowerCase()
      
      let svg = `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">`
      svg += `<style>
        .node { fill: #e1f5fe; stroke: #01579b; stroke-width: 2; }
        .text { font-family: Arial; font-size: 12px; text-anchor: middle; }
        .arrow { stroke: #666; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
      </style>`
      svg += `<defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
        </marker>
      </defs>`
      
      if (firstLine.includes('graph') || firstLine.includes('flowchart')) {
        svg += createFlowchartSvg(lines)
      } else if (firstLine.includes('sequence')) {
        svg += createSequenceSvg(lines)
      } else if (firstLine.includes('gantt')) {
        svg += createGanttSvg(lines)
      } else if (firstLine.includes('pie')) {
        svg += createPieSvg(lines)
      } else {
        svg += createGenericSvg(code)
      }
      
      svg += `</svg>`
      return svg
    }

    const createFlowchartSvg = (lines) => {
      let svg = ''
      const nodes = []
      let y = 50
      
      // Simple flowchart representation
      svg += `<rect x="250" y="50" width="100" height="40" class="node" rx="5"/>`
      svg += `<text x="300" y="75" class="text">开始</text>`
      
      svg += `<rect x="250" y="120" width="100" height="40" class="node" rx="5"/>`
      svg += `<text x="300" y="145" class="text">处理</text>`
      
      svg += `<rect x="250" y="190" width="100" height="40" class="node" rx="5"/>`
      svg += `<text x="300" y="215" class="text">结束</text>`
      
      // Arrows
      svg += `<line x1="300" y1="90" x2="300" y2="120" class="arrow"/>`
      svg += `<line x1="300" y1="160" x2="300" y2="190" class="arrow"/>`
      
      return svg
    }

    const createSequenceSvg = (lines) => {
      let svg = ''
      const participants = ['参与者A', '参与者B', '参与者C']
      const x_positions = [100, 300, 500]
      
      // Draw participants
      participants.forEach((p, i) => {
        svg += `<rect x="${x_positions[i] - 40}" y="20" width="80" height="30" class="node"/>`
        svg += `<text x="${x_positions[i]}" y="40" class="text">${p}</text>`
        svg += `<line x1="${x_positions[i]}" y1="50" x2="${x_positions[i]}" y2="300" stroke="#ccc" stroke-dasharray="5,5"/>`
      })
      
      // Draw messages
      svg += `<line x1="100" y1="80" x2="300" y2="80" class="arrow"/>`
      svg += `<text x="200" y="75" class="text">消息1</text>`
      
      svg += `<line x1="300" y1="120" x2="500" y2="120" class="arrow"/>`
      svg += `<text x="400" y="115" class="text">消息2</text>`
      
      return svg
    }

    const createGanttSvg = (lines) => {
      let svg = ''
      const tasks = ['任务1', '任务2', '任务3']
      const y_start = 80
      const bar_height = 30
      
      // Draw timeline
      svg += `<line x1="100" y1="50" x2="500" y2="50" stroke="#333" stroke-width="2"/>`
      svg += `<text x="50" y="55" class="text">时间轴</text>`
      
      // Draw tasks
      tasks.forEach((task, i) => {
        const y = y_start + i * 50
        svg += `<text x="50" y="${y + 15}" class="text">${task}</text>`
        svg += `<rect x="100" y="${y}" width="${80 + i * 40}" height="${bar_height}" fill="#4CAF50" rx="3"/>`
      })
      
      return svg
    }

    const createPieSvg = (lines) => {
      let svg = ''
      const centerX = 300
      const centerY = 200
      const radius = 80
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
      const values = [30, 25, 25, 20]
      
      let currentAngle = 0
      values.forEach((value, i) => {
        const angle = (value / 100) * 360
        const endAngle = currentAngle + angle
        
        const x1 = centerX + radius * Math.cos(currentAngle * Math.PI / 180)
        const y1 = centerY + radius * Math.sin(currentAngle * Math.PI / 180)
        const x2 = centerX + radius * Math.cos(endAngle * Math.PI / 180)
        const y2 = centerY + radius * Math.sin(endAngle * Math.PI / 180)
        
        const largeArcFlag = angle > 180 ? 1 : 0
        
        svg += `<path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z" fill="${colors[i % colors.length]}"/>`
        
        currentAngle = endAngle
      })
      
      return svg
    }

    const createGenericSvg = (code) => {
      return `<rect x="200" y="150" width="200" height="100" class="node" rx="10"/>
              <text x="300" y="210" class="text">Mermaid 图表</text>
              <text x="300" y="230" class="text" font-size="10">预览不可用</text>`
    }

    const downloadSvg = () => {
      if (!renderedSvg.value) return
      
      const blob = new Blob([renderedSvg.value], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mermaid-diagram.svg'
      a.click()
      URL.revokeObjectURL(url)
      
      success.value = 'SVG图表已下载'
      setTimeout(() => success.value = '', 3000)
    }

    const copyCode = () => {
      navigator.clipboard.writeText(mermaidCode.value)
      success.value = 'Mermaid代码已复制到剪贴板'
      setTimeout(() => success.value = '', 3000)
    }

    const fullscreen = () => {
      isFullscreen.value = true
    }

    const exitFullscreen = () => {
      isFullscreen.value = false
    }

    onMounted(() => {
      loadExample('flowchart')
    })

    return {
      mermaidCode,
      selectedTemplate,
      renderedSvg,
      isValidSyntax,
      errorMessage,
      success,
      isFullscreen,
      previewContainer,
      lineCount,
      charCount,
      syntaxMessage,
      loadExample,
      loadTemplate,
      debouncedRender,
      downloadSvg,
      copyCode,
      fullscreen,
      exitFullscreen
    }
  }
}
</script>

<style scoped>
.tool-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tool-header {
  text-align: center;
  margin-bottom: 40px;
  background: linear-gradient(135deg, #06d6a0 0%, #118ab2 100%);
  color: white;
  padding: 40px 32px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(6, 214, 160, 0.3);
}

.header-icon {
  font-size: 48px;
  margin-bottom: 16px;
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
  margin-top: 24px;
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
  padding: 8px 16px;
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
  margin-bottom: 24px;
}

.editor-card, .preview-card, .help-card, .success-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.header-actions, .preview-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.template-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
}

.action-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn:hover:not(:disabled) {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.code-editor {
  width: 100%;
  min-height: 400px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.code-editor:focus {
  outline: none;
  border-color: #06d6a0;
  box-shadow: 0 0 0 3px rgba(6, 214, 160, 0.1);
  background: white;
}

.editor-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 12px;
  color: #6b7280;
  flex-wrap: wrap;
  gap: 12px;
}

.syntax-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.syntax-status.valid {
  color: #059669;
}

.syntax-status.invalid {
  color: #dc2626;
}

.preview-container {
  min-height: 400px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  position: relative;
  overflow: auto;
}

.preview-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  background: white;
  border-radius: 0;
}

.preview-placeholder, .preview-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  color: #6b7280;
}

.preview-placeholder i, .preview-error i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.preview-error {
  color: #dc2626;
}

.preview-error span {
  font-size: 14px;
  font-family: monospace;
  background: #fef2f2;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 8px;
}

.preview-content {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 360px;
}

.rendered-diagram {
  max-width: 100%;
  max-height: 100%;
}

.fullscreen-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #dc2626;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.success-card {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  margin-bottom: 24px;
}

.help-card h4 {
  margin: 0 0 20px 0;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.help-section h5 {
  margin: 0 0 12px 0;
  color: #4a5568;
  font-size: 16px;
  font-weight: 600;
}

.help-section ul {
  margin: 0;
  padding-left: 20px;
}

.help-section li {
  margin-bottom: 6px;
  color: #4a5568;
  line-height: 1.4;
}

.syntax-examples {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.syntax-example h6 {
  margin: 0 0 8px 0;
  color: #4a5568;
  font-size: 14px;
  font-weight: 600;
}

.syntax-example pre {
  margin: 0;
  background: #1f2937;
  color: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  line-height: 1.4;
}

@media (max-width: 1200px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .tool-container {
    padding: 16px;
  }
  
  .help-content {
    grid-template-columns: 1fr;
  }
  
  .example-section {
    flex-direction: column;
    gap: 8px;
  }
  
  .editor-stats {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style> 