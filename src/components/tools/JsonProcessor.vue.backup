<template>
  <div class="single-tool">
    <div class="tool-header">
      <h2><i class="fas fa-code"></i> JSON处理器</h2>
      <p>强大的JSON处理工具，支持格式化、压缩、验证和树形可视化展示</p>
    </div>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <div class="input-section">
      <h3><i class="fas fa-edit"></i> JSON 输入</h3>
      <textarea 
        v-model="jsonInput" 
        placeholder="请输入JSON数据..."
        class="json-input"
        @input="handleInput"
      ></textarea>
      
      <div class="control-panel">
        <button @click="formatJson" :disabled="!isValidJson" class="btn-format">
          <i class="fas fa-magic"></i> 格式化
        </button>
        <button @click="compressJson" :disabled="!isValidJson" class="btn-compress">
          <i class="fas fa-compress"></i> 压缩
        </button>
        <button @click="validateJson" class="btn-validate">
          <i class="fas fa-check"></i> 验证
        </button>
        <button @click="clearAll" class="btn-clear">
          <i class="fas fa-trash"></i> 清空
        </button>
      </div>
    </div>
    
    <!-- 状态指示器 -->
    <div v-if="jsonStatus" :class="['status-indicator', jsonStatus.type]">
      <i :class="jsonStatus.icon"></i>
      {{ jsonStatus.message }}
    </div>

    <!-- 输出区域 -->
    <div v-if="processedData || showTreeView" class="output-section">
      <div class="output-header">
        <h3><i class="fas fa-code"></i> 处理结果</h3>
        <div class="view-toggles">
          <button 
            @click="setView('tree')" 
            :class="['view-btn', { active: currentView === 'tree' }]"
            :disabled="!isValidJson"
          >
            <i class="fas fa-sitemap"></i> 树形视图
          </button>
          <button 
            @click="setView('text')" 
            :class="['view-btn', { active: currentView === 'text' }]"
          >
            <i class="fas fa-file-code"></i> 文本视图
          </button>
        </div>
      </div>

      <!-- 树形视图 -->
      <div v-if="currentView === 'tree' && showTreeView" class="tree-view">
        <div class="tree-controls">
          <button @click="expandAll" class="tree-control-btn">
            <i class="fas fa-expand-arrows-alt"></i> 展开全部
          </button>
          <button @click="collapseAll" class="tree-control-btn">
            <i class="fas fa-compress-arrows-alt"></i> 折叠全部
          </button>
          <span class="node-count">节点数量: {{ nodeCount }}</span>
        </div>
        <div class="json-tree">
          <JsonTreeNode 
            v-if="parsedJsonData"
            :data="parsedJsonData" 
            :path="'root'"
            :level="0"
            :expanded-nodes="expandedNodes"
            @toggle="toggleNode"
          />
        </div>
      </div>

      <!-- 文本视图 -->
      <div v-if="currentView === 'text'" class="text-view">
        <div class="text-controls">
          <button @click="copyResult" class="control-btn">
            <i class="fas fa-copy"></i> {{ copyText }}
          </button>
          <button @click="downloadJson" class="control-btn">
            <i class="fas fa-download"></i> 下载
          </button>
        </div>
        <pre class="json-output">{{ processedData }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import JsonTreeNode from './JsonTreeNode.vue'

export default {
  name: 'JsonProcessor',
  components: {
    JsonTreeNode
  },
  props: {
    toolData: Object
  },
  setup() {
    const jsonInput = ref('')
    const processedData = ref('')
    const jsonStatus = ref(null)
    const copyText = ref('复制')
    const currentView = ref('tree')
    const expandedNodes = ref(new Set(['root']))
    const parsedJsonData = ref(null)
    const debounceTimer = ref(null)

    // 计算属性
    const isValidJson = computed(() => {
      if (!jsonInput.value.trim()) return false
      try {
        JSON.parse(jsonInput.value)
        return true
      } catch {
        return false
      }
    })

    const showTreeView = computed(() => {
      return isValidJson.value && parsedJsonData.value !== null
    })

    const nodeCount = computed(() => {
      if (!parsedJsonData.value) return 0
      return countNodes(parsedJsonData.value)
    })

    // 工具函数
    const countNodes = (obj) => {
      let count = 1
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach(item => {
            count += countNodes(item)
          })
        } else {
          Object.values(obj).forEach(value => {
            count += countNodes(value)
          })
        }
      }
      return count
    }

    const getAllNodePaths = (obj, currentPath = 'root', paths = new Set()) => {
      paths.add(currentPath)
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            getAllNodePaths(item, `${currentPath}[${index}]`, paths)
          })
        } else {
          Object.entries(obj).forEach(([key, value]) => {
            getAllNodePaths(value, `${currentPath}.${key}`, paths)
          })
        }
      }
      return paths
    }

    // 防抖处理
    const handleInput = () => {
      if (debounceTimer.value) {
        clearTimeout(debounceTimer.value)
      }
      debounceTimer.value = setTimeout(() => {
        validateJson()
      }, 300)
    }

    // 主要功能函数
    const loadExample = () => {
      jsonInput.value = `{
  "name": "通用工具瑞士军刀",
  "version": "1.0.0",
  "description": "一站式实用工具集合",
  "features": [
    "文本处理",
    "编码转换",
    "密码生成",
    "二维码生成",
    "计算器"
  ],
  "technologies": {
    "frontend": "Vue3",
    "build": "Vite",
    "styling": "CSS3"
  },
  "author": "Mika",
  "license": "MIT",
  "config": {
    "theme": "dark",
    "language": "zh-CN",
    "features": {
      "search": true,
      "notifications": false,
      "autoSave": true
    }
  },
  "stats": {
    "users": 1200,
    "downloads": 5600,
    "rating": 4.8
  }
}`
      
      setTimeout(() => {
        validateJson()
        setView('tree')
      }, 100)
    }

    const validateJson = () => {
      if (!jsonInput.value.trim()) {
        jsonStatus.value = null
        parsedJsonData.value = null
        processedData.value = ''
        return
      }

      try {
        const parsed = JSON.parse(jsonInput.value)
        parsedJsonData.value = parsed
        
        // 自动为文本视图准备格式化的JSON
        if (currentView.value === 'text') {
          processedData.value = JSON.stringify(parsed, null, 4)
        }
        
        jsonStatus.value = {
          type: 'valid',
          icon: 'fas fa-check-circle',
          message: `✓ 有效JSON (${JSON.stringify(parsed).length} 字符)`
        }
      } catch (error) {
        parsedJsonData.value = null
        processedData.value = ''
        jsonStatus.value = {
          type: 'invalid',
          icon: 'fas fa-exclamation-circle',
          message: `✗ 错误: ${error.message}`
        }
      }
    }

    const formatJson = () => {
      if (!isValidJson.value) return
      try {
        const parsed = JSON.parse(jsonInput.value)
        // 使用4个空格缩进提供更清晰的格式化
        processedData.value = JSON.stringify(parsed, null, 4)
        jsonStatus.value = {
          type: 'valid',
          icon: 'fas fa-check-circle',
          message: `✓ 已格式化 (${processedData.value.length} 字符，含换行和缩进)`
        }
      } catch (error) {
        jsonStatus.value = {
          type: 'invalid',
          icon: 'fas fa-exclamation-circle',
          message: `✗ 格式化失败: ${error.message}`
        }
      }
    }

    const compressJson = () => {
      if (!isValidJson.value) return
      try {
        const parsed = JSON.parse(jsonInput.value)
        processedData.value = JSON.stringify(parsed)
        jsonStatus.value = {
          type: 'valid',
          icon: 'fas fa-check-circle',
          message: `✓ 已压缩 (${processedData.value.length} 字符)`
        }
      } catch (error) {
        jsonStatus.value = {
          type: 'invalid',
          icon: 'fas fa-exclamation-circle',
          message: `✗ 压缩失败: ${error.message}`
        }
      }
    }

    const clearAll = () => {
      jsonInput.value = ''
      processedData.value = ''
      jsonStatus.value = null
      parsedJsonData.value = null
      expandedNodes.value = new Set(['root'])
      copyText.value = '复制'
    }

    const copyResult = () => {
      if (processedData.value) {
        navigator.clipboard.writeText(processedData.value).then(() => {
          copyText.value = '已复制!'
          setTimeout(() => copyText.value = '复制', 2000)
        })
      }
    }

    const downloadJson = () => {
      if (processedData.value) {
        const blob = new Blob([processedData.value], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'processed.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    }

    // 视图切换
    const setView = (view) => {
      currentView.value = view
      if (view === 'text' && isValidJson.value) {
        // 自动格式化JSON以确保文本视图有正确的换行和缩进
        formatJson()
      }
    }

    // 树形视图控制
    const toggleNode = (path) => {
      const newSet = new Set(expandedNodes.value)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      expandedNodes.value = newSet
    }

    const expandAll = () => {
      if (parsedJsonData.value) {
        expandedNodes.value = getAllNodePaths(parsedJsonData.value)
      }
    }

    const collapseAll = () => {
      expandedNodes.value = new Set(['root'])
    }

    // 监听器
    watch(jsonInput, (newValue) => {
      if (!newValue.trim()) {
        parsedJsonData.value = null
        jsonStatus.value = null
        processedData.value = ''
      }
    })

    return {
      jsonInput,
      processedData,
      jsonStatus,
      copyText,
      currentView,
      expandedNodes,
      parsedJsonData,
      isValidJson,
      showTreeView,
      nodeCount,
      loadExample,
      validateJson,
      formatJson,
      compressJson,
      clearAll,
      copyResult,
      downloadJson,
      setView,
      toggleNode,
      expandAll,
      collapseAll,
      handleInput
    }
  }
}
</script>

<style scoped>
.single-tool {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tool-header {
  text-align: center;
  margin-bottom: 30px;
}

.tool-header h2 {
  color: var(--text-primary);
  margin-bottom: 10px;
  font-size: 2.2em;
}

.tool-header p {
  color: var(--text-secondary);
  font-size: 1.1em;
}

.example-section {
  text-align: center;
  margin-bottom: 20px;
}

.example-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.example-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
}

.input-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.input-section h3 {
  color: var(--text-primary);
  margin-bottom: 15px;
  font-size: 1.3em;
}

.json-input {
  width: 100%;
  min-height: 200px;
  padding: 15px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.json-input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.control-panel {
  display: flex;
  gap: 12px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.control-panel button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 120px;
}

.btn-format {
  background: #4CAF50;
  color: white;
}

.btn-compress {
  background: #FF9800;
  color: white;
}

.btn-validate {
  background: #2196F3;
  color: white;
}

.btn-clear {
  background: #f44336;
  color: white;
}

.control-panel button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.control-panel button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-indicator {
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
}

.status-indicator.valid {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-indicator.invalid {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.output-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.output-header h3 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.3em;
}

.view-toggles {
  display: flex;
  gap: 8px;
}

.view-btn {
  padding: 8px 16px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.view-btn:hover:not(:disabled) {
  border-color: var(--accent-color);
}

.view-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tree-view {
  min-height: 300px;
}

.tree-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.tree-control-btn {
  padding: 8px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tree-control-btn:hover {
  background: var(--accent-hover);
}

.node-count {
  color: var(--text-secondary);
  font-size: 0.9em;
  margin-left: auto;
}

.json-tree {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 15px;
  min-height: 200px;
  overflow: auto;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.text-view {
  min-height: 300px;
}

.text-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
}

.control-btn {
  padding: 8px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: var(--accent-hover);
}

.json-output {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow: auto;
  white-space: pre-wrap;
  max-height: 500px;
}

@media (max-width: 768px) {
  .single-tool {
    padding: 15px;
  }
  
  .control-panel {
    flex-direction: column;
  }
  
  .control-panel button {
    min-width: auto;
  }
  
  .output-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .tree-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .node-count {
    margin-left: 0;
    margin-top: 10px;
  }
}
</style> 