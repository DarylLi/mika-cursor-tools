<template>
  <div class="json-diff-tool">
    <div class="tool-header">
      <h3><i class="fas fa-code-branch"></i> JSON 差异查看器</h3>
      <p>比较两个 JSON 对象的差异</p>
    </div>

    <div class="tool-content">
      <div class="input-section">
        <div class="json-inputs">
          <div class="input-group">
            <div class="input-header">
              <label>原始 JSON (A)</label>
              <div class="input-actions">
                <button @click="formatJson('original')" class="action-btn">
                  <i class="fas fa-code"></i> 格式化
                </button>
                <button @click="clearJson('original')" class="action-btn">
                  <i class="fas fa-eraser"></i> 清空
                </button>
              </div>
            </div>
            <textarea
              v-model="originalJson"
              @input="compareJson"
              class="json-textarea"
              placeholder="在此输入或粘贴第一个 JSON..."
            ></textarea>
          </div>

          <div class="input-group">
            <div class="input-header">
              <label>修改后 JSON (B)</label>
              <div class="input-actions">
                <button @click="formatJson('modified')" class="action-btn">
                  <i class="fas fa-code"></i> 格式化
                </button>
                <button @click="clearJson('modified')" class="action-btn">
                  <i class="fas fa-eraser"></i> 清空
                </button>
              </div>
            </div>
            <textarea
              v-model="modifiedJson"
              @input="compareJson"
              class="json-textarea"
              placeholder="在此输入或粘贴第二个 JSON..."
            ></textarea>
          </div>
        </div>

        <div class="main-actions">
          <button @click="compareJson" class="action-btn primary">
            <i class="fas fa-search"></i> 比较差异
          </button>
          <button @click="loadExample" class="action-btn">
            <i class="fas fa-lightbulb"></i> 示例
          </button>
          <button @click="swapJson" class="action-btn">
            <i class="fas fa-exchange-alt"></i> 交换
          </button>
        </div>
      </div>

      <div v-if="differences.length > 0" class="results-section">
        <div class="results-header">
          <h4><i class="fas fa-list-ul"></i> 发现 {{ differences.length }} 个差异</h4>
          <button @click="exportDiff" class="export-btn">
            <i class="fas fa-download"></i> 导出报告
          </button>
        </div>

        <div class="diff-list">
          <div
            v-for="(diff, index) in differences"
            :key="index"
            class="diff-item"
            :class="`diff-${diff.type}`"
          >
            <div class="diff-header">
              <div class="diff-type">
                <i :class="getDiffIcon(diff.type)"></i>
                {{ getDiffTypeName(diff.type) }}
              </div>
              <div class="diff-path">{{ diff.path || '根级别' }}</div>
            </div>
            <div class="diff-content">
              <div v-if="diff.type === 'modified'" class="diff-values">
                <div class="old-value">
                  <span class="value-label">原值:</span>
                  <code>{{ formatValue(diff.oldValue) }}</code>
                </div>
                <div class="new-value">
                  <span class="value-label">新值:</span>
                  <code>{{ formatValue(diff.newValue) }}</code>
                </div>
              </div>
              <div v-else-if="diff.type === 'added'" class="added-value">
                <span class="value-label">新增:</span>
                <code>{{ formatValue(diff.value) }}</code>
              </div>
              <div v-else-if="diff.type === 'deleted'" class="deleted-value">
                <span class="value-label">删除:</span>
                <code>{{ formatValue(diff.value) }}</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="originalJson && modifiedJson && !error" class="no-diff">
        <i class="fas fa-check-circle"></i>
        <p>两个 JSON 对象完全相同</p>
      </div>

      <div v-if="error" class="error-section">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'JsonDiff',
  setup() {
    const originalJson = ref('')
    const modifiedJson = ref('')
    const differences = ref([])
    const error = ref('')

    function compareJson() {
      error.value = ''
      differences.value = []

      if (!originalJson.value.trim() || !modifiedJson.value.trim()) {
        return
      }

      try {
        const obj1 = JSON.parse(originalJson.value)
        const obj2 = JSON.parse(modifiedJson.value)
        differences.value = findDifferences(obj1, obj2)
      } catch (e) {
        error.value = 'JSON 格式错误: ' + e.message
      }
    }

    function findDifferences(obj1, obj2, path = '') {
      const diffs = []

      // 检查第一个对象的所有属性
      for (const key in obj1) {
        const currentPath = path ? `${path}.${key}` : key
        
        if (!(key in obj2)) {
          // 属性在 obj2 中不存在
          diffs.push({
            type: 'deleted',
            path: currentPath,
            value: obj1[key]
          })
        } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && 
                   obj1[key] !== null && obj2[key] !== null && 
                   !Array.isArray(obj1[key]) && !Array.isArray(obj2[key])) {
          // 两个都是对象，递归比较
          diffs.push(...findDifferences(obj1[key], obj2[key], currentPath))
        } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
          // 值不同
          diffs.push({
            type: 'modified',
            path: currentPath,
            oldValue: obj1[key],
            newValue: obj2[key]
          })
        }
      }

      // 检查第二个对象中新增的属性
      for (const key in obj2) {
        if (!(key in obj1)) {
          const currentPath = path ? `${path}.${key}` : key
          diffs.push({
            type: 'added',
            path: currentPath,
            value: obj2[key]
          })
        }
      }

      return diffs
    }

    function formatJson(type) {
      try {
        if (type === 'original' && originalJson.value.trim()) {
          const parsed = JSON.parse(originalJson.value)
          originalJson.value = JSON.stringify(parsed, null, 2)
        } else if (type === 'modified' && modifiedJson.value.trim()) {
          const parsed = JSON.parse(modifiedJson.value)
          modifiedJson.value = JSON.stringify(parsed, null, 2)
        }
        compareJson()
      } catch (e) {
        error.value = 'JSON 格式错误: ' + e.message
      }
    }

    function clearJson(type) {
      if (type === 'original') {
        originalJson.value = ''
      } else {
        modifiedJson.value = ''
      }
      differences.value = []
      error.value = ''
    }

    function swapJson() {
      const temp = originalJson.value
      originalJson.value = modifiedJson.value
      modifiedJson.value = temp
      compareJson()
    }

    function loadExample() {
      originalJson.value = JSON.stringify({
        name: "John Doe",
        age: 30,
        email: "john@example.com",
        address: {
          street: "123 Main St",
          city: "New York"
        },
        hobbies: ["reading", "coding"]
      }, null, 2)

      modifiedJson.value = JSON.stringify({
        name: "John Doe",
        age: 31,
        email: "john.doe@example.com",
        address: {
          street: "456 Oak Ave",
          city: "New York",
          zipCode: "10001"
        },
        hobbies: ["reading", "coding", "hiking"],
        active: true
      }, null, 2)

      compareJson()
    }

    function getDiffIcon(type) {
      const icons = {
        added: 'fas fa-plus-circle',
        deleted: 'fas fa-minus-circle',
        modified: 'fas fa-edit'
      }
      return icons[type] || 'fas fa-question-circle'
    }

    function getDiffTypeName(type) {
      const names = {
        added: '新增',
        deleted: '删除',
        modified: '修改'
      }
      return names[type] || type
    }

    function formatValue(value) {
      if (typeof value === 'string') {
        return `"${value}"`
      }
      return JSON.stringify(value)
    }

    function exportDiff() {
      const report = differences.value.map(diff => {
        let line = `${getDiffTypeName(diff.type)}: ${diff.path || '根级别'}`
        if (diff.type === 'modified') {
          line += ` | 原值: ${formatValue(diff.oldValue)} -> 新值: ${formatValue(diff.newValue)}`
        } else if (diff.type === 'added') {
          line += ` | 新增: ${formatValue(diff.value)}`
        } else if (diff.type === 'deleted') {
          line += ` | 删除: ${formatValue(diff.value)}`
        }
        return line
      }).join('\n')

      const blob = new Blob([report], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'json-diff-report.txt'
      a.click()
      URL.revokeObjectURL(url)
    }

    return {
      originalJson,
      modifiedJson,
      differences,
      error,
      compareJson,
      formatJson,
      clearJson,
      swapJson,
      loadExample,
      getDiffIcon,
      getDiffTypeName,
      formatValue,
      exportDiff
    }
  }
}
</script>

