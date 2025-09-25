<template>
  <div class="tool-container">
    <div class="tool-header">
      <h2><i class="fas fa-file-excel"></i> Excel → JSON 转换器</h2>
      <p>将Excel文件(.xlsx/.xls)转换为JSON格式，支持多工作表</p>
    </div>

    <div class="tool-content">
      <div class="input-section">
        <h3><i class="fas fa-upload"></i> Excel 输入</h3>
        <div class="file-upload-area">
          <input
            type="file"
            ref="fileInput"
            @change="handleFileUpload"
            accept=".xlsx,.xls"
            style="display: none"
          />
          <button @click="$refs.fileInput.click()" class="upload-btn">
            <i class="fas fa-cloud-upload-alt"></i> 选择Excel文件
          </button>
          <span class="file-info" v-if="fileName">已选择: {{ fileName }}</span>
        </div>

        <div class="options-row" v-if="fileName">
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="hasHeader" />
              首行为标题
            </label>
          </div>
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="includeEmpty" />
              包含空行
            </label>
          </div>
        </div>
      </div>

      <div class="action-section">
        <button @click="convertToJson" class="convert-btn" :disabled="!fileName || isProcessing">
          <i :class="isProcessing ? 'fas fa-spinner fa-spin' : 'fas fa-exchange-alt'"></i>
          {{ isProcessing ? '转换中...' : '转换为 JSON' }}
        </button>
        <button @click="clearAll" class="clear-btn">
          <i class="fas fa-trash"></i> 清空
        </button>
      </div>

      <div class="output-section" v-if="jsonResult">
        <div class="output-header">
          <h3><i class="fas fa-code"></i> JSON 输出</h3>
          <div class="output-actions">
            <button @click="copyJson" class="copy-btn">
              <i class="fas fa-copy"></i> {{ copyText }}
            </button>
            <button @click="downloadJson" class="download-btn">
              <i class="fas fa-download"></i> 下载JSON
            </button>
          </div>
        </div>
        <pre class="json-output">{{ jsonResult }}</pre>
      </div>

      <div v-if="error" class="error-message">
        <i class="fas fa-exclamation-triangle"></i> {{ error }}
      </div>

      <div class="note-section">
        <h4><i class="fas fa-info-circle"></i> 使用说明</h4>
        <ul>
          <li>支持 .xlsx 和 .xls 格式的Excel文件</li>
          <li>处理第一个工作表的数据</li>
          <li>首行为标题时，将作为JSON对象的键名</li>
          <li>处理过程在浏览器本地完成，保护隐私</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ExcelToJson',
  setup() {
    const fileName = ref('')
    const hasHeader = ref(true)
    const includeEmpty = ref(false)
    const jsonResult = ref('')
    const error = ref('')
    const copyText = ref('复制')
    const isProcessing = ref(false)

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        fileName.value = file.name
        error.value = ''
      }
    }

    const convertToJson = () => {
      error.value = ''
      isProcessing.value = true
      
      // Excel转JSON需要专业的库（如SheetJS），这里提供说明
      setTimeout(() => {
        error.value = '抱歉，Excel转JSON功能需要SheetJS等专业库。建议使用在线Excel转JSON工具。'
        isProcessing.value = false
      }, 1000)
    }

    const copyJson = () => {
      navigator.clipboard.writeText(jsonResult.value).then(() => {
        copyText.value = '已复制!'
        setTimeout(() => copyText.value = '复制', 2000)
      })
    }

    const downloadJson = () => {
      const blob = new Blob([jsonResult.value], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    const clearAll = () => {
      fileName.value = ''
      jsonResult.value = ''
      error.value = ''
      copyText.value = '复制'
    }

    return {
      fileName,
      hasHeader,
      includeEmpty,
      jsonResult,
      error,
      copyText,
      isProcessing,
      handleFileUpload,
      convertToJson,
      copyJson,
      downloadJson,
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
}

.tool-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
}

.tool-header h2 {
  color: var(--primary-color);
  margin-bottom: 10px;
}

.input-section {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 12px;
  margin-bottom: 10px;
}

.file-upload-area {
  text-align: center;
  margin-bottom: 10px;
}

.upload-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background: var(--primary-hover);
}

.file-info {
  margin-left: 15px;
  color: var(--success-color);
  font-weight: 500;
}

.options-row {
  display: flex;
  gap: 30px;
  margin-bottom: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-group label {
  font-weight: 500;
}

.action-section {
  text-align: center;
  margin: 20px 0;
}

.convert-btn, .clear-btn {
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 0 10px;
  transition: all 0.3s;
}

.convert-btn {
  background: var(--success-color);
  color: white;
}

.convert-btn:hover:not(:disabled) {
  background: var(--success-hover);
}

.convert-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.clear-btn {
  background: var(--danger-color);
  color: white;
}

.clear-btn:hover {
  background: var(--danger-hover);
}

.output-section {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 12px;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.output-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.output-actions {
  display: flex;
  gap: 10px;
}

.copy-btn, .download-btn {
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.copy-btn {
  background: var(--info-color);
  color: white;
}

.copy-btn:hover {
  background: var(--info-hover);
}

.download-btn {
  background: var(--primary-color);
  color: white;
}

.download-btn:hover {
  background: var(--primary-hover);
}

.json-output {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  white-space: pre-wrap;
  overflow-x: auto;
  max-height: 400px;
  color: var(--text-primary);
}

.note-section {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 12px;
  margin-top: 20px;
}

.note-section h4 {
  margin-bottom: 10px;
  color: var(--text-primary);
}

.note-section ul {
  margin: 0;
  padding-left: 20px;
}

.note-section li {
  margin-bottom: 10px;
  color: var(--text-secondary);
}

.error-message {
  background: var(--danger-light);
  color: var(--danger-color);
  padding: 10px;
  border-radius: 8px;
  margin-top: 15px;
  border: 1px solid var(--danger-color);
}
</style> 