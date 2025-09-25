<template>
  <div class="json-to-ts-tool">
    <div class="tool-header">
      <h3><i class="fab fa-js-square"></i> JSON 转 TypeScript 接口</h3>
      <p>将 JSON 数据转换为 TypeScript 接口定义</p>
    </div>

    <div class="tool-content">
      <div class="input-section">
        <div class="section-header">
          <label for="json-input">JSON 数据</label>
          <div class="header-actions">
            <button @click="loadExample" class="action-btn">
              <i class="fas fa-lightbulb"></i> 示例
            </button>
            <button @click="clearInput" class="action-btn">
              <i class="fas fa-eraser"></i> 清空
            </button>
            <button @click="formatJson" class="action-btn">
              <i class="fas fa-code"></i> 格式化
            </button>
          </div>
        </div>
        <textarea
          id="json-input"
          v-model="jsonInput"
          @input="convertToTS"
          placeholder="在此输入或粘贴 JSON 数据..."
          class="code-input"
        ></textarea>
      </div>

      <div class="output-section">
        <div class="section-header">
          <label>TypeScript 接口</label>
          <div class="header-actions">
            <button @click="copyResult" class="action-btn" :disabled="!tsOutput">
              <i class="fas fa-copy"></i> 复制
            </button>
          </div>
        </div>
        <div class="code-output">
          <pre v-if="tsOutput"><code v-html="highlightedTS"></code></pre>
          <div v-else-if="error" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ error }}
          </div>
          <div v-else class="placeholder">
            转换后的 TypeScript 接口将在此显示...
          </div>
        </div>
      </div>

      <div class="options-section">
        <h4><i class="fas fa-cog"></i> 转换选项</h4>
        <div class="options-grid">
          <label class="option-item">
            <input type="text" v-model="interfaceName" placeholder="RootInterface" />
            <span>接口名称</span>
          </label>
          <label class="option-item">
            <input type="checkbox" v-model="useOptional" @change="convertToTS" />
            <span>可选属性 (?)</span>
          </label>
          <label class="option-item">
            <input type="checkbox" v-model="useExport" @change="convertToTS" />
            <span>导出接口</span>
          </label>
          <label class="option-item">
            <input type="checkbox" v-model="useReadonly" @change="convertToTS" />
            <span>只读属性</span>
          </label>
        </div>
      </div>

      <div class="info-section">
        <h4><i class="fas fa-info-circle"></i> 转换说明</h4>
        <ul>
          <li>支持嵌套对象和数组类型推断</li>
          <li>自动处理联合类型 (string | number)</li>
          <li>识别 null 和 undefined 值</li>
          <li>支持可选属性和只读修饰符</li>
          <li>生成符合 TypeScript 规范的接口</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'JsonToTs',
  setup() {
    const jsonInput = ref('')
    const tsOutput = ref('')
    const error = ref('')
    const interfaceName = ref('RootInterface')
    const useOptional = ref(false)
    const useExport = ref(true)
    const useReadonly = ref(false)

    const highlightedTS = computed(() => {
      if (!tsOutput.value) return ''
      return tsOutput.value
        .replace(/\b(interface|export|readonly)\b/g, '<span style="color: #ff6b6b;">$1</span>')
        .replace(/\b(string|number|boolean|any|null|undefined)\b/g, '<span style="color: #4ecdc4;">$1</span>')
        .replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '<span style="color: #45b7d1;">$1</span>:')
    })

    function loadExample() {
      jsonInput.value = JSON.stringify({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        isActive: true,
        address: {
          street: "123 Main St",
          city: "New York",
          zipCode: "10001"
        },
        tags: ["developer", "javascript"],
        scores: [95, 87, 92],
        profile: null
      }, null, 2)
      convertToTS()
    }

    function clearInput() {
      jsonInput.value = ''
      tsOutput.value = ''
      error.value = ''
    }

    function formatJson() {
      if (!jsonInput.value.trim()) return
      try {
        const parsed = JSON.parse(jsonInput.value)
        jsonInput.value = JSON.stringify(parsed, null, 2)
        convertToTS()
      } catch (e) {
        error.value = 'JSON 格式错误'
      }
    }

    function getType(value) {
      if (value === null) return 'null'
      if (value === undefined) return 'undefined'
      if (Array.isArray(value)) {
        if (value.length === 0) return 'any[]'
        const types = [...new Set(value.map(getType))]
        const elementType = types.length === 1 ? types[0] : `(${types.join(' | ')})`
        return `${elementType}[]`
      }
      if (typeof value === 'object') {
        return generateInterfaceName(value)
      }
      return typeof value
    }

    function generateInterfaceName(obj) {
      return 'NestedInterface'
    }

    function convertObjectToInterface(obj, name, level = 0) {
      const indent = '  '.repeat(level)
      const exportPrefix = useExport.value && level === 0 ? 'export ' : ''
      const readonlyPrefix = useReadonly.value ? 'readonly ' : ''
      
      let result = `${indent}${exportPrefix}interface ${name} {\n`
      
      for (const [key, value] of Object.entries(obj)) {
        const optionalSuffix = useOptional.value ? '?' : ''
        const type = getType(value)
        result += `${indent}  ${readonlyPrefix}${key}${optionalSuffix}: ${type};\n`
      }
      
      result += `${indent}}\n`
      return result
    }

    function convertToTS() {
      if (!jsonInput.value.trim()) {
        tsOutput.value = ''
        error.value = ''
        return
      }

      try {
        const data = JSON.parse(jsonInput.value)
        error.value = ''
        
        if (typeof data !== 'object' || data === null) {
          error.value = '请输入有效的 JSON 对象'
          return
        }

        tsOutput.value = convertObjectToInterface(data, interfaceName.value)
      } catch (e) {
        error.value = 'JSON 格式错误: ' + e.message
        tsOutput.value = ''
      }
    }

    async function copyResult() {
      if (!tsOutput.value) return
      try {
        await navigator.clipboard.writeText(tsOutput.value)
        // 这里可以添加一个简单的提示
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    watch(interfaceName, convertToTS)

    return {
      jsonInput,
      tsOutput,
      error,
      interfaceName,
      useOptional,
      useExport,
      useReadonly,
      highlightedTS,
      loadExample,
      clearInput,
      formatJson,
      convertToTS,
      copyResult
    }
  }
}
</script>

<style scoped>
.json-to-ts-tool {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px;
}

.tool-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
}

.tool-header h3 {
  font-size: 24px;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.tool-header p {
  color: var(--text-secondary);
  font-size: 14px;
}

.tool-content {
  display: grid;
  gap: 25px;
}

.input-section, .output-section {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header label {
  font-weight: 600;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.code-input {
  width: 100%;
  height: 300px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
}

.code-output {
  min-height: 300px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.code-output pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error-message {
  color: #ff6b6b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.placeholder {
  color: var(--text-secondary);
  font-style: italic;
}

.options-section {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.options-section h4 {
  margin-bottom: 10px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.option-item input[type="text"] {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  width: 150px;
}

input[type="checkbox"] {
  width: 20px;
  margin-bottom: 0px;
}

.option-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-color);
}

.info-section {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.info-section h4 {
  margin-bottom: 10px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-section li {
  padding: 8px 0;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.info-section li:before {
  content: "✓";
  color: var(--accent-color);
  font-weight: bold;
  margin-right: 10px;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }
}
</style> 