<style scoped>
.json-diff-tool {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.tool-header {
  text-align: center;
  margin-bottom: 30px;
}

.input-section {
  background: var(--bg-secondary);
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 25px;
}

.json-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.input-header label {
  font-weight: 600;
  color: var(--text-primary);
}

.input-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.action-btn.primary {
  background: var(--accent-color);
  color: white;
  padding: 10px 20px;
  font-size: 14px;
}

.action-btn:not(.primary) {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.json-textarea {
  width: 100%;
  height: 300px;
  padding: 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Consolas', monospace;
  font-size: 14px;
  resize: vertical;
}

.main-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.results-section {
  background: var(--bg-secondary);
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 25px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.export-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.diff-list {
  display: grid;
  gap: 15px;
}

.diff-item {
  background: var(--bg-primary);
  border-radius: 10px;
  padding: 15px;
  border-left: 4px solid;
}

.diff-item.diff-added { border-left-color: #00b894; }
.diff-item.diff-deleted { border-left-color: #e17055; }
.diff-item.diff-modified { border-left-color: #fdcb6e; }

.diff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.diff-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.diff-path {
  font-family: 'Consolas', monospace;
  color: var(--text-secondary);
  font-size: 14px;
}

.diff-content {
  font-family: 'Consolas', monospace;
  font-size: 13px;
}

.value-label {
  color: var(--text-secondary);
  margin-right: 8px;
}

.diff-values {
  display: grid;
  gap: 8px;
}

.old-value code {
  color: #e17055;
}

.new-value code {
  color: #00b894;
}

.added-value code {
  color: #00b894;
}

.deleted-value code {
  color: #e17055;
}

.no-diff {
  text-align: center;
  padding: 40px;
  color: #00b894;
}

.no-diff i {
  font-size: 48px;
  margin-bottom: 15px;
}

.error-section {
  background: #fff5f5;
  color: #e53e3e;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 768px) {
  .json-inputs {
    grid-template-columns: 1fr;
  }
  
  .input-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .results-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .diff-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style> 